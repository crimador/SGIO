import { getRequestConfig } from 'next-intl/server';

const locales = ['fr', 'en', 'de', 'cz', 'uk', 'ko'];
const defaultLocale = 'fr';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = requested && locales.includes(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default,
  };
});
