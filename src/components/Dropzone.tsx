import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { FileText } from 'lucide-react'

interface DropzoneProps {
  onFile: (file: File) => void
  className?: string
}

export function Dropzone({ onFile, className }: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => acceptedFiles[0] && onFile(acceptedFiles[0])
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 hover:scale-[1.02]',
        isDragActive
          ? 'border-primary bg-primary/10 scale-[1.02]'
          : 'border-muted-foreground/25 hover:border-primary',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-primary/10 text-primary">
          <FileText className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive ? '放开以上传文件' : '拖拽 Word 文档到此处，或点击选择'}
          </p>
          <p className="text-sm text-muted-foreground">
            仅支持 .docx 格式文件
          </p>
        </div>
      </div>
    </div>
  )
} 
