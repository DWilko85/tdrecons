
import React from 'react';
import { useDataSources } from '@/hooks/useDataSources';
import { useReconcilePageState } from '@/hooks/useReconcilePageState';
import ReconciliationContent from '@/components/reconciliation/ReconciliationContent';
import ReconcileHeader from '@/components/reconciliation/ReconcileHeader';
import NoConfigMessage from '@/components/reconciliation/NoConfigMessage';
import NoResultsMessage from '@/components/reconciliation/NoResultsMessage';
import LoadingState from '@/components/reconciliation/LoadingState';
import { useAuth } from '@/contexts/AuthContext';
import ClientRequired from '@/components/ClientRequired';

const Reconcile = () => {
  const { 
    config, 
    reconciliationResults,
    isReconciling,
    reconcile,
    clearResults
  } = useDataSources();
  
  const { mode, setMode } = useReconcilePageState();
  const { currentClient } = useAuth();

  const handleReconcile = () => {
    if (!currentClient) {
      return;
    }
    reconcile();
  };

  const renderContent = () => {
    if (isReconciling) {
      return <LoadingState />;
    }
    
    if (mode === 'results' && reconciliationResults.length > 0) {
      return (
        <ReconciliationContent 
          results={reconciliationResults} 
          onBack={() => {
            setMode('reconcile');
            clearResults();
          }}
        />
      );
    }
    
    if (!config.sourceA || !config.sourceB) {
      return <NoConfigMessage />;
    }
    
    return <NoResultsMessage onReconcile={handleReconcile} isLoading={isReconciling} />;
  };

  return (
    <ClientRequired>
      <div className="container max-w-7xl mx-auto p-4 space-y-6">
        <ReconcileHeader />
        {renderContent()}
      </div>
    </ClientRequired>
  );
};

export default Reconcile;
