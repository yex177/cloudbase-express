# 基础 Node.js 环境
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果有）
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制项目代码
COPY . .

# 暴露端口（和你部署页面的端口一致，这里是 3000）
EXPOSE 3000

# 启动命令
CMD ["npm", "start"]
