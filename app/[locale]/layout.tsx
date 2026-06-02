import './globals.css';

import { Montserrat } from 'next/font/google';

import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { createTranslator, IntlError, NextIntlClientProvider } from 'next-intl';

import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/app/providers/ThemeProvider';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
});

type Props = {
  children: ReactNode;
  params: { locale: string };
};

async function getLocales(locale: string) {
  try {
    return (await import(`@/locales/${locale}.json`)).default;
  } catch (error) {
    if (error instanceof IntlError) {
      notFound();
    }
  }
}

export async function generateMetadata({ params: { locale } }: Props) {
  const messages = await getLocales(locale);

  const t = createTranslator({ locale, messages });

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
    title: t('RootLayout.title'),
    description: t('RootLayout.description'),
    openGraph: {
      images: [
        {
          url: '/images/opengraph-image.png',
          width: 1200,
          height: 630,
          alt: t('RootLayout.title'),
        },
      ],
    },
    twitter: {
      cardType: 'summary_large_image',
      image: '/images/opengraph-image.png',
      width: 1200,
      height: 630,
      alt: t('RootLayout.title'),
    },
  };
}

export default async function RootLayout({
  children,
  params: { locale },
}: Props) {
  const messages = await getLocales(locale);

  return (
    <html lang={locale}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1"
        />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_APP_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="KEKELI GROUP" />
        <meta
          property="og:description"
          content="KEKELI GROUP — Système ERP de gestion d'entreprise."
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="KEKELI GROUP" />
        <meta
          name="twitter:description"
          content="KEKELI GROUP — Système ERP de gestion d'entreprise."
        />
      </head>
      <body className={`${montserrat.variable} font-sans h-screen overflow-hidden`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
