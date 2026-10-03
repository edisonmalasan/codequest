import { redirect } from 'next/navigation';
import { AccountPanel } from '@/features/auth/account-panel';
import { getTrustedAuthSession } from '@/features/auth/auth-session';
import styles from '../supporting-page.module.css';

export const dynamic = 'force-dynamic';

export default async function AccountPage(): Promise<React.JSX.Element> {
  const session = await getTrustedAuthSession();
  if (session === undefined) redirect('/login?next=%2Faccount');

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>Your space</p>
        <h1>Your account</h1>
        <p>Manage your profile, learning record, and saved work.</p>
      </header>
      <AccountPanel email={session.user.email ?? 'Verified learner'} />
    </main>
  );
}
