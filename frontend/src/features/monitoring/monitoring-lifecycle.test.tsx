import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MonitoringLifecycle } from './monitoring-lifecycle';
import { getBrowserMonitoring } from './browser-monitoring';

vi.mock('./browser-monitoring', () => ({ getBrowserMonitoring: vi.fn() }));

describe('browser error observation', () => {
  afterEach(() => vi.mocked(getBrowserMonitoring).mockReset());

  it('does not subscribe when delivery is disabled', () => {
    vi.mocked(getBrowserMonitoring).mockReturnValue(null);
    const { unmount } = render(<MonitoringLifecycle />);
    window.dispatchEvent(new ErrorEvent('error'));
    unmount();
    expect(getBrowserMonitoring).toHaveBeenCalledOnce();
  });

  it('reports app-origin failures and ignores cross-origin scripts', () => {
    const capture = vi.fn();
    vi.mocked(getBrowserMonitoring).mockReturnValue({ capture });
    const { unmount } = render(<MonitoringLifecycle />);
    window.dispatchEvent(
      new ErrorEvent('error', {
        filename: 'https://extension.example/script.js',
        error: new Error('canary'),
      }),
    );
    window.dispatchEvent(
      new ErrorEvent('error', {
        filename: `${location.origin}/app.js`,
        error: new Error('canary'),
      }),
    );
    expect(capture).toHaveBeenCalledOnce();
    expect(capture).toHaveBeenCalledWith('uncaught_error', expect.any(Error));
    unmount();
    window.dispatchEvent(new ErrorEvent('error'));
    expect(capture).toHaveBeenCalledOnce();
  });

  it('reports unhandled promise failures through the bounded adapter', () => {
    const capture = vi.fn();
    vi.mocked(getBrowserMonitoring).mockReturnValue({ capture });
    const { unmount } = render(<MonitoringLifecycle />);
    const event = new Event('unhandledrejection');
    Object.defineProperty(event, 'reason', { value: new Error('canary') });
    window.dispatchEvent(event);
    expect(capture).toHaveBeenCalledWith(
      'unhandled_rejection',
      expect.any(Error),
    );
    unmount();
  });
});
