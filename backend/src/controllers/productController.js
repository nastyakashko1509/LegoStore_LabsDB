import { validationResult } from 'express-validator';
import { query } from '../services/databaseService.js';
import { productQueries } from '../utils/queries.js';

export const listProducts = async (req, res, next) => {
  try {
    const {
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      minAge,
      maxAge,
      search,
      sort
    } = req.query;

    const conditions = [];
    const params = [];

    if (categoryId) {
      params.push(categoryId);
      conditions.push(`p.category_id = $${params.length}`);
    }
    if (brandId) {
      params.push(brandId);
      conditions.push(`p.brand_id = $${params.length}`);
    }
    if (minPrice) {
      params.push(minPrice);
      conditions.push(`p.price >= $${params.length}`);
    }
    if (maxPrice) {
      params.push(maxPrice);
      conditions.push(`p.price <= $${params.length}`);
    }
    if (minAge) {
      params.push(minAge);
      conditions.push(`p.age_limit >= $${params.length}`);
    }
    if (maxAge) {
      params.push(maxAge);
      conditions.push(`p.age_limit <= $${params.length}`);
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      conditions.push(`LOWER(p.name) LIKE $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'ORDER BY p.created_at DESC';
    if (sort === 'priceAsc') orderBy = 'ORDER BY p.price ASC';
    if (sort === 'priceDesc') orderBy = 'ORDER BY p.price DESC';
    if (sort === 'ageAsc') orderBy = 'ORDER BY p.age_limit ASC';
    if (sort === 'ageDesc') orderBy = 'ORDER BY p.age_limit DESC';
    if (sort === 'popular') {
      // популярность по количеству заказов
      orderBy = 'ORDER BY COALESCE(o_count.order_count, 0) DESC';
    }

    const sql = `
      SELECT
        p.id,
        p.name,
        p.price,
        p.age_limit,
        p.category_id,
        p.brand_id,
        COALESCE(avg_rev.avg_rating, 0) AS avg_rating,
        COALESCE(o_count.order_count, 0) AS order_count,
        dp.percent AS discount_percent,
        dp.start_date AS discount_start,
        dp.end_date AS discount_end
      FROM product p
      LEFT JOIN (
        SELECT product_id, AVG(rating)::DECIMAL(3,2) AS avg_rating
        FROM review
        GROUP BY product_id
      ) AS avg_rev ON avg_rev.product_id = p.id
      LEFT JOIN (
        SELECT oi.product_id, COUNT(*) AS order_count
        FROM order_item oi
        GROUP BY oi.product_id
      ) AS o_count ON o_count.product_id = p.id
      LEFT JOIN (
        SELECT product_id, percent, start_date, end_date
        FROM discount_product
        WHERE start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE
      ) AS dp ON dp.product_id = p.id
      ${whereClause}
      ${orderBy}
    `;

    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, price, ageLimit, categoryId, brandId } = req.body;
    const result = await query(productQueries.create, [name, price, ageLimit, categoryId, brandId]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { name, price, ageLimit, categoryId, brandId } = req.body;
    const result = await query(productQueries.update, [id, name, price, ageLimit, categoryId, brandId]);
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await query(productQueries.remove, [id]);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

