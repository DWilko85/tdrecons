
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataSource } from "@/types/dataSources";
import { Key } from "lucide-react";

interface KeyMappingCardProps {
  sourceA: DataSource | null;
  sourceB: DataSource | null;
  keyMapping: {
    sourceAField: string;
    sourceBField: string;
  };
  onUpdateKeyMapping: (sourceAField: string, sourceBField: string) => void;
}

const KeyMappingCard: React.FC<KeyMappingCardProps> = ({
  sourceA,
  sourceB,
  keyMapping,
  onUpdateKeyMapping,
}) => {
  const handleSourceAKeyChange = (value: string) => {
    onUpdateKeyMapping(value, keyMapping.sourceBField);
  };

  const handleSourceBKeyChange = (value: string) => {
    onUpdateKeyMapping(keyMapping.sourceAField, value);
  };

  if (!sourceA || !sourceB) {
    return null;
  }

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Key className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Key Mapping</CardTitle>
            <CardDescription>
              Define the key fields that uniquely identify records in each data source
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Principal Key Field</label>
            <Select 
              value={keyMapping.sourceAField}
              onValueChange={handleSourceAKeyChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select key field" />
              </SelectTrigger>
              <SelectContent>
                {sourceA.fields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Counterparty Key Field</label>
            <Select 
              value={keyMapping.sourceBField}
              onValueChange={handleSourceBKeyChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select key field" />
              </SelectTrigger>
              <SelectContent>
                {sourceB.fields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KeyMappingCard;
