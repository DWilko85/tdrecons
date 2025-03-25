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
      const { data, error } = await supabase
        .from('reconciliation_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Ensure results are properly parsed
        const parsedData = data.map(item => ({
          ...item,
          results: Array.isArray(item.results) ? item.results : JSON.parse(JSON.stringify(item.results))
        }));
        
        setHistory(parsedData as ReconciliationHistory[]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load reconciliation history");
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
            <HistoryList history={history} />
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
        </div>
      </section>
    </div>
  );
};

export default History;
