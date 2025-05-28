import * as XLSX from 'xlsx'
import type { Comment } from './parseDocxComments'

// 格式化日期为年月日
function formatDateToYMD(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return dateString
  }
}

export function exportToExcel(comments: Comment[]) {
  try {
    // 找出最大答复数量
    const maxReplies = Math.max(0, ...comments.map(comment => comment.replies?.length || 0))

    // 准备导出数据
    const exportData = comments.map((comment, index) => {
      const baseData = {
        '序号': index + 1,
        '章节': comment.section || '未知章节',
        '需求原文': comment.originalText || '无原文',
        '预审者': comment.author,
        '预审时间': formatDateToYMD(comment.date),
        '预审意见': comment.text,
      }

      // 动态添加答复列
      const replyData: Record<string, string> = {}
      for (let i = 0; i < maxReplies; i++) {
        const reply = comment.replies?.[i]
        const suffix = maxReplies > 1 && i > 0 ? ` ${i + 1}` : ''

        if (reply) {
          replyData[`答复者${suffix}`] = reply.author
          replyData[`答复时间${suffix}`] = formatDateToYMD(reply.date)
          replyData[`答复内容${suffix}`] = reply.text
        } else {
          replyData[`答复者${suffix}`] = ''
          replyData[`答复时间${suffix}`] = ''
          replyData[`答复内容${suffix}`] = ''
        }
      }

      return { ...baseData, ...replyData }
    })

    // 创建工作簿和工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '文档批注')

    // 设置列宽
    const baseColWidths = [
      { wch: 8 },  // 序号
      { wch: 30 }, // 章节
      { wch: 40 }, // 需求原文
      { wch: 15 }, // 预审者
      { wch: 15 }, // 预审时间
      { wch: 50 }, // 预审意见
    ]

    // 为每个答复添加列宽
    const replyColWidths = []
    for (let i = 0; i < maxReplies; i++) {
      replyColWidths.push(
        { wch: 15 }, // 答复者
        { wch: 15 }, // 答复时间
        { wch: 50 }  // 答复内容
      )
    }

    // 添加后续字段的列宽
    const additionalColWidths = [
      { wch: 20 }, // 正式评审结论
      { wch: 15 }, // 责任人
      { wch: 15 }, // 计划完成时间
      { wch: 20 }  // 备注
    ]

    ws['!cols'] = [...baseColWidths, ...replyColWidths, ...additionalColWidths]

    // 导出文件
    const fileName = `文档批注_${new Date().toLocaleDateString('zh-CN')}.xlsx`
    XLSX.writeFile(wb, fileName)
  } catch (error) {
    console.error('导出 Excel 时出错:', error)
    throw new Error('导出 Excel 失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
} 
