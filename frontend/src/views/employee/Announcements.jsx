import React from 'react';
import {
  Container, Typography, Paper, List, ListItem, ListItemText,
  Chip, Divider, Box
} from '@mui/material';

const data = [
  {
    id: 1,
    title: 'Office closed on Friday (festival)',
    body: 'Please note the office will remain closed this Friday. Happy festivities!',
    date: '2025-08-18',
  },
  {
    id: 2,
    title: 'New leave policy updated',
    body: 'Maternity leave documentation guidelines updated. Check HR policy page.',
    date: '2025-08-12',
  },
];

export default function Announcements(){
  return (
    <Container maxWidth="md">
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#112240' }}>
        Announcements
      </Typography>

      <Paper
        elevation={0}
        sx={{
          border: '1px solid #e5e7eb',
          borderRadius: 3,
          overflow: 'hidden',
          background: '#fff'
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <Typography sx={{ fontWeight: 700, color: '#112240' }}>Latest</Typography>
        </Box>

        <List sx={{ p: 0 }}>
          {data.map((a, idx) => (
            <React.Fragment key={a.id}>
              <ListItem sx={{ alignItems: 'flex-start', py: 2 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {a.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={new Date(a.date).toDateString()}
                        sx={{ bgcolor: '#eef2ff', color: '#1e293b', fontWeight: 600 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography sx={{ color: '#475569' }}>
                      {a.body}
                    </Typography>
                  }
                />
              </ListItem>
              {idx < data.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
}
