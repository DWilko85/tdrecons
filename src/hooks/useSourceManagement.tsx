
import { useCallback } from 'react';
import { DataSource, DataSourceConfig } from '@/types/dataSources';
import { generateDefaultMappings } from '@/utils/mappingUtils';
import { createUploadedFileSource } from '@/utils/fileUploadUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  // Add a new uploaded file as a data source and save to database
  const addUploadedFileSource = useCallback(async (data: Record<string, any>[], fileName: string) => {
    const newSource = createUploadedFileSource(data, fileName);
    
    if (newSource) {
      try {
        // Save data source to database
        const { error } = await supabase.from('data_sources').insert({
          name: newSource.name,
          type: newSource.type,
          data: JSON.stringify(newSource.data),
          fields: newSource.fields,
          key_field: newSource.keyField
        });
        
        if (error) {
          console.error("Error saving data source to database:", error);
          toast.error("Failed to save data source to database");
        } else {
          console.log("Data source saved to database successfully:", newSource.name);
          toast.success("Data source saved to database");
        }
      } catch (err) {
        console.error("Error in database operation:", err);
      }
      
      // Add to available sources
      setAvailableSources(prevSources => [...prevSources, newSource]);
      // Return the new source in case we want to immediately use it
      return newSource;
    }
    
    return undefined;
  }, [setAvailableSources]);

  // Load data sources from database
  const loadDataSources = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error loading data sources:", error);
        toast.error("Failed to load data sources");
        return;
      }
      
      if (data && data.length > 0) {
        console.log("Loaded data sources from database:", data.length);
        
        // Convert database format to DataSource format
        const loadedSources: DataSource[] = data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          data: typeof item.data === 'string' ? JSON.parse(item.data) : item.data,
          fields: item.fields,
          keyField: item.key_field
        }));
        
        // Add to available sources
        setAvailableSources(prevSources => {
          // Filter out duplicates by id
          const existingIds = new Set(prevSources.map(s => s.id));
          const newSources = loadedSources.filter(s => !existingIds.has(s.id));
          return [...prevSources, ...newSources];
        });
      }
    } catch (err) {
      console.error("Error parsing data sources:", err);
      toast.error("Failed to parse data sources");
    }
  }, [setAvailableSources]);

  return {
    setSourceA,
    setSourceB,
    addUploadedFileSource,
    loadDataSources
  };
}
