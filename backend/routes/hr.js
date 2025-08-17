
const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const Leave = require('../models/Leave');
const WorkLog = require('../models/WorkLog');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// Onboard employee - HR only
router.post('/onboard', requireAuth, requireRole('hr'),
  body('firstName').isString().notEmpty(),
  body('lastName').isString().notEmpty(),
  body('dob').isISO8601(),
  body('department').isString().notEmpty(),
  body('joiningDate').isISO8601(),
  async (req,res) => {
    const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { firstName, lastName, dob, department, joiningDate } = req.body;
    const d = new Date(dob);
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yy = String(d.getFullYear()).slice(-2);
    let base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${dd}${mm}${yy}`.replace(/\s+/g,'').replace(/[^a-z0-9.]/g,'');
    let email = base + '@company.local';
    let suffix = 0;
    while (await User.findOne({ email })) { suffix++; email = `${base}${suffix}@company.local`; }
    const password = Math.random().toString(36).slice(-8) + 'A1';
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName, lastName, email, passwordHash, role: 'employee',
      department, dob: new Date(dob), joiningDate: new Date(joiningDate),
      leavesBalance: { casual:12, sick:12, maternity:180, compOff:0, religious:2 }
    });
    await user.save();
    res.status(201).json({ user: { id: user._id, firstName, lastName, email }, password });
});

// view pending leave requests (HR)
router.get('/leave-requests', requireAuth, requireRole('hr'), async (req,res)=>{
  const leaves = await Leave.find({ status: 'pending' }).populate('employee','firstName lastName email department');
  res.json({ data: leaves });
});

// approve leave
router.post('/leave-requests/:id/approve', requireAuth, requireRole('hr'), async (req,res)=>{
  const id = req.params.id;
  const leave = await Leave.findById(id).populate('employee');
  if (!leave) return res.status(404).json({ error: 'Leave not found' });
  if (leave.status !== 'pending') return res.status(400).json({ error: 'Only pending can be approved' });

  const agg = await Leave.aggregate([ { $match: { employee: leave.employee._id, status: 'approved', type: leave.type } }, { $group: { _id:null, used: { $sum: '$days' } } } ]);
  const used = agg.length ? agg[0].used : 0;
  const available = (leave.employee.leavesBalance?.[leave.type] || 0) - used;
  if (leave.days > available) return res.status(400).json({ error: 'Insufficient balance at approval', available });

  leave.status = 'approved'; leave.decidedAt = new Date(); leave.decidedBy = req.user._id;
  await leave.save();
  res.json({ ok: true });
});

// reject leave
router.post('/leave-requests/:id/reject', requireAuth, requireRole('hr'), async (req,res)=>{
  const id = req.params.id;
  const leave = await Leave.findById(id);
  if (!leave) return res.status(404).json({ error: 'Leave not found' });
  if (leave.status !== 'pending') return res.status(400).json({ error: 'Only pending can be rejected' });
  leave.status = 'rejected'; leave.decidedAt = new Date(); leave.decidedBy = req.user._id;
  await leave.save();
  res.json({ ok: true });
});

// list employees with balances + usage
router.get('/employees', requireAuth, requireRole('hr'), async (req,res)=>{
  const q = req.query.q || '';
  const filter = q ? { $or: [ { firstName: new RegExp(q,'i') }, { lastName: new RegExp(q,'i') }, { email: new RegExp(q,'i') } ] } : {};
  const users = await User.find({ role: 'employee', ...filter }).select('-passwordHash').lean();
  const results = await Promise.all(users.map(async u=>{
    const usage = {};
    for (const t of ['casual','sick','maternity','compOff','religious']) {
      const agg = await (await Leave.aggregate([ { $match: { employee: u._id, status: 'approved', type: t } }, { $group: { _id:null, used: { $sum: '$days' } } } ]));
      usage[t] = agg.length ? agg[0].used : 0;
    }
    return { ...u, usage, available: {
      casual: (u.leavesBalance.casual || 0) - (usage.casual || 0),
      sick: (u.leavesBalance.sick || 0) - (usage.sick || 0),
      maternity: (u.leavesBalance.maternity || 0) - (usage.maternity || 0),
      compOff: (u.leavesBalance.compOff || 0) - (usage.compOff || 0),
      religious: (u.leavesBalance.religious || 0) - (usage.religious || 0),
    } };
  }));
  res.json({ data: results });
});

// comp-off requests (HR side)
router.get('/comp-off/requests', requireAuth, requireRole('hr'), async (req,res)=>{
  const requests = await (await require('../models/WorkLog').find({ status: 'pending' }).populate('employee','firstName lastName email'));
  res.json({ data: requests });
});

router.post('/comp-off/requests/:id/approve', requireAuth, requireRole('hr'), async (req,res)=>{
  const WorkLog = require('../models/WorkLog');
  const wl = await WorkLog.findById(req.params.id).populate('employee');
  if (!wl) return res.status(404).json({ error: 'Request not found' });
  if (wl.status !== 'pending') return res.status(400).json({ error: 'Only pending can be approved' });
  wl.status = 'approved'; wl.decidedAt = new Date(); wl.decidedBy = req.user._id;
  await wl.save();
  wl.employee.leavesBalance.compOff = (wl.employee.leavesBalance.compOff || 0) + 1;
  await wl.employee.save();
  res.json({ ok: true });
});

router.post('/comp-off/requests/:id/reject', requireAuth, requireRole('hr'), async (req,res)=>{
  const WorkLog = require('../models/WorkLog');
  const wl = await WorkLog.findById(req.params.id);
  if (!wl) return res.status(404).json({ error: 'Request not found' });
  if (wl.status !== 'pending') return res.status(400).json({ error: 'Only pending can be rejected' });
  wl.status = 'rejected'; wl.decidedAt = new Date(); wl.decidedBy = req.user._id;
  await wl.save();
  res.json({ ok: true });
});

module.exports = router;
