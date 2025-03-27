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
    addUploadedFileSource,
    loadDataSources
  } = useSourceManagement(config, setConfig, availableSources, setAvailableSources);

  // Load data sources from database on initial load
  useEffect(() => {
    loadDataSources();
  }, [loadDataSources]);

  // Wrapper around the reconcile function that uses the current config
  const reconcile = useCallback(() => {
    console.log("Reconcile called with config:", {
      sourceA: config.sourceA?.name,
      sourceB: config.sourceB?.name,
      mappings: config.mappings.length,
      dataA: config.sourceA?.data.length,
      dataB: config.sourceB?.data.length
    });
    
    // Perform the reconciliation with the current config
    return performReconcile(config);
  }, [config, performReconcile]);

  // Add a file source and optionally set it as source A or B and auto-reconcile
  const addFileSourceAndReconcile = useCallback(async (
    data: Record<string, any>[], 
    fileName: string,
    setAs?: 'sourceA' | 'sourceB' | 'auto',
    autoRunReconciliation: boolean = true
  ): Promise<DataSource | null> => {
    if (!data || data.length === 0) {
      console.error("No data provided for file source");
      return null;
    }
    
    console.log(`Adding file source with ${data.length} records from ${fileName}`);
    
    try {
      const newSource = await addUploadedFileSource(data, fileName);
      
      if (!newSource) {
        console.error("Failed to create source from uploaded file");
        return null;
      }
      
      console.log("New source created:", newSource.name, "with", newSource.data.length, "records");
      
      // Determine where to set the new source based on the setAs parameter
      let updatedSourceA = config.sourceA;
      let updatedSourceB = config.sourceB;
      
      if (setAs === 'sourceA' || (setAs === 'auto' && !config.sourceA)) {
        updatedSourceA = newSource;
        console.log("Setting as source A:", newSource.name);
        setSourceA(newSource);
      } 
      else if (setAs === 'sourceB' || (setAs === 'auto' && !config.sourceB && config.sourceA)) {
        updatedSourceB = newSource;
        console.log("Setting as source B:", newSource.name);
        setSourceB(newSource);
      }
      
      // If both sources are now set, auto-reconcile if requested
      if (autoRunReconciliation && updatedSourceA && updatedSourceB) {
        console.log("Auto-reconciling with sources:", updatedSourceA.name, "and", updatedSourceB.name);
        
        // Create an updated config for reconciliation
        const updatedConfig = {
          ...config,
          sourceA: updatedSourceA,
          sourceB: updatedSourceB,
          // Ensure we have mappings
          mappings: config.mappings.length > 0 ? 
            config.mappings : 
            generateMappings(updatedSourceA, updatedSourceB),
          keyMapping: {
            sourceAField: config.keyMapping.sourceAField || updatedSourceA.keyField,
            sourceBField: config.keyMapping.sourceBField || updatedSourceB.keyField,
          }
        };
        
        // We need to wait a bit for the state to update before reconciling
        setTimeout(() => {
          console.log("Executing auto-reconcile with updated config");
          autoReconcile(updatedConfig);
        }, 300);
      }
      
      return newSource;
    } catch (error) {
      console.error("Error in addFileSourceAndReconcile:", error);
      return null;
    }
  }, [addUploadedFileSource, setSourceA, setSourceB, config, autoReconcile, generateMappings]);

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
    generateMappings,
    loadDataSources
  };
}
