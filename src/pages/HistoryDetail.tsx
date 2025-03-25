
import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ReconciliationTable from "@/components/ReconciliationTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Database, RefreshCw, XCircle } from "lucide-react";
import AnimatedTransition from "@/components/AnimatedTransition";
import { ReconciliationHistory } from "@/types/reconciliation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/date-utils";

const HistoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [history, setHistory] = useState<ReconciliationHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistoryDetail = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('reconciliation_history')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setHistory(data);
      } catch (error) {
        console.error("Error fetching reconciliation history detail:", error);
        toast({
          title: "Error",
          description: "Failed to load reconciliation details",
          variant: "destructive",
        });
        navigate('/history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryDetail();
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen pb-16">
        <Navbar />
        <div className="container max-w-6xl pt-28">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded-md w-1/4"></div>
            <div className="h-12 bg-muted rounded-md w-2/3"></div>
            <div className="h-24 bg-muted rounded-md w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!history) {
    return (
      <div className="min-h-screen pb-16">
        <Navbar />
        <div className="container max-w-6xl pt-28 text-center">
          <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-medium mb-2">Reconciliation Not Found</h2>
          <p className="text-muted-foreground mb-6">The reconciliation you're looking for doesn't exist or has been deleted</p>
          <Button asChild>
            <Link to="/history">
              Go Back to History
            </Link>
          </Button>
        </div>
      </div>
    );
  }

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
                    <Link to="/history">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Back to History</span>
                    </Link>
                  </Button>
                </div>
                <h1 className="text-3xl font-bold">{history.name}</h1>
                {history.description && (
                  <p className="text-muted-foreground mt-1">{history.description}</p>
                )}
                <div className="text-sm text-muted-foreground mt-2">
                  Created on {formatDateTime(new Date(history.created_at))}
                </div>
              </div>
              
              <Button 
                className="gap-2 w-full sm:w-auto" 
                variant="outline"
                asChild
              >
                <Link to="/configure">
                  <RefreshCw className="h-4 w-4" />
                  <span>New Reconciliation</span>
                </Link>
              </Button>
            </div>
          </AnimatedTransition>
          
          <AnimatedTransition type="slide-up" delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              <StatCard 
                label="Total Records"
                value={history.total_records}
                icon={<Database className="h-4 w-4" />}
              />
              <StatCard 
                label="Matching"
                value={history.matching_records}
                icon={<CheckCircle className="h-4 w-4 text-matching" />}
                percentage={Math.round((history.matching_records / history.total_records) * 100)}
              />
              <StatCard 
                label="Different"
                value={history.different_records}
                icon={<XCircle className="h-4 w-4 text-removed" />}
                percentage={Math.round((history.different_records / history.total_records) * 100)}
              />
              <StatCard 
                label="Missing in Principal"
                value={history.missing_a_records}
                percentage={Math.round((history.missing_a_records / history.total_records) * 100)}
              />
              <StatCard 
                label="Missing in Counterparty"
                value={history.missing_b_records}
                percentage={Math.round((history.missing_b_records / history.total_records) * 100)}
              />
            </div>
          </AnimatedTransition>
          
          <AnimatedTransition type="fade" delay={0.3}>
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10 text-sm">
              <div className="border rounded-md p-3 flex-1">
                <div className="text-muted-foreground mb-2">Principal</div>
                <div className="font-medium">{history.source_a_name}</div>
              </div>
              <div className="border rounded-md p-3 flex-1">
                <div className="text-muted-foreground mb-2">Counterparty</div>
                <div className="font-medium">{history.source_b_name}</div>
              </div>
            </div>
          </AnimatedTransition>
        </div>
      </section>
      
      {/* Results Table */}
      <section>
        <div className="container max-w-6xl">
          <ReconciliationTable 
            results={history.results}
            isHistoryView={true}
          />
        </div>
      </section>
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

export default HistoryDetail;
