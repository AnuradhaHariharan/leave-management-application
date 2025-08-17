import React, { useState } from 'react';
import http from '../api/client';
import { useNavigate } from 'react-router-dom';
import {
  Container, TextField, Button, Typography, Box, Paper,
  Stack, Divider, CircularProgress, InputAdornment
} from '@mui/material';
import { toast } from 'react-toastify';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function submit(e){
    e.preventDefault();
    if(!email || !password){
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try{
      const res = await http.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      toast.success('Welcome back!');
      nav(res.data.role === 'hr' ? '/hr' : '/employee');
    }catch(err){
      const msg = err?.response?.data?.error || err?.message || 'Error logging in';
      toast.error(msg);
    }finally{
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        // soft gradient background
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)'
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            background: '#ffffff',
            boxShadow: '0 10px 25px rgba(2,6,23,0.06)'
          }}
        >
          <Stack spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 56, height: 56, borderRadius: 2,
                display: 'grid', placeItems: 'center',
                bgcolor: '#112240', color: '#fff',
                fontWeight: 800, letterSpacing: 1
              }}
              aria-label="App logo"
            >
              SO
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Sign in
            </Typography>
            <Typography sx={{ color: '#64748b', fontSize: 14, textAlign: 'center' }}>
              Use your company credentials to continue.
            </Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box component="form" onSubmit={submit}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              autoComplete="username"
              sx={{ mb: 2 }}
            />

            <TextField
              label="Password"
              type={showPw ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              autoComplete="current-password"
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      size="small"
                      onClick={()=>setShowPw(s=>!s)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      sx={{ minWidth: 0, px: 1, textTransform: 'none' }}
                    >
                      {showPw ? 'Hide' : 'Show'}
                    </Button>
                  </InputAdornment>
                )
              }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 1, py: 1.1, fontWeight: 700, textTransform: 'none',
                bgcolor: '#112240', ':hover': { bgcolor: '#0d1a30' }, borderRadius: 2
              }}
              startIcon={loading ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : null}
            >
              {loading ? 'Signing in…' : 'Login'}
            </Button>
          </Box>

          <Typography sx={{ mt: 2, color: '#94a3b8', fontSize: 12, textAlign: 'center' }}>
            Having trouble? Contact <b>HR</b> for access.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
