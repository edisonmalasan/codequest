import { OpaqueCompartment } from './opaque-compartment';
import { byteLength, decodeResult, isRecord, limits, type Candidate, type RunIdentity, type RunResult } from './protocol';

export const runnerOrigin = 'http://127.0.0.2:4311';
export type RunRequest = RunIdentity & { source: string; candidate: Candidate; previewMarker?: boolean };

export class BrowserRuntime {
  private cancel: (() => void) | undefined;
  private compartment: OpaqueCompartment | undefined;
  private cleanup: Promise<void> = Promise.resolve();
  stop(): Promise<void> { this.cancel?.(); return this.cleanup; }
  async dispose(): Promise<void> {
    await this.stop();
    await this.compartment?.stop(true);
    this.compartment = undefined;
  }

  run(request: RunRequest): Promise<RunResult> {
    void this.stop();
    const start = performance.now();
    return new Promise((resolve) => {
      let frame: HTMLIFrameElement | undefined;
      let worker: Worker | undefined;
      let compartment: OpaqueCompartment | undefined;
      let finished = false;
      let messages = 0;
      let executionStarted = false;
      const finish = (result: { status: RunResult['status']; output: string[]; value: string }) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        window.removeEventListener('message', receive);
        worker?.terminate();
        if (!compartment) frame?.remove();
        this.cancel = undefined;
        this.cleanup = this.cleanup.then(() => compartment?.stop());
        void this.cleanup.then(() => resolve({ ...request, ...result, elapsed: performance.now() - start, cleanup: compartment ? { ...compartment.lastCleanup } : undefined }));
      };
      const onResult = (raw: unknown) => {
        messages++;
        if (messages > limits.entries) { finish({ status: 'protocol-error', output: [], value: 'Message flood rejected' }); return; }
        if (request.previewMarker && raw === request.run + ':preview-started') {
          if (executionStarted) { finish({ status: 'protocol-error', output: [], value: 'Repeated start marker rejected' }); return; }
          executionStarted = true;
          if (frame) frame.dataset.previewStarted = 'yes';
          return;
        }
        const result = decodeResult(raw, request);
        if (result) finish(result);
        else finish({ status: 'protocol-error', output: [], value: 'Malformed or stale result rejected' });
      };
      const receive = (event: MessageEvent<unknown>) => {
        if (!frame || event.source !== frame.contentWindow) return;
        if (request.candidate === 'opaque' || request.candidate === 'dedicated') {
          if (request.candidate === 'dedicated' && event.origin !== runnerOrigin) return;
          const packet = event.data;
          if (isRecord(packet) && packet.type === request.candidate + '-bootstrap-ready') return;
          if (!isRecord(packet) || packet.type !== 'learner-output' || !isRecord(packet.identity)) { onResult(null); return; }
          const identity = packet.identity;
          if (identity.run !== request.run || identity.task !== request.task || identity.contentVersion !== request.contentVersion || identity.assessmentVersion !== request.assessmentVersion) return;
          if (typeof packet.raw !== 'string' || packet.raw.length > limits.message || byteLength(packet.raw) > limits.message || byteLength(JSON.stringify({ type: 'learner-output', identity: { run: request.run, task: request.task, contentVersion: request.contentVersion, assessmentVersion: request.assessmentVersion }, raw: packet.raw })) > limits.message) { onResult(null); return; }
          onResult(packet.raw);
          return;
        }
      };
      const timer = setTimeout(() => finish({ status: 'timeout', output: [], value: 'Execution deadline exceeded' }), limits.deadline);
      this.cancel = () => finish({ status: 'stopped', output: [], value: 'Stopped' });
      if (byteLength(request.source) > limits.source) { finish({ status: 'output-limit', output: [], value: 'Source exceeds 64 KiB; draft retained' }); return; }
      try {
        if (request.candidate === 'control') {
          worker = new Worker('/worker.js');
          worker.onmessage = (event: MessageEvent<unknown>) => onResult(event.data);
          worker.onerror = () => finish({ status: 'runtime-error', output: [], value: 'Worker bootstrap failed' });
          worker.postMessage(request);
        } else {
          void this.cleanup.then(async () => {
            if (finished) return;
            if (this.compartment?.candidate !== request.candidate) { await this.compartment?.stop(true); this.compartment = undefined; }
            if (!this.compartment?.available) this.compartment = new OpaqueCompartment(request.candidate === 'dedicated' ? 'dedicated' : 'opaque');
            compartment = this.compartment;
            frame = compartment.frame;
            window.addEventListener('message', receive);
            if (!await compartment.start(request) && !finished) finish({ status: 'runtime-error', output: [], value: 'Trusted bootstrap unavailable' });
          }).catch(() => finish({ status: 'runtime-error', output: [], value: 'Trusted bootstrap failed' }));
        }
      } catch {
        finish({ status: 'runtime-error', output: [], value: 'Compartment creation failed' });
      }
    });
  }
}

export class PreviewRuntime {
  private cancel: (() => void) | undefined;
  private computation = new BrowserRuntime();
  stop(): void { this.cancel?.(); }
  async dispose(): Promise<void> { this.stop(); await this.computation.dispose(); }
  runSource(source: string, target: HTMLElement, task = 'RECORDS', onOutput?: (text: string) => void): Promise<{ status: string; elapsed: number; execution?: RunResult }> {
    this.stop();
    const start = performance.now();
    return new Promise(resolve => {
      let frame: HTMLIFrameElement | undefined;
      let execution: RunResult | undefined;
      let finished = false;
      const finish = (status: string) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        const cleanup = this.computation.stop();
        frame?.remove();
        this.cancel = undefined;
        void cleanup.then(() => resolve({ status, elapsed: performance.now() - start, execution }));
      };
      const timer = setTimeout(() => finish(frame ? 'preview-reset' : 'preview-timeout'), limits.deadline);
      this.cancel = () => finish('preview-stopped');
      void this.computation.run({ source, candidate: 'dedicated', task, run: crypto.randomUUID(), contentVersion: '1', assessmentVersion: '1', previewMarker: true }).then(result => {
        if (finished) return;
        execution = result;
        if (result.status !== 'success') { finish(result.status); return; }
        const text = task === 'RECORDS' ? result.value : result.output.join('\n');
        onOutput?.(text);
        const safe = text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
        frame = document.createElement('iframe');
        frame.title = 'Supplied Worker result preview';
        // Empty sandbox denies scripts, origin authority, forms and popups.
        // Fixed escaped text supplies no learner navigation elements.
        frame.setAttribute('sandbox', '');
        const policy = "default-src 'none'; script-src 'none'; style-src 'none'; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";
        frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="${policy}"><h1>Inventory result</h1><pre>${safe}</pre>`;
        target.append(frame);
      }).catch(() => finish('runtime-error'));
    });
  }
  run(html: string, target: HTMLElement, candidate: 'opaque' | 'dedicated' = 'opaque'): Promise<{ status: string; elapsed: number }> {
    this.stop();
    const start = performance.now();
    return new Promise((resolve) => {
      const frame = document.createElement('iframe');
      frame.title = 'Sandboxed learner preview';
      frame.setAttribute('sandbox', candidate === 'dedicated' ? 'allow-scripts allow-same-origin' : 'allow-scripts');
      const policy = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";
      const receive = (event: MessageEvent<unknown>) => {
        if (event.source === frame.contentWindow && event.origin === runnerOrigin && event.data === 'preview-ready') frame.contentWindow?.postMessage(html, runnerOrigin);
      };
      if (candidate === 'dedicated') { frame.src = runnerOrigin + '/preview.html'; window.addEventListener('message', receive); }
      else frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="${policy}">${html}`;
      const finish = (status: string) => { clearTimeout(timer); window.removeEventListener('message', receive); frame.remove(); this.cancel = undefined; resolve({ status, elapsed: performance.now() - start }); };
      const timer = setTimeout(() => finish('preview-reset'), limits.deadline);
      this.cancel = () => finish('preview-stopped');
      if (byteLength(html) > limits.source) { finish('output-limit'); return; }
      target.append(frame);
    });
  }
}
