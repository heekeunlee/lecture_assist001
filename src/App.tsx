import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Presentation, Grid, Sparkles, MessageCircle, HelpCircle, Layers, List } from 'lucide-react';
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
        <div className="nav-group">
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
            <List size={18} /> 실무 커리큘럼
          </button>
        </div>
        
        <div className="nav-group">
          <button onClick={toggleTheme} className="icon-button">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button 
            onClick={() => setIsPresenting(!isPresenting)} 
            className="action-button"
          >
            {isPresenting ? <Grid size={18} /> : <Presentation size={18} />}
            <span>발표 모드</span>
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
          <h1>{activeTab === 'faq' ? '입문자 FAQ 가이드' : '디스플레이 엔지니어 실무 로드맵'}</h1>
          <p>{activeTab === 'faq' ? '비전공자를 위한 시원한 코딩 문답' : '조기 전력화를 위한 단계별 학습 과정'}</p>
        </motion.div>
      </header>

      <main>
        {activeTab === 'faq' ? (
          <div className="questions-grid">
            {questionsData.map((q: any, idx) => (
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
                <p className="card-desc">{q.answer.substring(0, 50)}...</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="table-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <table className="curriculum-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>단계</th>
                  <th style={{ width: '180px' }}>분류</th>
                  <th>주제</th>
                  <th>핵심 성과</th>
                </tr>
              </thead>
              <tbody>
                {curriculumData.map((c: any) => (
                  <tr key={c.id} onClick={() => openModal(c.id)}>
                    <td className="id-cell">{c.id}</td>
                    <td><span className="cat-badge">{c.category}</span></td>
                    <td className="title-cell">{c.title}</td>
                    <td className="desc-cell">{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </main>

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
              <button className="modal-close-btn" onClick={() => { setSelectedId(null); setIsPresenting(false); }}>
                <X size={20} />
              </button>

              <div className="modal-inner">
                <div className="badge" style={{ marginBottom: '2rem' }}>
                  {activeTab === 'faq' ? `Question ${currentData.id}` : `Step ${currentData.id} • ${(currentData as any).category}`}
                </div>
                
                <h1 className="modal-title">{activeTab === 'faq' ? (currentData as any).question : (currentData as any).title}</h1>
                
                <div className="modal-section">
                  <h3><MessageCircle size={14} /> {activeTab === 'faq' ? '시원한 답변' : '핵심 내용'}</h3>
                  <p className="highlight-text">
                    {activeTab === 'faq' ? (currentData as any).answer : (currentData as any).description}
                  </p>
                </div>

                <div className="modal-section">
                  <h3><Sparkles size={14} /> {activeTab === 'faq' ? '비법 비유' : '상세 설명'}</h3>
                  <p className="normal-text">{activeTab === 'faq' ? (currentData as any).analogy : (currentData as any).details}</p>
                </div>

                {activeTab === 'faq' && (
                  <div className="strategy-box">
                    <h3>💡 강의 활용 전략</h3>
                    <p>{(currentData as any).strategy}</p>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button onClick={prevQuestion} className="nav-btn">
                  <ChevronLeft size={24} />
                </button>
                <div className="page-indicator">
                  {currentIndex + 1} / {activeTab === 'faq' ? questionsData.length : curriculumData.length}
                </div>
                <button onClick={nextQuestion} className="nav-btn">
                  <ChevronRight size={24} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .nav-group {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .tab-button {
          background: transparent;
          border: none;
          padding: 10px 20px;
          border-radius: 14px;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tab-button.active {
          background: var(--bg-tertiary);
          color: var(--accent);
          box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .icon-button {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
        }
        .action-button {
          background: var(--accent-gradient);
          border: none;
          padding: 0 24px;
          height: 44px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 113, 227, 0.3);
        }
        
        .card-desc {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 1rem;
        }

        .table-container {
          background: var(--bg-tertiary);
          border-radius: 24px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: var(--shadow);
        }
        .curriculum-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .curriculum-table th {
          background: var(--bg-secondary);
          padding: 1.5rem 2rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .curriculum-table td {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border);
          transition: background 0.2s;
        }
        .curriculum-table tr:last-child td { border: none; }
        .curriculum-table tr { cursor: pointer; }
        .curriculum-table tr:hover td {
          background: rgba(0, 113, 227, 0.05);
        }
        .id-cell { font-weight: 700; color: var(--accent); font-family: 'Outfit'; }
        .cat-badge {
          background: var(--bg-secondary);
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          white-space: nowrap;
          display: inline-block;
        }
        .title-cell { font-weight: 600; font-size: 1.1rem; }
        .desc-cell { color: var(--text-secondary); }

        .modal-inner { padding: 1rem; }
        .modal-title { font-size: 2.8rem; line-height: 1.1; margin-bottom: 3rem; }
        .highlight-text { font-size: 1.6rem; font-weight: 700; line-height: 1.3; }
        .normal-text { font-size: 1.1rem; line-height: 1.6; color: var(--text-secondary); }
        .modal-section { margin-bottom: 3rem; }
        .modal-section h3 { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          font-size: 0.9rem; 
          color: var(--accent); 
          margin-bottom: 1rem; 
          text-transform: uppercase;
        }
        .modal-close-btn {
          position: absolute; top: 40px; right: 40px; 
          background: var(--bg-secondary); border: none;
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .modal-footer {
          margin-top: 4rem; display: flex; justify-content: space-between; align-items: center;
        }
        .nav-btn {
          background: var(--bg-secondary); border: none;
          width: 56px; height: 56px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .nav-btn:hover { background: var(--border); transform: scale(1.1); }
        .page-indicator { font-size: 1.1rem; font-weight: 700; font-family: 'Outfit'; }
      `}</style>

      <footer style={{ marginTop: '8rem', textAlign: 'center', padding: '4rem 0', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        <p>© 2026 Vibe Coding - For Professional Instructors</p>
      </footer>
    </div>
  );
}
