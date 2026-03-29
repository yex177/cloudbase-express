const { createApp, ref, reactive, computed, onMounted } = Vue;
const { ElMessage, ElMessageBox } = ElementPlus;

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
      <h2>微信小程序后台管理系统</h2>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" prefix-icon="Lock"></el-input>
        </el-form-item>
        <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%; margin-top: 20px;">登录</el-button>
      </el-form>
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
    <div>
      <h2 style="margin-bottom: 20px;">仪表盘</h2>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stats-card">
            <div class="number">¥{{ totalSales.toFixed(2) }}</div>
            <div class="label">总销售额</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stats-card">
            <div class="number">{{ totalOrders }}</div>
            <div class="label">总订单数</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stats-card">
            <div class="number">{{ totalProducts }}</div>
            <div class="label">产品数量</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stats-card">
            <div class="number" style="color: #f56c6c;">{{ lowStockProducts }}</div>
            <div class="label">库存预警</div>
          </div>
        </el-col>
      </el-row>
      <div class="card">
        <h3 style="margin-bottom: 15px;">系统状态</h3>
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
          totalProducts.value = data.totalProducts;
          lowStockProducts.value = data.lowStockProducts;
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

// 产品管理组件
const ProductComponent = {
  template: `
    <div>
      <h2 style="margin-bottom: 20px;">产品管理</h2>
      <div class="card">
        <div class="search-form">
          <el-input v-model="searchForm.search" placeholder="搜索产品名称" style="width: 200px;" clearable></el-input>
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
          <el-button type="success" @click="handleAdd">添加产品</el-button>
        </div>
        <el-table :data="products" style="width: 100%" v-loading="loading">
          <el-table-column prop="name" label="产品名称"></el-table-column>
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
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination v-model:current-page="pagination.currentPage" v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" :total="pagination.total" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
        </div>
      </div>

      <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
        <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="80px">
          <el-form-item label="产品名称" prop="name">
            <el-input v-model="productForm.name"></el-input>
          </el-form-item>
          <el-form-item label="价格" prop="price">
            <el-input-number v-model="productForm.price" :min="0" :precision="2"></el-input-number>
          </el-form-item>
          <el-form-item label="库存" prop="stock">
            <el-input-number v-model="productForm.stock" :min="0"></el-input-number>
          </el-form-item>
          <el-form-item label="分类" prop="category">
            <el-select v-model="productForm.category">
              <el-option label="分类1" value="category1"></el-option>
              <el-option label="分类2" value="category2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="productForm.status">
              <el-radio label="active">上架</el-radio>
              <el-radio label="inactive">下架</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
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
    const dialogTitle = ref('添加产品');
    const productForm = reactive({ name: '', price: 0, stock: 0, category: '', status: 'active' });
    const productRules = {
      name: [{ required: true, message: '请输入产品名称', trigger: 'blur' }],
      price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
      stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
      category: [{ required: true, message: '请选择分类', trigger: 'blur' }]
    };
    const productFormRef = ref(null);
    const currentProductId = ref('');

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
      dialogTitle.value = '添加产品';
      Object.assign(productForm, { name: '', price: 0, stock: 0, category: '', status: 'active' });
      currentProductId.value = '';
      dialogVisible.value = true;
    };
    const handleEdit = (product) => {
      dialogTitle.value = '编辑产品';
      Object.assign(productForm, product);
      currentProductId.value = product._id;
      dialogVisible.value = true;
    };
    const handleDelete = async (id) => {
      try {
        await ElMessageBox.confirm('确定要删除该产品吗？', '提示', { type: 'warning' });
        const response = await axiosInstance.delete(`/api/products/${id}`);
        if (response.data.code === 0) {
          ElMessage.success('删除成功');
          fetchProducts();
        }
      } catch (error) { console.error('删除产品失败:', error); }
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

    onMounted(() => { fetchProducts(); });

    return {
      products, loading, searchForm, pagination, dialogVisible, dialogTitle, productForm, productRules, productFormRef,
      handleSearch, handleSizeChange, handleCurrentChange, handleAdd, handleEdit, handleDelete, handleSubmit
    };
  }
};

// 媒体管理组件
const MediaComponent = {
  template: `
    <div>
      <h2 style="margin-bottom: 20px;">媒体管理</h2>
      <div class="card">
        <div class="image-uploader" @click="triggerUpload">
          <el-icon :size="40" color="#909399"><Plus /></el-icon>
          <div style="color: #909399; margin-top: 10px;">点击上传图片</div>
        </div>
        <input type="file" ref="fileInput" multiple accept="image/*" @change="handleFileChange" style="display: none;">
      </div>
    </div>
  `,
  setup() {
    const fileInput = ref(null);
    const triggerUpload = () => { fileInput.value?.click(); };
    const handleFileChange = (e) => {
      const files = e.target.files;
      if (files.length === 0) return;
      ElMessage.success(`选择了 ${files.length} 个文件`);
    };
    return { fileInput, triggerUpload, handleFileChange };
  }
};

// 数据统计组件
const StatsComponent = {
  template: `
    <div>
      <h2 style="margin-bottom: 20px;">数据统计</h2>
      <div class="card">
        <div class="search-form">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          <el-button type="primary" @click="fetchStats">查询</el-button>
        </div>
        <div ref="chartRef" class="chart-container"></div>
      </div>
    </div>
  `,
  setup() {
    const dateRange = ref([]);
    const chartRef = ref(null);
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/api/stats/sales');
        if (response.data.code === 0 && chartRef.value) {
          const chart = echarts.init(chartRef.value);
          chart.setOption({
            xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
            yAxis: { type: 'value' },
            series: [{ data: [120, 200, 150, 80, 70, 110, 130], type: 'bar' }]
          });
        }
      } catch (error) { console.error('获取统计数据失败:', error); }
    };
    onMounted(() => { fetchStats(); });
    return { dateRange, chartRef, fetchStats };
  }
};

// 物流管理组件
const LogisticsComponent = {
  template: `
    <div>
      <h2 style="margin-bottom: 20px;">物流管理</h2>
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
            </el-table>
          </div>
        </el-tab-pane>
        <el-tab-pane label="订单物流" name="orders">
          <div class="card">
            <el-empty description="暂无订单数据"></el-empty>
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-dialog v-model="companyDialogVisible" title="添加物流公司" width="400px">
        <el-form :model="companyForm" label-width="80px">
          <el-form-item label="公司名称">
            <el-input v-model="companyForm.name"></el-input>
          </el-form-item>
          <el-form-item label="公司代码">
            <el-input v-model="companyForm.code"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="companyDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCompany">确定</el-button>
        </template>
      </el-dialog>
    </div>
  `,
  setup() {
    const activeTab = ref('companies');
    const companies = ref([]);
    const loading = ref(false);
    const companyDialogVisible = ref(false);
    const companyForm = reactive({ name: '', code: '' });

    const fetchCompanies = async () => {
      loading.value = true;
      try {
        const response = await axiosInstance.get('/api/logistics/companies');
        if (response.data.code === 0) {
          companies.value = response.data.data;
        }
      } catch (error) { console.error('获取物流公司失败:', error); }
      finally { loading.value = false; }
    };

    const handleAddCompany = () => {
      companyForm.name = '';
      companyForm.code = '';
      companyDialogVisible.value = true;
    };

    const submitCompany = async () => {
      try {
        const response = await axiosInstance.post('/api/logistics/companies', companyForm);
        if (response.data.code === 0) {
          ElMessage.success('添加成功');
          companyDialogVisible.value = false;
          fetchCompanies();
        }
      } catch (error) { console.error('添加物流公司失败:', error); }
    };

    onMounted(() => { fetchCompanies(); });

    return { activeTab, companies, loading, companyDialogVisible, companyForm, handleAddCompany, submitCompany };
  }
};

// 主应用
const App = {
  template: `
    <div v-if="!isLoggedIn"><LoginComponent /></div>
    <div v-else>
      <el-container style="height: 100vh;">
        <el-header>
          <div style="font-size: 18px; font-weight: bold;">微信小程序后台管理系统</div>
          <div style="display: flex; align-items: center; gap: 15px;">
            <span>{{ user.username }}</span>
            <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
          </div>
        </el-header>
        <el-container>
          <el-aside>
            <el-menu :default-active="activeMenu" @select="handleMenuSelect" style="height: 100%;">
              <el-menu-item index="dashboard"><el-icon><HomeFilled /></el-icon><span>仪表盘</span></el-menu-item>
              <el-menu-item index="products"><el-icon><GoodsFilled /></el-icon><span>产品管理</span></el-menu-item>
              <el-menu-item index="media"><el-icon><PictureFilled /></el-icon><span>媒体管理</span></el-menu-item>
              <el-menu-item index="stats"><el-icon><DataAnalysis /></el-icon><span>数据统计</span></el-menu-item>
              <el-menu-item index="logistics"><el-icon><Van /></el-icon><span>物流管理</span></el-menu-item>
            </el-menu>
          </el-aside>
          <el-main><component :is="currentComponent" /></el-main>
        </el-container>
      </el-container>
    </div>
  `,
  components: { LoginComponent, DashboardComponent, ProductComponent, MediaComponent, StatsComponent, LogisticsComponent },
  setup() {
    const isLoggedIn = ref(!!localStorage.getItem('token'));
    const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));
    const activeMenu = ref('dashboard');
    const currentComponent = ref('DashboardComponent');

    const menuMap = {
      dashboard: 'DashboardComponent',
      products: 'ProductComponent',
      media: 'MediaComponent',
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