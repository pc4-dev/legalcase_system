import { useState, useEffect, useCallback } from 'react';
import { caseService } from '../../services/caseService';
import EditCaseModal from './EditCaseModal';
import { CaseCardSkeleton } from '../Common/Skeleton';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—';

const STAGE_COLOR = {
  filing: 'sp-filing', hearing: 'sp-hearing', arguments: 'sp-arguments',
  decree: 'sp-decree', settled: 'sp-settled', appeal: 'sp-appeal',
};

export default function CasesList({ selectedId, onSelect, onDeleted, newCase }) {
  const [cases,      setCases]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('all');
  const [editCase,   setEditCase]   = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [hoverId,    setHoverId]    = useState(null);
  const [addedIds,   setAddedIds]   = useState(new Set()); // track newly added for highlight

  /* Initial fetch */
  const fetchCases = useCallback(() => {
    setLoading(true);
    const params = { limit: 50 };
    if (status !== 'all') params.status = status;
    if (search) params.search = search;
    caseService.getAll(params)
      .then((d) => setCases(d.cases || []))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  /* ── Instant add — when NewCaseModal submits ── */
  useEffect(() => {
    if (!newCase) return;
    setCases((prev) => {
      // Don't add duplicate
      if (prev.find((c) => c._id === newCase._id)) return prev;
      return [newCase, ...prev];
    });
    // Highlight the new card for 2s
    setAddedIds((prev) => new Set([...prev, newCase._id]));
    setTimeout(() => {
      setAddedIds((prev) => { const n = new Set(prev); n.delete(newCase._id); return n; });
    }, 2500);
    // Auto-select the new case
    if (onSelect) onSelect(newCase._id);
  }, [newCase]); // eslint-disable-line

  const handleDelete = async (e, c) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${c.caseCode}"?\n\n${c.title}\n\nThis cannot be undone.`)) return;
    setDeletingId(c._id);
    try {
      await caseService.remove(c._id);
      setCases((prev) => prev.filter((x) => x._id !== c._id));
      if (selectedId === c._id && onDeleted) onDeleted();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally { setDeletingId(null); }
  };

  const handleEditSaved = (updated) => {
    setCases((prev) => prev.map((c) => c._id === updated._id ? { ...c, ...updated } : c));
    setEditCase(null);
  };

  const FILTERS = ['all', 'urgent', 'active', 'pending', 'closed'];

  return (
    <>
      <style>{`
        @keyframes spin-icon { to { transform: rotate(360deg); } }
        @keyframes slideInCase {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: none; }
        }
        .action-btn {
          width:26px; height:26px; border-radius:6px;
          border:1px solid var(--border-md); background:var(--surface);
          cursor:pointer; display:flex; align-items:center;
          justify-content:center; font-size:13px; transition:all 0.12s;
        }
        .action-btn.edit  { color:var(--accent); }
        .action-btn.edit:hover  { background:var(--accent-light); border-color:var(--accent); }
        .action-btn.delet { color:var(--red); }
        .action-btn.delet:hover { background:var(--red-light); border-color:var(--red); }
        .case-new-flash { animation: slideInCase 0.35s ease; background: #FFF8F2 !important; border-left: 3px solid #F07B2B !important; }
        .party-chip { display:inline-flex;align-items:center;gap:4px;background:#F7F6F4;border:1px solid #E8E4DF;border-radius:5px;padding:2px 8px;font-size:11px;color:#4A4540;flex-shrink:0; }
        .party-vs { font-size:10px;font-weight:700;color:#C4BDB6;letter-spacing:0.04em; }
      `}</style>

      <div className="list-pane">

        {/* Filter bar */}
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', background:'var(--surface)', position:'sticky', top:0, zIndex:2 }}>
          <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
            {FILTERS.map((f) => (
              <button key={f} className={`ftab${status === f ? ' on' : ''}`} onClick={() => setStatus(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="search-wrap">
            <i className="ti ti-search" />
            <input type="text" placeholder="Search cases, parties, code…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Count bar */}
        <div style={{ padding:'7px 16px', fontSize:11, color:'var(--ink-60)', borderBottom:'1px solid var(--border)', background:'var(--paper)', display:'flex', alignItems:'center', gap:6 }}>
          {loading ? (
            <span style={{ color:'var(--ink-40)' }}>Loading…</span>
          ) : (
            <>
              <span>{cases.length} matter{cases.length !== 1 ? 's' : ''}</span>
              {addedIds.size > 0 && (
                <span style={{ fontSize:10, background:'#FFF4EC', color:'#F07B2B', padding:'2px 8px', borderRadius:20, fontWeight:600, border:'1px solid #FDDBC0' }}>
                  <i className="ti ti-sparkles" style={{ marginRight:3 }} />
                  {addedIds.size} new
                </span>
              )}
            </>
          )}
        </div>

        {/* ── SKELETON LOADING ── */}
        {loading && (
          <div>
            {Array.from({ length: 6 }).map((_, i) => <CaseCardSkeleton key={i} />)}
          </div>
        )}

        {/* ── CASES LIST ── */}
        {!loading && cases.map((c) => {
          const isDeleting = deletingId === c._id;
          const isHovered  = hoverId    === c._id;
          const isSelected = selectedId === c._id;
          const isNew      = addedIds.has(c._id);
          const hasPetResp = c.petitionerName || c.respondentName;

          return (
            <div
              key={c._id}
              className={`list-item${isSelected ? ' selected' : ''}${isNew ? ' case-new-flash' : ''}`}
              onClick={() => onSelect(c._id)}
              onMouseEnter={() => setHoverId(c._id)}
              onMouseLeave={() => setHoverId(null)}
              style={{ position:'relative', opacity: isDeleting ? 0.45 : 1, transition:'background 0.3s, border-left 0.3s' }}
            >
              {/* Row 1: code · status · actions */}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                <span className="li-code" style={{ flexShrink:0 }}>{c.caseCode}</span>
                <span className={`status-dot sd-${c.status}`} style={{ fontSize:11 }}>
                  {c.status?.charAt(0).toUpperCase() + c.status?.slice(1)}
                </span>
                {isNew && (
                  <span style={{ fontSize:10, background:'#F07B2B', color:'#fff', padding:'1px 6px', borderRadius:10, fontWeight:700, flexShrink:0 }}>NEW</span>
                )}
                <div style={{ flex:1 }} />
                {/* Action buttons — visible on hover */}
                <div style={{ display:'flex', gap:4, opacity:isHovered?1:0, transition:'opacity 0.15s', pointerEvents:isHovered?'auto':'none' }}
                  onClick={(e) => e.stopPropagation()}>
                  <button className="action-btn edit" title="Edit" onClick={(e) => { e.stopPropagation(); setEditCase(c); }}>
                    <i className="ti ti-edit" />
                  </button>
                  <button className="action-btn delet" title="Delete" disabled={isDeleting} onClick={(e) => handleDelete(e, c)}>
                    {isDeleting
                      ? <i className="ti ti-loader-2" style={{ animation:'spin-icon 0.7s linear infinite', display:'block' }} />
                      : <i className="ti ti-trash" />}
                  </button>
                </div>
              </div>

              {/* Petitioner v. Respondent */}
              {hasPetResp && (
                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:5, flexWrap:'wrap' }}>
                  {c.petitionerName && <span className="party-chip"><i className="ti ti-user" style={{ fontSize:10, color:'#7A736C' }} />{c.petitionerName}</span>}
                  {c.petitionerName && c.respondentName && <span className="party-vs">v.</span>}
                  {c.respondentName && <span className="party-chip"><i className="ti ti-user" style={{ fontSize:10, color:'#7A736C' }} />{c.respondentName}</span>}
                </div>
              )}

              {/* Title */}
              <div className="li-title" style={{ marginBottom:5 }}>{c.title}</div>

              {/* Meta row */}
              <div className="li-meta">
                <span><i className="ti ti-building-bank" />{c.court?.split(',')[0]}</span>
                <span className={`stage-pill ${STAGE_COLOR[c.stage] || 'sp-filing'}`}>
                  {c.stage?.charAt(0).toUpperCase() + c.stage?.slice(1)}
                </span>
                {c.nextHearingDate && (
                  <span style={{ color:c.status==='urgent'?'var(--red)':undefined, fontWeight:c.status==='urgent'?600:undefined }}>
                    <i className="ti ti-calendar-event" />{fmtDate(c.nextHearingDate)}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {!loading && cases.length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 20px', color:'var(--ink-60)' }}>
            <i className="ti ti-file-search" style={{ fontSize:36, display:'block', marginBottom:10, color:'#FDDBC0' }} />
            <div style={{ fontSize:14, fontWeight:600, color:'var(--ink)' }}>No cases found</div>
            <div style={{ fontSize:13, marginTop:4 }}>Try changing the filter or search term</div>
          </div>
        )}
      </div>

      <EditCaseModal open={!!editCase} caseData={editCase} onClose={() => setEditCase(null)} onSaved={handleEditSaved} />
    </>
  );
}
