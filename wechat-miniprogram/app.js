// app.js
App({
  globalData: {
    userInfo: null,
    baseApiUrl: '' // 后端API基础URL，使用相对路径
  },
  onLaunch() {
    // 初始化
    console.log('小程序启动');
  },
  // 封装网络请求
  request(params) {
    const { url, method = 'GET', data = {}, header = {} } = params;
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.globalData.baseApiUrl + url,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          ...header
        },
        success: (res) => {
          if (res.data.code === 0) {
            resolve(res.data.data);
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            });
            reject(res.data);
          }
        },
        fail: (err) => {
          wx.showToast({
            title: '网络错误',
            icon: 'none'
          });
          reject(err);
        }
      });
    });
  },
  // 商品列表API
  getProductList(params) {
    return this.request({
      url: '/api/products',
      method: 'GET',
      data: params
    });
  },
  // 商品详情API
  getProductDetail(id) {
    return this.request({
      url: `/api/products/${id}`,
      method: 'GET'
    });
  }
});