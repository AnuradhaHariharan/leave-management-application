// frontend/src/views/employee/Payslips.jsx
import React, { useMemo, useState } from 'react';
import {
  Container, Typography, Paper, Table, TableHead, TableRow, TableCell,
  TableBody, Button, TableContainer, Toolbar, Box, FormControl, InputLabel,
  Select, MenuItem, Chip
} from '@mui/material';
import { toast } from 'react-toastify';

export default function Payslips(){
  const [year, setYear] = useState('2025');

  // Static demo data; replace with API later.
  const allSlips = useMemo(() => ([
    { id: '2025-07', month: 'July 2025', year: '2025', net: '₹92,000', url: null },
    { id: '2025-06', month: 'June 2025', year: '2025', net: '₹91,500', url: null },
    { id: '2024-12', month: 'December 2024', year: '2024', net: '₹90,200', url: null },
  ]), []);

  const slips = useMemo(
    () => allSlips.filter(s => !year || s.year === year),
    [allSlips, year]
  );

  function downloadSlip(slip){
    if (!slip.url) {
      toast.info('Payslip downloads are not configured yet.');
      return;
    }
    window.open(slip.url, '_blank', 'noopener,noreferrer');
  }

  function downloadAll(){
    toast.info('Bulk download not configured yet.');
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#112240' }}>
        Payslips
      </Typography>

      <Paper elevation={0} sx={{ mb: 2, borderRadius: 3, border: '1px solid #e5e7eb', overflow: 'hidden', background: '#fff' }}>
        <Toolbar sx={{ gap: 2, borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
          <Box sx={{ flex: 1, fontWeight: 700, color: '#112240' }}>My Payslips</Box>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Year</InputLabel>
            <Select value={year} label="Year" onChange={(e)=>setYear(e.target.value)}>
              <MenuItem value="2025">2025</MenuItem>
              <MenuItem value="2024">2024</MenuItem>
              <MenuItem value="">All</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            onClick={downloadAll}
            sx={{ bgcolor: '#112240', ':hover': { bgcolor: '#0d1a30' } }}
          >
            Download All
          </Button>
        </Toolbar>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell>Net Pay</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {slips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" style={{ padding: 24, color: '#64748b' }}>
                    No payslips for the selected year.
                  </TableCell>
                </TableRow>
              )}

              {slips.map(s => (
                <TableRow key={s.id} hover>
                  <TableCell>{s.month}</TableCell>
                  <TableCell>{s.net}</TableCell>
                  <TableCell>
                    <Chip
                      label={s.url ? 'Available' : 'Not Available'}
                      size="small"
                      color={s.url ? 'success' : 'warning'}
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      onClick={() => downloadSlip(s)}
                      sx={{ borderColor: '#112240', color: '#112240', ':hover': { borderColor: '#0d1a30' } }}
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
}
