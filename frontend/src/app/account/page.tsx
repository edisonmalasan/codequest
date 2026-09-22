import { redirect } from 'next/navigation';
import { CodeQuestLogo } from '@/components/brand/codequest-logo';
import { AccountPanel } from '@/features/auth/account-panel';
import { getTrustedAuthSession } from '@/features/auth/auth-session';

export const dynamic = 'force-dynamic';

export default async function AccountPage(): Promise<React.JSX.Element> {
  const session = await getTrustedAuthSession();
  if (session === undefined) redirect('/login?next=%2Faccount');

  return (
    <main className="mx-auto min-h-screen max-w-3xl space-y-8 px-5 py-10 sm:px-8">
      <CodeQuestLogo />
      <header className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-widest text-ascent">
          Secure checkpoint
        </p>
        <h1 className="font-display text-3xl text-ink">Your account</h1>
      </header>
      <AccountPanel email={session.user.email ?? 'Verified learner'} />
    </main>
  );
}
