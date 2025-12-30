'use client';

import { ArrowUp, ArrowDown, TrendingUp, Activity } from 'lucide-react';
import { formatNumber, formatPercentage, cn } from '@/lib/utils';

interface MarketData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface MarketOverviewProps {
  locale: string;
  data: MarketData[];
}

export default function MarketOverview({ locale, data }: MarketOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {data.map((market, index) => {
        const isPositive = market.change >= 0;
        
        return (
          <div
            key={index}
            className="card-hover animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Activity className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-neutral-900">{market.name}</h3>
              </div>
              <span className={cn('text-xs px-2 py-0.5 rounded', isPositive ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700')}>
                {isPositive ? locale === 'en' ? 'Up' : 'صاعد' : locale === 'en' ? 'Down' : 'هابط'}
              </span>
            </div>
            
            <div className="mt-3">
              <div className="text-2xl font-bold text-neutral-900">
                {formatNumber(market.value, locale, 2)}
              </div>
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse mt-2">
                {isPositive ? (
                  <ArrowUp className="w-4 h-4 text-success-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-danger-600" />
                )}
                <span className={cn('text-sm font-medium', isPositive ? 'text-success-600' : 'text-danger-600')}>
                  {formatNumber(Math.abs(market.change), locale, 2)} ({formatPercentage(Math.abs(market.changePercent), locale)})
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
