import { useState, useEffect } from 'react';
import { caseService } from '../../services/caseService';
import { lawyerService } from '../../services/lawyerService';

const ENTITIES = ['Neoteric Properties Pvt. Ltd.', 'Navayan Realty', 'Heaven Heights Pvt. Ltd.', 'Neoteric Group'];
const STAGES   = ['filing', 'hearing', 'arguments', 'decree', 'appeal', 'settled'];
const STATUSES = ['active', 'urgent', 'pending', 'closed'];

const INIT = {
  caseCode: '', title: '', subtitle: '', entity: ENTITIES[0],
  court: '', bench: '', lawyer: '', opposingCounsel: '',
  status: 'active', stage: 'filing', nextHearingDate: '',
  hearingType: '', reliefByPlaintiff: '', ourPosition: '', strategyRemarks: '',
};

const inputStyle = {
  width: '100%', padding: '8px 12px', border: '1px solid var(--border-md)',
  borderRadius: 8, fontSize: 13, color: 'var(--ink)', background: 'var(--paper)',
  fontFamily: 'var(--font-body)', outline: 'none',
};
const labelStyle = {
  display: 'block', fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
  letterSpacing: '0.08em', color: 'var(--ink-60)', marginBottom: 5,
};

export default function NewCaseModal({ open, onClose, onCreated }) {
  const [form, setForm]       = useState(INIT);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => {
    lawyerService.getAll().then((d) => setLawyers(d.lawyers || []));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.caseCode || !form.title || !form.court)
      return setError('Case code, title, and court are required');
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
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(15,14,12,0.45)', zIndex: 1000, alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(2px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', width: '90%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', animation: 'modalIn 0.2s ease' }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400 }}>Add new case</h3>
          <button className="icon-btn" onClick={onClose}><i className="ti ti-x" /></button>
        </div>
        <div style={{ padding: '16px 24px' }}>
          {error && (
            <div style={{ background: 'var(--red-light)', border: '1px solid rgba(160,32,32,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--red)', marginBottom: 14 }}>
              <i className="ti ti-alert-circle" style={{ marginRight: 6 }} />{error}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Case code *</label><input style={inputStyle} type="text" placeholder="CAS-2026-XXXX" value={form.caseCode} onChange={set('caseCode')} /></div>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Status</label><select style={inputStyle} value={form.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Case title / matter *</label><input style={inputStyle} type="text" placeholder="e.g. Party A v. Neoteric Properties — Lease dispute" value={form.title} onChange={set('title')} /></div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Subtitle</label><input style={inputStyle} type="text" placeholder="Brief description" value={form.subtitle} onChange={set('subtitle')} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Court *</label><input style={inputStyle} type="text" placeholder="District Court, Gwalior" value={form.court} onChange={set('court')} /></div>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Bench / court no.</label><input style={inputStyle} type="text" placeholder="ADJ-III" value={form.bench} onChange={set('bench')} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Stage</label><select style={inputStyle} value={form.stage} onChange={set('stage')}>{STAGES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}</select></div>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Entity</label><select style={inputStyle} value={form.entity} onChange={set('entity')}>{ENTITIES.map((e) => <option key={e} value={e}>{e}</option>)}</select></div>
          </div>
          <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Lawyer</label><select style={inputStyle} value={form.lawyer} onChange={set('lawyer')}><option value="">— Select lawyer —</option>{lawyers.map((l) => <option key={l._id} value={l._id}>{l.name}</option>)}</select></div>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Opposing counsel</label><input style={inputStyle} type="text" placeholder="Adv. Name / Party in person" value={form.opposingCounsel} onChange={set('opposingCounsel')} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Next hearing date</label><input style={inputStyle} type="date" value={form.nextHearingDate} onChange={set('nextHearingDate')} /></div>
            <div style={{ marginBottom: 12 }}><label style={labelStyle}>Hearing type</label><input style={inputStyle} type="text" placeholder="e.g. Final arguments" value={form.hearingType} onChange={set('hearingType')} /></div>
          </div>
          <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Relief sought / plaintiff's claim</label><input style={inputStyle} type="text" placeholder="e.g. Recovery of ₹XX / Dismiss the suit" value={form.reliefByPlaintiff} onChange={set('reliefByPlaintiff')} /></div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Our position</label><input style={inputStyle} type="text" placeholder="e.g. Dismiss the suit / counterclaim" value={form.ourPosition} onChange={set('ourPosition')} /></div>
          <div style={{ marginBottom: 12 }}><label style={labelStyle}>Strategy & remarks</label><textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Key facts, evidence needed, action items, risks…" value={form.strategyRemarks} onChange={set('strategyRemarks')} /></div>
        </div>
        <div style={{ padding: '0 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading} style={{ minWidth: 110, justifyContent: 'center' }}>
            {loading ? 'Saving…' : <><i className="ti ti-plus" style={{ marginRight: 6 }} />Save case</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn { from { opacity:0;transform:translateY(14px) scale(0.98);} to {opacity:1;transform:none;}}`}</style>
    </div>
  );
}
