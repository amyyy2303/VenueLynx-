import { create } from 'zustand';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'REGISTRAR' | 'SUPER_ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string | null;
  designation?: string | null;
}

export interface Venue {
  id: string;
  name: string;
  code: string;
  type: string;
  building: string;
  floor: string;
  roomNumber: string;
  capacity: number;
  facilities: string[];
  isAvailable?: boolean;
}

export interface Booking {
  id: string;
  venueId: string;
  userId: string;
  eventDate: string;
  timeFrom: string;
  timeTo: string;
  participants: number;
  purpose: string;
  remarks?: string;
  refreshments: boolean;
  paSystem: boolean;
  status: string;
  qrCode?: string;
  venue: Venue;
  user: {
    id: string;
    name: string;
    email: string;
    department?: string;
    designation?: string;
  };
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  eventDate: string;
  timeFrom: string;
  timeTo: string;
  participants: number;
  qrCode: string;
  venue: Venue;
  user: { name: string; department?: string };
  booking?: { purpose: string; remarks?: string };
}

type View = 'dashboard' | 'venues' | 'availability' | 'bookings' | 'approvals' | 'events' | 'analytics' | 'settings';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentView: View;
  sidebarOpen: boolean;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setCurrentView: (view: View) => void;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  currentView: 'dashboard',
  sidebarOpen: true,
  
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setCurrentView: (currentView) => set({ currentView }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  logout: () => {
    set({ user: null, isAuthenticated: false, currentView: 'dashboard' });
    fetch('/api/auth/logout', { method: 'POST' });
  },
}));
