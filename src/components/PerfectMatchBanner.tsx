
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import AnimatedTransition from "./AnimatedTransition";

interface PerfectMatchBannerProps {
  sourceA: string;
  sourceB: string;
  recordCount: number;
}

const PerfectMatchBanner: React.FC<PerfectMatchBannerProps> = ({ 
  sourceA, 
  sourceB,
  recordCount
}) => {
  return (
    <AnimatedTransition type="scale" delay={0.2}>
      <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950/20 shadow-sm mb-8">
        <CardContent className="flex items-center justify-center space-x-4 py-10 text-center">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-500 mb-2">
              Perfect Match!
            </h2>
            <p className="text-lg text-green-600 dark:text-green-400">
              All {recordCount} records in <span className="font-medium">{sourceA}</span> and <span className="font-medium">{sourceB}</span> match perfectly.
            </p>
          </div>
        </CardContent>
      </Card>
    </AnimatedTransition>
  );
};

export default PerfectMatchBanner;
