'use client';

import axios from 'axios';
import { usePathname } from 'next/navigation';

const LOCALES = ['en', 'fr', 'de', 'cz', 'uk', 'ko', 'tr'];

const languages = [
  { label: 'Français', value: 'fr' },
  { label: 'English',  value: 'en' },
  { label: 'Deutsch',  value: 'de' },
  { label: 'Čeština',  value: 'cz' },
  { label: 'Українська', value: 'uk' },
  { label: '한국어',   value: 'ko' },
  { label: 'Türkçe',  value: 'tr' },
];

type Props = { userId: string };

export function SetLanguage({ userId }: Props) {
  const pathname = usePathname();

  const current = LOCALES.find((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) ?? 'fr';

  const handleChange = async (lang: string) => {
    try {
      await axios.put(`/api/user/${userId}/set-language`, { language: lang });
    } catch {
      // on continue quand même — la navigation suffit
    }
    // Remplace le segment de locale dans l'URL
    const segments = pathname.split('/');
    if (segments[1] && LOCALES.includes(segments[1])) {
      segments[1] = lang;
    } else {
      segments.splice(1, 0, lang);
    }
    // Rechargement complet pour que le middleware prenne la nouvelle locale
    window.location.assign(segments.join('/') || '/');
  };

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
    >
      {languages.map((l) => (
        <option key={l.value} value={l.value}>{l.label}</option>
      ))}
    </select>
  );
}
