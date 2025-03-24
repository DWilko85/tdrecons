
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DataSourceConfig from "@/components/DataSourceConfig";
import { useDataSources } from "@/hooks/useDataSources";
import AnimatedTransition from "@/components/AnimatedTransition";

const Configure = () => {
  const navigate = useNavigate();
  const { 
    availableSources,
    config,
    setSourceA,
    setSourceB,
    updateMapping,
    addMapping,
    removeMapping,
    updateKeyMapping,
    reconcile,
    reconciliationResults,
  } = useDataSources();

  // Navigate to reconcile page after running reconciliation
  useEffect(() => {
    if (reconciliationResults.length > 0) {
      navigate("/reconcile");
    }
  }, [reconciliationResults, navigate]);

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      {/* Header */}
      <section className="pt-28 pb-10">
        <div className="container max-w-6xl">
          <AnimatedTransition type="slide-down" delay={0.1}>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-3">Configure Data Sources</h1>
              <p className="text-muted-foreground text-lg">
                Set up your data sources and field mappings to begin the reconciliation process
              </p>
            </div>
          </AnimatedTransition>
        </div>
      </section>
      
      {/* Config Form */}
      <section>
        <div className="container max-w-6xl">
          <DataSourceConfig 
            availableSources={availableSources}
            config={config}
            onSetSourceA={setSourceA}
            onSetSourceB={setSourceB}
            onUpdateMapping={updateMapping}
            onAddMapping={addMapping}
            onRemoveMapping={removeMapping}
            onUpdateKeyMapping={updateKeyMapping}
            onReconcile={reconcile}
          />
        </div>
      </section>
    </div>
  );
};

export default Configure;
