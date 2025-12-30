export function formatNumber(value: number, locale: string = 'en', decimals: number = 2): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCurrency(value: number, currency: string = 'SAR', locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: currency,
  }).format(value);
}

export function formatLargeNumber(value: number, locale: string = 'en'): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (abs >= 1e12) {
    return sign + formatNumber(abs / 1e12, locale, 2) + (locale === 'ar' ? ' ت' : 'T');
  } else if (abs >= 1e9) {
    return sign + formatNumber(abs / 1e9, locale, 2) + (locale === 'ar' ? ' ب' : 'B');
  } else if (abs >= 1e6) {
    return sign + formatNumber(abs / 1e6, locale, 2) + (locale === 'ar' ? ' م' : 'M');
  } else if (abs >= 1e3) {
    return sign + formatNumber(abs / 1e3, locale, 2) + (locale === 'ar' ? ' ألف' : 'K');
  }
  
  return sign + formatNumber(abs, locale, 2);
}

export function formatPercentage(value: number, locale: string = 'en', decimals: number = 2): string {
  return formatNumber(value, locale, decimals) + '%';
}

export function formatDate(date: Date | string, locale: string = 'en', format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  }
  
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

export function getRelativeTime(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  const translations = {
    en: {
      justNow: 'just now',
      minAgo: (n: number) => `${n} min${n > 1 ? 's' : ''} ago`,
      hourAgo: (n: number) => `${n} hour${n > 1 ? 's' : ''} ago`,
      dayAgo: (n: number) => `${n} day${n > 1 ? 's' : ''} ago`,
    },
    ar: {
      justNow: 'الآن',
      minAgo: (n: number) => `منذ ${n} دقيقة`,
      hourAgo: (n: number) => `منذ ${n} ساعة`,
      dayAgo: (n: number) => `منذ ${n} يوم`,
    },
  };
  
  const t = translations[locale as 'en' | 'ar'] || translations.en;
  
  if (diffMins < 1) return t.justNow;
  if (diffMins < 60) return t.minAgo(diffMins);
  if (diffHours < 24) return t.hourAgo(diffHours);
  if (diffDays < 7) return t.dayAgo(diffDays);
  
  return formatDate(d, locale);
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    markets: 'Markets',
    companies: 'Companies',
    news: 'News',
    calendar: 'Calendar',
    screeners: 'Screeners',
    insights: 'Insights',
    watchlist: 'Watchlist',
    alerts: 'Alerts',
    
    // Market data
    price: 'Price',
    change: 'Change',
    volume: 'Volume',
    marketCap: 'Market Cap',
    peRatio: 'P/E Ratio',
    dividend: 'Dividend',
    
    // Actions
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    save: 'Save',
    cancel: 'Cancel',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    noData: 'No data available',
    demo: 'DEMO',
    source: 'Source',
    
    // Disclaimers
    notInvestmentAdvice: 'Not investment advice. For informational purposes only.',
    demoDataWarning: 'This is demonstration data only.',
  },
  ar: {
    // Navigation
    home: 'الرئيسية',
    markets: 'الأسواق',
    companies: 'الشركات',
    news: 'الأخبار',
    calendar: 'التقويم',
    screeners: 'الفرز',
    insights: 'رؤى',
    watchlist: 'قائمة المراقبة',
    alerts: 'التنبيهات',
    
    // Market data
    price: 'السعر',
    change: 'التغير',
    volume: 'الحجم',
    marketCap: 'القيمة السوقية',
    peRatio: 'مكرر الربحية',
    dividend: 'الأرباح الموزعة',
    
    // Actions
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    register: 'إنشاء حساب',
    search: 'بحث',
    filter: 'تصفية',
    export: 'تصدير',
    save: 'حفظ',
    cancel: 'إلغاء',
    
    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    noData: 'لا توجد بيانات',
    demo: 'تجريبي',
    source: 'المصدر',
    
    // Disclaimers
    notInvestmentAdvice: 'ليست نصيحة استثمارية. لأغراض المعلومات فقط.',
    demoDataWarning: 'هذه بيانات تجريبية فقط.',
  },
};

export function t(key: string, locale: string = 'en'): string {
  const keys = key.split('.');
  let value: any = translations[locale as 'en' | 'ar'] || translations.en;
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
}
