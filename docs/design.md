## 技术实施文档

> 说明：*Docu* 表示 Word 文档，*Notes* 表示批注，*Extractor* 表示提取器，突出功能性和实用性。

---

## 📘 项目目标

构建一个纯前端（CSR）React 应用，支持用户拖拽 `.docx` 文件，自动提取文档中的批注（comments），以表格形式展示，支持一键导出为 Excel 表格。

---

## 📌 技术方案概览

| 功能模块     | 技术栈 / 库                     | 说明                      |
| -------- | --------------------------- | ----------------------- |
| 页面构建     | React + Vite                | 现代前端框架，快速开发启动           |
| 文件上传（拖拽） | `react-dropzone`            | 支持用户将 `.docx` 拖入页面      |
| 文件解析     | `jszip` + `fast-xml-parser` | 解压 `.docx` 并解析批注 XML    |
| 批注展示     | `Ant Design` 的 `Table` 组件   | 美观、易用的表格组件              |
| Excel 导出 | `xlsx`（SheetJS）             | 将 JSON 数据导出为 `.xlsx` 文件 |

---

## 📁 项目结构建议

```
docu-notes/
├── public/
├── src/
│   ├── assets/                 # 静态资源
│   ├── components/
│   │   ├── Dropzone.tsx         # 拖拽上传组件
│   │   └── CommentsTable.tsx    # 批注表格展示组件
│   ├── utils/
│   │   ├── parseDocxComments.ts # 解析 docx 批注
│   │   └── exportToExcel.ts     # 导出 Excel 方法
│   ├── App.css                 # App 组件特定样式 (如果需要)
│   ├── App.tsx                  # 主应用入口
│   ├── index.css               # 全局样式
│   ├── main.tsx                 # React 渲染入口
│   └── vite-env.d.ts           # Vite 环境变量声明
├── docs/
│   └── design.md               # 技术实施文档
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🔧 技术实施步骤

### 1️⃣ 拖拽上传 `.docx` 文件

使用 `react-dropzone` 创建上传区域并处理用户上传：

```tsx
import { useDropzone } from 'react-dropzone'

function Dropzone({ onFile }) {
  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    onDrop: (acceptedFiles) => onFile(acceptedFiles[0])
  })

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      <p>Drag and drop a .docx file here, or click to select</p>
    </div>
  )
}
```

---

### 2️⃣ 解析 `.docx` 文件批注

`parseDocxComments.ts`：

```ts
import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'

export async function parseDocxComments(file: File) {
  const buffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(buffer)
  const commentXml = await zip.file('word/comments.xml')?.async('string')
  if (!commentXml) throw new Error('No comments found.')

  const parser = new XMLParser()
  const json = parser.parse(commentXml)
  const comments = json['w:comments']?.['w:comment'] || []

  return comments.map((c: any) => ({
    author: c['@_w:author'],
    date: c['@_w:date'],
    text: Array.isArray(c['w:p'])
      ? c['w:p'].map((p: any) =>
          Array.isArray(p['w:r']) ? p['w:r'].map((r: any) => r['w:t']).join('') : ''
        ).join(' ')
      : ''
  }))
}
```

---

### 3️⃣ 批注表格展示

`CommentsTable.tsx` 使用 Ant Design：

```tsx
import { Table } from 'antd'

export function CommentsTable({ data }) {
  const columns = [
    { title: 'Author', dataIndex: 'author', key: 'author' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Comment', dataIndex: 'text', key: 'text' }
  ]

  return <Table dataSource={data} columns={columns} rowKey={(_, i) => i} />
}
```

---

### 4️⃣ 导出 Excel 表格

`exportToExcel.ts`：

```ts
import * as XLSX from 'xlsx'

export function exportToExcel(comments: any[]) {
  const ws = XLSX.utils.json_to_sheet(comments)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Comments')
  XLSX.writeFile(wb, 'comments.xlsx')
}
```

---

### 5️⃣ 主页面 App.tsx 示例

```tsx
import { useState } from 'react'
import { parseDocxComments } from './utils/parseDocxComments'
import { exportToExcel } from './utils/exportToExcel'
import { CommentsTable } from './components/CommentsTable'
import Dropzone from './components/Dropzone'

export default function App() {
  const [comments, setComments] = useState([])

  const handleFile = async (file: File) => {
    try {
      const result = await parseDocxComments(file)
      setComments(result)
    } catch (e) {
      alert('Failed to parse comments: ' + e.message)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">DocuNotes Extractor</h1>
      <Dropzone onFile={handleFile} />
      {comments.length > 0 && (
        <>
          <button onClick={() => exportToExcel(comments)} className="my-4 btn btn-primary">
            Export to Excel
          </button>
          <CommentsTable data={comments} />
        </>
      )}
    </div>
  )
}
```

---

## ✅ 项目特性总结

| 特性             | 支持情况                            |
| -------------- | ------------------------------- |
| 浏览器内解析 `.docx` | ✅ 使用 JSZip 完全在内存中解压             |
| 提取 Word 批注     | ✅ 支持 `word/comments.xml` 中的批注解析 |
| 表格展示           | ✅ 使用 React Table / Ant Design   |
| Excel 导出       | ✅ 一键导出为 `.xlsx` 文件              |
| 离线运行           | ✅ 完全前端，无需服务端                    |
| 隐私安全           | ✅ 文件不上传，用户数据不外泄                 |

---

## 📌 后续可扩展方向（可选）

* 支持 `.docx` 中提取批注所在位置、页码（需要更复杂的 Word 结构解析）
* 支持批注筛选与搜索
* 支持预审意见编辑后导出
