
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ReconciliationTable from "@/components/ReconciliationTable";
import { useDataSources } from "@/hooks/useDataSources";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Database, 
  History, 
  RefreshCw, 
  Save, 
  XCircle 
} from "lucide-react";
import AnimatedTransition from "@/components/AnimatedTransition";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SaveReconciliationDialog from "@/components/SaveReconciliationDialog";

const Reconcile = () => {
  const navigate = useNavigate();
  const { 
    config, 
    reconciliationResults,
    isReconciling,
    reconcile
  } = useDataSources();
  const [showLoadingState, setShowLoadingState] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // If no results, redirect to configure page
  useEffect(() => {
    if (reconciliationResults.length === 0 && !isReconciling) {
      // Small delay to prevent flash
      const timeout = setTimeout(() => {
        setShowLoadingState(true);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [reconciliationResults, isReconciling]);

  // Calculate statistics
  const stats = {
    total: reconciliationResults.length,
    matching: reconciliationResults.filter(r => r.status === 'matching').length,
    different: reconciliationResults.filter(r => r.status === 'different').length,
    missingA: reconciliationResults.filter(r => r.status === 'missing-a').length,
    missingB: reconciliationResults.filter(r => r.status === 'missing-b').length,
    differenceRate: reconciliationResults.length ? 
      Math.round((reconciliationResults.filter(r => r.status !== 'matching').length / reconciliationResults.length) * 100) : 
      0
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
        results: reconciliationResults,
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
                  onClick={reconcile}
                  disabled={isReconciling}
                >
                  <RefreshCw className={cn(
                    "h-4 w-4",
                    isReconciling ? "animate-spin" : ""
                  )} />
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
            <AnimatedTransition type="slide-up" delay={0.2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                <StatCard 
                  label="Total Records"
                  value={stats.total}
                  icon={<Database className="h-4 w-4" />}
                />
                <StatCard 
                  label="Matching"
                  value={stats.matching}
                  icon={<CheckCircle className="h-4 w-4 text-matching" />}
                  percentage={stats.total ? Math.round((stats.matching / stats.total) * 100) : 0}
                />
                <StatCard 
                  label="Different"
                  value={stats.different}
                  icon={<XCircle className="h-4 w-4 text-removed" />}
                  percentage={stats.total ? Math.round((stats.different / stats.total) * 100) : 0}
                />
                <StatCard 
                  label="Missing in Principal"
                  value={stats.missingA}
                  percentage={stats.total ? Math.round((stats.missingA / stats.total) * 100) : 0}
                />
                <StatCard 
                  label="Missing in Counterparty"
                  value={stats.missingB}
                  percentage={stats.total ? Math.round((stats.missingB / stats.total) * 100) : 0}
                />
              </div>
            </AnimatedTransition>
          )}
          
          {config.sourceA && config.sourceB && (
            <AnimatedTransition type="fade" delay={0.3}>
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-10 text-sm">
                <div className="border rounded-md p-3 flex-1">
                  <div className="text-muted-foreground mb-2">Principal</div>
                  <div className="font-medium">{config.sourceA.name}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs font-normal">
                      {config.sourceA.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {config.sourceA.data.length} records
                    </span>
                  </div>
                </div>
                <div className="border rounded-md p-3 flex-1">
                  <div className="text-muted-foreground mb-2">Counterparty</div>
                  <div className="font-medium">{config.sourceB.name}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs font-normal">
                      {config.sourceB.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {config.sourceB.data.length} records
                    </span>
                  </div>
                </div>
                <div className="border rounded-md p-3 flex-1">
                  <div className="text-muted-foreground mb-2">Key Mapping</div>
                  <div className="font-medium">
                    {config.keyMapping.sourceAField} ↔ {config.keyMapping.sourceBField}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {config.mappings.length} field{config.mappings.length !== 1 ? 's' : ''} mapped for comparison
                  </div>
                </div>
              </div>
            </AnimatedTransition>
          )}
        </div>
      </section>
      
      {/* Results Table */}
      <section>
        <div className="container max-w-6xl">
          {showLoadingState && reconciliationResults.length === 0 ? (
            <div className="text-center py-20">
              <RefreshCw className="h-10 w-10 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-medium mb-2">AI Reconcile Processing</h2>
              <p className="text-muted-foreground mb-6">Please wait while we reconcile your data sources...</p>
              <Button
                variant="outline"
                className="mx-auto"
                onClick={() => navigate("/configure")}
              >
                Back to Configuration
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

interface StatCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  percentage?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, percentage }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          {icon && (
            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
        {percentage !== undefined && (
          <div className="mt-2 text-xs text-muted-foreground">
            {percentage}% of total
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Reconcile;
