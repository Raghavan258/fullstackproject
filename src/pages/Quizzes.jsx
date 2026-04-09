import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import './Pages.css';

const FALLBACK_QUESTIONS = [
  { id: 1, question: 'What does the word "Sovereign" in the Preamble mean?', options: ['India is supreme', 'India is democratic', 'India is not dependent on any outside power', 'India has a single ruler'], correctOption: 2, category: 'Preamble' },
  { id: 2, question: 'Which Article guarantees Right to Equality?', options: ['Article 12', 'Article 14', 'Article 19', 'Article 21'], correctOption: 1, category: 'Rights' },
  { id: 3, question: 'The Right to Education was added by which Amendment?', options: ['42nd', '86th', '44th', '91st'], correctOption: 1, category: 'Amendments' },
  { id: 4, question: 'Article 21 deals with:', options: ['Right to Vote', 'Right to Property', 'Right to Life and Personal Liberty', 'Right to Education'], correctOption: 2, category: 'Rights' },
  { id: 5, question: 'Which case established the Basic Structure Doctrine?', options: ['Maneka Gandhi vs Union of India', 'Kesavananda Bharati vs State of Kerala', 'Golaknath vs State of Punjab', 'Minerva Mills vs Union of India'], correctOption: 1, category: 'Case Studies' },
  { id: 6, question: 'How many Fundamental Rights are guaranteed by the Indian Constitution?', options: ['5', '6', '7', '8'], correctOption: 1, category: 'Rights' },
  { id: 7, question: 'Article 32 is called the "Heart of the Constitution" because:', options: ['It defines Parliament', 'It allows citizens to approach Supreme Court to enforce Fundamental Rights', 'It provides for the Preamble', 'It defines citizenship'], correctOption: 1, category: 'Rights' },
  { id: 8, question: 'The word "Socialist" was added to the Preamble by which Amendment?', options: ['24th', '42nd', '44th', '86th'], correctOption: 1, category: 'Amendments' },
  { id: 9, question: 'How many Fundamental Duties are listed in Article 51A?', options: ['9', '10', '11', '12'], correctOption: 2, category: 'Duties' },
  { id: 10, question: 'The Directive Principles of State Policy are contained in which Part?', options: ['Part II', 'Part III', 'Part IV', 'Part V'], correctOption: 2, category: 'DPSP' },
];

const CATEGORIES = ['All', 'Preamble', 'Rights', 'Amendments', 'Case Studies', 'Duties', 'DPSP'];

export default function Quizzes() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [catFilter, setCatFilter] = useState('All');
  const [serverScore, setServerScore] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/quizzes')
      .then(res => {
        const qs = res.data?.content || res.data;
        if (Array.isArray(qs) && qs.length > 0) {
          setQuestions(qs);
        } else {
          setQuestions(FALLBACK_QUESTIONS);
        }
      })
      .catch(() => setQuestions(FALLBACK_QUESTIONS))
      .finally(() => setLoading(false));
  }, []);

  const displayed = catFilter === 'All' ? questions : questions.filter(q => q.category === catFilter);

  const pick = (qId, oi) => {
    if (!submitted) setAnswers(p => ({ ...p, [qId]: oi }));
  };

  const localScore = () => {
    return displayed.filter(q => answers[q.id] === q.correctOption).length;
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      // Build answer map: { questionId: selectedOption }
      const answerMap = {};
      displayed.forEach(q => {
        if (answers[q.id] !== undefined) answerMap[q.id] = answers[q.id];
      });
      const res = await api.post('/quizzes/submit', answerMap);
      setServerScore(res.data?.score ?? localScore());
    } catch {
      setServerScore(localScore()); // fall back to local scoring
    } finally {
      setSubmitLoading(false);
      setSubmitted(true);
      showToast('✅ Quiz submitted!');
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const retake = () => {
    setAnswers({});
    setSubmitted(false);
    setServerScore(null);
  };

  const score = serverScore ?? localScore();
  const answeredCount = Object.keys(answers).filter(k => displayed.find(q => q.id === Number(k))).length;

  return (
    <div className="page-content container">
      {/* Toast */}
      {toast && (
        <div className="quiz-toast" style={{ position: 'fixed', top: '20px', right: '20px', background: 'var(--saffron)', color: '#000', padding: '12px 20px', borderRadius: '8px', fontWeight: 700, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      <div className="page-hero">
        <div className="section-tag">🧠 Quizzes</div>
        <h1 className="page-title heading-display">Test Your <span className="saffron-text">Knowledge</span></h1>
        <p className="page-sub">Constitutional awareness quiz. Select answers and submit — your score will be recorded.</p>
      </div>

      {/* Category filter */}
      <div className="cat-filter">
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`cat-btn ${catFilter === c ? 'active' : ''}`}
            onClick={() => { if (!submitted) { setCatFilter(c); setAnswers({}); } }}
            disabled={submitted}
          >{c}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
          Loading questions...
        </div>
      ) : (
        <>
          {submitted && (
            <div className={`quiz-score-banner ${score >= displayed.length * 0.8 ? 'great' : score >= displayed.length * 0.5 ? 'good' : 'try'}`}>
              <span className="quiz-score-icon">{score >= displayed.length * 0.8 ? '🏆' : score >= displayed.length * 0.5 ? '👏' : '📚'}</span>
              <div>
                <div className="quiz-score-text">You scored {score} / {displayed.length}</div>
                <div className="quiz-score-sub">
                  {score >= displayed.length * 0.8 ? 'Excellent! You know your Constitution.' : score >= displayed.length * 0.5 ? 'Good effort! Review the incorrect answers.' : 'Keep studying! You can do better.'}
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={retake}>Retake Quiz</button>
            </div>
          )}

          {/* Progress bar while answering */}
          {!submitted && displayed.length > 0 && (
            <div className="glass-card dash-section-card mb-24" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Progress</span>
                <span>{answeredCount} / {displayed.length} answered</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(answeredCount / displayed.length) * 100}%` }} />
              </div>
            </div>
          )}

          <div className="quiz-questions">
            {displayed.map((q, qi) => (
              <div key={q.id} className="quiz-card glass-card">
                <div className="quiz-num">Question {qi + 1} {q.category && <span className="badge badge-navy" style={{ fontSize: '0.7rem', marginLeft: '8px' }}>{q.category}</span>}</div>
                <p className="quiz-q">{q.question || q.q}</p>
                <div className="quiz-options">
                  {(q.options || []).map((opt, oi) => {
                    let cls = 'quiz-option';
                    if (submitted) {
                      if (oi === q.correctOption) cls += ' correct';
                      else if (answers[q.id] === oi) cls += ' wrong';
                    } else if (answers[q.id] === oi) cls += ' selected';
                    return (
                      <button key={oi} className={cls} onClick={() => pick(q.id, oi)}>
                        <span className="opt-letter">{String.fromCharCode(65 + oi)}</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {!submitted && displayed.length > 0 && (
            <button
              id="quiz-submit-btn"
              className="btn btn-primary"
              style={{ fontSize: '1rem', padding: '14px 40px', marginTop: '8px' }}
              onClick={handleSubmit}
              disabled={answeredCount < displayed.length || submitLoading}
            >
              {submitLoading ? <><span className="spinner" /> Submitting...</> : `Submit Quiz →`}
            </button>
          )}

          {displayed.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              No questions in this category.
            </div>
          )}
        </>
      )}
    </div>
  );
}
