import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../services/api.js';
import './OTPModal.css';

export default function OTPModal({ email, onVerified, onClose }) {
  const { login } = useAuth();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    setStatus('idle');
    setErrorMsg('');
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    pasted.split('').forEach((ch, i) => { if (i < 6) next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const verify = async () => {
    const entered = otp.join('');
    if (entered.length < 6) { 
        setStatus('error'); 
        setErrorMsg('Please enter all 6 digits.');
        return; 
    }
    
    setIsVerifying(true);
    setStatus('idle');
    setErrorMsg('');

    try {
      const res = await api.post('/auth/verify-otp', { email, otp: entered });
      setStatus('success');
      login(res.data); // Save JWT and authenticate user
      setTimeout(onVerified, 800);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Incorrect OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const resend = async () => {
    setCanResend(false);
    
    try {
      await api.post(`/auth/resend-otp?email=${encodeURIComponent(email)}`, {});
      setCountdown(60);
      setStatus('idle');
      setErrorMsg('');
      setOtp(['', '', '', '', '', '']);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setCanResend(true);
      setStatus('error');
      setErrorMsg(err.message || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="otp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="otp-modal anim-fadeInUp">
        <button className="otp-close" onClick={onClose}>✕</button>

        <div className="otp-icon">✉️</div>
        <h2 className="otp-title">Verify Your Email</h2>
        <p className="otp-sub">
          We sent a 6-digit code to<br />
          <strong>{email}</strong>
        </p>

        <div className="otp-inputs" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => (inputRefs.current[i] = el)}
              id={`otp-digit-${i}`}
              className={`otp-digit ${status === 'error' ? 'error' : ''} ${status === 'success' ? 'success' : ''}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              autoComplete="off"
            />
          ))}
        </div>

        {status === 'error' && <p className="otp-feedback error">❌ {errorMsg}</p>}
        {status === 'success' && <p className="otp-feedback success">✅ Verified! Redirecting...</p>}

        <button
          id="otp-verify-btn"
          className="btn btn-primary btn-full mt-16"
          onClick={verify}
          disabled={status === 'success' || isVerifying}
        >
          {isVerifying ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className="otp-resend">
          {canResend ? (
            <button type="button" className="otp-resend-btn" onClick={resend}>Resend OTP</button>
          ) : (
            <span>Resend in <strong>{countdown}s</strong></span>
          )}
        </div>
      </div>
    </div>
  );
}
