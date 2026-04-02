const express = require('express');
const app = express();

// 静态文件服务
app.use(express.static('public'));

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'Hello World!' });
});

// 所有其他路由返回前端页面
app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 启动服务
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port', PORT);
});