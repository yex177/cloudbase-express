const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// 导入控制器
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const mediaController = require('../controllers/mediaController');
const statsController = require('../controllers/statsController');
// ---------------- 临时注释物流控制器 ----------------
// const logisticsController = require('../controllers/logisticsController');
// -----------------------------------------------------

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

// 媒体管理
router.post('/media/upload', auth, mediaController.uploadImage);
router.post('/media/process', auth, mediaController.processImage);
router.post('/media/delete', auth, mediaController.deleteImage);
router.get('/media/images', auth, mediaController.getImages);

// 数据统计
router.get('/stats/sales', auth, statsController.getSalesStats);
router.get('/stats/export', auth, statsController.exportSalesReport);
router.get('/stats/stock', auth, statsController.getStockStats);

<<<<<<< HEAD
// 物流管理
router.get('/logistics/companies', auth, logisticsController.getLogisticsCompanies);
router.post('/logistics/companies', auth, logisticsController.createLogisticsCompany);
router.put('/logistics/companies/:id', auth, logisticsController.updateLogisticsCompany);
router.delete('/logistics/companies/:id', auth, logisticsController.deleteLogisticsCompany);
router.put('/logistics/orders/:orderId', auth, logisticsController.updateOrderLogistics);
router.get('/logistics/orders/:orderId', auth, logisticsController.queryLogisticsStatus);
=======
// ---------------- 临时注释物流路由 ----------------
// // 物流管理
// router.get('/api/logistics/companies', auth, logisticsController.getLogisticsCompanies);
// router.post('/api/logistics/companies', auth, logisticsController.createLogisticsCompany);
// router.put('/api/logistics/companies/:id', auth, logisticsController.updateLogisticsCompany);
// router.delete('/api/logistics/companies/:id', auth, logisticsController.deleteLogisticsCompany);
// router.put('/api/logistics/orders/:orderId', auth, logisticsController.updateOrderLogistics);
// router.get('/api/logistics/orders/:orderId', auth, logisticsController.queryLogisticsStatus);
// -----------------------------------------------------
>>>>>>> 3b1e05840aea018a49250dba83816aecdc37e8fd

module.exports = router;
