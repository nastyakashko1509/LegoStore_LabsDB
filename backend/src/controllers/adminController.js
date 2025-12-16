import { validationResult } from 'express-validator';
import { callProcedure, query } from '../services/databaseService.js';

export const listUsers = async (_req, res, next) => {
  try {
    const sql = `
      SELECT u.id, u.name, u.email, u.phone, r.name AS role
      FROM "user" u
      JOIN role r ON r.id = u.role_id
      ORDER BY u.created_at DESC
    `;
    const result = await query(sql);
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};

export const changeUserRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { userId } = req.params;
    const { role } = req.body;
    await callProcedure('CALL change_user_role($1,$2)', [userId, role]);
    return res.json({ message: 'Role updated' });
  } catch (err) {
    return next(err);
  }
};

export const listLogs = async (req, res, next) => {
  try {
    const { userId, startDate, endDate, action } = req.query;
    const result = await query(
      'SELECT * FROM get_user_logs($1,$2,$3,$4)',
      [
        userId || null,
        startDate || null,
        endDate || null,
        action || null
      ]
    );
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};



