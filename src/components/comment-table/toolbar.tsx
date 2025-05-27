import type { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Upload, X } from "lucide-react"
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

  const filteredRowsCount = table.getFilteredRowModel().rows.length
  const totalRowsCount = table.getCoreRowModel().rows.length

  return (
    <div className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border/50">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索批注内容..."
              value={filterText}
              onChange={(event) => setFilterText(event.target.value)}
              className="pl-10 border-border/50 focus:border-border"
            />
          </div>
          {filterText && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterText('')}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              清除
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {sourceFile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearSourceFile()}
              className="text-muted-foreground hover:text-foreground"
            >
              移除文件
            </Button>
          )}
          <div className="relative flex-1 sm:flex-none">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" size="sm" className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {sourceFile ? '更换文件' : '选择文件'}
            </Button>
          </div>
          <Button
            onClick={handleExport}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            导出 Excel
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>
            显示 <Badge variant="outline" className="mx-1 text-xs">{filteredRowsCount}</Badge> / <Badge variant="outline" className="mx-1 text-xs">{totalRowsCount}</Badge> 条批注
          </span>
          {sourceFile && (
            <span className="text-xs">
              · {sourceFile.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
} 
