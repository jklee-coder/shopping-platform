-- 清空商品表并插入模拟数据
USE shopping_platform;

-- 删除所有商品数据
DELETE FROM products;

-- 重置自增ID
ALTER TABLE products AUTO_INCREMENT = 1;

-- 插入模拟商品数据
INSERT INTO products (name, description, price, category, image_url, stock, status) 
VALUES 
('iPhone 15 Pro', '最新款iPhone，性能强劲，搭载A17 Pro芯片', 8999.00, '电子产品', './images/products/product_1_300x200.jpg', 50, 'active'),
('Nike Air Max', '经典运动鞋，舒适透气', 899.00, '服装', './images/products/product_2_300x200.jpg', 100, 'active'),
('沙发组合', '现代简约风格，舒适耐用', 2999.00, '家居', './images/products/product_3_300x200.jpg', 15, 'active'),
('有机食品礼盒', '精选有机食材，健康美味', 299.00, '食品', './images/products/product_4_300x200.jpg', 200, 'active'),
('JavaScript高级程序设计', '前端开发经典教材，深入浅出', 89.00, '图书', './images/products/product_5_300x200.jpg', 50, 'active');

-- 验证插入结果
SELECT * FROM products;