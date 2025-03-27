
// Database types for the data_sources table
export interface DataSourceRecord {
  id: string;
  name: string;
  type: string;
  data: Record<string, any>[];
  fields: string[];
  key_field: string;
  created_at?: string;
}
