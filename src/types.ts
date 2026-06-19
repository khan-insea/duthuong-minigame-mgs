export interface Participant {
  id: string;
  name: string;
  code: string; // 6-digit number string
  avatar_url: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export type AppView = 'welcome' | 'grid';
