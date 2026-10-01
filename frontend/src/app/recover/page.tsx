import { AuthFrame } from '@/features/auth/auth-frame';
import { RecoveryRequestForm } from '@/features/auth/recovery-request-form';

export default function RecoverPage(): React.JSX.Element {
  return (
    <AuthFrame
      title="Recover your password"
      description="For email and password accounts. Google and GitHub learners can continue with their provider."
    >
      <RecoveryRequestForm />
    </AuthFrame>
  );
}
