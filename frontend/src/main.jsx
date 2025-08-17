
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './views/Login'
import HRDashboard from './views/hr/HRDashboard'
import EmployeeDashboard from './views/employee/EmployeeDashboard'
import CssBaseline from '@mui/material/CssBaseline'
import { ToastContainer } from 'react-toastify';

function App(){
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return (
    <BrowserRouter>
      <CssBaseline />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={ token ? (role === 'hr' ? <Navigate to='/hr'/> : <Navigate to='/employee'/> ) : <Navigate to='/login'/> }/>
        <Route path="/login" element={<Login/>} />
        <Route path="/hr/*" element={<HRDashboard/>} />
        <Route path="/employee/*" element={<EmployeeDashboard/>} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App/>);
