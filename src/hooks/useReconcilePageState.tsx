
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
    reconcile
  } = useDataSources();
  const [showLoadingState, setShowLoadingState] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Calculate statistics from reconciliation results
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

  // Handle initial auto-reconciliation if directed from navigation
  useEffect(() => {
    const shouldRunReconciliation = location.state?.runReconciliation === true;
    
    if (!initialLoadDone && shouldRunReconciliation) {
      console.log("Running reconciliation due to explicit navigation request");
      if (config.sourceA && config.sourceB && config.mappings.length > 0) {
        handleReconcile();
      }
    }
    setInitialLoadDone(true);
  }, [location.state, initialLoadDone]);

  // Control loading state visibility
  useEffect(() => {
    if (isReconciling) {
      setShowLoadingState(true);
    } else if (reconciliationResults.length > 0) {
      setShowLoadingState(false);
    } else {
      const timeout = setTimeout(() => {
        setShowLoadingState(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [reconciliationResults, isReconciling]);

  // Log current state for debugging
  useEffect(() => {
    console.log("Reconcile page state:", { 
      resultsLength: reconciliationResults?.length || 0,
      isReconciling,
      config: {
        sourceA: config?.sourceA?.name || 'none',
        sourceB: config?.sourceB?.name || 'none',
        mappings: config?.mappings?.length || 0
      }
    });
  }, [reconciliationResults, isReconciling, config]);

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
      if (!sessionData.session) {
        toast.error("You must be logged in to save reconciliations");
        setSaveDialogOpen(false);
        return;
      }

      // Convert results to a JSON-compatible format
      const resultsForDb = JSON.parse(JSON.stringify(reconciliationResults));

      console.log("Saving reconciliation with", reconciliationResults.length, "records");

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
        user_id: sessionData.session.user.id
      });

      if (error) {
        throw error;
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

  const shouldShowNoConfigMessage = !config.sourceA || !config.sourceB || config.mappings.length === 0;
  const shouldShowNoResultsMessage = !isReconciling && reconciliationResults.length === 0 && !shouldShowNoConfigMessage;
  const shouldShowResults = reconciliationResults.length > 0;
  const shouldShowLoading = isReconciling;

  return {
    // State
    config,
    reconciliationResults,
    isReconciling,
    saveDialogOpen,
    isSaving,
    showLoadingState,
    stats,
    isPerfectMatch,
    
    // Display flags
    shouldShowNoConfigMessage,
    shouldShowNoResultsMessage,
    shouldShowResults,
    shouldShowLoading,
    
    // Actions
    setSaveDialogOpen,
    handleReconcile,
    saveReconciliation
  };
}
