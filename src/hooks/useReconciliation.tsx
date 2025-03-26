
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
    
    try {
      setIsReconciling(true);
      
      // Get results synchronously first
      const results = performReconciliation(config);
      
      // Important: Set results immediately instead of clearing first
      setReconciliationResults(results);
      
      toast.success(`Reconciliation complete: ${results.length} records processed`);
      
      // Log to make debugging easier
      console.log("Reconciliation completed with", results.length, "records");
    } catch (error) {
      console.error("Reconciliation error:", error);
      toast.error("Failed to reconcile data sources");
    } finally {
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
