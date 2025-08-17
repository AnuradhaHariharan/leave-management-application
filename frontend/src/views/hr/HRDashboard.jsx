
import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemText, Toolbar, AppBar, Typography, Button } from '@mui/material';
import Onboard from './Onboard';
import LeaveRequests from './LeaveRequests';
import Employees from './Employees';
import '../../styles/HRDashboard.css';

export default function HRDashboard(){
  const nav = useNavigate();
  useEffect(()=>{
    if (localStorage.getItem('role') !== 'hr') nav('/login');
  },[]);
  function logout(){ localStorage.removeItem('token'); localStorage.removeItem('role'); nav('/login'); }
  return (<Box className="dashboard-container">
    <AppBar position="fixed" className='navbar'><Toolbar className="toolbar"><Typography variant="h6">People Hub</Typography><Button color="inherit" onClick={logout}>Logout</Button></Toolbar></AppBar>
    <Drawer variant="permanent" classes={{ paper: 'sidebar' }}>
      <List>
        <ListItem button component={Link} to="onboard" className="menu-item"><ListItemText primary="Onboard Employee"/></ListItem>
        <ListItem button component={Link} to="leave-requests" className="menu-item"><ListItemText primary="Leave Requests"/></ListItem>
        <ListItem button component={Link} to="employees" className="menu-item"><ListItemText primary="Employee Details"/></ListItem>
      </List>
    </Drawer>
    <Box component="main" className="main-content">
      <Routes>
        <Route path="onboard" element={<Onboard/>} />
        <Route path="leave-requests" element={<LeaveRequests/>} />
        <Route path="employees" element={<Employees/>} />
        <Route path="/" element={<Onboard/>} />
      </Routes>
    </Box>
  </Box>);
}
