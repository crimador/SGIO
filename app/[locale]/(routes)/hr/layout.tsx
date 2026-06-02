import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function HrLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/sign-in');
  // Tous les rôles peuvent accéder à leurs propres données RH (payslip/congés)
  // Les pages individuelles gèrent les restrictions supplémentaires
  return <>{children}</>;
}
