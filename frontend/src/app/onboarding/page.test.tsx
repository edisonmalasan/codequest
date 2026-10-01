import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import OnboardingPage from './page';

describe('onboarding', () => {
  it('explains the guest limit and explicit account import', () => {
    render(<OnboardingPage />);
    expect(screen.getByText(/Q01–Q04/)).toBeTruthy();
    expect(screen.getByText(/does not automatically import/)).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Explore the journey' })
        .getAttribute('href'),
    ).toBe('/journeys/javascript-foundations');
  });
});
