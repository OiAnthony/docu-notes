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
    accessorKey: "id",
    header: "批注ID",
    cell: ({ row }) => (
      <div className="text-xs font-mono text-muted-foreground">{row.getValue("id")}</div>
    ),
  },
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
  {
    accessorKey: "section",
    header: "所属章节",
    cell: ({ row }) => {
      const section = row.getValue("section") as string
      return (
        <div className="text-sm">
          {section || <span className="text-muted-foreground">未知章节</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "originalText",
    header: "批注原文",
    cell: ({ row }) => {
      const originalText = row.getValue("originalText") as string
      return (
        <div className="text-sm whitespace-pre-wrap break-words max-w-xs">
          {originalText || <span className="text-muted-foreground">无原文</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "replies",
    header: "答复批注",
    cell: ({ row }) => {
      const replies = row.getValue("replies") as Comment[]

      if (!replies || replies.length === 0) {
        return <div className="text-muted-foreground text-sm">无答复</div>
      }

      return (
        <div className="space-y-2">
          {replies.map((reply, index) => (
            <div key={`${reply.id}-${index}`} className="border-l-2 border-blue-200 pl-3 py-1">
              <div className="text-xs text-muted-foreground mb-1">
                {reply.author} · {reply.date}
              </div>
              <div className="text-sm whitespace-pre-wrap break-words">
                {reply.text}
              </div>
            </div>
          ))}
        </div>
      )
    },
  },
] 
