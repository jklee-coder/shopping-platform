const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

// 数据库连接配置
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "GJQ050726", // 修改为你的MySQL密码
  database: "shopping_platform",
  charset: "utf8mb4",
};

async function createAdminUser() {
  try {
    // 创建数据库连接
    const connection = await mysql.createConnection(dbConfig);

    console.log("连接数据库成功...");

    // 检查是否已存在管理员账户
    const [existingAdmins] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      ["admin@example.com"]
    );

    if (existingAdmins.length > 0) {
      console.log("管理员账户已存在，跳过创建...");
      await connection.end();
      return;
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // 创建管理员账户
    const [result] = await connection.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      ["系统管理员", "admin@example.com", hashedPassword]
    );

    console.log("管理员账户创建成功!");
    console.log("邮箱: admin@example.com");
    console.log("密码: admin123");
    console.log("请使用以上凭据登录管理后台");

    await connection.end();
  } catch (error) {
    console.error("创建管理员账户失败:", error);
  }
}

// 执行创建
createAdminUser();
