
export enum UserRole {
  DRIVER = 'driver',
  STUDENT = 'student'
}

export interface User {
  uid: string;
  name: string;
  role: UserRole;
  busId?: string;
}

export interface BusLocation {
  lat: number;
  lng: number;
  updatedAt: number;
  status: 'running' | 'stopped' | 'idle';
  busId: string;
  driverName: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingUrls?: { title: string; uri: string }[];
}
