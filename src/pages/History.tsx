
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HistoryList from "@/components/HistoryList";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReconciliationHistory } from "@/types/reconciliation";
import AnimatedTransition from "@/components/AnimatedTransition";
import { Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const History = () => {
  const [history, setHistory] = useState<ReconciliationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching reconciliation history...");
      
      // Check if the table exists first
      try {
        const { error: tableCheckError } = await supabase
          .from('reconciliation_history')
          .select('count')
          .limit(1);
        
        if (tableCheckError && tableCheckError.code === 'PGRST116') {
          console.error("reconciliation_history table doesn't exist:", tableCheckError);
          setHistory([]);
          return;
        }
      } catch (tableErr) {
        console.error("Error checking table:", tableErr);
      }
      
      // Get the current user's session
      const { data: sessionData } = await supabase.auth.getSession();
      const isAuthenticated = !!sessionData.session;
      
      let query = supabase
        .from('reconciliation_history')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If authenticated, only fetch user's records
      if (isAuthenticated) {
        query = query.eq('user_id', sessionData.session?.user.id);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching history:", error);
        throw error;
      }

      if (data) {
        console.log("Fetched history data:", data.length, "records");
        
        // Ensure results are properly parsed
        const parsedData = data.map(item => ({
          ...item,
          results: Array.isArray(item.results) ? item.results : 
                   (typeof item.results === 'string' ? JSON.parse(item.results) : [])
        }));
        
        // Cast the data to ReconciliationHistory[]
        setHistory(parsedData as ReconciliationHistory[]);
      } else {
        console.log("No history data found");
        setHistory([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load reconciliation history");
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen pb-16">
      <Navbar />

      {/* Header */}
      <section className="pt-28 pb-8">
        <div className="container max-w-6xl">
          <AnimatedTransition type="slide-down" delay={0.1}>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-3">Reconciliation History</h1>
              <p className="text-muted-foreground text-lg">
                View and manage your past reconciliation processes
              </p>
            </div>
          </AnimatedTransition>
        </div>
      </section>

      {/* History List */}
      <section>
        <div className="container max-w-6xl">
          {isLoading ? (
            <div className="text-center py-20">
              <RefreshCw className="h-10 w-10 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-medium mb-2">Loading History</h2>
              <p className="text-muted-foreground">Fetching your reconciliation history...</p>
            </div>
          ) : history.length > 0 ? (
            <HistoryList items={history} />
          ) : (
            <div className="text-center py-20">
              <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">No History Available</h2>
              <p className="text-muted-foreground mb-6">Start a new reconciliation to populate your history</p>
              <Button asChild>
                <Link to="/configure">Start Reconciling</Link>
              </Button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Button variant="outline" onClick={fetchHistory}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh History
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default History;
