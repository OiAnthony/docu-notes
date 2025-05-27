import * as XLSX from 'xlsx'
import type { Comment } from './parseDocxComments'

export function exportToExcel(comments: Comment[]) {
  try {
    // 准备导出数据
    const exportData = comments.map(comment => {
      // 格式化答复批注
      const repliesText = comment.replies && comment.replies.length > 0
        ? comment.replies.map(reply =>
          `${reply.author} (${reply.date}): ${reply.text}`
        ).join('\n\n')
        : '无答复'

      return {
        '批注ID': comment.id,
        '预审者': comment.author,
        '日期': comment.date,
        '所属章节': comment.section || '未知章节',
        '预审原文': comment.originalText || '无原文',
        '预审意见': comment.text,
        '答复批注': repliesText
      }
    })

    // 创建工作簿和工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '文档批注')

    // 设置列宽
    const colWidths = [
      { wch: 10 }, // 批注ID
      { wch: 15 }, // 预审者
      { wch: 20 }, // 日期
      { wch: 30 }, // 所属章节
      { wch: 40 }, // 预审原文
      { wch: 50 }, // 预审意见
      { wch: 60 }  // 答复批注
    ]
    ws['!cols'] = colWidths

    // 导出文件
    const fileName = `文档批注_${new Date().toLocaleDateString('zh-CN')}.xlsx`
    XLSX.writeFile(wb, fileName)
  } catch (error) {
    console.error('导出 Excel 时出错:', error)
    throw new Error('导出 Excel 失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
} 
