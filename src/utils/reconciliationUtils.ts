
import { DataSourceConfig, ReconciliationResult } from "@/types/dataSources";

// Perform the reconciliation between the two sources
export const performReconciliation = (config: DataSourceConfig): ReconciliationResult[] => {
  if (!config.sourceA || !config.sourceB || config.mappings.length === 0) {
    throw new Error("Incomplete configuration for reconciliation");
  }
  
  const { sourceA, sourceB, mappings, keyMapping } = config;
  const results: ReconciliationResult[] = [];
  
  console.log("Starting reconciliation with:", {
    sourceA: sourceA.name,
    sourceARecords: sourceA.data.length,
    sourceB: sourceB.name,
    sourceBRecords: sourceB.data.length,
    keyMappingA: keyMapping.sourceAField,
    keyMappingB: keyMapping.sourceBField,
    mappingsCount: mappings.length
  });
  
  // Validate data and key fields
  if (!sourceA.data || sourceA.data.length === 0) {
    console.error("Source A has no data to reconcile");
    throw new Error("Source A has no data");
  }
  
  if (!sourceB.data || sourceB.data.length === 0) {
    console.error("Source B has no data to reconcile");
    throw new Error("Source B has no data");
  }
  
  // Debug the first few records to verify data
  console.log("Sample records from Source A:", sourceA.data.slice(0, 3));
  console.log("Sample records from Source B:", sourceB.data.slice(0, 3));
  
  // Create a map of source B items by key for quick lookup
  const sourceBMap = new Map(
    sourceB.data.map(item => {
      const key = item[keyMapping.sourceBField];
      if (key === undefined || key === null) {
        console.warn(`Item in source B is missing key field: ${keyMapping.sourceBField}`);
      }
      return [String(key), item];
    })
  );
  
  console.log(`Created sourceBMap with ${sourceBMap.size} entries`);
  
  // Process all items from source A
  sourceA.data.forEach(itemA => {
    const keyA = itemA[keyMapping.sourceAField];
    
    if (keyA === undefined || keyA === null) {
      console.warn(`Item in source A is missing key field: ${keyMapping.sourceAField}`);
      return;
    }
    
    const itemB = sourceBMap.get(String(keyA));
    
    if (itemB) {
      // Both sources have this item
      const fields = mappings.map(mapping => {
        const valueA = itemA[mapping.sourceFieldA];
        const valueB = itemB[mapping.sourceFieldB];
        const isMatching = compareValues(valueA, valueB);
        
        // Enhanced break information
        const breakReason = isMatching ? null : getBreakReason(valueA, valueB);
        
        return {
          name: mapping.displayName,
          valueA,
          valueB,
          matching: isMatching,
          breakReason,
          fieldA: mapping.sourceFieldA,
          fieldB: mapping.sourceFieldB
        };
      });
      
      // Determine if all fields match
      const hasAnyDifference = fields.some(field => !field.matching);
      
      results.push({
        key: String(keyA),
        sourceAData: itemA,
        sourceBData: itemB,
        fields,
        status: hasAnyDifference ? 'different' : 'matching',
        breaks: fields.filter(f => !f.matching).length
      });
      
      // Remove from map to track processed items
      sourceBMap.delete(String(keyA));
    } else {
      // Only in source A
      const fields = mappings.map(mapping => ({
        name: mapping.displayName,
        valueA: itemA[mapping.sourceFieldA],
        valueB: null,
        matching: false,
        breakReason: 'Missing in counterparty data',
        fieldA: mapping.sourceFieldA,
        fieldB: mapping.sourceFieldB
      }));
      
      results.push({
        key: String(keyA),
        sourceAData: itemA,
        sourceBData: null,
        fields,
        status: 'missing-b',
        breaks: fields.length
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
      breakReason: 'Missing in principal data',
      fieldA: mapping.sourceFieldA,
      fieldB: mapping.sourceFieldB
    }));
    
    results.push({
      key: String(keyB),
      sourceAData: null,
      sourceBData: itemB,
      fields,
      status: 'missing-a',
      breaks: fields.length
    });
  });
  
  console.log(`Reconciliation generated ${results.length} results with statuses:`, {
    matching: results.filter(r => r.status === 'matching').length,
    different: results.filter(r => r.status === 'different').length,
    missingA: results.filter(r => r.status === 'missing-a').length,
    missingB: results.filter(r => r.status === 'missing-b').length,
  });
  
  return results;
};

// Compare values with improved type handling
const compareValues = (valueA: any, valueB: any): boolean => {
  // Handle null/undefined cases
  if (valueA === null || valueA === undefined || valueB === null || valueB === undefined) {
    return valueA === valueB;
  }
  
  // Convert to strings for comparison (handles numbers, booleans, etc.)
  const strA = String(valueA).trim();
  const strB = String(valueB).trim();
  
  // Case insensitive comparison for strings
  return strA.toLowerCase() === strB.toLowerCase();
};

// Get detailed break reason
const getBreakReason = (valueA: any, valueB: any): string => {
  if (valueA === null || valueA === undefined) {
    return 'Principal value is empty';
  }
  
  if (valueB === null || valueB === undefined) {
    return 'Counterparty value is empty';
  }
  
  // Both have values but they don't match
  if (typeof valueA === 'number' && typeof valueB === 'number') {
    const diff = valueA - valueB;
    return `Value mismatch (difference: ${diff})`;
  }
  
  return 'Value mismatch';
};
