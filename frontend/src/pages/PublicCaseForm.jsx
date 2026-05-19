import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

const STAGES   = ['filing','hearing','arguments','decree','appeal','settled'];
const STATUSES = ['active','urgent','pending'];

const S = {
  page:     { minHeight:'100vh', background:'#F4F4F6', fontFamily:"'DM Sans',system-ui,sans-serif" },
  header:   { background:'linear-gradient(145deg,#E8581A 0%,#C94B10 60%,#A83C0C 100%)', padding:'36px 24px 44px', position:'relative', overflow:'hidden' },
  card:     { background:'#fff', borderRadius:16, boxShadow:'0 4px 24px rgba(0,0,0,0.08)', padding:'28px', maxWidth:680, margin:'-22px auto 0', position:'relative' },
  secTitle: { fontSize:12, fontWeight:700, color:'#F07B2B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16, display:'flex', alignItems:'center', paddingBottom:8, borderBottom:'1.5px solid #FFF0E5' },
  field:    { marginBottom:14 },
  label:    { display:'block', fontSize:12, fontWeight:600, color:'#4A4540', marginBottom:6 },
  hint:     { fontSize:11, color:'#C4BDB6', marginTop:4 },
  input:    { width:'100%', padding:'10px 13px', border:'1.5px solid #E8E4DF', borderRadius:9, fontSize:13.5, color:'#1C1A18', background:'#FAFAF9', fontFamily:"'DM Sans',sans-serif" },
  grid2:    { display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 },
  divider:  { height:1, background:'#F0EDE8', margin:'16px 0' },
  btnPrimary:{ display:'inline-flex', alignItems:'center', padding:'10px 20px', background:'#F07B2B', color:'#fff', border:'none', borderRadius:9, fontSize:13.5, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 3px 12px rgba(240,123,43,0.28)' },
  btnGhost:  { display:'inline-flex', alignItems:'center', padding:'10px 16px', background:'transparent', color:'#7A736C', border:'1.5px solid #E8E4DF', borderRadius:9, fontSize:13.5, fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
};

export default function PublicCaseForm() {
  const fileRef = useRef();

  const [form, setForm] = useState({
    caseCode:'', title:'', subtitle:'', entity:'',
    court:'', bench:'', lawyer:'', opposingCounsel:'',
    status:'pending', stage:'filing',
    nextHearingDate:'', hearingType:'',
    reliefByPlaintiff:'', ourPosition:'', strategyRemarks:'',
  });

  const [entities, setEntities] = useState([]);
  const [lawyers,  setLawyers]  = useState([]);
  const [files,    setFiles]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(null);
  const [error,    setError]    = useState('');
  const [step,     setStep]     = useState(1);

  /* Fetch entities + lawyers on mount */
  useEffect(() => {
    axios.get(`${API}/entities/public`)
      .then((r) => setEntities(r.data.entities || []))
      .catch(() => {});
    axios.get(`${API}/lawyers/public`)
      .then((r) => setLawyers(r.data.lawyers || []))
      .catch(() => {});
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFiles = (e) => {
    const sel = Array.from(e.target.files);
    setFiles((prev) => {
      const names = prev.map((f) => f.name);
      return [...prev, ...sel.filter((f) => !names.includes(f.name))];
    });
  };
  const removeFile = (name) => setFiles((f) => f.filter((x) => x.name !== name));

  const handleSubmit = async () => {
    if (!form.caseCode || !form.title || !form.court || !form.entity)
      return setError('Case code, title, court and entity are required');
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => { if (v) fd.append(k, v); });
      files.forEach((f) => fd.append('documents', f));
      const res = await axios.post(`${API}/cases/public`, fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      setSuccess(res.data.case);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally { setLoading(false); }
  };

  const resetForm = () => {
    setSuccess(null);
    setForm({ caseCode:'', title:'', subtitle:'', entity:'', court:'', bench:'', lawyer:'', opposingCounsel:'', status:'pending', stage:'filing', nextHearingDate:'', hearingType:'', reliefByPlaintiff:'', ourPosition:'', strategyRemarks:'' });
    setFiles([]); setStep(1); setError('');
  };

  const selLawyer = lawyers.find((l) => l._id === form.lawyer);

  if (success) return (
    <div style={S.page}>
      <style>{GCSS}</style>
      <div style={S.header}><BrandHeader /></div>
      <div style={S.card}>
        <div style={{ textAlign:'center', padding:'32px 20px' }}>
          <div style={{ width:64, height:64, background:'#F0FDF4', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', border:'2px solid #86EFAC' }}>
            <i className="ti ti-check" style={{ fontSize:32, color:'#16A34A' }} />
          </div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:'#1C1A18', marginBottom:8 }}>Case Submitted!</h2>
          <p style={{ fontSize:14, color:'#7A736C', marginBottom:24, lineHeight:1.6 }}>Your case has been registered in the Neoteric Legal system.</p>
          <div style={{ background:'#FFF4EC', border:'1.5px solid #FDDBC0', borderRadius:10, padding:'16px 20px', marginBottom:28, textAlign:'left' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#9B9590', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Case Reference</div>
            <div style={{ fontSize:18, fontWeight:700, fontFamily:'monospace', color:'#F07B2B', letterSpacing:1 }}>{success.caseCode}</div>
            <div style={{ fontSize:13, color:'#4A4540', marginTop:6 }}>{success.title}</div>
          </div>
          <button onClick={resetForm} style={S.btnPrimary}><i className="ti ti-plus" style={{ marginRight:6 }} />Submit Another Case</button>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div style={S.page}>
      <style>{GCSS}</style>

      {/* Header */}
      <div style={S.header}>
        <BrandHeader />
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:'#fff', fontWeight:400, marginBottom:8 }}>Submit a New Case</h1>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.6, maxWidth:500 }}>
          Fill in the case details below. Your submission will be directly added to the Neoteric Legal Management System.
        </p>
        {/* Step pills */}
        <div style={{ display:'flex', alignItems:'center', gap:0, marginTop:24 }}>
          {['Case Details','Court & Lawyer','Documents'].map((label, i) => {
            const num = i+1; const done = step > num; const active = step === num;
            return (
              <div key={label} style={{ display:'flex', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, border:'2px solid', background: done ? '#fff' : active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)', borderColor: done||active ? '#fff' : 'rgba(255,255,255,0.3)', color: done ? '#F07B2B' : '#fff', transition:'all 0.2s' }}>
                    {done ? <i className="ti ti-check" style={{ fontSize:13 }} /> : num}
                  </div>
                  <span style={{ fontSize:12, color: active ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: active ? 600 : 400 }}>{label}</span>
                </div>
                {i < 2 && <div style={{ width:28, height:1, background:'rgba(255,255,255,0.22)', margin:'0 8px' }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card */}
      <div style={S.card}>
        {error && (
          <div style={{ background:'#FEF2F2', border:'1.5px solid rgba(220,38,38,0.18)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#C0392B', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <div style={S.secTitle}><i className="ti ti-file-description" style={{ marginRight:6 }} />Case Information</div>

            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Case Code *</label>
                <input style={S.input} className="pub-input" type="text" placeholder="e.g. CAS-2026-0015" value={form.caseCode} onChange={set('caseCode')} />
                <div style={S.hint}>Format: CAS-YEAR-NUMBER</div>
              </div>
              <div style={S.field}>
                <label style={S.label}>Status</label>
                <select style={S.input} className="pub-input" value={form.status} onChange={set('status')}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div style={S.field}>
              <label style={S.label}>Case Title / Matter *</label>
              <input style={S.input} className="pub-input" type="text" placeholder="e.g. Party A v. Neoteric Properties — Lease dispute" value={form.title} onChange={set('title')} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Brief Description</label>
              <input style={S.input} className="pub-input" type="text" placeholder="Short description of the matter" value={form.subtitle} onChange={set('subtitle')} />
            </div>

            <div style={S.grid2}>
              {/* ── Entity Dropdown — fetched from DB ── */}
              <div style={S.field}>
                <label style={S.label}>Entity *</label>
                <select style={S.input} className="pub-input" value={form.entity} onChange={set('entity')}>
                  <option value="">— Select entity —</option>
                  {entities.length === 0 && <option disabled>Loading entities…</option>}
                  {entities.map((e) => <option key={e._id} value={e.name}>{e.name}</option>)}
                </select>
                <div style={S.hint}>Which Neoteric entity is this case for?</div>
              </div>
              <div style={S.field}>
                <label style={S.label}>Stage</label>
                <select style={S.input} className="pub-input" value={form.stage} onChange={set('stage')}>
                  {STAGES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
              <button style={S.btnPrimary} onClick={() => { if (!form.caseCode||!form.title||!form.entity) return setError('Case code, title, and entity are required'); setError(''); setStep(2); }}>
                Next: Court & Lawyer <i className="ti ti-arrow-right" style={{ marginLeft:6 }} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <div style={S.secTitle}><i className="ti ti-building-bank" style={{ marginRight:6 }} />Court Details</div>

            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Court / Forum *</label>
                <input style={S.input} className="pub-input" type="text" placeholder="e.g. District Court, Gwalior" value={form.court} onChange={set('court')} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Bench / Court No.</label>
                <input style={S.input} className="pub-input" type="text" placeholder="e.g. ADJ-III" value={form.bench} onChange={set('bench')} />
              </div>
            </div>

            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Next Hearing Date</label>
                <input style={S.input} className="pub-input" type="date" value={form.nextHearingDate} onChange={set('nextHearingDate')} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Hearing Type</label>
                <input style={S.input} className="pub-input" type="text" placeholder="e.g. Final arguments" value={form.hearingType} onChange={set('hearingType')} />
              </div>
            </div>

            <div style={S.divider} />
            <div style={S.secTitle}><i className="ti ti-user-check" style={{ marginRight:6 }} />Assign Lawyer</div>

            <div style={S.field}>
              <label style={S.label}>Select Lawyer</label>
              <select style={S.input} className="pub-input" value={form.lawyer} onChange={set('lawyer')}>
                <option value="">— Select a lawyer (optional) —</option>
                {lawyers.length === 0 && <option disabled>Loading lawyers…</option>}
                {lawyers.map((l) => (
                  <option key={l._id} value={l._id}>{l.name} — {l.specialisation} · {l.court}</option>
                ))}
              </select>
              <div style={S.hint}>Select the lawyer who will handle this case</div>
            </div>

            {/* Lawyer preview */}
            {selLawyer && (
              <div style={{ background:'#FFF4EC', border:'1.5px solid #FDDBC0', borderRadius:10, padding:'12px 16px', marginBottom:14, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, background:'rgba(240,123,43,0.15)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#F07B2B', flexShrink:0 }}>
                  {selLawyer.initials || selLawyer.name.replace(/^Adv\.\s*/i,'').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1C1A18' }}>{selLawyer.name}</div>
                  <div style={{ fontSize:11, color:'#7A736C' }}>{selLawyer.specialisation} · {selLawyer.court}</div>
                  {selLawyer.phone && <div style={{ fontSize:11, color:'#9B9590', marginTop:2 }}><i className="ti ti-phone" style={{ fontSize:11, marginRight:4 }} />{selLawyer.phone}</div>}
                </div>
                <button type="button" onClick={() => setForm((f) => ({ ...f, lawyer:'' }))}
                  style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'#C4BDB6', fontSize:16, padding:4, flexShrink:0 }}>
                  <i className="ti ti-x" />
                </button>
              </div>
            )}

            <div style={S.field}>
              <label style={S.label}>Opposing Counsel</label>
              <input style={S.input} className="pub-input" type="text" placeholder="e.g. Adv. Name / Party in person" value={form.opposingCounsel} onChange={set('opposingCounsel')} />
            </div>

            <div style={S.divider} />
            <div style={S.secTitle}><i className="ti ti-bulb" style={{ marginRight:6 }} />Legal Strategy</div>

            <div style={S.field}>
              <label style={S.label}>Relief Sought / Plaintiff's Claim</label>
              <input style={S.input} className="pub-input" type="text" placeholder="e.g. Recovery of ₹14.2L + interest" value={form.reliefByPlaintiff} onChange={set('reliefByPlaintiff')} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Our Position</label>
              <input style={S.input} className="pub-input" type="text" placeholder="e.g. Dismiss the suit / counterclaim" value={form.ourPosition} onChange={set('ourPosition')} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Strategy & Remarks</label>
              <textarea style={{ ...S.input, resize:'vertical' }} className="pub-input" rows={4} placeholder="Key facts, evidence needed, action items, risks, important dates…" value={form.strategyRemarks} onChange={set('strategyRemarks')} />
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}>
              <button style={S.btnGhost} onClick={() => { setError(''); setStep(1); }}>
                <i className="ti ti-arrow-left" style={{ marginRight:6 }} />Back
              </button>
              <button style={S.btnPrimary} onClick={() => { if (!form.court) return setError('Court is required'); setError(''); setStep(3); }}>
                Next: Documents <i className="ti ti-arrow-right" style={{ marginLeft:6 }} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <div style={S.secTitle}><i className="ti ti-files" style={{ marginRight:6 }} />Documents & Attachments</div>
            <p style={{ fontSize:13, color:'#7A736C', marginBottom:16, lineHeight:1.6 }}>Upload plaint, legal notices, annexures, site photos, contracts. Multiple files allowed.</p>

            <div className="pub-file-zone" onClick={() => fileRef.current.click()}>
              <i className="ti ti-cloud-upload" style={{ fontSize:32, color:'#F07B2B', display:'block', marginBottom:8 }} />
              <div style={{ fontSize:14, fontWeight:600, color:'#4A4540', marginBottom:4 }}>Click to upload documents</div>
              <div style={{ fontSize:12, color:'#9B9590' }}>PDF, Word, Images, ZIP — up to 20MB per file</div>
            </div>
            <input ref={fileRef} type="file" multiple style={{ display:'none' }} onChange={handleFiles} accept=".pdf,.jpg,.jpeg,.png,.zip,.doc,.docx" />

            {files.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#9B9590', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }}>{files.length} file{files.length > 1 ? 's' : ''} selected</div>
                {files.map((f) => (
                  <div key={f.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'#FFFBF5', border:'1.5px solid #FDDBC0', borderRadius:9, marginBottom:6 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
                      <i className="ti ti-file" style={{ fontSize:18, color:'#F07B2B', flexShrink:0 }} />
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:'#1C1A18', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:260 }}>{f.name}</div>
                        <div style={{ fontSize:11, color:'#9B9590' }}>{(f.size/(1024*1024)).toFixed(2)} MB</div>
                      </div>
                    </div>
                    <button onClick={() => removeFile(f.name)} style={{ background:'none', border:'none', cursor:'pointer', color:'#C0392B', fontSize:18, padding:4, borderRadius:6, flexShrink:0 }}><i className="ti ti-x" /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div style={{ background:'#F7F6F4', border:'1.5px solid #E8E4DF', borderRadius:10, padding:'14px 16px', marginBottom:18 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#9B9590', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Submission Summary</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, fontSize:12 }}>
                {[
                  { label:'Case Code', val: form.caseCode },
                  { label:'Status',    val: form.status },
                  { label:'Entity',    val: form.entity?.length > 22 ? form.entity.slice(0,22)+'…' : form.entity },
                  { label:'Court',     val: form.court?.split(',')[0] },
                  { label:'Lawyer',    val: selLawyer?.name || 'Not assigned' },
                  { label:'Documents', val: `${files.length} file${files.length !== 1 ? 's' : ''}` },
                ].map(({ label, val }) => (
                  <div key={label} style={{ display:'flex', gap:6 }}>
                    <span style={{ color:'#9B9590', minWidth:72, flexShrink:0 }}>{label}:</span>
                    <span style={{ color:'#1C1A18', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{val || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <button style={S.btnGhost} onClick={() => { setError(''); setStep(2); }}>
                <i className="ti ti-arrow-left" style={{ marginRight:6 }} />Back
              </button>
              <button style={{ ...S.btnPrimary, minWidth:160, justifyContent:'center' }} onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', marginRight:8, display:'inline-block' }} />Submitting…</>
                  : <><i className="ti ti-send" style={{ marginRight:6 }} />Submit Case</>}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function BrandHeader() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
      <div style={{ width:44, height:44, background:'rgba(255,255,255,0.18)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'#fff', border:'1px solid rgba(255,255,255,0.2)' }}>
        <i className="ti ti-briefcase" />
      </div>
      <div>
        <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#fff' }}>Neoteric Group</div>
        <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Legal Case Submission</div>
      </div>
    </div>
  );
}

function Footer() {
  return <div style={{ textAlign:'center', padding:'20px 0 32px', fontSize:12, color:'#9B9590', fontFamily:"'DM Sans',sans-serif" }}>© 2026 Neoteric Group · Legal Management System</div>;
}

const GCSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}body{background:#F4F4F6;}
  .pub-input:focus{outline:none;border-color:#F07B2B !important;box-shadow:0 0 0 3px rgba(240,123,43,0.10) !important;background:#fff !important;}
  .pub-file-zone{border:2px dashed #FDDBC0;border-radius:10px;padding:24px;text-align:center;cursor:pointer;transition:all 0.15s;background:#FFFBF5;margin-bottom:14px;}
  .pub-file-zone:hover{border-color:#F07B2B;background:#FFF4EC;}
  @keyframes spin{to{transform:rotate(360deg);}}
`;
