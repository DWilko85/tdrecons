
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: number;
  icon?: LucideIcon;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, className }) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          {Icon && (
            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
              <Icon size={18} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
