
import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import http from '../../api/client';

export default function Onboard(){
  const [first,setFirst]=useState(''); const [last,setLast]=useState(''); const [dob,setDob]=useState(''); const [dept,setDept]=useState(''); const [joining,setJoining]=useState('');
  async function submit(e){ e.preventDefault();
    try{
      const res = await http.post('/api/hr/onboard', { firstName:first, lastName:last, dob, department:dept, joiningDate:joining });
      alert('Created: ' + res.data.user.email + '\nPassword: ' + res.data.password);
      setFirst(''); setLast(''); setDob(''); setDept(''); setJoining('');
    }catch(err){ alert(err?.response?.data?.error || 'Error'); }
  }
  return (<Container maxWidth="sm">
    <Typography variant="h6">Onboard Employee</Typography>
    <Box component="form" onSubmit={submit} sx={{mt:2}}>
      <TextField label="First name" fullWidth value={first} onChange={e=>setFirst(e.target.value)} sx={{mb:1}}/>
      <TextField label="Last name" fullWidth value={last} onChange={e=>setLast(e.target.value)} sx={{mb:1}}/>
      <TextField label="DOB" type="date" fullWidth value={dob} onChange={e=>setDob(e.target.value)} sx={{mb:1}} InputLabelProps={{ shrink:true }}/>
      <TextField label="Department" fullWidth value={dept} onChange={e=>setDept(e.target.value)} sx={{mb:1}}/>
      <TextField label="Joining Date" type="date" fullWidth value={joining} onChange={e=>setJoining(e.target.value)} sx={{mb:1}} InputLabelProps={{ shrink:true }}/>
      <Button type="submit" variant="contained">Create</Button>
    </Box>
  </Container>);
}
