const express = require('express');
const app = express();
app.use(express.json());

const REGISTRATION_URL = process.env.REGISTRATION_URL || 'http://localhost:3001';
const STUDENT_URL = process.env.STUDENT_URL || 'http://student-service:3002';

async function forward(base, req, res) {
  try {
    const hasBody = !['GET', 'DELETE'].includes(req.method);
    const r = await fetch(base + req.originalUrl, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: hasBody ? JSON.stringify(req.body) : undefined,
    });
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(502).json({ error: 'Service unavailable', detail: e.message });
  }
}

app.post('/register', (req, res) => forward(REGISTRATION_URL, req, res));
app.use('/students', (req, res) => forward(STUDENT_URL, req, res));
app.post('/login', (req, res) => forward(STUDENT_URL, req, res));

app.listen(3000, () => console.log('API Gateway on 3000'));
