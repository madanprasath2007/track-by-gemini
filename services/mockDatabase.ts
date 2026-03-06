
import { BusLocation, User, UserRole } from '../types';

/**
 * In a real production environment, this would be Firebase Realtime Database.
 * For this demo, we use BroadcastChannel to allow the "Driver" tab to update
 * the "Student" tab in real-time within the same browser session.
 */
const DB_CHANNEL = new BroadcastChannel('bus_tracking_channel');

type Listener = (location: BusLocation) => void;
const listeners: Set<Listener> = new Set();

DB_CHANNEL.onmessage = (event) => {
  if (event.data && event.data.type === 'BUS_UPDATE') {
    listeners.forEach((fn) => fn(event.data.payload));
  }
};

export const updateBusLocation = (location: BusLocation) => {
  DB_CHANNEL.postMessage({
    type: 'BUS_UPDATE',
    payload: location
  });
};

export const subscribeToBus = (busId: string, callback: Listener) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

// Fix: Properly type MOCK_USERS and use UserRole enum to match User interface
export const MOCK_USERS: User[] = [
  { uid: 'u1', name: 'Arun (Driver)', role: UserRole.DRIVER, busId: 'bus-01' },
  { uid: 'u2', name: 'Student 1', role: UserRole.STUDENT }
];
