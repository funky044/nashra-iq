import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function getCalendarEvents() {
  try {
    const result = await query(
      `SELECT ce.*, c.name_en, c.ticker
       FROM calendar_events ce
       LEFT JOIN companies c ON ce.company_id = c.id
       WHERE ce.event_date >= CURRENT_DATE
       ORDER BY ce.event_date ASC
       LIMIT 30`
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function CalendarPage() {
  const events = await getCalendarEvents();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Financial Calendar</h1>
        
        <div className="space-y-4">
          {events.map((event: any) => (
            <div key={event.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-blue-600 font-mono font-bold">{event.ticker}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.event_type === 'earnings' ? 'bg-blue-100 text-blue-800' :
                      event.event_type === 'dividend' ? 'bg-green-100 text-green-800' :
                      event.event_type === 'ipo' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {event.event_type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <div className="text-sm text-gray-500">
                    {new Date(event.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {events.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
              No upcoming events scheduled.
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
