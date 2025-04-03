
import { useCallback } from 'react';
import { DataSource, DataSourceConfig } from '@/types/dataSources';

// This hook handles file upload and integration with data sources
export function useFileUpload(
  config: DataSourceConfig,
  addUploadedFileSource: (data: Record<string, any>[], fileName: string) => Promise<DataSource | undefined>,
  setSourceA: (source: DataSource | null) => void,
  setSourceB: (source: DataSource | null) => void,
  generateMappings: (sourceA: DataSource, sourceB: DataSource) => any[]
) {
  // Add a file source and optionally set it as source A or B
  const addFileSourceAndReconcile = useCallback(async (
    data: Record<string, any>[], 
    fileName: string,
    setAs?: 'sourceA' | 'sourceB' | 'auto'
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
      if (setAs === 'sourceA' || (setAs === 'auto' && !config.sourceA)) {
        console.log("Setting as source A:", newSource.name);
        setSourceA(newSource);
      } 
      else if (setAs === 'sourceB' || (setAs === 'auto' && !config.sourceB && config.sourceA)) {
        console.log("Setting as source B:", newSource.name);
        setSourceB(newSource);
      }
      
      return newSource;
    } catch (error) {
      console.error("Error in addFileSourceAndReconcile:", error);
      return null;
    }
  }, [addUploadedFileSource, setSourceA, setSourceB, config]);

  return {
    addFileSourceAndReconcile
  };
}
