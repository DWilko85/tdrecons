
import React, { useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertCircle, 
  ArrowLeftRight, 
  Database, 
  Plus, 
  Trash2, 
  Upload,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { 
  DataSource, 
  DataSourceConfig as DataSourceConfigType,
  FieldMapping 
} from "@/hooks/useDataSources";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AnimatedTransition from "./AnimatedTransition";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Switch
} from "@/components/ui/switch";
import FileUpload from "./FileUpload";

interface DataSourceConfigProps {
  availableSources: DataSource[];
  config: DataSourceConfigType;
  onSetSourceA: (source: DataSource | null) => void;
  onSetSourceB: (source: DataSource | null) => void;
  onUpdateMapping: (index: number, mapping: FieldMapping) => void;
  onAddMapping: () => void;
  onRemoveMapping: (index: number) => void;
  onUpdateKeyMapping: (sourceAField: string, sourceBField: string) => void;
  onReconcile: () => void;
  onFileUpload: (data: any[], fileName: string, setAs?: 'sourceA' | 'sourceB' | 'auto', autoReconcile?: boolean) => DataSource | null | undefined;
}

const DataSourceConfig: React.FC<DataSourceConfigProps> = ({
  availableSources,
  config,
  onSetSourceA,
  onSetSourceB,
  onUpdateMapping,
  onAddMapping,
  onRemoveMapping,
  onUpdateKeyMapping,
  onReconcile,
  onFileUpload,
}) => {
  const { sourceA, sourceB, mappings, keyMapping } = config;
  // Set autoReconcileOnUpload to false by default to prevent automatic reconciliation
  const [autoReconcileOnUpload, setAutoReconcileOnUpload] = React.useState(false);

  // Check if configuration is valid to enable reconciliation
  const canReconcile = 
    sourceA !== null && 
    sourceB !== null && 
    mappings.length > 0 && 
    keyMapping.sourceAField && 
    keyMapping.sourceBField;

  // Handle file upload and set as source
  const handleFileUploadForSourceA = (data: any[], fileName: string) => {
    onFileUpload(data, fileName, 'sourceA', autoReconcileOnUpload);
  };

  const handleFileUploadForSourceB = (data: any[], fileName: string) => {
    onFileUpload(data, fileName, 'sourceB', autoReconcileOnUpload);
  };

  // Handle adding a new mapping
  const handleAddMapping = () => {
    if (!sourceA || !sourceB) {
      toast.error("Please select both data sources first");
      return;
    }
    
    onAddMapping();
  };

  // Start reconciliation
  const handleReconcile = () => {
    if (canReconcile) {
      onReconcile();
    } else {
      toast.error("Please complete the configuration before reconciling");
    }
  };

  return (
    <div className="space-y-6">
      <AnimatedTransition type="slide-up" delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Principal Data */}
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <Badge className="w-fit mb-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                Principal
              </Badge>
              <CardTitle className="text-xl">Principal Data</CardTitle>
              <CardDescription>
                Select your principal data source for reconciliation
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="upload">
                    <AccordionTrigger className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Principal file
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <FileUpload onFileLoaded={handleFileUploadForSourceA} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {sourceA && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="keyFieldA">Unique Identifier (Key Field)</Label>
                    <div className="p-2 border rounded-md bg-background/50">
                      {keyMapping.sourceAField || "No key field selected"}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            {sourceA && (
              <CardFooter className="text-xs text-muted-foreground flex items-center justify-between border-t pt-4">
                <span>{sourceA.data.length} records</span>
                <Badge variant="outline" className="text-xs font-normal">
                  {sourceA.type.toUpperCase()}
                </Badge>
              </CardFooter>
            )}
          </Card>

          {/* Counterparty Data */}
          <Card className="border border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <Badge className="w-fit mb-2 bg-secondary text-secondary-foreground border-secondary/50 hover:bg-secondary/80">
                Counterparty
              </Badge>
              <CardTitle className="text-xl">Counterparty Data</CardTitle>
              <CardDescription>
                Select the counterparty data source to compare against
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-4">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="upload">
                    <AccordionTrigger className="text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Counterparty file
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <FileUpload onFileLoaded={handleFileUploadForSourceB} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {sourceB && (
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="keyFieldB">Unique Identifier (Key Field)</Label>
                    <div className="p-2 border rounded-md bg-background/50">
                      {keyMapping.sourceBField || "No key field selected"}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            {sourceB && (
              <CardFooter className="text-xs text-muted-foreground flex items-center justify-between border-t pt-4">
                <span>{sourceB.data.length} records</span>
                <Badge variant="outline" className="text-xs font-normal">
                  {sourceB.type.toUpperCase()}
                </Badge>
              </CardFooter>
            )}
          </Card>
        </div>
      </AnimatedTransition>

      {sourceA && sourceB && (
        <AnimatedTransition type="slide-up" delay={0.2}>
          <Card className="border border-border/50 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Field Mappings</CardTitle>
                  <CardDescription>
                    Configure which fields to compare between data sources
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1"
                  onClick={handleAddMapping}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Mapping
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {mappings.length > 0 ? (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[32%]">Principal Field</TableHead>
                        <TableHead className="w-8 px-0 text-center"></TableHead>
                        <TableHead className="w-[32%]">Counterparty Field</TableHead>
                        <TableHead>Display Name</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mappings.map((mapping, index) => (
                        <TableRow key={index} className="group">
                          <TableCell className="py-2">
                            <div className="p-2 border rounded-md bg-background/50">
                              {mapping.sourceFieldA}
                            </div>
                          </TableCell>
                          <TableCell className="px-0 text-center">
                            <ArrowLeftRight className="w-4 h-4 text-muted-foreground mx-auto" />
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="p-2 border rounded-md bg-background/50">
                              {mapping.sourceFieldB}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <Input
                              className="h-8"
                              value={mapping.displayName}
                              onChange={(e) => onUpdateMapping(index, {...mapping, displayName: e.target.value})}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-70 hover:opacity-100"
                              onClick={() => onRemoveMapping(index)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 text-center">
                  <div className="space-y-3">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
                    <div className="text-muted-foreground">
                      <p>No field mappings configured yet</p>
                      <p className="text-sm">Click "Add Mapping" to start configuring fields to compare</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="w-full flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="auto-reconcile"
                      checked={autoReconcileOnUpload}
                      onCheckedChange={setAutoReconcileOnUpload}
                    />
                    <Label htmlFor="auto-reconcile">Auto-reconcile on upload</Label>
                  </div>
                </div>
                
                {canReconcile && (
                  <div className="flex justify-center w-full">
                    <Button 
                      className="gap-2 px-8 py-6 text-lg" 
                      size="lg"
                      onClick={handleReconcile}
                    >
                      <Database className="w-5 h-5" />
                      Start Reconciliation
                    </Button>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        </AnimatedTransition>
      )}
    </div>
  );
};

export default DataSourceConfig;
