export const authQueries = {
  login: 'SELECT * FROM login_user($1, $2)'
};

export const userQueries = {
  getById: 'SELECT u.id, u.name, u.email, u.phone, r.name AS role FROM "user" u JOIN role r ON r.id = u.role_id WHERE u.id = $1',
  changeRole: 'CALL change_user_role($1, $2)'
};

export const productQueries = {
  list: 'SELECT id, name, price, age_limit, category_id, brand_id FROM product ORDER BY created_at DESC',
  create: 'INSERT INTO product (name, price, age_limit, category_id, brand_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
  update: 'UPDATE product SET name=$2, price=$3, age_limit=$4, category_id=$5, brand_id=$6 WHERE id=$1 RETURNING *',
  remove: 'DELETE FROM product WHERE id=$1'
};

export const cartQueries = {
  getTotals: 'SELECT * FROM get_cart_with_totals($1)'
};

export const orderQueries = {
  list: `
    SELECT
      o.id,
      o.order_date,
      o.delivery_date,
      COALESCE(SUM(oi.quantity * oi.unit_price), 0)::DECIMAL(10,2) AS total_amount,
      os.name AS status,
      COALESCE(
        json_agg(
          json_build_object(
            'product_name', p.name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price
          )
        ) FILTER (WHERE oi.id IS NOT NULL),
        '[]'
      ) AS items
    FROM "order" o
    JOIN order_status os ON os.id = o.status_id
    LEFT JOIN order_item oi ON oi.order_id = o.id
    LEFT JOIN product p ON p.id = oi.product_id
    WHERE o.client_id = $1
    GROUP BY o.id, o.order_date, o.delivery_date, os.name
    ORDER BY o.order_date DESC
  `,
  listAll: `
    SELECT
      o.id,
      o.order_date,
      o.delivery_date,
      COALESCE(SUM(oi.quantity * oi.unit_price), 0)::DECIMAL(10,2) AS total_amount,
      os.name AS status,
      u.name AS client_name,
      u.email AS client_email
    FROM "order" o
    JOIN order_status os ON os.id = o.status_id
    JOIN client c ON c.id = o.client_id
    JOIN "user" u ON u.id = c.id
    LEFT JOIN order_item oi ON oi.order_id = o.id
    GROUP BY o.id, o.order_date, o.delivery_date, os.name, u.name, u.email
    ORDER BY o.order_date DESC
  `,
  updateStatus: 'UPDATE "order" SET status_id = $2 WHERE id = $1 RETURNING *'
};

export const analyticsQueries = {
  // клиенты с корзиной > 2
  usersWithLargeCart: ` 
    SELECT u.id, u.name, COUNT(ci.id) AS cart_items_count
    FROM "user" u
    JOIN client c ON c.id = u.id
    JOIN cart ca ON ca.client_id = c.id
    JOIN cart_item ci ON ci.cart_id = ca.id
    GROUP BY u.id, u.name
    HAVING COUNT(ci.id) > 2;
  `,
  // товары дороже средней цены
  expensiveProducts: `
    SELECT p.id, p.name, p.price
    FROM product p
    WHERE p.price > (SELECT AVG(price) FROM product);
  `,
  // количество товаров у каждого поставщика
  supplierProductCounts: `
    SELECT s.name AS supplier_name, COUNT(ps.product_id) AS product_count
    FROM product_supplier ps
    JOIN supplier s ON ps.supplier_id = s.id
    GROUP BY s.name
    ORDER BY product_count DESC;
  `,
  // статистика по корзинам
  cartStats: `
    SELECT u.id,
           u.name,
           COUNT(ci.id) AS items_count,
           AVG(p.price) AS avg_price
    FROM "user" u
    JOIN client c ON c.id = u.id
    JOIN cart ca ON ca.client_id = c.id
    JOIN cart_item ci ON ci.cart_id = ca.id
    JOIN product p ON p.id = ci.product_id
    GROUP BY u.id, u.name
    HAVING COUNT(ci.id) > 3 AND AVG(p.price) > 50;
  `,
  // товары без отзывово
  reviewsMissing: `
    SELECT p.id AS product_id, p.name AS product_name
    FROM product p
    LEFT JOIN review r ON r.product_id = p.id
    WHERE r.id IS NULL;
  `
};

