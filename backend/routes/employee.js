// routes/employee.js
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

// ---- helpers ---------------------------------------------------------------

const LEAVE_TYPES = ['casual','sick','maternity','compOff','religious'];

async function computeUsageAndAvailable(userId, balances = {}) {
  const usedAgg = await Leave.aggregate([
    { $match: { employee: userId, status: 'approved' } },
    { $group: { _id: '$type', used: { $sum: '$days' } } }
  ]);

  const usage = Object.fromEntries(LEAVE_TYPES.map(t => [t, 0]));
  for (const row of usedAgg) {
    if (usage[row._id] !== undefined) usage[row._id] = Number(row.used || 0);
  }

  const available = Object.fromEntries(
    LEAVE_TYPES.map(t => {
      const total = Number(balances?.[t] || 0);
      const used = Number(usage[t] || 0);
      return [t, Math.max(0, total - used)];
    })
  );

  return { usage, available };
}

// GET /api/employee/me
router.get('/me', requireAuth, requireRole('employee'), async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash').lean();
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { usage, available } = await computeUsageAndAvailable(user._id, user.leavesBalance || {});
  return res.json({ user: { ...user, usage, available } });
});

// GET /api/employee/leaves
router.get('/leaves', requireAuth, requireRole('employee'), async (req, res) => {
  const status = req.query.status;
  const type = req.query.type;
  const filter = { employee: req.user._id };
  if (status) filter.status = status;
  if (type) filter.type = type;

  const leaves = await Leave.find(filter).sort({ createdAt: -1 });
  res.json({ data: leaves });
});

// POST /api/employee/leaves/apply
router.post(
  '/leaves/apply',
  requireAuth,
  requireRole('employee'),
  upload.single('document'),
  body('type').isIn(LEAVE_TYPES),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('reason').optional().isString().isLength({ max: 500 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { type, startDate, endDate, reason } = req.body;
    const s = new Date(startDate), e = new Date(endDate);
    if (e < s) return res.status(400).json({ error: 'End date before start date' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (e < user.joiningDate)
      return res.status(400).json({ error: 'Leave before joining date' });

    const days = businessDaysInclusive(s, e);
    if (days <= 0)
      return res.status(400).json({ error: 'No business days in range (weekends are excluded)' });

    // overlap: any non-rejected leave intersecting [s, e]
    const overlap = await Leave.findOne({
      employee: user._id,
      status: { $ne: 'rejected' },
      $expr: {
        $and: [
          { $lte: ['$startDate', e] },
          { $gte: ['$endDate', s] }
        ]
      }
    });
    if (overlap) return res.status(409).json({ error: 'Overlaps existing leave' });

    // document requirements
    if (type === 'maternity' && !req.file)
      return res.status(400).json({ error: 'Maternity leave requires a supporting document' });
    if (type === 'sick' && days > 3 && !req.file)
      return res.status(400).json({ error: 'Sick leave over 3 days requires a doctor certificate' });

    // compute available using same source of truth
    const { available } = await computeUsageAndAvailable(user._id, user.leavesBalance || {});
    const availForType = Number(available?.[type] || 0);

    if (days > availForType) {
      return res.status(400).json({
        error: 'Insufficient balance',
        requested: days,
        available: availForType
      });
    }

    // attach doc metadata if uploaded
    let doc = {};
    if (req.file) {
      doc = {
        documentUrl: `/uploads/${req.file.filename}`,
        documentName: req.file.originalname,
        documentMime: req.file.mimetype
      };
    }

    const leave = new Leave({
      employee: user._id,
      type,
      startDate: s,
      endDate: e,
      days,
      reason,
      status: 'pending',
      ...doc
    });

    await leave.save();
    res.status(201).json({ leave });
  }
);

// POST /api/employee/compoff/request
router.post(
  '/compoff/request',
  requireAuth,
  requireRole('employee'),
  body('date').isISO8601(),
  async (req, res) => {
    const { date, note, hours } = req.body;
    const d = new Date(date);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6)
      return res.status(400).json({ error: 'Comp-off requests must be for weekend dates' });

    const exists = await WorkLog.findOne({ employee: req.user._id, date: d });
    if (exists) return res.status(409).json({ error: 'Already requested for this date' });

    const wl = new WorkLog({
      employee: req.user._id,
      date: d,
      hours: hours || 8,
      note
    });

    await wl.save();
    res.status(201).json({ request: wl });
  }
);

// GET /api/employee/compoff/requests
router.get(
  '/compoff/requests',
  requireAuth,
  requireRole('employee'),
  async (req, res) => {
    const list = await WorkLog.find({ employee: req.user._id }).sort({ createdAt: -1 });
    res.json({ data: list });
  }
);

module.exports = router;
