import pool from '../config/database.js';

export async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result;
  } finally {
    client.release();
  }
}

export async function callProcedure(sql, params = []) {
  // Процедуры уже могут управлять транзакцией сами, поэтому вызываем напрямую
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result;
  } finally {
    client.release();
  }
}

export async function closePool() {
  await pool.end();
}

