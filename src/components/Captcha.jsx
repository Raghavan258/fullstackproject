import React, { useState, useEffect, useCallback } from 'react';
import './Captcha.css';

function generateChallenge() {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  if (op === '+') { a = Math.floor(Math.random() * 15) + 1; b = Math.floor(Math.random() * 15) + 1; answer = a + b; }
  else if (op === '-') { a = Math.floor(Math.random() * 15) + 6; b = Math.floor(Math.random() * (a - 1)) + 1; answer = a - b; }
  else { a = Math.floor(Math.random() * 9) + 2; b = Math.floor(Math.random() * 9) + 2; answer = a * b; }
  return { question: `${a} ${op} ${b} = ?`, answer };
}

export default function Captcha({ onVerify }) {
  const [challenge, setChallenge] = useState(generateChallenge);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('idle'); // idle | success | error

  const refresh = useCallback(() => {
    setChallenge(generateChallenge());
    setValue('');
    setStatus('idle');
    onVerify(false);
  }, [onVerify]);

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    if (val === '') { setStatus('idle'); onVerify(false); return; }
    if (parseInt(val, 10) === challenge.answer) {
      setStatus('success');
      onVerify(true);
    } else {
      setStatus('error');
      onVerify(false);
    }
  };

  return (
    <div className={`captcha-box ${status}`}>
      <div className="captcha-header">
        <span className="captcha-label">🔐 CAPTCHA Verification</span>
        <button type="button" className="captcha-refresh" onClick={refresh} title="Refresh">↻</button>
      </div>
      <div className="captcha-challenge">
        <span className="captcha-question">{challenge.question}</span>
        <input
          id="captcha-input"
          className="captcha-input"
          type="number"
          value={value}
          onChange={handleChange}
          placeholder="Answer"
          autoComplete="off"
        />
      </div>
      {status === 'success' && <p className="captcha-msg success">✅ Verified!</p>}
      {status === 'error' && <p className="captcha-msg error">❌ Incorrect answer</p>}
    </div>
  );
}
