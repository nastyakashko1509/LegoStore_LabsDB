import { validationResult } from 'express-validator';
import { query } from '../services/databaseService.js';

export const createOrUpdateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, comment, rating } = req.body;
    const clientId = req.user.userId;

    const sql = `
      INSERT INTO review (client_id, product_id, comment, rating)
      VALUES ($1,$2,$3,$4)
      ON CONFLICT (client_id, product_id)
      DO UPDATE SET comment = EXCLUDED.comment, rating = EXCLUDED.rating, created_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await query(sql, [clientId, productId, comment, rating]);
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
};

export const listProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const sql = `
      SELECT r.id,
             r.comment,
             r.rating,
             r.created_at,
             u.name AS client_name
      FROM review r
      JOIN client c ON c.id = r.client_id
      JOIN "user" u ON u.id = c.id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC;
    `;
    const result = await query(sql, [productId]);
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};

export const listMyReviews = async (req, res, next) => {
  try {
    const clientId = req.user.userId;
    const sql = `
      SELECT r.id,
             r.comment,
             r.rating,
             r.created_at,
             p.id AS product_id,
             p.name AS product_name
      FROM review r
      JOIN product p ON p.id = r.product_id
      WHERE r.client_id = $1
      ORDER BY r.created_at DESC;
    `;
    const result = await query(sql, [clientId]);
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};




