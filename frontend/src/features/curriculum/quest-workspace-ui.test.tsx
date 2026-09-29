import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { questFixtures } from './journey-course-test-data';
import { QuestWorkspace } from './quest-workspace';

const { start, pass } = vi.hoisted(() => ({ start: vi.fn(), pass: vi.fn() }));
const sync = vi.hoisted(() => ({
  owner: null as string | null,
  save: vi.fn(),
  replay: vi.fn(),
  list: vi.fn(),
}));
vi.mock('@/features/progress-sync/progress-replay', () => ({
  progressReplay: {
    save: sync.save,
    replay: sync.replay,
    repository: { list: sync.list },
  },
}));
vi.mock('@/features/progress-sync/trusted-sync', () => ({
  currentSyncOwner: async () => sync.owner,
  ownerSyncApi: () => ({}),
  notifyOutbox: vi.fn(),
  refreshAccountFacts: vi.fn(),
}));
vi.mock('./guest-learning', () => ({
  isGuestQuestId: (id: string) => ['Q01', 'Q02', 'Q03', 'Q04'].includes(id),
  guestLearningRepository: { start, pass },
}));
vi.mock('@/features/auth/supabase-browser', () => ({
  getBrowserSupabaseClient: () => ({
    auth: {
      getSession: async () => ({
        data: { session: sync.owner ? { user: { id: sync.owner } } : null },
        error: null,
      }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  }),
}));
vi.mock('@/features/runtime', () => ({
  resolveRunnerOrigin: () => null,
  JavaScriptWorkerAdapter: vi.fn(),
}));
vi.mock('@/features/validation', () => ({
  JavaScriptValidationStrategy: vi.fn(),
}));
vi.mock('@/features/editor', () => ({
  EditorWorkspace: ({
    onCheckComplete,
    onSubmit,
    onSourcesChange,
  }: {
    onCheckComplete?: (snapshot: unknown) => void;
    onSubmit?: (snapshot: unknown) => void;
    onSourcesChange?: (sources: Readonly<Record<string, string>>) => void;
  }) => (
    <>
      <button
        onClick={() =>
          onSourcesChange?.({
            'response:explanation': 'Empty array reveals the defect.',
            'response:transfer': 'Include quantities equal to the threshold.',
          })
        }
      >
        Mock written responses
      </button>
      <button
        type="button"
        onClick={() =>
          onCheckComplete?.({
            source: 'guest source',
            validation: {
              checkId: 'check',
              status: 'completed',
              passed: true,
              cases: [],
              failedCaseIds: [],
              feedback: 'Passed',
              durationMs: 1,
            },
          })
        }
      >
        Mock Check
      </button>
      <button
        disabled={!onSubmit}
        onClick={() =>
          onSubmit?.({
            source: 'account source',
            responses: {
              explanation: 'Empty array reveals the defect.',
              transfer: 'Include quantities equal to the threshold.',
            },
            validation: {
              checkId: 'check',
              status: 'completed',
              passed: true,
              cases: [],
              failedCaseIds: [],
              feedback: 'Passed',
              durationMs: 1,
            },
          })
        }
      >
        Mock Submit
      </button>
    </>
  ),
}));

describe('guest quest presentation', () => {
  it('requires both capstone responses and captures them only on explicit Submit', async () => {
    sync.owner = 'A';
    render(
      <QuestWorkspace
        quest={{
          ...questFixtures.Q01,
          id: 'CAP01',
          kind: 'capstone',
          guestEligible: false,
          explanationPrompt: 'Explain the repair.',
          transferPrompt: 'Explain the fresh task.',
        }}
      />,
    );
    const submit = await screen.findByRole('button', { name: 'Mock Submit' });
    expect(submit).toHaveProperty('disabled', true);
    await userEvent.click(
      screen.getByRole('button', { name: 'Mock written responses' }),
    );
    expect(submit).toHaveProperty('disabled', false);
    expect(sync.save).not.toHaveBeenCalled();
    await userEvent.click(submit);
    await waitFor(() =>
      expect(sync.save).toHaveBeenCalledWith(
        'A',
        'CAP01',
        expect.objectContaining({
          report: expect.objectContaining({
            capstoneResponses: {
              explanation: 'Empty array reveals the defect.',
              transfer: 'Include quantities equal to the threshold.',
            },
          }),
        }),
      ),
    );
  });
  afterEach(() => vi.restoreAllMocks());
  beforeEach(() => {
    vi.clearAllMocks();
    sync.owner = null;
    sync.save.mockResolvedValue(undefined);
    sync.replay.mockResolvedValue({ confirmed: 0, pending: true });
    sync.list.mockResolvedValue([]);
    start.mockResolvedValue({ questId: 'Q01', startedAt: 1 });
    pass.mockResolvedValue({
      questId: 'Q01',
      startedAt: 1,
      eventId: 'event',
      submission: { source: 'guest source' },
    });
  });

  it('saves explicit authenticated Submit before transport and labels pending separately', async () => {
    sync.owner = 'A';
    render(<QuestWorkspace quest={questFixtures.Q01} />);
    await screen.findByRole('button', { name: 'Mock Submit' });
    expect(sync.save).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Mock Submit' }));
    await screen.findByText(/Submission saved on this device/);
    expect(sync.save).toHaveBeenCalledWith(
      'A',
      'Q01',
      expect.objectContaining({
        source: 'account source',
        contentVersion: questFixtures.Q01.contentVersion,
      }),
    );
    expect(sync.save.mock.invocationCallOrder[0]).toBeLessThan(
      sync.replay.mock.invocationCallOrder[0],
    );
  });

  it('does not send a submission when durable storage fails', async () => {
    sync.owner = 'A';
    sync.save.mockRejectedValue(new Error('quota'));
    render(<QuestWorkspace quest={questFixtures.Q01} />);
    await screen.findByRole('button', { name: 'Mock Submit' });
    await userEvent.click(screen.getByRole('button', { name: 'Mock Submit' }));
    await screen.findByText(/Submission storage or replay unavailable/);
    expect(sync.replay).not.toHaveBeenCalled();
  });

  it('saves a downloaded authenticated Submit offline without auto-submitting Check or replaying', async () => {
    sync.owner = 'A';
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    render(<QuestWorkspace quest={questFixtures.Q01} offline />);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Mock Check' }),
    );
    expect(sync.save).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Mock Submit' }));
    await screen.findByText(/Submission saved on this device/);
    expect(sync.save).toHaveBeenCalledWith(
      'A',
      'Q01',
      expect.objectContaining({
        source: 'account source',
        assessmentVersion: '1.0.0',
      }),
    );
    expect(sync.replay).not.toHaveBeenCalled();
    expect(pass).not.toHaveBeenCalled();
  });

  it('retains the same offline event for retry of the captured Check', async () => {
    sync.owner = 'A';
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    render(<QuestWorkspace quest={questFixtures.Q01} offline />);
    const button = await screen.findByRole('button', { name: 'Mock Submit' });
    await userEvent.click(button);
    await screen.findByText(/Submission saved on this device/);
    await userEvent.click(button);
    await waitFor(() => expect(sync.save).toHaveBeenCalledTimes(2));
    expect(sync.save.mock.calls[1]).toEqual(sync.save.mock.calls[0]);
    expect(sync.replay).not.toHaveBeenCalled();
  });

  it('does not persist a downloaded snapshot after the selected account changes', async () => {
    sync.owner = 'A';
    render(<QuestWorkspace quest={questFixtures.Q01} offline />);
    const button = await screen.findByRole('button', { name: 'Mock Submit' });
    sync.owner = 'B';
    await userEvent.click(button);
    await screen.findByText(/Sign in to the same account/);
    expect(sync.save).not.toHaveBeenCalled();
    expect(sync.replay).not.toHaveBeenCalled();
  });

  it('reports offline storage failure without claiming pending delivery', async () => {
    sync.owner = 'A';
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    sync.save.mockRejectedValue(new Error('quota'));
    render(<QuestWorkspace quest={questFixtures.Q01} offline />);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Mock Submit' }),
    );
    await screen.findByText(/Submission storage or replay unavailable/);
    expect(screen.queryByText(/Submission saved on this device/)).toBeNull();
    expect(sync.replay).not.toHaveBeenCalled();
  });

  it('records provisional pass only after local persistence resolves', async () => {
    const user = userEvent.setup();
    render(<QuestWorkspace quest={questFixtures.Q01} />);
    await screen.findByText(/Guest activity saved on this device/);
    await user.click(screen.getByRole('button', { name: 'Mock Check' }));
    await waitFor(() =>
      expect(pass).toHaveBeenCalledWith(
        'Q01',
        questFixtures.Q01.contentVersion,
        questFixtures.Q01.assessmentVersion,
        'guest source',
        expect.objectContaining({ passed: true }),
      ),
    );
    expect(
      await screen.findByText(/Provisional completion saved on this device/),
    ).toBeDefined();
    expect(
      screen.getByRole('link', { name: 'Sign up' }).getAttribute('href'),
    ).toContain('/register');
  });

  it('reports failed device storage without claiming durable completion', async () => {
    pass.mockRejectedValueOnce(new Error('quota'));
    const user = userEvent.setup();
    render(<QuestWorkspace quest={questFixtures.Q01} />);
    await screen.findByText(/Guest activity saved on this device/);
    await user.click(screen.getByRole('button', { name: 'Mock Check' }));
    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      expect.stringContaining('could not be saved'),
    );
    expect(
      screen.queryByText(/Provisional completion saved on this device/),
    ).toBeNull();
  });

  it('gates a signed-out non-guest quest', async () => {
    render(
      <QuestWorkspace
        quest={{ ...questFixtures.Q01, id: 'Q05', guestEligible: false }}
      />,
    );
    expect(await screen.findByText(/Guest practice is limited/)).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Mock Check' })).toBeNull();
    expect(start).not.toHaveBeenCalled();
  });
});
