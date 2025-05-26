import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'

export interface Comment {
  id: string
  author: string
  date: string
  text: string
  paraId?: string
  replies?: Comment[]
  originalText?: string  // 批注原文
  section?: string       // 所属章节
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

interface StyleData {
  '@_w:type': string;
  '@_w:styleId': string;
  'w:name'?: {
    '@_w:val': string;
  };
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

    // 解析样式信息
    const styleMap = await parseStyles(zip, parser)
    
    // 解析文档内容和批注原文、章节信息
    const documentData = await parseDocument(zip, parser, styleMap)

    // 解析基础批注数据
    const parsedComments = commentsArray.map((c: CommentData) => ({
      id: c['@_w:id'] || '',
      author: c['@_w:author'] || '未知作者',
      date: new Date(c['@_w:date']).toLocaleString('zh-CN'),
      text: extractCommentText(c),
      paraId: extractParaId(c),
      replies: [] as Comment[],
      originalText: documentData.commentOriginalTexts[c['@_w:id']] || '',
      section: documentData.commentSections[c['@_w:id']] || ''
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

// 解析样式信息，识别标题样式
async function parseStyles(zip: JSZip, parser: XMLParser): Promise<Map<string, string>> {
  try {
    const stylesXml = await zip.file('word/styles.xml')?.async('string')
    if (!stylesXml) {
      return new Map()
    }

    const stylesJson = parser.parse(stylesXml)
    const styles = stylesJson['w:styles']?.['w:style'] || []
    const stylesArray = Array.isArray(styles) ? styles : [styles]

    const styleMap = new Map<string, string>()

    stylesArray.forEach((style: StyleData) => {
      if (style['@_w:type'] === 'paragraph' && style['w:name']) {
        const styleName = style['w:name']['@_w:val']
        const styleId = style['@_w:styleId']
        
        // 识别标题样式
        if (styleName && typeof styleName === 'string' && 
            styleName.toLowerCase().includes('heading')) {
          styleMap.set(styleId, styleName)
        }
      }
    })

    return styleMap
  } catch (error) {
    console.error('解析样式时出错:', error)
    return new Map()
  }
}

// 解析文档内容，提取批注原文和所属章节
async function parseDocument(zip: JSZip, parser: XMLParser, styleMap: Map<string, string>): Promise<{
  commentOriginalTexts: Record<string, string>
  commentSections: Record<string, string>
}> {
  try {
    const documentXml = await zip.file('word/document.xml')?.async('string')
    if (!documentXml) {
      return { commentOriginalTexts: {}, commentSections: {} }
    }

    console.log('开始解析文档内容...')
    
    const documentJson = parser.parse(documentXml)
    const body = documentJson['w:document']?.['w:body']
    if (!body) {
      return { commentOriginalTexts: {}, commentSections: {} }
    }

    const commentOriginalTexts: Record<string, string> = {}
    const commentSections: Record<string, string> = {}

    // 使用更直接的方法解析XML字符串来查找批注范围和章节
    const commentRangeData = extractCommentRangesFromXml(documentXml)
    console.log(`从XML中找到 ${Object.keys(commentRangeData).length} 个批注范围`)

    // 构建章节位置映射
    const sectionPositions = extractSectionPositions(documentXml, styleMap)
    console.log(`找到 ${sectionPositions.length} 个章节`)

    // 为每个批注分配章节
    for (const [commentId, rangeData] of Object.entries(commentRangeData)) {
      commentOriginalTexts[commentId] = rangeData.text
      
      // 根据批注位置查找最近的章节
      const section = findNearestSection(rangeData.start, sectionPositions)
      commentSections[commentId] = section
      
      console.log(`批注 ${commentId}: 原文="${rangeData.text}", 章节="${section}", 位置=${rangeData.start}`)
    }

    console.log(`解析完成，共提取 ${Object.keys(commentOriginalTexts).length} 个批注原文`)
    return { commentOriginalTexts, commentSections }
  } catch (error) {
    console.error('解析文档内容时出错:', error)
    return { commentOriginalTexts: {}, commentSections: {} }
  }
}





// 从XML字符串中直接提取批注范围信息
function extractCommentRangesFromXml(xmlString: string): Record<string, { start: number; end: number; text: string }> {
  const commentRanges: Record<string, { start: number; end: number; text: string }> = {}
  
  try {
    // 查找所有批注范围开始标记
    const startMatches = [...xmlString.matchAll(/<w:commentRangeStart w:id="(\d+)"\/>/g)]
    const endMatches = [...xmlString.matchAll(/<w:commentRangeEnd w:id="(\d+)"\/>/g)]
    
    startMatches.forEach(startMatch => {
      const commentId = startMatch[1]
      const startPos = startMatch.index || 0
      
      // 查找对应的结束标记
      const endMatch = endMatches.find(end => end[1] === commentId)
      if (endMatch) {
        const endPos = endMatch.index || 0
        
        // 提取范围内的文本
        const rangeXml = xmlString.substring(startPos, endPos + endMatch[0].length)
        const text = extractTextFromXmlRange(rangeXml)
        
        commentRanges[commentId] = {
          start: startPos,
          end: endPos,
          text: text
        }
      }
    })
    
    return commentRanges
  } catch (error) {
    console.error('从XML提取批注范围时出错:', error)
    return {}
  }
}

// 从XML范围中提取文本内容
function extractTextFromXmlRange(xmlRange: string): string {
  try {
    // 检查是否包含图片元素
    if (xmlRange.includes('<w:drawing>') || xmlRange.includes('<w:pict>') || xmlRange.includes('<pic:pic>')) {
      return '【图片】'
    }
    
    // 查找所有 w:t 标签中的文本
    const textMatches = [...xmlRange.matchAll(/<w:t[^>]*>(.*?)<\/w:t>/g)]
    const text = textMatches.map(match => match[1]).join('').trim()
    
    // 如果没有文本但有其他内容，可能是图片或其他元素
    if (!text && xmlRange.length > 100) { // 如果XML内容较长但没有文本，可能是图片
      return '【图片】'
    }
    
    return text
  } catch (error) {
    console.error('从XML范围提取文本时出错:', error)
    return ''
  }
}

// 提取带标题号的章节标题
function extractTitleWithNumber(titleText: string): string {
  try {
    // 尝试匹配常见的标题号格式
    const patterns = [
      /^(\d+(?:\.\d+)*)\s*(.+)/, // 1.1 标题 或 1.1.1 标题
      /^([一二三四五六七八九十]+)\s*[、.]\s*(.+)/, // 一、标题
      /^([IVXLCDM]+)\s*[、.]\s*(.+)/, // I、标题
      /^([A-Z])\s*[、.]\s*(.+)/, // A、标题
    ]
    
    for (const pattern of patterns) {
      const match = titleText.match(pattern)
      if (match) {
        return `${match[1]} ${match[2]}`
      }
    }
    
    // 如果没有匹配到标题号，返回原文
    return titleText
  } catch (error) {
    console.error('提取标题号时出错:', error)
    return titleText
  }
}



// 提取章节位置信息
function extractSectionPositions(xmlString: string, styleMap: Map<string, string>): Array<{ position: number; title: string; level: number }> {
  try {
    const sectionPositions: Array<{ position: number; title: string; level: number }> = []
    
    // 查找所有段落样式标记
    const styleMatches = [...xmlString.matchAll(/<w:pStyle w:val="([^"]+)"\/>/g)]
    
    for (const match of styleMatches) {
      const styleId = match[1]
      const position = match.index || 0
      
      // 检查是否是标题样式
      if (styleMap.has(styleId)) {
        // 查找这个样式标记后面的文本内容
        const afterStyleXml = xmlString.substring(position)
        const paragraphEndMatch = afterStyleXml.match(/<\/w:p>/)
        
        if (paragraphEndMatch) {
          const paragraphXml = afterStyleXml.substring(0, paragraphEndMatch.index! + paragraphEndMatch[0].length)
          const titleText = extractTextFromXmlRange(paragraphXml)
          
          if (titleText && titleText !== '【图片】') {
            // 获取标题级别
            const level = getHeadingLevel(styleId, styleMap)
            const titleWithNumber = extractTitleWithNumber(titleText.trim())
            
            sectionPositions.push({
              position,
              title: titleWithNumber,
              level
            })
          }
        }
      }
    }
    
    // 按位置排序
    sectionPositions.sort((a, b) => a.position - b.position)
    
    // 智能推断章节序号
    const sectionsWithNumbers = inferSectionNumbers(sectionPositions)
    
    return sectionsWithNumbers
  } catch (error) {
    console.error('提取章节位置时出错:', error)
    return []
  }
}

// 根据位置查找最近的章节
function findNearestSection(position: number, sectionPositions: Array<{ position: number; title: string; level: number }>): string {
  try {
    if (sectionPositions.length === 0) {
      return '未知章节'
    }
    
    // 查找位置之前最近的章节
    let nearestSection = '未知章节'
    
    for (const section of sectionPositions) {
      if (section.position <= position) {
        nearestSection = section.title
      } else {
        break // 已经超过了批注位置，停止查找
      }
    }
    
    return nearestSection
  } catch (error) {
    console.error('查找最近章节时出错:', error)
    return '未知章节'
  }
}

// 获取标题级别
function getHeadingLevel(styleId: string, styleMap: Map<string, string>): number {
  try {
    const styleName = styleMap.get(styleId)
    if (!styleName) return 1
    
    // 从样式名称中提取级别
    const match = styleName.match(/heading\s*(\d+)/i)
    if (match) {
      return parseInt(match[1], 10)
    }
    
    // 如果没有明确的级别，根据样式ID推断
    if (styleId.includes('1')) return 1
    if (styleId.includes('2')) return 2
    if (styleId.includes('3')) return 3
    if (styleId.includes('4')) return 4
    if (styleId.includes('5')) return 5
    if (styleId.includes('6')) return 6
    
    return 1 // 默认为1级标题
  } catch (error) {
    console.error('获取标题级别时出错:', error)
    return 1
  }
}

// 智能推断章节序号
function inferSectionNumbers(sections: Array<{ position: number; title: string; level: number }>): Array<{ position: number; title: string; level: number }> {
  try {
    const result = [...sections]
    const counters: number[] = [0, 0, 0, 0, 0, 0] // 支持6级标题
    
    for (let i = 0; i < result.length; i++) {
      const section = result[i]
      const level = section.level
      
      // 增加当前级别的计数器
      counters[level - 1]++
      
      // 重置更深级别的计数器
      for (let j = level; j < counters.length; j++) {
        counters[j] = 0
      }
      
      // 检查标题是否已经有序号
      const hasNumber = /^[\d一二三四五六七八九十IVXLCDM]+[.\s]/.test(section.title)
      
      if (!hasNumber) {
        // 构建序号
        const numbers = counters.slice(0, level).filter(n => n > 0)
        const sectionNumber = numbers.join('.')
        
        // 添加序号到标题
        result[i] = {
          ...section,
          title: `${sectionNumber} ${section.title}`
        }
      } else {
        // 如果已有序号，尝试从中提取数字更新计数器
        const numberMatch = section.title.match(/^(\d+(?:\.\d+)*)/);
        if (numberMatch) {
          const numbers = numberMatch[1].split('.').map(n => parseInt(n, 10))
          for (let j = 0; j < numbers.length && j < counters.length; j++) {
            counters[j] = numbers[j]
          }
        }
      }
    }
    
    console.log('推断的章节序号:', result.map(s => s.title))
    return result
  } catch (error) {
    console.error('推断章节序号时出错:', error)
    return sections
  }
} 
