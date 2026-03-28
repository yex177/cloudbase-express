const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// 导入控制器
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const mediaController = require('../controllers/mediaController');
const statsController = require('../controllers/statsController');
const logisticsController = require('../controllers/logisticsController');

// 公共路由
router.post('/api/auth/login', userController.login);
router.post('/api/auth/register', userController.register);

// 需要认证的路由
router.get('/api/auth/profile', auth, userController.getProfile);

// 产品管理
router.get('/api/products', auth, productController.getProducts);
router.get('/api/products/:id', auth, productController.getProduct);
router.post('/api/products', auth, productController.createProduct);
router.put('/api/products/:id', auth, productController.updateProduct);
router.delete('/api/products/:id', auth, productController.deleteProduct);
router.post('/api/products/batch-status', auth, productController.batchUpdateStatus);
router.get('/api/products/stock/alerts', auth, productController.getStockAlerts);

// 媒体管理
router.post('/api/media/upload', auth, mediaController.uploadImage);
router.post('/api/media/process', auth, mediaController.processImage);
router.post('/api/media/delete', auth, mediaController.deleteImage);
router.get('/api/media/images', auth, mediaController.getImages);

// 数据统计
router.get('/api/stats/sales', auth, statsController.getSalesStats);
router.get('/api/stats/export', auth, statsController.exportSalesReport);
router.get('/api/stats/stock', auth, statsController.getStockStats);

// 物流管理
router.get('/api/logistics/companies', auth, logisticsController.getLogisticsCompanies);
router.post('/api/logistics/companies', auth, logisticsController.createLogisticsCompany);
router.put('/api/logistics/companies/:id', auth, logisticsController.updateLogisticsCompany);
router.delete('/api/logistics/companies/:id', auth, logisticsController.deleteLogisticsCompany);
router.put('/api/logistics/orders/:orderId', auth, logisticsController.updateOrderLogistics);
router.get('/api/logistics/orders/:orderId', auth, logisticsController.queryLogisticsStatus);

module.exports = router;