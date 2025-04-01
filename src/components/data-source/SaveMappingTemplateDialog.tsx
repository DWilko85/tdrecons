
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { FieldMapping } from "@/types/dataSources";
import { toast } from "sonner";

interface SaveMappingTemplateDialogProps {
  mappings: FieldMapping[];
  keyMapping: {
    sourceAField: string;
    sourceBField: string;
  };
  onSave: (name: string) => Promise<boolean>;
  sourceAName?: string;
  sourceBName?: string;
}

const SaveMappingTemplateDialog: React.FC<SaveMappingTemplateDialogProps> = ({
  mappings,
  keyMapping,
  onSave,
  sourceAName = "Principal",
  sourceBName = "Counterparty",
}) => {
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a name for this template");
      return;
    }

    if (mappings.length === 0) {
      toast.error("Cannot save an empty mapping template");
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSave(templateName);
      if (success) {
        toast.success("Mapping template saved successfully");
        setOpen(false);
        setTemplateName("");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  if (mappings.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-1.5" 
          size="sm"
        >
          <Save className="h-3.5 w-3.5" />
          Save Template
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Mapping Template</DialogTitle>
          <DialogDescription>
            Save your current field mappings as a reusable template for future reconciliations.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              placeholder="Enter a descriptive name for this template"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>This template will save:</p>
            <ul className="ml-5 mt-1 list-disc space-y-1">
              <li>{mappings.length} field mappings</li>
              {keyMapping.sourceAField && keyMapping.sourceBField && (
                <li>
                  Key mapping: {keyMapping.sourceAField} ({sourceAName}) to{" "}
                  {keyMapping.sourceBField} ({sourceBName})
                </li>
              )}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !templateName.trim()}
          >
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveMappingTemplateDialog;
