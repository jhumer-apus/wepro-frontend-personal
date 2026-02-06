import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Label } from "@/src/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Columns3, Download } from "lucide-react";

type ColumnConfig = {
  columnName: string;
  cell: keyof any | ((row: any) => React.ReactNode);
  sortKey?: string;
};

export type ColumnOption = {
  key: string;
  label: string;
  selected: boolean;
};

type JobsTableProps = {
  rows: any[];
  mobileRows?: any[];
  columns: ColumnConfig[];
  mobileCard?: (row: any) => React.ReactNode;
  onSort?: (column: string) => void;
  activeSortKey?: string;
  sortDirection?: "asc" | "desc";
  mobileLoading?: boolean;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageSizeChange: (value: string) => void;
  onPageChange: (page: number) => void;
  maxHeightClassName?: string;
  onExport?: () => void;
  onColumnsChange?: (nextOptions: ColumnOption[]) => void;
  columnOptions?: ColumnOption[];
  headerRightComponent?: React.ReactNode;
};

const JobsTable: React.FC<JobsTableProps> = ({
  rows,
  mobileRows,
  columns,
  mobileCard,
  onSort,
  activeSortKey,
  sortDirection = "asc",
  mobileLoading = false,
  pageSize,
  currentPage,
  totalPages,
  totalCount,
  onPageSizeChange,
  onPageChange,
  maxHeightClassName,
  onExport,
  onColumnsChange,
  columnOptions,
  headerRightComponent,
}) => {
  const startEntry = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, totalCount);
  const mobileItems = mobileRows ?? rows;
  const inferredHasMore = mobileItems.length < totalCount;

  return (
    <div className="bg-transparent border-0 shadow-none md:bg-white md:dark:bg-slate-900 rounded-lg md:border md:border-slate-200 md:dark:border-slate-800 md:shadow-xl overflow-hidden">
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:px-4 px-0 py-3">
        <div className="flex items-center gap-2">
          <Label
            htmlFor="entries"
            className="text-sm text-neutral-600 dark:text-neutral-400"
          >
            Show
          </Label>
          <Select value={pageSize.toString()} onValueChange={onPageSizeChange}>
            <SelectTrigger className="w-20 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50, 100].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label className="text-sm text-neutral-600 dark:text-neutral-400">
            entries
          </Label>
        </div>
        {(onExport || (onColumnsChange && columnOptions && columnOptions.length > 0)) && (
          <div className="flex items-center gap-2 sm:ml-auto">
            {onExport && (
              <Button
                variant="outline"
                className="border-slate-300 dark:border-slate-700 rounded-full gap-2"
                onClick={onExport}
                size="sm"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
            {onColumnsChange && columnOptions && columnOptions.length > 0 ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full border-slate-300 dark:border-slate-700 px-3 gap-2"
                    title="Show/Hide Columns"
                    size="sm"
                  >
                    <Columns3 className="w-4 h-4" />
                    <span className="text-sm">Columns</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md">
                  <SheetHeader>
                    <SheetTitle>Manage Columns</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {columnOptions.map(option => (
                      <label key={option.key} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={option.selected}
                          onCheckedChange={() => {
                            if (!onColumnsChange || !columnOptions) return;
                            const nextOptions = columnOptions.map(opt =>
                              opt.key === option.key ? { ...opt, selected: !opt.selected } : opt
                            );
                            onColumnsChange(nextOptions);
                          }}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            ) : null}
          </div>
        )}
        {headerRightComponent && headerRightComponent}
      </div>

      <div className="px-0">
        {/* Desktop table */}
        <div className="hidden md:block">
          <Table className="min-w-[900px] border-collapse" maxHeightClassName={maxHeightClassName}>
            <TableHeader className="sticky top-0 z-10 whitespace-nowrap">
              <TableRow className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                {columns.map((col, idx) => {
                  const sortKey =
                    col.sortKey ??
                    (typeof col.cell === "string" ? col.cell : undefined);
                  const isActive = !!sortKey && activeSortKey === sortKey;
                  return (
                  <TableHead
                    key={`${col.columnName}-${idx}`}
                    className={`h-10 font-semibold text-slate-900 dark:text-slate-100 text-left align-middle select-none ${
                      sortKey ? "cursor-pointer" : "cursor-default"
                    }`}
                    onClick={() => sortKey && onSort?.(sortKey)}
                  >
                    <span className="inline-flex items-center gap-1">
                      <span>{col.columnName}</span>
                      {sortKey ? (
                        <span
                          className={`text-xs ${
                            isActive ? "text-blue-600" : "text-slate-400"
                          }`}
                        >
                          {isActive ? (sortDirection === "asc" ? "▲" : "▼") : "⇅"}
                        </span>
                      ) : null}
                    </span>
                  </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody >
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="py-20 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No records to show
                  </TableCell>
                </TableRow>
              ) : (
                rows.map(row => {
                  return (
                    <TableRow key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-200 border-b border-slate-100 dark:border-slate-700">
                      {columns.map((col, idx) => {
                        const content =
                          typeof col.cell === "function"
                            ? col.cell(row)
                            : row[col.cell as keyof typeof row];
                        return (
                          <TableCell
                            key={`${col.columnName}-${row.id}-${idx}`}
                            className={`py-3 align-top`}
                          >
                            {content}
                      </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {mobileItems.map(row => {
            if (mobileCard) {
              return mobileCard(row);
            }

            const entries = Object.entries(row ?? {});

            return (
              <Card key={row.id} className="border-slate-200 dark:border-slate-800 shadow-sm mb-3">
                <CardContent className="space-y-3 text-sm">
                  {entries.map(([key, value], idx) => {
                    const content =
                      value === null || value === undefined
                        ? String(value)
                        : typeof value === "object"
                          ? JSON.stringify(value)
                          : String(value);
                    return (
                      <div key={`${key}-${row.id}-${idx}`} className="space-y-1">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {key}
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-200">
                          {content}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}

          {onPageChange ? (
            <div className="pt-2 pb-4 flex justify-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!inferredHasMore || mobileLoading}
                className="w-full"
              >
                {mobileLoading ? "Loading..." : inferredHasMore ? "Load More" : "No more records"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="hidden md:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-3 border-t border-neutral-200 dark:border-neutral-700">
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          Showing {startEntry} to {endEntry} of {totalCount} entries
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobsTable;

