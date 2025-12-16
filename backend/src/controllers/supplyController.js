import { validationResult } from 'express-validator';
import { callProcedure, query } from '../services/databaseService.js';

export const registerSupply = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { supplierId, supplyDate, statusName, items } = req.body;

    // Если закупочная цена не указана, берём текущую цену товара
    const productIds = [...new Set((items || []).map((i) => i.product_id))];
    let priceMap = {};
    if (productIds.length) {
      const resPrices = await query(
        'SELECT id, price FROM product WHERE id = ANY($1::uuid[])',
        [productIds]
      );
      priceMap = Object.fromEntries(resPrices.rows.map((r) => [r.id, r.price]));
    }

    const normalizedItems = (items || []).map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
      unit_cost: i.unit_cost && Number(i.unit_cost) > 0
        ? i.unit_cost
        : priceMap[i.product_id] ?? 0
    }));

    const jsonb = JSON.stringify(normalizedItems);
    await callProcedure('CALL register_supply($1,$2,$3,$4,$5)', [
      supplierId,
      supplyDate,
      statusName,
      jsonb,
      req.user.userId
    ]);
    return res.status(201).json({ message: 'Supply registered' });
  } catch (err) {
    return next(err);
  }
};

export const listSupplyStatuses = async (_req, res, next) => {
  try {
    const result = await query('SELECT id, name FROM supply_status ORDER BY name');
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};

export const listSupplies = async (_req, res, next) => {
  try {
    const sql = `
      SELECT
        s.id,
        s.supply_date,
        s.created_at,
        COALESCE(SUM(si.quantity_for_delivery), 0) AS total_quantity,
        sup.name AS supplier_name,
        st.name AS status_name
      FROM supply s
      JOIN supplier sup ON sup.id = s.supplier_id
      JOIN supply_status st ON st.id = s.status_id
      LEFT JOIN supply_item si ON si.supply_id = s.id
      GROUP BY s.id, s.supply_date, s.created_at, sup.name, st.name
      ORDER BY s.supply_date DESC, s.created_at DESC
    `;
    const result = await query(sql);
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};

export const listSupplyItems = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT si.id,
             si.product_id,
             p.name AS product_name,
             si.quantity_for_delivery,
             si.unit_cost
      FROM supply_item si
      JOIN product p ON p.id = si.product_id
      WHERE si.supply_id = $1
      ORDER BY p.name;
    `;
    const result = await query(sql, [id]);
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};

export const updateSupplyStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { statusName, supplyDate } = req.body;
    const result = await query(
      `UPDATE supply
       SET status_id = (SELECT id FROM supply_status WHERE name = $2),
           supply_date = COALESCE($3, supply_date)
       WHERE id = $1
       RETURNING *`,
      [id, statusName, supplyDate || null]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
};

export const deleteSupply = async (req, res, next) => {
  try {
    const { id } = req.params;
    // supply_item удалится каскадно по FK ON DELETE CASCADE
    const result = await query('DELETE FROM supply WHERE id = $1', [id]);
    if (!result.rowCount) {
      return res.status(404).json({ message: 'Supply not found' });
    }
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};




