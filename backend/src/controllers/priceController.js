import { validationResult } from 'express-validator';
import { callProcedure } from '../services/databaseService.js';

export const setProductDiscount = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { productId, percent, startDate, endDate } = req.body;
    const userId = req.user?.userId;
    // Если процедура с 5 параметрами существует, используем её, иначе вызываем старую версию
    try {
      await callProcedure('CALL set_product_discount($1::uuid,$2::decimal,$3::date,$4::date,$5::uuid)', 
        [productId, percent, startDate, endDate, userId]);
    } catch (procErr) {
      // Если процедура с 5 параметрами не существует, пробуем старую версию (4 параметра)
      if (procErr.message && procErr.message.includes('не существует')) {
        await callProcedure('CALL set_product_discount($1::uuid,$2::decimal,$3::date,$4::date)', 
          [productId, percent, startDate, endDate]);
      } else {
        throw procErr;
      }
    }
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
    const userId = req.user?.userId;
    // Если процедура с 3 параметрами существует, используем её, иначе вызываем старую версию
    try {
      await callProcedure('CALL update_product_price($1::uuid,$2::decimal,$3::uuid)', 
        [productId, newPrice, userId]);
    } catch (procErr) {
      // Если процедура с 3 параметрами не существует, пробуем старую версию (2 параметра)
      if (procErr.message && procErr.message.includes('не существует')) {
        await callProcedure('CALL update_product_price($1::uuid,$2::decimal)', 
          [productId, newPrice]);
      } else {
        throw procErr;
      }
    }
    return res.json({ message: 'Price updated' });
  } catch (err) {
    return next(err);
  }
};









