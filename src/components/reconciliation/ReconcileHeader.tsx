import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedTransition from "@/components/AnimatedTransition";
interface ReconcileHeaderProps {
  isReconciling: boolean;
  hasResults: boolean;
  onReconcile: () => void;
}
const ReconcileHeader: React.FC<ReconcileHeaderProps> = ({
  isReconciling,
  hasResults,
  onReconcile
}) => {
  return <AnimatedTransition type="slide-down" delay={0.1}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-muted-foreground hover:text-foreground" asChild>
              <Link to="/configure">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Configuration</span>
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold">TD Reconcile: Results</h1>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto flex-col sm:flex-row">
          <Button className="gap-2" onClick={onReconcile} disabled={isReconciling}>
            <RefreshCw className={isReconciling ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            {isReconciling ? "Processing..." : "Re-run Reconciliation"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground" asChild>
          <Link to="/history">
            <History className="h-3.5 w-3.5" />
            <span>View History</span>
          </Link>
        </Button>
      </div>
    </AnimatedTransition>;
};
export default ReconcileHeader;