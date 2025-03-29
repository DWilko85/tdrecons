
import React from "react";
import { Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoResultsMessageProps {
  onReconcile: () => void;
  isLoading?: boolean;
}

const NoResultsMessage: React.FC<NoResultsMessageProps> = ({ onReconcile, isLoading = false }) => {
  return (
    <div className="text-center py-20">
      <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-xl font-medium mb-2">No Results Available</h2>
      <p className="text-muted-foreground mb-6">Run the reconciliation process to generate results</p>
      <Button
        className="mx-auto"
        onClick={onReconcile}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>Start Reconciliation</>
        )}
      </Button>
    </div>
  );
};

export default NoResultsMessage;
