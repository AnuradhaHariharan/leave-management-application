
import React, { useEffect, useState } from 'react';
import { Container, TextField, List, ListItem, ListItemText, Typography } from '@mui/material';
import http from '../../api/client';

export default function Employees(){
  const [q,setQ]=useState(''); const [emps,setEmps]=useState([]);
  useEffect(()=>{ fetch(); },[]);
  async function fetch(qs){ const res = await http.get('/api/hr/employees', { params: { q: qs } }); setEmps(res.data.data); }
  return (<Container>
    <Typography variant="h6" sx={{mb:2}}>Employees</Typography>
    <TextField label="Search" fullWidth value={q} onChange={e=> { setQ(e.target.value); fetch(e.target.value); }} sx={{mb:2}} />
    <List>{emps.map(e=> (
      <ListItem key={e._id} button>
        <ListItemText
          primary={`${e.firstName} ${e.lastName} • ${e.email}`}
          secondary={`CL: ${e.usage.casual||0}/${e.leavesBalance.casual||0} • SL: ${e.usage.sick||0}/${e.leavesBalance.sick||0} • ML: ${e.usage.maternity||0}/${e.leavesBalance.maternity||0} • CO: ${e.usage.compOff||0}/${e.leavesBalance.compOff||0} • RL: ${e.usage.religious||0}/${e.leavesBalance.religious||0}`}
        />
      </ListItem>
    ))}</List>
  </Container>);
}
