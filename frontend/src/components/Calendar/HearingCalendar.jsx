import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseService } from '../../services/caseService';

/* ── Helpers ── */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const STATUS_COLOR = {
  urgent:  { bg: '#FEF2F2', text: '#C0392B', dot: '#E53E3E', border: '#FCA5A5' },
  active:  { bg: '#FFF4EC', text: '#C94B10', dot: '#F07B2B', border: '#FDDBC0' },
  pending: { bg: '#FEFCE8', text: '#854D0E', dot: '#CA8A04', border: '#FDE047' },
  closed:  { bg: '#F0FDF4', text: '#166534', dot: '#16A34A', border: '#86EFAC' },
};

const fmtDateKey = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
};

const fmtDateLong = (d) =>
  new Date(d).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

export default function HearingCalendar() {
  const navigate = useNavigate();
  const today    = new Date();

  const [year,     setYear]     = useState(today.getFullYear());
  const [month,    setMonth]    = useState(today.getMonth());
  const [cases,    setCases]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null); // selected date string

  useEffect(() => {
    caseService.getAll({ limit: 100 })
      .then((d) => setCases(d.cases || []))
      .finally(() => setLoading(false));
  }, []);

  /* Build a map: dateKey → [cases] */
  const hearingMap = useMemo(() => {
    const map = {};
    cases.forEach((c) => {
      if (!c.nextHearingDate) return;
      const key = fmtDateKey(c.nextHearingDate);
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [cases]);

  /* Calendar grid */
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMon = new Date(year, month + 1, 0).getDate();
  const daysInPrev= new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++)
    cells.push({ day: daysInPrev - firstDay + 1 + i, curr: false });
  for (let i = 1; i <= daysInMon; i++)
    cells.push({ day: i, curr: true });
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++)
    cells.push({ day: i, curr: false });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };
  const goToday   = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(null); };

  const todayKey = fmtDateKey(today);

  const selectedCases = selected ? (hearingMap[selected] || []) : [];

  /* Upcoming hearings — next 30 days */
  const upcoming = useMemo(() => {
    const now  = new Date(); now.setHours(0,0,0,0);
    const then = new Date(now); then.setDate(then.getDate() + 30);
    return cases
      .filter((c) => c.nextHearingDate && new Date(c.nextHearingDate) >= now && new Date(c.nextHearingDate) <= then)
      .sort((a,b) => new Date(a.nextHearingDate) - new Date(b.nextHearingDate))
      .slice(0, 8);
  }, [cases]);

  /* Count hearings in current month */
  const monthHearings = useMemo(() =>
    Object.entries(hearingMap).filter(([k]) => {
      const d = new Date(k);
      return d.getFullYear() === year && d.getMonth() === month;
    }).reduce((sum, [,v]) => sum + v.length, 0),
  [hearingMap, year, month]);

  return (
    <div className="scroll-area" style={{ padding: 24 }}>
      <style>{`
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #E8E4DF; border-radius: 12px; overflow: hidden; border: 1px solid #E8E4DF; }
        .cal-header-cell { background: #FAFAF9; padding: 10px 4px; text-align: center; font-size: 11px; font-weight: 700; color: #7A736C; text-transform: uppercase; letter-spacing: 0.06em; }
        .cal-cell { background: #fff; min-height: 90px; padding: 6px; cursor: pointer; transition: background 0.12s; position: relative; }
        .cal-cell:hover { background: #FFF8F4; }
        .cal-cell.other-month { background: #FAFAF9; }
        .cal-cell.other-month .cal-day-num { color: #C4BDB6; }
        .cal-cell.today { background: #FFF4EC; }
        .cal-cell.selected { background: #FFF0E5; outline: 2px solid #F07B2B; outline-offset: -2px; }
        .cal-cell.has-hearing { background: #FFFBF5; }
        .cal-day-num { font-size: 13px; font-weight: 500; color: #3D3A36; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin-bottom: 4px; }
        .cal-cell.today .cal-day-num { background: #F07B2B; color: #fff; font-weight: 700; }
        .cal-event { font-size: 10px; font-weight: 500; padding: 2px 6px; border-radius: 4px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; }
        .cal-more { font-size: 10px; color: #9B9590; padding: 1px 4px; }
        @media (max-width: 768px) {
          .cal-layout { flex-direction: column !important; }
          .cal-sidebar { width: 100% !important; }
          .cal-cell { min-height: 60px; }
          .cal-event { display: none; }
          .cal-dot { display: block !important; }
        }
      `}</style>

      {/* Page header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#1C1A18', letterSpacing:-0.3, margin:0 }}>Hearing Calendar</h1>
          <p style={{ color:'#7A736C', fontSize:13, marginTop:4 }}>
            {monthHearings} hearing{monthHearings !== 1 ? 's' : ''} scheduled in {MONTHS[month]} {year}
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={goToday} style={{ padding:'7px 14px', fontSize:12, fontWeight:600, border:'1.5px solid #E8E4DF', borderRadius:8, background:'#fff', cursor:'pointer', color:'#3D3A36' }}>
            Today
          </button>
          <div style={{ display:'flex', border:'1.5px solid #E8E4DF', borderRadius:8, overflow:'hidden' }}>
            <button onClick={prevMonth} style={{ padding:'7px 12px', border:'none', background:'#fff', cursor:'pointer', color:'#7A736C', fontSize:16, borderRight:'1px solid #E8E4DF' }}>‹</button>
            <button onClick={nextMonth} style={{ padding:'7px 12px', border:'none', background:'#fff', cursor:'pointer', color:'#7A736C', fontSize:16 }}>›</button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="cal-layout" style={{ display:'flex', gap:18, alignItems:'flex-start' }}>

        {/* Calendar */}
        <div style={{ flex:1, minWidth:0 }}>
          {/* Month/Year label */}
          <div style={{ textAlign:'center', marginBottom:12 }}>
            <span style={{ fontSize:18, fontWeight:700, color:'#1C1A18' }}>{MONTHS[month]}</span>
            <span style={{ fontSize:18, fontWeight:300, color:'#9B9590', marginLeft:8 }}>{year}</span>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:60, color:'#9B9590' }}>
              <div style={{ width:28, height:28, border:'2.5px solid #FDDBC0', borderTopColor:'#F07B2B', borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 12px' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
              Loading hearings…
            </div>
          ) : (
            <div className="cal-grid">
              {DAYS.map((d) => <div key={d} className="cal-header-cell">{d}</div>)}
              {cells.map((cell, idx) => {
                const dateKey = cell.curr
                  ? `${year}-${String(month+1).padStart(2,'0')}-${String(cell.day).padStart(2,'0')}`
                  : null;
                const hearings = dateKey ? (hearingMap[dateKey] || []) : [];
                const isToday  = dateKey === todayKey;
                const isSel    = dateKey === selected;

                let cls = 'cal-cell';
                if (!cell.curr)       cls += ' other-month';
                if (isToday)          cls += ' today';
                if (isSel)            cls += ' selected';
                if (hearings.length)  cls += ' has-hearing';

                return (
                  <div key={idx} className={cls} onClick={() => cell.curr && setSelected(dateKey === selected ? null : dateKey)}>
                    <div className="cal-day-num">{cell.day}</div>

                    {/* Dots on mobile */}
                    {hearings.length > 0 && (
                      <div className="cal-dot" style={{ display:'none', gap:2, flexWrap:'wrap' }}>
                        {hearings.slice(0,3).map((c,i) => (
                          <span key={i} style={{ width:6, height:6, borderRadius:'50%', background: STATUS_COLOR[c.status]?.dot || '#F07B2B', display:'inline-block' }} />
                        ))}
                      </div>
                    )}

                    {/* Events on desktop */}
                    {hearings.slice(0, 2).map((c, i) => {
                      const sc = STATUS_COLOR[c.status] || STATUS_COLOR.active;
                      return (
                        <div key={i} className="cal-event"
                          style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                          onClick={(e) => { e.stopPropagation(); navigate(`/cases/${c._id}`); }}
                          title={c.title}
                        >
                          {c.title.length > 20 ? c.title.slice(0,20) + '…' : c.title}
                        </div>
                      );
                    })}
                    {hearings.length > 2 && (
                      <div className="cal-more">+{hearings.length - 2} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Legend */}
          <div style={{ display:'flex', gap:14, marginTop:14, flexWrap:'wrap' }}>
            {Object.entries(STATUS_COLOR).map(([status, sc]) => (
              <span key={status} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#7A736C' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:sc.dot, display:'inline-block' }} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="cal-sidebar" style={{ width:280, flexShrink:0 }}>

          {/* Selected date panel */}
          {selected && (
            <div style={{ background:'#fff', border:'1.5px solid #E8E4DF', borderRadius:12, padding:16, marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#9B9590', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>
                {fmtDateLong(selected + 'T00:00:00')}
              </div>
              {selectedCases.length === 0 ? (
                <div style={{ textAlign:'center', padding:'16px 0', color:'#C4BDB6', fontSize:13 }}>
                  <i className="ti ti-calendar-off" style={{ fontSize:28, display:'block', marginBottom:6 }} />
                  No hearings on this date
                </div>
              ) : selectedCases.map((c) => {
                const sc = STATUS_COLOR[c.status] || STATUS_COLOR.active;
                return (
                  <div key={c._id}
                    onClick={() => navigate(`/cases/${c._id}`)}
                    style={{ background:sc.bg, border:`1.5px solid ${sc.border}`, borderRadius:9, padding:'10px 12px', marginBottom:8, cursor:'pointer', transition:'transform 0.12s' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(3px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                  >
                    <div style={{ fontSize:10, fontFamily:'monospace', color:sc.text, fontWeight:700, marginBottom:3 }}>{c.caseCode}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#1C1A18', marginBottom:4, lineHeight:1.4 }}>{c.title}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                      <span style={{ fontSize:10, background:'rgba(0,0,0,0.06)', color:'#4A4540', padding:'1px 7px', borderRadius:20, fontWeight:500 }}>
                        {c.status}
                      </span>
                      <span style={{ fontSize:11, color:'#7A736C' }}>{c.court?.split(',')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upcoming hearings */}
          <div style={{ background:'#fff', border:'1.5px solid #E8E4DF', borderRadius:12, padding:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#9B9590', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 }}>
              Upcoming hearings — next 30 days
            </div>

            {upcoming.length === 0 && !loading && (
              <div style={{ textAlign:'center', padding:'16px 0', color:'#C4BDB6', fontSize:13 }}>
                No upcoming hearings
              </div>
            )}

            {upcoming.map((c) => {
              const sc  = STATUS_COLOR[c.status] || STATUS_COLOR.active;
              const dt  = new Date(c.nextHearingDate);
              const key = fmtDateKey(c.nextHearingDate);
              const isUrgent = c.status === 'urgent';
              const daysLeft = Math.ceil((dt - new Date()) / (1000*60*60*24));

              return (
                <div key={c._id}
                  style={{ display:'flex', gap:10, padding:'10px 0', borderBottom:'1px solid #F2EDE8', cursor:'pointer' }}
                  onClick={() => {
                    setYear(dt.getFullYear());
                    setMonth(dt.getMonth());
                    setSelected(key);
                    navigate(`/cases/${c._id}`);
                  }}
                >
                  {/* Date box */}
                  <div style={{ width:40, flexShrink:0, textAlign:'center', background: isUrgent ? '#FEF2F2' : '#FFF4EC', borderRadius:8, padding:'4px 0', border:`1px solid ${sc.border}` }}>
                    <div style={{ fontSize:16, fontWeight:800, color:sc.text, lineHeight:1 }}>{dt.getDate()}</div>
                    <div style={{ fontSize:9, color:sc.text, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em' }}>{MONTHS[dt.getMonth()].slice(0,3)}</div>
                  </div>

                  {/* Case info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:'#1C1A18', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize:11, color:'#9B9590' }}>{c.court?.split(',')[0]}</div>
                  </div>

                  {/* Days left */}
                  <div style={{ flexShrink:0, textAlign:'right' }}>
                    <div style={{ fontSize:11, fontWeight:700, color: daysLeft <= 3 ? '#C0392B' : daysLeft <= 7 ? '#CA8A04' : '#7A736C' }}>
                      {daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 day' : `${daysLeft}d`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
            {[
              { label:'This month', val: monthHearings, color:'#F07B2B' },
              { label:'Urgent',     val: cases.filter(c=>c.status==='urgent').length, color:'#C0392B' },
              { label:'Active',     val: cases.filter(c=>c.status==='active').length, color:'#F07B2B' },
              { label:'Total cases',val: cases.length, color:'#3D3A36' },
            ].map((s) => (
              <div key={s.label} style={{ background:'#fff', border:'1.5px solid #E8E4DF', borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:11, color:'#9B9590', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
