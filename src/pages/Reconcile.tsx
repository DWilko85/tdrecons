
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ReconciliationTable from "@/components/ReconciliationTable";
import { useDataSources } from "@/hooks/useDataSources";
import AnimatedTransition from "@/components/AnimatedTransition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SaveReconciliationDialog from "@/components/SaveReconciliationDialog";
import ReconciliationStats from "@/components/ReconciliationStats";
import SourceInfo from "@/components/SourceInfo";
import PerfectMatchBanner from "@/components/PerfectMatchBanner";
import ReconcileHeader from "@/components/reconciliation/ReconcileHeader";
import LoadingState from "@/components/reconciliation/LoadingState";
import NoConfigMessage from "@/components/reconciliation/NoConfigMessage";
import NoResultsMessage from "@/components/reconciliation/NoResultsMessage";

const Reconcile = () => {
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

  // Debug logs to help diagnose the issue
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

  // Check if we're coming from Configure page with intention to reconcile
  useEffect(() => {
    const shouldRunReconciliation = location.state?.runReconciliation === true;
    
    // Only auto-run reconciliation if explicitly requested through navigation state
    if (!initialLoadDone && shouldRunReconciliation) {
      console.log("Running reconciliation due to explicit navigation request");
      if (config.sourceA && config.sourceB && config.mappings.length > 0) {
        handleReconcile();
      }
    }
    setInitialLoadDone(true);
  }, [location.state, initialLoadDone]);

  // Show loading state when reconciling or no results
  useEffect(() => {
    if (isReconciling) {
      setShowLoadingState(true);
    } else if (reconciliationResults.length > 0) {
      // If we have results, don't show loading state
      setShowLoadingState(false);
    } else {
      // Show loading state after a small delay to prevent flashing
      const timeout = setTimeout(() => {
        setShowLoadingState(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [reconciliationResults, isReconciling]);

  // Calculate statistics for saving to the database
  const stats = {
    total: reconciliationResults.length,
    matching: reconciliationResults.filter(r => r.status === 'matching').length,
    different: reconciliationResults.filter(r => r.status === 'different').length,
    missingA: reconciliationResults.filter(r => r.status === 'missing-a').length,
    missingB: reconciliationResults.filter(r => r.status === 'missing-b').length,
  };

  // Check if we have a perfect match (all records match)
  const isPerfectMatch = reconciliationResults.length > 0 && 
    stats.matching === stats.total && 
    stats.different === 0 && 
    stats.missingA === 0 && 
    stats.missingB === 0;

  // Trigger reconciliation
  const handleReconcile = () => {
    // Make sure we have valid config
    if (!config.sourceA || !config.sourceB || config.mappings.length === 0) {
      toast.error("Please configure both data sources and field mappings");
      navigate("/configure");
      return;
    }
    
    // Reset loading state and run reconciliation
    setShowLoadingState(true);
    console.log("Manually triggering reconciliation");
    reconcile(); // Use the current config for reconciliation
  };

  // Save reconciliation to database
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

      // Convert reconciliationResults to a JSON-compatible format
      const resultsForDb = JSON.parse(JSON.stringify(reconciliationResults));

      // For debugging
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

  // Determine what to show based on the state
  const shouldShowNoConfigMessage = !config.sourceA || !config.sourceB || config.mappings.length === 0;
  const shouldShowNoResultsMessage = !isReconciling && reconciliationResults.length === 0 && !shouldShowNoConfigMessage;
  const shouldShowResults = reconciliationResults.length > 0;
  const shouldShowLoading = isReconciling;

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      {/* Header */}
      <section className="pt-28 pb-8">
        <div className="container max-w-6xl">
          <ReconcileHeader
            isReconciling={isReconciling}
            hasResults={reconciliationResults.length > 0}
            onSave={() => setSaveDialogOpen(true)}
            onReconcile={handleReconcile}
          />
          
          {shouldShowResults && (
            <>
              {isPerfectMatch && config.sourceA && config.sourceB && (
                <PerfectMatchBanner 
                  sourceA={config.sourceA.name}
                  sourceB={config.sourceB.name}
                  recordCount={stats.total}
                />
              )}
              
              <ReconciliationStats results={reconciliationResults} />
            </>
          )}
          
          {config.sourceA && config.sourceB && (
            <SourceInfo config={config} />
          )}
        </div>
      </section>
      
      {/* Results Table */}
      <section>
        <div className="container max-w-6xl">
          {shouldShowLoading && <LoadingState />}
          
          {shouldShowNoConfigMessage && !isReconciling && <NoConfigMessage />}
          
          {shouldShowNoResultsMessage && (
            <NoResultsMessage onReconcile={handleReconcile} />
          )}
          
          {reconciliationResults && reconciliationResults.length > 0 && (
            <ReconciliationTable 
              results={reconciliationResults}
              isLoading={isReconciling}
            />
          )}
        </div>
      </section>
      
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
