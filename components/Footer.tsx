'use client';

import Link from 'next/link';
import { t } from '@/lib/utils';

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">NashraIQ</h3>
            <p className="text-sm text-neutral-400">
              {locale === 'en' 
                ? 'Professional market intelligence platform for GCC financial markets.'
                : 'منصة استخبارات السوق الاحترافية لأسواق دول مجلس التعاون الخليجي المالية.'}
            </p>
          </div>

          {/* Markets */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('markets', locale)}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/markets/saudi`} className="hover:text-white transition-colors">
                  {locale === 'en' ? 'Saudi Market' : 'السوق السعودي'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/markets/gcc`} className="hover:text-white transition-colors">
                  {locale === 'en' ? 'GCC Markets' : 'أسواق الخليج'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {locale === 'en' ? 'Resources' : 'الموارد'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/insights`} className="hover:text-white transition-colors">
                  {t('insights', locale)}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/api-docs`} className="hover:text-white transition-colors">
                  {locale === 'en' ? 'API Documentation' : 'توثيق API'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">
              {locale === 'en' ? 'Legal' : 'قانوني'}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">
                  {locale === 'en' ? 'Privacy Policy' : 'سياسة الخصوصية'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-white transition-colors">
                  {locale === 'en' ? 'Terms of Service' : 'شروط الخدمة'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 text-center">
            {t('notInvestmentAdvice', locale)}
          </p>
          <p className="text-xs text-neutral-600 text-center mt-2">
            © {currentYear} NashraIQ. {locale === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
