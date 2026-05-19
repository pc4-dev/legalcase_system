import { useState, useEffect } from 'react';
import { entityService } from '../services/entityService';

const COLOR_MAP = {
  orange: { bg: '#FFF4EC', text: '#C94B10', dot: '#F07B2B' },
  blue:   { bg: '#EFF6FF', text: '#1E40AF', dot: '#2563EB' },
  green:  { bg: '#F0FDF4', text: '#166534', dot: '#16A34A' },
  purple: { bg: '#F5F3FF', text: '#5B21B6', dot: '#7C3AED' },
  red:    { bg: '#FEF2F2', text: '#991B1B', dot: '#DC2626' },
  teal:   { bg: '#F0FDFA', text: '#0F5550', dot: '#0F766E' },
};

const TYPES = ['Private Limited','LLP','Partnership','Proprietorship','Trust','Other'];
const COLORS = ['orange','blue','green','purple','red','teal'];

const INIT = { name:'', shortName:'', type:'Private Limited', registrationNo:'', address:'', contactPerson:'', contactPhone:'', contactEmail:'', description:'', colorVariant:'orange' };

/* ── Input/Label shared styles ── */
const inp = { width:'100%', padding:'9px 12px', border:'1.5px solid #E8E4DF', borderRadius:8, fontSize:13, color:'#1C1A18', background:'#FAFAF9', fontFamily:'inherit', outline:'none', transition:'border-color 0.13s' };
const lbl = { display:'block', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'#7A736C', marginBottom:5 };

/* ── Modal shell ── */
function Modal({ title, onClose, onSave, loading, error, children }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(28,26,24,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(3px)', padding:16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:16, border:'1px solid #E8E4DF', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', animation:'eModalIn 0.2s ease' }}>
        <div style={{ padding:'20px 24px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, fontWeight:400 }}>{title}</h3>
          <button onClick={onClose} style={{ background:'none', border:'1.5px solid #E8E4DF', borderRadius:7, width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#7A736C', fontSize:16 }}><i className="ti ti-x" /></button>
        </div>
        <div style={{ padding:'16px 24px' }}>
          {error && <div style={{ background:'#FEF2F2', border:'1px solid rgba(220,38,38,0.18)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#C0392B', marginBottom:14, display:'flex', gap:8 }}><i className="ti ti-alert-circle" />{error}</div>}
          {children}
        </div>
        <div style={{ padding:'0 24px 20px', display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} disabled={loading} style={{ padding:'9px 16px', background:'transparent', border:'1.5px solid #E8E4DF', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', color:'#7A736C', fontFamily:'inherit' }}>Cancel</button>
          <button onClick={onSave} disabled={loading} style={{ padding:'9px 18px', background:'#F07B2B', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', color:'#fff', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, boxShadow:'0 2px 8px rgba(240,123,43,0.25)' }}>
            {loading ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'eSpin 0.7s linear infinite', display:'inline-block', marginRight:6 }} />Saving…</> : <><i className="ti ti-check" />Save entity</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes eModalIn{from{opacity:0;transform:translateY(14px) scale(0.98);}to{opacity:1;transform:none;}}@keyframes eSpin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

/* ── Entity form fields ── */
function EntityFields({ form, setForm }) {
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <>
      <div style={{ marginBottom:12 }}>
        <label style={lbl}>Entity Name *</label>
        <input style={inp} type="text" placeholder="e.g. Neoteric Properties Pvt. Ltd." value={form.name} onChange={set('name')}
          onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='#E8E4DF'} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        <div>
          <label style={lbl}>Short Name</label>
          <input style={inp} type="text" placeholder="Neoteric Properties" value={form.shortName} onChange={set('shortName')}
            onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='#E8E4DF'} />
        </div>
        <div>
          <label style={lbl}>Type</label>
          <select style={inp} value={form.type} onChange={set('type')}
            onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='#E8E4DF'}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        <div>
          <label style={lbl}>Registration No.</label>
          <input style={inp} type="text" placeholder="CIN / Reg No." value={form.registrationNo} onChange={set('registrationNo')}
            onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='#E8E4DF'} />
        </div>
        <div>
          <label style={lbl}>Contact Person</label>
          <input style={inp} type="text" placeholder="Full name" value={form.contactPerson} onChange={set('contactPerson')}
            onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='#E8E4DF'} />
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
        <div>
          <label style={lbl}>Phone</label>
          <input style={inp} type="text" placeholder="+91 XXXXX XXXXX" value={form.contactPhone} onChange={set('contactPhone')}
            onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='#E8E4DF'} />
        </div>
        <div>
          <label style={lbl}>Email</label>
          <input style={inp} type="email" placeholder="email@entity.com" value={form.contactEmail} onChange={set('contactEmail')}
            onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='#E8E4DF'} />
        </div>
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={lbl}>Address</label>
        <input style={inp} type="text" placeholder="City, State" value={form.address} onChange={set('address')}
          onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='#E8E4DF'} />
      </div>
      <div style={{ marginBottom:12 }}>
        <label style={lbl}>Description / Notes</label>
        <textarea style={{ ...inp, resize:'vertical' }} rows={2} placeholder="Optional notes about this entity" value={form.description} onChange={set('description')}
          onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='#E8E4DF'} />
      </div>
      <div style={{ marginBottom:4 }}>
        <label style={lbl}>Card Colour</label>
        <div style={{ display:'flex', gap:10, marginTop:8 }}>
          {COLORS.map((c) => {
            const cm = COLOR_MAP[c];
            return (
              <button key={c} type="button" title={c}
                onClick={() => setForm((f) => ({ ...f, colorVariant: c }))}
                style={{ width:32, height:32, borderRadius:'50%', background:cm.bg, border: form.colorVariant===c ? `3px solid ${cm.dot}` : '2px solid #E8E4DF', outline: form.colorVariant===c ? `2px solid ${cm.dot}` : 'none', outlineOffset:2, cursor:'pointer', transition:'all 0.13s' }}>
                <span style={{ width:14, height:14, borderRadius:'50%', background:cm.dot, display:'block', margin:'auto' }} />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function EntityPage() {
  const [entities,  setEntities]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showAdd,   setShowAdd]   = useState(false);
  const [editEnt,   setEditEnt]   = useState(null);
  const [deleteEnt, setDeleteEnt] = useState(null);
  const [form,      setForm]      = useState(INIT);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');
  const [hoverId,   setHoverId]   = useState(null);

  useEffect(() => { fetchEntities(); }, []);

  const fetchEntities = () => {
    setLoading(true);
    entityService.getAll()
      .then((d) => setEntities(d.entities || []))
      .finally(() => setLoading(false));
  };

  const openAdd = () => { setForm(INIT); setError(''); setShowAdd(true); };
  const openEdit = (e) => {
    setForm({ name:e.name, shortName:e.shortName||'', type:e.type, registrationNo:e.registrationNo||'', address:e.address||'', contactPerson:e.contactPerson||'', contactPhone:e.contactPhone||'', contactEmail:e.contactEmail||'', description:e.description||'', colorVariant:e.colorVariant||'orange' });
    setError(''); setEditEnt(e);
  };

  const handleSaveAdd = async () => {
    if (!form.name) return setError('Entity name is required');
    setSaving(true); setError('');
    try {
      const d = await entityService.create(form);
      setEntities((prev) => [d.entity, ...prev]);
      setShowAdd(false);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create'); }
    finally { setSaving(false); }
  };

  const handleSaveEdit = async () => {
    if (!form.name) return setError('Entity name is required');
    setSaving(true); setError('');
    try {
      const d = await entityService.update(editEnt._id, form);
      setEntities((prev) => prev.map((e) => e._id === d.entity._id ? d.entity : e));
      setEditEnt(null);
    } catch (err) { setError(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await entityService.remove(deleteEnt._id);
      setEntities((prev) => prev.filter((e) => e._id !== deleteEnt._id));
      setDeleteEnt(null);
    } catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="scroll-area">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, flexWrap:'wrap', gap:10 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:'#1C1A18', letterSpacing:-0.3, margin:0 }}>Entities</h1>
          <p style={{ color:'#7A736C', fontSize:13, marginTop:4 }}>{entities.length} registered entit{entities.length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button onClick={openAdd} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', background:'#F07B2B', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 2px 8px rgba(240,123,43,0.25)', fontFamily:'inherit' }}>
          <i className="ti ti-plus" />Add entity
        </button>
      </div>

      {/* Info banner */}
      <div style={{ background:'#FFF4EC', border:'1.5px solid #FDDBC0', borderRadius:10, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'flex-start', gap:10, fontSize:13, color:'#C94B10', lineHeight:1.6 }}>
        <i className="ti ti-info-circle" style={{ fontSize:18, flexShrink:0, marginTop:1 }} />
        <span>Entities added here will automatically appear in the <strong>Add New Case</strong> form and the <strong>Public Case Submission</strong> form dropdowns.</span>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign:'center', padding:60, color:'#9B9590' }}>
          <div style={{ width:28, height:28, border:'2.5px solid #FDDBC0', borderTopColor:'#F07B2B', borderRadius:'50%', animation:'eSpin 0.7s linear infinite', margin:'0 auto 12px' }} />
          <style>{`@keyframes eSpin{to{transform:rotate(360deg);}}`}</style>
          Loading entities…
        </div>
      )}

      {/* Entity grid */}
      {!loading && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14 }}>
          {entities.map((e) => {
            const cm = COLOR_MAP[e.colorVariant] || COLOR_MAP.orange;
            const isH = hoverId === e._id;
            return (
              <div key={e._id}
                style={{ background:'#fff', border:'1.5px solid #E8E4DF', borderRadius:14, padding:20, position:'relative', overflow:'hidden', transition:'all 0.18s', boxShadow: isH ? '0 4px 18px rgba(240,123,43,0.12)' : 'none', borderColor: isH ? '#FDDBC0' : '#E8E4DF', transform: isH ? 'translateY(-2px)' : 'none' }}
                onMouseEnter={() => setHoverId(e._id)}
                onMouseLeave={() => setHoverId(null)}
              >
                {/* Top accent bar */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:cm.dot, opacity: isH ? 1 : 0, transition:'opacity 0.18s' }} />

                {/* Action buttons */}
                <div style={{ position:'absolute', top:14, right:14, display:'flex', gap:6, opacity: isH ? 1 : 0, transition:'opacity 0.15s', pointerEvents: isH ? 'auto' : 'none' }}>
                  <button title="Edit" onClick={() => openEdit(e)}
                    style={{ width:28, height:28, borderRadius:7, border:'1.5px solid #E8E4DF', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#F07B2B', fontSize:14, transition:'all 0.12s' }}
                    onMouseEnter={(b)=>b.currentTarget.style.background='#FFF4EC'}
                    onMouseLeave={(b)=>b.currentTarget.style.background='#fff'}>
                    <i className="ti ti-edit" />
                  </button>
                  <button title="Remove" onClick={() => setDeleteEnt(e)}
                    style={{ width:28, height:28, borderRadius:7, border:'1.5px solid #E8E4DF', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#DC2626', fontSize:14, transition:'all 0.12s' }}
                    onMouseEnter={(b)=>b.currentTarget.style.background='#FEF2F2'}
                    onMouseLeave={(b)=>b.currentTarget.style.background='#fff'}>
                    <i className="ti ti-trash" />
                  </button>
                </div>

                {/* Content */}
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14, paddingRight:70 }}>
                  <div style={{ width:46, height:46, borderRadius:12, background:cm.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:cm.dot, flexShrink:0, fontFamily:"'DM Serif Display',serif" }}>
                    {(e.shortName || e.name).split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#1C1A18', lineHeight:1.3 }}>{e.name}</div>
                    <div style={{ fontSize:11, color:cm.text, background:cm.bg, padding:'2px 8px', borderRadius:20, marginTop:4, display:'inline-block', fontWeight:600 }}>{e.type}</div>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {e.registrationNo && <div style={{ fontSize:12, color:'#9B9590', display:'flex', gap:6 }}><i className="ti ti-building" style={{ fontSize:13, color:'#C4BDB6', flexShrink:0 }} />{e.registrationNo}</div>}
                  {e.contactPerson  && <div style={{ fontSize:12, color:'#7A736C', display:'flex', gap:6 }}><i className="ti ti-user" style={{ fontSize:13, color:'#C4BDB6', flexShrink:0 }} />{e.contactPerson}</div>}
                  {e.contactPhone   && <div style={{ fontSize:12, color:'#7A736C', display:'flex', gap:6 }}><i className="ti ti-phone" style={{ fontSize:13, color:'#C4BDB6', flexShrink:0 }} />{e.contactPhone}</div>}
                  {e.contactEmail   && <div style={{ fontSize:12, color:'#7A736C', display:'flex', gap:6, overflow:'hidden' }}><i className="ti ti-mail" style={{ fontSize:13, color:'#C4BDB6', flexShrink:0 }} /><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.contactEmail}</span></div>}
                  {e.address        && <div style={{ fontSize:12, color:'#9B9590', display:'flex', gap:6 }}><i className="ti ti-map-pin" style={{ fontSize:13, color:'#C4BDB6', flexShrink:0 }} />{e.address}</div>}
                </div>

                {e.description && (
                  <div style={{ marginTop:10, fontSize:12, color:'#9B9590', fontStyle:'italic', lineHeight:1.5, borderTop:'1px solid #F0EDE8', paddingTop:8 }}>
                    {e.description}
                  </div>
                )}
              </div>
            );
          })}

          {/* Add new entity card */}
          <div onClick={openAdd}
            style={{ background:'#FFFBF5', border:'2px dashed #FDDBC0', borderRadius:14, padding:20, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, minHeight:140, transition:'all 0.15s' }}
            onMouseEnter={(e)=>{e.currentTarget.style.borderColor='#F07B2B';e.currentTarget.style.background='#FFF4EC';}}
            onMouseLeave={(e)=>{e.currentTarget.style.borderColor='#FDDBC0';e.currentTarget.style.background='#FFFBF5';}}>
            <div style={{ width:40, height:40, borderRadius:10, background:'#FFF4EC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color:'#F07B2B' }}>
              <i className="ti ti-plus" />
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:'#C94B10' }}>Add new entity</div>
          </div>
        </div>
      )}

      {!loading && entities.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#9B9590' }}>
          <i className="ti ti-building-off" style={{ fontSize:40, display:'block', marginBottom:12, color:'#FDDBC0' }} />
          No entities yet. Click "Add entity" to get started.
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <Modal title="Add new entity" onClose={() => setShowAdd(false)} onSave={handleSaveAdd} loading={saving} error={error}>
          <EntityFields form={form} setForm={setForm} />
        </Modal>
      )}

      {/* Edit Modal */}
      {editEnt && (
        <Modal title="Edit entity" onClose={() => setEditEnt(null)} onSave={handleSaveEdit} loading={saving} error={error}>
          <EntityFields form={form} setForm={setForm} />
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteEnt && (
        <div style={{ position:'fixed', inset:0, background:'rgba(28,26,24,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(3px)', padding:16 }}
          onClick={(e) => e.target === e.currentTarget && setDeleteEnt(null)}>
          <div style={{ background:'#fff', borderRadius:16, border:'1px solid #E8E4DF', boxShadow:'0 8px 32px rgba(0,0,0,0.12)', padding:28, maxWidth:400, width:'100%' }}>
            <div style={{ width:48, height:48, background:'#FEF2F2', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
              <i className="ti ti-trash" style={{ fontSize:24, color:'#DC2626' }} />
            </div>
            <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, marginBottom:8 }}>Remove entity?</h3>
            <p style={{ fontSize:13, color:'#7A736C', lineHeight:1.65, marginBottom:22 }}>
              <strong style={{ color:'#1C1A18' }}>{deleteEnt.name}</strong> will be removed from the system. Existing cases linked to this entity will remain intact.
            </p>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={() => setDeleteEnt(null)} disabled={saving} style={{ padding:'9px 16px', background:'transparent', border:'1.5px solid #E8E4DF', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', color:'#7A736C' }}>Cancel</button>
              <button onClick={handleDelete} disabled={saving} style={{ padding:'9px 18px', background:'#DC2626', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', color:'#fff', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
                {saving ? 'Removing…' : <><i className="ti ti-trash" style={{ marginRight:4 }} />Remove</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
