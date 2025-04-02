
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { formatRelativeTime } from "@/lib/date-utils";
import { ReconciliationHistory } from "@/types/reconciliation";

export interface HistoryListProps {
  items: ReconciliationHistory[];
}

const HistoryList: React.FC<HistoryListProps> = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20">
        <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-medium mb-2">No Reconciliation History</h2>
        <p className="text-muted-foreground mb-6">Run and save your first reconciliation to see it here</p>
        <Button
          className="mx-auto"
          asChild
        >
          <Link to="/configure">Start New Reconciliation</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const date = new Date(item.created_at);
        const matchingRate = Math.round((item.matching_records / item.total_records) * 100) || 0;
        const differenceRate = 100 - matchingRate;

        return (
          <Card key={item.id} className="transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  {item.description && (
                    <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                  )}
                  <div className="flex items-center gap-6 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{item.total_records} records</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-matching" />
                      <span className="text-sm">{matchingRate}% matching</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5 text-removed" />
                      <span className="text-sm">{differenceRate}% different</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="text-xs text-muted-foreground">{formatRelativeTime(date)}</div>
                    <div className="text-xs px-2 py-0.5 bg-muted rounded-full">
                      {item.source_a_name} ⟷ {item.source_b_name}
                    </div>
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="mt-2 md:mt-0 self-start md:self-center">
                  <Link to={`/history/${item.id}`}>
                    <span>View Details</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default HistoryList;
