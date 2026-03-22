# get-man

## 简介

get-man 是一个类似 Postman 的 Web 应用，用于发送和测试 HTTP 请求。该应用为单机本地应用，面向开发者和测试人员，提供直观的界面来构建、发送和调试 API 请求。所有数据存储在本地浏览器中，无需服务器部署。

## 术语表

- **请求 (Request)**: 发送到服务器的 HTTP 请求，包含方法、URL、头部和请求体
- **集合 (Collection)**: 一组相关请求的文件夹，用于组织和管理 API 请求
- **环境 (Environment)**: 一组键值对变量，用于在不同环境间切换配置
- **历史记录 (History)**: 已发送请求的记录，可用于查看和重放

---

## 需求

### REQ-1: HTTP 请求发送

**用户故事**: 作为开发者，我想要发送各种类型的 HTTP 请求，以便测试和调试 API。

#### 验收标准

1. THE 系统 SHALL 支持 HTTP 方法: GET、POST、PUT、PATCH、DELETE、HEAD、OPTIONS
2. THE 系统 SHALL 允许用户输入请求 URL
3. THE 系统 SHALL 允许用户添加自定义请求头（键值对形式）
4. THE 系统 SHALL 支持以下请求体类型:
   - JSON
   - Form Data
   - x-www-form-urlencoded
   - Raw Text
5. WHEN 用户点击发送按钮，THE 系统 SHALL 发送请求并在响应区域显示结果
6. THE 系统 SHALL 显示响应状态码、响应时间、响应头和响应体
7. THE 系统 SHALL 支持响应体的格式化显示（JSON、HTML、XML、纯文本）

---

### REQ-2: 请求历史记录

**用户故事**: 作为开发者，我想要查看已发送请求的历史记录，以便快速重放之前的请求。

#### 验收标准

1. THE 系统 SHALL 自动保存每次发送的请求到历史记录
2. THE 系统 SHALL 在历史记录中显示: 请求方法、URL、时间戳、状态码
3. THE 系统 SHALL 支持从历史记录中点击请求以重新加载到编辑器
4. THE 系统 SHALL 支持清除历史记录
5. THE 系统 SHALL 将历史记录存储在本地浏览器（localStorage 或 IndexedDB）
6. THE 系统 SHALL 保存最近 100 条历史记录

---

### REQ-3: 请求集合管理

**用户故事**: 作为开发者，我想要将请求保存到集合中，以便组织和管理常用的 API 请求。

#### 验收标准

1. THE 系统 SHALL 允许用户创建集合（文件夹）
2. THE 系统 SHALL 允许用户将当前请求保存到集合中
3. THE 系统 SHALL 支持集合的嵌套结构（子文件夹）
4. THE 系统 SHALL 允许用户从集合中加载请求
5. THE 系统 SHALL 允许用户重命名和删除集合中的请求
6. THE 系统 SHALL 将集合数据持久化到本地存储

---

### REQ-4: 环境变量管理

**用户故事**: 作为开发者，我想要定义环境变量，以便在不同环境（开发、测试、生产）间快速切换配置。

#### 验收标准

1. THE 系统 SHALL 允许用户创建多个环境配置
2. THE 系统 SHALL 允许用户在每个环境中定义键值对变量
3. THE 系统 SHALL 支持 URL、请求头、请求体中使用 `{{variable_name}}` 语法引用变量
4. THE 系统 SHALL 允许用户在发送请求前选择当前活动环境
5. THE 系统 SHALL 允许用户添加、编辑、删除环境
6. THE 系统 SHALL 将环境配置持久化到本地存储

---

### REQ-5: 用户界面

**用户故事**: 作为开发者，我想要一个清晰直观的界面，以便高效地构建和发送请求。

#### 验收标准

1. THE 系统 SHALL 提供响应式布局，适配不同屏幕尺寸
2. THE 系统 SHALL 提供侧边栏显示集合和历史记录
3. THE 系统 SHALL 提供主编辑区域用于构建请求
4. THE 系统 SHALL 提供响应面板显示请求结果
5. THE 系统 SHALL 支持深色/浅色主题切换
6. THE 系统 SHALL 高亮显示 JSON 响应中的语法

---

## 非功能性需求

### 性能要求

- 请求发送响应时间 SHALL 不超过 30 秒（依赖网络）
- 页面加载时间 SHALL 不超过 3 秒
- 历史记录列表渲染 SHALL 支持 100 条记录无卡顿

### 兼容性要求

- THE 系统 SHALL 支持 Chrome、Firefox、Edge、Safari 最新版本
- THE 系统 SHALL 支持移动端浏览器访问

### 安全要求

- THE 系统 SHALL 不向任何外部服务器发送用户数据
- THE 系统 SHALL 所有数据存储在本地浏览器
- THE 系统 SHALL 在页面刷新后保留用户数据

---

## 技术约束

- 前端框架: Vue + Vite
- 数据存储: localStorage 或 IndexedDB
- 样式方案: CSS Modules 或 Tailwind CSS
- 无需后端服务器

---

## 未来迭代（暂不实现）

- 请求脚本（Pre-request Script、Tests）
- Mock 服务器
- 团队协作与云同步
- WebSocket 支持
- GraphQL 支持
