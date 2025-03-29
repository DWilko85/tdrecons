
import React from "react";
import { useNavigate } from "react-router-dom";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";

const NoConfigMessage: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-20">
      <Database className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
      <h2 className="text-xl font-medium mb-2">Configuration Required</h2>
      <p className="text-muted-foreground mb-6">Please configure both data sources and field mappings</p>
      <Button
        className="mx-auto"
        onClick={() => navigate("/configure")}
      >
        Configure Sources
      </Button>
    </div>
  );
};

export default NoConfigMessage;
