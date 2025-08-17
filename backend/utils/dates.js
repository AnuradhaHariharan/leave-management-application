
function startOfDay(d){ const x=new Date(d); x.setHours(0,0,0,0); return x; }
function endOfDay(d){ const x=new Date(d); x.setHours(23,59,59,999); return x; }
function isWeekend(d){ const day = new Date(d).getDay(); return day === 0 || day === 6; }
function businessDaysInclusive(start, end){
  const s = startOfDay(start), e = startOfDay(end);
  if (s > e) return 0;
  let count = 0; const d = new Date(s);
  while (d <= e){ const wd = d.getDay(); if (wd !==0 && wd !==6) count++; d.setDate(d.getDate()+1); }
  return count;
}
module.exports = { startOfDay, endOfDay, businessDaysInclusive, isWeekend };
