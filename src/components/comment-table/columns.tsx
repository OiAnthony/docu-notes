"use client"

import type { ColumnDef, Column } from "@tanstack/react-table"
import type { Comment } from '@/utils/parseDocxComments'
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useColumnSorting } from "@/hooks/use-column-sorting"

function SortableHeader({
  column,
  children,
}: {
  column: Column<Comment>
  children: React.ReactNode
}) {
  const { isSorted, handleSort } = useColumnSorting(column)
  return (
    <Button
      variant="ghost"
      onClick={handleSort}
      className="-ml-4"
    >
      {children}
      {isSorted === "asc" ? (
        <ChevronUp className="ml-2 h-4 w-4" />
      ) : isSorted === "desc" ? (
        <ChevronDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  )
}

export const columns: ColumnDef<Comment>[] = [
  {
    accessorKey: "author",
    header: ({ column }) => (
      <SortableHeader column={column}>作者</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("author")}</div>
    ),
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <SortableHeader column={column}>日期</SortableHeader>
    ),
    cell: ({ row }) => (
      <div className="hidden sm:block">{row.getValue("date")}</div>
    ),
  },
  {
    accessorKey: "text",
    header: "批注内容",
    cell: ({ row }) => (
      <div>
        <div className="whitespace-pre-wrap break-words">
          {row.getValue("text")}
        </div>
        <div className="text-xs text-muted-foreground mt-1 sm:hidden">
          {row.getValue("date")}
        </div>
      </div>
    ),
  },
] 
