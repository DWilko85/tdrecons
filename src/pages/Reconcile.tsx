import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ReconciliationTable from "@/components/ReconciliationTable";
import { useDataSources } from "@/hooks/useDataSources";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Database, 
  History, 
  RefreshCw, 
  Save, 
} from "lucide-react";
import AnimatedTransition from "@/components/AnimatedTransition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SaveReconciliationDialog from "@/components/SaveReconciliationDialog";
import ReconciliationStats from "@/components/ReconciliationStats";
import SourceInfo from "@/components/SourceInfo";
import PerfectMatchBanner from "@/components/PerfectMatchBanner";

const Reconcile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    config, 
    reconciliationResults,
    isReconciling,
    reconcile,
    autoReconcile,
    lastConfig
  } = useDataSources();
  const [showLoadingState, setShowLoadingState] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Check if we're coming from Configure page with intention to reconcile
  useEffect(() => {
    const shouldRunReconciliation = location.state?.runReconciliation === true;
    
    // Only auto-run reconciliation if explicitly requested through navigation state
    if (!initialLoadDone && shouldRunReconciliation) {
      console.log("Running reconciliation due to explicit navigation request");
      handleReconcile();
      setInitialLoadDone(true);
    } else {
      setInitialLoadDone(true);
    }
  }, [location.state, initialLoadDone]);

  // For debugging
  useEffect(() => {
    console.log("Render state:", { 
      resultsLength: reconciliationResults.length, 
      isReconciling, 
      showLoadingState,
      config: {
        sourceA: config.sourceA?.name,
        sourceB: config.sourceB?.name,
        mappings: config.mappings.length
      }
    });
  }, [reconciliationResults, isReconciling, showLoadingState, config]);

  // If reconciling, show loading state immediately
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
    // Reset loading state and run reconciliation
    setShowLoadingState(true);
    reconcile();
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

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      {/* Header */}
      <section className="pt-28 pb-8">
        <div className="container max-w-6xl">
          <AnimatedTransition type="slide-down" delay={0.1}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <Link to="/configure">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Configuration</span>
                    </Link>
                  </Button>
                </div>
                <h1 className="text-3xl font-bold">AI Reconcile: Results</h1>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
                <Button 
                  variant="outline"
                  className="gap-2" 
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={isReconciling || reconciliationResults.length === 0}
                >
                  <Save className="h-4 w-4" />
                  <span>Save Results</span>
                </Button>
                
                <Button 
                  className="gap-2" 
                  onClick={handleReconcile}
                  disabled={isReconciling}
                >
                  <RefreshCw className={isReconciling ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                  {isReconciling ? "Processing..." : "Re-run Reconciliation"}
                </Button>
              </div>
            </div>
          </AnimatedTransition>
          
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground hover:text-foreground"
              asChild
            >
              <Link to="/history">
                <History className="h-3.5 w-3.5" />
                <span>View History</span>
              </Link>
            </Button>
          </div>
          
          {reconciliationResults.length > 0 && (
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
          {isReconciling ? (
            <div className="text-center py-20">
              <RefreshCw className="h-16 w-16 text-primary/60 mx-auto mb-6 animate-spin" />
              <h2 className="text-2xl font-medium mb-4">Reconciliation in Progress</h2>
              <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                We're comparing your data sources to identify matches and differences...
              </p>
              <p className="text-sm text-muted-foreground">
                This may take a moment depending on the size of your data sources
              </p>
            </div>
          ) : showLoadingState && reconciliationResults.length === 0 ? (
            <div className="text-center py-20">
              <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">No Results Available</h2>
              <p className="text-muted-foreground mb-6">Run the reconciliation process to generate results</p>
              <Button
                className="mx-auto"
                onClick={handleReconcile}
              >
                Start Reconciliation
              </Button>
            </div>
          ) : reconciliationResults.length > 0 ? (
            <ReconciliationTable 
              results={reconciliationResults}
              isLoading={isReconciling}
            />
          ) : (
            <div className="text-center py-20">
              <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">No Results Available</h2>
              <p className="text-muted-foreground mb-6">Configure your data sources to start the AI reconciliation process</p>
              <Button
                className="mx-auto"
                onClick={() => navigate("/configure")}
              >
                Configure Sources
              </Button>
            </div>
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
