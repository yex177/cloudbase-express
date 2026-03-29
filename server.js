const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const config = require('./config');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();
const port = config.server.port; // 必须和微信云托管部署页面的端口一致

// 连接数据库
mongoose.connect(config.database.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('数据库连接成功');
}).catch(err => {
  console.error('数据库连接失败:', err);
});

// 中间件
app.use(helmet());
app.use(cors());
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 前端页面
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API路由
app.use('/api', routes);

// 所有其他路由返回前端页面（支持前端路由）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
