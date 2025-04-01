
import { useCallback } from 'react';
import { DataSource, DataSourceConfig } from '@/types/dataSources';

// This hook handles file upload and integration with data sources
export function useFileUpload(
  config: DataSourceConfig,
  addUploadedFileSource: (data: Record<string, any>[], fileName: string) => Promise<DataSource | undefined>,
  setSourceA: (source: DataSource | null) => void,
  setSourceB: (source: DataSource | null) => void,
  generateMappings: (sourceA: DataSource, sourceB: DataSource) => any[],
  autoReconcile: (updatedConfig: DataSourceConfig) => boolean
) {
  // Add a file source and optionally set it as source A or B and auto-reconcile
  const addFileSourceAndReconcile = useCallback(async (
    data: Record<string, any>[], 
    fileName: string,
    setAs?: 'sourceA' | 'sourceB' | 'auto',
    autoRunReconciliation: boolean = false
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
    addFileSourceAndReconcile
  };
}
