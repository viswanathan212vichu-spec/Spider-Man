import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Event, Booking, Role } from './types';

// Mock Data with specific, high-quality images
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Tech Innovation Summit 2024',
    description: 'Join industry leaders to discuss the future of AI and blockchain technology.',
    date: '2024-11-15',
    time: '09:00',
    location: 'Moscone Center, SF',
    mode: 'In-Person',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    category: 'Technology',
    tiers: [
      { name: 'Gold', price: 5000, rows: ['A', 'B'] },
      { name: 'Silver', price: 3000, rows: ['C', 'D'] },
      { name: 'Bronze', price: 1000, rows: ['E', 'F'] }
    ],
    totalSeats: 60
  },
  {
    id: '2',
    title: 'Global Jazz Festival',
    description: 'A weekend of smooth jazz and soul music featuring top international artists.',
    date: '2024-12-05',
    time: '18:00',
    location: 'Central Park, NY',
    mode: 'In-Person',
    image: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=800&q=80',
    category: 'Music',
    tiers: [
      { name: 'Gold', price: 2500, rows: ['A'] },
      { name: 'Silver', price: 1500, rows: ['B', 'C'] },
      { name: 'Bronze', price: 800, rows: ['D', 'E', 'F'] }
    ],
    totalSeats: 60
  },
  {
    id: '3',
    title: 'Startup Pitch Night Online',
    description: 'Watch 10 innovative startups pitch their ideas to top venture capitalists via Zoom.',
    date: '2024-10-20',
    time: '17:30',
    location: 'Zoom (Link provided after booking)',
    mode: 'Online',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80',
    category: 'Business',
    tiers: [
      { name: 'Gold', price: 500, rows: ['V'] }, // Virtual Rows
      { name: 'Silver', price: 250, rows: ['W'] },
      { name: 'Bronze', price: 100, rows: ['X'] }
    ],
    totalSeats: 100
  },
  {
    id: '4',
    title: 'Digital Art Workshop',
    description: 'Learn the basics of digital painting and character design from pros.',
    date: '2023-05-10', // Past event
    time: '10:00',
    location: 'Online',
    mode: 'Online',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
    category: 'Art',
    tiers: [
      { name: 'Gold', price: 1000, rows: ['A'] },
      { name: 'Silver', price: 500, rows: ['B'] },
      { name: 'Bronze', price: 200, rows: ['C'] }
    ],
    totalSeats: 30
  }
];

interface AppContextType {
  user: User | null;
  events: Event[];
  bookings: Booking[];
  favorites: string[];
  login: (mobile: string, name: string) => boolean;
  logout: () => void;
  addEvent: (event: Omit<Event, 'id' | 'totalSeats'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  bookEvent: (eventId: string, tierName: 'Gold' | 'Silver' | 'Bronze', seats: string[], amount: number) => Promise<boolean>;
  cancelBooking: (bookingId: string) => void;
  toggleFavorite: (eventId: string) => void;
  getBookedSeats: (eventId: string) => string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Simulate local storage persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('gp_user');
    const savedFavs = localStorage.getItem('gp_favs');
    const savedBookings = localStorage.getItem('gp_bookings');
    
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    if (savedBookings) setBookings(JSON.parse(savedBookings));
  }, []);

  useEffect(() => {
    localStorage.setItem('gp_favs', JSON.stringify(favorites));
    localStorage.setItem('gp_bookings', JSON.stringify(bookings));
  }, [favorites, bookings]);

  const login = (mobile: string, name: string) => {
    // Admin Verification Logic
    const role: Role = mobile === '9876543210' ? 'ADMIN' : 'USER';
    
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      mobile,
      role,
    };
    setUser(newUser);
    localStorage.setItem('gp_user', JSON.stringify(newUser));
    return role === 'ADMIN';
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gp_user');
  };

  const addEvent = (eventData: Omit<Event, 'id' | 'totalSeats'>) => {
    // Calculate total seats based on row configuration (10 seats per row)
    const totalSeats = eventData.tiers.reduce((acc, tier) => acc + (tier.rows.length * 10), 0);
    
    const newEvent: Event = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      totalSeats
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const updateEvent = (updatedEvent: Event) => {
    const totalSeats = updatedEvent.tiers.reduce((acc, tier) => acc + (tier.rows.length * 10), 0);
    const eventWithSeats = { ...updatedEvent, totalSeats };
    setEvents(prev => prev.map(e => e.id === updatedEvent.id ? eventWithSeats : e));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const bookEvent = async (eventId: string, tierName: 'Gold' | 'Silver' | 'Bronze', seats: string[], amount: number): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!user) {
          resolve(false);
          return;
        }

        const newBooking: Booking = {
          id: Math.random().toString(36).substr(2, 9),
          eventId,
          userId: user.id,
          tierName,
          seats,
          totalAmount: amount,
          timestamp: new Date().toISOString(),
          status: 'CONFIRMED',
          qrCodeData: `GALAPASS-${eventId}-${user.id}-${Math.random().toString(36).substr(2, 5)}`
        };

        setBookings(prev => [...prev, newBooking]);
        resolve(true);
      }, 2000); // Simulate network/payment delay
    });
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => 
      b.id === bookingId ? { ...b, status: 'REFUNDED' } : b
    ));
  };

  const getBookedSeats = (eventId: string) => {
    return bookings
      .filter(b => b.eventId === eventId && b.status === 'CONFIRMED')
      .flatMap(b => b.seats);
  };

  return (
    <AppContext.Provider value={{ 
      user, events, bookings, favorites, login, logout, addEvent, updateEvent, deleteEvent, 
      bookEvent, cancelBooking, toggleFavorite, getBookedSeats 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useStore must be used within AppProvider');
  return context;
};
