
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
require('dotenv').config();
async function run(){
  await mongoose.connect(process.env.MONGODB_URI);
  const exists = await User.findOne({ role: 'hr' });
  if (exists) { console.log('HR exists:', exists.email); process.exit(0); }
  const pw = 'HrPass123!';
  const h = await bcrypt.hash(pw, 10);
  const hr = new User({ firstName: 'Default', lastName: 'HR', email: 'hr@company.local', passwordHash: h, role: 'hr' });
  await hr.save();
  console.log('Created HR: hr@company.local password:', pw);
  process.exit(0);
}
run();
