'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Globe, User, LogOut, Bell, Search } from 'lucide-react';
import { t } from '@/lib/utils';

interface HeaderProps {
  locale?: string;
  user?: {
    email: string;
    full_name: string;
    role: string;
  } | null;
}

export default function Header({ locale: localeProps, user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract locale from pathname if not provided
  const locale = localeProps || pathname.split('/')[1] || 'en';

  const navigation = [
    { name: t('home', locale), href: `/${locale}` },
    { name: t('markets', locale), href: `/${locale}/markets` },
    { name: t('companies', locale), href: `/${locale}/companies` },
    { name: t('news', locale), href: `/${locale}/news` },
    { name: t('calendar', locale), href: `/${locale}/calendar` },
    { name: t('screeners', locale), href: `/${locale}/screeners` },
  ];

  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-xl font-bold text-neutral-900">NashraIQ</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-6 rtl:space-x-reverse">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {/* Search */}
            <button className="p-2 text-neutral-600 hover:text-primary-600 transition-colors">
              <Search className="w-5 h-5" />
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 rtl:space-x-reverse px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-primary-600 border border-neutral-300 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{locale === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 rtl:space-x-reverse p-2 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <User className="w-5 h-5 text-neutral-600" />
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-1">
                    <div className="px-4 py-2 border-b border-neutral-200">
                      <p className="text-sm font-medium text-neutral-900">{user.full_name}</p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                    <Link
                      href={`/${locale}/watchlist`}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      {t('watchlist', locale)}
                    </Link>
                    <Link
                      href={`/${locale}/alerts`}
                      className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                    >
                      {t('alerts', locale)}
                    </Link>
                    <button
                      onClick={() => router.push(`/${locale}/logout`)}
                      className="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-neutral-100 flex items-center space-x-2 rtl:space-x-reverse"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('logout', locale)}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={`/${locale}/auth`}
                className="btn-primary text-sm"
              >
                {t('login', locale)}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-neutral-200">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-2 text-base font-medium text-neutral-700 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
