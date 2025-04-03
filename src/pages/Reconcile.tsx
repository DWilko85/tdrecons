
import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import ReconcileHeader from "@/components/reconciliation/ReconcileHeader";
import ReconciliationContent from "@/components/reconciliation/ReconciliationContent";
import SaveReconciliationDialog from "@/components/SaveReconciliationDialog";
import { useReconcilePageState } from "@/hooks/useReconcilePageState";
import { useDataSources } from "@/hooks/useDataSources";

const Reconcile = () => {
  const {
    config,
    reconciliationResults,
    isReconciling,
    saveDialogOpen,
    isSaving,
    stats,
    isPerfectMatch,
    shouldShowNoConfigMessage,
    shouldShowNoResultsMessage,
    shouldShowResults,
    shouldShowLoading,
    setSaveDialogOpen,
    handleReconcile,
    saveReconciliation
  } = useReconcilePageState();

  const { setReconciliationResults } = useDataSources();

  // Check for stored results on component mount
  useEffect(() => {
    try {
      if (reconciliationResults.length === 0) {
        const storedResults = sessionStorage.getItem('tempReconciliationResults');
        if (storedResults) {
          const parsedResults = JSON.parse(storedResults);
          if (Array.isArray(parsedResults) && parsedResults.length > 0) {
            console.log("Loading stored reconciliation results from session storage");
            setReconciliationResults(parsedResults);
          }
        }
      }
    } catch (err) {
      console.error("Error loading stored results:", err);
    }
  }, [reconciliationResults.length, setReconciliationResults]);

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      <section className="pt-28 pb-8">
        <div className="container max-w-6xl">
          <ReconcileHeader
            isReconciling={isReconciling}
            hasResults={reconciliationResults.length > 0}
            onSave={() => setSaveDialogOpen(true)}
            onReconcile={handleReconcile}
          />
        </div>
      </section>
      
      <ReconciliationContent 
        config={config}
        reconciliationResults={reconciliationResults}
        isReconciling={isReconciling}
        isPerfectMatch={isPerfectMatch}
        shouldShowNoConfigMessage={shouldShowNoConfigMessage}
        shouldShowNoResultsMessage={shouldShowNoResultsMessage}
        shouldShowResults={shouldShowResults}
        shouldShowLoading={shouldShowLoading}
        stats={stats}
        onReconcile={handleReconcile}
      />
      
      <SaveReconciliationDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={saveReconciliation}
        isSaving={isSaving}
      />
    </div>
  );
};

export default Reconcile;
