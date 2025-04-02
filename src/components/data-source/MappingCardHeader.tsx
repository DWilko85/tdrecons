
import React from "react";
import { 
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FieldMapping } from "@/types/dataSources";
import { Plus } from "lucide-react";

interface MappingCardHeaderProps {
  mappings: FieldMapping[];
  keyMapping: {
    sourceAField: string;
    sourceBField: string;
  };
  sourceAName?: string;
  sourceBName?: string;
  onAddMapping: () => void;
}

const MappingCardHeader: React.FC<MappingCardHeaderProps> = ({
  mappings,
  keyMapping,
  sourceAName = "Source A",
  sourceBName = "Source B",
  onAddMapping,
}) => {
  return (
    <CardHeader className="pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <CardTitle className="text-lg font-medium">Field Mappings</CardTitle>
        <CardDescription>
          Map fields from {sourceAName} to {sourceBName}
        </CardDescription>
      </div>
      <div className="flex mt-4 sm:mt-0">
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={onAddMapping}
        >
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>
    </CardHeader>
  );
};

export default MappingCardHeader;
