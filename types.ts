export type Role = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  mobile: string;
  role: Role;
}

export interface TicketTier {
  name: 'Gold' | 'Silver' | 'Bronze';
  price: number;
  rows: string[]; // e.g. ['A', 'B']
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  time: string;
  location: string;
  mode: 'In-Person' | 'Online';
  image: string;
  category: string;
  tiers: TicketTier[];
  totalSeats: number; // Calculated from tiers
}

export interface Seat {
  id: string; // e.g., "A1"
  row: string;
  number: number;
  status: 'AVAILABLE' | 'TAKEN' | 'SELECTED';
  tier: 'Gold' | 'Silver' | 'Bronze';
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  tierName: 'Gold' | 'Silver' | 'Bronze';
  seats: string[]; // ["A1", "A2"]
  totalAmount: number;
  timestamp: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  qrCodeData: string;
}
