
import React from "react";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { DataSource, FieldMapping } from "@/types/dataSources";
import MappingsTable from "./MappingsTable";
import MappingCardHeader from "./MappingCardHeader";

interface FieldMappingsCardProps {
  sourceA: DataSource | null;
  sourceB: DataSource | null;
  mappings: FieldMapping[];
  keyMapping: {
    sourceAField: string;
    sourceBField: string;
  };
  canReconcile: boolean;
  isSavingMappings: boolean;
  onAddMapping: () => void;
  onUpdateMapping: (index: number, mapping: FieldMapping) => void;
  onRemoveMapping: (index: number) => void;
  onSwapMappingFields: (index: number) => void;
}

const FieldMappingsCard: React.FC<FieldMappingsCardProps> = ({
  sourceA,
  sourceB,
  mappings,
  keyMapping,
  onAddMapping,
  onUpdateMapping,
  onRemoveMapping,
  onSwapMappingFields,
}) => {
  return (
    <Card className="border border-border/50 shadow-sm">
      <MappingCardHeader
        mappings={mappings}
        keyMapping={keyMapping}
        sourceAName={sourceA?.name}
        sourceBName={sourceB?.name}
        onAddMapping={onAddMapping}
      />
      <CardContent>
        <MappingsTable 
          mappings={mappings}
          sourceA={sourceA}
          sourceB={sourceB}
          onUpdateMapping={onUpdateMapping}
          onSwapMappingFields={onSwapMappingFields}
          onRemoveMapping={onRemoveMapping}
        />
      </CardContent>
    </Card>
  );
};

export default FieldMappingsCard;
