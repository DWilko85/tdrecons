
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileUp, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import AnimatedTransition from "@/components/AnimatedTransition";
import { DataSourceConfig } from "@/types/dataSources";

const Configs = () => {
  const navigate = useNavigate();

  const { data: configs, isLoading } = useQuery({
    queryKey: ['reconciliation-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reconciliation_configs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleUseConfig = (config: any) => {
    // Parse the config if it's stored as a string
    const parsedConfig = typeof config === 'string' ? JSON.parse(config) : config;
    
    // Store the config in session storage
    sessionStorage.setItem('selectedConfig', JSON.stringify(parsedConfig));
    navigate('/configure');
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      
      <section className="pt-28 pb-8">
        <div className="container max-w-6xl">
          <AnimatedTransition type="slide-down" delay={0.1}>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-3xl font-bold mb-3">Saved Configurations</h1>
              <p className="text-muted-foreground text-lg">
                View and manage your saved reconciliation configurations
              </p>
            </div>
          </AnimatedTransition>

          <div className="grid gap-6">
            {configs?.map((config) => (
              <div key={config.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{config.name}</h3>
                    {config.description && (
                      <p className="text-muted-foreground">{config.description}</p>
                    )}
                  </div>
                  <Button
                    onClick={() => handleUseConfig(config.config)}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Use Configuration
                  </Button>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Created: {new Date(config.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}

            {!isLoading && (!configs || configs.length === 0) && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  No saved configurations yet
                </div>
                <Button asChild>
                  <a href="/configure">Create Your First Configuration</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Configs;
