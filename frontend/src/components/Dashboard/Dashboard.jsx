import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { caseService } from '../../services/caseService';
import { notificationService } from '../../services/notificationService';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'TBA';

export default function Dashboard() {
  const navigate      = useNavigate();
  const [stats, setStats]     = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [alerts, setAlerts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([caseService.getStats(), notificationService.getAll({ isResolved: false })])
      .then(([caseData, notifData]) => {
        setStats(caseData.stats);
        setUpcoming(caseData.upcoming || []);
        setAlerts((notifData.notifications || []).slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 14 }}>
      <div className="spinner-orange" />
      <span style={{ fontSize: 13, color: 'var(--ink-50)' }}>Loading dashboard…</span>
    </div>
  );

  const niClass = { urgent: 'ni-urgent', warn: 'ni-warn', info: 'ni-info', success: 'ni-success' };

  const KPI_CARDS = [
    { icon: 'ti-briefcase',    cls: 'orange', val: stats?.total      ?? 0, label: 'Total matters',    sub: 'All entities' },
    { icon: 'ti-alarm',        cls: 'red',    val: stats?.urgent     ?? 0, label: 'Urgent hearings',  sub: 'Need attention', valColor: 'var(--red)' },
    { icon: 'ti-activity',     cls: 'orange', val: stats?.active     ?? 0, label: 'Active cases',     sub: 'In progress',    valColor: 'var(--orange)' },
    { icon: 'ti-file-alert',   cls: 'amber',  val: stats?.pendingDocs ?? 0, label: 'Pending docs',    sub: 'To be filed',    valColor: 'var(--amber)' },
    { icon: 'ti-circle-check', cls: 'green',  val: stats?.closed     ?? 0, label: 'Closed / decree',  sub: 'FY 2025–26',     valColor: 'var(--green)' },
  ];

  return (
    <div className="scroll-area">

      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg, var(--orange) 0%, var(--orange-hover) 100%)', borderRadius: 'var(--radius-lg)', padding: '22px 28px', marginBottom: 22, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, boxShadow: 'var(--shadow-o)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', pointerEvents: 'none' }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.75, marginBottom: 5 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.2 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, Rahul
          </div>
          <div style={{ fontSize: 13, opacity: 0.80, marginTop: 4 }}>
            You have <strong>{stats?.urgent ?? 0} urgent</strong> {stats?.urgent === 1 ? 'matter' : 'matters'} requiring attention
          </div>
        </div>
        <i className="ti ti-gavel" style={{ fontSize: 52, opacity: 0.14, flexShrink: 0 }} />
      </div>

      {/* KPI Cards */}
      <div className="metrics-row">
        {KPI_CARDS.map((k) => (
          <div key={k.label} className="metric-card">
            <div className={`mc-icon ${k.cls}`}><i className={`ti ${k.icon}`} /></div>
            <div className="mc-val" style={k.valColor ? { color: k.valColor } : {}}>{k.val}</div>
            <div className="mc-label">{k.label}</div>
            <div className="mc-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>

        {/* Upcoming hearings */}
        <div>
          <div className="section-heading">Upcoming hearings</div>
          <div className="table-wrap">
            <table className="case-table" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: 110 }}>Case no.</th>
                  <th>Matter</th>
                  <th style={{ width: 90 }}>Court</th>
                  <th style={{ width: 82 }}>Next date</th>
                  <th style={{ width: 82 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '28px 14px', textAlign: 'center', color: 'var(--ink-50)' }}>
                      <i className="ti ti-calendar-off" style={{ display: 'block', fontSize: 28, marginBottom: 6, color: 'var(--orange-mid)' }} />
                      No upcoming hearings in the next 30 days
                    </td>
                  </tr>
                )}
                {upcoming.map((c) => (
                  <tr key={c._id} onClick={() => navigate(`/cases/${c._id}`)}>
                    <td className="td-case-no">{c.caseCode}</td>
                    <td className="td-title">
                      <span className="title-main">{c.title.length > 38 ? c.title.slice(0, 38) + '…' : c.title}</span>
                      <span className="title-sub">{c.entity}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--ink-50)' }}>{c.court?.split(',')[0]}</td>
                    <td style={{ fontSize: 12.5, fontWeight: 700, color: c.status === 'urgent' ? 'var(--red)' : 'var(--orange)' }}>
                      {fmtDate(c.nextHearingDate)}
                    </td>
                    <td><span className={`status-dot sd-${c.status}`}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 18 }}>
            {[
              { label: 'Matters this month', val: stats?.active ?? 0, icon: 'ti-trending-up', color: 'var(--orange)' },
              { label: 'Pending documents', val: stats?.pendingDocs ?? 0, icon: 'ti-file-alert', color: 'var(--amber)' },
              { label: 'Cases closed YTD', val: stats?.closed ?? 0, icon: 'ti-circle-check', color: 'var(--green)' },
            ].map((s) => (
              <div key={s.label} style={{ background: 'var(--white)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--orange-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`ti ${s.icon}`} style={{ fontSize: 18, color: s.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-50)', marginTop: 1 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts sidebar */}
        <div>
          <div className="section-heading">Alerts & reminders</div>
          <div className="notif-list">
            {alerts.length === 0 && (
              <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--ink-50)', fontSize: 13 }}>
                <i className="ti ti-check" style={{ display: 'block', fontSize: 28, color: 'var(--green)', marginBottom: 6 }} />
                All clear — no pending alerts
              </div>
            )}
            {alerts.map((n) => (
              <div key={n._id} className={`notif-item ${niClass[n.type] || 'ni-info'}`} style={{ cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
                <i className={`ti ${n.icon || 'ti-bell'}`} />
                <div>
                  <div className="notif-body">
                    <strong>{n.title}</strong>
                    <div style={{ marginTop: 2 }}>{n.body.slice(0, 70)}{n.body.length > 70 ? '…' : ''}</div>
                  </div>
                  {n.dueDate && (
                    <div className="notif-time">
                      <i className="ti ti-calendar" style={{ fontSize: 11, marginRight: 4 }} />
                      {new Date(n.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {alerts.length > 0 && (
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={() => navigate('/notifications')}>
                View all notifications <i className="ti ti-arrow-right" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
