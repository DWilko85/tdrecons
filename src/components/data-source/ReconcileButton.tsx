
import React from "react";
import { Button } from "@/components/ui/button";
import { Database, RefreshCw } from "lucide-react";

interface ReconcileButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

const ReconcileButton: React.FC<ReconcileButtonProps> = ({
  onClick,
  disabled,
  isLoading,
}) => {
  return (
    <div className="flex justify-center w-full">
      <Button 
        className="gap-2 px-8 py-6 text-lg" 
        size="lg"
        onClick={onClick}
        disabled={disabled}
      >
        {isLoading ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <Database className="w-5 h-5" />
        )}
        Start Reconciliation
      </Button>
    </div>
  );
};

export default ReconcileButton;
