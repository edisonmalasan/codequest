'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';

const KEY = 'codequest:beta-feedback-draft:v1';
const MAX_LENGTH = 2_000;

export function FeedbackDraft(): React.JSX.Element {
  const [text, setText] = useState('');
  const [state, setState] = useState<'loading' | 'editing' | 'saved' | 'error'>(
    'loading',
  );

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY);
      if (stored !== null) setText(stored.slice(0, MAX_LENGTH));
      setState('editing');
    } catch {
      setState('error');
    }
  }, []);

  function save(): void {
    try {
      if (window.localStorage.getItem(KEY) !== text) {
        window.localStorage.setItem(KEY, text);
      }
      setState('saved');
    } catch {
      setState('error');
    }
  }

  function clear(): void {
    try {
      window.localStorage.removeItem(KEY);
      setText('');
      setState('editing');
    } catch {
      setState('error');
    }
  }

  return (
    <section className="space-y-4" aria-label="Local feedback draft">
      <label htmlFor="feedback-draft" className="block font-bold">
        Your feedback
      </label>
      <textarea
        id="feedback-draft"
        className="min-h-40 w-full rounded border border-line-strong bg-surface p-3 text-ink"
        value={text}
        maxLength={MAX_LENGTH}
        onChange={(event) => {
          setText(event.target.value);
          setState('editing');
        }}
        aria-describedby="feedback-limit feedback-disclosure"
      />
      <p id="feedback-limit" className="text-sm text-muted">
        {text.length} / {MAX_LENGTH} characters
      </p>
      <p id="feedback-disclosure" className="text-sm text-muted">
        This is a draft on this device only. CodeQuest has not received it. You
        can copy it now; sending feedback will open after beta collection
        policies are approved.
      </p>
      {state === 'saved' && (
        <p role="status" className="text-sm text-reward">
          Draft saved on this device. It was not sent.
        </p>
      )}
      {state === 'error' && (
        <p role="alert" className="text-sm text-danger">
          Device storage is unavailable. Your text is still visible here; copy
          it before leaving.
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={save}>
          Save on this device
        </Button>
        <Button type="button" variant="secondary" onClick={clear}>
          Clear draft
        </Button>
      </div>
    </section>
  );
}
