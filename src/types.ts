export interface CommunityEvent {
  id: string;
  title: string;
  theme: 'Festival de Inverno' | 'Cine Central' | 'Almoço Tropical' | 'Outro';
  description: string;
  date: string; // ISO format (e.g. 2026-07-20)
  revenue: number;
  expense: number;
  attendees: number;
  creatorUid: string;
  creatorEmail: string;
  calendarEventId?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
