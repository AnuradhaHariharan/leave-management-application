# Backend (Express + MongoDB) — Leave Types & Policies

- JWT auth, bcrypt passwords
- Leave types: casual, sick, maternity, compOff, religious
- Balances on `User.leavesBalance` (defaults: CL=12, SL=12, ML=180, Comp=0, RL=2)
- Documents: required for maternity; sick > 3 business days
- Comp-Off flow: employees submit weekend work request -> HR approves -> increments compOff balance
- Validations: join date, date order, weekends excluded from count, overlap checks, per-type balance checks

## Run
cp .env.example .env
npm install
npm run dev
node seed-hr.js
