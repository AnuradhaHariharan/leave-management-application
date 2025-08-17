
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const Leave = require('../models/Leave');

router.get('/', requireAuth, async (req,res)=>{
  const filter = req.user.role === 'employee' ? { employee: req.user._id } : {};
  const data = await Leave.find(filter).sort({ createdAt: -1 });
  res.json({ data });
});

module.exports = router;
