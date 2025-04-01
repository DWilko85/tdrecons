
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DataSourceConfig from "@/components/DataSourceConfig";
import { useDataSources } from "@/hooks/useDataSources";
import AnimatedTransition from "@/components/AnimatedTransition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MappingTemplate } from "@/components/data-source/MappingTemplateSelector";

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
    swapMappingFields,
    updateKeyMapping,
    reconcile,
    reconciliationResults,
    addFileSourceAndReconcile,
    loadDataSources,
    applyMappingTemplate
  } = useDataSources();

  // Load data sources on initial render
  useEffect(() => {
    // Check if database table exists
    checkDatabaseTable();
    
    // Load data sources
    loadDataSources();
  }, [loadDataSources]);

  // Check if database table exists and create if needed
  const checkDatabaseTable = async () => {
    try {
      // Check if we can query the data_sources table
      const { error } = await supabase
        .from('data_sources')
        .select('count')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log("Data sources table doesn't exist yet");
        toast.info("Setting up database for first use...");
      }
    } catch (err) {
      console.error("Error checking database table:", err);
    }
  };

  // Check if reconciliation has been run and navigate if needed
  useEffect(() => {
    if (reconciliationResults.length > 0) {
      navigate("/reconcile");
    }
  }, [reconciliationResults, navigate]);

  // Handle the reconciliation button click
  const handleReconcile = () => {
    console.log("Handle reconcile clicked, current config:", {
      sourceA: config.sourceA?.name,
      sourceB: config.sourceB?.name,
      mappings: config.mappings.length
    });
    
    if (!config.sourceA || !config.sourceB || config.mappings.length === 0) {
      toast.error("Please configure both data sources and field mappings");
      return;
    }
    
    // Trigger reconciliation
    reconcile();
    
    // Navigate to the results page
    navigate("/reconcile", { state: { runReconciliation: true } });
  };

  // Handle application of a mapping template
  const handleApplyMappingTemplate = (template: MappingTemplate) => {
    applyMappingTemplate(template);
    toast.success(`Applied mapping template: ${template.name}`);
  };

  // Handle file upload with potential automatic reconciliation
  const handleUploadFile = (data: any[], fileName: string, setAs?: 'sourceA' | 'sourceB' | 'auto', autoReconcile: boolean = false) => {
    console.log(`Handling file upload: ${fileName} with ${data.length} records, setAs: ${setAs}, autoReconcile: ${autoReconcile}`);
    
    // Call the async function without waiting for it
    addFileSourceAndReconcile(data, fileName, setAs, autoReconcile)
      .then(newSource => {
        if (newSource && autoReconcile && config.sourceA && config.sourceB) {
          // If auto-reconcile is enabled and we have both sources, navigate to results
          console.log("Auto-navigating to reconcile page after file upload");
          setTimeout(() => {
            navigate("/reconcile", { state: { runReconciliation: true } });
          }, 500);
        }
      })
      .catch(err => {
        console.error("Error processing file:", err);
        toast.error("Error processing file");
      });
    
    // Create a temporary DataSource to return immediately
    return {
      id: `temp-${Date.now()}`,
      name: fileName,
      type: 'uploaded' as 'uploaded' | 'csv' | 'json' | 'api',
      data: data,
      fields: Object.keys(data[0] || {}),
      keyField: Object.keys(data[0] || {})[0] || 'id'
    };
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      {/* Header */}
      <section className="pt-28 pb-10">
        <div className="container max-w-6xl">
          <AnimatedTransition type="slide-down" delay={0.1}>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-3">AI Reconcile: Configure Data Sources</h1>
              <p className="text-muted-foreground text-lg">
                Set up your principal and counterparty data sources and field mappings to begin the reconciliation process
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
            onSwapMappingFields={swapMappingFields}
            onUpdateKeyMapping={updateKeyMapping}
            onReconcile={handleReconcile}
            onFileUpload={handleUploadFile}
            onApplyMappingTemplate={handleApplyMappingTemplate}
          />
        </div>
      </section>
    </div>
  );
};

export default Configure;
