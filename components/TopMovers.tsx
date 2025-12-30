'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatNumber, formatPercentage, cn } from '@/lib/utils';

interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface TopMoversProps {
  locale: string;
  gainers: Stock[];
  losers: Stock[];
}

export default function TopMovers({ locale, gainers, losers }: TopMoversProps) {
  const StockRow = ({ stock, isGainer }: { stock: Stock; isGainer: boolean }) => (
    <Link
      href={`/${locale}/companies/${stock.ticker}`}
      className="flex items-center justify-between py-3 px-4 hover:bg-neutral-50 rounded-lg transition-colors border border-transparent hover:border-neutral-200"
    >
      <div className="flex-1">
        <div className="font-semibold text-neutral-900">{stock.ticker}</div>
        <div className="text-sm text-neutral-600">{stock.name}</div>
      </div>
      <div className="text-right rtl:text-left">
        <div className="font-semibold text-neutral-900">
          {formatNumber(stock.price, locale, 2)}
        </div>
        <div className={cn('text-sm font-medium flex items-center space-x-1 rtl:space-x-reverse', isGainer ? 'text-success-600' : 'text-danger-600')}>
          {isGainer ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span>{formatPercentage(Math.abs(stock.changePercent), locale)}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top Gainers */}
      <div className="card">
        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4 pb-3 border-b border-neutral-200">
          <TrendingUp className="w-5 h-5 text-success-600" />
          <h3 className="text-lg font-semibold text-neutral-900">
            {locale === 'en' ? 'Top Gainers' : 'الأكثر ارتفاعاً'}
          </h3>
        </div>
        <div className="space-y-1">
          {gainers.map((stock, index) => (
            <StockRow key={index} stock={stock} isGainer={true} />
          ))}
        </div>
      </div>

      {/* Top Losers */}
      <div className="card">
        <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4 pb-3 border-b border-neutral-200">
          <TrendingDown className="w-5 h-5 text-danger-600" />
          <h3 className="text-lg font-semibold text-neutral-900">
            {locale === 'en' ? 'Top Losers' : 'الأكثر انخفاضاً'}
          </h3>
        </div>
        <div className="space-y-1">
          {losers.map((stock, index) => (
            <StockRow key={index} stock={stock} isGainer={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
