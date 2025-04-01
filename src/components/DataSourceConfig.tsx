
import React, { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import AnimatedTransition from "./AnimatedTransition";
import { DataSource, DataSourceConfig as DataSourceConfigType, FieldMapping } from "@/types/dataSources";
import { MappingTemplate } from "./data-source/MappingTemplateSelector";
import ConfigHeader from "./data-source/ConfigHeader";
import SourceSections from "./data-source/SourceSections";
import MappingFieldsSection from "./data-source/MappingFieldsSection";

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
  onApplyMappingTemplate: (template: MappingTemplate) => void;
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
  onApplyMappingTemplate,
}) => {
  const { sourceA, sourceB, mappings, keyMapping } = config;
  const [autoReconcileOnUpload, setAutoReconcileOnUpload] = useState<boolean>(false);
  const [isSavingMappings, setIsSavingMappings] = useState(false);

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

  const handleSelectTemplate = (template: MappingTemplate | null) => {
    if (template) {
      console.log("Selected template:", template);
      onApplyMappingTemplate(template);
    }
  };

  // Fix: Ensure we're correctly handling the boolean value
  const handleAutoReconcileChange = (checked: boolean) => {
    // Ensure we're setting a boolean value, not a string
    setAutoReconcileOnUpload(Boolean(checked));
  };

  const saveMappingsAsTemplate = async (templateName: string) => {
    if (!sourceA || !sourceB || mappings.length === 0) {
      toast.error("Cannot save an empty template");
      return false;
    }

    try {
      setIsSavingMappings(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      const mappingData = {
        name: templateName,
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
        console.error("Error saving template:", error);
        toast.error("Failed to save template");
        return false;
      }
      
      console.log("Mapping template saved successfully");
      return true;
    } catch (err) {
      console.error("Error in saveMappingsAsTemplate:", err);
      toast.error("Error saving template");
      return false;
    } finally {
      setIsSavingMappings(false);
    }
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
      <ConfigHeader onSelectTemplate={handleSelectTemplate} />
      
      <AnimatedTransition type="slide-up" delay={0.1}>
        <SourceSections 
          sourceA={sourceA}
          sourceB={sourceB}
          keyMapping={keyMapping}
          onFileUploadForSourceA={handleFileUploadForSourceA}
          onFileUploadForSourceB={handleFileUploadForSourceB}
        />
      </AnimatedTransition>

      {sourceA && sourceB && (
        <MappingFieldsSection
          sourceA={sourceA}
          sourceB={sourceB}
          mappings={mappings}
          keyMapping={keyMapping}
          canReconcile={canReconcile}
          isSavingMappings={isSavingMappings}
          autoReconcileOnUpload={autoReconcileOnUpload}
          onAddMapping={handleAddMapping}
          onUpdateMapping={onUpdateMapping}
          onRemoveMapping={onRemoveMapping}
          onSwapMappingFields={onSwapMappingFields}
          onAutoReconcileChange={handleAutoReconcileChange}
          onReconcile={handleReconcile}
          onSaveTemplate={saveMappingsAsTemplate}
        />
      )}
    </div>
  );
};

export default DataSourceConfig;
