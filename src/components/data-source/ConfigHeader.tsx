
import React from "react";
import AnimatedTransition from "@/components/AnimatedTransition";
import MappingTemplateSelector from "./MappingTemplateSelector";
import { Template } from "@/services/templatesService";

interface ConfigHeaderProps {
  onSelectTemplate: (template: Template | null) => void;
}

const ConfigHeader: React.FC<ConfigHeaderProps> = ({ onSelectTemplate }) => {
  return (
    <AnimatedTransition type="slide-up" delay={0.1}>
      <div className="mb-6">
        <MappingTemplateSelector 
          onSelectTemplate={onSelectTemplate}
        />
      </div>
    </AnimatedTransition>
  );
};

export default ConfigHeader;
