import { createCodequestApi } from '@/lib/api-client';
import { getBrowserSupabaseClient } from '@/features/auth/supabase-browser';
import { getQueryClient } from '@/lib/query-client';

export const OUTBOX_CHANGED = 'codequest-outbox-changed';
export const ACCOUNT_REFRESH = 'codequest-account-refresh';

export async function currentSyncOwner(): Promise<string | null> {
  try {
    const { data, error } = await getBrowserSupabaseClient().auth.getSession();
    return error ? null : (data.session?.user.id ?? null);
  } catch {
    return null;
  }
}

export function ownerSyncApi(
  ownerId: string,
): ReturnType<typeof createCodequestApi> {
  return createCodequestApi({
    getAccessToken: async () => {
      try {
        const { data, error } =
          await getBrowserSupabaseClient().auth.getSession();
        return !error && data.session?.user.id === ownerId
          ? data.session.access_token
          : null;
      } catch {
        return null;
      }
    },
  });
}

export function notifyOutbox(ownerId: string): void {
  window.dispatchEvent(new CustomEvent(OUTBOX_CHANGED, { detail: ownerId }));
}

export function refreshAccountFacts(ownerId: string): void {
  void getQueryClient().invalidateQueries({ queryKey: ['progress'] });
  window.dispatchEvent(new CustomEvent(ACCOUNT_REFRESH, { detail: ownerId }));
}
