import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select } from './select';

const options = [
  { value: 'js', label: 'JavaScript' },
  { value: 'py', label: 'Python' },
];

describe('Select', () => {
  it('renders labeled options', () => {
    render(<Select label="Track" options={options} defaultValue="js" />);
    const field = screen.getByLabelText('Track');
    expect(field).toHaveProperty('value', 'js');
    expect(screen.getByRole('option', { name: 'Python' })).toBeDefined();
  });

  it('announces errors and marks the field invalid', () => {
    render(
      <Select label="Track" options={options} errorText="Choose a track" />,
    );
    expect(screen.getByLabelText('Track').getAttribute('aria-invalid')).toBe(
      'true',
    );
    expect(screen.getByRole('alert')).toHaveProperty(
      'textContent',
      'Choose a track',
    );
  });
});
