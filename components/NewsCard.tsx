'use client';

import Link from 'next/link';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  source_name: string;
  original_url?: string;
  published_at: string;
  companies?: Array<{ ticker: string; name: string }>;
  ai_summary?: {
    text: string;
    confidence: number;
    sources: string[];
  };
}

interface NewsCardProps {
  locale: string;
  news: NewsItem;
  showAISummary?: boolean;
}

export default function NewsCard({ locale, news, showAISummary = false }: NewsCardProps) {
  return (
    <div className="card-hover">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-neutral-900 flex-1 line-clamp-2">
            {news.title}
          </h3>
          {news.original_url && (
            <a
              href={news.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 rtl:mr-2 rtl:ml-0 text-primary-600 hover:text-primary-700 flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Summary */}
        <p className="text-sm text-neutral-700 mb-3 line-clamp-3">
          {news.summary}
        </p>

        {/* AI Summary */}
        {showAISummary && news.ai_summary && (
          <div className="mb-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <div className="flex items-start space-x-2 rtl:space-x-reverse mb-2">
              <AlertCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-primary-900 mb-1">
                  {locale === 'en' ? 'AI Summary' : 'ملخص الذكاء الاصطناعي'}
                </div>
                <p className="text-sm text-primary-800">{news.ai_summary.text}</p>
              </div>
            </div>
            <div className="ai-confidence text-primary-700">
              {locale === 'en' ? 'Confidence' : 'الثقة'}: {(news.ai_summary.confidence * 100).toFixed(0)}%
            </div>
          </div>
        )}

        {/* Related Companies */}
        {news.companies && news.companies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {news.companies.map((company, index) => (
              <Link
                key={index}
                href={`/${locale}/companies/${company.ticker}`}
                className="badge-neutral hover:bg-neutral-200 transition-colors"
              >
                {company.ticker}
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-neutral-200">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span className="source-attribution">
              {locale === 'en' ? 'Source' : 'المصدر'}: {news.source_name}
            </span>
            <span>{getRelativeTime(news.published_at, locale)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
