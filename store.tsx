import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Event, Booking, Role } from './types';
import { db } from './firebase';
import { collection, addDoc, getDocs, doc, query, where, onSnapshot, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

// Mock Data with specific, high-quality images (Moved to a const but not used for initialization if DB has data)
export const MOCK_EVENTS: Event[] = [
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
  login: (mobile: string, name: string) => Promise<boolean>;
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
  const [events, setEvents] = useState<Event[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Initialize Data from Firestore
  useEffect(() => {
    // Real-time Events
    const unsubscribeEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
      if (eventsData.length === 0 && events.length === 0) {
        // seed option could go here, but avoiding auto-seed
        // Note: If you want to seed, you can uncomment this:
        // MOCK_EVENTS.forEach(evt => addDoc(collection(db, 'events'), evt));
      }
      setEvents(eventsData);
    });

    // Real-time Bookings (Fetch ALL bookings to support seat maps)
    const unsubscribeBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(bookingsData);
    });

    return () => {
      unsubscribeEvents();
      unsubscribeBookings();
    };
  }, []);

  // Restore session
  useEffect(() => {
    const savedUser = localStorage.getItem('gp_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      // We could verify validity here
    }
  }, []);

  // Fetch favorites when user changes
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    const userRef = doc(db, 'users', user.id);
    const unsubscribeUser = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setFavorites(userData.favorites || []);
      }
    });
    return () => unsubscribeUser();
  }, [user?.id]);

  const login = async (mobile: string, name: string): Promise<boolean> => {
    try {
      const role: Role = mobile === '9876543210' ? 'ADMIN' : 'USER';

      // Query if user exists by mobile
      const q = query(collection(db, 'users'), where('mobile', '==', mobile));
      const querySnapshot = await getDocs(q);

      let currentUser: User;

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        currentUser = { id: userDoc.id, name: userData.name, mobile: userData.mobile, role: userData.role || role };

        // Update name if changed
        if (currentUser.name !== name) {
          await updateDoc(doc(db, 'users', currentUser.id), { name });
          currentUser.name = name;
        }
      } else {
        // Create new user
        const newUserRef = await addDoc(collection(db, 'users'), {
          name,
          mobile,
          role,
          favorites: []
        });
        currentUser = { id: newUserRef.id, name, mobile, role };
      }

      setUser(currentUser);
      localStorage.setItem('gp_user', JSON.stringify(currentUser));
      return currentUser.role === 'ADMIN';
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gp_user');
  };

  const addEvent = async (eventData: Omit<Event, 'id' | 'totalSeats'>) => {
    const totalSeats = eventData.tiers.reduce((acc, tier) => acc + (tier.rows.length * 10), 0);
    const newEvent = {
      ...eventData,
      totalSeats
    };
    await addDoc(collection(db, 'events'), newEvent);
  };

  const updateEvent = async (updatedEvent: Event) => {
    const totalSeats = updatedEvent.tiers.reduce((acc, tier) => acc + (tier.rows.length * 10), 0);
    const eventRef = doc(db, 'events', updatedEvent.id);
    // Destructure to avoid sending ID in data if not needed, but typical updateDoc handles it?
    // Firestore updateDoc takes partial data.
    const { id, ...data } = updatedEvent;
    await updateDoc(eventRef, { ...data, totalSeats });
  };

  const deleteEvent = async (id: string) => {
    await deleteDoc(doc(db, 'events', id));
  };

  const toggleFavorite = async (eventId: string) => {
    if (!user) return;
    const isFavorite = favorites.includes(eventId);
    const newFavorites = isFavorite
      ? favorites.filter(id => id !== eventId)
      : [...favorites, eventId];

    // Optimistic update
    setFavorites(newFavorites);

    const userRef = doc(db, 'users', user.id);
    await updateDoc(userRef, { favorites: newFavorites });
  };

  const bookEvent = async (eventId: string, tierName: 'Gold' | 'Silver' | 'Bronze', seats: string[], amount: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const newBooking: Omit<Booking, 'id'> = {
        eventId,
        userId: user.id,
        tierName,
        seats,
        totalAmount: amount,
        timestamp: new Date().toISOString(),
        status: 'CONFIRMED',
        qrCodeData: `GALAPASS-${eventId}-${user.id}-${Math.random().toString(36).substr(2, 5)}`
      };

      await addDoc(collection(db, 'bookings'), newBooking);
      return true;
    } catch (e) {
      console.error("Booking failed", e);
      return false;
    }
  };

  const cancelBooking = async (bookingId: string) => {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { status: 'REFUNDED' });
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
