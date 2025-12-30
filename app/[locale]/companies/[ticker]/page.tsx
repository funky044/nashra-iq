import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { query } from '@/lib/db';
import { formatNumber, formatCurrency, formatLargeNumber, formatDate, t } from '@/lib/utils';
import { TrendingUp, TrendingDown, Building2, Globe, Users } from 'lucide-react';

// Force dynamic - this page needs database access
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCompanyData(ticker: string) {
  const result = await query(`
    SELECT * FROM companies WHERE ticker = $1
  `, [ticker]);
  
  if (result.rows.length === 0) return null;
  
  return result.rows[0];
}

async function getLatestPrice(companyId: number) {
  const result = await query(`
    SELECT * FROM prices_ohlc 
    WHERE company_id = $1 
    ORDER BY trade_date DESC 
    LIMIT 1
  `, [companyId]);
  
  return result.rows[0] || null;
}

async function getPreviousPrice(companyId: number) {
  const result = await query(`
    SELECT * FROM prices_ohlc 
    WHERE company_id = $1 
    ORDER BY trade_date DESC 
    LIMIT 1 OFFSET 1
  `, [companyId]);
  
  return result.rows[0] || null;
}

async function getCompanyNews(companyId: number) {
  const result = await query(`
    SELECT n.*, nc.relevance_score
    FROM news_items n
    INNER JOIN news_companies nc ON n.id = nc.news_id
    WHERE nc.company_id = $1 AND n.is_published = true
    ORDER BY n.published_at DESC
    LIMIT 10
  `, [companyId]);
  
  return result.rows;
}

async function getFundamentals(companyId: number) {
  const result = await query(`
    SELECT * FROM fundamentals
    WHERE company_id = $1
    ORDER BY fiscal_year DESC, fiscal_quarter DESC
    LIMIT 4
  `, [companyId]);
  
  return result.rows;
}

export default async function CompanyPage({ 
  params 
}: { 
  params: { locale: string; ticker: string } 
}) {
  const { locale, ticker } = params;
  
  const company = await getCompanyData(ticker);
  
  if (!company) {
    notFound();
  }
  
  const [latestPrice, previousPrice, news, fundamentals] = await Promise.all([
    getLatestPrice(company.id),
    getPreviousPrice(company.id),
    getCompanyNews(company.id),
    getFundamentals(company.id),
  ]);
  
  const priceChange = latestPrice && previousPrice 
    ? parseFloat(latestPrice.close_price) - parseFloat(previousPrice.close_price)
    : 0;
  const priceChangePercent = latestPrice && previousPrice
    ? (priceChange / parseFloat(previousPrice.close_price)) * 100
    : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={locale} user={null} />
      
      <main className="flex-1 bg-neutral-50">
        {/* Company Header */}
        <div className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                  <h1 className="text-3xl font-bold text-neutral-900">
                    {locale === 'en' ? company.name_en : company.name_ar || company.name_en}
                  </h1>
                  <span className="badge-neutral text-lg">{company.ticker}</span>
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-neutral-600">
                  <span className="flex items-center space-x-1 rtl:space-x-reverse">
                    <Building2 className="w-4 h-4" />
                    <span>{company.sector}</span>
                  </span>
                  {company.industry && (
                    <span>{company.industry}</span>
                  )}
                  {company.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 rtl:space-x-reverse text-primary-600 hover:text-primary-700"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{t('website', locale)}</span>
                    </a>
                  )}
                </div>
              </div>
              
              {latestPrice && (
                <div className="text-right rtl:text-left">
                  <div className="text-3xl font-bold text-neutral-900">
                    {formatCurrency(parseFloat(latestPrice.close_price), 'SAR', locale)}
                  </div>
                  <div className={`flex items-center space-x-2 rtl:space-x-reverse mt-1 ${isPositive ? 'text-success-600' : 'text-danger-600'}`}>
                    {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    <span className="text-lg font-semibold">
                      {formatNumber(Math.abs(priceChange), locale, 2)} ({formatNumber(Math.abs(priceChangePercent), locale, 2)}%)
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {formatDate(latestPrice.trade_date, locale, 'long')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Metrics */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">{locale === 'en' ? 'Key Metrics' : 'المؤشرات الرئيسية'}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {latestPrice && (
                    <>
                      <div>
                        <div className="text-sm text-neutral-600">{locale === 'en' ? 'Open' : 'الافتتاح'}</div>
                        <div className="text-lg font-semibold">{formatNumber(parseFloat(latestPrice.open_price), locale, 2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-600">{locale === 'en' ? 'High' : 'الأعلى'}</div>
                        <div className="text-lg font-semibold">{formatNumber(parseFloat(latestPrice.high_price), locale, 2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-600">{locale === 'en' ? 'Low' : 'الأدنى'}</div>
                        <div className="text-lg font-semibold">{formatNumber(parseFloat(latestPrice.low_price), locale, 2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-600">{t('volume', locale)}</div>
                        <div className="text-lg font-semibold">{formatLargeNumber(parseInt(latestPrice.volume), locale)}</div>
                      </div>
                    </>
                  )}
                  {company.market_cap && (
                    <div>
                      <div className="text-sm text-neutral-600">{t('marketCap', locale)}</div>
                      <div className="text-lg font-semibold">{formatLargeNumber(parseFloat(company.market_cap), locale)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fundamentals */}
              {fundamentals.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">{locale === 'en' ? 'Financial Highlights' : 'أبرز البيانات المالية'}</h2>
                  <div className="overflow-x-auto">
                    <table className="table-auto">
                      <thead>
                        <tr>
                          <th>{locale === 'en' ? 'Period' : 'الفترة'}</th>
                          <th>{locale === 'en' ? 'Revenue' : 'الإيرادات'}</th>
                          <th>{locale === 'en' ? 'Net Income' : 'صافي الدخل'}</th>
                          <th>{locale === 'en' ? 'EPS' : 'ربحية السهم'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fundamentals.map((fund: any, index: number) => (
                          <tr key={index}>
                            <td className="font-medium">
                              {fund.period_type === 'quarterly' ? 'Q' : 'FY'}{fund.fiscal_quarter || ''} {fund.fiscal_year}
                            </td>
                            <td>{formatLargeNumber(parseFloat(fund.revenue), locale)}</td>
                            <td>{formatLargeNumber(parseFloat(fund.net_income), locale)}</td>
                            <td>{formatNumber(parseFloat(fund.eps), locale, 2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* News */}
              {news.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">{t('news', locale)}</h2>
                  <div className="space-y-4">
                    {news.map((item: any) => (
                      <div key={item.id} className="pb-4 border-b border-neutral-200 last:border-0">
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {locale === 'en' ? item.title_en : item.title_ar || item.title_en}
                        </h3>
                        <p className="text-sm text-neutral-700 mb-2">
                          {locale === 'en' ? item.summary_en : item.summary_ar || item.summary_en}
                        </p>
                        <div className="text-xs text-neutral-500">
                          {t('source', locale)}: {item.source_name} • {formatDate(item.published_at, locale)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Company Info */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4">{locale === 'en' ? 'Company Information' : 'معلومات الشركة'}</h3>
                <div className="space-y-3 text-sm">
                  {company.founded_year && (
                    <div>
                      <div className="text-neutral-600">{locale === 'en' ? 'Founded' : 'تأسست'}</div>
                      <div className="font-medium">{company.founded_year}</div>
                    </div>
                  )}
                  {company.employees && (
                    <div>
                      <div className="text-neutral-600">{locale === 'en' ? 'Employees' : 'الموظفون'}</div>
                      <div className="font-medium">{formatNumber(company.employees, locale, 0)}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-neutral-600">{locale === 'en' ? 'Market' : 'السوق'}</div>
                    <div className="font-medium">{company.market}</div>
                  </div>
                  <div>
                    <div className="text-neutral-600">{locale === 'en' ? 'Sector' : 'القطاع'}</div>
                    <div className="font-medium">{company.sector}</div>
                  </div>
                </div>
              </div>

              {/* Demo Badge */}
              {process.env.ENABLE_DEMO_MODE === 'true' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="demo-badge mb-2">{t('demo', locale)}</div>
                  <p className="text-xs text-amber-800">
                    {t('demoDataWarning', locale)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer locale={locale} />
    </div>
  );
}
