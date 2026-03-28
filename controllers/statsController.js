const Order = require('../models/Order');
const Product = require('../models/Product');
const path = require('path');
const { exportToExcel, exportToPDF } = require('../utils/exporter');

const statsController = {
  // 获取销售统计
  async getSalesStats(req, res) {
    try {
      const { startDate, endDate, interval } = req.query;
      
      const query = {};
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      // 销售额统计
      const salesData = await Order.aggregate([
        { $match: query },
        { $group: {
          _id: interval === 'day' ? { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } :
               interval === 'week' ? { $dateToString: { format: '%Y-%U', date: '$createdAt' } } :
               { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]);
      
      // 客单价计算
      const avgOrderValue = await Order.aggregate([
        { $match: query },
        { $group: {
          _id: null,
          avgValue: { $avg: '$totalAmount' }
        }}
      ]);
      
      // 热销产品
      const hotProducts = await Order.aggregate([
        { $match: query },
        { $unwind: '$products' },
        { $group: {
          _id: '$products.productId',
          totalQuantity: { $sum: '$products.quantity' },
          totalSales: { $sum: { $multiply: ['$products.quantity', '$products.price'] } }
        }},
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }},
        { $unwind: '$productInfo' },
        { $project: {
          _id: 0,
          productId: '$_id',
          productName: '$productInfo.name',
          totalQuantity: 1,
          totalSales: 1
        }}
      ]);
      
      res.json({ 
        code: 0, 
        message: '获取成功', 
        data: {
          salesData,
          avgOrderValue: avgOrderValue[0]?.avgValue || 0,
          hotProducts
        }
      });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 导出销售报表
  async exportSalesReport(req, res) {
    try {
      const { startDate, endDate, format } = req.query;
      
      const query = {};
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const orders = await Order.find(query).populate('products.productId');
      
      const data = orders.map(order => ({
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt.toLocaleString(),
        shippingInfo: `${order.shippingInfo.name} ${order.shippingInfo.address} ${order.shippingInfo.phone}`,
        logisticsInfo: order.logisticsInfo.company ? `${order.logisticsInfo.company} ${order.logisticsInfo.trackingNumber}` : '未发货'
      }));
      
      const columns = [
        { header: '订单号', key: 'orderId' },
        { header: '总金额', key: 'totalAmount' },
        { header: '状态', key: 'status' },
        { header: '创建时间', key: 'createdAt' },
        { header: '收货信息', key: 'shippingInfo' },
        { header: '物流信息', key: 'logisticsInfo' }
      ];
      
      let filePath;
      if (format === 'excel') {
        filePath = await exportToExcel(data, `销售报表_${Date.now()}`, columns);
      } else {
        filePath = await exportToPDF(data, `销售报表_${Date.now()}`, columns);
      }
      
      res.download(filePath, path.basename(filePath), (err) => {
        if (err) {
          res.status(500).json({ code: 500, message: '下载失败' });
        }
      });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 获取库存统计
  async getStockStats(req, res) {
    try {
      const totalProducts = await Product.countDocuments();
      const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10 } });
      const outOfStockProducts = await Product.countDocuments({ stock: 0 });
      
      res.json({ 
        code: 0, 
        message: '获取成功', 
        data: {
          totalProducts,
          lowStockProducts,
          outOfStockProducts
        }
      });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  }
};

module.exports = statsController;