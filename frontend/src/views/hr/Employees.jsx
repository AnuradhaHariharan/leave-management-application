import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Container, Typography, Paper, TextField, List, ListItem, ListItemText,
  Chip, Divider, Box, LinearProgress, Stack, Avatar
} from '@mui/material';
import { toast } from 'react-toastify';
import http from '../../api/client';

export default function Employees(){
  const [q, setQ] = useState('');
  const [emps, setEmps] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => { fetchEmployees(); }, []);

  async function fetchEmployees(query = '') {
    try{
      setLoading(true);
      const res = await http.get('/api/hr/employees', { params: { q: query } });
      console.log('Employee API response:', res.data.data);
      setEmps(res.data.data || []);
    }catch(err){
      toast.error('Failed to load employees');
    }finally{
      setLoading(false);
    }
  }

  function onSearchChange(e){
    const val = e.target.value;
    setQ(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchEmployees(val.trim()), 300);
  }

  const StatChip = useMemo(() => ({ label, used=0, total=0 }) => (
    <Chip
      size="small"
      label={`${label} ${used}/${total}`}
      sx={{ bgcolor:'#f1f5f9', color:'#0f172a', fontWeight:600 }}
    />
  ), []);

  return (
    <Container maxWidth="md">
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#112240' }}>
        Employees
      </Typography>

      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: '1px solid #e5e7eb', background: '#fff' }}>
        <TextField
          label="Search by name or email"
          fullWidth
          value={q}
          onChange={onSearchChange}
          placeholder="e.g., ananya@company.local"
        />
      </Paper>

      <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden', background: '#fff' }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <Typography sx={{ fontWeight: 700, color: '#112240' }}>Directory</Typography>
        </Box>

        {loading && <LinearProgress />}

        {!loading && emps.length === 0 && (
          <Box sx={{ p: 3, color: '#64748b' }}>
            No employees found for “{q}”.
          </Box>
        )}

        {!loading && emps.length > 0 && (
          <List sx={{ p: 0 }}>
            {emps.map((e, idx) => {
              const initials = `${e.firstName?.[0] || ''}${e.lastName?.[0] || ''}`.toUpperCase();
              return (
                <React.Fragment key={e._id}>
                  <ListItem sx={{ py: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: '#112240', mr: 1.5 }}>{initials}</Avatar>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {e.firstName} {e.lastName}
                          </Typography>
                          <Typography sx={{ color: '#475569' }}>• {e.email}</Typography>
                          {e.department && <Chip size="small" label={e.department} sx={{ bgcolor:'#eef2ff', color:'#1e293b', fontWeight:600 }} />}
                        </Stack>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                          <StatChip label="CL" used={e.usage?.casual||0} total={e.leavesBalance?.casual||0} />
                          <StatChip label="SL" used={e.usage?.sick||0} total={e.leavesBalance?.sick||0} />
                          <StatChip label="ML" used={e.usage?.maternity||0} total={e.leavesBalance?.maternity||0} />
                          <StatChip label="CO" used={e.usage?.compOff||0} total={e.leavesBalance?.compOff||0} />
                          <StatChip label="RL" used={e.usage?.religious||0} total={e.leavesBalance?.religious||0} />
                        </Stack>
                      }
                    />
                  </ListItem>
                  {idx < emps.length - 1 && <Divider component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Paper>
    </Container>
  );
}
