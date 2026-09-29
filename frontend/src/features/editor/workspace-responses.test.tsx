import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type {
  ValidationResult,
  ValidationStrategy,
} from '@/features/validation';
import type { EditorDraftRepository } from './draft-repository';
import { EditorWorkspace } from './editor-workspace';

const files = [
  {
    id: 'main',
    name: 'main.js',
    language: 'javascript' as const,
    starterSource: 'console.log("ready");',
  },
];
const fields = [
  {
    id: 'explanation',
    label: 'Debug explanation',
    prompt: 'Explain a revealing case.',
    maxLength: 2000,
  },
];
const preferences = { load: async () => null, save: async () => undefined };

describe('written workspace draft fields', () => {
  it('autosaves response-only edits, coalesces lifecycle triggers and isolates restoration by owner', async () => {
    const save = vi.fn(async () => undefined);
    const repository: EditorDraftRepository = {
      save,
      load: async ({ ownerId }) =>
        ownerId === 'A'
          ? [{ fileId: 'response:explanation', source: 'Saved A answer' }]
          : [],
    };
    const view = render(
      <EditorWorkspace
        ownerId="A"
        workspaceId="CAP01-1.0.0"
        files={files}
        responseFields={fields}
        draftRepository={repository}
        preferenceRepository={preferences}
      />,
    );
    const field = await screen.findByLabelText('Debug explanation');
    await waitFor(() =>
      expect(field).toHaveProperty('value', 'Saved A answer'),
    );
    fireEvent.change(field, { target: { value: 'New A answer' } });
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save).toHaveBeenLastCalledWith(
      { ownerId: 'A', workspaceId: 'CAP01-1.0.0' },
      [
        { fileId: 'main', source: files[0].starterSource },
        { fileId: 'response:explanation', source: 'New A answer' },
      ],
    );
    act(() => window.dispatchEvent(new Event('pagehide')));
    expect(save).toHaveBeenCalledTimes(1);
    view.rerender(
      <EditorWorkspace
        ownerId="B"
        workspaceId="CAP01-1.0.0"
        files={files}
        responseFields={fields}
        draftRepository={repository}
        preferenceRepository={preferences}
      />,
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Debug explanation')).toHaveProperty(
        'value',
        '',
      ),
    );
    expect(screen.queryByDisplayValue('New A answer')).toBeNull();
  });

  it('keeps response edits after failed save and retries through the same queue', async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error('quota'))
      .mockResolvedValue(undefined);
    render(
      <EditorWorkspace
        ownerId="A"
        workspaceId="CAP01-1.0.0"
        files={files}
        responseFields={fields}
        draftRepository={{ load: async () => [], save }}
        preferenceRepository={preferences}
      />,
    );
    await screen.findByText('Starter source ready');
    fireEvent.change(screen.getByLabelText('Debug explanation'), {
      target: { value: 'Recover this explanation' },
    });
    await userEvent.click(screen.getByRole('button', { name: /Save locally/ }));
    await screen.findByText(/Local save failed/);
    expect(screen.getByLabelText('Debug explanation')).toHaveProperty(
      'value',
      'Recover this explanation',
    );
    await userEvent.click(screen.getByRole('button', { name: /Save locally/ }));
    await screen.findByText('Saved on this device');
    expect(save).toHaveBeenCalledTimes(2);
  });

  it('captures written responses without sending them to Check or changing an earlier snapshot', async () => {
    const result: ValidationResult = {
      checkId: '00000000-0000-4000-8000-000000000001',
      status: 'completed',
      passed: true,
      cases: [{ id: 'one', label: 'One', status: 'passed', message: 'Passed' }],
      failedCaseIds: [],
      feedback: 'Passed',
      durationMs: 1,
    };
    const validate = vi.fn(
      async (_request: Parameters<ValidationStrategy['validate']>[0]) => {
        void _request;
        return result;
      },
    );
    const strategy: ValidationStrategy = {
      validate,
      cancel: async () => undefined,
      dispose: async () => undefined,
    };
    const submit = vi.fn();
    render(
      <EditorWorkspace
        ownerId="A"
        workspaceId="CAP01-1.0.0"
        files={files}
        responseFields={fields}
        draftRepository={{ load: async () => [], save: async () => undefined }}
        preferenceRepository={preferences}
        validationStrategy={strategy}
        validationDefinition={{
          cases: [
            {
              id: 'one',
              label: 'One',
              mode: 'output-match',
              expectedLines: ['ready'],
              feedback: 'Try again',
            },
          ],
        }}
        onSubmit={submit}
      />,
    );
    await screen.findByText('Starter source ready');
    fireEvent.change(screen.getByLabelText('Debug explanation'), {
      target: { value: 'while(true){} is written text' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Check' }));
    await screen.findByText(/Local check passed/);
    expect(validate.mock.calls[0]?.[0]).toMatchObject({
      source: files[0].starterSource,
    });
    expect(JSON.stringify(validate.mock.calls)).not.toContain('written text');
    await userEvent.click(
      screen.getByRole('button', { name: 'Submit attempt' }),
    );
    fireEvent.change(screen.getByLabelText('Debug explanation'), {
      target: { value: 'Later edit' },
    });
    expect(submit.mock.calls[0]?.[0]).toEqual({
      source: files[0].starterSource,
      validation: result,
      responses: { explanation: 'while(true){} is written text' },
    });
  });
});
