import type { Comment } from '@/utils/parseDocxComments'
import { generateColumns } from './columns'
import { DataTable } from './data-table'

interface CommentsTableProps {
  data: Comment[]
}

export function CommentTable({ data }: CommentsTableProps) {
  const columns = generateColumns(data)
  return <DataTable columns={columns} data={data} />
} 
