
import { useState, useEffect, useCallback } from 'react';
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

// Re-export types with correct syntax
export type { 
  DataSource,
  DataSourceConfig,
  FieldMapping,
  ReconciliationResult
};

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
  
  // Use our new custom hooks
  const { 
    reconciliationResults, 
    isReconciling, 
    reconcile: performReconcile,
    setReconciliationResults
  } = useReconciliation();
  
  const {
    updateMapping,
    addMapping,
    removeMapping,
    updateKeyMapping
  } = useMappings(config, setConfig);
  
  const {
    setSourceA,
    setSourceB,
    addUploadedFileSource
  } = useSourceManagement(config, setConfig, availableSources, setAvailableSources);

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

  // Wrapper around the reconcile function that uses the current config
  const reconcile = useCallback(() => {
    console.log("Reconcile called with config:", {
      sourceA: config.sourceA?.name,
      sourceB: config.sourceB?.name,
      mappings: config.mappings.length
    });
    performReconcile(config);
  }, [config, performReconcile]);

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

// Need to re-import generateDefaultMappings here for the initial effect
import { generateDefaultMappings } from '@/utils/mappingUtils';
