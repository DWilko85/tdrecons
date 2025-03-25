import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ReconciliationTable from "@/components/ReconciliationTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReconciliationHistory } from "@/types/reconciliation";
import { formatDateTime } from "@/lib/date-utils";
import AnimatedTransition from "@/components/AnimatedTransition";
import { ArrowLeft, Calendar, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HistoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [reconciliation, setReconciliation] = useState<ReconciliationHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReconciliation = async () => {
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

        if (data) {
          // Ensure results are properly parsed
          const parsedData = {
            ...data,
            results: Array.isArray(data.results) ? data.results : JSON.parse(JSON.stringify(data.results))
          };
          
          setReconciliation(parsedData as ReconciliationHistory);
        }
      } catch (error) {
        console.error("Error fetching reconciliation:", error);
        toast.error("Failed to load reconciliation details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReconciliation();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-28 pb-8">
          <div className="container max-w-6xl text-center">
            <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-medium mb-2">Loading Reconciliation Details</h2>
            <p className="text-muted-foreground">Fetching data, please wait...</p>
          </div>
        </section>
      </div>
    );
  }

  if (!reconciliation) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="pt-28 pb-8">
          <div className="container max-w-6xl text-center">
            <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">Reconciliation Not Found</h2>
            <p className="text-muted-foreground">The requested reconciliation could not be found.</p>
            <Button asChild className="mt-4">
              <Link to="/history">Back to History</Link>
            </Button>
          </div>
        </section>
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
                <h1 className="text-3xl font-bold">{reconciliation.name}</h1>
              </div>
            </div>
          </AnimatedTransition>

          <div className="flex items-center gap-3 mb-6">
            <Badge variant="secondary" className="gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateTime(new Date(reconciliation.created_at))}
            </Badge>
          </div>

          <AnimatedTransition type="slide-up" delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              <StatCard
                label="Total Records"
                value={reconciliation.total_records}
                icon={<Database className="h-4 w-4" />}
              />
              <StatCard
                label="Matching"
                value={reconciliation.matching_records}
                icon={<CheckCircle className="h-4 w-4 text-matching" />}
                percentage={reconciliation.total_records ? Math.round((reconciliation.matching_records / reconciliation.total_records) * 100) : 0}
              />
              <StatCard
                label="Different"
                value={reconciliation.different_records}
                icon={<XCircle className="h-4 w-4 text-removed" />}
                percentage={reconciliation.total_records ? Math.round((reconciliation.different_records / reconciliation.total_records) * 100) : 0}
              />
              <StatCard
                label="Missing in Principal"
                value={reconciliation.missing_a_records}
                percentage={reconciliation.total_records ? Math.round((reconciliation.missing_a_records / reconciliation.total_records) * 100) : 0}
              />
              <StatCard
                label="Missing in Counterparty"
                value={reconciliation.missing_b_records}
                percentage={reconciliation.total_records ? Math.round((reconciliation.missing_b_records / reconciliation.total_records) * 100) : 0}
              />
            </div>
          </AnimatedTransition>

          <AnimatedTransition type="fade" delay={0.3}>
            <div className="flex flex-col sm:flex-row items-start gap-4 mb-10 text-sm">
              <div className="border rounded-md p-3 flex-1">
                <div className="text-muted-foreground mb-2">Principal</div>
                <div className="font-medium">{reconciliation.source_a_name}</div>
              </div>
              <div className="border rounded-md p-3 flex-1">
                <div className="text-muted-foreground mb-2">Counterparty</div>
                <div className="font-medium">{reconciliation.source_b_name}</div>
              </div>
              {reconciliation.description && (
                <div className="border rounded-md p-3 flex-1">
                  <div className="text-muted-foreground mb-2">Description</div>
                  <div className="font-medium">{reconciliation.description}</div>
                </div>
              )}
            </div>
          </AnimatedTransition>
        </div>
      </section>

      {/* Results Table */}
      <section>
        <div className="container max-w-6xl">
          <AnimatedTransition type="fade" delay={0.4}>
            <ReconciliationTable
              results={reconciliation.results}
              isLoading={isLoading}
              isHistoryView={true}
            />
          </AnimatedTransition>
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

const CheckCircle = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M16.83 7.17L9.17 14.83l-2.83-2.83" />
  </svg>
);

const XCircle = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M15 9l-6 6" />
    <path d="M9 9l6 6" />
  </svg>
);

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
