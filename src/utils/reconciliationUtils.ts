
import { DataSourceConfig, ReconciliationResult, MatchingRule } from "@/types/dataSources";

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
        console.warn(`Item in source B is missing key field: ${keyMapping.sourceBField}`, item);
        return [String(Math.random()), item]; // Use a random key if missing
      }
      return [String(key), item];
    })
  );
  
  console.log(`Created sourceBMap with ${sourceBMap.size} entries`);
  
  // Process all items from source A
  sourceA.data.forEach((itemA, indexA) => {
    const keyA = itemA[keyMapping.sourceAField];
    
    if (keyA === undefined || keyA === null) {
      console.warn(`Item in source A is missing key field: ${keyMapping.sourceAField}`, itemA);
      return;
    }
    
    const keyAStr = String(keyA);
    const itemB = sourceBMap.get(keyAStr);
    
    if (itemB) {
      // Both sources have this item
      const fields = mappings.map(mapping => {
        const valueA = itemA[mapping.sourceFieldA];
        const valueB = itemB[mapping.sourceFieldB];
        const isMatching = compareValuesWithRules(valueA, valueB, mapping.matchingRule);
        
        // Enhanced break information
        const breakReason = isMatching ? null : getBreakReason(valueA, valueB, mapping.matchingRule);
        
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
        key: keyAStr,
        sourceAData: itemA,
        sourceBData: itemB,
        fields,
        status: hasAnyDifference ? 'different' : 'matching',
        breaks: fields.filter(f => !f.matching).length
      });
      
      // Remove from map to track processed items
      sourceBMap.delete(keyAStr);
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
        key: keyAStr,
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

// Enhanced comparison function that uses matching rules
const compareValuesWithRules = (valueA: any, valueB: any, matchingRule?: MatchingRule): boolean => {
  // Handle null/undefined cases
  if (valueA === null || valueA === undefined || valueB === null || valueB === undefined) {
    return valueA === valueB;
  }
  
  // Use simple exact matching if no rule is defined
  if (!matchingRule || matchingRule.type === 'exact') {
    return compareExact(valueA, valueB);
  }
  
  // Apply the appropriate matching rule
  switch (matchingRule.type) {
    case 'fuzzy':
      return compareFuzzy(valueA, valueB, matchingRule.fuzzyThreshold || 0.8);
    case 'numeric':
      return compareNumeric(
        valueA, 
        valueB, 
        matchingRule.numericTolerance?.type || 'percentage',
        matchingRule.numericTolerance?.value || 1
      );
    case 'date':
      return compareDate(valueA, valueB, matchingRule.dateTolerance?.days || 1);
    case 'custom':
      // Future implementation
      return compareExact(valueA, valueB);
    default:
      return compareExact(valueA, valueB);
  }
};

// Basic exact comparison (original behavior)
const compareExact = (valueA: any, valueB: any): boolean => {
  // Convert to strings for comparison (handles numbers, booleans, etc.)
  const strA = String(valueA).trim();
  const strB = String(valueB).trim();
  
  // Case insensitive comparison for strings
  return strA.toLowerCase() === strB.toLowerCase();
};

// Fuzzy string comparison using Levenshtein distance
const compareFuzzy = (valueA: any, valueB: any, threshold: number): boolean => {
  const strA = String(valueA).trim().toLowerCase();
  const strB = String(valueB).trim().toLowerCase();
  
  if (strA === strB) return true; // Exact match
  
  // Calculate similarity (0-1)
  const similarity = 1 - (levenshteinDistance(strA, strB) / Math.max(strA.length, strB.length));
  
  return similarity >= threshold;
};

// Compare numeric values with tolerance
const compareNumeric = (valueA: any, valueB: any, toleranceType: 'absolute' | 'percentage', toleranceValue: number): boolean => {
  // Parse numeric values
  const numA = parseFloat(valueA);
  const numB = parseFloat(valueB);
  
  // If either is not a valid number
  if (isNaN(numA) || isNaN(numB)) {
    return false;
  }
  
  if (toleranceType === 'absolute') {
    return Math.abs(numA - numB) <= toleranceValue;
  } else {
    // Percentage tolerance
    // Avoid division by zero
    if (numA === 0 && numB === 0) return true;
    if (numA === 0 || numB === 0) return false;
    
    const percentDifference = Math.abs((numA - numB) / ((numA + numB) / 2)) * 100;
    return percentDifference <= toleranceValue;
  }
};

// Compare dates with day tolerance
const compareDate = (valueA: any, valueB: any, dayTolerance: number): boolean => {
  const dateA = new Date(valueA);
  const dateB = new Date(valueB);
  
  // If either is invalid date
  if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
    return false;
  }
  
  // Calculate difference in days
  const differenceInMilliseconds = Math.abs(dateA.getTime() - dateB.getTime());
  const differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);
  
  return differenceInDays <= dayTolerance;
};

// Levenshtein distance implementation for fuzzy matching
const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length;
  const n = str2.length;
  
  // Create the matrix
  let dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [];
    dp[i][0] = i;
  }
  
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // Deletion
        dp[i][j - 1] + 1, // Insertion
        dp[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  
  return dp[m][n];
};

// Enhanced break reason function
const getBreakReason = (valueA: any, valueB: any, matchingRule?: MatchingRule): string => {
  if (valueA === null || valueA === undefined) {
    return 'Principal value is empty';
  }
  
  if (valueB === null || valueB === undefined) {
    return 'Counterparty value is empty';
  }
  
  // Handle specific match types
  if (matchingRule) {
    switch (matchingRule.type) {
      case 'fuzzy':
        const strA = String(valueA).trim().toLowerCase();
        const strB = String(valueB).trim().toLowerCase();
        const similarity = 1 - (levenshteinDistance(strA, strB) / Math.max(strA.length, strB.length));
        return `Fuzzy match below threshold (similarity: ${(similarity * 100).toFixed(1)}%)`;
        
      case 'numeric':
        const numA = parseFloat(valueA);
        const numB = parseFloat(valueB);
        
        if (!isNaN(numA) && !isNaN(numB)) {
          const diff = numA - numB;
          const percentDiff = numA !== 0 ? (diff / numA) * 100 : 0;
          
          return `Numeric difference: ${diff.toFixed(2)} (${percentDiff.toFixed(2)}%)`;
        }
        break;
        
      case 'date':
        const dateA = new Date(valueA);
        const dateB = new Date(valueB);
        
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          const diffMs = dateA.getTime() - dateB.getTime();
          const diffDays = Math.abs(diffMs / (1000 * 60 * 60 * 24));
          
          return `Date difference: ${diffDays.toFixed(1)} days`;
        }
        break;
    }
  }
  
  // Default message
  if (typeof valueA === 'number' && typeof valueB === 'number') {
    const diff = valueA - valueB;
    return `Value mismatch (difference: ${diff})`;
  }
  
  return 'Value mismatch';
};
