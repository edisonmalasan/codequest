import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QuestNode } from './quest-node';
import { QuestPath } from './quest-path';

describe('QuestPath', () => {
  it('renders an ordered trail of display statuses', () => {
    render(
      <QuestPath label="Chapter one trail">
        <QuestNode status="completed" label="Variables" />
        <QuestNode status="in_progress" label="Loops" />
        <QuestNode status="locked" label="Functions" />
      </QuestPath>,
    );
    const trail = screen.getByRole('list', { name: 'Chapter one trail' });
    expect(trail).toBeDefined();
    expect(screen.getAllByRole('listitem')).toHaveProperty('length', 3);
    expect(screen.getByText('Completed')).toBeDefined();
    expect(screen.getByText('In progress')).toBeDefined();
    expect(screen.getByText('Locked')).toBeDefined();
  });
});
