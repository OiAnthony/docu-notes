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
      toast.success(`成功提取 ${result.length} 条批注`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '处理文件时出错')
      set({ comments: [], sourceFile: null })
    } finally {
      set({ isLoading: false })
    }
  },
  clearSourceFile: () => set({ sourceFile: null, comments: [] }),
})) 
