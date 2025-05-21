import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DataSourceConfig } from "@/hooks/useDataSources";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
  const [isSaving, setIsSaving] = useState(false);

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
      setIsSaving(true);
      try {
        await saveMappingsToDatabase();
        onReconcile();
      } catch (error) {
        console.error("Error during reconciliation:", error);
        toast.error("Failed to start reconciliation");
      } finally {
        setIsSaving(false);
      }
    } else {
      toast.error("Please complete the configuration before reconciling");
    }
  };

  return (
    <div className="w-full flex justify-center pb-8">
      <Button
        className="w-full max-w-2xl"
        size="lg"
        onClick={handleReconcile}
        disabled={isSaving || !canReconcile}
      >
        {isSaving ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            <span>Processing</span>
          </>
        ) : (
          "Reconcile Data Sources"
        )}
      </Button>
    </div>
  );
};

export default DataSourceActions;
