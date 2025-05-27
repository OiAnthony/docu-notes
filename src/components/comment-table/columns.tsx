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
      className="-ml-4 h-auto p-2 hover:bg-transparent"
    >
      {children}
      {isSorted === "asc" ? (
        <ChevronUp className="ml-2 h-3 w-3 text-muted-foreground" />
      ) : isSorted === "desc" ? (
        <ChevronDown className="ml-2 h-3 w-3 text-muted-foreground" />
      ) : (
        <ArrowUpDown className="ml-2 h-3 w-3 text-muted-foreground/50" />
      )}
    </Button>
  )
}

export const columns: ColumnDef<Comment>[] = [
  {
    accessorKey: "id",
    header: () => (
      <div className="text-xs font-medium text-muted-foreground">
        ID
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded-md w-fit">
        {row.getValue("id")}
      </div>
    ),
    size: 70,
  },
  {
    accessorKey: "section",
    header: "章节",
    cell: ({ row }) => {
      const section = row.getValue("section") as string
      return (
        <div className="text-sm">
          {section ? (
            <span className="text-foreground/80">{section}</span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: "originalText",
    header: "预审原文",
    cell: ({ row }) => {
      const originalText = row.getValue("originalText") as string
      return (
        <div className="max-w-xs">
          {originalText ? (
            <div className="text-sm text-muted-foreground leading-relaxed">
              <div className="whitespace-pre-wrap break-words overflow-hidden" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {originalText}
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          )}
        </div>
      )
    },
    size: 180,
  },
  {
    accessorKey: "text",
    header: "预审意见",
    cell: ({ row }) => (
      <div className="max-w-md">
        <div className="text-sm leading-relaxed text-foreground">
          <div className="whitespace-pre-wrap break-words">
            {row.getValue("text")}
          </div>
        </div>
        <div className="text-xs text-muted-foreground mt-2 sm:hidden">
          {row.original.date}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "replies",
    header: "答复",
    cell: ({ row }) => {
      const replies = row.getValue("replies") as Comment[]

      if (!replies || replies.length === 0) {
        return (
          <div className="text-muted-foreground text-xs">
            —
          </div>
        )
      }

      return (
        <div className="space-y-3 max-w-sm">
          {replies.map((reply, index) => (
            <div key={`${reply.id}-${index}`} className="pl-3 border-l border-border">
              <div className="text-xs text-muted-foreground mb-1">
                {reply.author}
              </div>
              <div className="text-sm text-foreground/80 leading-relaxed">
                {reply.text}
              </div>
            </div>
          ))}
        </div>
      )
    },
    size: 200,
  },
  {
    id: "author",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <div className="text-sm font-medium">
          预审者
        </div>
      </SortableHeader>
    ),
    accessorFn: (row) => `${row.author}`,
    cell: ({ row }) => {
      const author = row.original.author

      return (
        <div className="min-w-[120px]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
              {author.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-foreground truncate">
                {author}
              </div>
            </div>
          </div>
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const authorA = rowA.original.author
      const authorB = rowB.original.author
      const dateA = new Date(rowA.original.date).getTime()
      const dateB = new Date(rowB.original.date).getTime()

      if (authorA !== authorB) {
        return authorA.localeCompare(authorB)
      }
      return dateB - dateA
    },
    size: 140,
  },
] 
