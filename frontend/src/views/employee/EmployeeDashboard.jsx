
import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemText, Toolbar, AppBar, Typography, Button } from '@mui/material';
import MyProfile from './MyProfile';
import MyLeaves from './MyLeaves';
import '../../styles/HRDashboard.css';

export default function EmployeeDashboard(){
  const nav = useNavigate();
  useEffect(()=>{
    if (localStorage.getItem('role') !== 'employee') nav('/login');
  },[]);
  function logout(){ localStorage.removeItem('token'); localStorage.removeItem('role'); nav('/login'); }
  return (<Box className="dashboard-container">
    <AppBar position="fixed" className='navbar'><Toolbar className="toolbar"><Typography variant="h6">Employee Hub</Typography><Button color="inherit" onClick={logout}>Logout</Button></Toolbar></AppBar>
    <Drawer variant="permanent" classes={{ paper: 'sidebar' }}>
      <List>
        <ListItem button component={Link} to="profile" className="menu-item"><ListItemText primary="My Profile"/></ListItem>
        <ListItem button component={Link} to="leaves" className="menu-item"><ListItemText primary="Leaves"/></ListItem>
      </List>
    </Drawer>
    <Box component="main" className="main-content">
      <Routes>
        <Route path="profile" element={<MyProfile/>} />
        <Route path="leaves" element={<MyLeaves/>} />
        <Route path="/" element={<MyProfile/>} />
      </Routes>
    </Box>
  </Box>);
}
