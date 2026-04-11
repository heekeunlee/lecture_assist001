import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Presentation, Grid, Terminal, Sparkles, MessageCircle } from 'lucide-react';
import questionsData from './data/questions.json';

interface Question {
  id: number;
  question: string;
  answer: string;
  analogy: string;
  strategy: string;
}

export default function App() {
  const [questions] = useState<Question[]>(questionsData);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const openModal = (id: number) => {
    setSelectedId(id);
    const index = questions.findIndex(q => q.id === id);
    setCurrentIndex(index);
  };

  const nextQuestion = () => {
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  const prevQuestion = () => {
    setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="app-container">
      <nav style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={toggleTheme} className="modal-close" style={{ position: 'static' }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button 
          onClick={() => setIsPresenting(!isPresenting)} 
          className="modal-close" 
          style={{ position: 'static', width: 'auto', padding: '0 1rem', borderRadius: '100px' }}
        >
          {isPresenting ? <Grid size={18} /> : <Presentation size={18} />}
          <span style={{ marginLeft: '8px' }}>{isPresenting ? 'Grid View' : 'Start Presentation'}</span>
        </button>
      </nav>

      <header>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '1rem' }}>
            <Terminal className="accent-color" size={32} />
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent)' }}>Vibe Coding 101</span>
          </div>
          <h1>Beginner FAQ Guide</h1>
          <p>비전공자를 위한 시원한 코딩 문답 20선</p>
        </motion.div>
      </header>

      <div className="questions-grid">
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => openModal(q.id)}
          >
            <div className="badge">Q{q.id}</div>
            <h2>{q.question}</h2>
            <div className="card-content">
              {q.answer.substring(0, 60)}...
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>
              자세히 보기 <ChevronRight size={14} />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {(selectedId !== null || isPresenting) && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <button className="modal-close" onClick={() => { setSelectedId(null); setIsPresenting(false); }}>
                <X size={20} />
              </button>

              <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
                <div className="badge" style={{ padding: '8px 20px', fontSize: '1rem' }}>Question {currentQuestion.id} / {questions.length}</div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <h1>{currentQuestion.question}</h1>
                
                <div className="modal-section">
                  <h3><MessageCircle size={14} style={{ marginRight: '4px' }} /> 시원한 답변</h3>
                  <p style={{ fontWeight: 600 }}>{currentQuestion.answer}</p>
                </div>

                <div className="modal-section">
                  <h3><Sparkles size={14} style={{ marginRight: '4px' }} /> 비법 비유</h3>
                  <p>{currentQuestion.analogy}</p>
                </div>

                <div className="strategy-box">
                  <h3 style={{ color: 'var(--text-primary)' }}>💡 강의 활용 전략</h3>
                  <p style={{ fontSize: '1rem', marginTop: '0.5rem' }}>{currentQuestion.strategy}</p>
                </div>
              </div>

              <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={prevQuestion} className="modal-close" style={{ position: 'static' }}>
                  <ChevronLeft size={24} />
                </button>
                <div style={{ color: 'var(--text-secondary)' }}>
                  {currentIndex + 1} of {questions.length}
                </div>
                <button onClick={nextQuestion} className="modal-close" style={{ position: 'static' }}>
                  <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer style={{ marginTop: '8rem', textAlign: 'center', padding: '4rem 0', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        <p>© 2026 Vibe Coding - For Educators & Facilitators</p>
      </footer>
    </div>
  );
}
