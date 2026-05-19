import { useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';

const COLOR_OPTIONS = [
  { value:'orange', label:'Orange',  bg:'#FFF4EC', text:'#C94B10', dot:'#F07B2B' },
  { value:'blue',   label:'Blue',    bg:'#EFF6FF', text:'#1E40AF', dot:'#2563EB' },
  { value:'green',  label:'Green',   bg:'#F0FDF4', text:'#166534', dot:'#16A34A' },
  { value:'purple', label:'Purple',  bg:'#F5F3FF', text:'#5B21B6', dot:'#7C3AED' },
  { value:'red',    label:'Red',     bg:'#FEF2F2', text:'#991B1B', dot:'#DC2626' },
];

export default function PublicLawyerForm() {
  const [form, setForm] = useState({
    name:'', specialisation:'', court:'',
    phone:'', email:'', chamber:'',
    feesYTD: 0, colorVariant: 'orange',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error,   setError]   = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.specialisation || !form.court)
      return setError('Name, specialisation, and court are required');

    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API}/lawyers/public`, form);
      setSuccess(res.data.lawyer);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (success) return (
    <div style={S.page}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={S.header}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ width:44, height:44, background:'rgba(255,255,255,0.18)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'#fff', border:'1px solid rgba(255,255,255,0.2)' }}>
            <i className="ti ti-user-check" />
          </div>
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#fff' }}>Neoteric Group</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Lawyer Registration</div>
          </div>
        </div>
      </div>
      <div style={{ ...S.card, textAlign:'center', padding:'40px 24px' }}>
        <div style={{ width:64, height:64, background:'#F0FDF4', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', border:'2px solid #86EFAC' }}>
          <i className="ti ti-check" style={{ fontSize:32, color:'#16A34A' }} />
        </div>
        <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:26, color:'#1C1A18', marginBottom:8 }}>Lawyer Registered!</h2>
        <p style={{ fontSize:14, color:'#7A736C', marginBottom:24, lineHeight:1.6 }}>
          {success.name} has been successfully added to the Neoteric Legal lawyers directory.
        </p>
        <div style={{ background:'#FFF4EC', border:'1.5px solid #FDDBC0', borderRadius:10, padding:'16px 20px', marginBottom:28, textAlign:'left' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#9B9590', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>Registered As</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#F07B2B' }}>{success.name}</div>
          <div style={{ fontSize:13, color:'#4A4540', marginTop:4 }}>{success.specialisation}</div>
        </div>
        <button onClick={() => { setSuccess(null); setForm({ name:'', specialisation:'', court:'', phone:'', email:'', chamber:'', feesYTD:0, colorVariant:'orange' }); }}
          style={S.btnPrimary}>
          Register Another Lawyer
        </button>
      </div>
    </div>
  );

  const selectedColor = COLOR_OPTIONS.find((c) => c.value === form.colorVariant) || COLOR_OPTIONS[0];

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input,select,textarea{transition:border-color 0.13s,box-shadow 0.13s;}
        input:focus,select:focus,textarea:focus{outline:none;border-color:#F07B2B !important;box-shadow:0 0 0 3px rgba(240,123,43,0.10) !important;background:#fff !important;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
          <div style={{ width:44, height:44, background:'rgba(255,255,255,0.18)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'#fff', border:'1px solid rgba(255,255,255,0.2)' }}>
            <i className="ti ti-user-check" />
          </div>
          <div>
            <div style={{ fontFamily:"'DM Serif Display',serif", fontSize:20, color:'#fff' }}>Neoteric Group</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Lawyer Registration</div>
          </div>
        </div>
        <h1 style={{ fontFamily:"'DM Serif Display',serif", fontSize:28, color:'#fff', fontWeight:400, marginBottom:8 }}>Register a Lawyer</h1>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.6 }}>
          Add a new lawyer to the Neoteric Legal directory. They will appear in the Lawyers section immediately.
        </p>
      </div>

      {/* Card */}
      <div style={S.card}>

        {error && (
          <div style={{ background:'#FEF2F2', border:'1.5px solid rgba(220,38,38,0.18)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'#C0392B', marginBottom:18, display:'flex', alignItems:'center', gap:8 }}>
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Preview card */}
          <div style={{ background: selectedColor.bg, border:`1.5px solid ${selectedColor.dot}30`, borderRadius:12, padding:'16px 18px', marginBottom:24, display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:48, height:48, borderRadius:12, background:`${selectedColor.dot}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:selectedColor.dot, fontFamily:"'DM Serif Display',serif", flexShrink:0 }}>
              {form.name ? form.name.replace(/^Adv\.\s*/i,'').split(' ').map(w=>w[0]?.toUpperCase()).slice(0,2).join('') : 'AB'}
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:'#1C1A18' }}>{form.name || 'Lawyer Name'}</div>
              <div style={{ fontSize:12, color:selectedColor.text, marginTop:2 }}>{form.specialisation || 'Specialisation'}</div>
              <div style={{ fontSize:11, color:'#7A736C', marginTop:1 }}>{form.court || 'Court'}</div>
            </div>
            <div style={{ marginLeft:'auto', fontSize:10, fontWeight:600, color:selectedColor.text, background:`${selectedColor.dot}15`, padding:'3px 10px', borderRadius:20, flexShrink:0 }}>
              Preview
            </div>
          </div>

          <div style={S.sectionTitle}><i className="ti ti-user" style={{ marginRight:6 }} />Personal Details</div>

          <div style={S.field}>
            <label style={S.label}>Full Name *</label>
            <input style={S.input} type="text" placeholder="Adv. Full Name" value={form.name} onChange={set('name')} required />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={S.field}>
              <label style={S.label}>Specialisation *</label>
              <input style={S.input} type="text" placeholder="Civil & Commercial" value={form.specialisation} onChange={set('specialisation')} required />
            </div>
            <div style={S.field}>
              <label style={S.label}>Court / Forum *</label>
              <input style={S.input} type="text" placeholder="District Court, Gwalior" value={form.court} onChange={set('court')} required />
            </div>
          </div>

          <div style={{ height:1, background:'#F0EDE8', margin:'8px 0 16px' }} />
          <div style={S.sectionTitle}><i className="ti ti-phone" style={{ marginRight:6 }} />Contact Details</div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={S.field}>
              <label style={S.label}>Phone</label>
              <input style={S.input} type="text" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={set('phone')} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Email</label>
              <input style={S.input} type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} />
            </div>
          </div>

          <div style={S.field}>
            <label style={S.label}>Chamber Address</label>
            <input style={S.input} type="text" placeholder="Chamber 14, District Bar, Gwalior" value={form.chamber} onChange={set('chamber')} />
          </div>

          <div style={{ height:1, background:'#F0EDE8', margin:'8px 0 16px' }} />
          <div style={S.sectionTitle}><i className="ti ti-palette" style={{ marginRight:6 }} />Card Appearance</div>

          <div style={S.field}>
            <label style={S.label}>Card Colour</label>
            <div style={{ display:'flex', gap:10, marginTop:6 }}>
              {COLOR_OPTIONS.map((c) => (
                <button key={c.value} type="button"
                  onClick={() => setForm((f) => ({ ...f, colorVariant: c.value }))}
                  title={c.label}
                  style={{ width:34, height:34, borderRadius:'50%', background:c.bg, border: form.colorVariant === c.value ? `3px solid ${c.dot}` : '2px solid #E8E4DF', cursor:'pointer', outline: form.colorVariant === c.value ? `2px solid ${c.dot}` : 'none', outlineOffset:2, transition:'all 0.13s' }}
                >
                  <span style={{ width:14, height:14, borderRadius:'50%', background:c.dot, display:'block', margin:'auto' }} />
                </button>
              ))}
            </div>
          </div>

          <div style={S.field}>
            <label style={S.label}>Fees YTD (₹)</label>
            <input style={{ ...S.input, maxWidth:180 }} type="number" min="0" placeholder="0" value={form.feesYTD} onChange={set('feesYTD')} />
          </div>

          <button type="submit" style={{ ...S.btnPrimary, width:'100%', justifyContent:'center', marginTop:8 }} disabled={loading}>
            {loading ? (
              <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.35)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', marginRight:8, display:'inline-block' }} />Registering…</>
            ) : (
              <><i className="ti ti-user-plus" style={{ marginRight:8 }} />Register Lawyer</>
            )}
          </button>
        </form>
      </div>

      <div style={{ textAlign:'center', padding:'20px 0 32px', fontSize:12, color:'#9B9590', fontFamily:"'DM Sans',sans-serif" }}>
        © 2026 Neoteric Group · Legal Management System
      </div>
    </div>
  );
}

const S = {
  page: { minHeight:'100vh', background:'#F4F4F6', fontFamily:"'DM Sans',system-ui,sans-serif" },
  header: { background:'linear-gradient(145deg, #E8581A 0%, #C94B10 60%, #A83C0C 100%)', padding:'36px 24px 40px', position:'relative', overflow:'hidden' },
  card: { background:'#fff', borderRadius:16, boxShadow:'0 4px 24px rgba(0,0,0,0.08)', padding:'28px', margin:'-20px auto 0', position:'relative', maxWidth:560, marginLeft:'auto', marginRight:'auto', marginTop:'-20px' },
  sectionTitle: { fontSize:12, fontWeight:700, color:'#F07B2B', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16, display:'flex', alignItems:'center', paddingBottom:8, borderBottom:'1.5px solid #FFF0E5' },
  field: { marginBottom:13 },
  label: { display:'block', fontSize:12, fontWeight:600, color:'#4A4540', marginBottom:6 },
  input: { width:'100%', padding:'10px 13px', border:'1.5px solid #E8E4DF', borderRadius:9, fontSize:13.5, color:'#1C1A18', background:'#FAFAF9', fontFamily:"'DM Sans',sans-serif" },
  btnPrimary: { display:'inline-flex', alignItems:'center', padding:'11px 20px', background:'#F07B2B', color:'#fff', border:'none', borderRadius:9, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 3px 12px rgba(240,123,43,0.28)' },
};
