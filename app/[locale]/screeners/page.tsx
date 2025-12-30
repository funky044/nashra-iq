import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getScreenerPresets() {
  try {
    const result = await query(
      'SELECT * FROM screener_presets ORDER BY created_at DESC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching presets:', error);
    return [];
  }
}

export default async function ScreenersPage() {
  const presets = await getScreenerPresets();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Stock Screeners</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          {presets.map((preset: any) => (
            <div key={preset.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{preset.name}</h3>
              <p className="text-gray-600 mb-4">{preset.description}</p>
              
              <div className="bg-gray-50 rounded p-4 mb-4">
                <div className="text-xs font-medium text-gray-500 mb-2">Criteria:</div>
                <div className="space-y-1">
                  {Object.entries(preset.criteria).map(([key, value]) => (
                    <div key={key} className="text-sm text-gray-700">
                      <span className="font-medium">{key}:</span> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
              
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Run Screen
              </button>
            </div>
          ))}
          
          {presets.length === 0 && (
            <div className="col-span-2 bg-white rounded-lg shadow p-12 text-center text-gray-500">
              No screener presets available yet.
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
