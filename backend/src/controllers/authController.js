import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';
import { callProcedure, query } from '../services/databaseService.js';
import { authQueries, userQueries } from '../utils/queries.js';

dotenv.config();

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, email, phone, password, role, birthday, passportSeries, passportNumber
    } = req.body;

    const hashed = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 10));

    await callProcedure(
      'CALL register_user($1,$2,$3,$4,$5,$6,$7,$8)',
      [name, email, phone, hashed, role, birthday, passportSeries, passportNumber]
    );

    return res.status(201).json({ message: 'Registered' });
  } catch (err) {
    return next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await query(
      'SELECT u.id, u.name, u.email, u.password, r.name AS role FROM "user" u JOIN role r ON r.id = u.role_id WHERE u.email = $1',
      [email]
    );

    if (!result.rowCount) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
    );

    return res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (err) {
    return next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const result = await query(userQueries.getById, [req.user.userId]);
    return res.json(result.rows[0]);
  } catch (err) {
    return next(err);
  }
};




