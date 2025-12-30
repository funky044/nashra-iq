import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getNews() {
  try {
    const result = await query(
      `SELECT id, title_en, summary_en, published_at, source, sentiment 
       FROM news 
       ORDER BY published_at DESC 
       LIMIT 20`
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

export default async function NewsPage({ params }: { params: { locale: string } }) {
  const newsArticles = await getNews();

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={params.locale} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Latest News</h1>
        
        <div className="space-y-4">
          {newsArticles.map((article: any) => (
            <div key={article.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{article.title_en}</h2>
                  <p className="text-gray-600 mb-3">{article.summary_en}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{new Date(article.published_at).toLocaleDateString()}</span>
                    {article.sentiment && (
                      <>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          article.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                          article.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {article.sentiment}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {newsArticles.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              No news articles available yet.
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
