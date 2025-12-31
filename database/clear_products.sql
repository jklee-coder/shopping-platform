-- 清空商品表数据
USE shopping_platform;

-- 删除所有商品数据
DELETE FROM products;

-- 重置自增ID（可选，如果需要重新从1开始计数）
ALTER TABLE products AUTO_INCREMENT = 1;

-- 验证清空结果
SELECT COUNT(*) as remaining_products FROM products;

-- 显示表结构（确认表仍然存在）
DESCRIBE products;