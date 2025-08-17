# Leave Management System (HR + Employee)

Simple, role-based leave management with a **React + MUI** frontend and **Express + MongoDB (JWT)** backend.

## Features
- **Login & Roles**: HR and Employee (JWT)
- **Leave Types**: Casual, Sick, Maternity (doc), Comp-Off (earned), Religious
- **Validations**: date order, weekends excluded, join-date block, overlap check, balance check
- **Employee**: apply for leave, see history, see balances (used / available)
- **HR**: approve/reject, onboard employees, view directory with usage/available

## Tech
- Frontend: React, React Router, MUI
- Backend: Node.js, Express, Mongoose, Multer, JWT, bcrypt
- DB: MongoDB

---

## Quick Start (Local)

**1) Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run seed:hr     
npm run dev         
```

**2) Frontend**
```bash
cd frontend
cp .env.example .env      
npm install
npm run dev                  
```

## Dev HR login
- **Email:** hr@company.local  
- **Password:** HrPass123!

---

## Deployed Links
- **Frontend:** https://leave-management-application.onrender.com  

 
![alt text](<Screenshot 2025-08-17 at 8.13.33 PM.png>)
![alt text](<Screenshot 2025-08-17 at 8.14.17 PM.png>)
![alt text](<Screenshot 2025-08-17 at 8.14.34 PM.png>)
![alt text](<Screenshot 2025-08-17 at 8.14.50 PM.png>)
![alt text](<Screenshot 2025-08-17 at 8.15.19 PM.png>)