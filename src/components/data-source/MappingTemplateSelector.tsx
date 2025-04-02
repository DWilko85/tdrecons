
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getTemplates, deleteTemplate, Template } from "@/services/templatesService";

export interface MappingTemplate extends Template {}

interface MappingTemplateSelectorProps {
  onSelectTemplate: (template: MappingTemplate | null) => void;
  className?: string;
}

const MappingTemplateSelector: React.FC<MappingTemplateSelectorProps> = ({
  onSelectTemplate,
  className,
}) => {
  const [templates, setTemplates] = useState<MappingTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Error in loadTemplates:", err);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!templateId) return;
    
    try {
      const success = await deleteTemplate(templateId);
      
      if (!success) {
        toast.error("Failed to delete template");
        return;
      }
      
      // Remove from local state
      setTemplates(templates.filter(t => t.id !== templateId));
      
      // If the deleted template was selected, clear selection
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId("");
        onSelectTemplate(null);
      }
      
      toast.success("Template deleted successfully");
    } catch (err) {
      console.error("Error in handleDelete:", err);
      toast.error("Error deleting template");
    }
  };

  const handleSelectTemplate = (value: string) => {
    setSelectedTemplateId(value);
    
    if (!value || value === "none") {
      onSelectTemplate(null);
      return;
    }
    
    const template = templates.find(t => t.id === value);
    if (template) {
      onSelectTemplate(template);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className={`space-y-2 ${className || ""}`}>
      <div className="flex items-center justify-between">
        <Label htmlFor="template-selector">Mapping Template</Label>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 px-2 text-xs"
          onClick={() => loadTemplates()}
        >
          Refresh
        </Button>
      </div>
      <Select 
        value={selectedTemplateId} 
        onValueChange={handleSelectTemplate}
      >
        <SelectTrigger id="template-selector">
          <SelectValue placeholder={loading ? "Loading templates..." : "Select a template"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None (Start fresh)</SelectItem>
          
          {templates.map(template => (
            <SelectItem 
              key={template.id} 
              value={template.id}
              className="flex items-center justify-between pr-8 relative"
            >
              <div className="flex-1 truncate">
                {template.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  ({template.config.mappings.length} fields)
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 absolute right-2 opacity-70 hover:opacity-100"
                onClick={(e) => handleDelete(template.id, e)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </SelectItem>
          ))}
          
          {templates.length === 0 && !loading && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No saved templates found
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MappingTemplateSelector;
