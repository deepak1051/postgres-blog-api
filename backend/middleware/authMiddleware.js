import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import pool from '../db.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await pool.query('SELECT * FROM users WHERE email=$1', [
        decoded.email,
      ]);
      if (!user.rows.length) {
        res.status(400);
        throw new Error('User no longer exists');
      }
      req.user = user.rows[0];
      next();
    } catch {
      res.status(401);
      throw new Error('Invalid Token.');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorization, no token');
  }
});

export default protect;
