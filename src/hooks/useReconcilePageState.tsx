
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDataSources } from "@/hooks/useDataSources";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useReconcilePageState() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    config, 
    reconciliationResults,
    isReconciling,
    reconcile,
    lastConfig
  } = useDataSources();
  const [showLoadingState, setShowLoadingState] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const stats = {
    total: reconciliationResults.length,
    matching: reconciliationResults.filter(r => r.status === 'matching').length,
    different: reconciliationResults.filter(r => r.status === 'different').length,
    missingA: reconciliationResults.filter(r => r.status === 'missing-a').length,
    missingB: reconciliationResults.filter(r => r.status === 'missing-b').length,
  };

  const isPerfectMatch = reconciliationResults.length > 0 && 
    stats.matching === stats.total && 
    stats.different === 0 && 
    stats.missingA === 0 && 
    stats.missingB === 0;

  // Check for stored results on initial load
  useEffect(() => {
    const checkStoredResults = async () => {
      try {
        // Check if we have temporary results in sessionStorage
        const storedResults = sessionStorage.getItem('tempReconciliationResults');
        const storedConfig = sessionStorage.getItem('tempReconciliationConfig');
        
        if (storedResults && storedConfig && reconciliationResults.length === 0) {
          console.log("Found stored reconciliation results, loading from session storage");
          // We have stored results, no need to run reconciliation
          setInitialLoadDone(true);
        } else if (location.state?.runReconciliation === true && !initialLoadDone) {
          console.log("Running reconciliation due to explicit navigation request");
          if (config.sourceA && config.sourceB && config.mappings.length > 0) {
            handleReconcile();
          }
        }
      } catch (err) {
        console.error("Error checking stored results:", err);
      }
      setInitialLoadDone(true);
    };
    
    checkStoredResults();
  }, [location.state, initialLoadDone, reconciliationResults.length]);

  useEffect(() => {
    if (isReconciling) {
      setShowLoadingState(true);
    } else if (reconciliationResults.length > 0) {
      // Store results in sessionStorage
      try {
        const resultsJson = JSON.stringify(reconciliationResults);
        const configJson = JSON.stringify(config);
        sessionStorage.setItem('tempReconciliationResults', resultsJson);
        sessionStorage.setItem('tempReconciliationConfig', configJson);
        console.log("Stored reconciliation results in session storage");
      } catch (err) {
        console.error("Failed to store results in session storage:", err);
      }
      setShowLoadingState(false);
    } else {
      const timeout = setTimeout(() => {
        setShowLoadingState(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [reconciliationResults, isReconciling, config]);

  useEffect(() => {
    console.log("Reconcile page state:", { 
      resultsLength: reconciliationResults?.length || 0,
      isReconciling,
      lastConfig: lastConfig ? {
        sourceA: lastConfig?.sourceA?.name || 'none',
        sourceB: lastConfig?.sourceB?.name || 'none',
        mappings: lastConfig?.mappings?.length || 0
      } : null,
      config: {
        sourceA: config?.sourceA?.name || 'none',
        sourceB: config?.sourceB?.name || 'none',
        mappings: config?.mappings?.length || 0
      }
    });
  }, [reconciliationResults, isReconciling, config, lastConfig]);

  const handleReconcile = () => {
    if (!config.sourceA || !config.sourceB) {
      toast.error("Please configure data sources first");
      navigate("/configure");
      return;
    }
    
    reconcile();
  };

  const saveReconciliation = async (name: string, description: string) => {
    if (!config.sourceA || !config.sourceB || reconciliationResults.length === 0) {
      toast.error("No reconciliation data to save");
      return;
    }

    try {
      setIsSaving(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        const anonymousId = localStorage.getItem('anonymousUserId') || 
                          crypto.randomUUID();
        localStorage.setItem('anonymousUserId', anonymousId);
        
        console.log("No authenticated session, using anonymous ID:", anonymousId);
        
        const resultsForDb = JSON.parse(JSON.stringify(reconciliationResults));

        console.log("Saving reconciliation with", reconciliationResults.length, "records as anonymous user");

        const { error } = await supabase.from('reconciliation_history').insert({
          name,
          description,
          source_a_name: config.sourceA.name,
          source_b_name: config.sourceB.name,
          total_records: stats.total,
          matching_records: stats.matching,
          different_records: stats.different,
          missing_a_records: stats.missingA,
          missing_b_records: stats.missingB,
          results: resultsForDb,
          user_id: anonymousId
        });

        if (error) {
          console.error("Error details:", error);
          throw error;
        }
      } else {
        const resultsForDb = JSON.parse(JSON.stringify(reconciliationResults));

        console.log("Saving reconciliation with", reconciliationResults.length, "records as authenticated user");

        const { error } = await supabase.from('reconciliation_history').insert({
          name,
          description,
          source_a_name: config.sourceA.name,
          source_b_name: config.sourceB.name,
          total_records: stats.total,
          matching_records: stats.matching,
          different_records: stats.different,
          missing_a_records: stats.missingA,
          missing_b_records: stats.missingB,
          results: resultsForDb,
          user_id: userId
        });

        if (error) {
          console.error("Error details:", error);
          throw error;
        }
      }

      toast.success("Reconciliation saved successfully");
      setSaveDialogOpen(false);
    } catch (error) {
      console.error("Error saving reconciliation:", error);
      toast.error("Failed to save reconciliation");
    } finally {
      setIsSaving(false);
    }
  };

  // Determine if we should show appropriate screens based on available data
  // Use the sessionStorage results if we don't have any in memory
  const hasStoredResults = () => {
    if (reconciliationResults.length > 0) return true;
    try {
      const storedResults = sessionStorage.getItem('tempReconciliationResults');
      return !!storedResults;
    } catch (e) {
      return false;
    }
  };

  const shouldShowNoConfigMessage = !config.sourceA || !config.sourceB || config.mappings.length === 0;
  const shouldShowNoResultsMessage = !isReconciling && !hasStoredResults() && !shouldShowNoConfigMessage;
  const shouldShowResults = reconciliationResults.length > 0 || hasStoredResults();
  const shouldShowLoading = isReconciling;

  return {
    config,
    reconciliationResults,
    isReconciling,
    saveDialogOpen,
    isSaving,
    showLoadingState,
    stats,
    isPerfectMatch,
    
    shouldShowNoConfigMessage,
    shouldShowNoResultsMessage,
    shouldShowResults,
    shouldShowLoading,
    
    setSaveDialogOpen,
    handleReconcile,
    saveReconciliation
  };
}
