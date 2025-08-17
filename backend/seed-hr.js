// scripts/seed-hr.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // bcryptjs also fine
require('dotenv').config();

const User = require('../models/User');

async function run() {
  const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
  }

  const email = process.env.SEED_HR_EMAIL || 'hr@company.local';
  const rawPw = process.env.SEED_HR_PASSWORD || 'HrPass123!';
  const printPw = String(process.env.PRINT_SEED_PW || '').toLowerCase() === 'true';

  try {
    await mongoose.connect(MONGO_URI);

    // Upsert by email to avoid duplicates/races
    const passwordHash = await bcrypt.hash(rawPw, 10);

    const doc = await User.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          firstName: 'Default',
          lastName: 'HR',
          role: 'hr',
          department: 'HR',
          leavesBalance: { casual: 0, sick: 0, maternity: 0, compOff: 0, religious: 0 },
          // optional: force password change on first login (add field in schema)
          mustChangePassword: process.env.FORCE_CHANGE_ON_FIRST_LOGIN === 'true',
        },
        $set: {
          email,
          passwordHash,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    console.log(`✅ HR user seeded/updated: ${doc.email}`);
    if (printPw) {
      console.log(`🔐 Dev password: ${rawPw}`);
    } else {
      console.log('🔐 Password set (hidden). Set PRINT_SEED_PW=true to print for local dev.');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    try { await mongoose.disconnect(); } catch {}
  }
}

run();
