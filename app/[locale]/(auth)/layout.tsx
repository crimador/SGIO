import { notFound } from 'next/navigation';
import { createTranslator, IntlError } from 'next-intl';
import '@/app/[locale]/globals.css';

type Props = {
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
    title: t('RootLayout.title'),
    description: t('RootLayout.description'),
  };
}

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-[100dvh] w-full">{children}</div>
);

export default AuthLayout;
