
import { DataSource } from "@/types/dataSources";
import { toast } from "sonner";

// Add a new uploaded file as a data source
export const createUploadedFileSource = (data: Record<string, any>[], fileName: string): DataSource | undefined => {
  if (!data || data.length === 0) {
    toast.error("No data found in the uploaded file");
    return;
  }
  
  // Generate a unique ID for the new source
  const id = `uploaded-${Date.now()}`;
  
  // Extract file format from filename
  const fileFormat = fileName.split('.').pop()?.toLowerCase() || 'unknown';
  const type = fileFormat === 'json' ? 'json' : fileFormat === 'csv' ? 'csv' : 'uploaded';
  
  // Extract fields from the first data item
  const fields = Object.keys(data[0]);
  
  if (fields.length === 0) {
    toast.error("Could not identify fields in the uploaded file");
    return;
  }
  
  // Try to guess a suitable key field (prefer fields with "id" in their name)
  const potentialKeyFields = fields.filter(field => 
    field.toLowerCase().includes('id') || 
    field.toLowerCase() === 'key' ||
    field.toLowerCase() === 'reference' ||
    field.toLowerCase() === 'code'
  );
  
  const keyField = potentialKeyFields.length > 0 ? potentialKeyFields[0] : fields[0];
  
  // Create the new data source
  const newSource: DataSource = {
    id,
    name: `Uploaded: ${fileName}`,
    type: type as 'csv' | 'json' | 'api' | 'uploaded',
    data,
    fields,
    keyField,
  };
  
  return newSource;
};
