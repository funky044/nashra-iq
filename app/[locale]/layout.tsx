export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return children;
}

// Tell Next.js about valid locales
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}
