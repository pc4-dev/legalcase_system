import { useState, useEffect, useRef } from 'react';
import { caseService } from '../../services/caseService';

const fmtDateLong = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

const stageClass = {
  filing: 'sp-filing', hearing: 'sp-hearing', arguments: 'sp-arguments',
  decree: 'sp-decree', settled: 'sp-settled', appeal: 'sp-appeal',
};

const fileIcon = {
  plaint: 'ti-file-type-pdf', annexure: 'ti-file-type-pdf',
  letter: 'ti-mail', affidavit: 'ti-file-text',
  order: 'ti-file-certificate', decree: 'ti-file-certificate',
  evidence: 'ti-photo', contract: 'ti-file-invoice', other: 'ti-file',
};

export default function CaseDetail({ caseId }) {
  const [caseDoc, setCaseDoc]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploading, setUploading] = useState(false);
  const [adjForm, setAdjForm]     = useState({ date: '', reason: '', dotType: 'info', notes: '' });
  const [showAdjForm, setShowAdjForm] = useState(false);
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
    if (!adjForm.date || !adjForm.reason) return alert('Date and reason required');
    const data = await caseService.addAdjournment(caseId, adjForm);
    setCaseDoc((prev) => ({ ...prev, adjournments: data.adjournments }));
    setAdjForm({ date: '', reason: '', dotType: 'info', notes: '' });
    setShowAdjForm(false);
  };

  const handleDeleteAdj = async (adjId) => {
    if (!window.confirm('Remove this record?')) return;
    const data = await caseService.deleteAdjournment(caseId, adjId);
    setCaseDoc((prev) => ({ ...prev, adjournments: data.adjournments }));
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12, color: 'var(--ink-60)' }}>
      <i className="ti ti-loader-2" style={{ fontSize: 28, animation: 'detSpin 0.7s linear infinite' }} />
      <style>{`@keyframes detSpin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  if (!caseDoc) return (
    <div className="empty-detail">
      <i className="ti ti-file-search" /><p>Case not found</p>
    </div>
  );

  const headerBg = { urgent:  '#D63031',   
  active:  '#F07B2B',   
  pending: '#E67E22',   
  closed:  '#00897B',   }[caseDoc.status] || 'var(--accent)';

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="case-detail-header" style={{ background: headerBg }}>
        <div className="case-code">{caseDoc.caseCode} · {caseDoc.court} · {caseDoc.entity}</div>
        <h2>{caseDoc.title}</h2>
        <div className="meta-chips">
          <span className="meta-chip"><i className="ti ti-building-bank" />{caseDoc.court}{caseDoc.bench ? ` — ${caseDoc.bench}` : ''}</span>
          {caseDoc.lawyer && <span className="meta-chip"><i className="ti ti-user" />{caseDoc.lawyer.name}</span>}
          {caseDoc.nextHearingDate && (
            <span className="meta-chip" style={caseDoc.status === 'urgent' ? { background: 'rgba(160,32,32,0.25)' } : {}}>
              <i className="ti ti-calendar-event" />
              {new Date(caseDoc.nextHearingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              {caseDoc.status === 'urgent' ? ' — URGENT' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="case-detail-body">
        <div className="dtabs">
          {['overview', 'adjournments', 'documents'].map((tab) => (
            <button key={tab} className={`dtab${activeTab === tab ? ' active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'adjournments' && caseDoc.adjournments?.length > 0 && (
                <span style={{ marginLeft: 6, background: 'var(--accent-light)', color: 'var(--accent)', fontSize: 10, padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>{caseDoc.adjournments.length}</span>
              )}
              {tab === 'documents' && caseDoc.documents?.length > 0 && (
                <span style={{ marginLeft: 6, background: 'var(--accent-light)', color: 'var(--accent)', fontSize: 10, padding: '1px 6px', borderRadius: 10, fontWeight: 600 }}>{caseDoc.documents.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <div className="info-grid" style={{ marginBottom: 16 }}>
              <div className="info-block"><label>Case code</label><p>{caseDoc.caseCode}</p></div>
              <div className="info-block"><label>Court & bench</label><p>{caseDoc.court}{caseDoc.bench ? ` — ${caseDoc.bench}` : ''}</p></div>
              <div className="info-block"><label>Assigned lawyer</label><p>{caseDoc.lawyer?.name || '—'}</p></div>
              <div className="info-block"><label>Lawyer mobile</label><p>{caseDoc.lawyer?.phone || '—'}</p></div>
              <div className="info-block"><label>Opposing counsel</label><p>{caseDoc.opposingCounsel || '—'}</p></div>
              <div className="info-block"><label>Entity</label><p>{caseDoc.entity}</p></div>
              <div className="info-block"><label>Stage</label><p><span className={`stage-pill ${stageClass[caseDoc.stage]}`}>{caseDoc.stage}</span></p></div>
              <div className="info-block"><label>Status</label><p><span className={`status-dot sd-${caseDoc.status}`}>{caseDoc.status.charAt(0).toUpperCase() + caseDoc.status.slice(1)}</span></p></div>
              <div className="info-block"><label>Next hearing date</label><p className={caseDoc.status === 'urgent' ? 'urgent' : ''}>{fmtDateLong(caseDoc.nextHearingDate)}{caseDoc.hearingType ? ` — ${caseDoc.hearingType}` : ''}</p></div>
              <div className="info-block"><label>Filed date</label><p>{fmtDateLong(caseDoc.filedDate)}</p></div>
            </div>
            {(caseDoc.reliefByPlaintiff || caseDoc.ourPosition) && (
              <div className="detail-section">
                <div className="detail-section-title">Relief sought</div>
                <div className="info-grid">
                  {caseDoc.reliefByPlaintiff && <div className="info-block"><label>By plaintiff</label><p>{caseDoc.reliefByPlaintiff}</p></div>}
                  {caseDoc.ourPosition && <div className="info-block"><label>Our position</label><p>{caseDoc.ourPosition}</p></div>}
                </div>
              </div>
            )}
            {caseDoc.strategyRemarks && (
              <div className="detail-section">
                <div className="detail-section-title">Strategy & remarks</div>
                <div className="remarks-box">{caseDoc.strategyRemarks}</div>
              </div>
            )}
          </div>
        )}

        {/* ADJOURNMENTS TAB */}
        {activeTab === 'adjournments' && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <button className="btn btn-ghost" onClick={() => setShowAdjForm(!showAdjForm)}>
                <i className="ti ti-plus" /> {showAdjForm ? 'Cancel' : 'Add record'}
              </button>
            </div>
            {showAdjForm && (
              <div style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-60)', marginBottom: 5 }}>Date</label>
                    <input type="date" value={adjForm.date} onChange={(e) => setAdjForm({ ...adjForm, date: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-md)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', background: 'var(--paper)', fontFamily: 'var(--font-body)', outline: 'none' }} /></div>
                  <div><label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-60)', marginBottom: 5 }}>Type</label>
                    <select value={adjForm.dotType} onChange={(e) => setAdjForm({ ...adjForm, dotType: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-md)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', background: 'var(--paper)', fontFamily: 'var(--font-body)', outline: 'none' }}>
                      <option value="info">Info</option><option value="warn">Warning</option><option value="done">Done</option><option value="idle">Idle</option>
                    </select></div>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-60)', marginBottom: 5 }}>Reason *</label>
                  <input type="text" value={adjForm.reason} onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })} placeholder="e.g. Adjourned — counsel unavailable" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-md)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', background: 'var(--paper)', fontFamily: 'var(--font-body)', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-60)', marginBottom: 5 }}>Notes</label>
                  <input type="text" value={adjForm.notes} onChange={(e) => setAdjForm({ ...adjForm, notes: e.target.value })} placeholder="Optional notes…" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-md)', borderRadius: 8, fontSize: 13, color: 'var(--ink)', background: 'var(--paper)', fontFamily: 'var(--font-body)', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" onClick={handleAddAdj}><i className="ti ti-check" style={{ marginRight: 6 }} />Save record</button>
                  <button className="btn btn-ghost" onClick={() => setShowAdjForm(false)}>Cancel</button>
                </div>
              </div>
            )}
            <div className="timeline">
              {!caseDoc.adjournments?.length && <p style={{ color: 'var(--ink-60)', fontSize: 13 }}>No adjournment records yet.</p>}
              {(caseDoc.adjournments || []).map((a) => (
                <div key={a._id} className="tl-item">
                  <div className={`tl-dot ${a.dotType || 'info'}`} />
                  <div className="tl-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="tl-title" style={{ flex: 1 }}>{a.reason}</div>
                      <button onClick={() => handleDeleteAdj(a._id)} className="icon-btn" style={{ flexShrink: 0, color: 'var(--red)', marginLeft: 8 }} title="Remove"><i className="ti ti-trash" /></button>
                    </div>
                    <div className="tl-date">{new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    {a.notes && <div className="tl-note">{a.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div>
            <div className="upload-zone" onClick={() => fileRef.current.click()}>
              <i className="ti ti-cloud-upload" />
              {uploading ? 'Uploading…' : 'Drag & drop or click to upload — PDF, scanned letters, annexures, photos'}
            </div>
            <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.zip,.doc,.docx" />
            <div className="doc-list">
              {!caseDoc.documents?.length && <p style={{ color: 'var(--ink-60)', fontSize: 13, padding: '8px 0' }}>No documents uploaded yet.</p>}
              {(caseDoc.documents || []).map((doc) => (
                <div key={doc._id} className={`doc-item${doc.status === 'pending' ? ' doc-pending' : ''}`}>
                  <div className="doc-left">
                    <i className={`ti ${fileIcon[doc.fileType] || 'ti-file'}`} />
                    <span className="doc-name">{doc.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="doc-type-tag">{doc.fileType}</span>
                    <div className="doc-actions">
                      {doc.filePath && <a href={doc.filePath} target="_blank" rel="noreferrer"><button className="icon-btn" title="View"><i className="ti ti-eye" /></button></a>}
                      {doc.status !== 'pending' && (
                        <button className="icon-btn" onClick={() => handleDeleteDoc(doc._id)} title="Delete" style={{ color: 'var(--red)' }}><i className="ti ti-trash" /></button>
                      )}
                      {doc.status === 'pending' && <button className="icon-btn" onClick={() => fileRef.current.click()} title="Upload"><i className="ti ti-upload" /></button>}
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
