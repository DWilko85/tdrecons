
import React, { useState } from "react";
import { toast } from "sonner";
import { DataSource, DataSourceConfig as DataSourceConfigType } from "@/types/dataSources";
import { FieldMapping } from "@/types/dataSources";
import { Template } from "@/services/templatesService";
import { supabase } from "@/integrations/supabase/client";
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

  // Removed saveMappingsAsTemplate function to fix the type error

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
          isSavingMappings={false} // Fixed boolean value instead of string
          onAddMapping={handleAddMapping}
          onUpdateMapping={onUpdateMapping}
          onRemoveMapping={onRemoveMapping}
          onSwapMappingFields={onSwapMappingFields}
          onUpdateKeyMapping={onUpdateKeyMapping}
          onReconcile={onReconcile}
        />
      )}
    </div>
  );
};

export default DataSourceConfig;
