import { useState } from 'react'
import { Dropzone } from './components/Dropzone'
import { CommentsTable } from './components/CommentsTable'
import { parseDocxComments } from './utils/parseDocxComments'
import { exportToExcel } from './utils/exportToExcel'
import type { Comment } from './utils/parseDocxComments'
import { Button } from './components/ui/button'
import { toast } from 'sonner'

export default function App() {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleFile = async (file: File) => {
    try {
      setIsLoading(true)
      const result = await parseDocxComments(file)
      setComments(result)
      toast.success(`成功提取 ${result.length} 条批注`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '处理文件时出错')
      setComments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    try {
      exportToExcel(comments)
      toast.success('成功导出 Excel 文件')
    } catch (error: unknown) {
      toast.error('导出 Excel 失败')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            DocuNotes 批注提取器
          </h1>
          <p className="text-muted-foreground text-lg">
            上传 Word 文档，自动提取所有批注并支持导出为 Excel
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <Dropzone
            onFile={handleFile}
            className={isLoading ? 'opacity-50 pointer-events-none' : ''}
          />
        </div>

        {isLoading && (
          <div className="text-center text-muted-foreground animate-pulse">
            正在处理文档，请稍候...
          </div>
        )}

        {comments.length > 0 && (
          <div className="space-y-4 mt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">
                批注列表（共 {comments.length} 条）
              </h2>
              <Button onClick={handleExport} size="lg" className="w-full sm:w-auto">
                导出到 Excel
              </Button>
            </div>
            <div className="bg-card rounded-lg shadow-sm">
              <CommentsTable data={comments} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
