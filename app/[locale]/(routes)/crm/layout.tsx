import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hasAccess } from '@/lib/permissions';
import { redirect } from 'next/navigation';

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/sign-in');
  if (!hasAccess(session.user.userRole, 'crm')) redirect('/unauthorized');
  return <>{children}</>;
}
