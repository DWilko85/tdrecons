
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftRight, Trash2, AlertCircle } from "lucide-react";
import { DataSource, FieldMapping } from "@/hooks/useDataSources";

interface MappingsTableProps {
  mappings: FieldMapping[];
  sourceA: DataSource | null;
  sourceB: DataSource | null;
  onUpdateMapping: (index: number, mapping: FieldMapping) => void;
  onSwapMappingFields: (index: number) => void;
  onRemoveMapping: (index: number) => void;
}

const MappingsTable: React.FC<MappingsTableProps> = ({
  mappings,
  sourceA,
  sourceB,
  onUpdateMapping,
  onSwapMappingFields,
  onRemoveMapping,
}) => {
  const getSourceFields = (source: DataSource | null) => {
    if (!source) return [];
    return source.fields;
  };
  
  const handleFieldChange = (index: number, field: string, isSourceA: boolean) => {
    const mapping = mappings[index];
    const updatedMapping = isSourceA 
      ? { ...mapping, sourceFieldA: field }
      : { ...mapping, sourceFieldB: field };

    if (updatedMapping.sourceFieldA && updatedMapping.sourceFieldB) {
      updatedMapping.displayName = getDisplayName(updatedMapping.sourceFieldA, updatedMapping.sourceFieldB);
    }

    onUpdateMapping(index, updatedMapping);
  };

  const getDisplayName = (fieldA: string, fieldB: string): string => {
    if (fieldA.toLowerCase() === fieldB.toLowerCase()) {
      return toTitleCase(fieldA);
    }
    
    return toTitleCase(fieldA.length <= fieldB.length ? fieldA : fieldB);
  };

  const toTitleCase = (str: string): string => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_([a-z])/g, (_, char) => ' ' + char.toUpperCase())
      .trim();
  };

  if (mappings.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
          <div className="text-muted-foreground">
            <p>No field mappings configured yet</p>
            <p className="text-sm">Click "Add Mapping" to start configuring fields to compare</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[32%]">Principal Field</TableHead>
            <TableHead className="w-8 px-0 text-center"></TableHead>
            <TableHead className="w-[32%]">Counterparty Field</TableHead>
            <TableHead>Display Name</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mappings.map((mapping, index) => (
            <TableRow key={index} className="group">
              <TableCell className="py-2">
                <Select 
                  value={mapping.sourceFieldA}
                  onValueChange={(value) => handleFieldChange(index, value, true)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSourceFields(sourceA).map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="px-0 text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-muted"
                  onClick={() => onSwapMappingFields(index)}
                  title="Swap fields"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </Button>
              </TableCell>
              <TableCell className="py-2">
                <Select 
                  value={mapping.sourceFieldB}
                  onValueChange={(value) => handleFieldChange(index, value, false)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {getSourceFields(sourceB).map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="py-2">
                <Input
                  className="h-8"
                  value={mapping.displayName}
                  onChange={(e) => onUpdateMapping(index, {...mapping, displayName: e.target.value})}
                />
              </TableCell>
              <TableCell className="p-2 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-70 hover:opacity-100"
                  onClick={() => onRemoveMapping(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MappingsTable;
