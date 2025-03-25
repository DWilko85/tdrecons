
import { DataSource, FieldMapping } from "@/types/dataSources";

// Generate default mappings between sources
export const generateDefaultMappings = (sourceA: DataSource, sourceB: DataSource): FieldMapping[] => {
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
export const getDisplayName = (fieldA: string, fieldB: string): string => {
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

export const toTitleCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_([a-z])/g, (_, char) => ' ' + char.toUpperCase())
    .trim();
};
