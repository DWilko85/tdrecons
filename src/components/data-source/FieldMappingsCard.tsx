
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
import SaveMappingTemplateDialog from "./SaveMappingTemplateDialog";

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
  onSaveTemplate: (name: string) => Promise<boolean>;
}

const FieldMappingsCard: React.FC<FieldMappingsCardProps> = ({
  sourceA,
  sourceB,
  mappings,
  keyMapping,
  canReconcile,
  isSavingMappings,
  onAddMapping,
  onUpdateMapping,
  onRemoveMapping,
  onSwapMappingFields,
  onSaveTemplate,
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
          <div className="flex gap-2">
            <SaveMappingTemplateDialog 
              mappings={mappings}
              keyMapping={keyMapping}
              onSave={onSaveTemplate}
              sourceAName={sourceA?.name}
              sourceBName={sourceB?.name}
            />
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
    </Card>
  );
};

export default FieldMappingsCard;
