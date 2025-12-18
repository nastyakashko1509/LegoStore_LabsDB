import { validationResult } from 'express-validator';
import { callProcedure, query } from '../services/databaseService.js';
import { userQueries } from '../utils/queries.js';

export const changeRole = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;
    const { role } = req.body;
    await callProcedure(userQueries.changeRole, [userId, role]);
    return res.json({ message: 'Role updated' });
  } catch (err) {
    return next(err);
  }
};

export const listUsers = async (_req, res, next) => {
  try {
    const result = await query('SELECT id, name, email, phone FROM "user" ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};






