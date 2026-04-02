const Order = require('../models/Order');

const orderController = {
  // 获取订单列表
  async getOrders(req, res) {
    try {
      const { page = 1, limit = 10, orderId, status, startDate, endDate } = req.query;
      
      const query = {};
      if (orderId) query.orderId = orderId;
      if (status) query.status = status;
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const total = await Order.countDocuments(query);
      const orders = await Order.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
      
      res.json({ code: 0, message: '获取成功', data: { orders, total, page: Number(page), limit: Number(limit) } });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 获取单个订单
  async getOrder(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ code: 404, message: '订单不存在' });
      }
      res.json({ code: 0, message: '获取成功', data: order });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 创建订单
  async createOrder(req, res) {
    try {
      const { orderId, products, totalAmount, shippingInfo, status } = req.body;
      
      const order = new Order({ orderId, products, totalAmount, shippingInfo, status });
      await order.save();
      
      res.json({ code: 0, message: '创建成功', data: order });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 更新订单
  async updateOrder(req, res) {
    try {
      const { id } = req.params;
      const { products, totalAmount, shippingInfo, status, logisticsInfo } = req.body;
      
      const order = await Order.findByIdAndUpdate(id, { products, totalAmount, shippingInfo, status, logisticsInfo, updatedAt: Date.now() }, { new: true });
      if (!order) {
        return res.status(404).json({ code: 404, message: '订单不存在' });
      }
      
      res.json({ code: 0, message: '更新成功', data: order });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 删除订单
  async deleteOrder(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findByIdAndDelete(id);
      if (!order) {
        return res.status(404).json({ code: 404, message: '订单不存在' });
      }
      
      res.json({ code: 0, message: '删除成功' });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 批量更新订单状态
  async batchUpdateStatus(req, res) {
    try {
      const { ids, status } = req.body;
      await Order.updateMany({ _id: { $in: ids } }, { status, updatedAt: Date.now() });
      res.json({ code: 0, message: '操作成功' });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  }
};

module.exports = orderController;