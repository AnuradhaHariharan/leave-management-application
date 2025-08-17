
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaveSchema = new Schema({
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['casual','sick','maternity','compOff','religious'], required: true, index: true },
  startDate: { type: Date, required: true, index: true },
  endDate: { type: Date, required: true, index: true },
  days: { type: Number, required: true },
  reason: { type: String },
  documentUrl: { type: String },
  documentName: { type: String },
  documentMime: { type: String },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending', index: true },
  decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  decidedAt: { type: Date },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
