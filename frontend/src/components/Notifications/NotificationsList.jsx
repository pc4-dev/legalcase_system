import { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';

const NI_CLASS = { urgent:'ni-urgent', warn:'ni-warn', info:'ni-info', success:'ni-success' };
const NI_LABEL = { urgent:'Critical & urgent', warn:'Action required', info:'Upcoming dates', success:'Resolved' };

export default function NotificationsList() {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    notificationService.getAll()
      .then((d) => setNotifs(d.notifications || []))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetch(); }, []);

  const handleMarkAll = async () => { await notificationService.markAllRead(); fetch(); };
  const handleResolve = async (id) => {
    await notificationService.resolve(id);
    setNotifs((p) => p.map((n) => n._id === id ? { ...n, isResolved:true, isRead:true } : n));
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this notification?')) return;
    await notificationService.remove(id);
    setNotifs((p) => p.filter((n) => n._id !== id));
  };

  const active   = notifs.filter((n) => !n.isResolved);
  const resolved = notifs.filter((n) => n.isResolved);
  const grouped  = { urgent:[], warn:[], info:[] };
  active.forEach((n) => { (grouped[n.type] || grouped.info).push(n); });

  const renderGroup = (type, items) => {
    if (!items.length) return null;
    return (
      <div key={type} style={{ marginBottom:24 }}>
        <div className="section-heading">{NI_LABEL[type]}</div>
        <div className="notif-list">
          {items.map((n) => (
            <div key={n._id} className={`notif-item ${NI_CLASS[type]}`} style={{ opacity: n.isRead ? 0.82 : 1 }}>
              <i className={`ti ${n.icon || 'ti-bell'}`} />
              <div style={{ flex:1, minWidth:0 }}>
                <div className="notif-body">
                  <strong>{n.title}</strong>
                  <div style={{ marginTop:3 }}>{n.body}</div>
                </div>
                {n.relatedCase && (
                  <div style={{ fontSize:11, color:'var(--ink-50)', marginTop:4 }}>
                    <i className="ti ti-briefcase" style={{ fontSize:11, marginRight:4 }} />
                    {n.relatedCase.caseCode}
                  </div>
                )}
                {n.dueDate && (
                  <div className="notif-time">
                    <i className="ti ti-calendar" style={{ fontSize:11, marginRight:4 }} />
                    {new Date(n.dueDate).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                  </div>
                )}
              </div>
              <div style={{ display:'flex', gap:5, flexShrink:0 }}>
                {!n.isResolved && (
                  <button className="icon-btn" onClick={() => handleResolve(n._id)} title="Mark resolved" style={{ color:'var(--green)' }}>
                    <i className="ti ti-check" />
                  </button>
                )}
                <button className="icon-btn" onClick={() => handleDelete(n._id)} title="Delete" style={{ color:'var(--red)' }}>
                  <i className="ti ti-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="scroll-area">
      <div style={{ maxWidth:720 }}>
        {/* Toolbar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
          <div style={{ fontSize:13, color:'var(--ink-50)' }}>
            {notifs.filter((n) => !n.isRead).length} unread · {notifs.length} total
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleMarkAll}>
            <i className="ti ti-checks" /> Mark all read
          </button>
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:48 }}>
            <div className="spinner-orange" style={{ margin:'0 auto 12px' }} />
            <div style={{ fontSize:13, color:'var(--ink-50)' }}>Loading…</div>
          </div>
        )}

        {!loading && (
          <>
            {renderGroup('urgent', grouped.urgent)}
            {renderGroup('warn',   grouped.warn)}
            {renderGroup('info',   grouped.info)}
            {resolved.length > 0 && renderGroup('success', resolved)}
            {notifs.length === 0 && (
              <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--ink-50)' }}>
                <i className="ti ti-bell-off" style={{ fontSize:40, display:'block', marginBottom:12, color:'var(--orange-mid)' }} />
                No notifications yet
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
