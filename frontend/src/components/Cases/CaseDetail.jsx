import { useState, useEffect, useRef } from 'react';
import { caseService } from '../../services/caseService';

const fmtDateLong = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) : '—';

const STAGE_CLASS = {
  filing:'sp-filing', hearing:'sp-hearing', arguments:'sp-arguments',
  decree:'sp-decree', settled:'sp-settled', appeal:'sp-appeal',
};

const FILE_ICON = {
  plaint:'ti-file-type-pdf', annexure:'ti-file-type-pdf',
  letter:'ti-mail', affidavit:'ti-file-text',
  order:'ti-file-certificate', decree:'ti-file-certificate',
  evidence:'ti-photo', contract:'ti-file-invoice', other:'ti-file',
};

const HEADER_BG = {
  urgent: '#D63031',
  active: '#F07B2B',
  pending:'#E67E22',
  closed: '#00897B',
};

const INP = {
  width:'100%', padding:'8px 12px',
  border:'1px solid rgba(28,26,24,0.12)', borderRadius:7,
  fontSize:13, color:'#1C1A18', background:'#F7F6F4',
  fontFamily:'inherit', outline:'none',
};
const LBL = {
  display:'block', fontSize:10, fontWeight:700,
  textTransform:'uppercase', letterSpacing:'0.1em',
  color:'#B8B0A8', marginBottom:5,
};

/* ── Info block component ── */
function InfoBlock({ label, value, urgent, children }) {
  return (
    <div style={{ background:'#fff', border:'1px solid rgba(28,26,24,0.07)', borderRadius:10, padding:'14px 16px', transition:'border-color 0.13s' }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(240,123,43,0.25)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(28,26,24,0.07)'}
    >
      <label style={LBL}>{label}</label>
      {children || (
        <p style={{ fontSize:13, color: urgent ? '#D63031' : '#1C1A18', fontWeight: urgent ? 700 : 500, margin:0, lineHeight:1.4 }}>
          {value || '—'}
        </p>
      )}
    </div>
  );
}

export default function CaseDetail({ caseId }) {
  const [caseDoc, setCaseDoc]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState('overview');
  const [uploading, setUploading]     = useState(false);
  const [showAdjForm, setShowAdjForm] = useState(false);
  const [adjForm, setAdjForm]         = useState({ date:'', reason:'', dotType:'info', notes:'' });
  const fileRef = useRef();

  useEffect(() => {
    if (!caseId) return;
    setLoading(true);
    caseService.getOne(caseId)
      .then((data) => { setCaseDoc(data.case); setActiveTab('overview'); })
      .finally(() => setLoading(false));
  }, [caseId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('name', file.name);
    fd.append('fileType', 'other');
    setUploading(true);
    try {
      const data = await caseService.uploadDocument(caseId, fd);
      setCaseDoc((prev) => ({ ...prev, documents: [...(prev.documents || []), data.document] }));
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); e.target.value = ''; }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Remove this document?')) return;
    const data = await caseService.deleteDocument(caseId, docId);
    setCaseDoc((prev) => ({ ...prev, documents: data.documents }));
  };

  const handleAddAdj = async () => {
    if (!adjForm.date || !adjForm.reason) return alert('Date and reason are required');
    const data = await caseService.addAdjournment(caseId, adjForm);
    setCaseDoc((prev) => ({ ...prev, adjournments: data.adjournments }));
    setAdjForm({ date:'', reason:'', dotType:'info', notes:'' });
    setShowAdjForm(false);
  };

  const handleDeleteAdj = async (adjId) => {
    if (!window.confirm('Remove this record?')) return;
    const data = await caseService.deleteAdjournment(caseId, adjId);
    setCaseDoc((prev) => ({ ...prev, adjournments: data.adjournments }));
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:12 }}>
      <style>{`@keyframes detSpin{to{transform:rotate(360deg);}}`}</style>
      <div style={{ width:28, height:28, border:'2.5px solid #FDDBC0', borderTopColor:'#F07B2B', borderRadius:'50%', animation:'detSpin 0.7s linear infinite' }} />
      <span style={{ fontSize:13, color:'#7A736C' }}>Loading case…</span>
    </div>
  );

  if (!caseDoc) return (
    <div className="empty-detail">
      <i className="ti ti-file-search" />
      <p>Case not found</p>
    </div>
  );

  const headerBg = HEADER_BG[caseDoc.status] || HEADER_BG.active;
  const adjCount = caseDoc.adjournments?.length || 0;
  const docCount = caseDoc.documents?.length || 0;

  return (
    <div className="fade-in">

      {/* ══ COLOURED HEADER ══ */}
      <div style={{ background:headerBg, padding:'24px 28px', color:'#fff', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', bottom:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:-30, left:-30, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />

        {/* Case code + entity */}
        <div style={{ fontFamily:'JetBrains Mono,monospace', fontSize:11, color:'rgba(255,255,255,0.65)', marginBottom:8, letterSpacing:'0.05em' }}>
          {caseDoc.caseCode} · {caseDoc.entity}
        </div>

        {/* Title */}
        <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, fontWeight:400, lineHeight:1.35, marginBottom:8 }}>
          {caseDoc.title}
        </h2>

        {/* Petitioner v. Respondent — shown in header if available */}
        {(caseDoc.petitionerName || caseDoc.respondentName) && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, flexWrap:'wrap' }}>
            {caseDoc.petitionerName && (
              <span style={{ fontSize:12, background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.22)', borderRadius:20, padding:'3px 10px', color:'rgba(255,255,255,0.95)', display:'inline-flex', alignItems:'center', gap:5 }}>
                <i className="ti ti-user" style={{ fontSize:12 }} />
                {caseDoc.petitionerName}
              </span>
            )}
            {caseDoc.petitionerName && caseDoc.respondentName && (
              <span style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.55)', letterSpacing:'0.06em' }}>v.</span>
            )}
            {caseDoc.respondentName && (
              <span style={{ fontSize:12, background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.22)', borderRadius:20, padding:'3px 10px', color:'rgba(255,255,255,0.95)', display:'inline-flex', alignItems:'center', gap:5 }}>
                <i className="ti ti-user" style={{ fontSize:12 }} />
                {caseDoc.respondentName}
              </span>
            )}
          </div>
        )}

        {/* Meta chips */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5, padding:'5px 11px', borderRadius:20, background:'rgba(255,255,255,0.18)', color:'rgba(255,255,255,0.92)', border:'1px solid rgba(255,255,255,0.15)' }}>
            <i className="ti ti-building-bank" style={{ fontSize:13 }} />
            {caseDoc.court}{caseDoc.bench ? ` — ${caseDoc.bench}` : ''}
          </span>
          {caseDoc.lawyer && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5, padding:'5px 11px', borderRadius:20, background:'rgba(255,255,255,0.18)', color:'rgba(255,255,255,0.92)', border:'1px solid rgba(255,255,255,0.15)' }}>
              <i className="ti ti-user-check" style={{ fontSize:13 }} />
              {caseDoc.lawyer.name}
            </span>
          )}
          {caseDoc.nextHearingDate && (
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5, padding:'5px 11px', borderRadius:20, background:caseDoc.status==='urgent'?'rgba(0,0,0,0.20)':'rgba(255,255,255,0.18)', color:'rgba(255,255,255,0.92)', border:'1px solid rgba(255,255,255,0.15)' }}>
              <i className="ti ti-calendar-event" style={{ fontSize:13 }} />
              {new Date(caseDoc.nextHearingDate).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
              {caseDoc.status === 'urgent' ? ' — URGENT' : ''}
            </span>
          )}
          <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5, padding:'5px 11px', borderRadius:20, background:'rgba(255,255,255,0.22)', color:'#fff', fontWeight:700 }}>
            {caseDoc.status.charAt(0).toUpperCase() + caseDoc.status.slice(1)}
          </span>
        </div>
      </div>

      {/* ══ TAB BAR ══ */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(28,26,24,0.07)', background:'#fff', padding:'0 28px' }}>
        {[
          { id:'overview',     label:'Overview',     count:null },
          { id:'adjournments', label:'Adjournments', count:adjCount },
          { id:'documents',    label:'Documents',    count:docCount },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{ padding:'13px 18px', fontSize:13.5, cursor:'pointer', color:activeTab===tab.id?'#F07B2B':'#7A736C', borderBottom:`2.5px solid ${activeTab===tab.id?'#F07B2B':'transparent'}`, background:'none', border:'none', borderBottomStyle:'solid', borderBottomWidth:2.5, borderBottomColor:activeTab===tab.id?'#F07B2B':'transparent', fontFamily:'inherit', fontWeight:activeTab===tab.id?700:400, transition:'all 0.13s', marginBottom:-1, display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
            {tab.label}
            {tab.count > 0 && (
              <span style={{ background:'#FFF0E5', color:'#F07B2B', fontSize:10, fontWeight:700, padding:'1px 6px', borderRadius:10 }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ TAB CONTENT ══ */}
      <div style={{ padding:'24px 28px', background:'#FAFAF9', minHeight:400 }}>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div>
            {/* Parties section — full width at top if both present */}
            {(caseDoc.petitionerName || caseDoc.respondentName) && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.13em', color:'#B8B0A8', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                  Parties
                  <span style={{ flex:1, height:1, background:'rgba(28,26,24,0.07)', display:'block' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <InfoBlock label="Petitioner" value={caseDoc.petitionerName || '—'} />
                  <InfoBlock label="Respondent" value={caseDoc.respondentName || '—'} />
                </div>
              </div>
            )}

            {/* Main info grid */}
            <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.13em', color:'#B8B0A8', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
              Case Details
              <span style={{ flex:1, height:1, background:'rgba(28,26,24,0.07)', display:'block' }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              <InfoBlock label="Case Code" value={caseDoc.caseCode} />
              <InfoBlock label="Court & Bench" value={`${caseDoc.court}${caseDoc.bench ? ` — ${caseDoc.bench}` : ''}`} />
              <InfoBlock label="Assigned Lawyer" value={caseDoc.lawyer?.name || '—'} />
              <InfoBlock label="Lawyer Mobile" value={caseDoc.lawyer?.phone || '—'} />
              <InfoBlock label="Opposing Counsel" value={caseDoc.opposingCounsel || '—'} />
              <InfoBlock label="Entity" value={caseDoc.entity} />
              <InfoBlock label="Stage">
                <span className={`stage-pill ${STAGE_CLASS[caseDoc.stage] || 'sp-filing'}`}>
                  {caseDoc.stage?.charAt(0).toUpperCase() + caseDoc.stage?.slice(1)}
                </span>
              </InfoBlock>
              <InfoBlock label="Status">
                <span className={`status-dot sd-${caseDoc.status}`}>
                  {caseDoc.status?.charAt(0).toUpperCase() + caseDoc.status?.slice(1)}
                </span>
              </InfoBlock>
              <InfoBlock
                label="Next Hearing"
                value={fmtDateLong(caseDoc.nextHearingDate) + (caseDoc.hearingType ? ` — ${caseDoc.hearingType}` : '')}
                urgent={caseDoc.status === 'urgent'}
              />
              <InfoBlock label="Date Filed" value={fmtDateLong(caseDoc.filedDate)} />
            </div>

            {/* Relief & Position */}
            {(caseDoc.reliefByPlaintiff || caseDoc.ourPosition) && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.13em', color:'#B8B0A8', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                  Relief Sought
                  <span style={{ flex:1, height:1, background:'rgba(28,26,24,0.07)', display:'block' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {caseDoc.reliefByPlaintiff && <InfoBlock label="By Plaintiff" value={caseDoc.reliefByPlaintiff} />}
                  {caseDoc.ourPosition && <InfoBlock label="Our Position" value={caseDoc.ourPosition} />}
                </div>
              </div>
            )}

            {/* Strategy */}
            {caseDoc.strategyRemarks && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.13em', color:'#B8B0A8', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                  Strategy & Remarks
                  <span style={{ flex:1, height:1, background:'rgba(28,26,24,0.07)', display:'block' }} />
                </div>
                <div style={{ background:'#FFF4EC', border:'1.5px solid rgba(240,123,43,0.20)', borderLeft:'4px solid #F07B2B', borderRadius:10, padding:'16px 18px', fontSize:13.5, color:'#1C1A18', lineHeight:1.7 }}>
                  {caseDoc.strategyRemarks}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ADJOURNMENTS ── */}
        {activeTab === 'adjournments' && (
          <div>
            <div style={{ marginBottom:16 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAdjForm(!showAdjForm)}>
                <i className={`ti ${showAdjForm ? 'ti-x' : 'ti-plus'}`} />
                {showAdjForm ? 'Cancel' : 'Add record'}
              </button>
            </div>

            {showAdjForm && (
              <div style={{ background:'#fff', border:'1px solid rgba(28,26,24,0.10)', borderRadius:10, padding:18, marginBottom:20 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <div><label style={LBL}>Date *</label><input type="date" style={INP} value={adjForm.date} onChange={(e) => setAdjForm({...adjForm,date:e.target.value})} /></div>
                  <div>
                    <label style={LBL}>Type</label>
                    <select style={INP} value={adjForm.dotType} onChange={(e) => setAdjForm({...adjForm,dotType:e.target.value})}>
                      <option value="info">Info (orange)</option>
                      <option value="warn">Warning (amber)</option>
                      <option value="done">Done (green)</option>
                      <option value="idle">Idle (gray)</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:10 }}>
                  <label style={LBL}>Reason *</label>
                  <input type="text" style={INP} placeholder="e.g. Adjourned — counsel unavailable" value={adjForm.reason} onChange={(e) => setAdjForm({...adjForm,reason:e.target.value})} />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={LBL}>Notes</label>
                  <input type="text" style={INP} placeholder="Optional additional notes" value={adjForm.notes} onChange={(e) => setAdjForm({...adjForm,notes:e.target.value})} />
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn btn-primary btn-sm" onClick={handleAddAdj}><i className="ti ti-check" /> Save record</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowAdjForm(false)}>Cancel</button>
                </div>
              </div>
            )}

            <div className="timeline">
              {(!caseDoc.adjournments || caseDoc.adjournments.length === 0) && (
                <div style={{ textAlign:'center', padding:'40px 20px', color:'#9B9590' }}>
                  <i className="ti ti-calendar-off" style={{ fontSize:36, display:'block', marginBottom:10, color:'#FDDBC0' }} />
                  No adjournment records yet.
                </div>
              )}
              {(caseDoc.adjournments || []).map((a) => (
                <div key={a._id} className="tl-item">
                  <div className={`tl-dot ${a.dotType || 'info'}`} />
                  <div className="tl-body" style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                      <div className="tl-title" style={{ flex:1 }}>{a.reason}</div>
                      <button onClick={() => handleDeleteAdj(a._id)} title="Remove"
                        style={{ width:26, height:26, borderRadius:6, border:'1px solid rgba(28,26,24,0.10)', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#D63031', fontSize:13, flexShrink:0, transition:'all 0.12s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background='#FDEDEB'}
                        onMouseLeave={(e) => e.currentTarget.style.background='#fff'}>
                        <i className="ti ti-trash" />
                      </button>
                    </div>
                    <div className="tl-date">{new Date(a.date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
                    {a.notes && <div className="tl-note">{a.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {activeTab === 'documents' && (
          <div>
            <div className="upload-zone" onClick={() => fileRef.current.click()} style={{ marginBottom:16 }}>
              <i className="ti ti-cloud-upload" />
              {uploading ? 'Uploading… please wait' : 'Click or drag & drop — PDF, scanned letters, photos, ZIP'}
            </div>
            <input ref={fileRef} type="file" style={{ display:'none' }} onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.zip,.doc,.docx" />

            <div className="doc-list">
              {(!caseDoc.documents || caseDoc.documents.length === 0) && (
                <div style={{ textAlign:'center', padding:'40px 20px', color:'#9B9590' }}>
                  <i className="ti ti-files" style={{ fontSize:36, display:'block', marginBottom:10, color:'#FDDBC0' }} />
                  No documents uploaded yet.
                </div>
              )}
              {(caseDoc.documents || []).map((doc) => (
                <div key={doc._id} className={`doc-item${doc.status==='pending'?' doc-pending':''}`}>
                  <div className="doc-left">
                    <i className={`ti ${FILE_ICON[doc.fileType] || 'ti-file'}`} />
                    <div style={{ minWidth:0 }}>
                      <div className="doc-name">{doc.name}</div>
                      {doc.fileSize && <div style={{ fontSize:11, color:'#9B9590', marginTop:2 }}>{doc.fileSize}</div>}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
                    <span className="doc-type-tag">{doc.fileType}</span>
                    <div className="doc-actions">
                      {doc.filePath && (
                        <a href={doc.filePath} target="_blank" rel="noreferrer">
                          <button className="icon-btn" title="View"><i className="ti ti-eye" /></button>
                        </a>
                      )}
                      {doc.status !== 'pending' && (
                        <button className="icon-btn" onClick={() => handleDeleteDoc(doc._id)} title="Delete" style={{ color:'#D63031' }}>
                          <i className="ti ti-trash" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
