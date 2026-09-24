import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { LessonHints } from './lesson-hints';

describe('LessonHints', () => {
  it('reveals native disclosures progressively', async () => {
    const user = userEvent.setup();
    render(
      <LessonHints
        value={{
          question: 'Read the output.',
          concept: 'A string is text.',
          nextStep: 'Change one value.',
        }}
      />,
    );
    const question = screen.getByText('1. Question hint').closest('details');
    const concept = screen.getByText('2. Concept hint').closest('details');
    const nextStep = screen.getByText('3. Next-step hint').closest('details');
    const questionSummary = screen
      .getByText('1. Question hint')
      .closest('summary');
    const conceptSummary = screen
      .getByText('2. Concept hint')
      .closest('summary');
    if (!questionSummary || !conceptSummary)
      throw new Error('Expected native hint summaries');
    expect(question?.hasAttribute('open')).toBe(false);
    expect(concept?.hasAttribute('open')).toBe(false);
    expect(nextStep?.hasAttribute('open')).toBe(false);
    await user.click(questionSummary);
    expect(question?.hasAttribute('open')).toBe(true);
    expect(concept?.hasAttribute('open')).toBe(false);
    await user.click(conceptSummary);
    expect(concept?.hasAttribute('open')).toBe(true);
    expect(nextStep?.hasAttribute('open')).toBe(false);
  });
});
