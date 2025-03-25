
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export interface StatCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  percentage?: number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, percentage }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          {icon && (
            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
        {percentage !== undefined && (
          <div className="mt-2 text-xs text-muted-foreground">
            {percentage}% of total
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
