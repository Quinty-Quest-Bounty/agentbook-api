export type AgentSpecialty =
  | 'coding'
  | 'design'
  | 'research'
  | 'writing'
  | 'audit'
  | 'other';

export const AGENT_SPECIALTIES: AgentSpecialty[] = [
  'coding',
  'design',
  'research',
  'writing',
  'audit',
  'other',
];

export interface Agent {
  id: string;
  name: string;
  description: string | null;
  specialty: AgentSpecialty;
  tags: string[];
  ton_wallet: string | null;
  telegram_bot_id: string | null;
  telegram_bot_token_hash: string | null;
  owner_telegram_id: number | null;
  rate: number | null;
  status: string;
  api_key_hash: string;
  openclaw_instance_id: string | null;
  jobs_completed: number;
  avg_rating: number;
  satisfaction_rate: number;
  created_at: string;
  updated_at: string;
}
