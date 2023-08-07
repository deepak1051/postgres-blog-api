import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import goalRoutes from './routes/blogRoutes.js';
import userRoutes from './routes/userRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';
import pool from './db.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// connectDB();

async function getPostgresVersion() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT version()');
    console.log(res.rows[0]);
  } finally {
    client.release();
  }
}

getPostgresVersion();

app.get('/', (req, res) => {
  res.send('homepage');
});

app.use('/api/blogs', goalRoutes);
app.use('/api/user', userRoutes);
app.use('/api/comments', commentRoutes);

app.use(errorHandler);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
