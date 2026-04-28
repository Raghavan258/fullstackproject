import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OTPModal from '../components/OTPModal.jsx';
import { api } from '../services/api.js';
import './Auth.css';

const ROLES = [
  { value: 'citizen',      label: '👤 Citizen / Student' },
  { value: 'educator',     label: '🏫 Educator' },
  { value: 'legal_expert', label: '⚖️ Legal Expert' },
  { value: 'admin',        label: '🛡️ Admin' },
];

export default function Register() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', role: '',
    password: '', retypePassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showRepass, setShowRepass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverErr, setServerErr] = useState('');

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }));
    setErrors(p => ({ ...p, [field]: '' }));
    setServerErr('');
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())     e.fullName = 'Full name is required';
    else if (form.fullName.trim().length < 2) e.fullName = 'Too short';
    if (!form.email)               e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone)               e.phone    = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Must be 10 digits';
    if (!form.role)                e.role     = 'Please select a role';
    if (!form.password)            e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    else if (!/(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = 'Must include uppercase and a number';
    if (!form.retypePassword)      e.retypePassword = 'Please confirm password';
    else if (form.password !== form.retypePassword) e.retypePassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    setServerErr('');

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        role: form.role,
        password: form.password
      };
      
      await api.post('/auth/register', payload);
      setStep(2); // On success, show OTP modal
    } catch (err) {
      setServerErr(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = () => {
    // OTPModal already updates AuthContext, so we just navigate
    navigate('/dashboard');
  };

  const progress = step === 2 ? 100 : (() => {
    const fields = ['fullName','email','phone','role','password','retypePassword'];
    const filled = fields.filter(f => form[f]).length;
    return Math.round((filled / fields.length) * 90);
  })();

  return (
    <div className="auth-page">
      <div className="auth-bg-orbs">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
      </div>

      {step === 2 && (
        <OTPModal
          email={form.email}
          onVerified={handleOTPVerified}
          onClose={() => setStep(1)}
        />
      )}

      <div className="auth-container register-layout">
        <div className="auth-panel auth-left">
          <div className="auth-brand">
            <div className="brand-icon">🇮🇳</div>
            <h1 className="brand-title heading-display">
              Join the<br /><span className="saffron-text">Movement</span>
            </h1>
            <p className="brand-sub">
              Register to access role-specific resources, help fellow citizens understand their rights and duties.
            </p>
          </div>

          <div className="role-preview-list">
            {ROLES.map(r => (
              <div
                key={r.value}
                className={`role-preview-item ${form.role === r.value ? 'selected' : ''}`}
                onClick={() => { setForm(p => ({...p, role: r.value})); setErrors(p => ({...p, role:''})); }}
              >
                {r.label}
              </div>
            ))}
          </div>
        </div>

        <div className="auth-panel auth-right">
          <div className="auth-form-wrap">
            <div className="auth-form-header">
              <h2 className="auth-form-title">Create Account</h2>
              <p className="auth-form-sub">Fill in your details to get started</p>
              <div className="reg-progress-bar">
                <div className="reg-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {serverErr && <div className="auth-alert error"><span>⚠️</span> {serverErr}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">Full Name</label>
                  <input id="reg-name" className={`form-input ${errors.fullName ? 'error':''}`}
                    type="text" placeholder="Arjun Sharma" value={form.fullName} onChange={set('fullName')} />
                  {errors.fullName && <span className="form-error">⚠ {errors.fullName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-phone">Phone Number</label>
                  <input id="reg-phone" className={`form-input ${errors.phone ? 'error':''}`}
                    type="tel" placeholder="9876543210" value={form.phone} onChange={set('phone')} maxLength={10} />
                  {errors.phone && <span className="form-error">⚠ {errors.phone}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <input id="reg-email" className={`form-input ${errors.email ? 'error':''}`}
                  type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
                {errors.email && <span className="form-error">⚠ {errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-role">Select Your Role</label>
                <select id="reg-role" className={`form-select ${errors.role ? 'error':''}`}
                  value={form.role} onChange={set('role')}>
                  <option value="">-- Choose a Role --</option>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                {errors.role && <span className="form-error">⚠ {errors.role}</span>}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">Password</label>
                  <div className="input-icon-wrap">
                    <input id="reg-password" className={`form-input ${errors.password ? 'error':''}`}
                      type={showPass ? 'text' : 'password'} placeholder="Min 8 chars"
                      value={form.password} onChange={set('password')} />
                    <button type="button" className="input-icon-btn" onClick={() => setShowPass(p=>!p)}>
                      {showPass ? '🙈' : '👁'}
                    </button>
                  </div>
                  {errors.password && <span className="form-error">⚠ {errors.password}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-repass">Confirm Password</label>
                  <div className="input-icon-wrap">
                    <input id="reg-repass" className={`form-input ${errors.retypePassword ? 'error':''}`}
                      type={showRepass ? 'text' : 'password'} placeholder="Re-enter"
                      value={form.retypePassword} onChange={set('retypePassword')} />
                    <button type="button" className="input-icon-btn" onClick={() => setShowRepass(p=>!p)}>
                      {showRepass ? '🙈' : '👁'}
                    </button>
                  </div>
                  {errors.retypePassword && <span className="form-error">⚠ {errors.retypePassword}</span>}
                </div>
              </div>

              <div className="password-strength">
                {['Uppercase','Number','8+ chars'].map(rule => (
                  <span
                    key={rule}
                    className={`strength-tag ${
                      (rule === 'Uppercase' && /[A-Z]/.test(form.password)) ||
                      (rule === 'Number'    && /\d/.test(form.password)) ||
                      (rule === '8+ chars'  && form.password.length >= 8) ? 'met' : ''
                    }`}
                  >
                    {rule}
                  </span>
                ))}
              </div>

              <button id="register-submit-btn" type="submit" className="btn btn-primary btn-full mt-16" disabled={loading}>
                {loading ? <><span className="spinner"/>Reqesting OTP...</> : 'Register & Verify Email →'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
