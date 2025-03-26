
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { DataSourceConfig, ReconciliationResult } from '@/types/dataSources';
import { performReconciliation } from '@/utils/reconciliationUtils';

export function useReconciliation() {
  const [reconciliationResults, setReconciliationResults] = useState<ReconciliationResult[]>([]);
  const [isReconciling, setIsReconciling] = useState(false);

  // Perform the reconciliation between the two sources
  const reconcile = useCallback(async (config: DataSourceConfig) => {
    if (!config.sourceA || !config.sourceB || config.mappings.length === 0) {
      toast.error("Please configure both data sources and field mappings");
      return;
    }
    
    try {
      // Start reconciliation process
      setIsReconciling(true);
      console.log("Starting reconciliation process");
      
      // Get results
      const results = performReconciliation(config);
      console.log("Reconciliation completed with", results.length, "records");
      
      // Set results and update state
      setReconciliationResults(results);
      
      if (results.length > 0) {
        toast.success(`Reconciliation complete: ${results.length} records processed`);
      } else {
        toast.warning("Reconciliation completed, but no results were found");
      }
    } catch (error) {
      console.error("Reconciliation error:", error);
      toast.error("Failed to reconcile data sources");
      setReconciliationResults([]);
    } finally {
      setIsReconciling(false);
    }
  }, []);

  return {
    reconciliationResults,
    isReconciling,
    reconcile,
    setReconciliationResults,
  };
}
