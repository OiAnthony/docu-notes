import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'

export interface Comment {
  id: string
  author: string
  date: string
  text: string
}

interface CommentData {
  '@_w:id': string;
  '@_w:author': string;
  '@_w:date': string;
  'w:p': ParagraphData | ParagraphData[];
}

interface ParagraphData {
  'w:r': RunData | RunData[];
}

interface RunData {
  'w:t': string | string[];
}

export async function parseDocxComments(file: File): Promise<Comment[]> {
  try {
    const buffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(buffer)

    const commentXml = await zip.file('word/comments.xml')?.async('string')
    if (!commentXml) {
      return []
    }

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    })

    const json = parser.parse(commentXml)
    const comments = json['w:comments']?.['w:comment'] || []

    // 确保 comments 始终是数组
    const commentsArray = Array.isArray(comments) ? comments : [comments]

    return commentsArray.map((c: CommentData) => ({
      id: c['@_w:id'] || '',
      author: c['@_w:author'] || '未知作者',
      date: new Date(c['@_w:date']).toLocaleString('zh-CN'),
      text: extractCommentText(c)
    }))
  } catch (error) {
    console.error('解析文档批注时出错:', error)
    throw new Error('解析文档批注失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

function extractCommentText(comment: CommentData): string {
  try {
    const paragraphs = Array.isArray(comment['w:p']) ? comment['w:p'] : [comment['w:p']]

    return paragraphs
      .map((p: ParagraphData) => {
        if (!p) return ''
        const runs = Array.isArray(p['w:r']) ? p['w:r'] : [p['w:r']]
        return runs
          .map((r: RunData) => {
            if (!r) return ''
            return Array.isArray(r['w:t']) ? r['w:t'].join('') : r['w:t'] || ''
          })
          .join('')
      })
      .join('\n')
      .trim()
  } catch (error) {
    console.error('提取批注文本时出错:', error)
    return '批注文本解析失败'
  }
} 
