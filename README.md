# DocuNotes - Word文档批注提取工具

一个基于React + TypeScript + Vite的现代化Web应用，用于提取和管理Microsoft Word文档中的预审意见。

## 功能特性

### 核心功能

- 📄 **DOCX文件解析**: 支持上传和解析Microsoft Word文档(.docx格式)
- 💬 **批注提取**: 自动提取文档中的所有预审意见
- 🔗 **答复批注支持**: 新增支持批注答复功能，自动识别和关联批注与其答复
- 📊 **表格展示**: 使用现代化表格组件展示批注数据，支持排序和筛选
- 📤 **Excel导出**: 将批注数据导出为Excel文件，包含答复批注信息
- 🎨 **现代化UI**: 基于shadcn/ui的美观界面设计
- 🌙 **主题支持**: 支持明暗主题切换

### 技术特性

- 🔒 **隐私保护**: 所有处理都在浏览器端完成，无需上传文件到服务器
- ⚡ **高性能**: 使用Vite构建，支持热重载和快速开发
- 📱 **响应式设计**: 适配各种屏幕尺寸
- 🚀 **Cloudflare部署**: 支持部署到Cloudflare Workers

## 批注答复功能

新版本支持Word文档中的批注答复功能：

- **自动识别**: 自动解析`word/commentsExtended.xml`文件中的父子关系
- **层级显示**: 在表格中清晰展示主批注和其答复批注
- **完整导出**: Excel导出包含所有答复批注信息
- **关联关系**: 基于`paraIdParent`属性建立批注间的关联关系

### 数据结构示例

```xml
<!-- commentsExtended.xml中的关联关系 -->
<w15:commentEx w15:paraId="7E6F4213" w15:done="0"/>
<w15:commentEx w15:paraId="50A4B19A" w15:done="0" w15:paraIdParent="7E6F4213"/>
<w15:commentEx w15:paraId="3C1990AF" w15:done="0" w15:paraIdParent="7E6F4213"/>
```

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **UI组件**: Tailwind CSS 4 + Radix UI + shadcn/ui
- **状态管理**: Zustand
- **文件处理**: JSZip + fast-xml-parser
- **表格组件**: TanStack Table
- **数据导出**: xlsx
- **部署平台**: Cloudflare Workers + Pages

## 开发指南

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 部署到Cloudflare

```bash
npm run deploy
```

## 项目结构

```
src/
├── components/          # React组件
│   ├── ui/             # 基础UI组件
│   └── comment-table/  # 批注表格组件
├── utils/              # 工具函数
│   ├── parseDocxComments.ts  # DOCX解析核心逻辑
│   └── exportToExcel.ts     # Excel导出功能
├── store/              # 状态管理
├── hooks/              # 自定义Hooks
└── types/              # TypeScript类型定义
```

## 更新日志

### v1.1.0 (最新)

- ✨ 新增批注答复功能支持
- 🔗 自动识别和关联批注与答复的父子关系
- 📊 表格新增"答复批注"列
- 📤 Excel导出包含答复批注信息
- 🐛 修复批注解析的边界情况

### v1.0.0

- 🎉 初始版本发布
- 📄 基础DOCX批注提取功能
- 📊 表格展示和排序功能
- 📤 Excel导出功能

## 许可证

MIT License
