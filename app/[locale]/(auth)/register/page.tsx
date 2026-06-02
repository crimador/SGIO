import { RegisterComponent } from './components/RegisterComponent';
import { ThemeToggle } from '@/components/ThemeToggle';

const KekelSun = () => (
  <svg viewBox="0 0 200 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-40 h-auto drop-shadow-2xl">
    <defs>
      <linearGradient id="sunBodyR" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FAC731" />
        <stop offset="100%" stopColor="#FF7E00" />
      </linearGradient>
      <linearGradient id="horizonR" x1="0%" y1="0%" x2="100%" y2="0%">
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
    <path d="M55,95 A45,45 0 0 1 145,95 Z" fill="url(#sunBodyR)" />
    <path d="M28,100 Q100,94 172,100" stroke="url(#horizonR)" strokeWidth="5" strokeLinecap="round" fill="none" />
  </svg>
);

const RayPattern = () => (
  <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="raysR" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
        <line x1="60" y1="60" x2="60" y2="10"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="60" x2="95" y2="25"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="60" x2="110" y2="60" stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="60" x2="95" y2="95"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="60" x2="60" y2="110" stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="60" x2="25" y2="95"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="60" x2="10" y2="60"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
        <line x1="60" y1="60" x2="25" y2="25"  stroke="#FAC731" strokeWidth="2" strokeLinecap="round" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#raysR)" />
  </svg>
);

const RegisterPage = () => (
  <div className="flex min-h-[100dvh] w-full">

    {/* ── Panneau gauche : identité KEKELI ── */}
    <div
      className="relative hidden flex-col overflow-hidden lg:flex lg:w-[44%]"
      style={{ background: '#1E1D3D' }}
    >
      <RayPattern />

      <div className="relative flex flex-1 flex-col items-center justify-center px-12 text-center">
        <KekelSun />

        <h1 className="mt-8 text-3xl font-black tracking-tight text-white">
          KEKELI Group
        </h1>
        <p className="mt-2 text-sm font-medium tracking-wide text-white/50">
          {process.env.NEXT_PUBLIC_APP_NAME ?? 'SGIO'}
        </p>

        <div className="mt-10 flex flex-col gap-3 text-left w-full max-w-[240px]">
          {[
            { dot: '#FAC731', label: 'Lumière & guidance' },
            { dot: '#FF7E00', label: 'Énergie & dynamisme' },
            { dot: '#FAC731', label: 'Confiance & stabilité' },
          ].map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
              <span className="text-xs font-medium text-white/60">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="h-1 w-full shrink-0"
        style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }}
      />
    </div>

    {/* ── Panneau droit : message accès restreint ── */}
    <div
      className="relative flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16"
      style={{ background: '#FAFAF9' }}
    >
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      {/* Logo mobile uniquement */}
      <div className="mb-10 flex items-center gap-3 lg:hidden">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black text-white"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #FAC731)' }}
        >
          KG
        </div>
        <span className="text-base font-bold" style={{ color: '#1E1D3D' }}>
          KEKELI Group
        </span>
      </div>

      <div className="w-full max-w-[360px]">
        <RegisterComponent />
      </div>

      <p className="absolute bottom-5 text-[11px] text-gray-400">
        © {new Date().getFullYear()} KEKELI Group — Tous droits réservés
      </p>
    </div>
  </div>
);

export default RegisterPage;
