import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Captcha from '../components/Captcha.jsx';
import { api } from '../services/api.js';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [captchaOk, setCaptchaOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loginErr, setLoginErr] = useState('');

  const validate = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    if (!captchaOk)     e.captcha  = 'Please solve the CAPTCHA';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setLoginErr('');
    
    try {
      const res = await api.post('/auth/login', form);
      login(res.data);
      navigate('/dashboard');
    } catch (err) {
      setLoginErr(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
    setLoginErr('');
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="auth-container">
        {/* Left panel */}
        <div className="auth-panel auth-left">
          <div className="auth-brand">
            <div className="brand-icon">⚖️</div>
            <h1 className="brand-title heading-display">
              Know Your<br /><span className="saffron-text">Constitution</span>
            </h1>
            <p className="brand-sub">
              Join thousands of citizens, educators, and legal experts building constitutional awareness across India.
            </p>
          </div>
          <div className="auth-stats">
            {[['50K+','Citizens Enrolled'],['1.2K','Educators'],['300+','Legal Experts'],['900+','Articles']].map(([v, l]) => (
              <div className="auth-stat" key={l}>
                <span className="auth-stat-val">{v}</span>
                <span className="auth-stat-lbl">{l}</span>
              </div>
            ))}
          </div>
          <div className="auth-constitution-strip">
            <span className="strip-saffron" />
            <span className="strip-white" />
            <span className="strip-green" />
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-panel auth-right">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <h2 className="auth-form-title">Welcome Back</h2>
              <p className="auth-form-sub">Sign in to continue your journey</p>
            </div>

            {loginErr && (
              <div className="auth-alert error">
                <span>⚠️</span> {loginErr}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
                {errors.email && <span className="form-error">⚠ {errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="login-password">Password</label>
                <div className="input-icon-wrap">
                  <input
                    id="login-password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={form.password}
                    onChange={set('password')}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-icon-btn"
                    onClick={() => setShowPass(p => !p)}
                    aria-label="Toggle password"
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && <span className="form-error">⚠ {errors.password}</span>}
              </div>

              <Captcha onVerify={setCaptchaOk} />
              {errors.captcha && <span className="form-error" style={{marginTop:'-12px',marginBottom:'12px',display:'block'}}>⚠ {errors.captcha}</span>}

              <button
                id="login-submit-btn"
                type="submit"
                className="btn btn-primary btn-full"
                disabled={loading}
              >
                {loading ? <><span className="spinner" /> Signing In...</> : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider"><span>Testing Helpers</span></div>
            <div style={{fontSize:'0.82rem',color:'var(--text-muted)',marginBottom:'16px',textAlign:'center'}}>
              Use these to quickly populate the form. You must register these accounts in the backend first.
            </div>
            <div className="demo-chips">
              <button type="button" className="demo-chip" onClick={() => { setForm({ email: 'admin@const.in', password: 'Admin@123' }); setCaptchaOk(true); }}>Admin</button>
              <button type="button" className="demo-chip" onClick={() => { setForm({ email: 'citizen@const.in', password: 'Citizen@123' }); setCaptchaOk(true); }}>Citizen</button>
              <button type="button" className="demo-chip" onClick={() => { setForm({ email: 'edu@const.in', password: 'Edu@123' }); setCaptchaOk(true); }}>Educator</button>
              <button type="button" className="demo-chip" onClick={() => { setForm({ email: 'legal@const.in', password: 'Legal@123' }); setCaptchaOk(true); }}>Legal</button>
            </div>

            <p className="auth-switch">
              Don't have an account? <Link to="/register" className="auth-link">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
