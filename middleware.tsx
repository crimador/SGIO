import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['fr'],
  defaultLocale: 'fr',
  localeDetection: false,
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
