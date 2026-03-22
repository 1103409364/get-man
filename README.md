# Getman

一个类似 Postman 的 HTTP 客户端应用，基于 Tauri 构建桌面客户端，无需配置代理即可解决跨域问题。

## 功能特性

### HTTP 请求发送

- 支持 HTTP 方法：GET、POST、PUT、PATCH、DELETE、HEAD、OPTIONS
- 自定义请求头（键值对编辑器）
- 支持请求体类型：JSON、Form Data、x-www-form-urlencoded、Raw Text
- 响应状态码、响应时间、响应大小显示
- JSON/XML 语法高亮显示

### 请求历史记录

- 自动保存最近 100 条请求
- 显示方法、URL、时间戳、状态码
- 点击历史记录重新加载请求
- 支持清空和删除历史记录

### 请求集合管理

- 创建、编辑、删除集合
- 支持嵌套子文件夹
- 保存请求到集合
- 从集合加载请求

### 环境变量管理

- 创建多个环境配置
- 键值对变量定义
- `{{variable_name}}` 语法引用变量
- 快速切换活动环境

### 用户界面

- 响应式布局，适配桌面和移动端
- 侧边栏显示集合和历史记录
- 深色/浅色主题切换
- 现代化设计风格
- 自定义窗口标题栏（支持拖拽、最小化、最大化、关闭）

## 技术栈

- **桌面框架**: Tauri 2.0
- **前端框架**: Vue 3 + Vite
- **数据存储**: IndexedDB (Dexie)
- **语法高亮**: highlight.js
- **样式**: CSS Variables + Scoped CSS

## 快速开始

### 环境要求

- Node.js 18+
- Rust 1.77+
- 系统依赖（Linux）：
  ```bash
  sudo apt-get install -y libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
  ```

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run tauri:dev
```

### 生产构建

```bash
npm run tauri:build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录。

## 跨域解决方案

本应用基于 Tauri 构建，HTTP 请求通过 Rust 后端发送，完全绕过浏览器的 CORS 限制，无需配置代理服务器即可请求任意 API。

## 自定义窗口控制

应用使用无系统边框设计，提供自定义窗口控制栏：

- **拖拽移动**：点击标题栏空白区域可拖动窗口
- **最小化**：点击 `-` 按钮
- **最大化/还原**：点击 `□` 按钮切换最大化状态
- **关闭**：点击 `×` 按钮关闭窗口

窗口控制通过 Tauri 的窗口 API 实现，无需依赖 GTK 或其他桌面环境组件。

## 项目结构

```
src/
├── components/     # Vue 组件
│   ├── AppHeader.vue       # 顶部导航栏
│   ├── Sidebar.vue         # 侧边栏（集合/历史）
│   ├── RequestEditor.vue   # 请求编辑器
│   ├── ResponseViewer.vue  # 响应查看器
│   └── EnvironmentPanel.vue # 环境变量面板
├── stores/         # 状态管理
│   ├── store.js    # 全局状态
│   └── db.js       # IndexedDB 配置
├── utils/          # 工具函数
│   └── http.js     # HTTP 请求处理
├── assets/         # 静态资源
│   └── styles.css  # 全局样式
├── App.vue         # 根组件
└── main.js         # 入口文件

src-tauri/          # Tauri 后端
├── src/
│   ├── main.rs     # 入口
│   └── lib.rs      # HTTP 请求处理
├── Cargo.toml      # Rust 依赖
└── tauri.conf.json # Tauri 配置
```

## 数据存储

所有数据存储在本地：

- **collections**: 请求集合
- **requests**: 保存的请求
- **history**: 请求历史（最多 100 条）
- **environments**: 环境变量配置

## 许可证

MIT
