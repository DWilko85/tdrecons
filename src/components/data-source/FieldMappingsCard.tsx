
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataSource, FieldMapping } from "@/hooks/useDataSources";
import MappingsTable from "./MappingsTable";
import AutoReconcileToggle from "./AutoReconcileToggle";
import ReconcileButton from "./ReconcileButton";

interface FieldMappingsCardProps {
  sourceA: DataSource | null;
  sourceB: DataSource | null;
  mappings: FieldMapping[];
  canReconcile: boolean;
  isSavingMappings: boolean;
  autoReconcileOnUpload: boolean;
  onAddMapping: () => void;
  onUpdateMapping: (index: number, mapping: FieldMapping) => void;
  onRemoveMapping: (index: number) => void;
  onSwapMappingFields: (index: number) => void;
  onAutoReconcileChange: (checked: boolean) => void;
  onReconcile: () => void;
}

const FieldMappingsCard: React.FC<FieldMappingsCardProps> = ({
  sourceA,
  sourceB,
  mappings,
  canReconcile,
  isSavingMappings,
  autoReconcileOnUpload,
  onAddMapping,
  onUpdateMapping,
  onRemoveMapping,
  onSwapMappingFields,
  onAutoReconcileChange,
  onReconcile,
}) => {
  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Field Mappings</CardTitle>
            <CardDescription>
              Configure which fields to compare between data sources
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={onAddMapping}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Mapping
          </Button>
        </div>
      </CardHeader>
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
      <CardFooter className="border-t pt-4">
        <div className="w-full flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <AutoReconcileToggle
              checked={autoReconcileOnUpload}
              onCheckedChange={onAutoReconcileChange}
            />
          </div>
          
          {canReconcile && (
            <ReconcileButton
              onClick={onReconcile}
              disabled={isSavingMappings}
              isLoading={isSavingMappings}
            />
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default FieldMappingsCard;
