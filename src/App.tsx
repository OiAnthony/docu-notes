import { Dropzone } from './components/Dropzone'
import { CommentTable } from './components/comment-table'
import { useCommentStore } from './store/comment'
import { FileText } from 'lucide-react'

export default function App() {
  const { comments, isLoading, sourceFile, setSourceFile } = useCommentStore()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              DocuNotes 批注提取器
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            智能提取 Word 文档中的所有批注，支持层级关系解析，一键导出为 Excel 表格
          </p>
        </div>

        {!sourceFile && (
          <div className="max-w-2xl mx-auto mb-12">
            <Dropzone
              onFile={setSourceFile}
              className={isLoading ? 'opacity-50 pointer-events-none' : ''}
            />
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center text-muted-foreground">
              <div className="font-medium">正在处理文档</div>
              <div className="text-sm">正在解析批注和层级关系...</div>
            </div>
          </div>
        )}

        {comments.length > 0 && (
          <div className="space-y-6 mt-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">批注表格</h2>
                <p className="text-muted-foreground mt-1">
                  共提取到 <span className="font-semibold text-foreground">{comments.length}</span> 条批注
                </p>
              </div>
            </div>
            <div className="bg-card rounded-lg">
              <CommentTable data={comments} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
