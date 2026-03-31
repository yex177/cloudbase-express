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

// -------------------------- 临时注释数据库连接 --------------------------
// mongoose.connect(config.database.uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// }).then(() => {
//   console.log('数据库连接成功');
// }).catch(err => {
//   console.error('数据库连接失败:', err);
// });
// ---------------------------------------------------------------------

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
// 测试接口：访问根路径返回一个美观的 HTML 页面
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>服务运行正常</title>
      <style>
        /* 简单的居中样式 */
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background-color: #e9ecef;
        }
        .success-box {
          background: white;
          padding: 30px 50px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          text-align: center;
        }
        .success-icon {
          font-size: 50px;
          color: #52c41a;
          margin-bottom: 20px;
        }
        h1 {
          color: #2f5496;
          margin-bottom: 10px;
        }
        p {
          color: #666;
          font-size: 16px;
        }
        .url {
          background: #f8f9fa;
          padding: 8px 15px;
          border-radius: 5px;
          margin-top: 15px;
          display: inline-block;
          color: #2f5496;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="success-box">
        <div class="success-icon">✅</div>
        <h1>微信云托管 Express 服务已启动！</h1>
        <p>你的后端服务正在运行，状态：正常</p>
        <div class="url">当前地址：${req.protocol}://${req.get('host')}</div>
      </div>
    </body>
    </html>
  `);
});
// 错误处理中间件
app.use(errorHandler);

// 启动服务（保持你原来的 0.0.0.0:3000 监听）
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
