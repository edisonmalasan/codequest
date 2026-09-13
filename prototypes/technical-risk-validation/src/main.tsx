import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { quest, recordFixture } from './fixtures';
import { BrowserRuntime, PreviewRuntime } from './runtime';
import { draftKey, saveDraft, store } from './storage';
import { isRecord, type Candidate, type RunResult } from './protocol';
import { type Snapshot, type Receipt } from './mock';
import './style.css';

const runtime = new BrowserRuntime();
const previewRuntime = new PreviewRuntime();
const probeRuntime = new BrowserRuntime();
declare global {
  interface Window {
    __risk: {
      run: (source: string, candidate: Candidate, task?: string) => Promise<RunResult>;
      preview: (html: string) => Promise<{ status: string; elapsed: number }>;
      stop: () => void;
      pending: () => Promise<Snapshot[]>;
      saveFailure: (kind: string | null) => void;
    };
  }
}
window.__risk = {
  run: (source, candidate, task = 'Q01') => probeRuntime.run({ source, candidate, task, run: crypto.randomUUID(), contentVersion: '1', assessmentVersion: '1' }),
  preview: (html) => previewRuntime.run(html, document.getElementById('preview') ?? document.body),
  stop: () => { runtime.stop(); probeRuntime.stop(); previewRuntime.stop(); },
  pending: () => store.pending.toArray(),
  saveFailure: (kind) => { if (kind) sessionStorage.setItem('prototype-save-failure', kind); else sessionStorage.removeItem('prototype-save-failure'); },
};

function receiptFrom(raw: unknown): Receipt {
  if (!isRecord(raw) || (raw.status !== 'accepted' && raw.status !== 'duplicate' && raw.status !== 'retry-required' && raw.status !== 'rejected' && raw.status !== 'expired') || typeof raw.message !== 'string' || typeof raw.simulatedReward !== 'boolean') throw new Error('Invalid synthetic receipt');
  return { status: raw.status, message: raw.message, simulatedReward: raw.simulatedReward };
}

function App() {
  const [owner, setOwner] = useState(sessionStorage.getItem('prototype-owner') ?? 'guest');
  const [task, setTask] = useState('Q01');
  const [source, setSource] = useState<string>(quest.starter);
  const [candidate, setCandidate] = useState<Candidate>('opaque');
  const [loadedKey, setLoadedKey] = useState('');
  const [saveState, setSaveState] = useState('Loading draft');
  const [feedback, setFeedback] = useState('Ready');
  const [result, setResult] = useState<RunResult>();
  const [provisional, setProvisional] = useState(false);
  const [pending, setPending] = useState<Snapshot>();
  const [online, setOnline] = useState(navigator.onLine);
  const [hint, setHint] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker>();
  const [pwa, setPwa] = useState('Offline preparation pending');
  const [loseResponse, setLoseResponse] = useState(false);
  const mount = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView>(null);
  const requestId = useRef('');
  const key = draftKey(owner, task);
  const fixture = task === 'Q01' ? quest : recordFixture;

  useEffect(() => {
    localStorage.setItem('prototype-session-canary', 'SYNTHETIC_SESSION_ONLY');
    let active = true;
    const changeNetwork = () => setOnline(navigator.onLine);
    window.addEventListener('online', changeNetwork);
    window.addEventListener('offline', changeNetwork);
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js').then((registration) => {
        if (!active) return;
        if (registration.waiting) setWaiting(registration.waiting);
        registration.addEventListener('updatefound', () => {
          const installing = registration.installing;
          installing?.addEventListener('statechange', () => { if (installing.state === 'installed' && registration.waiting && active) setWaiting(registration.waiting); });
        });
        void navigator.serviceWorker.ready.then(() => { if (active) setPwa('Public lesson and runtime assets prepared offline'); });
      }).catch((error: unknown) => { if (active) setPwa('Offline preparation failed: ' + (error instanceof Error ? error.message : 'unknown error')); });
    }
    return () => { active = false; window.removeEventListener('online', changeNetwork); window.removeEventListener('offline', changeNetwork); };
  }, []);

  useEffect(() => {
    let active = true;
    runtime.stop(); requestId.current = ''; setResult(undefined); setPending(undefined); setProvisional(false); setLoadedKey('');
    void Promise.all([store.drafts.get(key), store.pending.where('owner').equals(owner).toArray()]).then(([draft, actions]) => {
      if (!active) return;
      setSource(draft?.source ?? fixture.starter);
      setProvisional(draft?.provisional ?? false);
      setPending(actions.find((action) => action.quest === task));
      setLoadedKey(key); setSaveState(draft ? 'Saved on this device' : 'Starter loaded; not yet saved'); setFeedback('Ready');
    }).catch((error: unknown) => { if (active) { setSource(fixture.starter); setLoadedKey(key); setSaveState('Storage unavailable; keep a copy: ' + (error instanceof Error ? error.message : 'unknown error')); } });
    return () => { active = false; runtime.stop(); previewRuntime.stop(); };
  }, [key, owner, task, fixture.starter]);

  useEffect(() => {
    if (!mount.current) return;
    const view = new EditorView({ parent: mount.current, state: EditorState.create({
      doc: '', extensions: [basicSetup, javascript(), EditorView.contentAttributes.of({ 'aria-label': 'JavaScript source' }), keymap.of([{ key: 'Escape', run: () => { document.getElementById('run')?.focus(); return true; } }]),
        EditorView.updateListener.of((update) => { if (update.docChanged) { setSource(update.state.doc.toString()); setSaveState('Unsaved edits'); requestId.current = ''; setResult(undefined); } }),
      ],
    }) });
    editor.current = view;
    return () => view.destroy();
  }, []);
  useEffect(() => {
    const view = editor.current;
    if (view && view.state.doc.toString() !== source) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: source } });
  }, [source]);

  useEffect(() => {
    if (loadedKey !== key) return;
    let active = true;
    const timer = setTimeout(() => {
      void saveDraft({ key, owner, task, source, contentVersion: '1', assessmentVersion: '1', provisional }).then(() => { if (active) setSaveState('Saved on this device'); }).catch((error: unknown) => { if (active) setSaveState('Save failed; keep a copy: ' + (error instanceof Error ? error.message : 'unknown error')); });
    }, 200);
    return () => { active = false; clearTimeout(timer); };
  }, [loadedKey, key, owner, task, source, provisional]);

  async function run(check: boolean) {
    const run = crypto.randomUUID(); requestId.current = run; setFeedback('Running');
    const outcome = await runtime.run({ run, source, candidate, task, contentVersion: '1', assessmentVersion: '1' });
    if (requestId.current !== run) return;
    setResult(outcome);
    const passed = outcome.status === 'success' && (task === 'Q01' ? outcome.output.join('\n') === quest.expected : outcome.value === '5');
    setFeedback(check ? (passed ? 'Local check passed — provisional only' : outcome.status === 'success' ? 'Check failed — compare with the objective' : outcome.status) : outcome.status);
    if (check && passed) setProvisional(true);
  }

  async function submit() {
    if (task !== 'Q01' || !result || result.output.join('\n') !== quest.expected || result.status !== 'success' || requestId.current !== result.run) { setFeedback('Check this draft successfully before submitting'); return; }
    const snapshot: Snapshot = { event: crypto.randomUUID(), owner, quest: task, source, contentVersion: '1', assessmentVersion: '1', passed: true };
    try { await store.pending.put(snapshot); setPending(snapshot); setFeedback('Snapshot pending — no accepted account progress'); }
    catch { setFeedback('Snapshot save failed; keep your source and retry'); }
  }
  async function reconcile(importGuest = false) {
    try {
      const action = importGuest ? (await store.pending.where('owner').equals('guest').toArray()).find((item) => item.quest === task) : pending;
      if (!action || owner === 'guest' || owner === 'expired') { setFeedback('Choose a synthetic account; expired identity pauses pending sync'); return; }
      if (!importGuest && action.owner !== owner) { setFeedback('Old owner work is isolated'); return; }
      const outgoing = importGuest ? { ...action, owner } : action;
      const response = await fetch('/__mock', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Mock-Owner': owner, 'X-Mock-Lose-Response': loseResponse ? '1' : '0' }, body: JSON.stringify(outgoing) });
      if (!response.ok) throw new Error('Synthetic request rejected');
      const receipt = receiptFrom(await response.json());
      setFeedback(`${receipt.status}: ${receipt.message}`);
      if (receipt.status === 'accepted' || receipt.status === 'duplicate') { await store.pending.delete(action.event); setPending(undefined); }
    } catch (error: unknown) { setFeedback('Pending snapshot retained: ' + (error instanceof Error ? error.message : 'network unavailable')); }
  }
  async function applyUpdate() {
    try {
      await saveDraft({ key, owner, task, source, contentVersion: '1', assessmentVersion: '1', provisional });
      waiting?.postMessage({ type: 'SKIP_WAITING' });
      setFeedback('Update requested; saved draft retained. Reload when ready.');
    } catch { setFeedback('Update paused because the draft could not be saved'); }
  }
  async function switchOwner(next: string) {
    runtime.stop(); previewRuntime.stop(); requestId.current = '';
    try {
      await saveDraft({ key, owner, task, source, contentVersion: '1', assessmentVersion: '1', provisional });
      sessionStorage.setItem('prototype-owner', next); setOwner(next);
    } catch { setFeedback('Owner switch paused: save failed; copy the current source first'); }
  }
  async function switchTask(next: string) {
    runtime.stop(); previewRuntime.stop(); requestId.current = '';
    try {
      await saveDraft({ key, owner, task, source, contentVersion: '1', assessmentVersion: '1', provisional });
      setTask(next);
    } catch { setFeedback('Task switch paused: save failed; copy the current source first'); }
  }

  return <main>
    <header><p>Phase 1 · disposable technical prototype</p><h1>CodeQuest validation workspace</h1><p>No real accounts, authoritative rewards, telemetry or independent grading.</p></header>
    <section className="controls" aria-label="Prototype configuration">
      <label>Owner <select value={owner} onChange={(event) => void switchOwner(event.target.value)}><option>guest</option><option>account-A</option><option>account-B</option><option>expired</option></select></label>
      <label>Task <select value={task} onChange={(event) => void switchTask(event.target.value)}><option value="Q01">Q01 output</option><option value="RECORDS">Records fixture</option></select></label>
      <label>Compartment <select value={candidate} onChange={(event) => { const value = event.target.value; if (value === 'opaque' || value === 'dedicated' || value === 'control') setCandidate(value); }}><option value="opaque">Opaque origin candidate</option><option value="dedicated">Dedicated origin candidate</option><option value="control">Permissive negative control (unsafe)</option></select></label>
    </section>
    <p role="status">{online ? 'Online' : 'Offline'} · {pwa}</p>{waiting && <button onClick={() => void applyUpdate()}>Save draft and apply available update</button>}
    <section className="workspace">
      <article><h2>{fixture.title}</h2><p>{fixture.objective}</p><button onClick={() => setHint(!hint)}>Show hint</button>{hint && <p>{quest.hint}</p>}<p>Escape moves focus out of the editor to Run. Drafts are local only; clearing browser data can lose them. Guest/offline work is provisional, with no backdated streak credit.</p></article>
      <section className="editor-panel" aria-label="Coding workspace"><div ref={mount} /><p role="status" data-testid="save-state">{saveState}</p>
        <div className="actions"><button id="run" onClick={() => void run(false)}>Run</button><button onClick={() => void run(true)}>Check</button><button onClick={() => runtime.stop()}>Stop</button><button onClick={() => { if (window.confirm('Replace the current draft with starter code? Account progress is not reset.')) { setSource(fixture.starter); setResult(undefined); } }}>Reset source</button><button onClick={() => void navigator.clipboard.writeText(source).then(() => setFeedback('Source copied')).catch(() => setFeedback('Copy unavailable; select source and copy manually'))}>Copy source</button></div>
      </section>
    </section>
    <section aria-label="Feedback"><h2>Output and results</h2><p role="status" data-testid="feedback">{feedback}</p><pre data-testid="output">{result?.output.join('\n') ?? ''}</pre><p>{result?.value}</p><p>{provisional ? 'Local provisional completion; not accepted account progress' : 'No local completion'}</p></section>
    <section aria-label="Synthetic reconciliation"><h2>Mock acceptance only</h2><button onClick={() => void submit()}>Save pending snapshot</button><button onClick={() => void reconcile()}>Replay pending snapshot</button><button onClick={() => void reconcile(true)}>Explicitly import guest snapshot</button><label><input type="checkbox" checked={loseResponse} onChange={(event) => setLoseResponse(event.target.checked)} />Lose synthetic response after acceptance</label><p>{pending ? `Pending for ${pending.owner}, ${pending.quest}, ${pending.event}` : 'No pending snapshot for this owner'}</p></section>
    <section><h2>Supplied preview</h2><p>Text equivalent: {task === 'RECORDS' ? result?.value ?? 'Run the records fixture for its total' : result?.output.join('\n') ?? 'No output'}</p><button onClick={() => { const value = result?.value ?? 'No result'; const safe = value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); void previewRuntime.run(`<h1>Inventory total</h1><p>${safe}</p>`, document.getElementById('preview') ?? document.body).then((outcome) => setFeedback(outcome.status)); }}>Open bounded preview</button><div id="preview" /></section>
  </main>;
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing prototype root');
createRoot(root).render(<App />);
