import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mayRegisterWorker, PwaStatus } from './pwa-status';

class WorkerFixture extends EventTarget {
  state = 'installing';
}
class RegistrationFixture extends EventTarget {
  waiting: WorkerFixture | null = null;
  installing: WorkerFixture | null = null;
  update = vi.fn().mockResolvedValue(undefined);
}
const register = vi.fn();
function setup(registration = new RegistrationFixture()) {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubGlobal('isSecureContext', true);
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { register, controller: {} },
  });
  register.mockResolvedValue(registration);
  return registration;
}
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  register.mockReset();
  Reflect.deleteProperty(navigator, 'serviceWorker');
  Reflect.deleteProperty(navigator, 'onLine');
});
describe('PWA lifecycle', () => {
  it('only registers production application origin', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(mayRegisterWorker('http://localhost')).toBe(false);
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_RUNTIME_ORIGIN', 'https://runner.test');
    expect(mayRegisterWorker('https://runner.test')).toBe(false);
    expect(mayRegisterWorker('https://app.test')).toBe(true);
    vi.stubEnv('NEXT_PUBLIC_PREVIEW_ORIGIN', 'invalid');
    expect(mayRegisterWorker('https://app.test')).toBe(false);
  });
  it('registers once and describes an already waiting update without activation', async () => {
    const registration = setup();
    registration.waiting = new WorkerFixture();
    const view = render(<PwaStatus />);
    await screen.findByText(/Update available/);
    expect(register).toHaveBeenCalledWith('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    expect(register).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/close all CodeQuest tabs/)).toBeDefined();
    view.unmount();
    act(() => window.dispatchEvent(new Event('online')));
    expect(registration.update).not.toHaveBeenCalled();
  });
  it('detects a later update and an installation failure', async () => {
    const registration = setup();
    render(<PwaStatus />);
    await waitFor(() => expect(register).toHaveBeenCalled());
    const worker = new WorkerFixture();
    registration.installing = worker;
    act(() => registration.dispatchEvent(new Event('updatefound')));
    registration.waiting = worker;
    registration.installing = null;
    worker.state = 'installed';
    act(() => worker.dispatchEvent(new Event('statechange')));
    expect(screen.getByText(/Update available/)).toBeDefined();
    worker.state = 'redundant';
    act(() => worker.dispatchEvent(new Event('statechange')));
    expect(
      screen.getByText(/preparation or update check failed/),
    ).toBeDefined();
  });
  it('shows registration failure while keeping connection status usable', async () => {
    setup();
    register.mockRejectedValue(new Error('fixture denied'));
    render(<PwaStatus />);
    await screen.findByText(/preparation or update check failed/);
    expect(screen.getByText(/Online/)).toBeDefined();
  });
  it('keeps unsupported browsers usable and changes connection hints', () => {
    render(<PwaStatus />);
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    act(() => window.dispatchEvent(new Event('offline')));
    expect(screen.getByText(/Offline · account services/)).toBeDefined();
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    });
    act(() => window.dispatchEvent(new Event('online')));
    expect(screen.getByText(/Online · account services/)).toBeDefined();
    expect(register).not.toHaveBeenCalled();
  });
});
