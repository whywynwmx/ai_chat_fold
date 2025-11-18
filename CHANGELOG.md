# 更新日志 / Changelog

## [0.2.2] - 2024-11-18

### 新增功能 / Added
- ✨ 新增对 Google Gemini 的支持
  - 支持在 gemini.google.com 页面折叠/展开 AI 回答内容
  - 添加全局"全部折叠"和"全部展开"按钮（位于工具栏左侧区域）
  - 使用自定义元素选择器（`model-response`, `message-content`）
  - 与 DeepSeek 和 AI Studio 保持一致的用户体验

### 修复 / Fixed
- 🐛 修正 Gemini 全局按钮选择器
  - 将全局按钮容器从 `.prompt-input-section` 改为 `.left-section`
  - 确保按钮正确显示在工具栏中

---

## [0.2.1] - 2024-11-18

### 修复 / Fixed
- 🐛 修复 DeepSeek 带思考过程的回答的折叠按钮问题
  - 统一按钮标签为"折叠"/"展开"
  - 修正按钮顺序：第一个按钮折叠思考内容，第二个按钮折叠回答内容
- 🐛 修复 AI Studio 切换对话后全局折叠/展开按钮消失的问题
  - 改进全局按钮的检查逻辑，确保按钮始终在正确的容器中
  - 添加 MutationObserver 监听工具栏变化，自动重新添加按钮
- 🐛 修复 AI Studio 全局折叠后单个按钮文本不更新的问题
  - 为所有按钮添加 `dataset` 属性存储标签文本
  - 确保全局操作时按钮文本正确切换
- 🐛 修复按钮重复添加和重合显示的问题
  - 添加 `data-aifold-processed` 标记防止重复处理
  - 为多按钮场景添加 CSS 定位规则
  - 优化 AI Studio 只操作第一个内容元素，避免重复操作

### 改进 / Improvements
- ✨ 优化 DeepSeek 全局按钮布局
  - 将"全部折叠"和"全部展开"按钮移至标题栏右侧
  - 与 AI Studio 保持一致的 UI 体验
  - 使用 Flexbox 布局，更加美观和易用

### 技术改进 / Technical Improvements
- 优化多内容块（思考+回答）的折叠按钮生成逻辑
- 增强 MutationObserver 对工具栏重新渲染的检测能力
- 统一按钮标签存储机制，使用 `data-fold-label` 和 `data-unfold-label`
- 为 DeepSeek 多按钮场景添加偏移定位样式
- 清理调试日志，提升性能和代码可读性
- 统一全局按钮插入方式，简化代码逻辑

---

## [0.2.0] - 2024-11-14

### 新增功能 / Added
- ✨ 新增对 Google AI Studio 的支持
  - 支持在 aistudio.google.com 页面折叠/展开 AI 回答内容
  - 添加全局"全部折叠"和"全部展开"按钮
  - 优化 AI Studio 页面的按钮样式和位置

### 技术改进 / Technical Improvements
- 添加 AI Studio 的 DOM 选择器配置
- 更新 manifest.json 权限配置支持 aistudio.google.com
- 优化 CSS 样式以兼容 AI Studio 的页面结构

---

## [0.1.0] - Initial Release

### 功能 / Features
- ✨ 支持 DeepSeek 平台
  - 单个回答的折叠/展开功能
  - 全局折叠/展开所有回答
  - 实时监听新增的 AI 回答并自动添加控制按钮

### 基础架构 / Infrastructure
- 模块化的站点配置系统
- 基于 MutationObserver 的动态内容监听
- 响应式按钮设计

