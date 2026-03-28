const LogisticsCompany = require('../models/LogisticsCompany');
const Order = require('../models/Order');
const axios = require('axios');

const logisticsController = {
  // 获取物流公司列表
  async getLogisticsCompanies(req, res) {
    try {
      const companies = await LogisticsCompany.find();
      res.json({ code: 0, message: '获取成功', data: companies });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 创建物流公司
  async createLogisticsCompany(req, res) {
    try {
      const { name, code, apiUrl, apiKey } = req.body;
      const company = new LogisticsCompany({ name, code, apiUrl, apiKey });
      await company.save();
      res.json({ code: 0, message: '创建成功', data: company });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 更新物流公司
  async updateLogisticsCompany(req, res) {
    try {
      const { id } = req.params;
      const { name, code, apiUrl, apiKey, isActive } = req.body;
      const company = await LogisticsCompany.findByIdAndUpdate(id, { name, code, apiUrl, apiKey, isActive, updatedAt: Date.now() }, { new: true });
      if (!company) {
        return res.status(404).json({ code: 404, message: '物流公司不存在' });
      }
      res.json({ code: 0, message: '更新成功', data: company });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 删除物流公司
  async deleteLogisticsCompany(req, res) {
    try {
      const { id } = req.params;
      const company = await LogisticsCompany.findByIdAndDelete(id);
      if (!company) {
        return res.status(404).json({ code: 404, message: '物流公司不存在' });
      }
      res.json({ code: 0, message: '删除成功' });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 更新订单物流信息
  async updateOrderLogistics(req, res) {
    try {
      const { orderId } = req.params;
      const { company, trackingNumber } = req.body;
      
      const order = await Order.findOne({ orderId });
      if (!order) {
        return res.status(404).json({ code: 404, message: '订单不存在' });
      }
      
      order.logisticsInfo = { company, trackingNumber, status: 'shipped' };
      order.status = 'shipped';
      await order.save();
      
      res.json({ code: 0, message: '更新成功', data: order });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 查询物流状态
  async queryLogisticsStatus(req, res) {
    try {
      const { orderId } = req.params;
      
      const order = await Order.findOne({ orderId });
      if (!order) {
        return res.status(404).json({ code: 404, message: '订单不存在' });
      }
      
      const { company, trackingNumber } = order.logisticsInfo;
      if (!company || !trackingNumber) {
        return res.status(400).json({ code: 400, message: '物流信息未填写' });
      }
      
      // 模拟物流查询API调用
      // 实际项目中应根据不同物流公司调用相应的API
      const logisticsCompany = await LogisticsCompany.findOne({ code: company });
      if (!logisticsCompany) {
        return res.status(404).json({ code: 404, message: '物流公司不存在' });
      }
      
      // 这里应该调用真实的物流API
      // const response = await axios.get(logisticsCompany.apiUrl, {
      //   params: {
      //     trackingNumber,
      //     apiKey: logisticsCompany.apiKey
      //   }
      // });
      
      // 模拟响应
      const mockResponse = {
        status: 'delivered',
        trackingNumber,
        company: logisticsCompany.name,
        updates: [
          { time: '2024-01-01 10:00:00', status: '已下单' },
          { time: '2024-01-02 09:00:00', status: '已揽收' },
          { time: '2024-01-03 14:00:00', status: '运输中' },
          { time: '2024-01-04 16:00:00', status: '已送达' }
        ]
      };
      
      res.json({ code: 0, message: '查询成功', data: mockResponse });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  }
};

module.exports = logisticsController;