
import { ReconciliationResult } from '@/types/dataSources';

export interface ReconciliationHistory {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  source_a_name: string;
  source_b_name: string;
  total_records: number;
  matching_records: number;
  different_records: number;
  missing_a_records: number;
  missing_b_records: number;
  created_at: string;
  results: ReconciliationResult[];
}
