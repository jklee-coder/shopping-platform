-- 商品添加模板
-- 使用以下格式逐条添加商品：

INSERT INTO products (name, description, price, category, image_url, stock) 
VALUES ('商品名称', '商品描述', 价格, '商品类别', '图片URL', 库存数量);

-- 示例：
-- INSERT INTO products (name, description, price, category, image_url, stock) 
-- VALUES ('iPhone 15 Pro', '最新款iPhone，性能强劲', 8999.00, '电子产品', 'https://picsum.photos/300/200', 50);

-- 验证添加结果：
-- SELECT * FROM products;