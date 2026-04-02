const { createApp, ref, reactive, computed, onMounted } = Vue;
const { ElMessage, ElMessageBox, ElLoading, ElIcon } = ElementPlus;

// API基础URL - 使用相对路径
const API_BASE_URL = '';

// 存储token
const token = localStorage.getItem('token');

// 创建axios实例
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  }
});

// 响应拦截器
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    ElMessage.error(error.response?.data?.message || '网络错误');
    return Promise.reject(error);
  }
);

// 登录组件
const LoginComponent = {
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2 class="login-title">微信小程序后台管理系统</h2>
        <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" class="login-form">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="loginForm.username" placeholder="请输入用户名"><template #prefix><el-icon><i class="el-icon-user"></i></el-icon></template></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" placeholder="请输入密码"><template #prefix><el-icon><i class="el-icon-lock"></i></el-icon></template></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%;">登录</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  `,
  setup() {
    const loginForm = reactive({ username: '', password: '' });
    const loginRules = {
      username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
      password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
    };
    const loginFormRef = ref(null);
    const loading = ref(false);

    const handleLogin = async () => {
      if (!loginFormRef.value) return;
      try {
        await loginFormRef.value.validate();
        loading.value = true;
        const response = await axiosInstance.post('/api/auth/login', loginForm);
        if (response.data.code === 0) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.data.user));
          window.location.reload();
        }
      } catch (error) {
        console.error('登录失败:', error);
      } finally {
        loading.value = false;
      }
    };

    return { loginForm, loginRules, loginFormRef, loading, handleLogin };
  }
};

// 仪表盘组件
const DashboardComponent = {
  template: `
    <div class="dashboard">
      <h2 class="page-title">仪表盘</h2>
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stats-card">
            <div class="stats-icon sales-icon"></div>
            <div class="stats-content">
              <div class="stats-number">¥{{ totalSales.toFixed(2) }}</div>
              <div class="stats-label">总销售额</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stats-card">
            <div class="stats-icon orders-icon"></div>
            <div class="stats-content">
              <div class="stats-number">{{ totalOrders }}</div>
              <div class="stats-label">总订单数</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stats-card">
            <div class="stats-icon products-icon"></div>
            <div class="stats-content">
              <div class="stats-number">{{ totalProducts }}</div>
              <div class="stats-label">产品数量</div>
            </div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="6" :lg="6">
          <div class="stats-card">
            <div class="stats-icon alert-icon"></div>
            <div class="stats-content">
              <div class="stats-number">{{ lowStockProducts }}</div>
              <div class="stats-label">库存预警</div>
            </div>
          </div>
        </el-col>
      </el-row>
      <div class="card">
        <h3 class="card-title">系统状态</h3>
        <el-alert title="系统运行正常" type="success" :closable="false" />
      </div>
    </div>
  `,
  setup() {
    const totalSales = ref(0);
    const totalOrders = ref(0);
    const totalProducts = ref(0);
    const lowStockProducts = ref(0);

    const fetchDashboardData = async () => {
      try {
        const stockResponse = await axiosInstance.get('/api/stats/stock');
        if (stockResponse.data.code === 0) {
          const data = stockResponse.data.data;
          totalProducts.value = data.totalProducts || 0;
          lowStockProducts.value = data.lowStockProducts || 0;
        }

        const salesResponse = await axiosInstance.get('/api/stats/sales');
        if (salesResponse.data.code === 0) {
          const data = salesResponse.data.data;
          totalSales.value = data.totalSales || 0;
          totalOrders.value = data.totalOrders || 0;
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      }
    };

    onMounted(() => {
      fetchDashboardData();
    });

    return { totalSales, totalOrders, totalProducts, lowStockProducts };
  }
};

// 商品管理组件
const ProductComponent = {
  template: `
    <div class="product-management">
      <div class="page-header">
        <h2 class="page-title">商品管理</h2>
        <el-button type="primary" @click="handleAdd">添加商品</el-button>
      </div>
      <div class="card">
        <div class="search-form">
          <el-input v-model="searchForm.search" placeholder="搜索商品名称" style="width: 200px;" clearable></el-input>
          <el-select v-model="searchForm.category" placeholder="选择分类" style="width: 150px;" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="分类1" value="category1"></el-option>
            <el-option label="分类2" value="category2"></el-option>
          </el-select>
          <el-select v-model="searchForm.status" placeholder="选择状态" style="width: 150px;" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="上架" value="active"></el-option>
            <el-option label="下架" value="inactive"></el-option>
          </el-select>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedIds.length === 0">批量删除</el-button>
          <el-button @click="handleBatchStatus" :disabled="selectedIds.length === 0">批量上下架</el-button>
        </div>
        <el-table :data="products" style="width: 100%" v-loading="loading" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="name" label="商品名称"></el-table-column>
          <el-table-column prop="price" label="价格" width="100">
            <template #default="scope">¥{{ scope.row.price }}</template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="80"></el-table-column>
          <el-table-column prop="category" label="分类" width="100"></el-table-column>
          <el-table-column prop="status" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
                {{ scope.row.status === 'active' ? '上架' : '下架' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete(scope.row._id)">删除</el-button>
              <el-button size="small" @click="handleToggleStatus(scope.row)">
                {{ scope.row.status === 'active' ? '下架' : '上架' }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination 
            v-model:current-page="pagination.currentPage" 
            v-model:page-size="pagination.pageSize" 
            :page-sizes="[10, 20, 50]" 
            layout="total, sizes, prev, pager, next" 
            :total="pagination.total" 
            @size-change="handleSizeChange" 
            @current-change="handleCurrentChange" 
          />
        </div>
      </div>

      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
        <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="100px">
          <el-form-item label="商品名称" prop="name">
            <el-input v-model="productForm.name"></el-input>
          </el-form-item>
          <el-form-item label="商品描述" prop="description">
            <el-input type="textarea" v-model="productForm.description" :rows="3"></el-input>
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input-number v-model="productForm.price" :min="0" :precision="2"></el-input-number>
          </el-form-item>
          <el-form-item label="库存" prop="stock">
            <el-input-number v-model="productForm.stock" :min="0"></el-input-number>
          </el-form-item>
          <el-form-item label="库存预警" prop="stockAlert">
            <el-input-number v-model="productForm.stockAlert" :min="0"></el-input-number>
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-select v-model="productForm.category">
              <el-option label="分类1" value="category1"></el-option>
              <el-option label="分类2" value="category2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="标签" prop="tags">
            <el-tag v-for="tag in productForm.tags" :key="tag" closable @close="removeTag(tag)">
              {{ tag }}
            </el-tag>
            <el-input 
              v-model="tagInput" 
              placeholder="输入标签后按回车" 
              @keyup.enter="addTag" 
              style="width: 150px; margin-left: 10px;"
            ></el-input>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="productForm.status">
              <el-radio label="active">上架</el-radio>
              <el-radio label="inactive">下架</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="商品图片">
            <div class="image-uploader">
              <el-upload
                action="/api/media/upload"
                :headers="{ Authorization: 'Bearer ' + localStorage.getItem('token') }"
                :multiple="true"
                :limit="5"
                :on-success="handleImageUploadSuccess"
                :on-error="handleImageUploadError"
                list-type="picture-card"
              >
                <el-icon><i class="el-icon-plus"></i></el-icon>
                <template #default="{ file }">
                  <img :src="file.url" alt="" style="width: 100%; height: 100%;">
                </template>
                <template #file="{ file }">
                  <div class="image-item">
                    <img :src="file.url" alt="" style="width: 100%; height: 100%;">
                    <el-button type="text" size="small" @click.stop="removeImage(file)">
                      <el-icon><i class="el-icon-delete"></i></el-icon>
                    </el-button>
                  </div>
                </template>
              </el-upload>
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="batchStatusDialogVisible" title="批量上下架" width="400px">
        <el-form :model="batchStatusForm" :rules="batchStatusRules" ref="batchStatusFormRef">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="batchStatusForm.status">
              <el-radio label="active">上架</el-radio>
              <el-radio label="inactive">下架</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="batchStatusDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleBatchStatusSubmit">确定</el-button>
        </template>
      </el-dialog>
    </div>
  `,
  setup() {
    const products = ref([]);
    const loading = ref(false);
    const searchForm = reactive({ search: '', category: '', status: '' });
    const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 });
    const dialogVisible = ref(false);
    const batchStatusDialogVisible = ref(false);
    const dialogTitle = ref('添加商品');
    const productForm = reactive({ 
      name: '', 
      description: '', 
      price: 0, 
      stock: 0, 
      stockAlert: 10, 
      category: '', 
      tags: [], 
      status: 'active', 
      images: [] 
    });
    const productRules = {
      name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
      price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
      stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
      category: [{ required: true, message: '请选择分类', trigger: 'blur' }]
    };
    const productFormRef = ref(null);
    const currentProductId = ref('');
    const selectedIds = ref([]);
    const tagInput = ref('');
    const batchStatusForm = reactive({ status: 'active' });
    const batchStatusRules = {
      status: [{ required: true, message: '请选择状态', trigger: 'blur' }]
    };
    const batchStatusFormRef = ref(null);

    const fetchProducts = async () => {
      loading.value = true;
      try {
        const response = await axiosInstance.get('/api/products', {
          params: { page: pagination.currentPage, limit: pagination.pageSize, ...searchForm }
        });
        if (response.data.code === 0) {
          products.value = response.data.data.products;
          pagination.total = response.data.data.total;
        }
      } catch (error) {
        console.error('获取产品列表失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = () => { pagination.currentPage = 1; fetchProducts(); };
    const handleSizeChange = (size) => { pagination.pageSize = size; fetchProducts(); };
    const handleCurrentChange = (current) => { pagination.currentPage = current; fetchProducts(); };
    const handleAdd = () => {
      dialogTitle.value = '添加商品';
      Object.assign(productForm, { 
        name: '', 
        description: '', 
        price: 0, 
        stock: 0, 
        stockAlert: 10, 
        category: '', 
        tags: [], 
        status: 'active', 
        images: [] 
      });
      currentProductId.value = '';
      dialogVisible.value = true;
    };
    const handleEdit = (product) => {
      dialogTitle.value = '编辑商品';
      Object.assign(productForm, product);
      currentProductId.value = product._id;
      dialogVisible.value = true;
    };
    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除该商品吗？', '提示', { type: 'warning' });
        const response = await axiosInstance.delete(`/api/products/${id}`);
        if (response.data.code === 0) {
          ElMessage.success('删除成功');
          fetchProducts();
        }
      } catch (error) { console.error('删除商品失败:', error); }
    };
    const handleBatchDelete = async () => {
      try {
        await ElMessageBox.confirm('确定要删除选中的商品吗？', '提示', { type: 'warning' });
        for (const id of selectedIds.value) {
          await axiosInstance.delete(`/api/products/${id}`);
        }
        ElMessage.success('删除成功');
        selectedIds.value = [];
        fetchProducts();
      } catch (error) { console.error('批量删除商品失败:', error); }
    };
    const handleSubmit = async () => {
      if (!productFormRef.value) return;
      try {
        await productFormRef.value.validate();
        const response = currentProductId.value
          ? await axiosInstance.put(`/api/products/${currentProductId.value}`, productForm)
          : await axiosInstance.post('/api/products', productForm);
        if (response.data.code === 0) {
          ElMessage.success(currentProductId.value ? '更新成功' : '添加成功');
          dialogVisible.value = false;
          fetchProducts();
        }
      } catch (error) { console.error('提交表单失败:', error); }
    };
    const handleSelectionChange = (selection) => {
      selectedIds.value = selection.map(item => item._id);
    };
    const handleToggleStatus = async (product) => {
      try {
        const newStatus = product.status === 'active' ? 'inactive' : 'active';
        const response = await axiosInstance.put(`/api/products/${product._id}`, {
          ...product,
          status: newStatus
        });
        if (response.data.code === 0) {
          ElMessage.success(`商品已${newStatus === 'active' ? '上架' : '下架'}`);
          fetchProducts();
        }
      } catch (error) { console.error('修改商品状态失败:', error); }
    };
    const handleBatchStatus = () => {
      batchStatusDialogVisible.value = true;
    };
    const handleBatchStatusSubmit = async () => {
      if (!batchStatusFormRef.value) return;
      try {
        await batchStatusFormRef.value.validate();
        const response = await axiosInstance.post('/api/products/batch-status', {
          ids: selectedIds.value,
          status: batchStatusForm.status
        });
        if (response.data.code === 0) {
          ElMessage.success('操作成功');
          batchStatusDialogVisible.value = false;
          selectedIds.value = [];
          fetchProducts();
        }
      } catch (error) { console.error('批量操作失败:', error); }
    };
    const addTag = () => {
      if (tagInput.value && !productForm.tags.includes(tagInput.value)) {
        productForm.tags.push(tagInput.value);
        tagInput.value = '';
      }
    };
    const removeTag = (tag) => {
      productForm.tags = productForm.tags.filter(t => t !== tag);
    };
    const handleImageUploadSuccess = (response, file) => {
      if (response.code === 0) {
        productForm.images.push(file.response.data[0].path);
      }
    };
    const handleImageUploadError = (error) => {
      ElMessage.error('图片上传失败');
    };
    const removeImage = (file) => {
      productForm.images = productForm.images.filter(img => img !== file.url);
    };

    onMounted(() => { fetchProducts(); });

    return {
      products, loading, searchForm, pagination, dialogVisible, dialogTitle, productForm, productRules, productFormRef,
      currentProductId, selectedIds, tagInput, batchStatusDialogVisible, batchStatusForm, batchStatusRules, batchStatusFormRef,
      handleSearch, handleSizeChange, handleCurrentChange, handleAdd, handleEdit, handleDelete, handleSubmit,
      handleSelectionChange, handleToggleStatus, handleBatchDelete, handleBatchStatus, handleBatchStatusSubmit,
      addTag, removeTag, handleImageUploadSuccess, handleImageUploadError, removeImage
    };
  }
};

// 订单管理组件
const OrderComponent = {
  template: `
    <div class="order-management">
      <h2 class="page-title">订单管理</h2>
      <div class="card">
        <div class="search-form">
          <el-input v-model="searchForm.orderId" placeholder="搜索订单号" style="width: 200px;" clearable></el-input>
          <el-select v-model="searchForm.status" placeholder="选择状态" style="width: 150px;" clearable>
            <el-option label="全部" value=""></el-option>
            <el-option label="待支付" value="pending"></el-option>
            <el-option label="已支付" value="paid"></el-option>
            <el-option label="已发货" value="shipped"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="已取消" value="cancelled"></el-option>
          </el-select>
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </div>
        <el-table :data="orders" style="width: 100%" v-loading="loading">
          <el-table-column prop="orderId" label="订单号"></el-table-column>
          <el-table-column prop="totalAmount" label="订单金额" width="120">
            <template #default="scope">¥{{ scope.row.totalAmount }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleView(scope.row)">查看</el-button>
              <el-button size="small" @click="handleUpdateLogistics(scope.row)" v-if="scope.row.status === 'paid'">发货</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination 
            v-model:current-page="pagination.currentPage" 
            v-model:page-size="pagination.pageSize" 
            :page-sizes="[10, 20, 50]" 
            layout="total, sizes, prev, pager, next" 
            :total="pagination.total" 
            @size-change="handleSizeChange" 
            @current-change="handleCurrentChange" 
          />
        </div>
      </div>

      <el-dialog v-model="orderDetailVisible" title="订单详情" width="800px">
        <div class="order-detail">
          <div class="order-info">
            <h3>订单信息</h3>
            <el-descriptions :column="2">
              <el-descriptions-item label="订单号">{{ orderDetail.orderId }}</el-descriptions-item>
              <el-descriptions-item label="订单金额">¥{{ orderDetail.totalAmount }}</el-descriptions-item>
              <el-descriptions-item label="订单状态">{{ getStatusText(orderDetail.status) }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ orderDetail.createdAt }}</el-descriptions-item>
              <el-descriptions-item label="支付时间">{{ orderDetail.paidAt || '未支付' }}</el-descriptions-item>
              <el-descriptions-item label="发货时间">{{ orderDetail.shippedAt || '未发货' }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="shipping-info">
            <h3>收货信息</h3>
            <el-descriptions :column="2">
              <el-descriptions-item label="收货人">{{ orderDetail.shippingInfo?.name }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ orderDetail.shippingInfo?.phone }}</el-descriptions-item>
              <el-descriptions-item label="收货地址" :span="2">{{ orderDetail.shippingInfo?.address }}</el-descriptions-item>
            </el-descriptions>
          </div>
          <div class="product-info">
            <h3>商品信息</h3>
            <el-table :data="orderDetail.products" style="width: 100%">
              <el-table-column prop="name" label="商品名称"></el-table-column>
              <el-table-column prop="price" label="单价" width="100">
                <template #default="scope">¥{{ scope.row.price }}</template>
              </el-table-column>
              <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
              <el-table-column prop="subtotal" label="小计" width="100">
                <template #default="scope">¥{{ scope.row.subtotal }}</template>
              </el-table-column>
            </el-table>
          </div>
          <div class="logistics-info" v-if="orderDetail.logisticsInfo">
            <h3>物流信息</h3>
            <el-descriptions :column="2">
              <el-descriptions-item label="物流公司">{{ orderDetail.logisticsInfo.company }}</el-descriptions-item>
              <el-descriptions-item label="物流单号">{{ orderDetail.logisticsInfo.trackingNumber }}</el-descriptions-item>
              <el-descriptions-item label="物流状态" :span="2">{{ orderDetail.logisticsInfo.status }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </div>
        <template #footer>
          <el-button @click="orderDetailVisible = false">关闭</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="logisticsDialogVisible" title="填写物流信息" width="500px">
        <el-form :model="logisticsForm" :rules="logisticsRules" ref="logisticsFormRef" label-width="100px">
          <el-form-item label="物流公司" prop="company">
            <el-select v-model="logisticsForm.company">
              <el-option v-for="company in logisticsCompanies" :key="company.code" :label="company.name" :value="company.code"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="物流单号" prop="trackingNumber">
            <el-input v-model="logisticsForm.trackingNumber"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="logisticsDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitLogistics">确定</el-button>
        </template>
      </el-dialog>
    </div>
  `,
  setup() {
    const orders = ref([]);
    const loading = ref(false);
    const searchForm = reactive({ orderId: '', status: '', dateRange: [] });
    const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 });
    const orderDetailVisible = ref(false);
    const logisticsDialogVisible = ref(false);
    const orderDetail = ref({});
    const logisticsForm = reactive({ company: '', trackingNumber: '' });
    const logisticsRules = {
      company: [{ required: true, message: '请选择物流公司', trigger: 'blur' }],
      trackingNumber: [{ required: true, message: '请输入物流单号', trigger: 'blur' }]
    };
    const logisticsFormRef = ref(null);
    const logisticsCompanies = ref([]);
    const currentOrderId = ref('');

    const fetchOrders = async () => {
      loading.value = true;
      try {
        const response = await axiosInstance.get('/api/orders', {
          params: { page: pagination.currentPage, limit: pagination.pageSize, ...searchForm }
        });
        if (response.data.code === 0) {
          orders.value = response.data.data.orders;
          pagination.total = response.data.data.total;
        }
      } catch (error) {
        console.error('获取订单列表失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const fetchLogisticsCompanies = async () => {
      try {
        const response = await axiosInstance.get('/api/logistics/companies');
        if (response.data.code === 0) {
          logisticsCompanies.value = response.data.data;
        }
      } catch (error) {
        console.error('获取物流公司失败:', error);
      }
    };

    const handleSearch = () => { pagination.currentPage = 1; fetchOrders(); };
    const handleSizeChange = (size) => { pagination.pageSize = size; fetchOrders(); };
    const handleCurrentChange = (current) => { pagination.currentPage = current; fetchOrders(); };
    const handleView = (order) => {
      orderDetail.value = order;
      orderDetailVisible.value = true;
    };
    const handleUpdateLogistics = (order) => {
      currentOrderId.value = order.orderId;
      logisticsForm.company = '';
      logisticsForm.trackingNumber = '';
      logisticsDialogVisible.value = true;
    };
    const handleSubmitLogistics = async () => {
      if (!logisticsFormRef.value) return;
      try {
        await logisticsFormRef.value.validate();
        const response = await axiosInstance.put(`/api/logistics/orders/${currentOrderId.value}`, {
          company: logisticsForm.company,
          trackingNumber: logisticsForm.trackingNumber
        });
        if (response.data.code === 0) {
          ElMessage.success('物流信息更新成功');
          logisticsDialogVisible.value = false;
          fetchOrders();
        }
      } catch (error) {
        console.error('更新物流信息失败:', error);
      }
    };

    const getStatusType = (status) => {
      const statusMap = {
        pending: 'warning',
        paid: 'info',
        shipped: 'primary',
        completed: 'success',
        cancelled: 'danger'
      };
      return statusMap[status] || 'info';
    };

    const getStatusText = (status) => {
      const statusMap = {
        pending: '待支付',
        paid: '已支付',
        shipped: '已发货',
        completed: '已完成',
        cancelled: '已取消'
      };
      return statusMap[status] || status;
    };

    onMounted(() => {
      fetchOrders();
      fetchLogisticsCompanies();
    });

    return {
      orders, loading, searchForm, pagination, orderDetailVisible, orderDetail, logisticsDialogVisible,
      logisticsForm, logisticsRules, logisticsFormRef, logisticsCompanies, currentOrderId,
      handleSearch, handleSizeChange, handleCurrentChange, handleView, handleUpdateLogistics, handleSubmitLogistics,
      getStatusType, getStatusText
    };
  }
};

// 数据统计组件
const StatsComponent = {
  template: `
    <div class="stats-management">
      <h2 class="page-title">数据统计</h2>
      <div class="card">
        <div class="search-form">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          <el-button type="primary" @click="fetchStats">查询</el-button>
          <el-button @click="exportReport">导出报表</el-button>
        </div>
        <div class="chart-container">
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <div class="chart-card">
                <h3>销售额趋势</h3>
                <div ref="salesChartRef" class="chart"></div>
              </div>
            </el-col>
            <el-col :xs="24" :md="12">
              <div class="chart-card">
                <h3>订单数量趋势</h3>
                <div ref="ordersChartRef" class="chart"></div>
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" style="margin-top: 20px;">
            <el-col :xs="24" :md="12">
              <div class="chart-card">
                <h3>商品销量排行</h3>
                <div ref="productsChartRef" class="chart"></div>
              </div>
            </el-col>
            <el-col :xs="24" :md="12">
              <div class="chart-card">
                <h3>客户类型分布</h3>
                <div ref="customersChartRef" class="chart"></div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  `,
  setup() {
    const dateRange = ref([]);
    const salesChartRef = ref(null);
    const ordersChartRef = ref(null);
    const productsChartRef = ref(null);
    const customersChartRef = ref(null);

    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/api/stats/sales', {
          params: { startDate: dateRange.value[0], endDate: dateRange.value[1] }
        });
        if (response.data.code === 0) {
          const data = response.data.data;
          renderSalesChart(data.salesTrend);
          renderOrdersChart(data.ordersTrend);
          renderProductsChart(data.topProducts);
          renderCustomersChart(data.customerDistribution);
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
      }
    };

    const exportReport = async () => {
      try {
        const response = await axiosInstance.get('/api/stats/export', {
          params: { startDate: dateRange.value[0], endDate: dateRange.value[1] },
          responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.xlsx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('导出报表失败:', error);
      }
    };

    const renderSalesChart = (data) => {
      if (!salesChartRef.value) return;
      const chart = echarts.init(salesChartRef.value);
      chart.setOption({
        xAxis: { type: 'category', data: data.labels },
        yAxis: { type: 'value' },
        series: [{ data: data.values, type: 'line' }]
      });
    };

    const renderOrdersChart = (data) => {
      if (!ordersChartRef.value) return;
      const chart = echarts.init(ordersChartRef.value);
      chart.setOption({
        xAxis: { type: 'category', data: data.labels },
        yAxis: { type: 'value' },
        series: [{ data: data.values, type: 'bar' }]
      });
    };

    const renderProductsChart = (data) => {
      if (!productsChartRef.value) return;
      const chart = echarts.init(productsChartRef.value);
      chart.setOption({
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: data.map(item => item.name) },
        series: [{ data: data.map(item => item.sales), type: 'bar' }]
      });
    };

    const renderCustomersChart = (data) => {
      if (!customersChartRef.value) return;
      const chart = echarts.init(customersChartRef.value);
      chart.setOption({
        series: [{
          type: 'pie',
          data: [
            { value: data.new, name: '新客户' },
            { value: data.returning, name: '老客户' }
          ]
        }]
      });
    };

    onMounted(() => {
      fetchStats();
    });

    return { dateRange, salesChartRef, ordersChartRef, productsChartRef, customersChartRef, fetchStats, exportReport };
  }
};

// 物流管理组件
const LogisticsComponent = {
  template: `
    <div class="logistics-management">
      <h2 class="page-title">物流管理</h2>
      <el-tabs v-model="activeTab">
        <el-tab-pane label="物流公司" name="companies">
          <div class="card">
            <el-button type="primary" @click="handleAddCompany" style="margin-bottom: 15px;">添加物流公司</el-button>
            <el-table :data="companies" v-loading="loading">
              <el-table-column prop="name" label="公司名称"></el-table-column>
              <el-table-column prop="code" label="公司代码"></el-table-column>
              <el-table-column prop="isActive" label="状态" width="80">
                <template #default="scope">
                  <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
                    {{ scope.row.isActive ? '启用' : '禁用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleEditCompany(scope.row)">编辑</el-button>
                  <el-button type="danger" size="small" @click="handleDeleteCompany(scope.row._id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="物流查询" name="query">
          <div class="card">
            <el-form :model="queryForm" :rules="queryRules" ref="queryFormRef" label-width="100px">
              <el-form-item label="订单号" prop="orderId">
                <el-input v-model="queryForm.orderId"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleQuery">查询</el-button>
              </el-form-item>
            </el-form>
            <div v-if="logisticsInfo" class="logistics-info">
              <h3>物流信息</h3>
              <el-descriptions :column="2">
                <el-descriptions-item label="物流公司">{{ logisticsInfo.company }}</el-descriptions-item>
                <el-descriptions-item label="物流单号">{{ logisticsInfo.trackingNumber }}</el-descriptions-item>
                <el-descriptions-item label="物流状态" :span="2">{{ logisticsInfo.status }}</el-descriptions-item>
              </el-descriptions>
              <div class="logistics-timeline">
                <h4>物流轨迹</h4>
                <el-timeline>
                  <el-timeline-item v-for="(update, index) in logisticsInfo.updates" :key="index" :timestamp="update.time">
                    {{ update.status }}
                  </el-timeline-item>
                </el-timeline>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-dialog v-model="companyDialogVisible" :title="companyDialogTitle" width="400px">
        <el-form :model="companyForm" :rules="companyRules" ref="companyFormRef" label-width="100px">
          <el-form-item label="公司名称" prop="name">
            <el-input v-model="companyForm.name"></el-input>
          </el-form-item>
          <el-form-item label="公司代码" prop="code">
            <el-input v-model="companyForm.code"></el-input>
          </el-form-item>
          <el-form-item label="API URL" prop="apiUrl">
            <el-input v-model="companyForm.apiUrl"></el-input>
          </el-form-item>
          <el-form-item label="API Key" prop="apiKey">
            <el-input v-model="companyForm.apiKey"></el-input>
          </el-form-item>
          <el-form-item label="状态" prop="isActive">
            <el-switch v-model="companyForm.isActive"></el-switch>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="companyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitCompany">确定</el-button>
        </template>
      </el-dialog>
    </div>
  `,
  setup() {
    const activeTab = ref('companies');
    const companies = ref([]);
    const loading = ref(false);
    const companyDialogVisible = ref(false);
    const companyDialogTitle = ref('添加物流公司');
    const companyForm = reactive({ name: '', code: '', apiUrl: '', apiKey: '', isActive: true });
    const companyRules = {
      name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
      code: [{ required: true, message: '请输入公司代码', trigger: 'blur' }]
    };
    const companyFormRef = ref(null);
    const currentCompanyId = ref('');
    const queryForm = reactive({ orderId: '' });
    const queryRules = {
      orderId: [{ required: true, message: '请输入订单号', trigger: 'blur' }]
    };
    const queryFormRef = ref(null);
    const logisticsInfo = ref(null);

    const fetchCompanies = async () => {
      loading.value = true;
      try {
        const response = await axiosInstance.get('/api/logistics/companies');
        if (response.data.code === 0) {
          companies.value = response.data.data;
        }
      } catch (error) {
        console.error('获取物流公司失败:', error);
      } finally {
        loading.value = false;
      }
    };

    const handleAddCompany = () => {
      companyDialogTitle.value = '添加物流公司';
      Object.assign(companyForm, { name: '', code: '', apiUrl: '', apiKey: '', isActive: true });
      currentCompanyId.value = '';
      companyDialogVisible.value = true;
    };

    const handleEditCompany = (company) => {
      companyDialogTitle.value = '编辑物流公司';
      Object.assign(companyForm, company);
      currentCompanyId.value = company._id;
      companyDialogVisible.value = true;
    };

    const handleDeleteCompany = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除该物流公司吗？', '提示', { type: 'warning' });
        const response = await axiosInstance.delete(`/api/logistics/companies/${id}`);
        if (response.data.code === 0) {
          ElMessage.success('删除成功');
          fetchCompanies();
        }
      } catch (error) {
        console.error('删除物流公司失败:', error);
      }
    };

    const handleSubmitCompany = async () => {
      if (!companyFormRef.value) return;
      try {
        await companyFormRef.value.validate();
        const response = currentCompanyId.value
          ? await axiosInstance.put(`/api/logistics/companies/${currentCompanyId.value}`, companyForm)
          : await axiosInstance.post('/api/logistics/companies', companyForm);
        if (response.data.code === 0) {
          ElMessage.success(currentCompanyId.value ? '更新成功' : '添加成功');
          companyDialogVisible.value = false;
          fetchCompanies();
        }
      } catch (error) {
        console.error('提交表单失败:', error);
      }
    };

    const handleQuery = async () => {
      if (!queryFormRef.value) return;
      try {
        await queryFormRef.value.validate();
        const response = await axiosInstance.get(`/api/logistics/orders/${queryForm.orderId}`);
        if (response.data.code === 0) {
          logisticsInfo.value = response.data.data;
        }
      } catch (error) {
        console.error('查询物流信息失败:', error);
      }
    };

    onMounted(() => {
      fetchCompanies();
    });

    return {
      activeTab, companies, loading, companyDialogVisible, companyDialogTitle, companyForm, companyRules, companyFormRef,
      currentCompanyId, queryForm, queryRules, queryFormRef, logisticsInfo,
      handleAddCompany, handleEditCompany, handleDeleteCompany, handleSubmitCompany, handleQuery
    };
  }
};

// 主应用
const App = {
  template: `
    <div v-if="!isLoggedIn"><LoginComponent /></div>
    <div v-else class="app-container">
      <el-container style="height: 100vh;">
        <el-header class="app-header">
          <div class="header-left">
            <h1 class="app-title">微信小程序后台管理系统</h1>
          </div>
          <div class="header-right">
            <span class="user-info">欢迎，{{ user.username }}</span>
            <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
          </div>
        </el-header>
        <el-container>
          <el-aside class="app-sidebar">
            <el-menu :default-active="activeMenu" @select="handleMenuSelect" class="sidebar-menu">
              <el-menu-item index="dashboard">
                <el-icon><i class="el-icon-house"></i></el-icon>
                <span>仪表盘</span>
              </el-menu-item>
              <el-menu-item index="products">
                <el-icon><i class="el-icon-goods"></i></el-icon>
                <span>商品管理</span>
              </el-menu-item>
              <el-menu-item index="orders">
                <el-icon><i class="el-icon-tickets"></i></el-icon>
                <span>订单管理</span>
              </el-menu-item>
              <el-menu-item index="stats">
                <el-icon><i class="el-icon-data-analysis"></i></el-icon>
                <span>数据统计</span>
              </el-menu-item>
              <el-menu-item index="logistics">
                <el-icon><i class="el-icon-van"></i></el-icon>
                <span>物流管理</span>
              </el-menu-item>
            </el-menu>
          </el-aside>
          <el-main class="app-main">
            <component :is="currentComponent" />
          </el-main>
        </el-container>
      </el-container>
    </div>
  `,
  components: { LoginComponent, DashboardComponent, ProductComponent, OrderComponent, StatsComponent, LogisticsComponent },
  setup() {
    const isLoggedIn = ref(!!localStorage.getItem('token'));
    const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));
    const activeMenu = ref('dashboard');
    const currentComponent = ref('DashboardComponent');

    const menuMap = {
      dashboard: 'DashboardComponent',
      products: 'ProductComponent',
      orders: 'OrderComponent',
      stats: 'StatsComponent',
      logistics: 'LogisticsComponent'
    };

    const handleMenuSelect = (key) => {
      activeMenu.value = key;
      currentComponent.value = menuMap[key] || 'DashboardComponent';
    };

    const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      isLoggedIn.value = false;
    };

    return { isLoggedIn, user, activeMenu, currentComponent, handleMenuSelect, handleLogout };
  }
};

const app = createApp(App);
app.use(ElementPlus);
app.mount('#app');

console.log('Vue 应用初始化成功');
