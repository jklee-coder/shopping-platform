# 网上购物平台 - 电子商务网站

**学号：** 202330450461  
**姓名：** 郭家奇  
**课程：** 网络应用开发  
**提交日期：** 2025-12-31

---

## 📋 项目简介

这是一个基于 Node.js 和 MySQL 的完整电子商务网站，实现了用户注册登录、商品浏览、购物车管理、订单处理等核心功能。项目采用前后端分离架构，前端使用原生 HTML/CSS/JavaScript，后端使用 Express 框架。

## 🏗️ 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端页面层     │    │   后端API层      │    │   数据存储层     │
│                 │    │                 │    │                 │
│ • index.html    │◄──►│ • Express服务器  │◄──►│ • MySQL数据库   │
│ • login.html    │    │ • RESTful API   │    │ • 用户表        │
│ • products.html │    │ • JWT认证       │    │ • 商品表        │
│ • cart.html     │    │ • 业务逻辑处理   │    │ • 购物车表      │
│ • orders.html   │    │ • 数据库操作     │    │ • 订单表        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 项目结构

```
网上购物平台/
├── README.md                    # 项目说明文档
├── index.html                   # 主页面
├── login.html                   # 用户登录页面
├── products.html                # 商品浏览页面
├── cart.html                    # 购物车页面
├── orders.html                  # 订单页面
├── admin-login.html             # 管理员登录
├── admin.html                   # 管理后台
├── backend/                     # 后端服务
│   ├── server.js                # 服务器主文件
│   ├── package.json             # 依赖配置
│   ├── create_admin.js          # 管理员创建脚本
│   └── node_modules/            # 依赖包（可重新安装）
├── images/                      # 静态资源
│   └── products/                # 商品图片
│       ├── product_1_300x200.jpg
│       ├── product_2_300x200.jpg
│       ├── product_3_300x200.jpg
│       ├── product_4_300x200.jpg
│       ├── product_5_300x200.jpg
│       └── product_6_300x200.jpg
└── database/                    # 数据库脚本
    ├── shopping_platform.sql    # 数据库创建脚本
    ├── insert_mock_products.sql # 测试数据
    ├── clear_products.sql       # 数据清理脚本
    └── add_product_template.sql # 商品添加模板
```

## 🚀 快速开始

### 环境要求

- Node.js 16.0+
- MySQL 8.0+
- 现代浏览器（Chrome/Firefox/Safari）

### 1. 数据库设置

```sql
-- 创建数据库
CREATE DATABASE shopping_platform;

-- 导入表结构
mysql -u root -p shopping_platform < database/shopping_platform.sql

-- 导入测试数据（可选）
mysql -u root -p shopping_platform < database/insert_mock_products.sql
```

### 2. 后端服务启动

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动服务器
npm start
# 服务器运行在 http://localhost:8080
```

### 3. 访问前端页面

直接在浏览器中打开以下文件：

- `index.html` - 主页面
- `login.html` - 用户登录
- `products.html` - 商品浏览
- `cart.html` - 购物车
- `orders.html` - 订单管理
- `admin-login.html` - 管理员登录

## 🔑 测试账号

### 普通用户

- **邮箱：** 123@qq.com
- **密码：** 123456

### 管理员

- **邮箱：** admin@example.com
- **密码：** admin123

> 首次使用请先运行 `backend/create_admin.js` 创建管理员账号

## ⚙️ 核心功能

### 用户功能

- ✅ 用户注册与登录（JWT 认证）
- ✅ 商品浏览与搜索
- ✅ 购物车管理（添加/删除/修改数量）
- ✅ 订单创建与查看
- ✅ 用户个人信息管理

### 管理员功能

- ✅ 商品管理（增删改查）
- ✅ 库存管理
- ✅ 订单状态管理
- ✅ 用户数据查看

### 技术特性

- 🔒 **安全认证：** JWT 令牌认证，密码 bcrypt 加密
- 📱 **响应式设计：** 适配不同屏幕尺寸
- 🔄 **实时交互：** AJAX 异步数据加载
- 💾 **数据持久化：** MySQL 关系型数据库
- 🛡️ **错误处理：** 完善的异常处理机制

## 🔧 API 接口文档

### 用户认证

- `POST /api/register` - 用户注册
- `POST /api/login` - 用户登录

### 商品管理

- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情

### 购物车

- `GET /api/cart` - 获取购物车
- `POST /api/cart` - 添加商品到购物车
- `PUT /api/cart/:id` - 更新购物车商品数量
- `DELETE /api/cart/:id` - 删除购物车商品

### 订单管理

- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取用户订单
- `PUT /api/orders/:id` - 更新订单状态（管理员）

## 📊 数据库设计

### 用户表 (users)

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 商品表 (products)

```sql
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(50),
  image_url VARCHAR(255),
  stock INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 购物车表 (cart_items)

```sql
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 订单表 (orders)

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**

   - 检查 MySQL 服务是否启动
   - 确认数据库配置信息正确
   - 检查数据库用户权限

2. **端口占用**

   - 默认端口 8080 被占用时，修改 server.js 中的端口号
   - 同时修改前端页面中的 API 地址

3. **图片加载失败**

   - 检查 images/products 目录是否存在
   - 确认图片文件名与数据库中的 image_url 匹配

4. **JWT 认证失败**
   - 检查 localStorage 中的 token 是否有效
   - 确认服务器密钥配置正确

### 日志查看

后端服务启动后，可以在控制台查看实时日志：

```
服务器启动成功，端口：8080
数据库连接成功
用户注册：123@qq.com
订单创建：订单号 #123
```

## 📈 性能优化

### 已完成优化

- ✅ 数据库连接池配置
- ✅ 静态资源缓存
- ✅ 图片压缩优化
- ✅ API 响应压缩
- ✅ 前端代码压缩

### 待优化项

- 🔄 数据库索引优化
- 🔄 CDN 静态资源分发
- 🔄 前端代码分包加载
- 🔄 服务端渲染(SSR)

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进项目！

### 开发规范

- 使用 ES6+语法
- 遵循 RESTful API 设计原则
- 代码注释清晰
- 提交信息规范

### 分支管理

- `main` - 主分支，稳定版本
- `develop` - 开发分支
- `feature/*` - 功能分支
- `hotfix/*` - 紧急修复分支

## 📄 许可证

本项目仅用于教学目的，遵循 MIT 许可证。

## 🙏 致谢

感谢以下开源项目和技术文档：

- Express.js - 轻量级 Web 框架
- MySQL - 关系型数据库
- JWT - 身份认证标准
- bcryptjs - 密码加密库

---

**开发者：** 郭家奇  
**联系方式：** 1753039920@qq.com  
**最后更新：** 2025-12-31

