'use client';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuestNode } from './quest-node';

describe('QuestNode', () => {
  it('announces actionable nodes and invokes selection', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <QuestNode status="in_progress" label="Variables" onSelect={onSelect} />,
    );
    await user.click(
      screen.getByRole('button', { name: 'Variables, In progress' }),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('renders locked nodes as inert with text status', () => {
    render(
      <ul>
        <QuestNode
          status="locked"
          label="Functions"
          description="Developing · 15 XP"
          onSelect={() => {}}
        />
      </ul>,
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Locked')).toBeDefined();
    expect(screen.getByText('Developing · 15 XP')).toBeDefined();
  });
});
