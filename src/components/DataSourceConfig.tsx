
import React from "react";
import { DataSource, DataSourceConfig as DataSourceConfigType, FieldMapping } from "@/types/dataSources";
import DataSourceConfigComponent from "./data-source/DataSourceConfig";

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
  onFileUpload: (data: any[], fileName: string, setAs?: 'sourceA' | 'sourceB' | 'auto') => DataSource | null | undefined;
}

const DataSourceConfig: React.FC<DataSourceConfigProps> = (props) => {
  return <DataSourceConfigComponent {...props} />;
};

export default DataSourceConfig;
