
import React from "react";
import { DataSource, FieldMapping } from "@/types/dataSources";
import FieldMappingsCard from "./FieldMappingsCard";
import KeyMappingCard from "./KeyMappingCard";

interface MappingFieldsSectionProps {
  sourceA: DataSource | null;
  sourceB: DataSource | null;
  mappings: FieldMapping[];
  keyMapping: {
    sourceAField: string;
    sourceBField: string;
  };
  canReconcile: boolean;  // This must be a boolean type, not a string
  sourceAId?: string;
  sourceBId?: string;
  onAddMapping: () => void;
  onUpdateMapping: (index: number, mapping: FieldMapping) => void;
  onRemoveMapping: (index: number) => void;
  onSwapMappingFields: (index: number) => void;
  onUpdateKeyMapping?: (sourceAField: string, sourceBField: string) => void;
  onReconcile: () => void;
}

const MappingFieldsSection: React.FC<MappingFieldsSectionProps> = ({
  sourceA,
  sourceB,
  mappings,
  keyMapping,
  canReconcile,
  onAddMapping,
  onUpdateMapping,
  onRemoveMapping,
  onSwapMappingFields,
  onUpdateKeyMapping,
  onReconcile,
}) => {
  return (
    <div className="space-y-6">
      {/* Key mapping card - now full width */}
      {onUpdateKeyMapping && (
        <KeyMappingCard
          sourceA={sourceA}
          sourceB={sourceB}
          keyMapping={keyMapping}
          onUpdateKeyMapping={onUpdateKeyMapping}
        />
      )}
      
      <FieldMappingsCard
        sourceA={sourceA}
        sourceB={sourceB}
        mappings={mappings}
        keyMapping={keyMapping}
        canReconcile={canReconcile}
        onAddMapping={onAddMapping}
        onUpdateMapping={onUpdateMapping}
        onRemoveMapping={onRemoveMapping}
        onSwapMappingFields={onSwapMappingFields}
      />
      
      {/* Reconcile button now moved to bottom */}
    </div>
  );
};

export default MappingFieldsSection;
