
import React from "react";
import StatCard from "./StatCard";
import { ArrowDown, ArrowUp, CircleCheck, CircleX, AlertCircle } from "lucide-react";
import AnimatedTransition from "./AnimatedTransition";
import { ReconciliationResult } from "@/types/dataSources";

interface ReconciliationStatsProps {
  results: ReconciliationResult[];
}

const ReconciliationStats: React.FC<ReconciliationStatsProps> = ({ results }) => {
  const totalRecords = results.length;
  const matchingRecords = results.filter(result => result.status === 'matching').length;
  const differentRecords = results.filter(result => result.status === 'different').length;
  const missingA = results.filter(result => result.status === 'missing-a').length;
  const missingB = results.filter(result => result.status === 'missing-b').length;

  return (
    <AnimatedTransition type="fade" delay={0.2}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Records"
          value={totalRecords}
          icon={AlertCircle}
          className="border-border/50"
        />
        <StatCard
          title="Matching Records"
          value={matchingRecords}
          icon={CircleCheck}
          className="border-green-500/40 bg-green-500/5 text-green-500"
        />
        <StatCard
          title="Different Records"
          value={differentRecords}
          icon={CircleX}
          className="border-yellow-500/40 bg-yellow-500/5 text-yellow-500"
        />
        <StatCard
          title="Missing in Principal"
          value={missingB}
          icon={ArrowDown}
          className="border-red-500/40 bg-red-500/5 text-red-500"
        />
        <StatCard
          title="Missing in Counterparty"
          value={missingA}
          icon={ArrowUp}
          className="border-red-500/40 bg-red-500/5 text-red-500"
        />
      </div>
    </AnimatedTransition>
  );
};

export default ReconciliationStats;
