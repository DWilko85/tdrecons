
import React, { useState } from "react";
import { toast } from "sonner";
import { DataSource, DataSourceConfig as DataSourceConfigType } from "@/types/dataSources";
import { FieldMapping } from "@/types/dataSources";
import { Template } from "@/services/templatesService";
import { supabase } from "@/integrations/supabase/client";
import { saveTemplate } from "@/services/templatesService";
import AnimatedTransition from "../AnimatedTransition";
import ConfigHeader from "./ConfigHeader";
import SourceSections from "./SourceSections";
import MappingFieldsSection from "./MappingFieldsSection";

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
  onFileUpload: (data: any[], fileName: string, setAs?: 'sourceA' | 'sourceB' | 'auto') => DataSource | null | undefined;
  onApplyMappingTemplate: (template: Template) => void;
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
  const [isSavingMappings, setIsSavingMappings] = useState(false);

  const canReconcile = 
    sourceA !== null && 
    sourceB !== null && 
    mappings.length > 0 && 
    keyMapping.sourceAField && 
    keyMapping.sourceBField;

  const handleFileUploadForSourceA = (data: any[], fileName: string) => {
    onFileUpload(data, fileName, 'sourceA');
  };

  const handleFileUploadForSourceB = (data: any[], fileName: string) => {
    onFileUpload(data, fileName, 'sourceB');
  };

  const handleAddMapping = () => {
    if (!sourceA || !sourceB) {
      toast.error("Please select both data sources first");
      return;
    }
    
    onAddMapping();
  };

  const handleSelectTemplate = (template: Template | null) => {
    if (template) {
      console.log("Selected template:", template);
      onApplyMappingTemplate(template);
    }
  };

  const saveMappingsAsTemplate = async (templateName: string): Promise<boolean> => {
    if (!sourceA || !sourceB || mappings.length === 0) {
      toast.error("Cannot save an empty template");
      return false;
    }

    try {
      setIsSavingMappings(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        console.log("No user ID available for saving mappings");
        return false;
      }
      
      // Use the imported saveTemplate function here
      const success = await saveTemplate(
        templateName,
        null, // No description from this method
        { mappings, keyMapping },
        sourceA.id,
        sourceB.id
      );
      
      if (success) {
        console.log("Mapping template saved successfully");
        toast.success("Template saved successfully");
        return true;
      } else {
        toast.error("Failed to save template");
        return false;
      }
    } catch (err) {
      console.error("Error in saveMappingsAsTemplate:", err);
      toast.error("Error saving template");
      return false;
    } finally {
      setIsSavingMappings(false);
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
          onAddMapping={handleAddMapping}
          onUpdateMapping={onUpdateMapping}
          onRemoveMapping={onRemoveMapping}
          onSwapMappingFields={onSwapMappingFields}
          onUpdateKeyMapping={onUpdateKeyMapping}
          onReconcile={onReconcile}
          onSaveTemplate={saveMappingsAsTemplate}
        />
      )}
    </div>
  );
};

export default DataSourceConfig;
