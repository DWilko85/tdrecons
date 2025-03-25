
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Database, Download, Search } from "lucide-react";
import AnimatedTransition from "@/components/AnimatedTransition";
import HistoryList from "@/components/HistoryList";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ReconciliationHistory } from "@/types/reconciliation";

const History = () => {
  const [histories, setHistories] = useState<ReconciliationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('reconciliation_history')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setHistories(data || []);
      } catch (error) {
        console.error("Error fetching reconciliation history:", error);
        toast({
          title: "Error",
          description: "Failed to load reconciliation history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistories();
  }, [toast]);

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
                    <Link to="/">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to Home</span>
                    </Link>
                  </Button>
                </div>
                <h1 className="text-3xl font-bold">Reconciliation History</h1>
              </div>
              
              <Button 
                className="gap-2 w-full sm:w-auto" 
                variant="outline"
                asChild
              >
                <Link to="/reconcile">
                  <Database className="h-4 w-4" />
                  <span>New Reconciliation</span>
                </Link>
              </Button>
            </div>
          </AnimatedTransition>
        </div>
      </section>
      
      {/* History List */}
      <section>
        <div className="container max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="border animate-pulse h-48">
                  <CardHeader className="pb-2">
                    <div className="h-6 bg-muted rounded-md w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded-md w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded-md w-full"></div>
                      <div className="h-4 bg-muted rounded-md w-3/4"></div>
                      <div className="h-4 bg-muted rounded-md w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : histories.length > 0 ? (
            <HistoryList histories={histories} />
          ) : (
            <div className="text-center py-20">
              <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-medium mb-2">No Reconciliation History</h2>
              <p className="text-muted-foreground mb-6">You haven't saved any reconciliations yet</p>
              <Button
                className="mx-auto"
                asChild
              >
                <Link to="/configure">
                  Start Reconciliation
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default History;
