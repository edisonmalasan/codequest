import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './input';

describe('Input', () => {
  it('associates label, helper, and error with the field', () => {
    render(
      <Input label="Call sign" helperText="Pick a name" placeholder="Nova" />,
    );
    const field = screen.getByLabelText('Call sign');
    expect(field.getAttribute('placeholder')).toBe('Nova');
    expect(screen.getByText('Pick a name').getAttribute('id')).toBe(
      field.getAttribute('aria-describedby'),
    );
  });

  it('announces errors below the field and marks it invalid', () => {
    render(<Input label="Call sign" errorText="Required for the quest" />);
    const field = screen.getByLabelText('Call sign');
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert')).toHaveProperty(
      'textContent',
      'Required for the quest',
    );
  });
});
