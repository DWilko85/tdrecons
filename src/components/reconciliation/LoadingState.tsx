
import React from "react";
import { RefreshCw } from "lucide-react";

const LoadingState: React.FC = () => {
  return (
    <div className="text-center py-20">
      <RefreshCw className="h-16 w-16 text-primary/60 mx-auto mb-6 animate-spin" />
      <h2 className="text-2xl font-medium mb-4">Reconciliation in Progress</h2>
      <p className="text-muted-foreground mb-2 max-w-md mx-auto">
        We're comparing your data sources to identify matches and differences...
      </p>
      <p className="text-sm text-muted-foreground">
        This may take a moment depending on the size of your data sources
      </p>
    </div>
  );
};

export default LoadingState;
