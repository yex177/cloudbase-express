// 简化版Vue应用
const { createApp, ref } = Vue;

// 登录组件
const LoginComponent = {
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2 class="login-title">微信小程序后台管理系统</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">用户名</label>
            <input type="text" id="username" v-model="loginForm.username" placeholder="请输入用户名">
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" v-model="loginForm.password" placeholder="请输入密码">
          </div>
          <button type="submit" :disabled="loading">登录</button>
        </form>
      </div>
    </div>
  `,
  setup() {
    const loginForm = {
      username: '',
      password: ''
    };
    const loading = ref(false);

    const handleLogin = async () => {
      loading.value = true;
      try {
        // 模拟登录请求
        console.log('登录请求:', loginForm);
        // 模拟登录成功
        setTimeout(() => {
          alert('登录成功');
          loading.value = false;
        }, 1000);
      } catch (error) {
        console.error('登录失败:', error);
        loading.value = false;
      }
    };

    return { loginForm, loading, handleLogin };
  }
};

// 主应用
const App = {
  template: `
    <div>
      <LoginComponent />
    </div>
  `,
  components: { LoginComponent }
};

const app = createApp(App);
app.mount('#app');

console.log('Vue 应用初始化成功');
