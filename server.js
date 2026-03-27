const express = require('express');
const app = express();
const port = 3000; // 必须和微信云托管部署页面的端口一致

// 测试接口：访问根路径返回欢迎信息
app.get('/', (req, res) => {
  res.send('✅ 微信云托管 Express 服务运行成功！');
});

// 示例接口：给前端用的 API
app.get('/api/hello', (req, res) => {
  res.json({
    code: 0,
    message: 'Hello from Node.js backend!',
    data: {
      user: 'test',
      time: new Date().toLocaleString()
    }
  });
});

// 启动服务
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`);
});
