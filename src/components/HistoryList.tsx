
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, Check, Clock, Eye, FileIcon, X } from "lucide-react";
import { ReconciliationHistory } from "@/types/reconciliation";
import { formatRelativeTime } from "@/lib/date-utils";

interface HistoryListProps {
  histories: ReconciliationHistory[];
}

const HistoryList: React.FC<HistoryListProps> = ({ histories }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {histories.map((history) => (
        <Card key={history.id} className="border overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="truncate text-lg">{history.name}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(new Date(history.created_at))}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground">Total Records:</div>
                <div className="font-medium">{history.total_records}</div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3 text-matching" />
                    <span>Matching</span>
                  </div>
                  <span className="font-medium">{history.matching_records}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <X className="h-3 w-3 text-removed" />
                    <span>Different</span>
                  </div>
                  <span className="font-medium">{history.different_records}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Missing A</span>
                  <span className="font-medium">{history.missing_a_records}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Missing B</span>
                  <span className="font-medium">{history.missing_b_records}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-muted/20 py-2 px-3 flex justify-end">
            <Button size="sm" variant="outline" asChild className="h-7 gap-1">
              <Link to={`/history/${history.id}`}>
                <Eye className="h-3.5 w-3.5" />
                <span>View Details</span>
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default HistoryList;
