import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Database, History, BarChart, FileCheck, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import AnimatedTransition from "@/components/AnimatedTransition";
const Index = () => {
  return <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 text-center">
        <div className="container max-w-4xl">
          <AnimatedTransition type="fade" delay={0.1}>
            <h1 className="text-5xl font-bold mb-6 leading-tight">TD data Reconciliation</h1>
          </AnimatedTransition>
          
          <AnimatedTransition type="fade" delay={0.2}>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Automatically reconcile and identify discrepancies between data sources with AI assistance
            </p>
          </AnimatedTransition>
          
          <AnimatedTransition type="fade" delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2" asChild>
                <Link to="/configure">
                  <Database className="h-5 w-5" />
                  <span>Start Reconciliation</span>
                </Link>
              </Button>
              
              <Button size="lg" variant="outline" className="gap-2" asChild>
                <Link to="/history">
                  <History className="h-5 w-5" />
                  <span>View History</span>
                </Link>
              </Button>
            </div>
          </AnimatedTransition>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-6xl">
          <AnimatedTransition type="slide-up" delay={0.1}>
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          </AnimatedTransition>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AnimatedTransition type="slide-up" delay={0.2}>
              <div className="bg-background rounded-lg p-6 shadow-sm border">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multiple Data Sources</h3>
                <p className="text-muted-foreground">
                  Connect and reconcile data from CSV, JSON, API endpoints and more
                </p>
              </div>
            </AnimatedTransition>
            
            <AnimatedTransition type="slide-up" delay={0.3}>
              <div className="bg-background rounded-lg p-6 shadow-sm border">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Assisted Matching</h3>
                <p className="text-muted-foreground">
                  Intelligent field mapping suggestions and smart reconciliation
                </p>
              </div>
            </AnimatedTransition>
            
            <AnimatedTransition type="slide-up" delay={0.4}>
              <div className="bg-background rounded-lg p-6 shadow-sm border">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Clear visualization of discrepancies with detailed reporting
                </p>
              </div>
            </AnimatedTransition>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <AnimatedTransition type="scale" delay={0.1}>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Ready to reconcile your data?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Start by configuring your data sources and let our AI handle the heavy lifting
              </p>
              <Button size="lg" asChild>
                <Link to="/configure">
                  Get Started <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedTransition>
        </div>
      </section>
    </div>;
};
export default Index;