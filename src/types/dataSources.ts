
export interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'json' | 'api' | 'uploaded';
  data: Record<string, any>[];
  fields: string[];
  keyField: string;
}

export interface FieldMapping {
  sourceFieldA: string;
  sourceFieldB: string;
  displayName: string;
}

export interface DataSourceConfig {
  sourceA: DataSource | null;
  sourceB: DataSource | null;
  mappings: FieldMapping[];
  keyMapping: {
    sourceAField: string;
    sourceBField: string;
  };
}

export interface ReconciliationResult {
  key: string;
  sourceAData?: Record<string, any> | null;
  sourceBData?: Record<string, any> | null;
  fields: {
    name: string;
    valueA: any;
    valueB: any;
    matching: boolean;
    breakReason?: string | null;
    fieldA?: string;
    fieldB?: string;
  }[];
  status: 'matching' | 'different' | 'missing-a' | 'missing-b';
  breaks?: number;
}
