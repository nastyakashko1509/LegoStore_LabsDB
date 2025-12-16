import { validationResult } from 'express-validator';
import { callProcedure, query } from '../services/databaseService.js';
import { orderQueries } from '../utils/queries.js';

export const createOrder = async (req, res, next) => {
  try {
    await callProcedure('CALL create_order($1)', [req.user.userId]);
    return res.status(201).json({ message: 'Order created' });
  } catch (err) {
    return next(err);
  }
};

export const listOrders = async (req, res, next) => {
  try {
    const result = await query(orderQueries.list, [req.user.userId]);
    // Подстрахуемся: если total_amount null, пересчитаем на лету
    const orders = result.rows.map((o) => ({
      ...o,
      total_amount: o.total_amount ?? 0
    }));
    return res.json(orders);
  } catch (err) {
    return next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { statusId } = req.body;
    const result = await query(orderQueries.updateStatus, [id, statusId]);
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
};

export const listAllOrders = async (_req, res, next) => {
  try {
    const result = await query(orderQueries.listAll);
    const orders = result.rows.map((o) => ({
      ...o,
      total_amount: o.total_amount ?? 0
    }));
    return res.json(orders);
  } catch (err) {
    return next(err);
  }
};

export const listOrderStatuses = async (_req, res, next) => {
  try {
    const result = await query('SELECT id, name FROM order_status ORDER BY name');
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};

