import React, { useState } from 'react';
import {
  Container, Typography, Box, Paper, Grid, TextField, Button,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material';
import { toast } from 'react-toastify';
import http from '../../api/client';

export default function Onboard(){
  const [first, setFirst]   = useState('');
  const [last, setLast]     = useState('');
  const [dob, setDob]       = useState('');
  const [dept, setDept]     = useState('');
  const [joining, setJoining] = useState('');

  const [loading, setLoading] = useState(false);
  const [credsOpen, setCredsOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');

  async function submit(e){
    e.preventDefault();
    setLoading(true);
    try{
      const res = await http.post('/api/hr/onboard', {
        firstName: first.trim(),
        lastName:  last.trim(),
        dob,
        department: dept.trim(),
        joiningDate: joining
      });

      const { email }    = res.data.user;
      const { password } = res.data;

      setNewEmail(email);
      setNewPass(password);
      setCredsOpen(true);
      toast.success(' Employee onboarded successfully');

      setFirst(''); setLast(''); setDob(''); setDept(''); setJoining('');
    }catch(err){
      const msg = err?.response?.data?.error || err?.message || 'Error onboarding';
      toast.error(`${msg}`);
    } finally {
      setLoading(false);
    }
  }

  function copy(text, label='Copied'){
    navigator.clipboard.writeText(text);
    toast.info(label);
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#112240' }}>
        Onboard Employee
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid #e5e7eb',
          background: '#fff'
        }}
      >
        <Box
          component="form"
          onSubmit={submit}
          sx={{ display: 'grid', gap: 2 }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First name"
                value={first}
                onChange={e => setFirst(e.target.value)}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Last name"
                value={last}
                onChange={e => setLast(e.target.value)}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="DOB"
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Joining Date"
                type="date"
                value={joining}
                onChange={e => setJoining(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Department"
                value={dept}
                onChange={e => setDept(e.target.value)}
                fullWidth
                required
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 1 }} />

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ alignSelf: 'flex-start', bgcolor: '#112240', ':hover': { bgcolor: '#0d1a30' } }}
          >
            {loading ? 'Creating…' : 'Create'}
          </Button>
        </Box>
      </Paper>

      {/* Credentials Dialog */}
      <Dialog open={credsOpen} onClose={()=>setCredsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700, color: '#112240' }}>Employee Credentials</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b' }}>Email</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 600 }}>{newEmail}</Typography>
                <Button size="small" variant="outlined" onClick={()=>copy(newEmail, 'Email copied')}>
                  Copy
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography sx={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b' }}>Temporary Password</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 600 }}>{newPass}</Typography>
                <Button size="small" variant="outlined" onClick={()=>copy(newPass, 'Password copied')}>
                  Copy
                </Button>
              </Stack>
            </Box>

            <Typography sx={{ fontSize: 12, color: '#64748b' }}>
              Share these with the employee securely. They can sign in and change their password later.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setCredsOpen(false)} sx={{ color: '#112240' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
