
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DataSourceConfig } from "@/hooks/useDataSources";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface DataSourceActionsProps {
  config: DataSourceConfig;
  canReconcile: boolean;
  onReconcile: () => void;
}

const DataSourceActions: React.FC<DataSourceActionsProps> = ({
  config,
  canReconcile,
  onReconcile,
}) => {
  const saveMappingsToDatabase = async () => {
    if (!config.sourceA || !config.sourceB || config.mappings.length === 0) {
      return false;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        console.error("No user ID available for saving mappings");
        return false;
      }
      
      const mappingName = `${config.sourceA.name} to ${config.sourceB.name} mapping`;
      
      const mappingData = {
        name: mappingName,
        file_a_id: config.sourceA.id,
        file_b_id: config.sourceB.id,
        user_id: userId,
        mapping: JSON.stringify({
          fields: config.mappings,
          keyMapping: config.keyMapping
        }) as unknown as Json
      };
      
      const { error } = await supabase
        .from('field_mappings')
        .insert(mappingData);
      
      if (error) {
        console.error("Error saving mappings:", error);
        return false;
      }
      
      console.log("Field mappings saved successfully");
      return true;
    } catch (err) {
      console.error("Error in saveMappingsToDatabase:", err);
      return false;
    }
  };

  const handleReconcile = async () => {
    if (canReconcile) {
      const success = await saveMappingsToDatabase();
      if (success) {
        onReconcile();
      } else {
        console.log("Failed to save mappings but continuing with reconciliation");
        onReconcile();
      }
    } else {
      toast.error("Please complete the configuration before reconciling");
    }
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {canReconcile && (
        <Button
          className="w-full"
          size="lg"
          onClick={handleReconcile}
        >
          Reconcile Data Sources
        </Button>
      )}
    </div>
  );
};

export default DataSourceActions;
