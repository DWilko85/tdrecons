
import React from "react";
import { Badge } from "@/components/ui/badge";
import AnimatedTransition from "@/components/AnimatedTransition";
import { DataSourceConfig } from "@/hooks/useDataSources";

interface SourceInfoProps {
  config: DataSourceConfig;
}

const SourceInfo: React.FC<SourceInfoProps> = ({ config }) => {
  if (!config.sourceA || !config.sourceB) return null;

  return (
    <AnimatedTransition type="fade" delay={0.3}>
      <div className="flex flex-col sm:flex-row items-start gap-4 mb-10 text-sm">
        <div className="border rounded-md p-3 flex-1">
          <div className="text-muted-foreground mb-2">Principal</div>
          <div className="font-medium">{config.sourceA.name}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs font-normal">
              {config.sourceA.type.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {config.sourceA.data.length} records
            </span>
          </div>
        </div>
        <div className="border rounded-md p-3 flex-1">
          <div className="text-muted-foreground mb-2">Counterparty</div>
          <div className="font-medium">{config.sourceB.name}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs font-normal">
              {config.sourceB.type.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {config.sourceB.data.length} records
            </span>
          </div>
        </div>
        <div className="border rounded-md p-3 flex-1">
          <div className="text-muted-foreground mb-2">Key Mapping</div>
          <div className="font-medium">
            {config.keyMapping.sourceAField} ↔ {config.keyMapping.sourceBField}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            {config.mappings.length} field{config.mappings.length !== 1 ? 's' : ''} mapped for comparison
          </div>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default SourceInfo;
