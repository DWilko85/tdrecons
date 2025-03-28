
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { DataSourceConfig, ReconciliationResult } from '@/types/dataSources';
import { performReconciliation } from '@/utils/reconciliationUtils';

export function useReconciliation() {
  const [reconciliationResults, setReconciliationResults] = useState<ReconciliationResult[]>([]);
  const [isReconciling, setIsReconciling] = useState(false);
  const [lastConfig, setLastConfig] = useState<DataSourceConfig | null>(null);

  // Perform the reconciliation between the two sources
  const reconcile = useCallback((config: DataSourceConfig) => {
    if (!config.sourceA || !config.sourceB || config.mappings.length === 0) {
      toast.error("Please configure both data sources and field mappings");
      return Promise.resolve(false);
    }
    
    try {
      // Start reconciliation process
      setIsReconciling(true);
      setLastConfig(config);
      console.log("Starting reconciliation process with sources:", 
        config.sourceA.name, `(${config.sourceA.data.length} records)`, 
        "and", 
        config.sourceB.name, `(${config.sourceB.data.length} records)`
      );
      
      // Get results - this is a synchronous operation in the current implementation
      const results = performReconciliation(config);
      console.log("Reconciliation completed with", results.length, "records");
      
      // Set results and update state
      setReconciliationResults(results);
      
      if (results.length > 0) {
        toast.success(`Reconciliation complete: ${results.length} records processed`);
        return Promise.resolve(true);
      } else {
        toast.warning("Reconciliation completed, but no results were found");
        return Promise.resolve(false);
      }
    } catch (error) {
      console.error("Reconciliation error:", error);
      toast.error("Failed to reconcile data sources");
      return Promise.resolve(false);
    } finally {
      setIsReconciling(false);
    }
  }, []);

  // Function to clear results
  const clearResults = useCallback(() => {
    setReconciliationResults([]);
    setLastConfig(null);
  }, []);

  // Auto-reconcile when config changes if we have a previous config
  const autoReconcile = useCallback((config: DataSourceConfig) => {
    if (!config.sourceA || !config.sourceB || config.mappings.length === 0) {
      console.warn("Cannot auto-reconcile: incomplete configuration");
      return false;
    }

    console.log("Auto-reconciling with config:", {
      sourceA: config.sourceA.name,
      sourceB: config.sourceB.name,
      mappings: config.mappings.length,
      keyMappingA: config.keyMapping.sourceAField,
      keyMappingB: config.keyMapping.sourceBField
    });

    reconcile(config);
    return true;
  }, [reconcile]);

  return {
    reconciliationResults,
    isReconciling,
    reconcile,
    clearResults,
    autoReconcile,
    lastConfig,
    setReconciliationResults,
  };
}
