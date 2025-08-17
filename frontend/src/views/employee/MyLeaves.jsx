
import React, { useEffect, useState } from 'react';
import { Container, Button, Select, MenuItem, List, ListItem, ListItemText, Typography, TextField } from '@mui/material';
import http from '../../api/client';

export default function MyLeaves(){
  const [status,setStatus]=useState(''); const [leaves,setLeaves]=useState([]);
  const [type,setType]=useState('casual');
  const [start,setStart]=useState(''); const [end,setEnd]=useState(''); const [reason,setReason]=useState('');
  const [doc,setDoc]=useState(null);

  useEffect(()=>{ fetch(); },[status,type]);
  async function fetch(){
    const params = {}; if (status) params.status = status; if (type) params.type = type;
    const res = await http.get('/api/employee/leaves', { params }); setLeaves(res.data.data);
  }

  async function submit(e){ e.preventDefault();
    try{
      const fd = new FormData();
      fd.append('type', type);
      fd.append('startDate', start);
      fd.append('endDate', end);
      if (reason) fd.append('reason', reason);
      if (doc) fd.append('document', doc);
      await http.post('/api/employee/leaves/apply', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Leave applied'); setStart(''); setEnd(''); setReason(''); setDoc(null); fetch();
    }catch(err){ alert(err?.response?.data?.error || 'Error applying'); }
  }

  const needsDocHint = (type === 'maternity') || (type === 'sick');

  return (<Container>
    <Typography variant="h6" sx={{mb:2}}>My Leaves</Typography>
    <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
      <Select value={status} onChange={e=>setStatus(e.target.value)} displayEmpty>
        <MenuItem value=''>All</MenuItem><MenuItem value='pending'>Pending</MenuItem>
        <MenuItem value='approved'>Approved</MenuItem><MenuItem value='rejected'>Rejected</MenuItem>
      </Select>
      <Select value={type} onChange={e=>setType(e.target.value)}>
        <MenuItem value='casual'>Casual</MenuItem>
        <MenuItem value='sick'>Sick</MenuItem>
        <MenuItem value='maternity'>Maternity</MenuItem>
        <MenuItem value='compOff'>Compensatory</MenuItem>
        <MenuItem value='religious'>Religious</MenuItem>
      </Select>
    </div>
    <List>
      {leaves.map(l=> <ListItem key={l._id}><ListItemText primary={`${new Date(l.startDate).toDateString()} → ${new Date(l.endDate).toDateString()}`} secondary={`${l.type.toUpperCase()} • ${l.status} • ${l.days} days`} /></ListItem>)}
    </List>

    <Typography variant="subtitle1" sx={{mt:2}}>Apply for Leave</Typography>
    <form onSubmit={submit} encType="multipart/form-data" style={{display:'grid', gap:8, maxWidth:420}}>
      <TextField type="date" value={start} onChange={e=>setStart(e.target.value)} required label="Start" InputLabelProps={{shrink:true}}/>
      <TextField type="date" value={end} onChange={e=>setEnd(e.target.value)} required label="End" InputLabelProps={{shrink:true}}/>
      <TextField placeholder="Reason (optional)" value={reason} onChange={e=>setReason(e.target.value)} />
      <div>
        <input type="file" onChange={e=>setDoc(e.target.files?.[0] || null)} />
        {needsDocHint ? <div style={{fontSize:12, opacity:0.7}}>Maternity requires a document. Sick leave over 3 days needs a doctor's note.</div> : null}
      </div>
      <Button type="submit" variant="contained">Apply</Button>
    </form>
  </Container>);
}
