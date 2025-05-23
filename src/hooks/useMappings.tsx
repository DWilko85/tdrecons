
import { useCallback } from 'react';
import { toast } from 'sonner';
import { FieldMapping, DataSource, DataSourceConfig } from '@/types/dataSources';
import { generateDefaultMappings, getDisplayName } from '@/utils/mappingUtils';

export function useMappings(
  config: DataSourceConfig,
  setConfig: React.Dispatch<React.SetStateAction<DataSourceConfig>>
) {
  // Update field mappings
  const updateMapping = useCallback((index: number, mapping: FieldMapping) => {
    const newMappings = [...config.mappings];
    newMappings[index] = mapping;
    setConfig({ ...config, mappings: newMappings });
  }, [config, setConfig]);

  // Add a new field mapping
  const addMapping = useCallback(() => {
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
  }, [config, setConfig]);

  // Remove a field mapping
  const removeMapping = useCallback((index: number) => {
    const newMappings = [...config.mappings];
    newMappings.splice(index, 1);
    setConfig({ ...config, mappings: newMappings });
  }, [config, setConfig]);

  // Swap fields between sourceA and sourceB for a mapping
  const swapMappingFields = useCallback((index: number) => {
    const mapping = config.mappings[index];
    const newMapping: FieldMapping = {
      sourceFieldA: mapping.sourceFieldB,
      sourceFieldB: mapping.sourceFieldA,
      // Update display name based on the swapped fields
      displayName: getDisplayName(mapping.sourceFieldB, mapping.sourceFieldA),
    };
    
    const newMappings = [...config.mappings];
    newMappings[index] = newMapping;
    setConfig({ ...config, mappings: newMappings });
    
    toast.success("Fields swapped successfully");
  }, [config, setConfig]);

  // Update key mapping
  const updateKeyMapping = useCallback((sourceAField: string, sourceBField: string) => {
    setConfig({
      ...config,
      keyMapping: { sourceAField, sourceBField },
    });
  }, [config, setConfig]);

  // Generate mappings between two sources
  const generateMappings = useCallback((sourceA: DataSource, sourceB: DataSource) => {
    if (!sourceA || !sourceB) return [];
    return generateDefaultMappings(sourceA, sourceB);
  }, []);

  // Get available fields for source A and B
  const getAvailableFields = useCallback(() => {
    if (!config.sourceA || !config.sourceB) return { fieldsA: [], fieldsB: [] };
    
    return {
      fieldsA: config.sourceA.fields,
      fieldsB: config.sourceB.fields
    };
  }, [config.sourceA, config.sourceB]);

  return {
    updateMapping,
    addMapping,
    removeMapping,
    swapMappingFields,
    updateKeyMapping,
    generateMappings,
    getAvailableFields,
  };
}
