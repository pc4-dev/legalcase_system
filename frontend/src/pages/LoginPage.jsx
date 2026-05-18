import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp-page {
          min-height: 100vh;
          background: #F4F4F6;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', system-ui, sans-serif;
          padding: 24px 16px;
        }

        /* ── Card ── */
        .lp-card {
          background: #FFFFFF;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
          padding: 40px 40px 36px;
          width: 100%;
          max-width: 440px;
          animation: lpFadeUp 0.3s ease;
        }
        @keyframes lpFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: none; }
        }

        /* ── Logo area ── */
        .lp-logo-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 28px;
        }
        .lp-logo-icon {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #F07B2B, #C94B10);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 4px 16px rgba(240,123,43,0.30);
        }
        .lp-logo-icon i {
          font-size: 30px;
          color: #fff;
        }
        .lp-logo-name {
          font-size: 13px;
          font-weight: 600;
          color: #7A736C;
          letter-spacing: 0.04em;
        }

        /* ── Heading ── */
        .lp-heading {
          text-align: center;
          margin-bottom: 28px;
        }
        .lp-heading h1 {
          font-size: 24px;
          font-weight: 800;
          color: #1C1A18;
          letter-spacing: -0.3px;
          margin-bottom: 6px;
        }
        .lp-heading p {
          font-size: 14px;
          color: #7A736C;
          font-weight: 400;
        }

        /* ── Error ── */
        .lp-error {
          background: #FEF2F2;
          border: 1.5px solid rgba(220,38,38,0.18);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13px;
          color: #C0392B;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: errShake 0.3s ease;
          line-height: 1.5;
        }
        .lp-error i { font-size: 16px; flex-shrink: 0; }
        @keyframes errShake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-5px); }
          75%      { transform: translateX(5px); }
        }

        /* ── Fields ── */
        .lp-field { margin-bottom: 16px; }
        .lp-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #3D3A36;
          margin-bottom: 7px;
        }
        .lp-field-wrap { position: relative; }

        .lp-field-icon {
          position: absolute;
          left: 13px; top: 50%;
          transform: translateY(-50%);
          font-size: 17px;
          color: #C4BDB6;
          pointer-events: none;
          transition: color 0.13s;
        }
        .lp-field-wrap:focus-within .lp-field-icon { color: #F07B2B; }

        .lp-input {
          width: 100%;
          height: 46px;
          padding: 0 14px 0 40px;
          border: 1.5px solid #E5E2DC;
          border-radius: 10px;
          font-size: 14px;
          color: #1C1A18;
          background: #FAFAF9;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.13s, background 0.13s, box-shadow 0.13s;
        }
        .lp-input:focus {
          border-color: #F07B2B;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(240,123,43,0.10);
        }
        .lp-input::placeholder { color: #C4BDB6; font-size: 13.5px; }

        .lp-pass-toggle {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer; color: #C4BDB6;
          font-size: 17px; padding: 4px;
          border-radius: 6px;
          transition: color 0.12s, background 0.12s;
        }
        .lp-pass-toggle:hover { color: #F07B2B; background: rgba(240,123,43,0.08); }

        /* ── Submit button ── */
        .lp-btn {
          width: 100%;
          height: 48px;
          background: #F07B2B;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          transition: background 0.14s, transform 0.14s, box-shadow 0.14s;
          box-shadow: 0 3px 12px rgba(240,123,43,0.28);
          letter-spacing: 0.01em;
        }
        .lp-btn:hover:not(:disabled) {
          background: #D96A1A;
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(240,123,43,0.32);
        }
        .lp-btn:active:not(:disabled) { transform: none; }
        .lp-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

        /* Spinner */
        .lp-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lpSpin 0.7s linear infinite;
        }
        @keyframes lpSpin { to { transform: rotate(360deg); } }

        /* ── Hint box ── */
        .lp-hint {
          margin-top: 22px;
          background: #FFF4EC;
          border: 1.5px solid rgba(240,123,43,0.16);
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 11px;
        }
        .lp-hint-icon {
          width: 34px; height: 34px;
          background: rgba(240,123,43,0.14);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; color: #F07B2B;
          flex-shrink: 0;
        }
        .lp-hint-title {
          font-size: 12px;
          font-weight: 700;
          color: #C94B10;
          margin-bottom: 7px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .lp-hint-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 5px;
          font-size: 13px;
        }
        .lp-hint-row:last-child { margin-bottom: 0; }
        .lp-hint-lbl {
          color: #7A736C;
          font-weight: 500;
          min-width: 64px;
        }
        .lp-hint-val {
          background: rgba(240,123,43,0.12);
          color: #C94B10;
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 12.5px;
          font-weight: 600;
          padding: 2px 9px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.12s;
          user-select: all;
        }
        .lp-hint-val:hover { background: rgba(240,123,43,0.20); }

        /* ── Footer ── */
        .lp-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 12px;
          color: #B8B0A8;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .lp-card { padding: 32px 24px 28px; }
          .lp-heading h1 { font-size: 21px; }
          .lp-logo-icon { width: 56px; height: 56px; }
          .lp-logo-icon i { font-size: 26px; }
        }
      `}</style>

      <div className="lp-page">
        <div className="lp-card">

          {/* ── Logo ── */}
          <div className="lp-logo-wrap">
            <div className="lp-logo-icon">
              <i className="ti ti-gavel" />
            </div>
            <div className="lp-logo-name">Neoteric Group</div>
          </div>

          {/* ── Heading ── */}
          <div className="lp-heading">
            <h1>Neoteric Legal</h1>
            <p>Sign in to your account</p>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="lp-error">
              <i className="ti ti-alert-circle" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit}>

            {/* Email */}
            <div className="lp-field">
              <label htmlFor="lp-email">Email address</label>
              <div className="lp-field-wrap">
                <i className="ti ti-mail lp-field-icon" />
                <input
                  id="lp-email"
                  className="lp-input"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="lp-field">
              <label htmlFor="lp-password">Password</label>
              <div className="lp-field-wrap">
                <i className="ti ti-lock lp-field-icon" />
                <input
                  id="lp-password"
                  className="lp-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  className="lp-pass-toggle"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                  title={showPass ? 'Hide password' : 'Show password'}
                >
                  <i className={`ti ${showPass ? 'ti-eye-off' : 'ti-eye'}`} />
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="lp-btn" disabled={loading}>
              {loading
                ? <><div className="lp-spinner" /> Signing in…</>
                : 'Log in'}
            </button>

          </form>

          {/* ── Credentials hint ── */}


          {/* ── Footer ── */}
          <div className="lp-footer">
            © 2026 Neoteric Group · Legal Management System
          </div>

        </div>
      </div>
    </>
  );
}
