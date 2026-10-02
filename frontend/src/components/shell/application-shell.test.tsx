import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApplicationShell } from './application-shell';

const pathnameState = vi.hoisted(() => ({ value: '/' }));
vi.mock('next/navigation', () => ({
  usePathname: () => pathnameState.value,
}));
vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => (
    <img src={props.src} alt={props.alt} />
  ),
}));

afterEach(() => {
  pathnameState.value = '/';
});

describe('ApplicationShell', () => {
  it('links only current production destinations and exposes a skip target', () => {
    pathnameState.value = '/journeys/javascript-foundations';
    render(
      <ApplicationShell>
        <main>Journey content</main>
      </ApplicationShell>,
    );

    const navigation = screen.getByRole('navigation', {
      name: 'Main navigation',
    });
    expect(
      within(navigation)
        .getByRole('link', { name: 'Home' })
        .getAttribute('href'),
    ).toBe('/');
    expect(
      within(navigation)
        .getByRole('link', { name: 'Courses' })
        .getAttribute('href'),
    ).toBe('/courses');
    expect(
      within(navigation)
        .getByRole('link', { name: 'How it works' })
        .getAttribute('href'),
    ).toBe('/onboarding');
    expect(
      within(navigation)
        .getByRole('link', { name: 'Account' })
        .getAttribute('href'),
    ).toBe('/account');
    expect(
      within(navigation)
        .getByRole('link', { name: 'Courses' })
        .getAttribute('aria-current'),
    ).toBe('page');
    expect(
      screen.getByText('Journey content').closest('#main-content'),
    ).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Skip to main content' })
        .getAttribute('href'),
    ).toBe('#main-content');
    expect(navigation.textContent).not.toMatch(/level|xp|signed in/i);
  });

  it('opens the mobile menu and restores focus on Escape', async () => {
    const user = userEvent.setup();
    render(
      <ApplicationShell>
        <main>Home content</main>
      </ApplicationShell>,
    );
    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button.getAttribute('aria-expanded')).toBe('false');
    await user.click(button);
    const mobile = screen.getByRole('navigation', {
      name: 'Mobile navigation',
    });
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(within(mobile).getByRole('link', { name: 'Account' })).toBeTruthy();
    await user.keyboard('{Escape}');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(button);
  });

  it('leaves full-screen learning and development routes untouched', () => {
    pathnameState.value = '/quests/first-steps';
    render(
      <ApplicationShell>
        <main>Quest workspace</main>
      </ApplicationShell>,
    );
    expect(
      screen.queryByRole('navigation', { name: 'Main navigation' }),
    ).toBeNull();
    expect(screen.getByText('Quest workspace')).toBeTruthy();
  });
});
