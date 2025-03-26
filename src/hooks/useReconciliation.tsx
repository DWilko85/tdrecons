
import { useState } from 'react';
import { toast } from 'sonner';
import { DataSourceConfig, ReconciliationResult } from '@/types/dataSources';
import { performReconciliation } from '@/utils/reconciliationUtils';

export function useReconciliation() {
  const [reconciliationResults, setReconciliationResults] = useState<ReconciliationResult[]>([]);
  const [isReconciling, setIsReconciling] = useState(false);

  // Perform the reconciliation between the two sources
  const reconcile = async (config: DataSourceConfig) => {
    if (!config.sourceA || !config.sourceB || config.mappings.length === 0) {
      toast.error("Please configure both data sources and field mappings");
      return;
    }
    
    setIsReconciling(true);
    
    try {
      // Add a small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const results = performReconciliation(config);
      
      // Clear any previous results and set the new ones
      setReconciliationResults([]);
      
      // Use setTimeout to ensure the UI updates properly
      setTimeout(() => {
        setReconciliationResults(results);
        toast.success(`Reconciliation complete: ${results.length} records processed`);
        setIsReconciling(false);
      }, 200);
    } catch (error) {
      console.error("Reconciliation error:", error);
      toast.error("Failed to reconcile data sources");
      setIsReconciling(false);
    }
  };

  return {
    reconciliationResults,
    isReconciling,
    reconcile,
    setReconciliationResults,
  };
}
