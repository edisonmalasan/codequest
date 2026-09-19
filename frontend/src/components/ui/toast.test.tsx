'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ToastProvider, useToast } from './toast';

function Trigger(): React.JSX.Element {
  const { notify } = useToast();
  return (
    <button
      type="button"
      onClick={() => notify({ title: 'Draft saved', variant: 'ascent' })}
    >
      Save
    </button>
  );
}

describe('ToastProvider', () => {
  it('announces notifications in a live region and dismisses them', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(screen.getByRole('status', { name: '' })).toBeDefined();
    expect(screen.getByText('Draft saved')).toBeDefined();
    await user.click(
      screen.getByRole('button', { name: 'Dismiss: Draft saved' }),
    );
    expect(screen.queryByText('Draft saved')).toBeNull();
  });
});
