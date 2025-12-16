import { validationResult } from 'express-validator';
import { callProcedure, query } from '../services/databaseService.js';
import { cartQueries } from '../utils/queries.js';

export const addToCart = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { productId, quantity } = req.body;
    await callProcedure('CALL add_to_cart($1,$2,$3)', [req.user.userId, productId, quantity]);
    return res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    return next(err);
  }
};

export const updateQuantity = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { productId, quantity } = req.body;
    await callProcedure('CALL update_cart_item_quantity($1,$2,$3)', [req.user.userId, productId, quantity]);
    return res.json({ message: 'Quantity updated' });
  } catch (err) {
    return next(err);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await callProcedure('CALL remove_from_cart($1,$2)', [req.user.userId, productId]);
    return res.json({ message: 'Removed' });
  } catch (err) {
    return next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await callProcedure('CALL clear_cart($1)', [req.user.userId]);
    return res.json({ message: 'Cart cleared' });
  } catch (err) {
    return next(err);
  }
};

export const getCart = async (req, res, next) => {
  try {
    const result = await query(cartQueries.getTotals, [req.user.userId]);
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};

