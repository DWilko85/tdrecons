
import React from 'react';
import { useDataSources } from '@/hooks/useDataSources';
import { useReconcilePageState } from '@/hooks/useReconcilePageState';
import ReconciliationContent from '@/components/reconciliation/ReconciliationContent';
import ReconcileHeader from '@/components/reconciliation/ReconcileHeader';
import ClientRequired from '@/components/ClientRequired';

const Reconcile = () => {
  const { 
    config, 
    reconciliationResults,
    isReconciling,
    reconcile,
    clearResults
  } = useDataSources();
  
  const { 
    stats,
    isPerfectMatch,
    shouldShowNoConfigMessage,
    shouldShowNoResultsMessage,
    shouldShowResults,
    shouldShowLoading,
    handleReconcile
  } = useReconcilePageState();

  return (
    <ClientRequired>
      <div className="container max-w-7xl mx-auto p-4 space-y-6">
        <ReconcileHeader 
          isReconciling={isReconciling}
          hasResults={reconciliationResults.length > 0}
          onReconcile={handleReconcile}
        />
        
        <ReconciliationContent 
          config={config}
          reconciliationResults={reconciliationResults}
          isReconciling={isReconciling}
          isPerfectMatch={isPerfectMatch}
          shouldShowNoConfigMessage={shouldShowNoConfigMessage}
          shouldShowNoResultsMessage={shouldShowNoResultsMessage}
          shouldShowResults={shouldShowResults}
          shouldShowLoading={shouldShowLoading}
          stats={stats}
          onReconcile={handleReconcile}
        />
      </div>
    </ClientRequired>
  );
};

export default Reconcile;
