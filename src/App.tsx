import { Dropzone } from './components/Dropzone'
import { CommentTable } from './components/comment-table'
import { useCommentStore } from './store/comment'

export default function App() {
  const { comments, isLoading, sourceFile, setSourceFile } = useCommentStore()


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

        {!sourceFile && (
          <div className="max-w-2xl mx-auto mb-8">
            <Dropzone
              onFile={setSourceFile}
              className={isLoading ? 'opacity-50 pointer-events-none' : ''}
            />
          </div>
        )}

        {isLoading && (
          <div className="text-center text-muted-foreground animate-pulse">
            正在处理文档，请稍候...
          </div>
        )}

        {comments.length > 0 && (
          <div className="space-y-4 mt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">
                批注表格（共 {comments.length} 条）
              </h2>
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
