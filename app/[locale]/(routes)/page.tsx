import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDictionary } from '@/dictionaries';
import { getModules } from '@/actions/get-modules';
import { getGlobalDashboard } from '@/actions/dashboard/get-global-dashboard';
import SuspenseLoading from '@/components/loadings/suspense';
import GlobalDashboard from './components/dashboard/GlobalDashboard';

/* ── Soleil décoratif (version réduite pour le hero) ── */
const HeroSun = () => (
  <svg
    viewBox="0 0 200 170"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute -right-6 -top-4 h-44 w-auto opacity-20"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="heroSunBody" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FAC731" />
        <stop offset="100%" stopColor="#FF7E00" />
      </linearGradient>
      <linearGradient id="heroHorizon" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF7E00" stopOpacity="0" />
        <stop offset="25%" stopColor="#FF7E00" />
        <stop offset="75%" stopColor="#FF7E00" />
        <stop offset="100%" stopColor="#FF7E00" stopOpacity="0" />
      </linearGradient>
    </defs>
    <line x1="100" y1="95" x2="100" y2="38" stroke="#FAC731" strokeWidth="5" strokeLinecap="round" />
    <line x1="100" y1="95" x2="136" y2="46" stroke="#FAC731" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="100" y1="95" x2="160" y2="64" stroke="#FAC731" strokeWidth="4" strokeLinecap="round" />
    <line x1="100" y1="95" x2="170" y2="90" stroke="#FAC731" strokeWidth="3.5" strokeLinecap="round" />
    <line x1="100" y1="95" x2="64"  y2="46" stroke="#FAC731" strokeWidth="4.5" strokeLinecap="round" />
    <line x1="100" y1="95" x2="40"  y2="64" stroke="#FAC731" strokeWidth="4" strokeLinecap="round" />
    <line x1="100" y1="95" x2="30"  y2="90" stroke="#FAC731" strokeWidth="3.5" strokeLinecap="round" />
    <path d="M55,95 A45,45 0 0 1 145,95 Z" fill="url(#heroSunBody)" />
    <path d="M28,100 Q100,94 172,100" stroke="url(#heroHorizon)" strokeWidth="5" strokeLinecap="round" fill="none" />
  </svg>
);

const DashboardPage = async ({ params }: { params: { locale: string } }) => {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const dict = await getDictionary(params.locale as 'en' | 'cz' | 'de' | 'uk' | 'ko' | 'fr');

  const [modules, dashboardData] = await Promise.all([
    getModules(),
    getGlobalDashboard(),
  ]);

  const firstName = session.user?.name
    ? session.user.name.split(' ')[0]
    : session.user?.email?.split('@')[0] ?? '';

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const capitalToday = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <div className="h-full flex-1 overflow-hidden p-6 pt-5 lg:p-8 lg:pt-6">

      {/* ── Bandeau d'accueil ─────────────────────────────────────────────── */}
      <div
        className="relative mb-6 overflow-hidden rounded-2xl px-7 py-6"
        style={{ background: 'linear-gradient(135deg, #1E1D3D 0%, #36355F 100%)' }}
      >
        {/* Rayons décoratifs en fond */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.05]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="heroRays" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
              <line x1="60" y1="60" x2="60"  y2="10"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
              <line x1="60" y1="60" x2="95"  y2="25"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
              <line x1="60" y1="60" x2="110" y2="60"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
              <line x1="60" y1="60" x2="95"  y2="95"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
              <line x1="60" y1="60" x2="60"  y2="110" stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
              <line x1="60" y1="60" x2="25"  y2="95"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
              <line x1="60" y1="60" x2="10"  y2="60"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
              <line x1="60" y1="60" x2="25"  y2="25"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#heroRays)" />
        </svg>

        {/* Soleil décoratif à droite */}
        <HeroSun />

        {/* Barre orange en bas */}
        <div
          className="absolute bottom-0 left-0 h-[3px] w-full"
          style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731, transparent)' }}
        />

        {/* Contenu */}
        <div className="relative z-10">
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#FAC731' }}
          >
            {process.env.NEXT_PUBLIC_APP_NAME ?? 'KEKELI Group ERP'}
          </p>
          <h1 className="text-2xl font-bold text-white">
            {firstName ? `Bonjour, ${firstName}` : 'Tableau de bord'}
          </h1>
          <p className="mt-1 text-sm text-white/55">{capitalToday}</p>

          {/* Séparateur + description */}
          <div className="mt-4 flex items-center gap-3">
            <div
              className="h-px w-8 rounded-full"
              style={{ background: '#FF7E00' }}
            />
            <p className="text-xs font-medium text-white/40">
              {dict.DashboardPage.containerDescription}
            </p>
          </div>
        </div>
      </div>

      {/* ── Contenu principal ─────────────────────────────────────────────── */}
      <div className="h-full overflow-auto pb-32 text-sm">
        <Suspense fallback={<SuspenseLoading />}>
          <GlobalDashboard data={dashboardData} modules={modules} />
        </Suspense>
      </div>

    </div>
  );
};

export default DashboardPage;
