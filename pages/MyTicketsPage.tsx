import React from 'react';
import { useStore } from '../store';
import { Card, Badge, Button } from '../components/UI';
import { QrCode, Calendar, MapPin, Download, XCircle } from 'lucide-react';

export const MyTicketsPage: React.FC = () => {
  const { bookings, events, cancelBooking } = useStore();
  
  // Filter bookings for current user is handled by store logic contextually usually, 
  // but here we filter by ID in the view since mock data is global.
  const { user } = useStore();
  const myBookings = bookings.filter(b => b.userId === user?.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const handleCancel = (bookingId: string) => {
    if (window.confirm("Are you sure? The amount will be refunded to your source account.")) {
      cancelBooking(bookingId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">My Tickets</h1>

      {myBookings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
           <QrCode className="h-12 w-12 mx-auto text-slate-300 mb-4" />
           <p className="text-slate-500 text-lg">You haven't booked any events yet.</p>
           <Button className="mt-4" onClick={() => window.location.hash = '#/events'}>Browse Events</Button>
        </div>
      ) : (
        myBookings.map(booking => {
          const event = events.find(e => e.id === booking.eventId);
          if (!event) return null;
          const isCancelled = booking.status === 'REFUNDED';
          
          return (
            <Card key={booking.id} className={`overflow-hidden flex flex-col md:flex-row ${isCancelled ? 'opacity-75 grayscale' : ''}`}>
              {/* Ticket Left: Event Info */}
              <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-200 border-dashed relative">
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
                     <p className="text-sm text-slate-500 mt-1">{booking.tierName} Ticket</p>
                   </div>
                   <Badge variant={isCancelled ? 'neutral' : 'success'}>
                     {booking.status}
                   </Badge>
                 </div>

                 <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-2">
                       <Calendar className="h-4 w-4" /> 
                       {new Date(event.date).toLocaleDateString()}
                    </div>
                     <div className="flex items-center gap-2">
                       <MapPin className="h-4 w-4" /> 
                       {event.location}
                    </div>
                 </div>

                 <div className="flex gap-2 text-xs font-mono bg-slate-100 p-2 rounded w-fit">
                    Seats: {booking.seats.join(', ')}
                 </div>

                 {/* Cutout circles for ticket effect */}
                 <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-slate-50 rounded-full hidden md:block"></div>
                 <div className="absolute -top-3 -right-3 w-6 h-6 bg-slate-50 rounded-full hidden md:block"></div>
              </div>

              {/* Ticket Right: QR & Actions */}
              <div className="w-full md:w-64 bg-slate-50 p-6 flex flex-col items-center justify-center gap-4">
                 {!isCancelled ? (
                   <>
                     <div className="bg-white p-2 rounded shadow-sm">
                       <QrCode className="h-24 w-24 text-slate-900" />
                     </div>
                     <p className="text-xs text-slate-400 font-mono text-center break-all">{booking.qrCodeData}</p>
                     
                     <div className="flex w-full gap-2">
                        <Button variant="ghost" size="sm" className="flex-1 text-xs" icon={Download}>Download</Button>
                        <Button variant="danger" size="sm" className="flex-1 text-xs" onClick={() => handleCancel(booking.id)}>Cancel</Button>
                     </div>
                   </>
                 ) : (
                   <div className="text-center">
                      <XCircle className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-slate-500">Refund Processed</p>
                      <p className="text-xs text-slate-400 mt-1">₹{booking.totalAmount} refunded to source.</p>
                   </div>
                 )}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
};
