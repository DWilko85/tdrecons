
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AutoReconcileToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const AutoReconcileToggle: React.FC<AutoReconcileToggleProps> = ({
  checked,
  onCheckedChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="auto-reconcile"
        checked={checked}
        onCheckedChange={(value) => {
          // Cast to boolean to ensure correct type
          onCheckedChange(Boolean(value));
        }}
      />
      <Label htmlFor="auto-reconcile">Auto-reconcile on upload</Label>
    </div>
  );
};

export default AutoReconcileToggle;
