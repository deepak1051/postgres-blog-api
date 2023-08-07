import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('All fields are required');
  }

  const isExist = await pool.query(
    'SELECT email FROM users WHERE users.email=$1',
    [email]
  );

  if (isExist.rows.length === 1) {
    res.status(400);
    throw new Error('User already exists');
  }

  //hash the password

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await pool.query(
    'INSERT INTO users(username,email,password) VAlUES ($1,$2,$3) RETURNING *',
    [username, email, hashedPassword]
  );

  const { password: x, ...rest } = newUser.rows[0];

  if (newUser.rows.length > 0) {
    res.status(201).json({
      ...rest,
      token: genToken(rest.email),
    });
  } else {
    res.status(400);
    throw new Error('Error creating user');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please fill all fields');
  }

  const user = await pool.query('SELECT * FROM users WHERE email=$1', [email]);

  if (!user.rows.length) {
    res.status(400);
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.rows[0].password);

  if (!isMatch) {
    res.status(400);
    throw new Error('Invalid email or password');
  }

  const { password: x, ...rest } = user.rows[0];

  res.status(201).json({
    ...rest,
    token: genToken(rest.email),
  });
});

//private routes
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

const genToken = (email) => {
  return jwt.sign({ email: email }, process.env.JWT_SECRET, {
    expiresIn: '2d',
  });
};
export { registerUser, loginUser, getMe };
