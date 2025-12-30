import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function MarketPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Markets</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Market indices and live data will appear here.</p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
