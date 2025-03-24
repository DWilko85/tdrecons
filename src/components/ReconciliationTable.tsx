
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  Filter,
  MoreHorizontal, 
  Search, 
  SlidersHorizontal, 
  X 
} from "lucide-react";
import { ReconciliationResult } from "@/hooks/useDataSources";
import { cn } from "@/lib/utils";
import AnimatedTransition from "./AnimatedTransition";

interface ReconciliationTableProps {
  results: ReconciliationResult[];
  isLoading?: boolean;
}

const ReconciliationTable: React.FC<ReconciliationTableProps> = ({
  results,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<Record<string, boolean>>({
    'matching': true,
    'different': true,
    'missing-a': true,
    'missing-b': true,
  });
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  // Filter results based on search and status filters
  const filteredResults = results.filter(result => {
    // Status filter
    if (!statusFilter[result.status]) return false;
    
    // Search filter (case insensitive)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      
      // Search in key
      if (result.key.toLowerCase().includes(term)) return true;
      
      // Search in field values
      return result.fields.some(field => 
        String(field.valueA).toLowerCase().includes(term) ||
        String(field.valueB).toLowerCase().includes(term) ||
        field.name.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  // Status labels and colors for display
  const statusConfig = {
    'matching': { label: 'Matching', color: 'bg-matching/10 text-matching border-matching/20 hover:bg-matching/20' },
    'different': { label: 'Different', color: 'bg-removed/10 text-removed border-removed/20 hover:bg-removed/20' },
    'missing-a': { label: 'Missing in A', color: 'bg-accent/80 text-accent-foreground border-accent' },
    'missing-b': { label: 'Missing in B', color: 'bg-accent/80 text-accent-foreground border-accent' },
  };

  // Toggle a specific status filter
  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter({
      'matching': true,
      'different': true,
      'missing-a': true,
      'missing-b': true,
    });
    setShowOnlyDifferences(false);
  };

  // Export results to CSV
  const exportToCsv = () => {
    // Create headers
    let headers = ['Key', 'Status'];
    
    if (results.length > 0) {
      const fieldNames = results[0].fields.map(f => f.name);
      headers = [...headers, ...fieldNames.map(name => `${name} (A)`), ...fieldNames.map(name => `${name} (B)`)];
    }
    
    // Create rows
    const rows = filteredResults.map(result => {
      let row = [result.key, statusConfig[result.status].label];
      
      result.fields.forEach(field => {
        row.push(String(field.valueA ?? ''));
      });
      
      result.fields.forEach(field => {
        row.push(String(field.valueB ?? ''));
      });
      
      return row;
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reconciliation-results-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format cell value for display
  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return '—';
    
    if (typeof value === 'boolean') {
      return value ? 'True' : 'False';
    }
    
    return String(value);
  };

  return (
    <div className="space-y-4">
      <AnimatedTransition type="slide-up" delay={0.1}>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          {/* Search */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {/* Status filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-1.5" 
                  size="sm"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Filter</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(statusConfig).map(([status, config]) => (
                  <DropdownMenuItem 
                    key={status}
                    className="flex items-center gap-2"
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleStatusFilter(status);
                    }}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded flex items-center justify-center border",
                      statusFilter[status] ? "bg-primary border-primary" : "border-muted"
                    )}>
                      {statusFilter[status] && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className="flex-1">{config.label}</span>
                    <Badge className={cn("text-xs font-normal", config.color)}>
                      {results.filter(r => r.status === status).length}
                    </Badge>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onSelect={(e) => {
                    e.preventDefault();
                    setShowOnlyDifferences(!showOnlyDifferences);
                  }}
                >
                  <div className={cn(
                    "w-4 h-4 rounded flex items-center justify-center border",
                    showOnlyDifferences ? "bg-primary border-primary" : "border-muted"
                  )}>
                    {showOnlyDifferences && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className="flex-1">Show only differences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-center text-sm justify-center text-muted-foreground hover:text-foreground"
                  onSelect={(e) => {
                    e.preventDefault();
                    resetFilters();
                  }}
                >
                  Reset Filters
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Export */}
            <Button 
              variant="outline" 
              className="gap-1.5" 
              size="sm"
              onClick={exportToCsv}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </Button>
            
            {/* View options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="gap-1.5 px-2 sm:px-3" 
                  size="sm"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline-block">View</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setShowOnlyDifferences(!showOnlyDifferences);
                  }}
                >
                  {showOnlyDifferences ? (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Show All Fields</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      <span>Show Only Differences</span>
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </AnimatedTransition>

      <AnimatedTransition type="scale" delay={0.2}>
        <div className="rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Key</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  {results.length > 0 && results[0].fields.map((field, i) => (
                    <React.Fragment key={`header-${i}`}>
                      {(!showOnlyDifferences || results.some(r => !r.fields[i]?.matching)) && (
                        <TableHead>
                          {field.name}
                          <div className="flex text-xs text-muted-foreground space-x-4 mt-1">
                            <span>Source A</span>
                            <span>Source B</span>
                          </div>
                        </TableHead>
                      )}
                    </React.Fragment>
                  ))}
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={results.length > 0 ? results[0].fields.length + 3 : 4}>
                        <div className="h-10 bg-muted/30 rounded animate-pulse"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredResults.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={results.length > 0 ? results[0].fields.length + 3 : 4} 
                      className="h-32 text-center"
                    >
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Search className="h-8 w-8 mb-2 opacity-50" />
                        {results.length === 0 ? (
                          <div className="space-y-1">
                            <p className="font-medium">No reconciliation results yet</p>
                            <p className="text-sm">Configure data sources and run reconciliation</p>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="font-medium">No matching results</p>
                            <p className="text-sm">Try changing your filters or search term</p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredResults.map((result, rowIndex) => (
                    <TableRow 
                      key={`row-${result.key}-${rowIndex}`}
                      className={cn(
                        result.status === 'matching' ? 'bg-matching/[0.02]' : '',
                        result.status === 'different' ? 'bg-removed/[0.02]' : '',
                        (result.status === 'missing-a' || result.status === 'missing-b') ? 'bg-accent/[0.03]' : ''
                      )}
                    >
                      <TableCell className="font-medium">
                        <div className="truncate max-w-[160px]" title={result.key}>
                          {result.key}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "font-normal text-xs",
                          statusConfig[result.status].color
                        )}>
                          {statusConfig[result.status].label}
                        </Badge>
                      </TableCell>
                      
                      {result.fields.map((field, i) => (
                        <React.Fragment key={`field-${i}`}>
                          {(!showOnlyDifferences || !field.matching) && (
                            <TableCell>
                              <div className="flex items-start gap-4">
                                <div className={cn(
                                  "min-w-20 max-w-40 truncate",
                                  (result.status === 'missing-b' || field.valueA === null) ? "text-muted-foreground italic" : "",
                                  !field.matching && field.valueA !== null && field.valueB !== null ? "text-removed" : ""
                                )}
                                title={formatCellValue(field.valueA)}>
                                  {formatCellValue(field.valueA)}
                                </div>
                                
                                <div className={cn(
                                  "min-w-20 max-w-40 truncate",
                                  (result.status === 'missing-a' || field.valueB === null) ? "text-muted-foreground italic" : "",
                                  !field.matching && field.valueA !== null && field.valueB !== null ? "text-removed" : ""
                                )}
                                title={formatCellValue(field.valueB)}>
                                  {formatCellValue(field.valueB)}
                                </div>
                              </div>
                            </TableCell>
                          )}
                        </React.Fragment>
                      ))}
                      
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Add Note</DropdownMenuItem>
                            <DropdownMenuItem>Mark as Reviewed</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </AnimatedTransition>
      
      <div className="text-xs text-muted-foreground text-center mt-2">
        Showing {filteredResults.length} of {results.length} records
      </div>
    </div>
  );
};

export default ReconciliationTable;
