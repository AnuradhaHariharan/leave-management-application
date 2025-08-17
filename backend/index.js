// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const hrRoutes = require('./routes/hr');
const employeeRoutes = require('./routes/employee');
const leaveRoutes = require('./routes/leaves');
const compOffRoutes = require('./routes/compoff');

const app = express();

/* ------------------------- CORS (dev vs prod) ------------------------- */
// In dev: allow all. In prod: allow only origins in CORS_ORIGIN (comma-separated).
const allowed =
  process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : [])
    : '*';

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl/Postman & same-origin
    if (allowed === '*') return cb(null, true);
    if (Array.isArray(allowed) && allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
// IMPORTANT: reply to preflight requests so browsers can proceed
app.options('*', cors(corsOptions));

/* ---------------------------- Middleware ----------------------------- */
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

/* ----------------------------- Uploads ------------------------------- */
// Local dev defaults to ./uploads; on Render set UPLOAD_DIR=/var/data/uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use('/uploads', express.static(path.join(__dirname, UPLOAD_DIR)));

/* ------------------------------ Health ------------------------------- */
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

/* ------------------------------- APIs -------------------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/compoff', compOffRoutes);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log('Server running on port', PORT));
  })
  .catch(err => {
    console.error('Mongo connect error', err);
    process.exit(1);
  });
