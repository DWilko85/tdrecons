
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
    keyMappingB: keyMapping.sourceBField
  });
  
  // Create a map of source B items by key for quick lookup
  const sourceBMap = new Map(
    sourceB.data.map(item => {
      const key = item[keyMapping.sourceBField];
      return [key, item];
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
  
  console.log(`Reconciliation generated ${results.length} results with statuses:`, {
    matching: results.filter(r => r.status === 'matching').length,
    different: results.filter(r => r.status === 'different').length,
    missingA: results.filter(r => r.status === 'missing-a').length,
    missingB: results.filter(r => r.status === 'missing-b').length,
  });
  
  return results;
};
