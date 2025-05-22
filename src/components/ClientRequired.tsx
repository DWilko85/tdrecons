
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Building } from "lucide-react";

interface ClientRequiredProps {
  children: React.ReactNode;
}

const ClientRequired: React.FC<ClientRequiredProps> = ({ children }) => {
  const { currentClient, availableClients, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!currentClient) {
    if (availableClients.length === 0) {
      return (
        <Card className="max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              No Client Access
            </CardTitle>
            <CardDescription>
              You don't have access to any clients. Please contact an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="max-w-md mx-auto mt-10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Select a Client
          </CardTitle>
          <CardDescription>
            Please select a client to continue using the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableClients.map((client) => (
            <Button
              key={client.id}
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => {
                const { setCurrentClient } = useAuth();
                setCurrentClient(client);
              }}
            >
              {client.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

export default ClientRequired;
