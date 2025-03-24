
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Database, GitCompare, Settings } from "lucide-react";
import AnimatedTransition from "@/components/AnimatedTransition";
import { cn } from "@/lib/utils";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-20 md:py-28">
        <AnimatedTransition 
          type="slide-up" 
          delay={0.1} 
          className="container max-w-5xl text-center space-y-6"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-secondary text-secondary-foreground mb-4">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Data Reconciliation Made Simple
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Effortlessly Reconcile Your <span className="text-primary">Data Sources</span>
            </h1>
            
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Intuitively compare, match, and synchronize data between different systems. 
              Identify discrepancies and ensure data consistency with precision.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="px-8 gap-2">
              <Link to="/configure">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link to="/reconcile">
                View Demo
              </Link>
            </Button>
          </div>
        </AnimatedTransition>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/50 py-20">
        <div className="container max-w-6xl">
          <AnimatedTransition type="slide-up" delay={0.2}>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold">How It Works</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                Three simple steps to reconcile your data across different sources
              </p>
            </div>
          </AnimatedTransition>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedTransition 
              type="scale" 
              delay={0.3} 
              className="flex flex-col"
            >
              <FeatureCard
                icon={<Database className="h-6 w-6" />}
                step={1}
                title="Configure Data Sources"
                description="Select and connect your primary and secondary data sources. We support various formats including CSV, JSON, and APIs."
              />
            </AnimatedTransition>
            
            <AnimatedTransition 
              type="scale" 
              delay={0.4} 
              className="flex flex-col"
            >
              <FeatureCard
                icon={<Settings className="h-6 w-6" />}
                step={2}
                title="Map Fields"
                description="Intuitively map corresponding fields between your data sources. Define which fields should be compared and how."
              />
            </AnimatedTransition>
            
            <AnimatedTransition 
              type="scale" 
              delay={0.5} 
              className="flex flex-col"
            >
              <FeatureCard
                icon={<GitCompare className="h-6 w-6" />}
                step={3}
                title="Reconcile & Analyze"
                description="Run the reconciliation process and get detailed insights into differences, matches, and missing entries."
              />
            </AnimatedTransition>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <AnimatedTransition type="fade" delay={0.2}>
          <div className="container max-w-5xl">
            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-4 text-center md:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold">Start Reconciling Your Data</h2>
                  <p className="text-muted-foreground max-w-md">
                    Configure your data sources and begin identifying inconsistencies in minutes.
                  </p>
                </div>
                <Button asChild size="lg" className="min-w-40 gap-2">
                  <Link to="/configure">
                    Configure Sources
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </AnimatedTransition>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DataSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  step: number;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, step, title, description }) => {
  return (
    <div className={cn(
      "rounded-lg border bg-card p-6 text-card-foreground flex flex-col h-full",
      "transition-all-200 card-hover"
    )}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-medium text-sm">
          {step}
        </div>
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
