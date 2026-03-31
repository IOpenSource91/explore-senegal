import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Epilogue, Inter } from 'next/font/google';
import { locales } from '@/i18n/config';
import ThemeProvider from '@/components/shared/ThemeProvider';
import '@/styles/globals.css';

const epilogue = Epilogue({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: 'Explore Sénégal',
  description:
    'Circuits authentiques au Sénégal avec un guide local passionné.',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${epilogue.variable} ${inter.variable}`}>
      <body className="bg-surface font-body text-on-surface antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
