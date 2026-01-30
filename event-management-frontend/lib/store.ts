import { create } from 'zustand';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface Profile {
  id: string;
  name: string;
}

export interface EventLog {
  id: string;
  timestamp: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface Event {
  id: string;
  title: string;
  profileIds: string[];
  startDate: string; // ISO string
  endDate: string; // ISO string
  timezone: string;
  createdAt: string;
  updatedAt: string;
  logs: EventLog[];
}

interface StoreState {
  // Profiles
  profiles: Profile[];
  addProfile: (name: string) => void;
  setProfiles: (profiles: Profile[]) => void;
  
  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'logs'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  getEventsByProfile: (profileId: string) => Event[];
  
  // User
  currentUserId: string | null;
  setCurrentUserId: (userId: string) => void;
  currentUserTimezone: string;
  setCurrentUserTimezone: (timezone: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useStore = create<StoreState>((set, get) => ({
  profiles: [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
  ],
  
  addProfile: (name: string) => {
    set((state) => ({
      profiles: [
        ...state.profiles,
        { id: generateId(), name },
      ],
    }));
  },

  setProfiles: (profiles: Profile[]) => {
    set({ profiles });
  },
  
  events: [],
  
  addEvent: (eventData) => {
    const newEvent: Event = {
      ...eventData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      logs: [],
    };
    set((state) => ({
      events: [...state.events, newEvent],
    }));
  },
  
  updateEvent: (id: string, updates: Partial<Event>) => {
    set((state) => {
      const eventIndex = state.events.findIndex(e => e.id === id);
      if (eventIndex === -1) return state;
      
      const oldEvent = state.events[eventIndex];
      const newEvent = { ...oldEvent, ...updates, updatedAt: new Date().toISOString() };
      
      // Create logs for changed fields
      const newLogs: EventLog[] = [...(oldEvent.logs || [])];
      if (oldEvent.title !== newEvent.title) {
        newLogs.push({
          id: generateId(),
          timestamp: new Date().toISOString(),
          field: 'title',
          oldValue: oldEvent.title,
          newValue: newEvent.title,
        });
      }
      if (oldEvent.startDate !== newEvent.startDate) {
        newLogs.push({
          id: generateId(),
          timestamp: new Date().toISOString(),
          field: 'startDate',
          oldValue: oldEvent.startDate,
          newValue: newEvent.startDate,
        });
      }
      if (oldEvent.endDate !== newEvent.endDate) {
        newLogs.push({
          id: generateId(),
          timestamp: new Date().toISOString(),
          field: 'endDate',
          oldValue: oldEvent.endDate,
          newValue: newEvent.endDate,
        });
      }
      
      newEvent.logs = newLogs;
      
      const updatedEvents = [...state.events];
      updatedEvents[eventIndex] = newEvent;
      
      return { events: updatedEvents };
    });
  },
  
  getEventsByProfile: (profileId: string) => {
    return get().events.filter(event => event.profileIds.includes(profileId));
  },
  
  currentUserId: null,
  setCurrentUserId: (userId: string) => {
    set({ currentUserId: userId });
  },
  
  currentUserTimezone: 'America/New_York',
  setCurrentUserTimezone: (timezone: string) => {
    set({ currentUserTimezone: timezone });
  },
}));
