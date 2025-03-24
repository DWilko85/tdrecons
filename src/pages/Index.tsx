
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Database, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import AnimatedTransition from "@/components/AnimatedTransition";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 bg-gradient-to-b from-background to-background/90">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <AnimatedTransition type="slide-right">
              <div className="space-y-6">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Data Reconciliation Made Simple
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter">
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">AI Reconcile</span>
                  <br />
                  Intelligent Data Matching
                </h1>
                <p className="text-lg text-muted-foreground max-w-md">
                  Automatically detect discrepancies between data sources and reconcile differences with powerful visualization tools.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="gap-2 px-6" 
                    onClick={() => navigate('/configure')}
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AnimatedTransition>
            
            <AnimatedTransition type="slide-up" delay={0.3}>
              <div className="lg:pl-10">
                <div className="aspect-video relative overflow-hidden rounded-lg border shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-primary/5 backdrop-blur-sm">
                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                      <Database className="h-16 w-16 mb-4 text-primary" />
                      <h3 className="text-2xl font-bold mb-2">Data Reconciliation</h3>
                      <p className="text-muted-foreground max-w-md">
                        Upload your data files or connect to your existing data sources to start reconciling differences.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedTransition>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-6xl">
          <AnimatedTransition type="fade">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">How AI Reconcile Works</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                A streamlined approach to identify and resolve data discrepancies between different sources.
              </p>
            </div>
          </AnimatedTransition>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedTransition type="slide-up" delay={0.1}>
              <div className="bg-background rounded-lg border p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Configure Sources</h3>
                <p className="text-muted-foreground">
                  Connect your data sources and define mapping rules for field comparisons.
                </p>
              </div>
            </AnimatedTransition>

            <AnimatedTransition type="slide-up" delay={0.2}>
              <div className="bg-background rounded-lg border p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Run Reconciliation</h3>
                <p className="text-muted-foreground">
                  Process your data with intelligent matching algorithms to identify discrepancies.
                </p>
              </div>
            </AnimatedTransition>

            <AnimatedTransition type="slide-up" delay={0.3}>
              <div className="bg-background rounded-lg border p-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Analyze Results</h3>
                <p className="text-muted-foreground">
                  Review differences with visual tools and take action to resolve inconsistencies.
                </p>
              </div>
            </AnimatedTransition>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container max-w-5xl">
          <AnimatedTransition type="scale">
            <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Reconcile Your Data?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start using AI Reconcile today to automatically identify and resolve discrepancies between your data sources.
              </p>
              <Button 
                size="lg" 
                className="gap-2 px-8" 
                onClick={() => navigate('/configure')}
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </AnimatedTransition>
        </div>
      </section>
    </div>
  );
};

export default Index;
