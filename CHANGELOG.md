# 更新日志

## [1.1.0] - 2025-05-25

### 新增功能 ✨

- **批注答复支持**: 新增对Word文档批注答复功能的完整支持
  - 自动解析`word/commentsExtended.xml`文件
  - 识别批注间的父子关联关系（基于`w15:paraIdParent`属性）
  - 在表格中新增"答复批注"列，层级显示主批注和答复
  - Excel导出包含完整的答复批注信息

### 技术改进 🔧

- 扩展`Comment`接口，添加`paraId`和`replies`字段
- 优化`parseDocxComments`函数，支持解析批注扩展信息
- 改进表格列定义，美化答复批注的显示效果
- 更新Excel导出逻辑，格式化答复批注数据

### 数据结构变更 📊

```typescript
// 新的Comment接口
interface Comment {
  id: string
  author: string
  date: string
  text: string
  paraId?: string      // 新增：段落ID
  replies?: Comment[]  // 新增：答复批注数组
}
```

### 解析逻辑 🔍

- 解析`word/comments.xml`获取基础批注信息
- 解析`word/commentsExtended.xml`建立父子关系
- 通过`paraId`映射关联主批注和答复批注
- 过滤返回顶级批注（非答复的批注）

### 界面优化 🎨

- 答复批注采用缩进样式显示
- 使用蓝色左边框区分答复内容
- 显示答复者信息和时间
- 无答复时显示"无答复"提示

### 导出功能 📤

- Excel文件新增"答复批注"列
- 答复内容格式：`作者 (日期): 内容`
- 多个答复用双换行符分隔
- 无答复显示"无答复"

## [1.0.0] - 2025-05-24

### 初始功能 🎉

- DOCX文件上传和解析
- 批注内容提取和展示
- 表格排序和筛选
- Excel导出功能
- 响应式界面设计
- 明暗主题支持
