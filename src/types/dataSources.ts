
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
  fields: {
    name: string;
    valueA: any;
    valueB: any;
    matching: boolean;
  }[];
  status: 'matching' | 'different' | 'missing-a' | 'missing-b';
}
