import { useState, useEffect } from 'react';
import { toast } from 'sonner';

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

// Sample data sources for demo
const sampleSources: DataSource[] = [
  {
    id: '1',
    name: 'Sales Data (CRM)',
    type: 'csv',
    keyField: 'orderId',
    fields: ['orderId', 'customer', 'product', 'amount', 'date', 'status'],
    data: [
      { orderId: 'ORD-001', customer: 'Acme Corp', product: 'Premium Plan', amount: 1299.99, date: '2023-06-15', status: 'Completed' },
      { orderId: 'ORD-002', customer: 'Globex Inc', product: 'Basic Plan', amount: 499.99, date: '2023-06-16', status: 'Pending' },
      { orderId: 'ORD-003', customer: 'Wayne Enterprises', product: 'Enterprise Plan', amount: 4999.99, date: '2023-06-18', status: 'Completed' },
      { orderId: 'ORD-004', customer: 'Stark Industries', product: 'Premium Plan', amount: 1299.99, date: '2023-06-20', status: 'Completed' },
      { orderId: 'ORD-005', customer: 'Daily Planet', product: 'Basic Plan', amount: 499.99, date: '2023-06-21', status: 'Failed' },
    ]
  },
  {
    id: '2',
    name: 'Financial Records (ERP)',
    type: 'json',
    keyField: 'reference',
    fields: ['reference', 'client', 'item', 'value', 'transaction_date', 'payment_status'],
    data: [
      { reference: 'ORD-001', client: 'Acme Corporation', item: 'Premium Subscription', value: 1299.99, transaction_date: '2023-06-15', payment_status: 'Paid' },
      { reference: 'ORD-002', client: 'Globex Inc', item: 'Basic Subscription', value: 499.99, transaction_date: '2023-06-16', payment_status: 'Unpaid' },
      { reference: 'ORD-003', client: 'Wayne Enterprises', item: 'Enterprise Subscription', value: 4999.99, transaction_date: '2023-06-18', payment_status: 'Paid' },
      { reference: 'ORD-006', client: 'LexCorp', item: 'Custom Solution', value: 9999.99, transaction_date: '2023-06-22', payment_status: 'Paid' },
      { reference: 'ORD-007', client: 'Oscorp', item: 'Basic Subscription', value: 499.99, transaction_date: '2023-06-24', payment_status: 'Unpaid' },
    ]
  },
  {
    id: '3',
    name: 'Inventory Records',
    type: 'api',
    keyField: 'sku',
    fields: ['sku', 'name', 'category', 'price', 'stock', 'lastUpdated'],
    data: [
      { sku: 'PROD-001', name: 'Smartphone X', category: 'Electronics', price: 999.99, stock: 45, lastUpdated: '2023-06-10' },
      { sku: 'PROD-002', name: 'Laptop Pro', category: 'Electronics', price: 1499.99, stock: 32, lastUpdated: '2023-06-12' },
      { sku: 'PROD-003', name: 'Wireless Earbuds', category: 'Electronics', price: 199.99, stock: 78, lastUpdated: '2023-06-14' },
      { sku: 'PROD-004', name: 'Smart Watch', category: 'Electronics', price: 299.99, stock: 56, lastUpdated: '2023-06-16' },
      { sku: 'PROD-005', name: 'Tablet Mini', category: 'Electronics', price: 399.99, stock: 23, lastUpdated: '2023-06-18' },
    ]
  },
];

export function useDataSources() {
  const [availableSources, setAvailableSources] = useState<DataSource[]>(sampleSources);
  const [config, setConfig] = useState<DataSourceConfig>({
    sourceA: null,
    sourceB: null,
    mappings: [],
    keyMapping: {
      sourceAField: '',
      sourceBField: '',
    },
  });
  const [reconciliationResults, setReconciliationResults] = useState<ReconciliationResult[]>([]);
  const [isReconciling, setIsReconciling] = useState(false);

  // Set initial sources for demo
  useEffect(() => {
    if (!config.sourceA && !config.sourceB && availableSources.length >= 2) {
      const sourceA = availableSources[0];
      const sourceB = availableSources[1];
      
      setConfig({
        sourceA,
        sourceB,
        mappings: generateDefaultMappings(sourceA, sourceB),
        keyMapping: {
          sourceAField: sourceA.keyField,
          sourceBField: sourceB.keyField,
        },
      });
    }
  }, [availableSources]);

  // Add a new uploaded file as a data source
  const addUploadedFileSource = (data: Record<string, any>[], fileName: string) => {
    if (!data || data.length === 0) {
      toast.error("No data found in the uploaded file");
      return;
    }
    
    // Generate a unique ID for the new source
    const id = `uploaded-${Date.now()}`;
    
    // Extract file format from filename
    const fileFormat = fileName.split('.').pop()?.toLowerCase() || 'unknown';
    const type = fileFormat === 'json' ? 'json' : fileFormat === 'csv' ? 'csv' : 'uploaded';
    
    // Extract fields from the first data item
    const fields = Object.keys(data[0]);
    
    if (fields.length === 0) {
      toast.error("Could not identify fields in the uploaded file");
      return;
    }
    
    // Try to guess a suitable key field (prefer fields with "id" in their name)
    const potentialKeyFields = fields.filter(field => 
      field.toLowerCase().includes('id') || 
      field.toLowerCase() === 'key' ||
      field.toLowerCase() === 'reference' ||
      field.toLowerCase() === 'code'
    );
    
    const keyField = potentialKeyFields.length > 0 ? potentialKeyFields[0] : fields[0];
    
    // Create the new data source
    const newSource: DataSource = {
      id,
      name: `Uploaded: ${fileName}`,
      type: type as 'csv' | 'json' | 'api' | 'uploaded',
      data,
      fields,
      keyField,
    };
    
    // Add to available sources
    setAvailableSources(prevSources => [...prevSources, newSource]);
    
    // Return the new source in case we want to immediately use it
    return newSource;
  };

  // Generate default mappings between sources
  const generateDefaultMappings = (sourceA: DataSource, sourceB: DataSource): FieldMapping[] => {
    const commonFields: FieldMapping[] = [];
    
    if (!sourceA || !sourceB) return [];
    
    // Try to find field matches based on similarity
    sourceA.fields.forEach(fieldA => {
      const normalizedFieldA = fieldA.toLowerCase();
      
      // Find the best matching field in source B
      let bestMatch = '';
      let bestScore = 0;
      
      sourceB.fields.forEach(fieldB => {
        const normalizedFieldB = fieldB.toLowerCase();
        let score = 0;
        
        // Exact match
        if (normalizedFieldA === normalizedFieldB) {
          score = 100;
        } 
        // Contains match
        else if (normalizedFieldA.includes(normalizedFieldB) || normalizedFieldB.includes(normalizedFieldA)) {
          score = 70;
        }
        // Semantic matches - handle common cases
        else {
          const semanticMatches: Record<string, string[]> = {
            'customer': ['client', 'buyer', 'purchaser'],
            'client': ['customer', 'buyer', 'purchaser'],
            'product': ['item', 'service', 'offering'],
            'item': ['product', 'service', 'offering'],
            'amount': ['value', 'price', 'cost', 'total'],
            'value': ['amount', 'price', 'cost', 'total'],
            'price': ['amount', 'value', 'cost', 'total'],
            'date': ['transaction_date', 'created', 'timestamp'],
            'status': ['payment_status', 'state', 'condition'],
          };
          
          // Check for semantic matches
          for (const [key, synonyms] of Object.entries(semanticMatches)) {
            if ((normalizedFieldA.includes(key) && synonyms.some(syn => normalizedFieldB.includes(syn))) || 
                (normalizedFieldB.includes(key) && synonyms.some(syn => normalizedFieldA.includes(syn)))) {
              score = 60;
              break;
            }
          }
        }
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = fieldB;
        }
      });
      
      // Add mapping if there's a reasonable match
      if (bestScore >= 60) {
        commonFields.push({
          sourceFieldA: fieldA,
          sourceFieldB: bestMatch,
          displayName: getDisplayName(fieldA, bestMatch),
        });
      }
    });
    
    return commonFields;
  };

  // Generate a human-readable display name for the mapping
  const getDisplayName = (fieldA: string, fieldB: string): string => {
    // If fields are identical, just use one
    if (fieldA.toLowerCase() === fieldB.toLowerCase()) {
      return toTitleCase(fieldA);
    }
    
    // Try to find the cleaner field name
    const fieldNameRegex = /^([a-z]+)(?:_([a-z]+))?$/i;
    const matchA = fieldA.match(fieldNameRegex);
    const matchB = fieldB.match(fieldNameRegex);
    
    if (matchA && !matchB) return toTitleCase(fieldA);
    if (matchB && !matchA) return toTitleCase(fieldB);
    
    // Return the shorter one or combine them
    return toTitleCase(fieldA.length <= fieldB.length ? fieldA : fieldB);
  };
  
  const toTitleCase = (str: string): string => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_([a-z])/g, (_, char) => ' ' + char.toUpperCase())
      .trim();
  };

  // Perform the reconciliation between the two sources
  const reconcile = () => {
    if (!config.sourceA || !config.sourceB || config.mappings.length === 0) {
      toast.error("Please configure both data sources and field mappings");
      return;
    }
    
    setIsReconciling(true);
    
    try {
      const { sourceA, sourceB, mappings, keyMapping } = config;
      const results: ReconciliationResult[] = [];
      
      // Create a map of source B items by key for quick lookup
      const sourceBMap = new Map(
        sourceB.data.map(item => [item[keyMapping.sourceBField], item])
      );
      
      // Process all items from source A
      sourceA.data.forEach(itemA => {
        const keyA = itemA[keyMapping.sourceAField];
        const itemB = sourceBMap.get(keyA);
        
        if (itemB) {
          // Both sources have this item
          const fields = mappings.map(mapping => {
            const valueA = itemA[mapping.sourceFieldA];
            const valueB = itemB[mapping.sourceFieldB];
            const isMatching = valueA === valueB;
            
            return {
              name: mapping.displayName,
              valueA,
              valueB,
              matching: isMatching,
            };
          });
          
          // Determine if all fields match
          const hasAnyDifference = fields.some(field => !field.matching);
          
          results.push({
            key: keyA,
            fields,
            status: hasAnyDifference ? 'different' : 'matching',
          });
          
          // Remove from map to track processed items
          sourceBMap.delete(keyA);
        } else {
          // Only in source A
          const fields = mappings.map(mapping => ({
            name: mapping.displayName,
            valueA: itemA[mapping.sourceFieldA],
            valueB: null,
            matching: false,
          }));
          
          results.push({
            key: keyA,
            fields,
            status: 'missing-b',
          });
        }
      });
      
      // Process remaining items from source B (those not in source A)
      sourceBMap.forEach((itemB, keyB) => {
        const fields = mappings.map(mapping => ({
          name: mapping.displayName,
          valueA: null,
          valueB: itemB[mapping.sourceFieldB],
          matching: false,
        }));
        
        results.push({
          key: keyB,
          fields,
          status: 'missing-a',
        });
      });
      
      setReconciliationResults(results);
      toast.success(`Reconciliation complete: ${results.length} records processed`);
    } catch (error) {
      console.error("Reconciliation error:", error);
      toast.error("Failed to reconcile data sources");
    } finally {
      setIsReconciling(false);
    }
  };

  // Set data source A
  const setSourceA = (source: DataSource | null) => {
    if (source) {
      const newConfig = {
        ...config,
        sourceA: source,
        keyMapping: {
          ...config.keyMapping,
          sourceAField: source.keyField,
        }
      };
      
      // Update mappings if both sources are set
      if (newConfig.sourceB) {
        newConfig.mappings = generateDefaultMappings(source, newConfig.sourceB);
      }
      
      setConfig(newConfig);
    } else {
      setConfig({
        ...config,
        sourceA: null,
        mappings: [],
      });
    }
  };

  // Set data source B
  const setSourceB = (source: DataSource | null) => {
    if (source) {
      const newConfig = {
        ...config,
        sourceB: source,
        keyMapping: {
          ...config.keyMapping,
          sourceBField: source.keyField,
        }
      };
      
      // Update mappings if both sources are set
      if (newConfig.sourceA) {
        newConfig.mappings = generateDefaultMappings(newConfig.sourceA, source);
      }
      
      setConfig(newConfig);
    } else {
      setConfig({
        ...config,
        sourceB: null,
        mappings: [],
      });
    }
  };

  // Update field mappings
  const updateMapping = (index: number, mapping: FieldMapping) => {
    const newMappings = [...config.mappings];
    newMappings[index] = mapping;
    setConfig({ ...config, mappings: newMappings });
  };

  // Add a new field mapping
  const addMapping = () => {
    if (!config.sourceA || !config.sourceB) return;
    
    // Find fields that aren't already mapped
    const usedFieldsA = new Set(config.mappings.map(m => m.sourceFieldA));
    const usedFieldsB = new Set(config.mappings.map(m => m.sourceFieldB));
    
    const availableFieldsA = config.sourceA.fields.filter(field => !usedFieldsA.has(field));
    const availableFieldsB = config.sourceB.fields.filter(field => !usedFieldsB.has(field));
    
    if (availableFieldsA.length === 0 || availableFieldsB.length === 0) {
      toast.info("All fields are already mapped");
      return;
    }
    
    const newMapping: FieldMapping = {
      sourceFieldA: availableFieldsA[0],
      sourceFieldB: availableFieldsB[0],
      displayName: getDisplayName(availableFieldsA[0], availableFieldsB[0]),
    };
    
    setConfig({
      ...config,
      mappings: [...config.mappings, newMapping],
    });
  };

  // Remove a field mapping
  const removeMapping = (index: number) => {
    const newMappings = [...config.mappings];
    newMappings.splice(index, 1);
    setConfig({ ...config, mappings: newMappings });
  };

  // Update key mapping
  const updateKeyMapping = (sourceAField: string, sourceBField: string) => {
    setConfig({
      ...config,
      keyMapping: { sourceAField, sourceBField },
    });
  };

  return {
    availableSources,
    config,
    reconciliationResults,
    isReconciling,
    setSourceA,
    setSourceB,
    updateMapping,
    addMapping,
    removeMapping,
    updateKeyMapping,
    reconcile,
    addUploadedFileSource,
  };
}
