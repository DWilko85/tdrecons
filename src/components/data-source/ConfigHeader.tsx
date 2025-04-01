
import React from "react";
import AnimatedTransition from "@/components/AnimatedTransition";
import MappingTemplateSelector, { MappingTemplate } from "./MappingTemplateSelector";

interface ConfigHeaderProps {
  onSelectTemplate: (template: MappingTemplate | null) => void;
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
