
import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import ReconciliationTable from "@/components/ReconciliationTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReconciliationHistory } from "@/types/reconciliation";
import AnimatedTransition from "@/components/AnimatedTransition";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import ClientRequired from "@/components/ClientRequired";

const HistoryDetail = () => {
  const { id } = useParams();
  const { user, currentClient } = useAuth();

  const fetchHistoryDetail = async () => {
    if (!id) throw new Error("No history ID provided");
    if (!user) throw new Error("User not authenticated");
    if (!currentClient) throw new Error("No client selected");

    console.log("Fetching history detail for ID:", id);
    console.log("Current client:", currentClient.id, currentClient.name);
    
    const { data, error } = await supabase
      .from('reconciliation_history')
      .select('*')
      .eq('id', id)
      .eq('client_id', currentClient.id) // Ensure we only fetch records for current client
      .single();

    if (error) {
      console.error("Error fetching history detail:", error);
      throw error;
    }

    if (data) {
      console.log("Fetched history detail:", data);
      
      // Ensure results are properly parsed
      const parsedData = {
        ...data,
        results: Array.isArray(data.results) ? data.results : 
                (typeof data.results === 'string' ? JSON.parse(data.results) : data.results)
      };
      
      return parsedData as ReconciliationHistory;
    }
    
    throw new Error("Reconciliation history not found");
  };

  const { 
    data: history, 
    isLoading, 
    error
  } = useQuery({
    queryKey: ['reconciliation-history', id, currentClient?.id],
    queryFn: fetchHistoryDetail,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: !!user && !!currentClient && !!id
  });

  React.useEffect(() => {
    if (error) {
      console.error("Error in history detail query:", error);
      toast.error("Failed to load reconciliation details");
    }
  }, [error]);

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <ClientRequired>
      <div className="min-h-screen pb-16">
        <Navbar />
        
        <section className="pt-28 pb-8">
          <div className="container max-w-6xl">
            <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0 mb-8">
              <div>
                <Link 
                  to="/history" 
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to History
                </Link>
                
                {isLoading ? (
                  <h1 className="text-2xl md:text-3xl font-bold">Loading...</h1>
                ) : history ? (
                  <>
                    <h1 className="text-2xl md:text-3xl font-bold">{history.name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-muted-foreground">
                        {history.source_a_name} ↔ {history.source_b_name}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {formatDistanceToNow(new Date(history.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {history.description && (
                      <p className="mt-2 text-muted-foreground">{history.description}</p>
                    )}
                  </>
                ) : (
                  <h1 className="text-2xl md:text-3xl font-bold">Reconciliation not found</h1>
                )}
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-20">
                <Database className="h-10 w-10 animate-pulse text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">Loading History Details</h2>
                <p className="text-muted-foreground">Fetching reconciliation data...</p>
              </div>
            ) : !history ? (
              <div className="text-center py-20">
                <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">Reconciliation Not Found</h2>
                <p className="text-muted-foreground mb-6">The reconciliation record you're looking for doesn't exist or you don't have access to it</p>
                <Button asChild>
                  <Link to="/history">Back to History</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                  <StatCard
                    title="Total Records"
                    value={history.total_records}
                    icon={Database}
                    className="sm:col-span-2 lg:col-span-1"
                  />
                  <StatCard
                    title="Matching"
                    value={history.matching_records}
                    percentage={Math.round((history.matching_records / history.total_records) * 100) || 0}
                    icon={CheckCircle}
                    className={history.different_records === 0 && 
                      history.missing_a_records === 0 && 
                      history.missing_b_records === 0 ? "border-green-500 border-2" : ""}
                  />
                  <StatCard
                    title="Different"
                    value={history.different_records}
                    percentage={Math.round((history.different_records / history.total_records) * 100) || 0}
                    icon={XCircle}
                  />
                  <StatCard
                    title="Missing in Principal"
                    value={history.missing_a_records}
                    percentage={Math.round((history.missing_a_records / history.total_records) * 100) || 0}
                    icon={AlertTriangle}
                  />
                  <StatCard
                    title="Missing in Counterparty"
                    value={history.missing_b_records}
                    percentage={Math.round((history.missing_b_records / history.total_records) * 100) || 0}
                    icon={AlertTriangle}
                  />
                </div>
                
                <div className="border rounded-lg p-4 bg-card mb-8">
                  <h2 className="text-xl font-semibold mb-4">Reconciliation Results</h2>
                  {Array.isArray(history.results) && history.results.length > 0 ? (
                    <ReconciliationTable 
                      results={history.results}
                      isLoading={false}
                      isHistoryView={true}
                    />
                  ) : (
                    <div className="text-center py-10">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                      <p className="text-muted-foreground">No detailed results available for this reconciliation</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </ClientRequired>
  );
};

export default HistoryDetail;
