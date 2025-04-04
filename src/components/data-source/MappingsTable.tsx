
import React from "react";
import { DataSource, FieldMapping } from "@/types/dataSources";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeftRight, Trash2 } from "lucide-react";
import AdvancedMatchingConfig from "./AdvancedMatchingConfig";

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
  if (!sourceA || !sourceB || mappings.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No field mappings defined yet.
      </div>
    );
  }

  const getMatchingRuleDescription = (mapping: FieldMapping) => {
    if (!mapping.matchingRule || mapping.matchingRule.type === 'exact') {
      return "Exact";
    }
    
    switch (mapping.matchingRule.type) {
      case 'fuzzy':
        return `Fuzzy (${mapping.matchingRule.fuzzyThreshold})`;
      case 'numeric':
        const { type, value } = mapping.matchingRule.numericTolerance || { type: 'percentage', value: 1 };
        return `Numeric (${value}${type === 'percentage' ? '%' : ''})`;
      case 'date':
        return `Date (±${mapping.matchingRule.dateTolerance?.days || 1} days)`;
      case 'custom':
        return "Custom";
      default:
        return "Exact";
    }
  };

  return (
    <div className="relative overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">Display Name</th>
            <th className="px-4 py-3 text-left">Principal Field</th>
            <th className="px-4 py-3 text-left">Counterparty Field</th>
            <th className="px-4 py-3 text-left">Matching Rule</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {mappings.map((mapping, index) => (
            <tr key={index} className="bg-background">
              <td className="px-4 py-3">
                <input
                  className="w-full bg-transparent border-0 focus:ring-0 p-0 text-sm"
                  value={mapping.displayName}
                  onChange={(e) =>
                    onUpdateMapping(index, {
                      ...mapping,
                      displayName: e.target.value,
                    })
                  }
                />
              </td>
              <td className="px-4 py-3">
                <Select
                  value={mapping.sourceFieldA}
                  onValueChange={(value) =>
                    onUpdateMapping(index, {
                      ...mapping,
                      sourceFieldA: value,
                    })
                  }
                >
                  <SelectTrigger className="border-0 p-0 h-auto bg-transparent text-sm focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceA.fields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3">
                <Select
                  value={mapping.sourceFieldB}
                  onValueChange={(value) =>
                    onUpdateMapping(index, {
                      ...mapping,
                      sourceFieldB: value,
                    })
                  }
                >
                  <SelectTrigger className="border-0 p-0 h-auto bg-transparent text-sm focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceB.fields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center space-x-2">
                  <span>{getMatchingRuleDescription(mapping)}</span>
                  <AdvancedMatchingConfig 
                    mapping={mapping}
                    onUpdateMatchingRule={(rule) => 
                      onUpdateMapping(index, {
                        ...mapping,
                        matchingRule: rule
                      })
                    }
                  />
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSwapMappingFields(index)}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="sr-only">Swap fields</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveMapping(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove mapping</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MappingsTable;
