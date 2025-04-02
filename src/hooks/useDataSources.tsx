
import { useState, useEffect } from 'react';
import { 
  DataSource, 
  DataSourceConfig, 
  FieldMapping,
  ReconciliationResult 
} from '@/types/dataSources';
import { sampleSources } from '@/data/sampleSources';
import { useMappings } from './useMappings';
import { useSourceManagement } from './useSourceManagement';
import { useReconciliation } from './useReconciliation';
import { useFileUpload } from './useFileUpload';
import { MappingTemplate } from '@/services/templatesService';

// Main hook that combines all data source functionality
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
  
  // Use our specialized hooks
  const { 
    reconciliationResults, 
    isReconciling, 
    reconcile: performReconcile,
    autoReconcile: performAutoReconcile,
    clearResults,
    setReconciliationResults,
    lastConfig
  } = useReconciliation();
  
  const {
    updateMapping,
    addMapping,
    removeMapping,
    swapMappingFields,
    updateKeyMapping,
    generateMappings,
    getAvailableFields
  } = useMappings(config, setConfig);
  
  const {
    setSourceA,
    setSourceB,
    addUploadedFileSource,
    loadDataSources
  } = useSourceManagement(config, setConfig, availableSources, setAvailableSources);
  
  const {
    addFileSourceAndReconcile
  } = useFileUpload(config, addUploadedFileSource, setSourceA, setSourceB, generateMappings, performAutoReconcile);

  // Load data sources from database on initial load
  useEffect(() => {
    loadDataSources();
  }, [loadDataSources]);

  // Wrapper around the reconcile function that uses the current config
  const reconcile = () => performReconcile(config);

  // Wrapper around the autoReconcile function that uses the current config
  const autoReconcile = () => performAutoReconcile(config);

  return {
    availableSources,
    config,
    reconciliationResults,
    isReconciling,
    lastConfig,
    setSourceA,
    setSourceB,
    updateMapping,
    addMapping,
    removeMapping,
    swapMappingFields,
    updateKeyMapping,
    reconcile,
    clearResults,
    autoReconcile,
    addUploadedFileSource,
    addFileSourceAndReconcile,
    generateMappings,
    loadDataSources,
    getAvailableFields,
    applyMappingTemplate: useMappingTemplate(config, setConfig)
  };
}

// This hook manages mapping templates
function useMappingTemplate(
  config: DataSourceConfig, 
  setConfig: React.Dispatch<React.SetStateAction<DataSourceConfig>>
) {
  return (template: MappingTemplate) => {
    if (!template || !template.config) {
      console.error("Invalid template data");
      return;
    }

    try {
      const { mappings, keyMapping } = template.config;
      
      // Update mappings if available
      if (Array.isArray(mappings) && mappings.length > 0) {
        const formattedMappings: FieldMapping[] = mappings.map(field => ({
          sourceFieldA: field.sourceFieldA,
          sourceFieldB: field.sourceFieldB,
          displayName: field.displayName,
        }));
        
        // Update key mapping if available
        const updatedKeyMapping = keyMapping ? {
          sourceAField: keyMapping.sourceAField || '',
          sourceBField: keyMapping.sourceBField || '',
        } : config.keyMapping;
        
        // Update config with template data
        setConfig(prevConfig => ({
          ...prevConfig,
          mappings: formattedMappings,
          keyMapping: updatedKeyMapping,
        }));
      }
    } catch (error) {
      console.error("Error applying mapping template:", error);
    }
  };
}

// Re-export types from types/dataSources.ts for components that import from this file
export type { DataSource, DataSourceConfig, FieldMapping, ReconciliationResult } from '@/types/dataSources';
