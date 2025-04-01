
import React from "react";
import { DataSource } from "@/types/dataSources";
import SourceSection from "./SourceSection";

interface SourceSectionsProps {
  sourceA: DataSource | null;
  sourceB: DataSource | null;
  keyMapping: {
    sourceAField: string;
    sourceBField: string;
  };
  onFileUploadForSourceA: (data: any[], fileName: string) => void;
  onFileUploadForSourceB: (data: any[], fileName: string) => void;
}

const SourceSections: React.FC<SourceSectionsProps> = ({
  sourceA,
  sourceB,
  keyMapping,
  onFileUploadForSourceA,
  onFileUploadForSourceB
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SourceSection
        title="Principal Data"
        description="Select your principal data source for reconciliation"
        badgeText="Principal"
        badgeClassName="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
        source={sourceA}
        keyField={keyMapping.sourceAField}
        onFileUpload={onFileUploadForSourceA}
      />

      <SourceSection
        title="Counterparty Data"
        description="Select the counterparty data source to compare against"
        badgeText="Counterparty"
        badgeClassName="bg-secondary text-secondary-foreground border-secondary/50 hover:bg-secondary/80"
        source={sourceB}
        keyField={keyMapping.sourceBField}
        onFileUpload={onFileUploadForSourceB}
      />
    </div>
  );
};

export default SourceSections;
