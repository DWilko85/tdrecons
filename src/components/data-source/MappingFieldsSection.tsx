
import React from "react";
import { DataSource, FieldMapping } from "@/types/dataSources";
import FieldMappingsCard from "./FieldMappingsCard";
import KeyMappingCard from "./KeyMappingCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MappingFieldsSectionProps {
  sourceA: DataSource | null;
  sourceB: DataSource | null;
  mappings: FieldMapping[];
  keyMapping: {
    sourceAField: string;
    sourceBField: string;
  };
  canReconcile: boolean;
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
      <div className="grid md:grid-cols-2 gap-6">
        {onUpdateKeyMapping && (
          <KeyMappingCard
            sourceA={sourceA}
            sourceB={sourceB}
            keyMapping={keyMapping}
            onUpdateKeyMapping={onUpdateKeyMapping}
          />
        )}
        
        <div className="flex flex-col gap-6">
          <div>
            <Card className="border border-border/50 shadow-sm">
              <CardContent className="p-4 space-y-4">
                {canReconcile && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={onReconcile}
                  >
                    Reconcile Data Sources
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
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
    </div>
  );
};

export default MappingFieldsSection;
