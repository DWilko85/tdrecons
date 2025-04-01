
import React from "react";
import { DataSource, FieldMapping } from "@/hooks/useDataSources";
import AnimatedTransition from "@/components/AnimatedTransition";
import FieldMappingsCard from "./FieldMappingsCard";
import DataSourceActions from "./DataSourceActions";

interface MappingFieldsSectionProps {
  sourceA: DataSource | null;
  sourceB: DataSource | null;
  mappings: FieldMapping[];
  keyMapping: {
    sourceAField: string;
    sourceBField: string;
  };
  canReconcile: boolean;
  isSavingMappings: boolean;
  autoReconcileOnUpload: boolean;
  onAddMapping: () => void;
  onUpdateMapping: (index: number, mapping: FieldMapping) => void;
  onRemoveMapping: (index: number) => void;
  onSwapMappingFields: (index: number) => void;
  onAutoReconcileChange: (checked: boolean) => void;
  onReconcile: () => void;
  onSaveTemplate: (name: string) => Promise<boolean>;
}

const MappingFieldsSection: React.FC<MappingFieldsSectionProps> = ({
  sourceA,
  sourceB,
  mappings,
  keyMapping,
  canReconcile,
  isSavingMappings,
  autoReconcileOnUpload,
  onAddMapping,
  onUpdateMapping,
  onRemoveMapping,
  onSwapMappingFields,
  onAutoReconcileChange,
  onReconcile,
  onSaveTemplate,
}) => {
  if (!sourceA || !sourceB) return null;
  
  const config = {
    sourceA,
    sourceB,
    mappings,
    keyMapping
  };

  return (
    <AnimatedTransition type="slide-up" delay={0.2}>
      <FieldMappingsCard
        sourceA={sourceA}
        sourceB={sourceB}
        mappings={mappings}
        keyMapping={keyMapping}
        canReconcile={canReconcile}
        isSavingMappings={isSavingMappings}
        onAddMapping={onAddMapping}
        onUpdateMapping={onUpdateMapping}
        onRemoveMapping={onRemoveMapping}
        onSwapMappingFields={onSwapMappingFields}
        onSaveTemplate={onSaveTemplate}
      />
      
      <div className="mt-6">
        <DataSourceActions
          config={config}
          canReconcile={canReconcile}
          isSavingMappings={isSavingMappings}
          autoReconcileOnUpload={autoReconcileOnUpload}
          onAutoReconcileChange={onAutoReconcileChange}
          onReconcile={onReconcile}
          onSaveTemplate={onSaveTemplate}
        />
      </div>
    </AnimatedTransition>
  );
};

export default MappingFieldsSection;
