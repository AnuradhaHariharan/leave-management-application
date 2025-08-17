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

 
<img width="1440" height="900" alt="Screenshot 2025-08-17 at 8 13 33 PM" src="https://github.com/user-attachments/assets/95b4e35e-cc78-4754-a0ce-edf7e3041f82" />

<img width="1440" height="854" alt="Screenshot 2025-08-17 at 8 14 17 PM" src="https://github.com/user-attachments/assets/e010414e-5009-4651-b58f-e78b4edc3347" />

<img width="1439" height="864" alt="Screenshot 2025-08-17 at 8 14 34 PM" src="https://github.com/user-attachments/assets/6e4e6c20-f571-4e20-9040-7bbccd93e17c" />

<img width="1440" height="858" alt="Screenshot 2025-08-17 at 8 14 50 PM" src="https://github.com/user-attachments/assets/63445697-79c4-4311-bc79-3e82c63c7f90" />
<img width="1440" height="900" alt="Screenshot 2025-08-17 at 8 15 19 PM" src="https://github.com/user-attachments/assets/36951db8-f118-4c5d-b3b9-9b2c2a9e9430" />
