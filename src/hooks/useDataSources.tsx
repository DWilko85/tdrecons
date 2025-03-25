
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  DataSource, 
  DataSourceConfig, 
  FieldMapping,
  ReconciliationResult 
} from '@/types/dataSources';
import { sampleSources } from '@/data/sampleSources';
import { generateDefaultMappings, getDisplayName } from '@/utils/mappingUtils';
import { performReconciliation } from '@/utils/reconciliationUtils';
import { createUploadedFileSource } from '@/utils/fileUploadUtils';

export { 
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
  const [reconciliationResults, setReconciliationResults] = useState<ReconciliationResult[]>([]);
  const [isReconciling, setIsReconciling] = useState(false);

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

  // Add a new uploaded file as a data source
  const addUploadedFileSource = (data: Record<string, any>[], fileName: string) => {
    const newSource = createUploadedFileSource(data, fileName);
    
    if (newSource) {
      // Add to available sources
      setAvailableSources(prevSources => [...prevSources, newSource]);
      // Return the new source in case we want to immediately use it
      return newSource;
    }
    
    return undefined;
  };

  // Perform the reconciliation between the two sources
  const reconcile = () => {
    if (!config.sourceA || !config.sourceB || config.mappings.length === 0) {
      toast.error("Please configure both data sources and field mappings");
      return;
    }
    
    setIsReconciling(true);
    
    try {
      const results = performReconciliation(config);
      setReconciliationResults(results);
      toast.success(`Reconciliation complete: ${results.length} records processed`);
    } catch (error) {
      console.error("Reconciliation error:", error);
      toast.error("Failed to reconcile data sources");
    } finally {
      setIsReconciling(false);
    }
  };

  // Set data source A
  const setSourceA = (source: DataSource | null) => {
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
  };

  // Set data source B
  const setSourceB = (source: DataSource | null) => {
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
  };

  // Update field mappings
  const updateMapping = (index: number, mapping: FieldMapping) => {
    const newMappings = [...config.mappings];
    newMappings[index] = mapping;
    setConfig({ ...config, mappings: newMappings });
  };

  // Add a new field mapping
  const addMapping = () => {
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
  };

  // Remove a field mapping
  const removeMapping = (index: number) => {
    const newMappings = [...config.mappings];
    newMappings.splice(index, 1);
    setConfig({ ...config, mappings: newMappings });
  };

  // Update key mapping
  const updateKeyMapping = (sourceAField: string, sourceBField: string) => {
    setConfig({
      ...config,
      keyMapping: { sourceAField, sourceBField },
    });
  };

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
