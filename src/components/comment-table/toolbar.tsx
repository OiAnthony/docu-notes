import type { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FileText, Trash2Icon } from "lucide-react"
import { useCommentStore } from "@/store/comment"
import { exportToExcel } from "@/utils/exportToExcel"
import { toast } from "sonner"
import type { Comment } from "@/utils/parseDocxComments"

interface DataTableToolbarProps {
  table: Table<Comment>
}

export function DataTableToolbar({
  table,
}: DataTableToolbarProps) {
  const { sourceFile, clearSourceFile, setSourceFile } = useCommentStore()
  const filterText = useCommentStore((state) => state.filterText)
  const setFilterText = useCommentStore((state) => state.setFilterText)

  const handleExport = () => {
    try {
      exportToExcel(table.getFilteredRowModel().rows.map(row => row.original))
      toast.success('成功导出 Excel 文件')
    } catch {
      toast.error('导出 Excel 失败')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSourceFile(file)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder="搜索批注内容..."
            value={filterText}
            onChange={(event) => setFilterText(event.target.value)}
            className="max-w-sm"
          />

        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {sourceFile && (
            <Button
              variant="outline"
              onClick={() => clearSourceFile()}
            >
              <Trash2Icon className="h-4 w-4" />
              <span>移除文件</span>
            </Button>
          )}
          <div className="relative flex-1 sm:flex-none">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="w-full">
              <FileText className="mr-2 h-4 w-4" />
              {sourceFile ? '更换文件' : '选择文件'}
            </Button>
          </div>
          <Button onClick={handleExport} className="flex-1 sm:flex-none">
            导出到 Excel
          </Button>
        </div>
      </div>
    </div>
  )
} 
