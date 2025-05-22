import * as XLSX from 'xlsx'
import type { Comment } from './parseDocxComments'

export function exportToExcel(comments: Comment[]) {
  try {
    // 准备导出数据
    const exportData = comments.map(comment => ({
      '作者': comment.author,
      '日期': comment.date,
      '批注内容': comment.text
    }))

    // 创建工作簿和工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '文档批注')

    // 设置列宽
    const colWidths = [
      { wch: 15 }, // 作者
      { wch: 20 }, // 日期
      { wch: 50 }  // 批注内容
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
