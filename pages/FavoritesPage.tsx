import React from 'react';
import { useStore } from '../store';
import { Card, Badge, Button } from '../components/UI';
import { Calendar, MapPin, ArrowRight, Heart, Monitor } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const { events, favorites, toggleFavorite } = useStore();

  const favoriteEvents = events.filter(event => favorites.includes(event.id));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-red-100 rounded-full">
            <Heart className="h-6 w-6 text-red-600 fill-red-600" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-slate-900">My Favorites</h1>
            <p className="text-slate-500">Events you have saved for later.</p>
        </div>
      </div>

      {favoriteEvents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
           <Heart className="h-12 w-12 mx-auto text-slate-300 mb-4" />
           <p className="text-slate-500 text-lg">You haven't added any favorites yet.</p>
           <Button className="mt-4" onClick={() => window.location.hash = '#/events'}>Browse Events</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteEvents.map(event => (
            <Card key={event.id} className="flex flex-col h-full group hover:shadow-lg transition-all duration-300 relative">
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavorite(event.id); }}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
                title="Remove from favorites"
              >
                <Heart className="h-5 w-5 fill-red-500 text-red-500" />
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
          ))}
        </div>
      )}
    </div>
  );
};