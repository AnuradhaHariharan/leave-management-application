
const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Leave = require('../models/Leave');
const WorkLog = require('../models/WorkLog');
const { body, validationResult } = require('express-validator');
const { businessDaysInclusive } = require('../utils/dates');
const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: path.join(__dirname, '..', (process.env.UPLOAD_DIR || 'uploads')),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.get('/me', requireAuth, requireRole('employee'), async (req,res)=>{
  const user = await User.findById(req.user._id).select('-passwordHash').lean();
  res.json({ user });
});

router.get('/leaves', requireAuth, requireRole('employee'), async (req,res)=>{
  const status = req.query.status;
  const type = req.query.type;
  const filter = { employee: req.user._id };
  if (status) filter.status = status;
  if (type) filter.type = type;
  const leaves = await Leave.find(filter).sort({ createdAt: -1 });
  res.json({ data: leaves });
});

router.post('/leaves/apply',
  requireAuth, requireRole('employee'),
  upload.single('document'),
  body('type').isIn(['casual','sick','maternity','compOff','religious']),
  body('startDate').isISO8601(), body('endDate').isISO8601(),
  body('reason').optional().isString().isLength({ max:500 }),
  async (req,res)=>{
    const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { type, startDate, endDate, reason } = req.body;
    const s = new Date(startDate), e = new Date(endDate);
    if (e < s) return res.status(400).json({ error: 'End date before start date' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (e < user.joiningDate) return res.status(400).json({ error: 'Leave before joining date' });

    const days = businessDaysInclusive(s,e);
    if (days <= 0) return res.status(400).json({ error: 'No business days in range (weekends are excluded)' });

    const overlap = await Leave.findOne({ employee: user._id, status: { $ne: 'rejected' }, $expr: { $and: [ { $lte: ['$startDate', e] }, { $gte: ['$endDate', s] } ] } });
    if (overlap) return res.status(409).json({ error: 'Overlaps existing leave' });

    if (type === 'maternity' && !req.file) return res.status(400).json({ error: 'Maternity leave requires a supporting document' });
    if (type === 'sick' && days > 3 && !req.file) return res.status(400).json({ error: 'Sick leave over 3 days requires a doctor certificate' });

    const agg = await Leave.aggregate([ { $match: { employee: user._id, status: 'approved', type } }, { $group: { _id:null, used: { $sum: '$days' } } } ]);
    const used = agg.length ? agg[0].used : 0;
    const allowance = user.leavesBalance?.[type] || 0;
    const effective = user.leavesBalance?.[type] ?? user.leavesBalance?.[type];
    const balances = user.leavesBalance || {};
    let available = (balances[type] || 0) - used;
    if (type === 'compOff') available = (balances.compOff || 0) - used;

    if (days > available) return res.status(400).json({ error: 'Insufficient balance', requested: days, available });

    let doc = {};
    if (req.file) {
      doc = {
        documentUrl: `/uploads/${req.file.filename}`,
        documentName: req.file.originalname,
        documentMime: req.file.mimetype
      };
    }

    const leave = new Leave({ employee: user._id, type, startDate: s, endDate: e, days, reason, status: 'pending', ...doc });
    await leave.save();
    res.status(201).json({ leave });
});

router.post('/compoff/request',
  requireAuth, requireRole('employee'),
  body('date').isISO8601(),
  async (req,res)=>{
    const { date, note, hours } = req.body;
    const d = new Date(date);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) return res.status(400).json({ error: 'Comp-off requests must be for weekend dates' });
    const WorkLog = require('../models/WorkLog');
    const exists = await WorkLog.findOne({ employee: req.user._id, date: d });
    if (exists) return res.status(409).json({ error: 'Already requested for this date' });
    const wl = new WorkLog({ employee: req.user._id, date: d, hours: hours || 8, note });
    await wl.save();
    res.status(201).json({ request: wl });
});

router.get('/compoff/requests', requireAuth, requireRole('employee'), async (req,res)=>{
  const WorkLog = require('../models/WorkLog');
  const list = await WorkLog.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.json({ data: list });
});

module.exports = router;
