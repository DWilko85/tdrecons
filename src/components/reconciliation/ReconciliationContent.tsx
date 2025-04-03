
import React from "react";
import ReconciliationStats from "@/components/ReconciliationStats";
import ReconciliationTable from "@/components/ReconciliationTable";
import SourceInfo from "@/components/SourceInfo";
import LoadingState from "@/components/reconciliation/LoadingState";
import NoConfigMessage from "@/components/reconciliation/NoConfigMessage";
import NoResultsMessage from "@/components/reconciliation/NoResultsMessage";
import PerfectMatchBanner from "@/components/PerfectMatchBanner";
import { DataSourceConfig } from "@/hooks/useDataSources";
import { ReconciliationResult } from "@/types/dataSources";

interface ReconciliationContentProps {
  config: DataSourceConfig;
  reconciliationResults: ReconciliationResult[];
  isReconciling: boolean;
  isPerfectMatch: boolean;
  shouldShowNoConfigMessage: boolean;
  shouldShowNoResultsMessage: boolean;
  shouldShowResults: boolean;
  shouldShowLoading: boolean;
  stats: {
    total: number;
    matching: number;
    different: number;
    missingA: number;
    missingB: number;
  };
  onReconcile: () => void;
}

const ReconciliationContent: React.FC<ReconciliationContentProps> = ({
  config,
  reconciliationResults,
  isReconciling,
  isPerfectMatch,
  shouldShowNoConfigMessage,
  shouldShowNoResultsMessage,
  shouldShowResults,
  shouldShowLoading,
  stats,
  onReconcile,
}) => {
  return (
    <>
      <section>
        <div className="container max-w-6xl">
          {shouldShowLoading && <LoadingState />}
          
          {shouldShowNoConfigMessage && !isReconciling && <NoConfigMessage />}
          
          {shouldShowNoResultsMessage && (
            <NoResultsMessage onReconcile={onReconcile} />
          )}
          
          {shouldShowResults && (
            <>
              {isPerfectMatch && config.sourceA && config.sourceB && (
                <PerfectMatchBanner 
                  sourceA={config.sourceA.name}
                  sourceB={config.sourceB.name}
                  recordCount={stats.total}
                />
              )}
              
              <ReconciliationStats results={reconciliationResults} />
            </>
          )}
          
          {config.sourceA && config.sourceB && (
            <SourceInfo config={config} />
          )}

          {reconciliationResults && reconciliationResults.length > 0 && (
            <ReconciliationTable 
              results={reconciliationResults}
              isLoading={isReconciling}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default ReconciliationContent;
