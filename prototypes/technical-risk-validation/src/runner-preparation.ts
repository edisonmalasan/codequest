import { runnerOrigin } from './runtime';
import { isRecord } from './protocol';

// This disposable resource-download document never constructs learner Workers.
// Execution bootstrap loading remains entirely inside BrowserRuntime.run timing.
export function prepareRunnerResources(): Promise<void> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    const id = crypto.randomUUID();
    frame.hidden = true;
    frame.title = 'Public runner resource download';
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
    const finish = (success: boolean) => {
      clearTimeout(timer);
      window.removeEventListener('message', receive);
      frame.remove();
      if (success) resolve(); else reject(new Error('Public runner resources unavailable'));
    };
    const receive = (event: MessageEvent<unknown>) => {
      if (event.source !== frame.contentWindow || event.origin !== runnerOrigin || !isRecord(event.data) || event.data.id !== id) return;
      if (event.data.type === 'runner-resources-prepared') finish(true);
      else if (event.data.type === 'runner-resources-unavailable') finish(false);
    };
    const timer = setTimeout(() => finish(false), 5000);
    window.addEventListener('message', receive);
    frame.src = runnerOrigin + '/runner-prepare.html#' + id;
    document.body.append(frame);
  });
}
