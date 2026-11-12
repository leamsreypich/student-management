const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'studentdb',
});

// UPDATE student mobile number or password
// PUT /students/:id   body: { "student_mobile": "..." } and/or { "student_password": "..." }
app.put('/students/:id', async (req, res) => {
  try {
    const { student_mobile, student_password } = req.body;
    const fields = [], params = [];
    if (student_mobile) { fields.push('student_mobile = ?'); params.push(student_mobile); }
    if (student_password) { fields.push('student_password = ?'); params.push(await bcrypt.hash(student_password, 10)); }
    if (!fields.length) return res.status(400).json({ error: 'Nothing to update' });
    const [r] = await pool.query(
      `UPDATE students SET ${fields.join(', ')} WHERE student_id = ?`,
      [...params, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student updated' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3002, () => console.log('Student service on 3002'));