
import React from "react";
import { DataSource, FieldMapping } from "@/types/dataSources";
import FieldMappingsCard from "./FieldMappingsCard";
import KeyMappingCard from "./KeyMappingCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AutoReconcileToggle from "./AutoReconcileToggle";
import SaveMappingTemplateDialog from "./SaveMappingTemplateDialog";

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
  sourceAId?: string;
  sourceBId?: string;
  onAddMapping: () => void;
  onUpdateMapping: (index: number, mapping: FieldMapping) => void;
  onRemoveMapping: (index: number) => void;
  onSwapMappingFields: (index: number) => void;
  onUpdateKeyMapping?: (sourceAField: string, sourceBField: string) => void;
  onAutoReconcileChange: (checked: boolean) => void;
  onReconcile: () => void;
}

const MappingFieldsSection: React.FC<MappingFieldsSectionProps> = ({
  sourceA,
  sourceB,
  mappings,
  keyMapping,
  canReconcile,
  isSavingMappings,
  autoReconcileOnUpload,
  sourceAId,
  sourceBId,
  onAddMapping,
  onUpdateMapping,
  onRemoveMapping,
  onSwapMappingFields,
  onUpdateKeyMapping,
  onAutoReconcileChange,
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
                <div className="flex items-center justify-between">
                  <AutoReconcileToggle
                    checked={autoReconcileOnUpload}
                    onCheckedChange={onAutoReconcileChange}
                  />
                </div>
                
                <SaveMappingTemplateDialog
                  mappings={mappings}
                  keyMapping={keyMapping}
                  sourceAId={sourceA?.id}
                  sourceBId={sourceB?.id}
                  sourceAName={sourceA?.name}
                  sourceBName={sourceB?.name}
                />
                
                {canReconcile && (
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={isSavingMappings}
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
        isSavingMappings={isSavingMappings}
        onAddMapping={onAddMapping}
        onUpdateMapping={onUpdateMapping}
        onRemoveMapping={onRemoveMapping}
        onSwapMappingFields={onSwapMappingFields}
      />
    </div>
  );
};

export default MappingFieldsSection;
