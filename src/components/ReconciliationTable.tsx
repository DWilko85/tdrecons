
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ReconciliationResult } from "@/types/dataSources";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  Filter,
  Search,
  XCircle,
} from "lucide-react";
import LoadingState from "./reconciliation/LoadingState";
import { cn } from "@/lib/utils";

interface ReconciliationTableProps {
  results: ReconciliationResult[];
  isLoading?: boolean;
  isHistoryView?: boolean;
}

const ReconciliationTable: React.FC<ReconciliationTableProps> = ({ 
  results,
  isLoading = false,
  isHistoryView = false
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "matching" | "different" | "missing-a" | "missing-b"
  >("all");

  const filteredResults = useMemo(() => {
    let filtered = results;

    if (searchQuery) {
      filtered = filtered.filter((result) => {
        const searchTerms = searchQuery.toLowerCase().split(" ");
        const rowText = Object.values(result).join(" ").toLowerCase();
        return searchTerms.every((term) => rowText.includes(term));
      });
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((result) => result.status === filterStatus);
    }

    return filtered;
  }, [results, searchQuery, filterStatus]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
          <div className="text-muted-foreground">
            <p>No reconciliation results yet</p>
            <p className="text-sm">
              Configure data sources and mappings to view results
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search results..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setFilterStatus("all")}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("matching")}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Matching
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("different")}>
              <XCircle className="mr-2 h-4 w-4" />
              Different
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("missing-a")}>
              <ArrowDown className="mr-2 h-4 w-4" />
              Missing in Principal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterStatus("missing-b")}>
              <ArrowUp className="mr-2 h-4 w-4" />
              Missing in Counterparty
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Key</TableHead>
              <TableHead>Status</TableHead>
              {results[0].fields.map((field) => (
                <React.Fragment key={field.name}>
                  <TableHead className="text-center bg-slate-50 border-l border-r">
                    {field.name}
                  </TableHead>
                </React.Fragment>
              ))}
            </TableRow>
            <TableRow className="border-b-0 h-8">
              <TableHead></TableHead>
              <TableHead></TableHead>
              {results[0].fields.map((field) => (
                <React.Fragment key={`${field.name}-headers`}>
                  <TableHead className="py-0 h-8">
                    <div className="flex text-xs font-normal text-muted-foreground">
                      <div className="flex-1 text-right pr-2 border-r">Principal</div>
                      <div className="flex-1 pl-2">Counterparty</div>
                    </div>
                  </TableHead>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.map((result) => (
              <TableRow key={result.key}>
                <TableCell className="font-medium">{result.key}</TableCell>
                <TableCell>
                  {result.status === "matching" && (
                    <Badge variant="outline" className="bg-green-50">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Matching
                    </Badge>
                  )}
                  {result.status === "different" && (
                    <Badge variant="destructive">
                      <XCircle className="mr-2 h-4 w-4" />
                      Different
                    </Badge>
                  )}
                  {result.status === "missing-a" && (
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Missing in Principal
                    </Badge>
                  )}
                  {result.status === "missing-b" && (
                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Missing in Counterparty
                    </Badge>
                  )}
                </TableCell>
                {result.fields.map((field) => (
                  <TableCell 
                    key={field.name} 
                    className={cn(
                      "p-0 h-12",
                      !field.matching && "bg-red-50"
                    )}
                  >
                    <div className="flex h-full">
                      <div 
                        className={cn(
                          "flex-1 flex items-center justify-end px-2 border-r",
                          result.status === "missing-a" && "bg-yellow-50/50",
                          !field.matching && "text-red-600 font-medium"
                        )}
                      >
                        {result.status !== "missing-a" 
                          ? formatValue(field.valueA) 
                          : "—"}
                      </div>
                      <div 
                        className={cn(
                          "flex-1 flex items-center px-2",
                          result.status === "missing-b" && "bg-yellow-50/50",
                          !field.matching && "text-red-600 font-medium"
                        )}
                      >
                        {result.status !== "missing-b" 
                          ? formatValue(field.valueB) 
                          : "—"}
                      </div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

// Helper function to format values for display
const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return "—";
  }
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (error) {
      return String(value);
    }
  }
  
  return String(value);
};

export default ReconciliationTable;
