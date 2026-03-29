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

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use(routes);

// 测试接口
app.get('/', (req, res) => {
  res.send('✅ 微信云托管 Express 服务运行成功！');
});

// 错误处理中间件
app.use(errorHandler);

// 启动服务（保持你原来的 0.0.0.0:3000 监听）
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
