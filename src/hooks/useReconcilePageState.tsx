import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useDataSources } from "./useDataSources";

export function useReconcilePageState() {
  const { config, reconciliationResults, reconcile, clearResults, setReconciliationResults } = useDataSources();
  const [isReconciling, setIsReconciling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const stats = {
    total: reconciliationResults.length,
    matching: reconciliationResults.filter(r => r.status === 'matching').length,
    different: reconciliationResults.filter(r => r.status === 'different').length,
    missingA: reconciliationResults.filter(r => r.status === 'missing-a').length,
    missingB: reconciliationResults.filter(r => r.status === 'missing-b').length,
  };

  const isPerfectMatch = stats.matching === stats.total && stats.total > 0;
  const shouldShowNoConfigMessage = !config.sourceA || !config.sourceB;
  const shouldShowNoResultsMessage = !isReconciling && reconciliationResults.length === 0 && !shouldShowNoConfigMessage;
  const shouldShowResults = reconciliationResults.length > 0;
  const shouldShowLoading = isReconciling;

  const handleReconcile = useCallback(async () => {
    setIsReconciling(true);
    try {
      await reconcile();
      sessionStorage.setItem('tempReconciliationResults', JSON.stringify(reconciliationResults));
    } finally {
      setIsReconciling(false);
    }
  }, [reconcile, reconciliationResults]);

  const saveReconciliation = useCallback(async (name: string, description: string) => {
    setIsSaving(true);
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Reconciliation "${name}" saved successfully!`);
      setSaveDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save reconciliation");
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    if (reconciliationResults.length > 0) {
      sessionStorage.setItem('tempReconciliationResults', JSON.stringify(reconciliationResults));
    }
  }, [reconciliationResults]);

  return {
    config,
    reconciliationResults,
    isReconciling,
    isSaving,
    stats,
    isPerfectMatch,
    shouldShowNoConfigMessage,
    shouldShowNoResultsMessage,
    shouldShowResults,
    shouldShowLoading,
    handleReconcile,
    saveReconciliation,
  };
}
