import getNextVersion from '@/actions/system/get-next-version';
import Link from 'next/link';
import React from 'react';

const Footer = async () => {
  const nextVersion = await getNextVersion();
  //console.log(nextVersion, "nextVersion");
  return (
    <footer className="relative flex h-9 w-full shrink-0 items-center justify-between border-t border-border/50 px-5 text-[11px] text-muted-foreground">
      {/* Left: brand */}
      <div className="hidden items-center gap-1.5 md:flex">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #FAC731)' }}
        />
        <span className="font-semibold" style={{ color: '#1E1D3D' }}>
          KEKELI Group
        </span>
        <span className="text-muted-foreground/60">
          — {process.env.NEXT_PUBLIC_APP_NAME} {process.env.NEXT_PUBLIC_APP_V}
        </span>
      </div>

      {/* Right: tech */}
      <div className="hidden items-center gap-2 md:flex">
        <span>Next.js</span>
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[10px] text-white"
          style={{ background: '#1E1D3D' }}
        >
          {nextVersion.substring(1, 7) || process.env.NEXT_PUBLIC_NEXT_VERSION}
        </span>
        <span className="text-muted-foreground/40">+</span>
        <span>shadcn/ui</span>
      </div>
    </footer>
  );
};

export default Footer;
