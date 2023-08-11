import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
  // connectionString:
  //   'postgres://deepak1051:MWmvn2FVl8Kq@ep-fancy-firefly-85782086.ap-southeast-1.aws.neon.tech/neondb',
  ssl: {
    rejectUnauthorized: false,
  },
  // user: 'postgres',
  // password: 'Deepak@123',
  // host: 'localhost',
  // post: 5432,
  // database: 'pernblog',
});

export default pool;

// const { Pool } = require('pg');
// require('dotenv').config();

// const { DATABASE_URL } = process.env;

// const pool = new Pool({
//   connectionString: DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
// });
