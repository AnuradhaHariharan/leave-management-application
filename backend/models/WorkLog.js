
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workLogSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: Date, required: true, index: true },
  hours: { type: Number, default: 8 },
  note: { type: String },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  decidedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('WorkLog', workLogSchema);
