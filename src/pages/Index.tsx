
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Upload, History, GitCompare, Settings, FileText } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Index = () => {
  const { user, availableClients, currentClient, setCurrentClient } = useAuth();

  // Auto-select the first client if user has clients but none selected
  useEffect(() => {
    if (user && availableClients.length > 0 && !currentClient) {
      console.log("Auto-selecting first client:", availableClients[0].name);
      setCurrentClient(availableClients[0]);
      toast.info(`Selected client: ${availableClients[0].name}`);
    }
  }, [user, availableClients, currentClient, setCurrentClient]);

  const handleClientChange = (clientId: string) => {
    const client = availableClients.find(c => c.id === clientId);
    if (client) {
      setCurrentClient(client);
      toast.success(`Switched to client: ${client.name}`);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">AI Reconcile Dashboard</h1>
        
        {user && !currentClient && availableClients.length > 0 && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-amber-900">Select a Client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700 mb-4">Please select a client to access all features.</p>
              <Select onValueChange={handleClientChange}>
                <SelectTrigger className="w-full max-w-xs">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {availableClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}
        
        {user && availableClients.length === 0 && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-red-900">No Client Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">You don't have access to any clients. Please contact an administrator.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                New Reconciliation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Start a new reconciliation process by configuring and comparing two data sources
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/configure">Start Reconciling</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Data Import
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Import and manage data sources from various file formats for reconciliation
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/configure">Import Data</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Reconciliation History
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              View and manage past reconciliation processes and their results
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/history">View History</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Configuration Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Save and reuse reconciliation configurations for recurring tasks
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/configs">Manage Configs</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Manage application settings, user preferences, and data integrations
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to="/configure">View Settings</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
