import React, { useEffect, useState, useMemo } from 'react';
import {
  Container, Typography, Paper, Stack, FormControl, InputLabel, Select, MenuItem,
  TextField, Button, List, ListItem, ListItemText, Chip, Divider, Box, LinearProgress
} from '@mui/material';
import http from '../../api/client';
import { toast } from 'react-toastify';

export default function MyLeaves(){
  const [status, setStatus] = useState('');
  const [type, setType] = useState('casual');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [reason, setReason] = useState('');
  const [doc, setDoc] = useState(null);

  // fetched from /api/employee/me
  const [available, setAvailable] = useState({});   // { casual, sick, maternity, compOff, religious }

  const needsDocHint = (type === 'maternity') || (type === 'sick');

  useEffect(() => {
    fetchLeaves();
  }, [status, type]);

  useEffect(() => {
    fetchAvailable();
  }, []);

  async function fetchAvailable(){
    try{
      const res = await http.get('/api/employee/me');
      setAvailable(res.data?.user?.available || {});
    }catch(e){
      // if this fails, we still let server validate
      setAvailable({});
    }
  }

  async function fetchLeaves(){
    try{
      setLoading(true);
      const params = {};
      if (status) params.status = status;
      if (type) params.type = type;
      const res = await http.get('/api/employee/leaves', { params });
      setLeaves(res.data.data || []);
    } catch(e){
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  }

  // helper: inclusive business days Mon–Fri (no holidays)
  const businessDaysInclusive = (startISO, endISO) => {
    if (!startISO || !endISO) return 0;
    const s = new Date(startISO);
    const e = new Date(endISO);
    if (e < s) return 0;
    let count = 0;
    const d = new Date(s);
    while (d <= e) {
      const day = d.getDay(); // 0 Sun .. 6 Sat
      if (day !== 0 && day !== 6) count++;
      d.setDate(d.getDate() + 1);
    }
    return count;
  };

  const requestedDays = useMemo(() => businessDaysInclusive(start, end), [start, end]);

  const leftForType = Number(available?.[type] ?? 0);

  const disabledApply = useMemo(() => {
    if (!start || !end) return true;
    if (new Date(end) < new Date(start)) return true;
    if (type === 'maternity' && !doc) return true;
    // block if user is clearly exceeding available on client
    if (requestedDays > leftForType && leftForType >= 0) return true;
    return false;
  }, [start, end, type, doc, requestedDays, leftForType]);

  async function submit(e){
    e.preventDefault();

    // guard on client before POST
    if (requestedDays <= 0) {
      toast.error('❌ Invalid date range (no business days).');
      return;
    }
    if (requestedDays > leftForType && leftForType >= 0) {
      toast.error(`❌ Requested ${requestedDays} business days but only ${leftForType} left for ${type}.`);
      return;
    }

    try{
      const fd = new FormData();
      fd.append('type', type);
      fd.append('startDate', start);
      fd.append('endDate', end);
      if (reason) fd.append('reason', reason);
      if (doc) fd.append('document', doc);

      await http.post('/api/employee/leaves/apply', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('✅ Leave applied successfully');
      setStart(''); setEnd(''); setReason(''); setDoc(null);
      // refresh balances & history
      fetchAvailable();
      fetchLeaves();
    }catch(err){
      const msg = err?.response?.data?.error || err?.message || 'Error applying leave';
      toast.error(`❌ ${msg}`);
    }
  }

  const statusChipColor = (s) => {
    if (s === 'approved') return 'success';
    if (s === 'rejected') return 'error';
    return 'warning';
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#112240' }}>
        My Leaves
      </Typography>

      {/* Filters */}
      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid #e5e7eb', background: '#fff' }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e)=>setStatus(e.target.value)}>
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Type</InputLabel>
            <Select value={type} label="Type" onChange={(e)=>setType(e.target.value)}>
              <MenuItem value="casual">Casual</MenuItem>
              <MenuItem value="sick">Sick</MenuItem>
              <MenuItem value="maternity">Maternity</MenuItem>
              <MenuItem value="compOff">Compensatory</MenuItem>
              <MenuItem value="religious">Religious</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* List */}
      <Paper elevation={0} sx={{ p: 0, mb: 3, borderRadius: 3, border: '1px solid #e5e7eb', overflow: 'hidden', background: '#fff' }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <Typography sx={{ fontWeight: 700, color: '#112240' }}>History</Typography>
        </Box>

        {loading && <LinearProgress />}

        {!loading && leaves.length === 0 && (
          <Box sx={{ p: 3, color: '#64748b' }}>
            No leave records for the selected filters.
          </Box>
        )}

        {!loading && leaves.length > 0 && (
          <List sx={{ py: 0 }}>
            {leaves.map((l, idx) => (
              <React.Fragment key={l._id}>
                <ListItem
                  sx={{ py: 1.5 }}
                  secondaryAction={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip label={l.type.toUpperCase()} size="small" sx={{ bgcolor: '#eef2ff', color: '#1e293b', fontWeight: 600 }} />
                      <Chip label={l.days + ' days'} size="small" sx={{ bgcolor: '#f1f5f9', color: '#0f172a' }} />
                      <Chip label={l.status} size="small" color={statusChipColor(l.status)} />
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={`${new Date(l.startDate).toDateString()} → ${new Date(l.endDate).toDateString()}`}
                    secondary={l.reason || '—'}
                  />
                </ListItem>
                {idx < leaves.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Apply form */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e5e7eb', background: '#fff' }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#112240' }}>
          Apply for Leave
        </Typography>

        <Stack component="form" onSubmit={submit} spacing={2} sx={{ maxWidth: 520 }}>
          <Stack direction={{ xs:'column', sm:'row' }} spacing={2}>
            <FormControl fullWidth>
              <TextField
                label="Start"
                type="date"
                value={start}
                onChange={(e)=>setStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </FormControl>
            <FormControl fullWidth>
              <TextField
                label="End"
                type="date"
                value={end}
                onChange={(e)=>setEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
                required
              />
            </FormControl>
          </Stack>

          {/* helper hint */}
          <Typography sx={{ fontSize: 12, color: '#64748b' }}>
            Requesting <b>{requestedDays}</b> business day{requestedDays === 1 ? '' : 's'}. You have <b>{leftForType}</b> left for <b>{type}</b>.
          </Typography>

          <TextField
            label="Reason (optional)"
            placeholder="Short note for HR"
            value={reason}
            onChange={(e)=>setReason(e.target.value)}
            multiline
            minRows={2}
          />

          <Stack spacing={1}>
            <Button
              variant="outlined"
              component="label"
              sx={{ alignSelf: 'flex-start' }}
            >
              {doc ? 'Change document' : 'Upload document'}
              <input
                type="file"
                hidden
                onChange={(e)=>setDoc(e.target.files?.[0] || null)}
              />
            </Button>
            {needsDocHint && (
              <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                Maternity requires a document. Sick leave over 3 business days needs a doctor's note.
              </Typography>
            )}
            {doc && (
              <Typography sx={{ fontSize: 12, color: '#334155' }}>
                Selected: {doc.name}
              </Typography>
            )}
          </Stack>

          <Button
            type="submit"
            variant="contained"
            disabled={disabledApply}
            sx={{ bgcolor: '#112240', ':hover': { bgcolor: '#0d1a30' }, alignSelf: 'flex-start' }}
          >
            Apply
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
