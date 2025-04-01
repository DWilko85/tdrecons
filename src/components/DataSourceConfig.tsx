
import React from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import AnimatedTransition from "./AnimatedTransition";
import { DataSource, DataSourceConfig as DataSourceConfigType, FieldMapping } from "@/hooks/useDataSources";
import SourceSection from "./data-source/SourceSection";
import FieldMappingsCard from "./data-source/FieldMappingsCard";

interface DataSourceConfigProps {
  availableSources: DataSource[];
  config: DataSourceConfigType;
  onSetSourceA: (source: DataSource | null) => void;
  onSetSourceB: (source: DataSource | null) => void;
  onUpdateMapping: (index: number, mapping: FieldMapping) => void;
  onAddMapping: () => void;
  onRemoveMapping: (index: number) => void;
  onSwapMappingFields: (index: number) => void;
  onUpdateKeyMapping: (sourceAField: string, sourceBField: string) => void;
  onReconcile: () => void;
  onFileUpload: (data: any[], fileName: string, setAs?: 'sourceA' | 'sourceB' | 'auto', autoReconcile?: boolean) => DataSource | null | undefined;
}

const DataSourceConfig: React.FC<DataSourceConfigProps> = ({
  availableSources,
  config,
  onSetSourceA,
  onSetSourceB,
  onUpdateMapping,
  onAddMapping,
  onRemoveMapping,
  onSwapMappingFields,
  onUpdateKeyMapping,
  onReconcile,
  onFileUpload,
}) => {
  const { sourceA, sourceB, mappings, keyMapping } = config;
  const [autoReconcileOnUpload, setAutoReconcileOnUpload] = React.useState(false);
  const [isSavingMappings, setIsSavingMappings] = React.useState(false);

  const canReconcile = 
    sourceA !== null && 
    sourceB !== null && 
    mappings.length > 0 && 
    keyMapping.sourceAField && 
    keyMapping.sourceBField;

  const handleFileUploadForSourceA = (data: any[], fileName: string) => {
    onFileUpload(data, fileName, 'sourceA', autoReconcileOnUpload);
  };

  const handleFileUploadForSourceB = (data: any[], fileName: string) => {
    onFileUpload(data, fileName, 'sourceB', autoReconcileOnUpload);
  };

  const handleAddMapping = () => {
    if (!sourceA || !sourceB) {
      toast.error("Please select both data sources first");
      return;
    }
    
    onAddMapping();
  };

  const saveMappingsToDatabase = async () => {
    if (!sourceA || !sourceB || mappings.length === 0) {
      return false;
    }

    try {
      setIsSavingMappings(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        console.log("No user ID available for saving mappings");
        return true;
      }
      
      const mappingName = `${sourceA.name} to ${sourceB.name} mapping`;
      
      const mappingData = {
        name: mappingName,
        file_a_id: sourceA.id,
        file_b_id: sourceB.id,
        user_id: userId,
        mapping: JSON.stringify({
          fields: mappings,
          keyMapping: keyMapping
        }) as unknown as Json
      };
      
      const { error } = await supabase
        .from('field_mappings')
        .insert(mappingData);
      
      if (error) {
        console.error("Error saving mappings:", error);
        return true;
      }
      
      console.log("Field mappings saved successfully");
      return true;
    } catch (err) {
      console.error("Error in saveMappingsToDatabase:", err);
      return true;
    } finally {
      setIsSavingMappings(false);
    }
  };

  const handleReconcile = async () => {
    if (canReconcile) {
      await saveMappingsToDatabase();
      onReconcile();
    } else {
      toast.error("Please complete the configuration before reconciling");
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedTransition type="slide-up" delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SourceSection
            title="Principal Data"
            description="Select your principal data source for reconciliation"
            badgeText="Principal"
            badgeClassName="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            source={sourceA}
            keyField={keyMapping.sourceAField}
            onFileUpload={handleFileUploadForSourceA}
          />

          <SourceSection
            title="Counterparty Data"
            description="Select the counterparty data source to compare against"
            badgeText="Counterparty"
            badgeClassName="bg-secondary text-secondary-foreground border-secondary/50 hover:bg-secondary/80"
            source={sourceB}
            keyField={keyMapping.sourceBField}
            onFileUpload={handleFileUploadForSourceB}
          />
        </div>
      </AnimatedTransition>

      {sourceA && sourceB && (
        <AnimatedTransition type="slide-up" delay={0.2}>
          <FieldMappingsCard
            sourceA={sourceA}
            sourceB={sourceB}
            mappings={mappings}
            canReconcile={canReconcile}
            isSavingMappings={isSavingMappings}
            autoReconcileOnUpload={autoReconcileOnUpload}
            onAddMapping={handleAddMapping}
            onUpdateMapping={onUpdateMapping}
            onRemoveMapping={onRemoveMapping}
            onSwapMappingFields={onSwapMappingFields}
            onAutoReconcileChange={setAutoReconcileOnUpload}
            onReconcile={handleReconcile}
          />
        </AnimatedTransition>
      )}
    </div>
  );
};

export default DataSourceConfig;
