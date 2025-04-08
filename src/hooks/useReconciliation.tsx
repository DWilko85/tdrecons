
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { DataSourceConfig, ReconciliationResult } from '@/types/dataSources';
import { performReconciliation } from '@/utils/reconciliationUtils';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export function useReconciliation() {
  const [reconciliationResults, setReconciliationResults] = useState<ReconciliationResult[]>([]);
  const [isReconciling, setIsReconciling] = useState(false);
  const [lastConfig, setLastConfig] = useState<DataSourceConfig | null>(null);

  // Perform the reconciliation between the two sources
  const reconcile = useCallback(async (config: DataSourceConfig) => {
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
        // Save results to database if user is authenticated
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user.id) {
          await saveResultsToDatabase(results, config, sessionData.session.user.id);
        } else {
          console.log("User not authenticated, skipping save to database");
          // Save temporarily in session storage
          sessionStorage.setItem('tempReconciliationResults', JSON.stringify(results));
        }
        
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

  // Save reconciliation results to database
  const saveResultsToDatabase = async (
    results: ReconciliationResult[], 
    config: DataSourceConfig,
    userId: string
  ) => {
    try {
      if (!config.sourceA || !config.sourceB) return;
      
      // Calculate stats
      const stats = {
        total: results.length,
        matching: results.filter(r => r.status === 'matching').length,
        different: results.filter(r => r.status === 'different').length,
        missingA: results.filter(r => r.status === 'missing-a').length,
        missingB: results.filter(r => r.status === 'missing-b').length,
      };
      
      // Generate a name based on the sources
      const reconciliationName = `${config.sourceA.name} to ${config.sourceB.name} reconciliation`;
      
      // Convert results to a JSON-compatible format using JSON.stringify and parse
      const jsonResults = JSON.parse(JSON.stringify(results)) as Json;
      
      // Save to reconciliation_history table
      const { error } = await supabase
        .from('reconciliation_history')
        .insert({
          name: reconciliationName,
          description: `Reconciliation of ${config.sourceA.name} (${stats.total} records) against ${config.sourceB.name}`,
          source_a_name: config.sourceA.name,
          source_b_name: config.sourceB.name,
          total_records: stats.total,
          matching_records: stats.matching,
          different_records: stats.different,
          missing_a_records: stats.missingA,
          missing_b_records: stats.missingB,
          results: jsonResults,
          user_id: userId
        });
      
      if (error) {
        console.error("Error saving reconciliation results:", error);
      } else {
        console.log("Reconciliation results saved to database");
      }
    } catch (err) {
      console.error("Error in saveResultsToDatabase:", err);
    }
  };

  // Function to clear results
  const clearResults = useCallback(() => {
    setReconciliationResults([]);
    setLastConfig(null);
    sessionStorage.removeItem('tempReconciliationResults');
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
