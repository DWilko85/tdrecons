
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileLoaded: (data: any[], fileName: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileLoaded,
  accept = ".csv,.json",
  maxSizeMB = 5,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    if (file.size > maxSizeBytes) {
      toast.error(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setLoading(true);
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      let data: any[] = [];

      if (fileExtension === 'json') {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        data = Array.isArray(jsonData) ? jsonData : [jsonData];
      } else if (fileExtension === 'csv') {
        const text = await file.text();
        data = parseCSV(text);
      } else {
        toast.error('Unsupported file format. Please upload a CSV or JSON file.');
        setLoading(false);
        return;
      }

      if (data.length === 0) {
        toast.error('No data found in the file.');
        setLoading(false);
        return;
      }

      onFileLoaded(data, file.name);
      toast.success(`Successfully loaded ${data.length} records from ${file.name}`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file. Please check the format and try again.');
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    if (lines.length < 2) return [];

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const results: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV parsing - doesn't handle quoted commas, etc.
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      const obj: {[key: string]: any} = {};
      headers.forEach((header, index) => {
        if (index < values.length) {
          obj[header] = values[index];
        }
      });
      
      results.push(obj);
    }
    
    return results;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 transition-all ${
        isDragging 
          ? "border-primary bg-primary/5" 
          : "border-muted-foreground/20 hover:border-primary/50"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="sr-only"
      />
      
      <div className="flex flex-col items-center justify-center space-y-3 text-center">
        <div className="rounded-full bg-primary/10 p-3">
          <UploadCloud className="h-6 w-6 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {loading ? "Processing file..." : "Drag and drop your file here"}
          </p>
          <p className="text-xs text-muted-foreground">
            Supported formats: CSV, JSON (max {maxSizeMB}MB)
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleButtonClick}
          disabled={loading}
        >
          Browse files
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;
