import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Comment } from '@/utils/parseDocxComments'

interface CommentsTableProps {
  data: Comment[]
}

export function CommentsTable({ data }: CommentsTableProps) {
  if (!data.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] lg:w-[150px]">作者</TableHead>
            <TableHead className="w-[140px] lg:w-[180px] hidden sm:table-cell">日期</TableHead>
            <TableHead>批注内容</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell className="font-medium">{comment.author}</TableCell>
              <TableCell className="hidden sm:table-cell">{comment.date}</TableCell>
              <TableCell className="max-w-[300px] sm:max-w-none">
                <div className="whitespace-pre-wrap break-words">
                  {comment.text}
                </div>
                <div className="text-xs text-muted-foreground mt-1 sm:hidden">
                  {comment.date}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 
