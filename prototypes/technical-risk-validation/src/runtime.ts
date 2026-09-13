import workerSource from '../public/worker.js?raw';
import { byteLength, decodeResult, limits, type Candidate, type RunIdentity, type RunResult } from './protocol';

export const runnerOrigin = 'http://127.0.0.2:4311';
const opaquePolicy = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";
export type RunRequest = RunIdentity & { source: string; candidate: Candidate };

export class BrowserRuntime {
  private cancel: (() => void) | undefined;
  stop(): void { this.cancel?.(); }

  run(request: RunRequest): Promise<RunResult> {
    this.stop();
    const start = performance.now();
    return new Promise((resolve) => {
      let frame: HTMLIFrameElement | undefined;
      let worker: Worker | undefined;
      let finished = false;
      let messages = 0;
      const finish = (result: { status: RunResult['status']; output: string[]; value: string }) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        window.removeEventListener('message', receive);
        worker?.terminate();
        frame?.remove();
        this.cancel = undefined;
        resolve({ ...request, ...result, elapsed: performance.now() - start });
      };
      const onResult = (raw: unknown) => {
        messages++;
        if (messages > limits.entries) { finish({ status: 'protocol-error', output: [], value: 'Message flood rejected' }); return; }
        const result = decodeResult(raw, request);
        if (result) finish(result);
        else finish({ status: 'protocol-error', output: [], value: 'Malformed or stale result rejected' });
      };
      const receive = (event: MessageEvent<unknown>) => {
        if (!frame || event.source !== frame.contentWindow) return;
        if (request.candidate === 'dedicated' && event.origin !== runnerOrigin) return;
        if (event.data === 'ready') {
          frame.contentWindow?.postMessage({ type: 'start', input: request }, request.candidate === 'dedicated' ? runnerOrigin : '*');
        } else onResult(event.data);
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
          frame = document.createElement('iframe');
          frame.hidden = true;
          frame.title = 'Learner execution compartment';
          frame.setAttribute('sandbox', request.candidate === 'opaque' ? 'allow-scripts' : 'allow-scripts allow-same-origin');
          window.addEventListener('message', receive);
          if (request.candidate === 'dedicated') frame.src = runnerOrigin + '/bootstrap.html';
          else {
            // Inline data carries only public worker bytes, never source/session tokens.
            const script = `let w;const p=parent;addEventListener('message',e=>{if(e.source!==p||!e.data||e.data.type!=='start'||w)return;w=new Worker(URL.createObjectURL(new Blob([${JSON.stringify(workerSource)}],{type:'text/javascript'})));w.onmessage=e=>p.postMessage(e.data,'*');w.onerror=()=>p.postMessage('bootstrap-error','*');w.postMessage(e.data.input)});p.postMessage('ready','*');`;
            frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="${opaquePolicy}"><script>${script.replaceAll('</script', '<\\/script')}</script>`;
          }
          document.body.append(frame);
        }
      } catch {
        finish({ status: 'runtime-error', output: [], value: 'Compartment creation failed' });
      }
    });
  }
}

export class PreviewRuntime {
  private cancel: (() => void) | undefined;
  stop(): void { this.cancel?.(); }
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
