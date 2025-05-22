import { create } from 'zustand'
import type { Comment } from '@/utils/parseDocxComments'
import { parseDocxComments } from '@/utils/parseDocxComments'
import { toast } from 'sonner'

interface CommentState {
  comments: Comment[]
  isLoading: boolean
  sourceFile: File | null
  setSourceFile: (file: File) => Promise<void>
  clearSourceFile: () => void
  filterText: string
  setFilterText: (text: string) => void
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  isLoading: false,
  sourceFile: null,
  filterText: '',
  setFilterText: (text) => set({ filterText: text }),
  setSourceFile: async (file) => {
    try {
      set({ isLoading: true, sourceFile: file })
      const result = await parseDocxComments(file)
      set({ comments: result })
      if (result.length === 0) {
        toast.warning('该文档中没有找到批注')
        set({ sourceFile: null })
      } else {
        toast.success(`成功提取 ${result.length} 条批注`)
      }
    } catch (error) {
      console.error('处理文件时出错:', error)
      toast.error('文档格式错误或无法读取，请确保上传的是有效的 Word 文档')
      set({ comments: [], sourceFile: null })
    } finally {
      set({ isLoading: false })
    }
  },
  clearSourceFile: () => set({ sourceFile: null, comments: [] }),
})) 
