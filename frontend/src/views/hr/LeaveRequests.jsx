
import React, { useEffect, useState } from 'react';
import { Container, Button, List, ListItem, ListItemText, Typography, Stack, Link as MLink } from '@mui/material';
import http from '../../api/client';

export default function LeaveRequests(){
  const [leaves,setLeaves]=useState([]);
  useEffect(()=>{ fetch(); },[]);
  async function fetch(){ const res = await http.get('/api/hr/leave-requests'); setLeaves(res.data.data); }
  async function act(id, action){ try{
    await http.post('/api/hr/leave-requests/' + id + '/' + action);
    alert('Done'); fetch();
  }catch(err){ alert(err?.response?.data?.error || 'Error'); } }
  return (<Container>
    <Typography variant="h6" sx={{mb:2}}>Pending Leave Requests</Typography>
    <List>{leaves.map(l=> (
      <ListItem key={l._id} secondaryAction={<Stack direction="row" spacing={1}>
        <Button onClick={()=>act(l._id,'approve')} variant="contained">Approve</Button>
        <Button onClick={()=>act(l._id,'reject')} variant="outlined">Reject</Button>
      </Stack>}>
        <ListItemText
          primary={`${l.employee.firstName} ${l.employee.lastName} (${l.employee.email}) — ${l.type.toUpperCase()}`}
          secondary={`${new Date(l.startDate).toDateString()} → ${new Date(l.endDate).toDateString()} • ${l.days} days`}
        />
        {l.documentUrl ? <MLink className="doc-link" href={(import.meta.env.VITE_API_URL || 'http://localhost:4000') + l.documentUrl} target="_blank" rel="noreferrer">View document</MLink> : null}
      </ListItem>
    ))}</List>
  </Container>);
}
