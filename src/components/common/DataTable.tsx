import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/common/EmptyState";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  /** Hides the column below `sm` so mobile keeps only the essentials. */
  hideOnMobile?: boolean;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  /** Describes the table for screen readers; also used as the visible caption id. */
  caption?: string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

/**
 * Accessible, responsive data table:
 * horizontal rail on small screens, sticky header, and shared empty/loading states.
 */
export function DataTable<T extends { id: string }>({
  columns,
  rows,
  caption,
  loading = false,
  emptyTitle = "Nothing here yet",
  emptyDescription = "Records will appear once the backend is connected.",
  className,
}: DataTableProps<T>) {
  if (loading) {
    return <TableSkeleton columns={Math.min(columns.length, 5)} />;
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={cn("tile scroll-rail p-0", className)}>
      <Table>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <TableHeader>
          <TableRow className="bg-accent/40 hover:bg-accent/40">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                scope="col"
                className={cn(
                  "text-[11px] font-bold tracking-wider whitespace-nowrap uppercase",
                  column.hideOnMobile && "hidden sm:table-cell",
                  column.className,
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(column.hideOnMobile && "hidden sm:table-cell", column.className)}
                >
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

