
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
    autoReconcile,
    clearResults,
    setReconciliationResults,
    lastConfig
  } = useReconciliation();
  
  const {
    updateMapping,
    addMapping,
    removeMapping,
    updateKeyMapping,
    generateMappings
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
        mappings: generateMappings(sourceA, sourceB),
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
    
    // Perform the reconciliation with the current config
    return performReconcile(config);
  }, [config, performReconcile]);

  // Add a file source and optionally set it as source A or B and auto-reconcile
  // Modified to use a non-async implementation that returns DataSource (not Promise<DataSource>)
  const addFileSourceAndReconcile = useCallback((
    data: Record<string, any>[], 
    fileName: string,
    setAs?: 'sourceA' | 'sourceB' | 'auto',
    autoRunReconciliation: boolean = true
  ) => {
    const newSource = addUploadedFileSource(data, fileName);
    
    if (!newSource) return null;
    
    // Determine where to set the new source based on the setAs parameter
    if (setAs === 'sourceA' || (setAs === 'auto' && !config.sourceA)) {
      setSourceA(newSource);
    } 
    else if (setAs === 'sourceB' || (setAs === 'auto' && !config.sourceB && config.sourceA)) {
      setSourceB(newSource);
    }
    
    // If both sources are now set, auto-reconcile if requested
    const updatedConfig = {
      ...config,
      sourceA: setAs === 'sourceA' ? newSource : config.sourceA,
      sourceB: setAs === 'sourceB' ? newSource : config.sourceB
    };
    
    if (autoRunReconciliation && updatedConfig.sourceA && updatedConfig.sourceB) {
      // We need to wait a bit for the state to update before reconciling
      setTimeout(() => {
        autoReconcile(updatedConfig);
      }, 100);
    }
    
    return newSource;
  }, [addUploadedFileSource, setSourceA, setSourceB, config, autoReconcile]);

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
    updateKeyMapping,
    reconcile,
    clearResults,
    autoReconcile,
    addUploadedFileSource,
    addFileSourceAndReconcile,
    generateMappings
  };
}

// Need to re-import generateDefaultMappings here for the initial effect
import { generateDefaultMappings } from '@/utils/mappingUtils';
