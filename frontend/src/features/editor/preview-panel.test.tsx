import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PreviewResult } from '@/features/preview';
import { PreviewPanel } from './preview-panel';

const ready: PreviewResult = {
  generationId: 'preview-one',
  status: 'ready',
  message: 'Static preview ready',
  filteredActiveContent: false,
};

describe('static preview widths', () => {
  it('resizes the same host inside its own scroll region with named pressed controls', async () => {
    const user = userEvent.setup();
    const hostRef = createRef<HTMLDivElement>();
    const retry = vi.fn();
    const { rerender } = render(
      <PreviewPanel
        hostRef={hostRef}
        result={ready}
        running={false}
        onFailedWidthChange={retry}
      />,
    );
    expect(hostRef.current?.style.width).toBe('100%');
    expect(
      hostRef.current?.parentElement?.classList.contains('overflow-x-auto'),
    ).toBe(true);
    const narrow = screen.getByRole('button', { name: 'Narrow · 390px' });
    await user.click(narrow);
    expect(narrow.getAttribute('aria-pressed')).toBe('true');
    expect(hostRef.current?.style.width).toBe('390px');
    expect(
      screen.getByText('Narrow preview: 390 CSS pixels.').textContent,
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Wide · 1024px' }));
    expect(hostRef.current?.style.width).toBe('1024px');
    expect(retry).not.toHaveBeenCalled();
    rerender(
      <PreviewPanel
        hostRef={hostRef}
        result={{ ...ready, status: 'timeout', message: 'Preview timed out' }}
        running={false}
        onFailedWidthChange={retry}
      />,
    );
    await user.click(narrow);
    expect(retry).toHaveBeenCalledOnce();
  });
});
