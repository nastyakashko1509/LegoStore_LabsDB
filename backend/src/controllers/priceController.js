import { validationResult } from 'express-validator';
import { callProcedure } from '../services/databaseService.js';

export const setProductDiscount = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { productId, percent, startDate, endDate } = req.body;
    await callProcedure('CALL set_product_discount($1,$2,$3,$4)', [productId, percent, startDate, endDate]);
    return res.json({ message: 'Discount updated' });
  } catch (err) {
    return next(err);
  }
};

export const updateProductPrice = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { productId, newPrice } = req.body;
    await callProcedure('CALL update_product_price($1,$2)', [productId, newPrice]);
    return res.json({ message: 'Price updated' });
  } catch (err) {
    return next(err);
  }
};





