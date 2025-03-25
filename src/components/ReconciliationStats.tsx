
import React from "react";
import { Database, CheckCircle, XCircle } from "lucide-react";
import StatCard from "./StatCard";
import AnimatedTransition from "./AnimatedTransition";
import { ReconciliationResult } from "@/hooks/useDataSources";

interface ReconciliationStatsProps {
  results: ReconciliationResult[];
}

const ReconciliationStats: React.FC<ReconciliationStatsProps> = ({ results }) => {
  // Calculate statistics
  const stats = {
    total: results.length,
    matching: results.filter(r => r.status === 'matching').length,
    different: results.filter(r => r.status === 'different').length,
    missingA: results.filter(r => r.status === 'missing-a').length,
    missingB: results.filter(r => r.status === 'missing-b').length,
    differenceRate: results.length ? 
      Math.round((results.filter(r => r.status !== 'matching').length / results.length) * 100) : 
      0
  };

  return (
    <AnimatedTransition type="slide-up" delay={0.2}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard 
          label="Total Records"
          value={stats.total}
          icon={<Database className="h-4 w-4" />}
        />
        <StatCard 
          label="Matching"
          value={stats.matching}
          icon={<CheckCircle className="h-4 w-4 text-matching" />}
          percentage={stats.total ? Math.round((stats.matching / stats.total) * 100) : 0}
        />
        <StatCard 
          label="Different"
          value={stats.different}
          icon={<XCircle className="h-4 w-4 text-removed" />}
          percentage={stats.total ? Math.round((stats.different / stats.total) * 100) : 0}
        />
        <StatCard 
          label="Missing in Principal"
          value={stats.missingA}
          percentage={stats.total ? Math.round((stats.missingA / stats.total) * 100) : 0}
        />
        <StatCard 
          label="Missing in Counterparty"
          value={stats.missingB}
          percentage={stats.total ? Math.round((stats.missingB / stats.total) * 100) : 0}
        />
      </div>
    </AnimatedTransition>
  );
};

export default ReconciliationStats;
