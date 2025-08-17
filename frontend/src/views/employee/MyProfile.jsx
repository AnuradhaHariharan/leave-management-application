import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Avatar, Box, Grid, Paper, Divider, Chip, Stack
} from '@mui/material';
import http from '../../api/client';

export default function MyProfile(){
  const [user, setUser] = useState(null);

  useEffect(() => { fetchUser(); }, []);
  async function fetchUser(){
    const res = await http.get('/api/employee/me');
    setUser(res.data.user);
  }

  if (!user) {
    return (
      <Container>
        <Typography sx={{opacity:.7}}>Loading...</Typography>
      </Container>
    );
  }

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  // helpers to compute label values safely
  const lb = user.leavesBalance || {};
  const usage = user.usage || {};
  const available = user.available || {};

  const totalOf = (k) => Number(lb?.[k] ?? 0);
  const usedOf  = (k) => Number(usage?.[k] ?? 0);
  const leftOf  = (k) => {
    const fromApi = available?.[k];
    const left = (fromApi !== undefined && fromApi !== null)
      ? Number(fromApi)
      : totalOf(k) - usedOf(k);
    return Math.max(0, left);
  };

  const StatChip = ({ label, keyName }) => {
    const used = usedOf(keyName);
    const total = totalOf(keyName);
    const left = leftOf(keyName);
    const low = left <= 2; // optional highlight threshold
    return (
      <Chip
        label={`${label} • ${left} left (${used}/${total})`}
        sx={{
          bgcolor: low ? '#fff7ed' : '#f1f5f9',
          color:   low ? '#9a3412' : '#0f172a',
          fontWeight: 600
        }}
      />
    );
  };

  return (
    <Container maxWidth="md">

      <Paper elevation={0} sx={{
        p:3, mb:3, borderRadius:3, border:'1px solid #e5e7eb',
        background:'#ffffff'
      }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
          <Avatar sx={{ width:64, height:64, bgcolor:'#112240' }}>{initials}</Avatar>
          <Box sx={{ flex:1 }}>
            <Typography variant="h6" sx={{ fontWeight:700, color:'#112240' }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography sx={{ color:'#334155' }}>{user.email}</Typography>
          </Box>
        </Box>

        <Divider sx={{ my:2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography sx={{ fontSize:12, textTransform:'uppercase', color:'#64748b' }}>Department</Typography>
            <Typography sx={{ fontWeight:600 }}>{user.department || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography sx={{ fontSize:12, textTransform:'uppercase', color:'#64748b' }}>Joining Date</Typography>
            <Typography sx={{ fontWeight:600 }}>
              {user.joiningDate ? new Date(user.joiningDate).toDateString() : '-'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={0} sx={{
        p:3, borderRadius:3, border:'1px solid #e5e7eb', background:'#ffffff'
      }}>
        <Typography variant="subtitle1" sx={{ mb:2, fontWeight:700, color:'#112240' }}>
          Leave Balances
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <StatChip label="Casual"    keyName="casual" />
          <StatChip label="Sick"      keyName="sick" />
          <StatChip label="Maternity" keyName="maternity" />
          <StatChip label="Comp-Off"  keyName="compOff" />
          <StatChip label="Religious" keyName="religious" />
        </Stack>

        <Typography sx={{ mt:2, fontSize:12, color:'#64748b' }}>
          Weekends are excluded from leave day counts. Balances update after approval.
        </Typography>
      </Paper>
    </Container>
  );
}
