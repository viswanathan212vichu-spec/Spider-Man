import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Event interface
export interface Event {
    id?: string;
    title: string;
    description: string;
    date: Timestamp | Date;
    venue: string;
    price: number;
    capacity: number;
    bookedCount: number;
    imageUrl?: string;
    createdBy: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    status: 'active' | 'cancelled' | 'completed';
}

// Create a new event (Admin only)
export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'bookedCount'>, adminUid: string): Promise<Event> => {
    try {
        const docRef = await addDoc(collection(db, 'events'), {
            ...eventData,
            createdBy: adminUid,
            bookedCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return {
            id: docRef.id,
            ...eventData,
            bookedCount: 0,
            createdBy: adminUid
        };
    } catch (error) {
        console.error('Error creating event:', error);
        throw error;
    }
};

// Get all events (optionally filtered by status)
export const getEvents = async (statusFilter?: 'active' | 'cancelled' | 'completed'): Promise<Event[]> => {
    try {
        let q;

        if (statusFilter) {
            q = query(
                collection(db, 'events'),
                where('status', '==', statusFilter),
                orderBy('date', 'asc')
            );
        } else {
            q = query(
                collection(db, 'events'),
                orderBy('date', 'asc')
            );
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Event));
    } catch (error) {
        console.error('Error getting events:', error);
        throw error;
    }
};

// Get a single event by ID
export const getEventById = async (eventId: string): Promise<Event | null> => {
    try {
        const docSnap = await getDoc(doc(db, 'events', eventId));

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Event;
        }
        return null;
    } catch (error) {
        console.error(`Error getting event ${eventId}:`, error);
        throw error;
    }
};

// Update an event (Admin only)
export const updateEvent = async (eventId: string, eventData: Partial<Event>): Promise<void> => {
    try {
        // Remove fields that shouldn't be updated directly
        const { id, createdAt, createdBy, ...updateData } = eventData;

        await updateDoc(doc(db, 'events', eventId), {
            ...updateData,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error(`Error updating event ${eventId}:`, error);
        throw error;
    }
};

// Delete an event (Admin only)
export const deleteEvent = async (eventId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
        console.error(`Error deleting event ${eventId}:`, error);
        throw error;
    }
};

// Get available capacity for an event
export const getEventAvailability = async (eventId: string): Promise<number> => {
    try {
        const event = await getEventById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }
        return event.capacity - event.bookedCount;
    } catch (error) {
        console.error(`Error checking availability for event ${eventId}:`, error);
        throw error;
    }
};

// Increment booked count (called during booking)
export const incrementBookedCount = async (eventId: string, quantity: number): Promise<void> => {
    try {
        const event = await getEventById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }

        const newBookedCount = event.bookedCount + quantity;
        if (newBookedCount > event.capacity) {
            throw new Error('Not enough tickets available');
        }

        await updateDoc(doc(db, 'events', eventId), {
            bookedCount: newBookedCount,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error(`Error incrementing booked count for event ${eventId}:`, error);
        throw error;
    }
};
