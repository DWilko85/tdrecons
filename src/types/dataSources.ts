
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
  matchingRule?: MatchingRule;
}

export interface MatchingRule {
  type: 'exact' | 'fuzzy' | 'numeric' | 'date' | 'custom';
  // For fuzzy matching
  fuzzyThreshold?: number; // 0-1, where 1 is exact match
  // For numeric matching
  numericTolerance?: {
    type: 'absolute' | 'percentage';
    value: number;
  };
  // For date matching
  dateTolerance?: {
    days: number;
  };
  // For custom matching (future expansion)
  customRule?: string;
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
