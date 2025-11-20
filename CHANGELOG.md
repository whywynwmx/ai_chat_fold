# 更新日志 / Changelog

## [0.2.10] - 2024-11-20

### 修复 / Fixed
- 🐛 修正 Claude.ai 全局按钮不显示的问题
  - 选择器从 `.flex.w-full.items-center.justify-between` 改为 `header .flex.w-full.items-center.justify-between`
  - 确保只选择 header 中的容器（之前匹配了多个元素，第一个不在 header 中）
  - 更新 CSS 选择器以匹配新的 DOM 结构

---

## [0.2.9] - 2024-11-20

### 改进 / Improvements
- 🎨 优化 Claude.ai 全局按钮位置
  - 全局按钮现在显示在 header 工具栏的 share 按钮左侧
  - 更新 `globalControlsSelector` 为 `.flex.w-full.items-center.justify-between`
  - 添加专门的插入逻辑，将按钮插入到 `.right-3.flex.gap-2` 之前
  - 优化按钮样式以匹配 Claude 的界面风格

---

## [0.2.8] - 2024-11-20

### 修复 / Fixed
- 🐛 修正 Claude.ai 容器选择器
  - `chatContainerSelector`: `#__next` → `body` (该元素不存在，改用 body)
  - `observerTargetSelector`: `#__next` → `body`
  - 其他选择器已验证正确（`.font-claude-response`, `.whitespace-pre-wrap`, `header`）

---

## [0.2.7] - 2024-11-20

### 修复 / Fixed
- 🐛 修正 Claude.ai 选择器配置（基于实际页面结构）
  - `chatContainerSelector`: `main` → `#__next` (Next.js 根容器)
  - `answerContainerSelector`: `[class*="font-claude-message"]` → `.font-claude-response`
  - `answerContentSelector`: `.prose` → `.whitespace-pre-wrap, [class*="markdown"]`
  - `globalControlsSelector`: `header` → `header.flex.w-full.bg-bg-100`
  - `observerTargetSelector`: `main` → `#__next`

### 改进 / Improvements
- 🎨 更新 Claude.ai CSS 样式以匹配实际的类名
- 📝 创建验证脚本 `debug/claude_verify.js`
- 📝 更新实现文档，记录实际的选择器

---

## [0.2.6] - 2024-11-20

### 新增功能 / Added
- ✨ 新增对 Claude.ai 的初步支持（实验性）
  - 添加了 Claude.ai 的基础配置
  - 添加了 manifest 权限配置
  - 添加了初始的 CSS 样式
  - ⚠️ **选择器需要在实际页面上验证和调整**
  - 提供了诊断脚本 `debug/claude_diagnostic_script.js` 用于获取正确的选择器

### 工具 / Tools
- 📝 创建 Claude.ai 诊断脚本
  - 自动查找正确的选择器
  - 分析页面结构
  - 提供详细的调试信息

---

## [0.2.5] - 2024-11-20

### 修复 / Fixed
- 🐛 修正 ChatGPT 选择器配置
  - 修复主域名 `chatgpt.com` 的匹配问题（之前只匹配子域名）
  - 将 `answerContainerSelector` 从 `article` 改为 `[data-message-author-role="assistant"]`
  - 确保按钮正确定位在回答内容的右上角，而不是页面右边
  - 将全局按钮从侧边栏移至页面顶部 header (`header#page-header`)

### 改进 / Improvements
- 🎨 优化 ChatGPT 按钮样式
  - 单个折叠按钮：定位在回答内容容器中
  - 全局按钮：透明背景，边框样式，与 header 风格一致
  - 改进 hover 效果

---

## [0.2.4] - 2024-11-20

### 新增功能 / Added
- ✨ 新增对 ChatGPT 的支持
  - 支持在 chat.openai.com 页面折叠/展开 AI 回答内容
  - 添加全局"全部折叠"和"全部展开"按钮（位于侧边栏导航区域）
  - 使用 `data-testid` 属性选择器确保选择器稳定性
  - 与其他平台保持一致的用户体验

### 改进 / Improvements
- 🎨 优化代码结构，清理调试日志

---

## [0.2.3] - 2024-11-18

### 新增功能 / Added
- ✨ 新增对 Qwen.ai 的支持
  - 支持在 qwen.ai 页面折叠/展开 AI 回答内容
  - 添加全局"全部折叠"和"全部展开"按钮
  - 使用实际的 CSS 类名：`.text-response-render-container`
  - 全局按钮放置在 `.flex.w-full.items-start` 容器中
  - 与其他平台保持一致的用户体验

### 修复 / Fixed
- 🐛 修正 Qwen.ai 选择器和功能
  - 将 `chatContainerSelector` 从 `#app` 改为 `#app-container`（实际的容器 ID）
  - 将 `observerTargetSelector` 从 `#app` 改为 `#messages-container`（更精确的监听目标）
  - 将 `answerContainerSelector` 从通配符改为 `.text-response-render-container`
  - 将 `answerContentSelector` 改为 `.text-response-render-container`（直接折叠容器本身）
  - 将 `globalControlsSelector` 改为 `.flex.w-full.items-start`（Tailwind CSS 类名组合）
  - 添加 `run_at: "document_end"` 确保页面 DOM 加载完成
  - 修正当容器和内容选择器相同时的按钮添加逻辑（按钮添加到父元素）
  - 修正全局折叠/展开功能，正确处理容器即内容的情况
  - 添加 MutationObserver 监听对话切换，确保全局按钮持久显示
  - 添加定期轮询机制（每 2 秒），自动恢复丢失的全局按钮

---

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

