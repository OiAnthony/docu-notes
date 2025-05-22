import type { Comment } from '@/utils/parseDocxComments'
import { columns } from './columns'
import { DataTable } from './data-table'

interface CommentsTableProps {
  data: Comment[]
}

export function CommentTable({ data }: CommentsTableProps) {
  return <DataTable columns={columns} data={data} />
} 
