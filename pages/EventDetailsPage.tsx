import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Event, Seat, TicketTier } from '../types';
import { Button, Card, Badge, Modal } from '../components/UI';
import { Calendar, MapPin, Clock, ArrowLeft, CheckCircle, Monitor, QrCode, Heart } from 'lucide-react';

export const EventDetailsPage: React.FC = () => {
  const { events, bookEvent, user, getBookedSeats, toggleFavorite, favorites } = useStore();
  const [event, setEvent] = useState<Event | null>(null);
  
  // Selection States
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  // Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');

  // Load Event
  useEffect(() => {
    const eventId = window.location.hash.split('/event/')[1];
    const found = events.find(e => e.id === eventId);
    if (found) {
      setEvent(found);
      // Default to Bronze or lowest price tier
      const lowestTier = [...found.tiers].sort((a,b) => a.price - b.price)[0];
      setSelectedTier(lowestTier);
    }
  }, [events]);

  if (!event) return <div className="text-center py-20">Event not found</div>;

  const isFavorite = favorites.includes(event.id);

  const handleBackClick = () => {
    if (user?.role === 'ADMIN') {
      window.location.hash = '#/admin';
    } else {
      window.location.hash = '#/events';
    }
  };

  const handleBookClick = () => {
    if (!user) {
      alert("Please login first.");
      window.location.hash = '#/';
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }
    setIsPaymentModalOpen(true);
    setBookingStatus('IDLE');
  };

  const confirmPayment = async () => {
    setBookingStatus('PROCESSING');
    if (!selectedTier) return;
    
    const totalAmount = selectedTier.price * selectedSeats.length;
    const success = await bookEvent(event.id, selectedTier.name, selectedSeats, totalAmount);
    
    setBookingStatus(success ? 'SUCCESS' : 'ERROR');
  };

  // --- Seat Generation Logic ---
  const renderSeatGrid = () => {
    if (!selectedTier) return null;
    
    const takenSeats = getBookedSeats(event.id);
    const seatsInRow = 10; // Fixed width for demo

    return (
      <div className="mt-4 overflow-x-auto pb-4">
        <div className="min-w-[300px] flex flex-col gap-2">
          {selectedTier.rows.map(rowLabel => (
            <div key={rowLabel} className="flex items-center gap-2 justify-center">
              <span className="w-6 text-xs font-bold text-slate-400">{rowLabel}</span>
              <div className="flex gap-2">
                {Array.from({ length: seatsInRow }).map((_, idx) => {
                  const seatId = `${rowLabel}${idx + 1}`;
                  const isTaken = takenSeats.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);

                  return (
                    <button
                      key={seatId}
                      disabled={isTaken}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedSeats(prev => prev.filter(s => s !== seatId));
                        } else {
                          setSelectedSeats(prev => [...prev, seatId]);
                        }
                      }}
                      title={`Seat ${seatId}`}
                      className={`
                        w-8 h-8 rounded-t-lg text-xs font-medium transition-all
                        ${isTaken 
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                          : isSelected
                            ? 'bg-indigo-600 text-white shadow-md transform scale-110'
                            : 'bg-white border border-slate-300 text-slate-600 hover:border-indigo-400'
                        }
                      `}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-6 text-xs text-slate-500">
           <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border border-slate-300 bg-white"></div> Available</div>
           <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-indigo-600"></div> Selected</div>
           <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-slate-200"></div> Booked</div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Button variant="ghost" size="sm" className="mb-6" onClick={handleBackClick} icon={ArrowLeft}>
        Back to Home
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 relative overflow-hidden">
              <div className="w-full md:w-1/3 h-48 relative rounded-xl overflow-hidden shrink-0 group">
                <img src={event.image} className="w-full h-full object-cover" alt={event.title} />
                <div className="absolute top-2 right-2 z-10">
                   <button 
                    onClick={() => toggleFavorite(event.id)}
                    className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
                  >
                    <Heart className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                  </button>
                </div>
              </div>
              <div className="flex-1">
                 <div className="flex gap-2 mb-2">
                   <Badge variant="neutral">{event.mode}</Badge>
                   <Badge variant="info">{event.category}</Badge>
                 </div>
                 <h1 className="text-3xl font-bold text-slate-900 mb-2">{event.title}</h1>
                 <p className="text-slate-600 mb-4">{event.description}</p>
                 
                 <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-indigo-500" /> {new Date(event.date).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-indigo-500" /> {event.time}</div>
                    <div className="flex items-center gap-2 col-span-2">
                      {event.mode === 'Online' ? <Monitor className="h-4 w-4 text-indigo-500" /> : <MapPin className="h-4 w-4 text-indigo-500" />} 
                      {event.location}
                    </div>
                 </div>
              </div>
           </div>

           {/* Ticket Tiers */}
           <Card className="p-6">
             <h3 className="text-lg font-bold text-slate-900 mb-4">1. Select Ticket Type</h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {event.tiers.map(tier => (
                 <div 
                   key={tier.name}
                   onClick={() => { setSelectedTier(tier); setSelectedSeats([]); }}
                   className={`
                     cursor-pointer p-4 rounded-xl border-2 transition-all text-center
                     ${selectedTier?.name === tier.name 
                       ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                       : 'border-slate-200 hover:border-slate-300'
                     }
                   `}
                 >
                   <h4 className={`font-bold ${tier.name === 'Gold' ? 'text-amber-600' : tier.name === 'Silver' ? 'text-slate-600' : 'text-orange-700'}`}>
                     {tier.name}
                   </h4>
                   <p className="text-2xl font-bold text-slate-900 mt-2">₹{tier.price}</p>
                   <p className="text-xs text-slate-500 mt-1">Rows: {tier.rows.join(', ')}</p>
                 </div>
               ))}
             </div>
           </Card>

           {/* Seat Selection */}
           <Card className="p-6">
             <h3 className="text-lg font-bold text-slate-900 mb-2">2. Select Seats</h3>
             <p className="text-sm text-slate-500 mb-4">Select your preferred seats for the {selectedTier?.name} tier.</p>
             <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-center">
                {renderSeatGrid()}
             </div>
             <div className="mt-4 text-center">
               <div className="w-2/3 mx-auto h-1 bg-slate-300 rounded-full mb-1"></div>
               <span className="text-xs text-slate-400 uppercase tracking-widest">Stage / Screen</span>
             </div>
           </Card>
        </div>

        {/* Right Column: Checkout */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="p-6 border-t-4 border-t-indigo-600">
              <h3 className="font-bold text-slate-900 mb-6">Booking Summary</h3>
              
              <div className="space-y-4 mb-6">
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Tier</span>
                   <span className="font-medium text-slate-900">{selectedTier?.name}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Seats</span>
                   <span className="font-medium text-slate-900">
                     {selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}
                   </span>
                 </div>
                 <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Price/Ticket</span>
                   <span className="font-medium text-slate-900">₹{selectedTier?.price || 0}</span>
                 </div>
                 <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                   <span className="font-bold text-slate-900">Total Amount</span>
                   <span className="text-2xl font-bold text-indigo-600">
                     ₹{(selectedTier?.price || 0) * selectedSeats.length}
                   </span>
                 </div>
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg" onClick={handleBookClick} disabled={selectedSeats.length === 0}>
                Proceed to Pay
              </Button>
              <p className="text-xs text-center text-slate-400 mt-3">
                Secure payment powered by QR Code simulation.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => bookingStatus !== 'PROCESSING' && setIsPaymentModalOpen(false)}
        title="Payment Gateway"
      >
        {bookingStatus === 'IDLE' && (
          <div className="flex flex-col items-center py-4">
             <p className="text-slate-600 mb-6 text-center">Scan the QR code below with any UPI app to pay <strong className="text-slate-900">₹{(selectedTier?.price || 0) * selectedSeats.length}</strong></p>
             
             <div className="bg-white p-4 rounded-xl border-2 border-dashed border-slate-300 mb-6 relative group">
                {/* Simulated QR Code */}
                <QrCode className="h-48 w-48 text-slate-800" />
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="font-bold text-slate-900">GalaPass UPI</span>
                </div>
             </div>

             <div className="w-full space-y-3">
               <Button className="w-full bg-green-600 hover:bg-green-700" onClick={confirmPayment}>
                 Simulate Successful Payment
               </Button>
               <Button variant="secondary" className="w-full" onClick={() => setIsPaymentModalOpen(false)}>
                 Cancel Transaction
               </Button>
             </div>
          </div>
        )}

        {bookingStatus === 'PROCESSING' && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <h3 className="text-lg font-semibold text-slate-900">Verifying Payment...</h3>
            <p className="text-slate-500">Please do not close this window.</p>
          </div>
        )}

        {bookingStatus === 'SUCCESS' && (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="bg-green-100 p-3 rounded-full mb-4">
               <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Booking Confirmed!</h3>
            <p className="text-slate-500 mt-2">Check 'My Tickets' for your pass.</p>
            <Button className="mt-6 w-full" onClick={() => { setIsPaymentModalOpen(false); window.location.hash = '#/my-tickets'; }}>
              View Ticket
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
