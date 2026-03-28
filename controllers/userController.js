const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config');

const userController = {
  // 登录
  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      // 查找用户
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(401).json({ code: 401, message: '用户名或密码错误' });
      }
      
      // 验证密码
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ code: 401, message: '用户名或密码错误' });
      }
      
      // 生成token
      const token = jwt.sign(
        { userId: user._id, username: user.username, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      res.json({ code: 0, message: '登录成功', data: { token, user: { id: user._id, username: user.username, role: user.role } } });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 注册
  async register(req, res) {
    try {
      const { username, password, role } = req.body;
      
      // 检查用户名是否已存在
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ code: 400, message: '用户名已存在' });
      }
      
      // 创建新用户
      const user = new User({ username, password, role });
      await user.save();
      
      res.json({ code: 0, message: '注册成功' });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 获取用户信息
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ code: 404, message: '用户不存在' });
      }
      
      res.json({ code: 0, message: '获取成功', data: { id: user._id, username: user.username, role: user.role } });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  }
};

module.exports = userController;