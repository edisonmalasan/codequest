export interface WorkspaceFile {
  id: string;
  name: string;
  language: 'javascript';
  starterSource: string;
}

export interface ConsoleLine {
  id: string;
  kind: 'output' | 'error' | 'info';
  text: string;
}

export interface WorkspaceTestResult {
  id: string;
  label: string;
  status: 'idle' | 'passed' | 'failed';
  message?: string;
}

export interface RuntimeDisplayState {
  kind: 'unavailable' | 'idle' | 'ready' | 'busy' | 'error';
  label: string;
}

export type SaveStatus =
  'loading' | 'ready' | 'unsaved' | 'saving' | 'saved' | 'failed';
