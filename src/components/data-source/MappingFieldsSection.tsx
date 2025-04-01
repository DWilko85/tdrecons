
import React from "react";
import { DataSource, FieldMapping } from "@/types/dataSources";
import AnimatedTransition from "@/components/AnimatedTransition";
import FieldMappingsCard from "./FieldMappingsCard";

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

  return (
    <AnimatedTransition type="slide-up" delay={0.2}>
      <FieldMappingsCard
        sourceA={sourceA}
        sourceB={sourceB}
        mappings={mappings}
        keyMapping={keyMapping}
        canReconcile={canReconcile}
        isSavingMappings={isSavingMappings}
        autoReconcileOnUpload={autoReconcileOnUpload}
        onAddMapping={onAddMapping}
        onUpdateMapping={onUpdateMapping}
        onRemoveMapping={onRemoveMapping}
        onSwapMappingFields={onSwapMappingFields}
        onAutoReconcileChange={onAutoReconcileChange}
        onReconcile={onReconcile}
        onSaveTemplate={onSaveTemplate}
      />
    </AnimatedTransition>
  );
};

export default MappingFieldsSection;
