const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'studentdb',
};
let pool;

async function initDb() {
  for (let i = 0; i < 30; i++) {           // wait for MySQL to be ready
    try {
      pool = mysql.createPool(dbConfig);
      await pool.query(`CREATE TABLE IF NOT EXISTS students (
        student_id INT AUTO_INCREMENT PRIMARY KEY,
        student_name VARCHAR(100) NOT NULL,
        student_mobile VARCHAR(20),
        student_email VARCHAR(100) UNIQUE NOT NULL,
        student_password VARCHAR(255) NOT NULL)`);
      console.log('DB ready');
      return;
    } catch (e) {
      console.log('Waiting for DB...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  process.exit(1);
}

app.post('/register', async (req, res) => {
  const { student_name, student_mobile, student_email, student_password } = req.body;
  if (!student_name || !student_email || !student_password)
    return res.status(400).json({ error: 'name, email and password are required' });
  try {
    const hash = await bcrypt.hash(student_password, 10);
    const [r] = await pool.query(
      'INSERT INTO students (student_name, student_mobile, student_email, student_password) VALUES (?,?,?,?)',
      [student_name, student_mobile, student_email, hash]);
    res.status(201).json({ message: 'Student registered', student_id: r.insertId });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: e.message });
  }
});

initDb().then(() => app.listen(3001, () => console.log('Registration on 3001')));
