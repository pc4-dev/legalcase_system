import { useState, useEffect } from 'react';
import { caseService } from '../../services/caseService';
import { lawyerService } from '../../services/lawyerService';
import { entityService } from '../../services/entityService';

const STAGES   = ['filing','hearing','arguments','decree','appeal','settled'];
const STATUSES = ['active','urgent','pending','closed'];
const INIT = { caseCode:'', title:'', subtitle:'', entity:'', court:'', bench:'', lawyer:'', opposingCounsel:'', status:'active', stage:'filing', nextHearingDate:'', hearingType:'', reliefByPlaintiff:'', ourPosition:'', strategyRemarks:'' };

const INP = { width:'100%', padding:'9px 13px', border:'1.5px solid rgba(28,26,24,0.12)', borderRadius:8, fontSize:13, color:'#1C1A18', background:'#FAFAF9', fontFamily:'inherit', outline:'none', transition:'border-color 0.13s' };
const LBL = { display:'block', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'#7A736C', marginBottom:5 };

export default function NewCaseModal({ open, onClose, onCreated }) {
  const [form, setForm]       = useState(INIT);
  const [lawyers, setLawyers] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    lawyerService.getAll().then((d) => setLawyers(d.lawyers || []));
    entityService.getAll().then((d) => setEntities(d.entities || []));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.caseCode || !form.title || !form.court || !form.entity)
      return setError('Case code, title, court, and entity are required');
    setLoading(true); setError('');
    try {
      const payload = { ...form };
      if (!payload.lawyer)          delete payload.lawyer;
      if (!payload.nextHearingDate) delete payload.nextHearingDate;
      const data = await caseService.create(payload);
      setForm(INIT);
      onClose();
      if (onCreated) onCreated(data.case);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create case');
    } finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div style={{ display:'flex', position:'fixed', inset:0, background:'rgba(28,26,24,0.45)', zIndex:1000, alignItems:'center', justifyContent:'center', backdropFilter:'blur(3px)', padding:16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:18, border:'1.5px solid rgba(28,26,24,0.08)', boxShadow:'0 8px 32px rgba(28,26,24,0.12)', width:'100%', maxWidth:580, maxHeight:'90vh', overflowY:'auto', animation:'ncModalIn 0.2s ease' }}>

        {/* Header */}
        <div style={{ padding:'22px 26px 0', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div>
            <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, fontWeight:400 }}>Add new case</h3>
            <div style={{ fontSize:12, color:'#9B9590', marginTop:3 }}>Fill in the details to register a new matter</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'1.5px solid rgba(28,26,24,0.12)', borderRadius:8, width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#7A736C', fontSize:16 }}><i className="ti ti-x" /></button>
        </div>

        {/* Body */}
        <div style={{ padding:'16px 26px' }}>
          {error && <div style={{ background:'#FEF2F2', border:'1px solid rgba(220,38,38,0.18)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#C0392B', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}><i className="ti ti-alert-circle" />{error}</div>}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ marginBottom:12 }}><label style={LBL}>Case code *</label><input style={INP} type="text" placeholder="CAS-2026-XXXX" value={form.caseCode} onChange={set('caseCode')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'} /></div>
            <div style={{ marginBottom:12 }}><label style={LBL}>Status</label><select style={INP} value={form.status} onChange={set('status')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'}>{STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select></div>
          </div>

          <div style={{ marginBottom:12 }}><label style={LBL}>Case title / matter *</label><input style={INP} type="text" placeholder="e.g. Party A v. Neoteric Properties — Lease dispute" value={form.title} onChange={set('title')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'} /></div>
          <div style={{ marginBottom:12 }}><label style={LBL}>Subtitle</label><input style={INP} type="text" placeholder="Brief description" value={form.subtitle} onChange={set('subtitle')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'} /></div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ marginBottom:12 }}><label style={LBL}>Court *</label><input style={INP} type="text" placeholder="District Court, Gwalior" value={form.court} onChange={set('court')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'} /></div>
            <div style={{ marginBottom:12 }}><label style={LBL}>Bench / court no.</label><input style={INP} type="text" placeholder="ADJ-III" value={form.bench} onChange={set('bench')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'} /></div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ marginBottom:12 }}>
              <label style={LBL}>Stage</label>
              <select style={INP} value={form.stage} onChange={set('stage')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'}>
                {STAGES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>

            {/* ── Entity Dropdown — from DB ── */}
            <div style={{ marginBottom:12 }}>
              <label style={LBL}>Entity *</label>
              <select style={INP} value={form.entity} onChange={set('entity')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'}>
                <option value="">— Select entity —</option>
                {entities.map((e) => <option key={e._id} value={e.name}>{e.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ height:1, background:'rgba(28,26,24,0.07)', margin:'14px 0' }} />

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ marginBottom:12 }}>
              <label style={LBL}>Lawyer</label>
              <select style={INP} value={form.lawyer} onChange={set('lawyer')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'}>
                <option value="">— Select lawyer —</option>
                {lawyers.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:12 }}><label style={LBL}>Opposing counsel</label><input style={INP} type="text" placeholder="Adv. Name / Party in person" value={form.opposingCounsel} onChange={set('opposingCounsel')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'} /></div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ marginBottom:12 }}><label style={LBL}>Next hearing date</label><input style={INP} type="date" value={form.nextHearingDate} onChange={set('nextHearingDate')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'} /></div>
            <div style={{ marginBottom:12 }}><label style={LBL}>Hearing type</label><input style={INP} type="text" placeholder="e.g. Final arguments" value={form.hearingType} onChange={set('hearingType')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'} /></div>
          </div>

          <div style={{ height:1, background:'rgba(28,26,24,0.07)', margin:'14px 0' }} />

          <div style={{ marginBottom:12 }}><label style={LBL}>Relief sought / plaintiff's claim</label><input style={INP} type="text" placeholder="e.g. Recovery of ₹XX / Dismiss the suit" value={form.reliefByPlaintiff} onChange={set('reliefByPlaintiff')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'} /></div>
          <div style={{ marginBottom:12 }}><label style={LBL}>Our position</label><input style={INP} type="text" placeholder="e.g. Dismiss the suit / counterclaim" value={form.ourPosition} onChange={set('ourPosition')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'} /></div>
          <div style={{ marginBottom:12 }}><label style={LBL}>Strategy & remarks</label><textarea rows={3} style={{ ...INP, resize:'vertical' }} placeholder="Key facts, evidence needed, action items, risks…" value={form.strategyRemarks} onChange={set('strategyRemarks')} onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'} /></div>
        </div>

        {/* Footer */}
        <div style={{ padding:'0 26px 22px', display:'flex', justifyContent:'flex-end', gap:9 }}>
          <button onClick={onClose} style={{ padding:'9px 16px', background:'transparent', border:'1.5px solid rgba(28,26,24,0.12)', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', color:'#7A736C', fontFamily:'inherit' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding:'9px 20px', background:'#F07B2B', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', color:'#fff', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, minWidth:110, justifyContent:'center', boxShadow:'0 2px 8px rgba(240,123,43,0.25)' }}>
            {loading ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'ncSpin 0.7s linear infinite', display:'inline-block', marginRight:6 }} />Saving…</> : <><i className="ti ti-plus" style={{ marginRight:4 }} />Save case</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes ncModalIn{from{opacity:0;transform:translateY(14px) scale(0.98);}to{opacity:1;transform:none;}}@keyframes ncSpin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
