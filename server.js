const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 8080;
const JWT_SECRET = "your-secret-key";

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接配置
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "GJQ050726", // 修改为你的MySQL密码
  database: "shopping_platform",
  charset: "utf8mb4",
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// JWT验证中间件
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "访问令牌缺失" });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "令牌无效" });
  }
};

// 管理员验证中间件
const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "访问令牌缺失" });
  }
  try {
    const user = jwt.verify(token, JWT_SECRET);

    // 检查是否为管理员（这里假设邮箱为admin@example.com的用户是管理员）
    if (user.email !== "admin@example.com") {
      return res.status(403).json({ error: "权限不足，需要管理员权限" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "令牌无效" });
  }
};

// API路由
// 用户注册
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "请填写所有字段" });
    }

    // 检查邮箱是否已存在
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: "邮箱已被注册" });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: result.insertId, email: email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "注册成功",
      token: token,
      user: { id: result.insertId, name, email },
    });
  } catch (error) {
    console.error("注册错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 用户登录
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "请填写邮箱和密码" });
    }

    // 查找用户
    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ error: "用户不存在" });
    }

    const user = users[0];

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "密码错误" });
    }

    // 生成JWT令牌
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      message: "登录成功",
      token: token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("登录错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 管理员登录
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "请填写邮箱和密码" });
    }

    // 查找用户
    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(400).json({ error: "管理员账号不存在" });
    }

    const user = users[0];

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "密码错误" });
    }

    // 检查是否为管理员（这里假设邮箱为admin@example.com的用户是管理员）
    if (user.email !== "admin@example.com") {
      return res.status(403).json({ error: "权限不足，需要管理员权限" });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: true },
      JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    res.json({
      message: "管理员登录成功",
      token: token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("管理员登录错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 管理员权限验证
app.get("/api/admin/verify", authenticateAdmin, async (req, res) => {
  try {
    res.json({
      message: "管理员权限验证成功",
      user: {
        id: req.user.userId,
        name: req.user.name,
        email: req.user.email,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error("管理员权限验证错误:", error);
    res.status(500).json({ error: "权限验证失败" });
  }
});
// 获取商品列表
app.get("/api/products", async (req, res) => {
  try {
    const [products] = await pool.execute(`
            SELECT id, name, description, price, category, image_url, stock, status
            FROM products 
            WHERE stock > 0 AND status = 'active'
            ORDER BY created_at DESC
        `);

    console.log("返回的商品数据:", JSON.stringify(products, null, 2));
    res.json(products);
  } catch (error) {
    console.error("获取商品错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取购物车
app.get("/api/cart", authenticateToken, async (req, res) => {
  try {
    const [cartItems] = await pool.execute(
      `
            SELECT ci.*, p.name, p.price, p.image_url, p.stock 
            FROM cart_items ci 
            JOIN products p ON ci.product_id = p.id 
            WHERE ci.user_id = ?
        `,
      [req.user.userId]
    );

    res.json(cartItems);
  } catch (error) {
    console.error("获取购物车错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});
// 添加到购物车
app.post("/api/cart", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // 检查商品是否存在且有库存
    const [products] = await pool.execute(
      "SELECT stock FROM products WHERE id = ?",
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: "商品不存在" });
    }

    const product = products[0];
    if (product.stock < quantity) {
      return res.status(400).json({ error: "库存不足" });
    }

    // 检查是否已在购物车中
    const [existingItems] = await pool.execute(
      "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
      [req.user.userId, productId]
    );

    if (existingItems.length > 0) {
      // 更新数量
      await pool.execute(
        "UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
        [quantity, req.user.userId, productId]
      );
    } else {
      // 新增到购物车
      await pool.execute(
        "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
        [req.user.userId, productId, quantity]
      );
    }

    res.json({ message: "已添加到购物车" });
  } catch (error) {
    console.error("添加到购物车错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 更新购物车商品数量
app.put("/api/cart/:productId", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity <= 0) {
      // 删除商品
      await pool.execute(
        "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?",
        [req.user.userId, productId]
      );
    } else {
      // 更新数量
      await pool.execute(
        "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?",
        [quantity, req.user.userId, productId]
      );
    }

    res.json({ message: "购物车已更新" });
  } catch (error) {
    console.error("更新购物车错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 创建订单
app.post("/api/orders", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 获取购物车商品
    const [cartItems] = await connection.execute(
      `
            SELECT ci.*, p.price, p.stock 
            FROM cart_items ci 
            JOIN products p ON ci.product_id = p.id 
WHERE ci.user_id = ?
        `,
      [req.user.userId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: "购物车为空" });
    }

    // 计算总金额并检查库存
    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        await connection.rollback();
        return res.status(400).json({ error: `商品 ${item.name} 库存不足` });
      }
      totalAmount += item.price * item.quantity;
    }

    // 创建订单
    const [orderResult] = await connection.execute(
      "INSERT INTO orders (user_id, total_amount) VALUES (?, ?)",
      [req.user.userId, totalAmount]
    );

    const orderId = orderResult.insertId;

    // 创建订单项并更新库存
    for (const item of cartItems) {
      await connection.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );

      await connection.execute(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }

    // 清空购物车
    await connection.execute("DELETE FROM cart_items WHERE user_id = ?", [
      req.user.userId,
    ]);

    await connection.commit();

    res.json({
      message: "订单创建成功",
      orderId: orderId,
      totalAmount: totalAmount,
    });
  } catch (error) {
    await connection.rollback();
    console.error("创建订单错误:", error);
    res.status(500).json({ error: "服务器错误" });
  } finally {
    connection.release();
  }
});

// 获取用户订单
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `
            SELECT o.*, 
                   GROUP_CONCAT(CONCAT(p.id, ':', p.name, ':', oi.quantity, ':', oi.price, ':', p.image_url)) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `,
      [req.user.userId]
    );

    // 格式化订单数据
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      userId: order.user_id,
      totalAmount: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
      items: order.items
        ? order.items.split(",").map((item) => {
            const [id, name, quantity, price, image_url] = item.split(":");
            return {
              id: parseInt(id),
              name: name,
              quantity: parseInt(quantity),
              price: parseFloat(price),
              image_url: image_url || null,
            };
          })
        : [],
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("获取订单错误:", error);
    res.status(500).json({ error: "服务器错误", details: error.message });
  }
});

// 用户注销账号（删除用户所有数据）
app.delete("/api/user/account", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const userId = req.user.userId;

    // 1. 删除用户的购物车数据
    await connection.execute("DELETE FROM cart_items WHERE user_id = ?", [
      userId,
    ]);

    // 2. 将用户标记为已注销（不删除用户记录，只更新状态）
    const [result] = await connection.execute(
      "UPDATE users SET name = CONCAT(name, ' (已注销)'), email = CONCAT('deleted_', UNIX_TIMESTAMP(), '_', email) WHERE id = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "用户不存在" });
    }

    await connection.commit();
    res.json({ message: "账号注销成功，购物车数据已删除，订单信息已保留" });
  } catch (error) {
    await connection.rollback();
    console.error("注销账号错误:", error);
    res.status(500).json({ error: "服务器错误" });
  } finally {
    connection.release();
  }
});

// ==================== 管理员API ====================

// 获取所有商品（管理员用，包括库存为0的商品）
app.get("/api/admin/products", authenticateAdmin, async (req, res) => {
  try {
    const [products] = await pool.execute(`
            SELECT id, name, description, price, category, image_url, stock, status, created_at
            FROM products 
            ORDER BY created_at DESC
        `);
    res.json(products);
  } catch (error) {
    console.error("获取商品错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});
// 添加商品
app.post("/api/admin/products", authenticateAdmin, async (req, res) => {
  try {
    const { name, description, price, category, image_url, stock } = req.body;

    if (!name || !price || !stock) {
      return res.status(400).json({ error: "请填写必填字段" });
    }

    const [result] = await pool.execute(
      "INSERT INTO products (name, description, price, category, image_url, stock, status) VALUES (?, ?, ?, ?, ?, ?, 'active')",
      [name, description, price, category, image_url, stock]
    );

    res.json({
      message: "商品添加成功",
      productId: result.insertId,
    });
  } catch (error) {
    console.error("添加商品错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 更新商品
app.put("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, image_url, stock, status } =
      req.body;

    // 先获取当前商品信息
    const [currentProduct] = await pool.execute(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (currentProduct.length === 0) {
      return res.status(404).json({ error: "商品不存在" });
    }

    const current = currentProduct[0];

    // 只更新传入的字段，保持其他字段不变
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }

    if (description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(description);
    }

    if (price !== undefined) {
      updateFields.push("price = ?");
      updateValues.push(price);
    }

    if (category !== undefined) {
      updateFields.push("category = ?");
      updateValues.push(category);
    }

    if (image_url !== undefined) {
      updateFields.push("image_url = ?");
      updateValues.push(image_url);
    }

    if (stock !== undefined) {
      updateFields.push("stock = ?");
      updateValues.push(stock);
    }

    if (status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(status);
    }

    // 如果没有要更新的字段，直接返回成功
    if (updateFields.length === 0) {
      return res.json({ message: "商品更新成功" });
    }

    updateValues.push(id);

    const sql = `UPDATE products SET ${updateFields.join(", ")} WHERE id = ?`;

    const [result] = await pool.execute(sql, updateValues);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "商品不存在" });
    }

    res.json({ message: "商品更新成功" });
  } catch (error) {
    console.error("更新商品错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取所有商品（管理员用）
app.get("/api/admin/products", authenticateAdmin, async (req, res) => {
  try {
    const [products] = await pool.execute(`
      SELECT * FROM products ORDER BY created_at DESC
    `);

    res.json(products);
  } catch (error) {
    console.error("获取商品错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});
// 删除商品
app.delete("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 检查商品是否在订单中
    const [orderItems] = await pool.execute(
      "SELECT id FROM order_items WHERE product_id = ? LIMIT 1",
      [id]
    );

    if (orderItems.length > 0) {
      return res.status(400).json({ error: "该商品已有订单记录，无法删除" });
    }

    const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "商品不存在" });
    }

    res.json({ message: "商品删除成功" });
  } catch (error) {
    console.error("删除商品错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取所有订单（管理员用，包括已注销用户的订单）
app.get("/api/admin/orders", authenticateAdmin, async (req, res) => {
  try {
    const [orders] = await pool.execute(`
            SELECT o.*, 
                   COALESCE(u.name, '已注销用户') as user_name,
                   COALESCE(u.email, '已注销用户') as user_email,
                   GROUP_CONCAT(CONCAT(p.name, ':', oi.quantity, ':', oi.price)) as items
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `);

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      userId: order.user_id,
      userName: order.user_name,
      userEmail: order.user_email,
      totalAmount: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
      items: order.items
        ? order.items.split(",").map((item) => {
            const [name, quantity, price] = item.split(":");
            return {
              name: name,
              quantity: parseInt(quantity),
              price: parseFloat(price),
            };
          })
        : [],
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("获取订单错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 更新订单状态
app.put("/api/admin/orders/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "无效的订单状态" });
    }

    const [result] = await pool.execute(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "订单不存在" });
    }

    res.json({ message: "订单状态更新成功" });
  } catch (error) {
    console.error("更新订单状态错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取销售统计
app.get("/api/admin/statistics", authenticateAdmin, async (req, res) => {
  try {
    // 获取总销售额
    const [totalSales] = await pool.execute(`
            SELECT SUM(total_amount) as total_sales 
            FROM orders 
            WHERE status != 'cancelled'
        `);

    // 获取订单数量统计
    const [orderStats] = await pool.execute(`
            SELECT status, COUNT(*) as count 
            FROM orders 
            GROUP BY status
        `);

    // 获取热门商品
    const [topProducts] = await pool.execute(`
            SELECT p.name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.price) as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'cancelled'
            GROUP BY p.id, p.name
            ORDER BY total_sold DESC
            LIMIT 10
        `);

    // 获取最近30天销售趋势
    const [salesTrend] = await pool.execute(`
            SELECT DATE(created_at) as date, SUM(total_amount) as daily_sales, COUNT(*) as order_count
            FROM orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND status != 'cancelled'
            GROUP BY DATE(created_at)
            ORDER BY date
        `);

    res.json({
      totalSales: totalSales[0].total_sales || 0,
      orderStats: orderStats,
      topProducts: topProducts,
      salesTrend: salesTrend,
    });
  } catch (error) {
    console.error("获取统计错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

// 健康检查端点
app.get("/api/health", async (req, res) => {
  try {
    await pool.execute("SELECT 1");
    res.json({ status: "OK", database: "连接正常" });
  } catch (error) {
    res.status(500).json({ status: "ERROR", database: "连接失败" });
  }
});

// 获取单个商品详情
app.get("/api/admin/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.execute(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: "商品不存在" });
    }

    res.json(products[0]);
  } catch (error) {
    console.error("获取商品详情错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});

// 获取单个订单详情（管理员用）
app.get("/api/admin/orders/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 获取订单基本信息
    const [orders] = await pool.execute(
      `
            SELECT o.*, 
                   COALESCE(u.name, '已注销用户') as user_name,
                   COALESCE(u.email, '已注销用户') as user_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: "订单不存在" });
    }

    // 获取订单项详情
    const [orderItems] = await pool.execute(
      `
            SELECT oi.*, p.name, p.image_url, p.category
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `,
      [id]
    );

    const order = orders[0];
    const formattedOrder = {
      id: order.id,
      userId: order.user_id,
      userName: order.user_name,
      userEmail: order.user_email,
      totalAmount: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: orderItems.map((item) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.name,
        productImage: item.image_url,
        productCategory: item.category,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      })),
    };

    res.json(formattedOrder);
  } catch (error) {
    console.error("获取订单详情错误:", error);
    res.status(500).json({ error: "服务器错误" });
  }
});
