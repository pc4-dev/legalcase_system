import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ marginBottom: 24 }}>
          <div style={{ width: 40, height: 40, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <i className="ti ti-gavel" style={{ color: '#fff', fontSize: 20 }} />
          </div>
          <h1>Neoteric Group</h1>
          <p>Legal Management System — sign in to continue</p>
        </div>

        {error && <div className="error-msg"><i className="ti ti-alert-circle" style={{ marginRight: 6 }} />{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email address</label>
            <input type="email" placeholder="rahul@neoteric.in" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px 14px', fontSize: 14 }} disabled={loading}>
            {loading ? <><span className="spinner" style={{ marginRight: 8 }} />Signing in…</> : 'Sign in'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--ink-30)', marginTop: 20, textAlign: 'center' }}>
          Default: rahul@neoteric.in / admin123
        </p>
      </div>
    </div>
  );
}
