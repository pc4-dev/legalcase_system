import { useState, useEffect } from 'react';
import { caseService } from '../../services/caseService';
import { lawyerService } from '../../services/lawyerService';

const ENTITIES = [
  'Neoteric Properties Pvt. Ltd.',
  'Navayan Realty',
  'Heaven Heights Pvt. Ltd.',
  'Neoteric Group',
];
const STAGES   = ['filing', 'hearing', 'arguments', 'decree', 'appeal', 'settled'];
const STATUSES = ['active', 'urgent', 'pending', 'closed'];

const toDateInput = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return '';
  return dt.toISOString().split('T')[0];
};

export default function EditCaseModal({ open, caseData, onClose, onSaved }) {
  const [form, setForm]       = useState({});
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Pre-fill form whenever caseData changes
  useEffect(() => {
    if (!caseData) return;
    setForm({
      caseCode:          caseData.caseCode          || '',
      title:             caseData.title             || '',
      subtitle:          caseData.subtitle          || '',
      entity:            caseData.entity            || ENTITIES[0],
      court:             caseData.court             || '',
      bench:             caseData.bench             || '',
      lawyer:            caseData.lawyer?._id       || caseData.lawyer || '',
      opposingCounsel:   caseData.opposingCounsel   || '',
      status:            caseData.status            || 'active',
      stage:             caseData.stage             || 'filing',
      nextHearingDate:   toDateInput(caseData.nextHearingDate),
      hearingType:       caseData.hearingType       || '',
      reliefByPlaintiff: caseData.reliefByPlaintiff || '',
      ourPosition:       caseData.ourPosition       || '',
      strategyRemarks:   caseData.strategyRemarks   || '',
    });
    setError('');
  }, [caseData]);

  useEffect(() => {
    lawyerService.getAll().then((d) => setLawyers(d.lawyers || []));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.caseCode || !form.title || !form.court)
      return setError('Case code, title, and court are required');

    setLoading(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.lawyer)          delete payload.lawyer;
      if (!payload.nextHearingDate) delete payload.nextHearingDate;

      const data = await caseService.update(caseData._id, payload);
      onSaved(data.case);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const labelStyle = {
    display: 'block', fontSize: 11, fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    color: 'var(--ink-60)', marginBottom: 5,
  };
  const inputStyle = {
    width: '100%', padding: '8px 12px',
    border: '1px solid var(--border-md)', borderRadius: 8,
    fontSize: 13, color: 'var(--ink)', background: 'var(--paper)',
    fontFamily: 'var(--font-body)', outline: 'none',
  };

  return (
    <div
      style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(15,14,12,0.45)', zIndex: 1000, alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', width: '90%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', animation: 'modalIn 0.2s ease' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400 }}>Edit Case</h3>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ink-60)', marginTop: 3 }}>{caseData?.caseCode}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><i className="ti ti-x" /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 24px' }}>
          {error && (
            <div style={{ background: 'var(--red-light)', border: '1px solid rgba(160,32,32,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="ti ti-alert-circle" /> {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Case code *</label>
              <input style={inputStyle} type="text" value={form.caseCode} onChange={set('caseCode')} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Status</label>
              <select style={inputStyle} value={form.status} onChange={set('status')}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Case title *</label>
            <input style={inputStyle} type="text" value={form.title} onChange={set('title')} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Subtitle / brief description</label>
            <input style={inputStyle} type="text" value={form.subtitle} onChange={set('subtitle')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Court *</label>
              <input style={inputStyle} type="text" value={form.court} onChange={set('court')} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Bench / court no.</label>
              <input style={inputStyle} type="text" value={form.bench} onChange={set('bench')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Stage</label>
              <select style={inputStyle} value={form.stage} onChange={set('stage')}>
                {STAGES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Entity</label>
              <select style={inputStyle} value={form.entity} onChange={set('entity')}>
                {ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Lawyer</label>
              <select style={inputStyle} value={form.lawyer} onChange={set('lawyer')}>
                <option value="">— Select lawyer —</option>
                {lawyers.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Opposing counsel</label>
              <input style={inputStyle} type="text" value={form.opposingCounsel} onChange={set('opposingCounsel')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Next hearing date</label>
              <input style={inputStyle} type="date" value={form.nextHearingDate} onChange={set('nextHearingDate')} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Hearing type</label>
              <input style={inputStyle} type="text" value={form.hearingType} onChange={set('hearingType')} placeholder="e.g. Final arguments" />
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Relief sought / plaintiff's claim</label>
            <input style={inputStyle} type="text" value={form.reliefByPlaintiff} onChange={set('reliefByPlaintiff')} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Our position</label>
            <input style={inputStyle} type="text" value={form.ourPosition} onChange={set('ourPosition')} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Strategy & remarks</label>
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              value={form.strategyRemarks}
              onChange={set('strategyRemarks')}
              placeholder="Key facts, evidence needed, risks…"
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '0 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
            style={{ minWidth: 110, justifyContent: 'center' }}
          >
            {loading
              ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-modal 0.7s linear infinite', marginRight: 8 }} />Saving…</>
              : <><i className="ti ti-check" style={{ marginRight: 6 }} />Save changes</>}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes modalIn    { from { opacity:0; transform:translateY(14px) scale(0.98); } to { opacity:1; transform:none; } }
        @keyframes spin-modal { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
