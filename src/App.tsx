import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Presentation, Grid, Sparkles, MessageCircle, BookOpen, HelpCircle, Layers } from 'lucide-react';
import questionsData from './data/questions.json';
import curriculumData from './data/curriculum.json';

type TabType = 'faq' | 'curriculum';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('faq');
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
    const data = activeTab === 'faq' ? questionsData : curriculumData;
    const index = data.findIndex((q: any) => q.id === id);
    setCurrentIndex(index);
  };

  const nextQuestion = () => {
    const data = activeTab === 'faq' ? questionsData : curriculumData;
    setCurrentIndex((prev) => (prev + 1) % data.length);
  };

  const prevQuestion = () => {
    const data = activeTab === 'faq' ? questionsData : curriculumData;
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  const currentData = activeTab === 'faq' ? questionsData[currentIndex] : curriculumData[currentIndex];

  return (
    <div className="app-container">
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('faq'); setSelectedId(null); }}
          >
            <HelpCircle size={18} /> 입문 FAQ
          </button>
          <button 
            className={`tab-button ${activeTab === 'curriculum' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('curriculum'); setSelectedId(null); }}
          >
            <BookOpen size={18} /> 실무 커리큘럼
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={toggleTheme} className="modal-close" style={{ position: 'static' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={() => setIsPresenting(!isPresenting)} 
            className="modal-close" 
            style={{ position: 'static', width: 'auto', padding: '0 1.5rem', borderRadius: '100px' }}
          >
            {isPresenting ? <Grid size={18} /> : <Presentation size={18} />}
            <span style={{ marginLeft: '8px' }}>발표 모드</span>
          </button>
        </div>
      </nav>

      <header>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '1rem' }}>
            <Layers className="accent-color" size={32} />
            <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--accent)' }}>Vibe Coding 101</span>
          </div>
          <h1>{activeTab === 'faq' ? '입문자 FAQ 가이드' : '디스플레이 엔지니어 실무 20선'}</h1>
          <p>{activeTab === 'faq' ? '비전공자를 위한 시원한 코딩 문답' : '조기 전력화를 위한 업무 생산성 도구'}</p>
        </motion.div>
      </header>

      <div className="questions-grid">
        {activeTab === 'faq' ? (
          questionsData.map((q: any, idx) => (
            <motion.div
              key={q.id}
              className="card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => openModal(q.id)}
            >
              <div className="badge">Q{q.id}</div>
              <h2>{q.question}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{q.answer.substring(0, 50)}...</p>
            </motion.div>
          ))
        ) : (
          curriculumData.map((c: any, idx) => (
            <motion.div
              key={c.id}
              className="card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => openModal(c.id)}
            >
              <div className="badge" style={{ background: 'var(--accent-gradient)' }}>STEP {c.id}</div>
              <h2>{c.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{c.description}</p>
            </motion.div>
          ))
        )}
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
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <button className="modal-close" onClick={() => { setSelectedId(null); setIsPresenting(false); }}>
                <X size={20} />
              </button>

              <div style={{ marginTop: '2rem' }}>
                <div className="badge" style={{ marginBottom: '2rem' }}>
                  {activeTab === 'faq' ? `Question ${currentData.id}` : `Step ${currentData.id}`}
                </div>
                
                <h1>{activeTab === 'faq' ? (currentData as any).question : (currentData as any).title}</h1>
                
                <div className="modal-section">
                  <h3><MessageCircle size={14} style={{ marginRight: '4px' }} /> {activeTab === 'faq' ? '시원한 답변' : '핵심 내용'}</h3>
                  <p style={{ fontSize: '1.4rem', fontWeight: 600 }}>
                    {activeTab === 'faq' ? (currentData as any).answer : (currentData as any).description}
                  </p>
                </div>

                <div className="modal-section">
                  <h3><Sparkles size={14} style={{ marginRight: '4px' }} /> {activeTab === 'faq' ? '비법 비유' : '상세 설명'}</h3>
                  <p>{activeTab === 'faq' ? (currentData as any).analogy : (currentData as any).details}</p>
                </div>

                {activeTab === 'faq' && (
                  <div className="strategy-box">
                    <h3 style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>💡 강의 활용 전략</h3>
                    <p style={{ fontSize: '1rem', marginTop: '0.5rem' }}>{(currentData as any).strategy}</p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={prevQuestion} className="modal-close" style={{ position: 'static' }}>
                  <ChevronLeft size={24} />
                </button>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {currentIndex + 1} / {activeTab === 'faq' ? questionsData.length : curriculumData.length}
                </div>
                <button onClick={nextQuestion} className="modal-close" style={{ position: 'static' }}>
                  <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .tab-button {
          background: transparent;
          border: none;
          padding: 8px 16px;
          border-radius: 12px;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s ease;
        }
        .tab-button.active {
          background: var(--bg-secondary);
          color: var(--text-primary);
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .tab-button:hover:not(.active) {
          background: var(--border);
        }
      `}</style>

      <footer style={{ marginTop: '8rem', textAlign: 'center', padding: '4rem 0', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        <p>© 2026 Vibe Coding - For Professional Instructors</p>
      </footer>
    </div>
  );
}
