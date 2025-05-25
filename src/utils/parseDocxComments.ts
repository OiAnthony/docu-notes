import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'

export interface Comment {
  id: string
  author: string
  date: string
  text: string
  paraId?: string
  replies?: Comment[]
}

interface CommentData {
  '@_w:id': string;
  '@_w:author': string;
  '@_w:date': string;
  'w:p': ParagraphData | ParagraphData[];
}

interface ParagraphData {
  'w:r': RunData | RunData[];
  '@_w14:paraId'?: string;
}

interface RunData {
  'w:t': string | string[];
}

interface CommentExtendedData {
  '@_w15:paraId': string;
  '@_w15:paraIdParent'?: string;
  '@_w15:done': string;
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

    // 解析基础批注数据
    const parsedComments = commentsArray.map((c: CommentData) => ({
      id: c['@_w:id'] || '',
      author: c['@_w:author'] || '未知作者',
      date: new Date(c['@_w:date']).toLocaleString('zh-CN'),
      text: extractCommentText(c),
      paraId: extractParaId(c),
      replies: [] as Comment[]
    }))

    // 解析 commentsExtended.xml 来建立父子关系
    const commentsExtendedXml = await zip.file('word/commentsExtended.xml')?.async('string')
    if (commentsExtendedXml) {
      const extendedJson = parser.parse(commentsExtendedXml)
      const extendedComments = extendedJson['w15:commentsEx']?.['w15:commentEx'] || []
      const extendedArray = Array.isArray(extendedComments) ? extendedComments : [extendedComments]

      // 建立paraId到comment的映射
      const paraIdToComment = new Map<string, Comment>()
      parsedComments.forEach(comment => {
        if (comment.paraId) {
          paraIdToComment.set(comment.paraId, comment)
        }
      })

      // 建立父子关系
      extendedArray.forEach((ext: CommentExtendedData) => {
        const paraId = ext['@_w15:paraId']
        const parentParaId = ext['@_w15:paraIdParent']

        if (parentParaId && paraId) {
          const parentComment = paraIdToComment.get(parentParaId)
          const childComment = paraIdToComment.get(paraId)

          if (parentComment && childComment) {
            parentComment.replies!.push(childComment)
          }
        }
      })

      // 只返回顶级批注（没有父批注的）
      return parsedComments.filter(comment => {
        return !extendedArray.some((ext: CommentExtendedData) =>
          ext['@_w15:paraId'] === comment.paraId && ext['@_w15:paraIdParent']
        )
      })
    }

    return parsedComments
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

function extractParaId(comment: CommentData): string | undefined {
  try {
    const paragraphs = Array.isArray(comment['w:p']) ? comment['w:p'] : [comment['w:p']]

    for (const p of paragraphs) {
      if (p && p['@_w14:paraId']) {
        return p['@_w14:paraId']
      }
    }
    return undefined
  } catch (error) {
    console.error('提取paraId时出错:', error)
    return undefined
  }
} 
