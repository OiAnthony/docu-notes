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

// 格式化日期为年月日
function formatDateToYMD(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return dateString
  }
}

// 动态生成答复列
function generateReplyColumns(comments: Comment[]): ColumnDef<Comment>[] {
  // 找出最大答复数量
  const maxReplies = Math.max(0, ...comments.map(comment => comment.replies?.length || 0))

  const replyColumns: ColumnDef<Comment>[] = []

  for (let i = 0; i < maxReplies; i++) {
    const replyIndex = i
    const columnSuffix = maxReplies > 1 && i > 0 ? ` ${i + 1}` : ''

    // 答复者列
    replyColumns.push({
      id: `reply_author_${i}`,
      header: `答复者${columnSuffix}`,
      cell: ({ row }) => {
        const replies = row.original.replies
        const reply = replies?.[replyIndex]

        if (!reply) {
          return <div className="text-muted-foreground text-xs">—</div>
        }

        return (
          <div className="min-w-[80px]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                {reply.author.charAt(0).toUpperCase()}
              </div>
              <div className="font-medium text-sm text-foreground truncate">
                {reply.author}
              </div>
            </div>
          </div>
        )
      },
      size: 100,
    })

    // 答复时间列
    replyColumns.push({
      id: `reply_date_${i}`,
      header: `答复时间${columnSuffix}`,
      cell: ({ row }) => {
        const replies = row.original.replies
        const reply = replies?.[replyIndex]

        if (!reply) {
          return <div className="text-muted-foreground text-xs">—</div>
        }

        return (
          <div className="text-sm text-muted-foreground min-w-[90px]">
            {formatDateToYMD(reply.date)}
          </div>
        )
      },
      size: 100,
    })

    // 答复内容列
    replyColumns.push({
      id: `reply_content_${i}`,
      header: `答复内容${columnSuffix}`,
      cell: ({ row }) => {
        const replies = row.original.replies
        const reply = replies?.[replyIndex]

        if (!reply) {
          return <div className="text-muted-foreground text-xs">—</div>
        }

        return (
          <div className="max-w-sm">
            <div className="text-sm text-foreground/80 leading-relaxed">
              <div className="whitespace-pre-wrap break-words">
                {reply.text}
              </div>
            </div>
          </div>
        )
      },
      size: 200,
    })
  }

  return replyColumns
}

// 基础列定义（不包含答复列）
const baseColumns: ColumnDef<Comment>[] = [
  {
    id: "index",
    header: () => (
      <div className="text-sm font-medium">
        序号
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-center font-medium">
        {row.index + 1}
      </div>
    ),
    size: 60,
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
    header: "需求原文",
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
    id: "authorAndDate",
    header: ({ column }) => (
      <SortableHeader column={column}>
        <div className="text-sm font-medium">
          预审者
        </div>
      </SortableHeader>
    ),
    accessorFn: (row) => `${row.author}_${row.date}`,
    cell: ({ row }) => {
      const author = row.original.author
      const date = row.original.date

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
              <div className="text-xs text-muted-foreground truncate">
                {formatDateToYMD(date)}
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
          {formatDateToYMD(row.original.date)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "replies",
    header: () => null, // 隐藏原来的答复列头
    cell: () => null, // 隐藏原来的答复列内容
    size: 0,
  },
  // {
  //   accessorKey: "id",
  //   header: () => (
  //     <div className="text-xs font-medium text-muted-foreground opacity-50">
  //       ID (调试)
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="text-xs font-mono text-muted-foreground bg-muted/20 px-1 py-0.5 rounded text-center opacity-50">
  //       {row.getValue("id")}
  //     </div>
  //   ),
  //   size: 60,
  // },
]

// 导出函数来生成完整的列定义
export function generateColumns(comments: Comment[]): ColumnDef<Comment>[] {
  const replyColumns = generateReplyColumns(comments)

  // 重新组织列的顺序：基础列 + 答复列（不包含隐藏的replies列和调试ID列）
  const finalColumns: ColumnDef<Comment>[] = []

  // 添加基础列（除了隐藏的replies列和调试ID列）
  baseColumns.forEach(col => {
    if (!('accessorKey' in col) || (col.accessorKey !== "replies" && col.accessorKey !== "id")) {
      finalColumns.push(col)
    }
  })

  // 在预审意见列之后插入答复列
  finalColumns.push(...replyColumns)

  // 最后添加调试ID列
  const idColumn = baseColumns.find(col => 'accessorKey' in col && col.accessorKey === "id")
  if (idColumn) {
    finalColumns.push(idColumn)
  }

  return finalColumns
}

// 保持向后兼容的默认导出
export const columns = baseColumns 
