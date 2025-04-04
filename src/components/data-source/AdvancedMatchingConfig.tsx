
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MatchingRule, FieldMapping } from "@/types/dataSources";
import { Settings } from "lucide-react";

interface AdvancedMatchingConfigProps {
  mapping: FieldMapping;
  onUpdateMatchingRule: (rule: MatchingRule | undefined) => void;
}

const AdvancedMatchingConfig: React.FC<AdvancedMatchingConfigProps> = ({
  mapping,
  onUpdateMatchingRule
}) => {
  const [matchingRule, setMatchingRule] = React.useState<MatchingRule | undefined>(
    mapping.matchingRule || { type: 'exact' }
  );

  const handleRuleTypeChange = (value: 'exact' | 'fuzzy' | 'numeric' | 'date' | 'custom') => {
    let newRule: MatchingRule = { type: value };
    
    // Set default values based on type
    if (value === 'fuzzy') {
      newRule.fuzzyThreshold = 0.8;
    } else if (value === 'numeric') {
      newRule.numericTolerance = {
        type: 'percentage',
        value: 1 // 1%
      };
    } else if (value === 'date') {
      newRule.dateTolerance = {
        days: 1
      };
    }
    
    setMatchingRule(newRule);
  };

  const handleSave = () => {
    onUpdateMatchingRule(matchingRule);
  };

  const handleReset = () => {
    onUpdateMatchingRule(undefined);
    setMatchingRule({ type: 'exact' });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Configure matching rule</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Advanced Matching Configuration</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rule-type">Matching Rule Type</Label>
            <Select
              value={matchingRule?.type || 'exact'}
              onValueChange={(value: any) => handleRuleTypeChange(value)}
            >
              <SelectTrigger id="rule-type">
                <SelectValue placeholder="Select matching type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exact">Exact Match</SelectItem>
                <SelectItem value="fuzzy">Fuzzy Match</SelectItem>
                <SelectItem value="numeric">Numeric Match (with tolerance)</SelectItem>
                <SelectItem value="date">Date Match (with tolerance)</SelectItem>
                <SelectItem value="custom">Custom Rule</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {matchingRule?.type === 'fuzzy' && (
            <div className="space-y-2">
              <Label htmlFor="fuzzy-threshold">
                Fuzzy Match Threshold (0-1)
              </Label>
              <Input
                id="fuzzy-threshold"
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={matchingRule.fuzzyThreshold || 0.8}
                onChange={(e) => 
                  setMatchingRule({
                    ...matchingRule,
                    fuzzyThreshold: parseFloat(e.target.value)
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Higher values require closer matches. 1.0 is equivalent to exact matching.
              </p>
            </div>
          )}

          {matchingRule?.type === 'numeric' && (
            <div className="space-y-4">
              <div>
                <Label>Tolerance Type</Label>
                <RadioGroup
                  value={matchingRule.numericTolerance?.type || 'percentage'}
                  onValueChange={(value: 'absolute' | 'percentage') => 
                    setMatchingRule({
                      ...matchingRule,
                      numericTolerance: {
                        type: value,
                        value: matchingRule.numericTolerance?.value || 1
                      }
                    })
                  }
                  className="flex items-center space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="percentage" id="percentage" />
                    <Label htmlFor="percentage">Percentage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="absolute" id="absolute" />
                    <Label htmlFor="absolute">Absolute</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tolerance-value">
                  {matchingRule.numericTolerance?.type === 'percentage' 
                    ? 'Percentage Tolerance (%)' 
                    : 'Absolute Tolerance'}
                </Label>
                <Input
                  id="tolerance-value"
                  type="number"
                  min="0"
                  step={matchingRule.numericTolerance?.type === 'percentage' ? '0.1' : '1'}
                  value={matchingRule.numericTolerance?.value || 1}
                  onChange={(e) => 
                    setMatchingRule({
                      ...matchingRule,
                      numericTolerance: {
                        type: matchingRule.numericTolerance?.type || 'percentage',
                        value: parseFloat(e.target.value)
                      }
                    })
                  }
                />
              </div>
            </div>
          )}

          {matchingRule?.type === 'date' && (
            <div className="space-y-2">
              <Label htmlFor="date-tolerance">
                Date Tolerance (days)
              </Label>
              <Input
                id="date-tolerance"
                type="number"
                min="0"
                value={matchingRule.dateTolerance?.days || 1}
                onChange={(e) => 
                  setMatchingRule({
                    ...matchingRule,
                    dateTolerance: {
                      days: parseInt(e.target.value)
                    }
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Maximum allowed difference in days between dates.
              </p>
            </div>
          )}

          {matchingRule?.type === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-rule">
                Custom Rule
              </Label>
              <Input
                id="custom-rule"
                placeholder="Enter custom rule expression"
                value={matchingRule.customRule || ''}
                onChange={(e) => 
                  setMatchingRule({
                    ...matchingRule,
                    customRule: e.target.value
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                For future use: Define custom matching logic.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Exact Match
          </Button>
          <DialogClose asChild>
            <Button onClick={handleSave}>Save Rule</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedMatchingConfig;
