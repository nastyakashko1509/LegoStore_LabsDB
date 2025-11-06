-- Выбор всех пользователей, у которых в корзине 2 и более элементов
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    COUNT(ci.id) AS cart_items_count
FROM "user" u
JOIN client c ON c.id = u.id
JOIN cart ca ON ca.client_id = c.id
JOIN cart_item ci ON ci.cart_id = ca.id
GROUP BY u.id, u.name
HAVING COUNT(ci.id) > 2;

-- Запросы с несколькими условиями и вложенными конструкциями
SELECT 
    id,
    name,
    email,
    phone
FROM "user"
WHERE LOWER(name) LIKE '%o%'
  AND email LIKE '%@mail.ru';

SELECT
u.id AS user_id,
u.name AS user_name
FROM "user" u
JOIN client c ON c.id = u.id
WHERE u.name LIKE 'A%'

SELECT
p.id AS product_id,
p.name AS product_name,
p.price
FROM product p
WHERE p.price > (SELECT AVG(price) FROM product)

SELECT 
    u.id AS user_id,
    u.name AS user_name,
    COUNT(ci.id) AS items_count,
    AVG(p.price) AS avg_price
FROM "user" u
JOIN client c ON c.id = u.id
JOIN cart ca ON ca.client_id = c.id
JOIN cart_item ci ON ci.cart_id = ca.id
JOIN product p ON p.id = ci.product_id
GROUP BY u.id, u.name
HAVING COUNT(ci.id) > 3 AND AVG(p.price) > 50;

SELECT u.name
FROM "user" u
JOIN client c ON c.id = u.id
JOIN cart ca ON ca.client_id = c.id
JOIN cart_item ci ON ci.cart_id = ca.id
WHERE ci.product_id IN (
    SELECT p.id
    FROM product p
    JOIN brand b ON b.id = p.brand_id
    WHERE b.name LIKE 'Lego%'
);

-- Запрос аналогичен предыдущему, только через JOIN
SELECT DISTINCT u.name
FROM "user" u
JOIN client c ON c.id = u.id
JOIN cart ca ON ca.client_id = c.id
JOIN cart_item ci ON ci.cart_id = ca.id
JOIN product p ON p.id = ci.product_id
JOIN brand b ON b.id = p.brand_id
WHERE b.name LIKE 'Lego%';

SELECT 
    u.id,
    u.name,
    (SELECT COUNT(*) 
     FROM cart_item ci
     JOIN cart ca ON ci.cart_id = ca.id
     WHERE ca.client_id = u.id) AS items_count,
    (SELECT MIN(p.price)
        FROM product p
        JOIN cart_item ci2 ON p.id = ci2.product_id
        JOIN cart ca2 ON ci2.cart_id = ca2.id
         WHERE ca2.client_id = u.id) AS min_price
FROM "user" u;

-- Запросы с различными видами JOIN
SELECT u.name AS user_name, o.id AS order_id
FROM "user" u
JOIN client c ON u.id = c.id
left outer JOIN "order" o ON c.id = o.client_id;

SELECT
p.name AS product_name,
c.name AS category
FROM product p
INNER JOIN category c ON c.id = p.category_id

SELECT 
    o.id AS order_id,
    u.name AS client_name,
    os.name AS order_status,
    o.order_date,
    o.delivery_date,
    o.total_amount
FROM "order" o
INNER JOIN client c ON c.id = o.client_id
INNER JOIN "user" u ON u.id = c.id
INNER JOIN order_status os ON os.id = o.status_id;

SELECT
    b.name AS brand_name,
    COUNT(p.id) AS product_count
FROM product p
JOIN brand b ON p.brand_id = b.id
GROUP BY b.name
ORDER BY product_count DESC;

SELECT u.name AS user_name, o.id AS order_id
FROM "user" u
LEFT JOIN client c ON u.id = c.id
LEFT JOIN "order" o ON c.id = o.client_id;

SELECT
s.name AS supplier_name,
p.name AS product_name
FROM supplier s
LEFT JOIN product_supplier ps ON ps.supplier_id = s.id
LEFT JOIN product p ON ps.product_id = p.id

-- Получить все наборы с производителем (брендом)
SELECT 
p.name AS product_name,
b.name AS brand_name
FROM product p
LEFT JOIN brand b ON p.brand_id = b.id

 SELECT
 p.id AS product_id,
 p.name AS product_name,
 r.comment
 FROM product p
 LEFT JOIN review r ON r.product_id = p.id
 WHERE r.id IS NULL

SELECT u.name AS user_name, o.id AS order_id
FROM "order" o
RIGHT JOIN client c ON o.client_id = c.id
RIGHT JOIN "user" u ON c.id = u.id;

SELECT u.name AS user_name, o.id AS order_id
FROM "user" u
FULL OUTER JOIN client c ON u.id = c.id
FULL OUTER JOIN "order" o ON c.id = o.client_id;

SELECT
c.name,
b.name
FROM category c 
FULL JOIN brand b ON 1 = 0

SELECT u.name AS user_name, o.id AS order_id
FROM "user" u
CROSS JOIN "order" o;

SELECT
c.name,
b.name
FROM category c 
CROSS JOIN brand b

SELECT u1.name AS user1, u2.name AS user2, r.name AS role_name
FROM "user" u1
INNER JOIN "user" u2 ON u1.role_id = u2.role_id AND u1.id <> u2.id
INNER JOIN role r ON u1.role_id = r.id;

SELECT 
    u1.name AS user1_name,
    u2.name AS user2_name,
    u1.role_id
FROM "user" u1
JOIN "user" u2 
    ON u1.role_id = u2.role_id
    AND u1.id < u2.id;  -- чтобы не было повторов и пары с самим собой

-- Запросы с сгрупированными данными
SELECT 
    c.name AS category_name,
    COUNT(p.id) AS product_count,
    AVG(p.price) AS avg_price
FROM product p
JOIN category c ON p.category_id = c.id
GROUP BY c.name
ORDER BY product_count DESC;

SELECT
    o.id AS order_id,
    o.order_date,
    o.delivery_date,
    SUM(p.price * oi.quantity) AS total_amount
FROM "order" o
JOIN order_item oi ON oi.order_id = o.id
JOIN product p ON oi.product_id = p.id
GROUP BY o.id, o.order_date, o.delivery_date
HAVING 
    SUM(p.price * oi.quantity) > 1000
    AND o.delivery_date > o.order_date + INTERVAL '3 days';

SELECT
u.name AS user_name,
COUNT(ci.id) AS cart_items_count
FROM  "user" u
JOIN client c ON c.id = u.id
JOIN cart ca ON ca.client_id = c.id
JOIN cart_item ci ON ci.cart_id = ca.id
JOIN "order" o ON o.client_id = c.id
GROUP BY u.name
HAVING COUNT(ci.id) > 2 AND COUNT(o.id) >= 1

SELECT 
    p.name AS product_name,
    c.name AS category_name,
    p.price,
    RANK() OVER(PARTITION BY c.id ORDER BY p.price DESC) AS price_rank
FROM product p
JOIN category c ON p.category_id = c.id;

SELECT 
    p.name AS product_name,
    c.name AS category_name,
    p.price,
    RANK() OVER(PARTITION BY c.id ORDER BY p.price DESC) AS price_rank
FROM product p
JOIN category c ON p.category_id = c.id;

SELECT 
    p.name AS product_name,
    c.name AS category_name,
    p.price,
    AVG(p.price) OVER(PARTITION BY c.id) AS avg_price_per_category
FROM product p
JOIN category c ON p.category_id = c.id;

SELECT 
    c.name AS category_name,
    COUNT(p.id) AS product_count
FROM product p
JOIN category c ON p.category_id = c.id
GROUP BY c.name
HAVING COUNT(p.id) = 1;

SELECT u.name, r.name AS role_name
FROM "user" u
JOIN role r ON u.role_id = r.id
WHERE r.name = 'client'

UNION

SELECT u.name, r.name AS role_name
FROM "user" u
JOIN role r ON u.role_id = r.id
WHERE r.name = 'employee';

SELECT *
FROM "user" 

UNION ALL

SELECT *
FROM "user" 

SELECT
    s.name AS supplier_name,
    COUNT(ps.product_id) AS product_count
FROM product_supplier ps
JOIN supplier s ON ps.supplier_id = s.id
GROUP BY s.name
ORDER BY product_count DESC;

SELECT
b.name AS brand_name,
COUNT(p.id) AS product_count
FROM product p
LEFT JOIN brand b ON p.brand_id = b.id
GROUP BY b.name 

-- Запросы со сложными операциями с данными
SELECT u.name, u.email
FROM "user" *
WHERE EXISTS (
    SELECT 1
    FROM "order" o
    WHERE o.client_id = u.id
);

SELECT 
    name,
    price,
    CASE
        WHEN price < 20000 THEN 'Дешёвый'
        WHEN price BETWEEN 20000 AND 30000 THEN 'Средний'
        ELSE 'Дорогой'
    END AS price_category
FROM product;

EXPLAIN
SELECT p.name, b.name AS brand_name
FROM product p
JOIN brand b ON p.brand_id = b.id
WHERE p.price > 100;
