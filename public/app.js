const { createApp } = Vue;

const App = {
  template: `
    <div>
      <h1>微信小程序后台管理系统</h1>
      <p>页面加载成功！</p>
      <button @click="testApi">测试 API</button>
      <div v-if="apiResponse">
        <h2>API 响应：</h2>
        <pre>{{ apiResponse }}</pre>
      </div>
    </div>
  `,
  data() {
    return {
      apiResponse: null
    };
  },
  methods: {
    async testApi() {
      try {
        const response = await axios.get('/api/test');
        this.apiResponse = JSON.stringify(response.data, null, 2);
      } catch (error) {
        this.apiResponse = 'API 调用失败：' + error.message;
      }
    }
  }
};

const app = createApp(App);
app.use(ElementPlus);
app.mount('#app');

console.log('Vue 应用初始化成功');
