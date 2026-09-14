import bootstrapSource from '../public/opaque-bootstrap.js?raw';
import workerSource from '../public/worker.js?raw';
import { isRecord, type RunIdentity } from './protocol';
import { runnerOrigin, type RunRequest } from './runtime';

const policy = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";
const sameIdentity = (raw: unknown, identity: RunIdentity): boolean => isRecord(raw) && raw.run === identity.run && raw.task === identity.task && raw.contentVersion === identity.contentVersion && raw.assessmentVersion === identity.assessmentVersion;

export class OpaqueCompartment {
  readonly candidate: 'opaque' | 'dedicated';
  readonly frame = document.createElement('iframe');
  private readonly channel = new MessageChannel();
  private readonly bootstrapId = crypto.randomUUID();
  private resolveReady: (ready: boolean) => void = () => {};
  private readonly ready = new Promise<boolean>(resolve => { this.resolveReady = resolve; });
  private connected = false;
  private initialized = false;
  private removed = false;
  private identity: RunIdentity | undefined;
  lastCleanup = { acknowledged: false, fallback: false, retainedTrustedBootstrap: false };
  private pending: { ticket: string; identity: RunIdentity; finish: (acknowledged: boolean) => void } | undefined;
  private readonly handshake = (event: MessageEvent<unknown>) => {
    if (this.connected || event.source !== this.frame.contentWindow || (this.candidate === 'dedicated' && event.origin !== runnerOrigin) || !isRecord(event.data) || event.data.type !== this.candidate + '-bootstrap-ready' || event.data.bootstrapId !== this.bootstrapId) return;
    this.connected = true;
    window.removeEventListener('message', this.handshake);
    this.frame.contentWindow?.postMessage('connect-private-control', this.candidate === 'dedicated' ? runnerOrigin : '*', [this.channel.port2]);
  };

  constructor(candidate: 'opaque' | 'dedicated' = 'opaque') {
    this.candidate = candidate;
    this.frame.hidden = true;
    this.frame.title = 'Trusted opaque bootstrap';
    this.frame.dataset.trustedBootstrap = 'yes';
    this.frame.dataset.activeWorkers = '0';
    this.frame.setAttribute('sandbox', candidate === 'dedicated' ? 'allow-scripts allow-same-origin' : 'allow-scripts');
    this.channel.port1.onmessage = (event: MessageEvent<unknown>) => {
      if (!this.initialized && event.data === 'private-control-ready') {
        this.initialized = true;
        this.resolveReady(true);
        return;
      }
      const raw = event.data;
      const pending = this.pending;
      if (pending && isRecord(raw) && raw.type === 'cleaned' && raw.ticket === pending.ticket && raw.activeWorkers === 0 && sameIdentity(raw.identity, pending.identity)) pending.finish(true);
      else this.remove();
    };
    const script = `const bootstrapId=${JSON.stringify(this.bootstrapId)};const publicWorkerSource=${JSON.stringify(workerSource)};\n${bootstrapSource}`;
    if (candidate === 'dedicated') this.frame.src = runnerOrigin + '/bootstrap.html#' + this.bootstrapId;
    else this.frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="${policy}"><script>${script.replaceAll('</script', '<\\/script')}</script>`;
    window.addEventListener('message', this.handshake);
    document.body.append(this.frame);
  }

  get available(): boolean { return !this.removed; }

  async start(request: RunRequest): Promise<boolean> {
    if (!await this.ready || this.removed) return false;
    this.identity = { run: request.run, task: request.task, contentVersion: request.contentVersion, assessmentVersion: request.assessmentVersion };
    delete this.frame.dataset.previewStarted;
    this.frame.title = 'Learner execution compartment';
    // One requested Worker, cleared only after private acknowledgment or removal.
    this.frame.dataset.activeWorkers = '1';
    this.channel.port1.postMessage({ type: 'start', input: request });
    return true;
  }

  stop(dispose = false): Promise<void> {
    if (!this.initialized || !this.identity || this.removed) {
      this.lastCleanup = { acknowledged: false, fallback: true, retainedTrustedBootstrap: false };
      this.remove();
      return Promise.resolve();
    }
    const identity = this.identity;
    const ticket = crypto.randomUUID();
    return new Promise(resolve => {
      const finish = (acknowledged: boolean) => {
        if (this.pending?.ticket !== ticket) return;
        this.pending = undefined;
        clearTimeout(timer);
        this.lastCleanup = { acknowledged, fallback: !acknowledged, retainedTrustedBootstrap: acknowledged && !dispose };
        if (acknowledged && !dispose) {
          this.frame.title = 'Trusted ' + this.candidate + ' bootstrap';
          this.frame.dataset.activeWorkers = '0';
          delete this.frame.dataset.previewStarted;
        } else this.remove();
        resolve();
      };
      const timer = setTimeout(() => finish(false), 100);
      this.pending = { ticket, identity, finish };
      this.channel.port1.postMessage({ type: 'stop', ticket, identity, dispose });
    });
  }

  private remove(): void {
    if (this.removed) return;
    this.removed = true;
    this.resolveReady(false);
    window.removeEventListener('message', this.handshake);
    this.channel.port1.close();
    this.channel.port2.close();
    this.frame.remove();
    this.pending?.finish(false);
  }
}
