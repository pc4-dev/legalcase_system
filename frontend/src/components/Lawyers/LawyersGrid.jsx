import { useState, useEffect } from 'react';
import { lawyerService } from '../../services/lawyerService';

const COLOR_VARIANTS = ['orange','blue','green','purple','red'];
const COLOR_MAP = {
  orange: { bg: 'var(--orange-light)', text: 'var(--orange)', outline: 'var(--orange)' },
  blue:   { bg: 'var(--blue-light)',   text: 'var(--blue)',   outline: 'var(--blue)' },
  green:  { bg: 'var(--green-light)',  text: 'var(--green)',  outline: 'var(--green)' },
  purple: { bg: '#F0ECFC',             text: '#4A2A9B',       outline: '#4A2A9B' },
  red:    { bg: 'var(--red-light)',    text: 'var(--red)',    outline: 'var(--red)' },
};
const INIT = { name:'', specialisation:'', court:'', phone:'', email:'', chamber:'', colorVariant:'orange', feesYTD:0 };
const fmtCurrency = (n) => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`;

/* Shared input style */
const INP = { width:'100%', padding:'9px 13px', border:'1.5px solid var(--border-md)', borderRadius:'var(--radius-sm)', fontSize:13, color:'var(--ink)', background:'var(--paper)', fontFamily:'var(--font-body)', outline:'none' };
const LBL = { display:'block', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'var(--ink-50)', marginBottom:6 };

function LawyerFields({ form, set }) {
  return (
    <>
      <div style={{ marginBottom:12, gridColumn:'1/-1' }}><label style={LBL}>Full name *</label><input style={INP} type="text" placeholder="Adv. Full Name" value={form.name} onChange={set('name')} /></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        <div><label style={LBL}>Specialisation *</label><input style={INP} type="text" placeholder="Civil & Commercial" value={form.specialisation} onChange={set('specialisation')} /></div>
        <div><label style={LBL}>Court / Forum *</label><input style={INP} type="text" placeholder="District Court, Gwalior" value={form.court} onChange={set('court')} /></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        <div><label style={LBL}>Phone</label><input style={INP} type="text" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={set('phone')} /></div>
        <div><label style={LBL}>Email</label><input style={INP} type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} /></div>
      </div>
      <div style={{ marginBottom:12 }}><label style={LBL}>Chamber address</label><input style={INP} type="text" placeholder="Chamber 14, District Bar" value={form.chamber} onChange={set('chamber')} /></div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        <div><label style={LBL}>Fees YTD (₹)</label><input style={INP} type="number" min="0" placeholder="0" value={form.feesYTD} onChange={set('feesYTD')} /></div>
        <div>
          <label style={LBL}>Card colour</label>
          <div style={{ display:'flex', gap:9, marginTop:8 }}>
            {COLOR_VARIANTS.map((v) => {
              const c = COLOR_MAP[v];
              return (
                <button key={v} title={v} type="button"
                  onClick={() => set('colorVariant')({ target:{ value:v } })}
                  style={{ width:28, height:28, borderRadius:'50%', padding:0, cursor:'pointer', background:c.bg, border:`3px solid ${form.colorVariant===v ? c.outline : 'transparent'}`, outline:`2px solid ${c.outline}`, outlineOffset:2, opacity:form.colorVariant===v ? 1 : 0.4, transition:'all 0.14s' }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

/* Modal shell */
function Modal({ title, subtitle, onClose, onSubmit, loading, error, children, submitLabel='Save', danger=false }) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h3>{title}</h3>
            {subtitle && <div className="modal-sub">{subtitle}</div>}
          </div>
          <button className="icon-btn" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div className="modal-body">
          {error && <div className="error-msg"><i className="ti ti-alert-circle" />{error}</div>}
          {children}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onSubmit} disabled={loading} style={{ minWidth:120, justifyContent:'center' }}>
            {loading ? <><span className="spinner" style={{ marginRight:8 }} />Saving…</> : <><i className={`ti ${danger ? 'ti-trash' : 'ti-check'}`} style={{ marginRight:6 }} />{submitLabel}</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px) scale(0.97);}to{opacity:1;transform:none;}}`}</style>
    </div>
  );
}

function AddModal({ onClose, onAdded }) {
  const [form, setForm] = useState(INIT);
  const [loading, setL] = useState(false);
  const [error, setErr] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!form.name || !form.specialisation || !form.court) return setErr('Name, specialisation and court are required');
    setL(true); setErr('');
    try { const d = await lawyerService.create(form); onAdded(d.lawyer); }
    catch(err) { setErr(err.response?.data?.message || 'Failed to add'); }
    finally { setL(false); }
  };
  return <Modal title="Add new lawyer" onClose={onClose} onSubmit={submit} loading={loading} error={error} submitLabel="Add lawyer"><LawyerFields form={form} set={set} /></Modal>;
}

function EditModal({ lawyer, onClose, onSaved }) {
  const [form, setForm] = useState({ ...INIT, ...lawyer, feesYTD: lawyer.feesYTD || 0 });
  const [loading, setL] = useState(false);
  const [error, setErr] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!form.name || !form.specialisation || !form.court) return setErr('Name, specialisation and court are required');
    setL(true); setErr('');
    try { const d = await lawyerService.update(lawyer._id, form); onSaved(d.lawyer); }
    catch(err) { setErr(err.response?.data?.message || 'Update failed'); }
    finally { setL(false); }
  };
  return <Modal title="Edit Lawyer" subtitle={lawyer.name} onClose={onClose} onSubmit={submit} loading={loading} error={error} submitLabel="Save changes"><LawyerFields form={form} set={set} /></Modal>;
}

function DeleteModal({ lawyer, onClose, onDeleted }) {
  const [loading, setL] = useState(false);
  const submit = async () => {
    setL(true);
    try { await lawyerService.remove(lawyer._id); onDeleted(lawyer._id); }
    catch(err) { alert(err.response?.data?.message || 'Delete failed'); setL(false); }
  };
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:420 }}>
        <div className="modal-body" style={{ padding:'28px 26px' }}>
          <div style={{ width:48, height:48, background:'var(--red-light)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
            <i className="ti ti-trash" style={{ fontSize:24, color:'var(--red)' }} />
          </div>
          <h3 style={{ fontFamily:'var(--font-display)', fontSize:20, marginBottom:10 }}>Remove lawyer?</h3>
          <p style={{ fontSize:13, color:'var(--ink-70)', lineHeight:1.65, marginBottom:22 }}>
            <strong style={{ color:'var(--ink)' }}>{lawyer.name}</strong> will be deactivated and removed from the directory. Their assigned cases will remain intact.
          </p>
          <div style={{ display:'flex', gap:9, justifyContent:'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="btn btn-danger" onClick={submit} disabled={loading} style={{ minWidth:110, justifyContent:'center' }}>
              {loading ? 'Removing…' : <><i className="ti ti-trash" style={{ marginRight:6 }} />Remove</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function LawyersGrid() {
  const [lawyers, setLawyers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [editL, setEditL]       = useState(null);
  const [deleteL, setDeleteL]   = useState(null);
  const [hoverId, setHoverId]   = useState(null);

  useEffect(() => {
    lawyerService.getAll().then((d) => setLawyers(d.lawyers || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, flexDirection:'column', gap:14 }}>
      <div className="spinner-orange" />
      <span style={{ fontSize:13, color:'var(--ink-50)' }}>Loading lawyers…</span>
    </div>
  );

  const handleAdded   = (l) => { setLawyers((p) => [l, ...p]); setShowAdd(false); };
  const handleSaved   = (l) => { setLawyers((p) => p.map((x) => x._id === l._id ? l : x)); setEditL(null); };
  const handleDeleted = (id) => { setLawyers((p) => p.filter((x) => x._id !== id)); setDeleteL(null); };

  return (
    <>
      {/* Toolbar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <div>
          <span style={{ fontSize:13, color:'var(--ink-50)', fontWeight:500 }}>{lawyers.length} active lawyer{lawyers.length!==1?'s':''}</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <i className="ti ti-plus" /> Add lawyer
        </button>
      </div>

      {/* Grid */}
      <div className="lawyer-grid">
        {lawyers.map((l) => {
          const cv  = COLOR_MAP[l.colorVariant] || COLOR_MAP.orange;
          const isH = hoverId === l._id;
          return (
            <div
              key={l._id}
              className="lawyer-card"
              onMouseEnter={() => setHoverId(l._id)}
              onMouseLeave={() => setHoverId(null)}
            >
              {/* Action buttons */}
              <div style={{ position:'absolute', top:14, right:14, display:'flex', gap:6, opacity:isH?1:0, transition:'opacity 0.16s', pointerEvents:isH?'auto':'none' }}>
                <button title="Edit" onClick={() => setEditL(l)}
                  style={{ width:30, height:30, borderRadius:8, border:'1.5px solid var(--border-md)', background:'var(--white)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--orange)', fontSize:15, transition:'all 0.12s' }}
                  onMouseEnter={(e)=>{e.currentTarget.style.background='var(--orange-light)';e.currentTarget.style.borderColor='var(--orange-border)';}}
                  onMouseLeave={(e)=>{e.currentTarget.style.background='var(--white)';e.currentTarget.style.borderColor='var(--border-md)';}}
                ><i className="ti ti-edit" /></button>
                <button title="Remove" onClick={() => setDeleteL(l)}
                  style={{ width:30, height:30, borderRadius:8, border:'1.5px solid var(--border-md)', background:'var(--white)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--red)', fontSize:15, transition:'all 0.12s' }}
                  onMouseEnter={(e)=>{e.currentTarget.style.background='var(--red-light)';e.currentTarget.style.borderColor='rgba(192,57,43,0.25)';}}
                  onMouseLeave={(e)=>{e.currentTarget.style.background='var(--white)';e.currentTarget.style.borderColor='var(--border-md)';}}
                ><i className="ti ti-trash" /></button>
              </div>

              {/* Card content */}
              <div className="lc-top">
                <div className="avatar" style={{ background:cv.bg, color:cv.text }}>
                  {l.initials || l.name.replace(/^Adv\.\s*/i,'').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                </div>
                <div>
                  <div className="lc-name">{l.name}</div>
                  <div className="lc-spec">{l.specialisation}<br/>{l.court}</div>
                </div>
              </div>

              <div className="lc-contact">
                {l.phone   && <span><i className="ti ti-phone"   />{l.phone}</span>}
                {l.email   && <span><i className="ti ti-mail"    />{l.email}</span>}
                {l.chamber && <span><i className="ti ti-map-pin" />{l.chamber}</span>}
              </div>

              <div className="lc-stats">
                <div className="lc-stat">
                  <div className="lc-stat-val" style={{ color:'var(--orange)' }}>{typeof l.activeCases==='number'?l.activeCases:'—'}</div>
                  <div className="lc-stat-lbl">Active</div>
                </div>
                <div className="lc-stat">
                  <div className="lc-stat-val" style={{ color:'var(--green)' }}>{typeof l.closedCases==='number'?l.closedCases:'—'}</div>
                  <div className="lc-stat-lbl">Closed</div>
                </div>
                <div className="lc-stat">
                  <div className="lc-stat-val" style={{ color:'var(--amber)' }}>{fmtCurrency(l.feesYTD||0)}</div>
                  <div className="lc-stat-lbl">Fees YTD</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {lawyers.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--ink-50)' }}>
          <i className="ti ti-user-off" style={{ fontSize:40, display:'block', marginBottom:12, color:'var(--orange-mid)' }} />
          No lawyers added yet.<br/>
          <button className="btn btn-primary" style={{ marginTop:16 }} onClick={() => setShowAdd(true)}>
            <i className="ti ti-plus" /> Add first lawyer
          </button>
        </div>
      )}

      {showAdd   && <AddModal    onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
      {editL     && <EditModal   lawyer={editL}   onClose={() => setEditL(null)}   onSaved={handleSaved} />}
      {deleteL   && <DeleteModal lawyer={deleteL} onClose={() => setDeleteL(null)} onDeleted={handleDeleted} />}
    </>
  );
}
