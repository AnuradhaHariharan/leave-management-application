
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeaveBalanceSchema = new Schema({
  casual: { type: Number, default: 12 },
  sick: { type: Number, default: 12 },
  maternity: { type: Number, default: 180 }, // days
  compOff: { type: Number, default: 0 },
  religious: { type: Number, default: 2 }
}, { _id: false });

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['hr','employee'], required: true },
  department: { type: String },
  joiningDate: { type: Date },
  dob: { type: Date },
  leaveBalance: { type: Number, default: 24 }, // legacy
  leavesBalance: { type: LeaveBalanceSchema, default: () => ({}) }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
