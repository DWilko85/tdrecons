
import React from "react";
import { RefreshCw } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Reconciliation in Progress",
  submessage = "This may take a moment depending on the size of your data sources"
}) => {
  return (
    <div className="text-center py-20">
      <RefreshCw className="h-16 w-16 text-primary/60 mx-auto mb-6 animate-spin" />
      <h2 className="text-2xl font-medium mb-4">{message}</h2>
      <p className="text-muted-foreground mb-2 max-w-md mx-auto">
        We're comparing your data sources to identify matches and differences...
      </p>
      <p className="text-sm text-muted-foreground">
        {submessage}
      </p>
    </div>
  );
};

export default LoadingState;
