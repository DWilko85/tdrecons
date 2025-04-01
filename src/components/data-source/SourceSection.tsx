
import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/FileUpload";
import { DataSource } from "@/hooks/useDataSources";

interface SourceSectionProps {
  title: string;
  description: string;
  badgeText: string;
  badgeClassName: string;
  source: DataSource | null;
  keyField: string;
  onFileUpload: (data: any[], fileName: string) => void;
}

const SourceSection: React.FC<SourceSectionProps> = ({
  title,
  description,
  badgeText,
  badgeClassName,
  source,
  keyField,
  onFileUpload,
}) => {
  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <Badge className={`w-fit mb-2 ${badgeClassName}`}>
          {badgeText}
        </Badge>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="space-y-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="upload">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload {badgeText} file
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <FileUpload onFileLoaded={onFileUpload} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {source && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor={`keyField${badgeText}`}>Unique Identifier (Key Field)</Label>
              <div className="p-2 border rounded-md bg-background/50">
                {keyField || "No key field selected"}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      {source && (
        <CardFooter className="text-xs text-muted-foreground flex items-center justify-between border-t pt-4">
          <span>{source.data.length} records</span>
          <Badge variant="outline" className="text-xs font-normal">
            {source.type.toUpperCase()}
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
};

export default SourceSection;
