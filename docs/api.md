# API文档

## 1. 认证接口

### 1.1 登录
- **URL**: `/api/auth/login`
- **方法**: `POST`
- **参数**:
  - `username`: 用户名
  - `password`: 密码
- **响应**:
  ```json
  {
    "code": 0,
    "message": "登录成功",
    "data": {
      "token": "JWT令牌",
      "user": {
        "id": "用户ID",
        "username": "用户名",
        "role": "角色"
      }
    }
  }
  ```

### 1.2 注册
- **URL**: `/api/auth/register`
- **方法**: `POST`
- **参数**:
  - `username`: 用户名
  - `password`: 密码
  - `role`: 角色 (可选，默认editor)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "注册成功"
  }
  ```

### 1.3 获取用户信息
- **URL**: `/api/auth/profile`
- **方法**: `GET`
- **请求头**:
  - `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "获取成功",
    "data": {
      "id": "用户ID",
      "username": "用户名",
      "role": "角色"
    }
  }
  ```

## 2. 产品管理接口

### 2.1 获取产品列表
- **URL**: `/api/products`
- **方法**: `GET`
- **请求头**:
  - `Authorization: Bearer {token}`
- **查询参数**:
  - `page`: 页码 (默认1)
  - `limit`: 每页数量 (默认10)
  - `category`: 分类
  - `status`: 状态
  - `search`: 搜索关键词
- **响应**:
  ```json
  {
    "code": 0,
    "message": "获取成功",
    "data": {
      "products": [产品列表],
      "total": 总数量,
      "page": 当前页码,
      "limit": 每页数量
    }
  }
  ```

### 2.2 获取单个产品
- **URL**: `/api/products/{id}`
- **方法**: `GET`
- **请求头**:
  - `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "获取成功",
    "data": 产品信息
  }
  ```

### 2.3 创建产品
- **URL**: `/api/products`
- **方法**: `POST`
- **请求头**:
  - `Authorization: Bearer {token}`
- **参数**:
  - `name`: 产品名称
  - `description`: 产品描述
  - `price`: 价格
  - `stock`: 库存
  - `stockAlert`: 库存预警
  - `category`: 分类
  - `tags`: 标签
  - `status`: 状态
  - `images`: 图片路径
- **响应**:
  ```json
  {
    "code": 0,
    "message": "创建成功",
    "data": 产品信息
  }
  ```

### 2.4 更新产品
- **URL**: `/api/products/{id}`
- **方法**: `PUT`
- **请求头**:
  - `Authorization: Bearer {token}`
- **参数**:
  - 同创建产品
- **响应**:
  ```json
  {
    "code": 0,
    "message": "更新成功",
    "data": 产品信息
  }
  ```

### 2.5 删除产品
- **URL**: `/api/products/{id}`
- **方法**: `DELETE`
- **请求头**:
  - `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "删除成功"
  }
  ```

### 2.6 批量更新状态
- **URL**: `/api/products/batch-status`
- **方法**: `POST`
- **请求头**:
  - `Authorization: Bearer {token}`
- **参数**:
  - `ids`: 产品ID数组
  - `status`: 新状态
- **响应**:
  ```json
  {
    "code": 0,
    "message": "操作成功"
  }
  ```

### 2.7 获取库存预警
- **URL**: `/api/products/stock/alerts`
- **方法**: `GET`
- **请求头**:
  - `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "获取成功",
    "data": 库存预警产品列表
  }
  ```

## 3. 媒体管理接口

### 3.1 上传图片
- **URL**: `/api/media/upload`
- **方法**: `POST`
- **请求头**:
  - `Authorization: Bearer {token}`
  - `Content-Type: multipart/form-data`
- **参数**:
  - `images`: 图片文件 (最多5张)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "上传成功",
    "data": [
      {
        "filename": "文件名",
        "path": "文件路径",
        "size": 文件大小,
        "mimetype": "文件类型"
      }
    ]
  }
  ```

### 3.2 处理图片
- **URL**: `/api/media/process`
- **方法**: `POST`
- **请求头**:
  - `Authorization: Bearer {token}`
- **参数**:
  - `imagePath`: 图片路径
  - `width`: 宽度
  - `height`: 高度
  - `rotate`: 旋转角度
  - `quality`: 质量
  - `format`: 格式
- **响应**:
  ```json
  {
    "code": 0,
    "message": "处理成功",
    "data": {
      "path": "处理后图片路径"
    }
  }
  ```

### 3.3 删除图片
- **URL**: `/api/media/delete`
- **方法**: `POST`
- **请求头**:
  - `Authorization: Bearer {token}`
- **参数**:
  - `imagePath`: 图片路径
- **响应**:
  ```json
  {
    "code": 0,
    "message": "删除成功"
  }
  ```

### 3.4 获取图片列表
- **URL**: `/api/media/images`
- **方法**: `GET`
- **请求头**:
  - `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "获取成功",
    "data": [
      {
        "filename": "文件名",
        "path": "文件路径",
        "size": 文件大小
      }
    ]
  }
  ```

## 4. 数据统计接口

### 4.1 获取销售统计
- **URL**: `/api/stats/sales`
- **方法**: `GET`
- **请求头**:
  - `Authorization: Bearer {token}`
- **查询参数**:
  - `startDate`: 开始日期
  - `endDate`: 结束日期
  - `interval`: 时间间隔 (day/week/month)
- **响应**:
  ```json
  {
    "code": 0,
    "message": "获取成功",
    "data": {
      "salesData": 销售数据,
      "avgOrderValue": 客单价,
      "hotProducts": 热销产品
    }
  }
  ```

### 4.2 导出销售报表
- **URL**: `/api/stats/export`
- **方法**: `GET`
- **请求头**:
  - `Authorization: Bearer {token}`
- **查询参数**:
  - `startDate`: 开始日期
  - `endDate`: 结束日期
  - `format`: 导出格式 (excel/pdf)
- **响应**: 文件下载

### 4.3 获取库存统计
- **URL**: `/api/stats/stock`
- **方法**: `GET`
- **请求头**:
  - `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "获取成功",
    "data": {
      "totalProducts": 总产品数,
      "lowStockProducts": 低库存产品数,
      "outOfStockProducts": 缺货产品数
    }
  }
  ```

## 5. 物流管理接口

### 5.1 获取物流公司列表
- **URL**: `/api/logistics/companies`
- **方法**: `GET`
- **请求头**:
  - `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "获取成功",
    "data": 物流公司列表
  }
  ```

### 5.2 创建物流公司
- **URL**: `/api/logistics/companies`
- **方法**: `POST`
- **请求头**:
  - `Authorization: Bearer {token}`
- **参数**:
  - `name`: 公司名称
  - `code`: 公司代码
  - `apiUrl`: API地址
  - `apiKey`: API密钥
- **响应**:
  ```json
  {
    "code": 0,
    "message": "创建成功",
    "data": 物流公司信息
  }
  ```

### 5.3 更新物流公司
- **URL**: `/api/logistics/companies/{id}`
- **方法**: `PUT`
- **请求头**:
  - `Authorization: Bearer {token}`
- **参数**:
  - `name`: 公司名称
  - `code`: 公司代码
  - `apiUrl`: API地址
  - `apiKey`: API密钥
  - `isActive`: 是否启用
- **响应**:
  ```json
  {
    "code": 0,
    "message": "更新成功",
    "data": 物流公司信息
  }
  ```

### 5.4 删除物流公司
- **URL**: `/api/logistics/companies/{id}`
- **方法**: `DELETE`
- **请求头**:
  - `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "删除成功"
  }
  ```

### 5.5 更新订单物流信息
- **URL**: `/api/logistics/orders/{orderId}`
- **方法**: `PUT`
- **请求头**:
  - `Authorization: Bearer {token}`
- **参数**:
  - `company`: 物流公司代码
  - `trackingNumber`: 物流单号
- **响应**:
  ```json
  {
    "code": 0,
    "message": "更新成功",
    "data": 订单信息
  }
  ```

### 5.6 查询物流状态
- **URL**: `/api/logistics/orders/{orderId}`
- **方法**: `GET`
- **请求头**:
  - `Authorization: Bearer {token}`
- **响应**:
  ```json
  {
    "code": 0,
    "message": "查询成功",
    "data": {
      "status": "物流状态",
      "trackingNumber": "物流单号",
      "company": "物流公司",
      "updates": 物流轨迹
    }
  }
  ```