import { query } from '../services/databaseService.js';
import { analyticsQueries } from '../utils/queries.js';

export const runAnalytics = async (req, res, next) => {
  try {
    const { type } = req.params;
    const threshold = Number(req.query.threshold || 1000);

    const sql = analyticsQueries[type];
    if (!sql) {
      return res.status(400).json({ message: 'Unknown analytics query' });
    }

    const params = type === 'ordersOverThreshold' ? [threshold] : [];
    const result = await query(sql, params);
    return res.json(result.rows);
  } catch (err) {
    return next(err);
  }
};





