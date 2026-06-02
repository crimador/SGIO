import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import ChangePasswordForm from './components/ChangePasswordForm';

export default async function ChangePasswordPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/sign-in');
  }

  if (!session.user.mustChangePassword) {
    redirect('/');
  }

  return <ChangePasswordForm userId={session.user.id} />;
}
