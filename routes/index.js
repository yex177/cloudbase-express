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
router.post('/auth/login', userController.login);
router.post('/auth/register', userController.register);

// 需要认证的路由
router.get('/auth/profile', auth, userController.getProfile);

// 产品管理
router.get('/products', auth, productController.getProducts);
router.get('/products/:id', auth, productController.getProduct);
router.post('/products', auth, productController.createProduct);
router.put('/products/:id', auth, productController.updateProduct);
router.delete('/products/:id', auth, productController.deleteProduct);
router.post('/products/batch-status', auth, productController.batchUpdateStatus);
router.get('/products/stock/alerts', auth, productController.getStockAlerts);
router.post('/products/sync', auth, productController.syncProducts);

// 媒体管理
router.post('/media/upload', auth, mediaController.uploadImage);
router.post('/media/process', auth, mediaController.processImage);
router.post('/media/delete', auth, mediaController.deleteImage);
router.get('/media/images', auth, mediaController.getImages);

// 订单管理
const orderController = require('../controllers/orderController');
router.get('/orders', auth, orderController.getOrders);
router.get('/orders/:id', auth, orderController.getOrder);
router.post('/orders', auth, orderController.createOrder);
router.put('/orders/:id', auth, orderController.updateOrder);
router.delete('/orders/:id', auth, orderController.deleteOrder);
router.post('/orders/batch-status', auth, orderController.batchUpdateStatus);

// 数据统计
router.get('/stats/sales', auth, statsController.getSalesStats);
router.get('/stats/export', auth, statsController.exportSalesReport);
router.get('/stats/stock', auth, statsController.getStockStats);

// 物流管理
router.get('/logistics/companies', auth, logisticsController.getLogisticsCompanies);
router.post('/logistics/companies', auth, logisticsController.createLogisticsCompany);
router.put('/logistics/companies/:id', auth, logisticsController.updateLogisticsCompany);
router.delete('/logistics/companies/:id', auth, logisticsController.deleteLogisticsCompany);
router.put('/logistics/orders/:orderId', auth, logisticsController.updateOrderLogistics);
router.get('/logistics/orders/:orderId', auth, logisticsController.queryLogisticsStatus);

module.exports = router;