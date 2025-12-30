import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getCompanies() {
  try {
    const result = await query(
      'SELECT ticker, name_en, name_ar, market, sector FROM companies ORDER BY ticker ASC'
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
}

export default async function CompaniesPage() {
  const companies = await getCompanies();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Companies</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {companies.map((company: any) => (
                <tr key={company.ticker} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/en/companies/${company.ticker}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {company.ticker}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{company.name_en}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{company.market}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{company.sector || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {companies.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No companies available yet.
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
