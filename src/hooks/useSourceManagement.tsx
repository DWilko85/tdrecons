
import { useCallback } from 'react';
import { DataSource, DataSourceConfig } from '@/types/dataSources';
import { generateDefaultMappings } from '@/utils/mappingUtils';
import { createUploadedFileSource } from '@/utils/fileUploadUtils';

export function useSourceManagement(
  config: DataSourceConfig,
  setConfig: React.Dispatch<React.SetStateAction<DataSourceConfig>>,
  availableSources: DataSource[],
  setAvailableSources: React.Dispatch<React.SetStateAction<DataSource[]>>
) {
  // Set data source A
  const setSourceA = useCallback((source: DataSource | null) => {
    if (source) {
      const newConfig = {
        ...config,
        sourceA: source,
        keyMapping: {
          ...config.keyMapping,
          sourceAField: source.keyField,
        }
      };
      
      // Update mappings if both sources are set
      if (newConfig.sourceB) {
        newConfig.mappings = generateDefaultMappings(source, newConfig.sourceB);
      }
      
      setConfig(newConfig);
    } else {
      setConfig({
        ...config,
        sourceA: null,
        mappings: [],
      });
    }
  }, [config, setConfig]);

  // Set data source B
  const setSourceB = useCallback((source: DataSource | null) => {
    if (source) {
      const newConfig = {
        ...config,
        sourceB: source,
        keyMapping: {
          ...config.keyMapping,
          sourceBField: source.keyField,
        }
      };
      
      // Update mappings if both sources are set
      if (newConfig.sourceA) {
        newConfig.mappings = generateDefaultMappings(newConfig.sourceA, source);
      }
      
      setConfig(newConfig);
    } else {
      setConfig({
        ...config,
        sourceB: null,
        mappings: [],
      });
    }
  }, [config, setConfig]);

  // Add a new uploaded file as a data source
  const addUploadedFileSource = useCallback((data: Record<string, any>[], fileName: string) => {
    const newSource = createUploadedFileSource(data, fileName);
    
    if (newSource) {
      // Add to available sources
      setAvailableSources(prevSources => [...prevSources, newSource]);
      // Return the new source in case we want to immediately use it
      return newSource;
    }
    
    return undefined;
  }, [setAvailableSources]);

  return {
    setSourceA,
    setSourceB,
    addUploadedFileSource,
  };
}
