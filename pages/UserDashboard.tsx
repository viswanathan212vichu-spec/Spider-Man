import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { Card, Badge, Button } from '../components/UI';
import { Search, MapPin, Calendar, ArrowRight, Filter, Heart, Monitor } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { events, favorites, toggleFavorite } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modeFilter, setModeFilter] = useState<'All' | 'In-Person' | 'Online'>('All');

  const categories = ['All', ...Array.from(new Set(events.map(e => e.category)))];

  const filteredEvents = useMemo(() => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      // Remove ended events
      if (eventDate < now) return false;

      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            event.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter;
      const matchesMode = modeFilter === 'All' || event.mode === modeFilter;
      
      return matchesSearch && matchesCategory && matchesMode;
    });
  }, [events, searchTerm, categoryFilter, modeFilter]);

  return (
    <div className="space-y-8">
      {/* Hero / Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
           <div>
             <h1 className="text-3xl font-bold text-slate-900">Discover Amazing Events</h1>
             <p className="text-slate-500">Book tickets for upcoming conferences, shows, and workshops.</p>
           </div>
           
           {/* Mode Toggles */}
           <div className="flex bg-slate-100 p-1 rounded-lg mt-4 md:mt-0">
             {['All', 'In-Person', 'Online'].map((m) => (
               <button
                 key={m}
                 onClick={() => setModeFilter(m as any)}
                 className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                   modeFilter === m 
                     ? 'bg-white text-indigo-600 shadow-sm' 
                     : 'text-slate-500 hover:text-slate-700'
                 }`}
               >
                 {m}
               </button>
             ))}
           </div>
        </div>
          
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none bg-white"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => {
          const isFavorite = favorites.includes(event.id);

          return (
            <Card key={event.id} className="flex flex-col h-full group hover:shadow-lg transition-all duration-300 relative">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(event.id); }}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
              >
                <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
              </button>

              <div className="relative h-48 overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex gap-2">
                   <Badge variant="neutral" className="shadow-sm backdrop-blur-md bg-white/90">
                      {event.mode}
                   </Badge>
                </div>
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {event.category}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">{event.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">{event.description}</p>
                
                <div className="mt-auto space-y-3">
                  <div className="flex items-center text-sm text-slate-500">
                    <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    {event.mode === 'Online' ? <Monitor className="h-4 w-4 mr-2 text-indigo-500" /> : <MapPin className="h-4 w-4 mr-2 text-indigo-500" />}
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500">Starting from</span>
                    <span className="text-lg font-bold text-slate-900">₹{Math.min(...event.tiers.map(t => t.price))}</span>
                  </div>
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700"
                    size="sm" 
                    onClick={() => window.location.hash = `#/event/${event.id}`}
                    icon={ArrowRight}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="col-span-full py-16 text-center">
             <div className="inline-flex items-center justify-center p-4 bg-slate-100 rounded-full mb-4">
                <Search className="h-8 w-8 text-slate-400" />
             </div>
             <p className="text-lg font-medium text-slate-900">No active events found.</p>
             <p className="text-slate-500">Try adjusting your filters or search terms.</p>
             <Button variant="ghost" className="mt-4" onClick={() => {setSearchTerm(''); setCategoryFilter('All'); setModeFilter('All')}}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
};
