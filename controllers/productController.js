const Product = require('../models/Product');

const productController = {
  // 获取产品列表
  async getProducts(req, res) {
    try {
      const { page = 1, limit = 10, category, status, search } = req.query;
      
      const query = {};
      if (category) query.category = category;
      if (status) query.status = status;
      if (search) query.name = { $regex: search, $options: 'i' };
      
      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
      
      res.json({ code: 0, message: '获取成功', data: { products, total, page: Number(page), limit: Number(limit) } });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 获取单个产品
  async getProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ code: 404, message: '产品不存在' });
      }
      res.json({ code: 0, message: '获取成功', data: product });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 创建产品
  async createProduct(req, res) {
    try {
      const { name, description, price, stock, stockAlert, category, tags, status, images } = req.body;
      
      const product = new Product({ name, description, price, stock, stockAlert, category, tags, status, images });
      await product.save();
      
      res.json({ code: 0, message: '创建成功', data: product });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 更新产品
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, stock, stockAlert, category, tags, status, images } = req.body;
      
      const product = await Product.findByIdAndUpdate(id, { name, description, price, stock, stockAlert, category, tags, status, images, updatedAt: Date.now() }, { new: true });
      if (!product) {
        return res.status(404).json({ code: 404, message: '产品不存在' });
      }
      
      res.json({ code: 0, message: '更新成功', data: product });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 删除产品
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ code: 404, message: '产品不存在' });
      }
      
      res.json({ code: 0, message: '删除成功' });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 批量上下架
  async batchUpdateStatus(req, res) {
    try {
      const { ids, status } = req.body;
      await Product.updateMany({ _id: { $in: ids } }, { status, updatedAt: Date.now() });
      res.json({ code: 0, message: '操作成功' });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 获取库存预警
  async getStockAlerts(req, res) {
    try {
      const products = await Product.find({ stock: { $lte: '$stockAlert' } });
      res.json({ code: 0, message: '获取成功', data: products });
    } catch (error) {
      res.status(500).json({ code: 500, message: '服务器内部错误' });
    }
  },
  
  // 同步商品到小程序前端
  async syncProducts(req, res) {
    try {
      const productsData = req.body;
      
      // 这里可以添加同步逻辑，例如：
      // 1. 验证数据格式
      // 2. 更新数据库中的商品数据
      // 3. 触发小程序端的更新
      
      console.log('接收到同步请求，商品数量:', productsData.length);
      
      // 模拟同步成功
      res.json({ code: 0, message: '同步成功', data: { synced: productsData.length } });
    } catch (error) {
      console.error('同步错误:', error);
      res.status(500).json({ code: 500, message: '同步失败' });
    }
  }
};

module.exports = productController;