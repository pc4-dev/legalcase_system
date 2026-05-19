import { useState, useEffect } from 'react';
import { caseService } from '../../services/caseService';
import { lawyerService } from '../../services/lawyerService';
import { entityService } from '../../services/entityService';
import SelectOrOther from '../Common/SelectOrOther';

const STAGES   = ['filing','hearing','arguments','decree','appeal','settled'];
const STATUSES = ['active','urgent','pending','closed'];

const INIT = {
  caseCode:'', title:'', subtitle:'',
  petitionerName:'', respondentName:'',
  entity:'', court:'', bench:'',
  lawyer:'', opposingCounsel:'',
  status:'active', stage:'filing',
  nextHearingDate:'', hearingType:'',
  reliefByPlaintiff:'', ourPosition:'', strategyRemarks:'',
};

const INP = {
  width:'100%', padding:'9px 13px',
  border:'1.5px solid rgba(28,26,24,0.12)', borderRadius:8,
  fontSize:13, color:'#1C1A18', background:'#FAFAF9',
  fontFamily:'inherit', outline:'none', transition:'border-color 0.13s',
};
const LBL = {
  display:'block', fontSize:11, fontWeight:600,
  textTransform:'uppercase', letterSpacing:'0.08em',
  color:'#7A736C', marginBottom:5,
};
const SECT = {
  fontSize:11, fontWeight:700, color:'#F07B2B',
  textTransform:'uppercase', letterSpacing:'0.08em',
  marginBottom:12, marginTop:18, paddingBottom:8,
  borderBottom:'1.5px solid #FFF0E5',
  display:'flex', alignItems:'center', gap:6,
};

export default function NewCaseModal({ open, onClose, onCreated }) {
  const [form, setForm]         = useState(INIT);
  const [lawyers, setLawyers]   = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    lawyerService.getAll().then((d) => setLawyers(d.lawyers || []));
    entityService.getAll().then((d)  => setEntities(d.entities || []));
  }, []);

  const set    = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setVal = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const fInp = (k, placeholder, type='text') => (
    <input style={INP} type={type} placeholder={placeholder}
      value={form[k]} onChange={set(k)}
      onFocus={(e) => e.target.style.borderColor = '#F07B2B'}
      onBlur={(e)  => e.target.style.borderColor = 'rgba(28,26,24,0.12)'}
    />
  );

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

  const soStyle = {
    width:'100%', padding:'9px 13px',
    border:'1.5px solid rgba(28,26,24,0.12)', borderRadius:8,
    fontSize:13, background:'#FAFAF9',
  };

  return (
    <div style={{ display:'flex', position:'fixed', inset:0, background:'rgba(28,26,24,0.45)', zIndex:1000, alignItems:'center', justifyContent:'center', backdropFilter:'blur(3px)', padding:16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#fff', borderRadius:18, border:'1.5px solid rgba(28,26,24,0.08)', boxShadow:'0 8px 32px rgba(28,26,24,0.12)', width:'100%', maxWidth:600, maxHeight:'92vh', overflowY:'auto', animation:'ncIn 0.2s ease' }}>

        {/* Header */}
        <div style={{ padding:'22px 26px 0', display:'flex', alignItems:'flex-start', justifyContent:'space-between', position:'sticky', top:0, background:'#fff', zIndex:2, borderBottom:'1px solid rgba(28,26,24,0.06)', paddingBottom:14 }}>
          <div>
            <h3 style={{ fontFamily:"'DM Serif Display',serif", fontSize:22, fontWeight:400 }}>Add new case</h3>
            <div style={{ fontSize:12, color:'#9B9590', marginTop:2 }}>Fill in the details to register a new matter</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'1.5px solid rgba(28,26,24,0.12)', borderRadius:8, width:30, height:30, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#7A736C', fontSize:16 }}><i className="ti ti-x" /></button>
        </div>

        {/* Body */}
        <div style={{ padding:'16px 26px 8px' }}>
          {error && <div style={{ background:'#FEF2F2', border:'1px solid rgba(220,38,38,0.18)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#C0392B', marginBottom:14, display:'flex', alignItems:'center', gap:8 }}><i className="ti ti-alert-circle" />{error}</div>}

          {/* ── CASE INFO ── */}
          <div style={SECT}><i className="ti ti-file-description" />Case Information</div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ marginBottom:12 }}><label style={LBL}>Case code *</label>{fInp('caseCode','CAS-2026-XXXX')}</div>
            <div style={{ marginBottom:12 }}>
              <label style={LBL}>Status</label>
              <SelectOrOther options={STATUSES.map(s=>s.charAt(0).toUpperCase()+s.slice(1))} value={form.status.charAt(0).toUpperCase()+form.status.slice(1)} onChange={(v)=>setForm(f=>({...f,status:v.toLowerCase()}))} label="— Select status —" style={soStyle} />
            </div>
          </div>

          <div style={{ marginBottom:12 }}><label style={LBL}>Case title / matter *</label>{fInp('title','e.g. Party A v. Neoteric Properties — Lease dispute')}</div>
          <div style={{ marginBottom:12 }}><label style={LBL}>Subtitle / brief description</label>{fInp('subtitle','Short description of the matter')}</div>

          {/* ── Petitioner & Respondent ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ marginBottom:12 }}>
              <label style={LBL}>Petitioner Name</label>
              {fInp('petitionerName','e.g. Rahul Gupta / Company Name')}
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={LBL}>Respondent Name</label>
              {fInp('respondentName','e.g. Opposing Party Name')}
            </div>
          </div>

          {/* ── COURT INFO ── */}
          <div style={SECT}><i className="ti ti-building-bank" />Court Details</div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ marginBottom:12 }}><label style={LBL}>Court *</label>{fInp('court','District Court, Gwalior')}</div>
            <div style={{ marginBottom:12 }}><label style={LBL}>Bench / court no.</label>{fInp('bench','ADJ-III')}</div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ marginBottom:12 }}>
              <label style={LBL}>Stage</label>
              <SelectOrOther options={STAGES.map(s=>s.charAt(0).toUpperCase()+s.slice(1))} value={form.stage.charAt(0).toUpperCase()+form.stage.slice(1)} onChange={(v)=>setForm(f=>({...f,stage:v.toLowerCase()}))} label="— Select stage —" style={soStyle} placeholder="Type stage name…" />
            </div>
            <div style={{ marginBottom:12 }}>
              <label style={LBL}>Entity *</label>
              <SelectOrOther options={entities.map(e=>e.name)} value={form.entity} onChange={setVal('entity')} label="— Select entity —" style={soStyle} placeholder="Type entity name…" />
            </div>
          </div>

          {/* ── LAWYER ── */}
          <div style={SECT}><i className="ti ti-user-check" />Lawyer Assignment</div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ marginBottom:12 }}>
              <label style={LBL}>Lawyer</label>
              <SelectOrOther
                options={lawyers.map(l=>l.name)}
                value={lawyers.find(l=>l._id===form.lawyer)?.name || form.lawyer}
                onChange={(v) => {
                  const found = lawyers.find(l=>l.name===v);
                  setForm(f=>({...f, lawyer: found ? found._id : v}));
                }}
                label="— Select lawyer —"
                style={soStyle}
                placeholder="Type lawyer name…"
              />
            </div>
            <div style={{ marginBottom:12 }}><label style={LBL}>Opposing counsel</label>{fInp('opposingCounsel','Adv. Name / Party in person')}</div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ marginBottom:12 }}><label style={LBL}>Next hearing date</label>{fInp('nextHearingDate','','date')}</div>
            <div style={{ marginBottom:12 }}><label style={LBL}>Hearing type</label>{fInp('hearingType','e.g. Final arguments')}</div>
          </div>

          {/* ── STRATEGY ── */}
          <div style={SECT}><i className="ti ti-bulb" />Legal Strategy</div>

          <div style={{ marginBottom:12 }}><label style={LBL}>Relief sought / plaintiff's claim</label>{fInp('reliefByPlaintiff','e.g. Recovery of ₹XX + interest')}</div>
          <div style={{ marginBottom:12 }}><label style={LBL}>Our position</label>{fInp('ourPosition','e.g. Dismiss the suit / counterclaim')}</div>
          <div style={{ marginBottom:12 }}>
            <label style={LBL}>Strategy & remarks</label>
            <textarea rows={3} style={{ ...INP, resize:'vertical' }} placeholder="Key facts, evidence needed, action items, risks…" value={form.strategyRemarks} onChange={set('strategyRemarks')}
              onFocus={(e)=>e.target.style.borderColor='#F07B2B'} onBlur={(e)=>e.target.style.borderColor='rgba(28,26,24,0.12)'} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:'12px 26px 22px', display:'flex', justifyContent:'flex-end', gap:9, borderTop:'1px solid rgba(28,26,24,0.06)', position:'sticky', bottom:0, background:'#fff' }}>
          <button onClick={onClose} style={{ padding:'9px 16px', background:'transparent', border:'1.5px solid rgba(28,26,24,0.12)', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', color:'#7A736C', fontFamily:'inherit' }}>Cancel</button>
          <button onClick={handleSubmit} disabled={loading} style={{ padding:'9px 20px', background:'#F07B2B', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', color:'#fff', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, minWidth:110, justifyContent:'center', boxShadow:'0 2px 8px rgba(240,123,43,0.25)' }}>
            {loading ? <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'ncSpin 0.7s linear infinite', display:'inline-block', marginRight:6 }} />Saving…</> : <><i className="ti ti-plus" style={{ marginRight:4 }} />Save case</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes ncIn{from{opacity:0;transform:translateY(14px) scale(0.98);}to{opacity:1;transform:none;}}@keyframes ncSpin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}
