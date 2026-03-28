# 部署文档

## 1. 环境要求

- Node.js 16.0+ 
- MongoDB 4.0+
- 微信云托管环境

## 2. 后端部署

### 2.1 本地开发环境部署

1. **克隆仓库**
   ```bash
   git clone <仓库地址>
   cd cloudbase-express
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   创建 `.env` 文件，配置以下内容：
   ```env
   # 服务器配置
   PORT=3000

   # 数据库配置
   DB_URI=mongodb://localhost:27017/wechat-cloud

   # JWT配置
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d

   # 上传配置
   UPLOAD_DIR=./uploads
   MAX_UPLOAD_SIZE=10mb

   # 日志配置
   LOG_LEVEL=info
   ```

4. **启动服务**
   ```bash
   npm start
   ```

### 2.2 微信云托管部署

1. **准备Dockerfile**
   仓库中已包含 `Dockerfile` 文件，内容如下：
   ```dockerfile
   FROM node:16-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **构建镜像**
   ```bash
   docker build -t cloudbase-express .
   ```

3. **部署到微信云托管**
   - 登录微信云托管控制台
   - 创建新服务
   - 上传镜像或使用代码仓库直接部署
   - 配置环境变量
   - 启动服务

## 3. 前端部署

### 3.1 本地开发环境部署

1. **进入前端目录**
   ```bash
   cd D:\wxxcx\admin
   ```

2. **启动本地服务器**
   可以使用任何静态文件服务器，例如：
   ```bash
   # 使用Python
   python -m http.server 8000
   
   # 或使用Node.js
   npx serve -s .
   ```

3. **访问前端**
   打开浏览器访问 `http://localhost:8000`

### 3.2 生产环境部署

1. **构建前端**
   如果使用Vue CLI或Vite构建：
   ```bash
   npm run build
   ```

2. **部署到服务器**
   - 将构建后的文件上传到服务器
   - 配置Nginx或Apache等Web服务器
   - 配置域名和HTTPS

## 4. 数据库配置

### 4.1 MongoDB安装

1. **下载MongoDB**
   从MongoDB官网下载并安装对应版本的MongoDB

2. **启动MongoDB服务**
   ```bash
   # Windows
   net start MongoDB
   
   # Linux
   sudo systemctl start mongodb
   ```

3. **创建数据库**
   ```bash
   mongo
   use wechat-cloud
   ```

### 4.2 数据库索引

为提高查询性能，建议创建以下索引：

- 产品表：`category`、`status`、`name`
- 订单表：`orderId`、`status`、`createdAt`
- 用户表：`username`

## 5. 安全配置

### 5.1 环境变量

- 生产环境中，`JWT_SECRET` 应使用强随机字符串
- 数据库连接字符串应包含密码
- 不要将敏感信息硬编码到代码中

### 5.2 CORS配置

- 生产环境中，应限制允许的域名
- 配置示例：
  ```javascript
  app.use(cors({
    origin: ['https://your-domain.com'],
    credentials: true
  }));
  ```

### 5.3 上传安全

- 限制上传文件类型和大小
- 对上传的图片进行病毒扫描
- 存储路径应使用随机文件名

## 6. 监控与维护

### 6.1 日志管理

- 配置日志轮转
- 定期清理日志文件
- 使用ELK等工具进行日志分析

### 6.2 性能监控

- 使用PM2等进程管理器
- 配置服务器监控
- 定期检查系统负载和响应时间

### 6.3 备份策略

- 定期备份数据库
- 备份上传的媒体文件
- 建立灾难恢复计划

## 7. 常见问题

### 7.1 服务启动失败

- 检查端口是否被占用
- 检查数据库连接是否正常
- 检查环境变量配置是否正确

### 7.2 图片上传失败

- 检查上传目录权限
- 检查文件大小限制
- 检查网络连接

### 7.3 物流查询失败

- 检查物流公司API配置
- 检查网络连接
- 检查物流单号是否正确