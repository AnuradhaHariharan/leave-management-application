import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, List, ListItem, ListItemText,
  Stack, Button, Chip, Divider, Box, LinearProgress, Link as MLink
} from '@mui/material';
import { toast } from 'react-toastify';
import http from '../../api/client';

export default function LeaveRequests(){
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ fetchReqs(); },[]);

  async function fetchReqs(){
    try{
      setLoading(true);
      const res = await http.get('/api/hr/leave-requests');
      setLeaves(res.data.data || []);
    }catch(e){
      toast.error('Failed to load leave requests');
    }finally{
      setLoading(false);
    }
  }

  async function act(id, action){
    try{
      await http.post(`/api/hr/leave-requests/${id}/${action}`);
      toast.success(`Request ${action}d`);
      fetchReqs();
    }catch(err){
      const msg = err?.response?.data?.error || err?.message || 'Action failed';
      toast.error(`${msg}`);
    }
  }

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  return (
    <Container maxWidth="md">
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#112240' }}>
        Pending Leave Requests
      </Typography>

      <Paper elevation={0} sx={{
        border: '1px solid #e5e7eb',
        borderRadius: 3,
        overflow: 'hidden',
        background: '#fff'
      }}>
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <Typography sx={{ fontWeight: 700, color: '#112240' }}>Review Queue</Typography>
        </Box>

        {loading && <LinearProgress />}

        {!loading && leaves.length === 0 && (
          <Box sx={{ p: 3, color: '#64748b' }}>
            No pending leave requests right now.
          </Box>
        )}

        {!loading && leaves.length > 0 && (
          <List sx={{ p: 0 }}>
            {leaves.map((l, idx) => (
              <React.Fragment key={l._id}>
                <ListItem
                  sx={{ py: 1.5 }}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <Button
                        onClick={()=>act(l._id,'approve')}
                        variant="contained"
                        sx={{ bgcolor: '#112240', ':hover': { bgcolor: '#0d1a30' } }}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={()=>act(l._id,'reject')}
                        variant="outlined"
                        sx={{ borderColor: '#112240', color: '#112240', ':hover': { borderColor: '#0d1a30', color: '#0d1a30' } }}
                      >
                        Reject
                      </Button>
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {l.employee.firstName} {l.employee.lastName}
                        </Typography>
                        <Typography sx={{ color: '#475569' }}>({l.employee.email})</Typography>
                        <Chip label={l.type?.toUpperCase()} size="small" sx={{ bgcolor: '#eef2ff', color: '#1e293b', fontWeight: 600 }} />
                        <Chip label={`${l.days} days`} size="small" sx={{ bgcolor: '#f1f5f9', color: '#0f172a' }} />
                        {l.documentUrl && (
                          <Button
                            size="small"
                            component={MLink}
                            href={`${apiBase}${l.documentUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            sx={{ textTransform: 'none', ml: 0.5 }}
                          >
                            View document
                          </Button>
                        )}
                      </Stack>
                    }
                    secondary={
                      <Typography sx={{ color: '#475569' }}>
                        {new Date(l.startDate).toDateString()} → {new Date(l.endDate).toDateString()}
                        {l.reason ? ` • ${l.reason}` : ''}
                      </Typography>
                    }
                  />
                </ListItem>
                {idx < leaves.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}
