
import React, { useState } from "react";
import { toast } from "sonner";
import { DataSource, DataSourceConfig as DataSourceConfigType } from "@/types/dataSources";
import { FieldMapping } from "@/types/dataSources";
import { supabase } from "@/integrations/supabase/client";
import AnimatedTransition from "../AnimatedTransition";
import SourceSections from "./SourceSections";
import MappingFieldsSection from "./MappingFieldsSection";
import DataSourceActions from "./DataSourceActions";

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

  // Explicitly ensure this evaluates to a boolean by using Boolean casting
  const canReconcile: boolean = Boolean(
    sourceA !== null && 
    sourceB !== null && 
    mappings.length > 0 && 
    keyMapping.sourceAField && 
    keyMapping.sourceBField
  );

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

  return (
    <div className="space-y-6">
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
        <>
          <MappingFieldsSection
            sourceA={sourceA}
            sourceB={sourceB}
            mappings={mappings}
            keyMapping={keyMapping}
            canReconcile={canReconcile}
            onAddMapping={handleAddMapping}
            onUpdateMapping={onUpdateMapping}
            onRemoveMapping={onRemoveMapping}
            onSwapMappingFields={onSwapMappingFields}
            onUpdateKeyMapping={onUpdateKeyMapping}
            onReconcile={onReconcile}
          />
          
          {/* DataSourceActions moved to bottom of page */}
          {canReconcile && (
            <AnimatedTransition type="slide-up" delay={0.3}>
              <DataSourceActions
                config={config}
                canReconcile={canReconcile}
                onReconcile={onReconcile}
              />
            </AnimatedTransition>
          )}
        </>
      )}
    </div>
  );
};

export default DataSourceConfig;
