
import React from "react";
import { 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FieldMapping } from "@/types/dataSources";
import SaveMappingTemplateDialog from "./SaveMappingTemplateDialog";

interface MappingCardHeaderProps {
  mappings: FieldMapping[];
  keyMapping: {
    sourceAField: string;
    sourceBField: string;
  };
  sourceAName: string | undefined;
  sourceBName: string | undefined;
  onAddMapping: () => void;
  onSaveTemplate: (name: string) => Promise<boolean>;
}

const MappingCardHeader: React.FC<MappingCardHeaderProps> = ({
  mappings,
  keyMapping,
  sourceAName,
  sourceBName,
  onAddMapping,
  onSaveTemplate,
}) => {
  return (
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
            sourceAName={sourceAName}
            sourceBName={sourceBName}
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
  );
};

export default MappingCardHeader;
