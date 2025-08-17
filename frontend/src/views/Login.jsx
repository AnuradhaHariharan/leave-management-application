
import React, { useState } from 'react';
import http from '../api/client';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import { toast } from 'react-toastify';

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const nav = useNavigate();
  async function submit(e){
    e.preventDefault();
    try{
      const res = await http.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      nav(res.data.role === 'hr' ? '/hr' : '/employee');
    }catch(err){
      const msg =
      err?.response?.data?.error || err?.message || 'Error Logging in';
    toast.error(`${msg}`);
  }
  }
  return (<Container maxWidth="xs" sx={{mt:6}}>
    <Typography variant="h5">Login</Typography>
    <Box component="form" onSubmit={submit} sx={{mt:2}}>
      <TextField label="Email" fullWidth value={email} onChange={e=>setEmail(e.target.value)} sx={{mb:2}} />
      <TextField label="Password" type="password" fullWidth value={password} onChange={e=>setPassword(e.target.value)} sx={{mb:2}} />
      <Button variant="contained" type="submit">Login</Button>
    </Box>
  </Container>);
}
