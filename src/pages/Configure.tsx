import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import DataSourceConfig from "@/components/data-source/DataSourceConfig";
import { useDataSources } from "@/hooks/useDataSources";
import AnimatedTransition from "@/components/AnimatedTransition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SaveConfigDialog from "@/components/SaveConfigDialog";

const Configure = () => {
  const navigate = useNavigate();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
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
    loadDataSources
  } = useDataSources();

  useEffect(() => {
    checkDatabaseTable();
    loadDataSources();
  }, [loadDataSources]);

  const checkDatabaseTable = async () => {
    try {
      const {
        error
      } = await supabase.from('data_sources').select('count').limit(1);
      if (error && error.code === 'PGRST116') {
        console.log("Data sources table doesn't exist yet");
        toast.info("Setting up database for first use...");
      }
    } catch (err) {
      console.error("Error checking database table:", err);
    }
  };

  useEffect(() => {
    if (reconciliationResults.length > 0) {
      navigate("/reconcile");
    }
  }, [reconciliationResults, navigate]);

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
    reconcile();
    navigate("/reconcile", {
      state: {
        runReconciliation: true
      }
    });
  };

  const handleUploadFile = (data: any[], fileName: string, setAs?: 'sourceA' | 'sourceB' | 'auto') => {
    console.log(`Handling file upload: ${fileName} with ${data.length} records, setAs: ${setAs}`);
    addFileSourceAndReconcile(data, fileName, setAs).then(newSource => {
      if (newSource) {
        console.log("File uploaded successfully:", newSource.name);
      }
    }).catch(err => {
      console.error("Error processing file:", err);
      toast.error("Error processing file");
    });
    return {
      id: `temp-${Date.now()}`,
      name: fileName,
      type: 'uploaded' as 'uploaded' | 'csv' | 'json' | 'api',
      data: data,
      fields: Object.keys(data[0] || {}),
      keyField: Object.keys(data[0] || {})[0] || 'id'
    };
  };

  useEffect(() => {
    // Check for saved config in session storage
    const savedConfig = sessionStorage.getItem('selectedConfig');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      // Update the config state
      setSourceA(parsedConfig.sourceA);
      setSourceB(parsedConfig.sourceB);
      if (parsedConfig.mappings) {
        // Update mappings if they exist
        setConfig(prevConfig => ({
          ...prevConfig,
          mappings: parsedConfig.mappings,
          keyMapping: parsedConfig.keyMapping
        }));
      }
      // Clear the saved config
      sessionStorage.removeItem('selectedConfig');
    }
  }, []);

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      <section className="pt-28 pb-10">
        <div className="container max-w-6xl">
          <AnimatedTransition type="slide-down" delay={0.1}>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl font-bold mb-3">Configure Data Sources</h1>
              <p className="text-muted-foreground text-lg">
                Set up your principal and counterparty data sources and field mappings
              </p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => setSaveDialogOpen(true)}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Configuration
                </Button>
              </div>
            </div>
          </AnimatedTransition>
        </div>
      </section>
      
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
          />
        </div>
      </section>

      <SaveConfigDialog 
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        config={config}
      />
    </div>
  );
};

export default Configure;
