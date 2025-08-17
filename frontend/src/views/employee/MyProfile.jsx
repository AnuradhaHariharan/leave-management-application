
import React, { useEffect, useState } from 'react';
import { Container, Typography } from '@mui/material';
import http from '../../api/client';

export default function MyProfile(){
  const [user,setUser]=useState(null);
  useEffect(()=>{ fetch(); },[]);
  async function fetch(){ const res = await http.get('/api/employee/me'); setUser(res.data.user); }
  if (!user) return <Container><Typography>Loading...</Typography></Container>;
  return (<Container>
    <Typography variant="h6" sx={{mb:2}}>My Profile</Typography>
    <div><b>Name:</b> {user.firstName} {user.lastName}</div>
    <div><b>Email:</b> {user.email}</div>
    <div><b>Department:</b> {user.department}</div>
    <div><b>Joining:</b> {new Date(user.joiningDate).toDateString()}</div>
    <div><b>Leave balances:</b> CL {user.leavesBalance?.casual ?? 0}, SL {user.leavesBalance?.sick ?? 0}, ML {user.leavesBalance?.maternity ?? 0}, CO {user.leavesBalance?.compOff ?? 0}, RL {user.leavesBalance?.religious ?? 0}</div>
  </Container>);
}
