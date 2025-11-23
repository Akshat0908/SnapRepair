import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  name: string;
  phone: string | null;
  is_expert: boolean;
  created_at: string;
};

export type Issue = {
  id: string;
  user_id: string;
  description: string;
  device_type: string;
  media_url: string;
  media_type: 'photo' | 'video';
  ai_diagnosis: string | null;
  status: 'open' | 'pending' | 'expert_reply' | 'payment_needed' | 'consultation_paid' | 'closed';
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  issue_id: string;
  sender: 'user' | 'expert' | 'system';
  text: string;
  attachment_url: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  issue_id: string;
  user_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_provider: string | null;
  provider_payment_id: string | null;
  created_at: string;
};

export type Feedback = {
  id: string;
  issue_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};
