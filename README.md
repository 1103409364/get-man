# GetMan

一个类似 Postman 的 Web 应用，用于发送和测试 HTTP 请求。所有数据存储在本地浏览器中，无需服务器部署。

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

### 代理支持
- 配置代理服务器解决跨域问题
- 请求自动通过代理转发
- 代理状态持久化保存

### 用户界面
- 响应式布局，适配桌面和移动端
- 侧边栏显示集合和历史记录
- 深色/浅色主题切换
- 现代化设计风格

## 技术栈

- **前端框架**: Vue 3 + Vite
- **数据存储**: IndexedDB (Dexie)
- **HTTP 客户端**: Axios
- **语法高亮**: highlight.js
- **样式**: CSS Variables + Scoped CSS

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
npm run build
npm run preview
```

## 使用代理解决跨域

当目标 API 未配置 CORS 时，可以使用代理服务器转发请求：

### 1. 启动代理服务器

```bash
# 使用 cors-anywhere
npx cors-anywhere

# 或使用自定义代理
npm install http-proxy-middleware
```

### 2. 配置代理

1. 点击右下角的盾牌图标打开代理设置
2. 启用代理开关
3. 输入代理服务器地址（如 `http://localhost:8080`）

### 请求示例

```
原始请求：https://api.example.com/users
代理后：http://localhost:8080/https://api.example.com/users
```

## 项目结构

```
src/
├── components/          # Vue 组件
│   ├── AppHeader.vue    # 顶部导航栏
│   ├── Sidebar.vue      # 侧边栏（集合/历史）
│   ├── RequestEditor.vue # 请求编辑器
│   ├── ResponseViewer.vue # 响应查看器
│   ├── EnvironmentPanel.vue # 环境变量面板
│   ├── ProxyPanel.vue   # 代理设置面板
│   └── ...
├── stores/              # 状态管理
│   ├── store.js         # 全局状态
│   └── db.js            # IndexedDB 配置
├── utils/               # 工具函数
│   └── http.js          # HTTP 请求处理
├── assets/              # 静态资源
│   └── styles.css       # 全局样式
├── App.vue              # 根组件
└── main.js              # 入口文件
```

## 数据存储

所有数据存储在浏览器的 IndexedDB 中：

- **collections**: 请求集合
- **requests**: 保存的请求
- **history**: 请求历史（最多 100 条）
- **environments**: 环境变量配置

页面刷新后数据自动保留。

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Edge (最新版)
- Safari (最新版)

## 许可证

MIT
