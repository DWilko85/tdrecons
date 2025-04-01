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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertCircle, 
  ArrowLeftRight, 
  Database, 
  Plus, 
  Trash2, 
  Upload,
  RefreshCw,
  CheckCircle2,
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
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface DataSourceConfigProps {
  availableSources: DataSource[];
  config: DataSourceConfigType;
  onSetSourceA: (source: DataSource | null) => void;
  onSetSourceB: (source: DataSource | null) => void;
  onUpdateMapping: (index: number, mapping: FieldMapping) => void;
  onAddMapping: () => void;
  onRemoveMapping: (index: number) => void;
  onSwapMappingFields: (index: number) => void;
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
  onSwapMappingFields,
  onUpdateKeyMapping,
  onReconcile,
  onFileUpload,
}) => {
  const { sourceA, sourceB, mappings, keyMapping } = config;
  const [autoReconcileOnUpload, setAutoReconcileOnUpload] = React.useState(false);
  const [isSavingMappings, setIsSavingMappings] = React.useState(false);

  const canReconcile = 
    sourceA !== null && 
    sourceB !== null && 
    mappings.length > 0 && 
    keyMapping.sourceAField && 
    keyMapping.sourceBField;

  const handleFileUploadForSourceA = (data: any[], fileName: string) => {
    onFileUpload(data, fileName, 'sourceA', autoReconcileOnUpload);
  };

  const handleFileUploadForSourceB = (data: any[], fileName: string) => {
    onFileUpload(data, fileName, 'sourceB', autoReconcileOnUpload);
  };

  const handleAddMapping = () => {
    if (!sourceA || !sourceB) {
      toast.error("Please select both data sources first");
      return;
    }
    
    onAddMapping();
  };

  const saveMappingsToDatabase = async () => {
    if (!sourceA || !sourceB || mappings.length === 0) {
      return false;
    }

    try {
      setIsSavingMappings(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        console.log("No user ID available for saving mappings");
        return true;
      }
      
      const mappingName = `${sourceA.name} to ${sourceB.name} mapping`;
      
      const mappingData = {
        name: mappingName,
        file_a_id: sourceA.id,
        file_b_id: sourceB.id,
        user_id: userId,
        mapping: JSON.stringify({
          fields: mappings,
          keyMapping: keyMapping
        }) as unknown as Json
      };
      
      const { error } = await supabase
        .from('field_mappings')
        .insert(mappingData);
      
      if (error) {
        console.error("Error saving mappings:", error);
        return true;
      }
      
      console.log("Field mappings saved successfully");
      return true;
    } catch (err) {
      console.error("Error in saveMappingsToDatabase:", err);
      return true;
    } finally {
      setIsSavingMappings(false);
    }
  };

  const handleReconcile = async () => {
    if (canReconcile) {
      await saveMappingsToDatabase();
      onReconcile();
    } else {
      toast.error("Please complete the configuration before reconciling");
    }
  };

  const getSourceFields = (source: DataSource | null) => {
    if (!source) return [];
    return source.fields;
  };

  const handleFieldChange = (index: number, field: string, isSourceA: boolean) => {
    const mapping = mappings[index];
    const updatedMapping = isSourceA 
      ? { ...mapping, sourceFieldA: field }
      : { ...mapping, sourceFieldB: field };

    if (updatedMapping.sourceFieldA && updatedMapping.sourceFieldB) {
      updatedMapping.displayName = getDisplayName(updatedMapping.sourceFieldA, updatedMapping.sourceFieldB);
    }

    onUpdateMapping(index, updatedMapping);
  };

  const getDisplayName = (fieldA: string, fieldB: string): string => {
    if (fieldA.toLowerCase() === fieldB.toLowerCase()) {
      return toTitleCase(fieldA);
    }
    
    return toTitleCase(fieldA.length <= fieldB.length ? fieldA : fieldB);
  };

  const toTitleCase = (str: string): string => {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_([a-z])/g, (_, char) => ' ' + char.toUpperCase())
      .trim();
  };

  return (
    <div className="space-y-6">
      <AnimatedTransition type="slide-up" delay={0.1}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mappings.map((mapping, index) => (
                        <TableRow key={index} className="group">
                          <TableCell className="py-2">
                            <Select 
                              value={mapping.sourceFieldA}
                              onValueChange={(value) => handleFieldChange(index, value, true)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {getSourceFields(sourceA).map((field) => (
                                  <SelectItem key={field} value={field}>
                                    {field}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-0 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full hover:bg-muted"
                              onClick={() => onSwapMappingFields(index)}
                              title="Swap fields"
                            >
                              <ArrowLeftRight className="w-4 h-4" />
                            </Button>
                          </TableCell>
                          <TableCell className="py-2">
                            <Select 
                              value={mapping.sourceFieldB}
                              onValueChange={(value) => handleFieldChange(index, value, false)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {getSourceFields(sourceB).map((field) => (
                                  <SelectItem key={field} value={field}>
                                    {field}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-2">
                            <Input
                              className="h-8"
                              value={mapping.displayName}
                              onChange={(e) => onUpdateMapping(index, {...mapping, displayName: e.target.value})}
                            />
                          </TableCell>
                          <TableCell className="p-2 text-right">
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
                      disabled={isSavingMappings}
                    >
                      {isSavingMappings ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Database className="w-5 h-5" />
                      )}
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
