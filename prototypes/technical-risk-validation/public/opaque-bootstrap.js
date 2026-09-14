// Trusted opaque document only. The private port never enters a learner Worker.
let control;
let current;
let identity;
let publicWorkerUrl;
let received = 0;
const owner = parent;
const utf8 = new TextEncoder();
const sameIdentity = (left, right) => left && right && ['run', 'task', 'contentVersion', 'assessmentVersion'].every(key => left[key] === right[key]);
const terminateCurrent = () => {
  if (current) {
    current.onmessage = null;
    current.onerror = null;
    current.terminate();
    current = undefined;
  }
};
addEventListener('message', event => {
  if (control || event.source !== owner || event.data !== 'connect-private-control' || event.ports.length !== 1) return;
  control = event.ports[0];
  control.onmessage = event => {
    const command = event.data;
    if (!command || typeof command !== 'object') return;
    if (command.type === 'start' && !current) {
      const input = command.input;
      if (!input || typeof input.source !== 'string' || utf8.encode(input.source).length > 65536) return;
      identity = { run: input.run, task: input.task, contentVersion: input.contentVersion, assessmentVersion: input.assessmentVersion };
      received = 0;
      publicWorkerUrl ??= URL.createObjectURL(new Blob([publicWorkerSource], { type: 'text/javascript' }));
      try {
        const worker = new Worker(publicWorkerUrl);
        current = worker;
        worker.onmessage = event => {
          if (current !== worker) return;
          received++;
          const raw = event.data;
          if (received > 200 || typeof raw !== 'string' || raw.length > 16384 || utf8.encode(raw).length > 16384) {
            terminateCurrent();
            owner.postMessage('bootstrap-protocol-error', '*');
            return;
          }
          owner.postMessage(raw, '*');
        };
        worker.onerror = () => {
          if (current !== worker) return;
          terminateCurrent();
          owner.postMessage('bootstrap-error', '*');
        };
        worker.postMessage(input);
      } catch {
        terminateCurrent();
        owner.postMessage('bootstrap-error', '*');
      }
    } else if (command.type === 'stop' && typeof command.ticket === 'string' && command.ticket.length <= 64 && sameIdentity(command.identity, identity)) {
      terminateCurrent();
      if (command.dispose === true && publicWorkerUrl) {
        URL.revokeObjectURL(publicWorkerUrl);
        publicWorkerUrl = undefined;
      }
      control.postMessage({ type: 'cleaned', ticket: command.ticket, identity, activeWorkers: 0 });
    }
  };
  control.postMessage('private-control-ready');
});
owner.postMessage('opaque-bootstrap-ready', '*');
