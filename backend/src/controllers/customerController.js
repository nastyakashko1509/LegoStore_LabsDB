import { validationResult } from 'express-validator';
import { query } from '../services/databaseService.js';

export const listCustomers = async (_req, res, next) => {
  try {
    const sql = `
      SELECT u.id, u.name, u.email, u.phone, c.birthday
      FROM "user" u
      JOIN client c ON c.id = u.id
      ORDER BY u.created_at DESC
    `;
    const result = await query(sql);
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { name, email, phone } = req.body;
    const sql = `
      UPDATE "user"
      SET name = $2, email = $3, phone = $4
      WHERE id = $1 AND id IN (SELECT id FROM client)
      RETURNING id, name, email, phone
    `;
    const result = await query(sql, [id, name, email, phone]);
    if (!result.rowCount) return res.status(404).json({ message: 'Customer not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    // удаляем пользователя, каскад удалит client/ cart/ cart_items
    const sql = `DELETE FROM "user" WHERE id = $1 AND id IN (SELECT id FROM client)`;
    const result = await query(sql, [id]);
    if (!result.rowCount) return res.status(404).json({ message: 'Customer not found' });
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};










