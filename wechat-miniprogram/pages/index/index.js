// index.js
const app = getApp();

Page({
  data: {
    products: [],
    searchText: '',
    activeCategory: '',
    page: 1,
    limit: 10,
    loading: false,
    hasMore: true
  },
  
  onLoad() {
    // 页面加载时获取商品列表
    this.getProducts();
  },
  
  // 获取商品列表
  getProducts() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    app.getProductList({
      page: this.data.page,
      limit: this.data.limit,
      search: this.data.searchText,
      category: this.data.activeCategory
    }).then(res => {
      const { products, total } = res;
      
      // 合并商品列表
      const newProducts = this.data.page === 1 ? products : [...this.data.products, ...products];
      
      // 检查是否还有更多商品
      const hasMore = newProducts.length < total;
      
      this.setData({
        products: newProducts,
        hasMore,
        loading: false
      });
    }).catch(err => {
      console.error('获取商品列表失败:', err);
      this.setData({ loading: false });
    });
  },
  
  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchText: e.detail.value });
  },
  
  // 搜索
  onSearch() {
    // 重置分页
    this.setData({ page: 1, products: [] });
    // 获取商品列表
    this.getProducts();
  },
  
  // 分类切换
  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category;
    // 重置分页和商品列表
    this.setData({ 
      activeCategory: category,
      page: 1, 
      products: [] 
    });
    // 获取商品列表
    this.getProducts();
  },
  
  // 商品点击
  onProductTap(e) {
    const id = e.currentTarget.dataset.id;
    // 跳转到商品详情页
    wx.navigateTo({
      url: `/pages/product/product?id=${id}`
    });
  },
  
  // 加载更多
  onLoadMore() {
    if (!this.data.loading && this.data.hasMore) {
      this.setData({ page: this.data.page + 1 });
      this.getProducts();
    }
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    // 重置分页和商品列表
    this.setData({ page: 1, products: [] });
    // 获取商品列表
    this.getProducts().finally(() => {
      // 停止下拉刷新
      wx.stopPullDownRefresh();
    });
  },
  
  // 上拉加载更多
  onReachBottom() {
    this.onLoadMore();
  }
});