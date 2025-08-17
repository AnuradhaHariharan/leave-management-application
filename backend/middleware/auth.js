
const jwt = require('jsonwebtoken');
const User = require('../models/User');
module.exports = {
  requireAuth: async (req,res,next) => {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Missing auth header' });
    const token = header.replace('Bearer ','').trim();
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub).select('-passwordHash');
      if (!user) return res.status(401).json({ error: 'User not found' });
      req.user = user;
      next();
    } catch(err){ return res.status(401).json({ error: 'Invalid token' }); }
  },
  requireRole: (role) => (req,res,next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
    if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  }
};
