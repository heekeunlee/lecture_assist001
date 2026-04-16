import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Presentation, Grid, Sparkles, MessageCircle, HelpCircle, Layers, List, FileText, Target, TrendingUp, Clock, Award, Printer, BookOpen, Search, Image, Zap } from 'lucide-react';
import questionsData from './data/questions.json';
import curriculumData from './data/curriculum.json';
import officialData from './data/official_plan.json';
import terminologyData from './data/terminology.json';
import examplesData from './data/examples.json';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import ProcessAnalysis from './ProcessAnalysis';

type TabType = 'faq' | 'curriculum' | 'terminology' | 'examples' | 'analysis';

const SplashScreen = () => {
  return (
    <motion.div 
      className="splash-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="splash-content">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="splash-logo"
        >
          <Layers size={160} className="splash-icon" />
          <div className="splash-text-group">
            <h1 className="splash-title">VIBE CODING</h1>
            <p className="splash-subtitle">for Display Engineering</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="loading-bar-container"
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        >
          <div className="loading-bar-fill" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const CurriculumVisuals = () => {
  return (
    <div className="visuals-container">
      {/* 1. Roadmap Stepper */}
      <div className="roadmap-section">
        <div className="section-label">Learning Journey Roadmap</div>
        <div className="roadmap-stepper">
          {['AI 마인드셋', '데이터 자동 분석', '실전 시각화', '자동 보고서', '의사결정 도구'].map((stage, idx) => (
            <div key={idx} className="step-item">
              <div className="step-node">{idx + 1}</div>
              <div className="step-label">{stage}</div>
              {idx < 4 && <div className="step-line" />}
            </div>
          ))}
        </div>
      </div>

      <div className="stats-grid">
        {/* 2. Productivity Insight */}
        <div className="stat-card">
          <div className="stat-header">
            <Clock size={16} />
            <span>업무 시간 단축 시뮬레이션</span>
          </div>
          <div className="chart-container">
            <div className="bar-group">
              <div className="bar-label">기존 (Excel)</div>
              <div className="bar-bg"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 1 }} className="bar-fill legacy" /></div>
              <div className="bar-value">480분</div>
            </div>
            <div className="bar-group">
              <div className="bar-label">바이브 코딩</div>
              <div className="bar-bg"><motion.div initial={{ width: 0 }} animate={{ width: '5%' }} transition={{ duration: 1, delay: 0.5 }} className="bar-fill vibe" /></div>
              <div className="bar-value">15분</div>
            </div>
          </div>
          <div className="stat-footer">최대 96% 생산성 개선</div>
        </div>

        {/* 3. Skill Growth */}
        <div className="stat-card">
          <div className="stat-header">
            <Target size={16} />
            <span>엔지니어 핵심 역량 성장</span>
          </div>
          <div className="skill-circles">
            {[
              { label: 'AI 활용', val: 95, icon: <Sparkles size={12}/> },
              { label: '데이터 분석', val: 88, icon: <TrendingUp size={12}/> },
              { label: '문제 해결', val: 92, icon: <Award size={12}/> }
            ].map((s, i) => (
              <div key={i} className="skill-item">
                <div className="circle-bg">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-trail" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <motion.path 
                      initial={{ strokeDasharray: '0, 100' }}
                      animate={{ strokeDasharray: `${s.val}, 100` }}
                      transition={{ duration: 1.5, delay: i * 0.2 }}
                      className="circle-fill"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                  </svg>
                  <div className="circle-icon">{s.icon}</div>
                </div>
                <div className="skill-label">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="stat-footer">현업 즉시 투입 가능한 조기 전력화</div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('curriculum');
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [theme, setTheme] = useState('light');
  const [showOfficial, setShowOfficial] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTermCat, setActiveTermCat] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 30;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const openModal = (id: number | string) => {
    setSelectedId(id);
    const data = activeTab === 'faq' ? questionsData : (showOfficial ? officialData : curriculumData);
    if (activeTab === 'terminology') return;
    const index = data.findIndex((q: any) => q.id === id);
    setCurrentIndex(index);
  };

  const nextQuestion = () => {
    const data = activeTab === 'faq' ? questionsData : (showOfficial ? officialData : curriculumData);
    setCurrentIndex((prev) => (prev + 1) % data.length);
  };

  const prevQuestion = () => {
    const data = activeTab === 'faq' ? questionsData : (showOfficial ? officialData : curriculumData);
    setCurrentIndex((prev) => (prev - 1 + data.length) % data.length);
  };

  const currentData = activeTab === 'faq' 
    ? questionsData[currentIndex] 
    : (activeTab === 'curriculum' ? (showOfficial ? officialData[currentIndex] : curriculumData[currentIndex]) : null);

  const filteredTerms = terminologyData.filter(t => 
    (activeTermCat === '전체' || t.category === activeTermCat) &&
    (t.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.desc.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => a.term.localeCompare(b.term));

  const pageCount = Math.ceil(filteredTerms.length / itemsPerPage);
  const currentTerms = filteredTerms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(showOfficial ? '공식 커리큘럼' : '실무 로드맵');

    const applyBorder = (cell: ExcelJS.Cell) => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    };

    // 1. Title
    sheet.mergeCells('A1:E1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = '강의 계획서';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    applyBorder(titleCell);
    sheet.getRow(1).height = 40;

    // 2. Metadata Rows
    const metaData = [
      ['강의명', '디스플레이 취업준비생을 위한 AI 바이브 코딩 실전', '', '', ''],
      ['강의분량', '총 20강 (이론 17강, 프로젝트 3강) = 총 약 14시간', '', '', ''],
      ['수강 대상', '디스플레이 관련 학과 대학교 3~4학년 / 취업준비생 (주 대상) 및 현업 엔지니어', '', '', ''],
      ['강의 목표', '① 코드 없이 AI로 실무 분석 툴 제작 ② 디스플레이 엔지니어링 포트폴리오 완성 ③ 데이터(수율/공정/소재) 자동화 스킬 확보', '', '', '']
    ];

    metaData.forEach((row, idx) => {
      const rowIndex = idx + 2;
      sheet.addRow(row);
      sheet.mergeCells(`B${rowIndex}:E${rowIndex}`);
      const headerCell = sheet.getCell(`A${rowIndex}`);
      const contentCell = sheet.getCell(`B${rowIndex}`);
      
      headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEEFC' } };
      headerCell.font = { bold: true };
      
      applyBorder(headerCell);
      applyBorder(contentCell);
      contentCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      sheet.getRow(rowIndex).height = 30;
    });

    // 3. Table Headers
    const headers = ['차시', '구분', '주제', '시간 배분 및 상세 내용', '핵심 결과물'];
    sheet.addRow(headers);
    const headerRow = sheet.getRow(6);
    headerRow.height = 35;
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA6A6A6' } };
      cell.font = { bold: true };
      applyBorder(cell);
    });

    // 4. Data Rows
    const data = showOfficial ? officialData : curriculumData;
    data.forEach((item: any) => {
      let typeConfig = '', titleConfig = '', detailConfig = '', summaryConfig = '';

      if (showOfficial) {
        typeConfig = item.time || '';
        titleConfig = item.title || '';
        detailConfig = item.content || '';
        summaryConfig = item.output || '핵심 실무 역량 확보';
      } else {
        typeConfig = item.type === 'project' ? '프로젝트' : '이론강의';
        titleConfig = item.title || item.question || '';
        detailConfig = item.details || item.answer || '';
        summaryConfig = item.description || item.summary || '';
      }

      const row = sheet.addRow([item.id, typeConfig, titleConfig, detailConfig, summaryConfig]);
      const isProject = showOfficial ? titleConfig.includes('프로젝트') : item.type === 'project';
      
      row.eachCell((cell, colNumber) => {
        applyBorder(cell);
        if (colNumber === 3 || colNumber === 4) cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        if (isProject) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
      });
      
      const maxText = Math.max(detailConfig.length, titleConfig.length, summaryConfig.length);
      row.height = Math.max(40, Math.ceil(maxText / 35) * 20);
    });

    sheet.getColumn(1).width = 8;
    sheet.getColumn(2).width = 15;
    sheet.getColumn(3).width = 35;
    sheet.getColumn(4).width = 50;
    sheet.getColumn(5).width = 25;

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `VibeCoding_Curriculum_${showOfficial ? 'Official' : 'Roadmap'}.xlsx`);
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && <SplashScreen key="splash" />}
      </AnimatePresence>

      <div className="app-container">
      <nav className="main-nav">
        <div className="nav-group tabs-group">
          <button 
            className={`tab-button ${activeTab === 'curriculum' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('curriculum'); setSelectedId(null); }}
          >
            <List size={18} /> 실무 커리큘럼
          </button>
          <button 
            className={`tab-button ${activeTab === 'examples' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('examples'); setSelectedId(null); }}
          >
            <Sparkles size={18} /> 실전 예제 10
          </button>
          <button 
            className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('faq'); setSelectedId(null); setShowOfficial(false); setCurrentPage(1); }}
          >
            <HelpCircle size={18} /> 바이브코딩 쌩기초 Q&A
          </button>
          <button 
            className={`tab-button ${activeTab === 'terminology' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('terminology'); setSelectedId(null); setCurrentPage(1); }}
          >
            <BookOpen size={18} /> 업계용어 2000
          </button>
          <button 
            className={`tab-button ${activeTab === 'analysis' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('analysis'); setSelectedId(null); setCurrentPage(1); }}
          >
            <Zap size={18} /> 실전 공정 분석
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
          key={activeTab + (showOfficial ? '-official' : '')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="logo-container">
            <Layers className="accent-color" size={32} />
            <span className="logo-text">VIBE CODING 101</span>
          </div>
          <h1>
            {activeTab === 'curriculum' 
              ? (showOfficial ? 'Vibe Coding 교육과정' : '디스플레이 엔지니어 실무 로드맵')
              : (activeTab === 'faq' ? '바이브코딩 쌩기초 Q&A' : (activeTab === 'examples' ? '실무 해결 예제 10선' : (activeTab === 'analysis' ? '디스플레이 엔지니어링 실전 분석' : '업계용어 2000')))}
          </h1>
          <p className="header-subtitle">
            {activeTab === 'curriculum'
              ? (showOfficial ? 'AI와 함께 기술의 한계를 넘어서는 미래 Display 엔지니어로의 도약' : '조기 전력화를 위한 단계별 학습 과정')
              : (activeTab === 'faq' ? '비전공자를 위한 시원한 코딩 문답' : (activeTab === 'examples' ? '강의를 통해 마스터할 디스플레이 현장 실습 시나리오' : (activeTab === 'analysis' ? '10세대 대형 기판의 포토 공정 및 선폭(CD) 데이터 시각화 분석' : '실무에서 바로 만나는 엔지니어 핵심 가이드')))}
          </p>
        </motion.div>
      </header>

      <main>
        {activeTab === 'faq' ? (
          <div className="faq-container">
            {/* FAQ Pagination Control */}
            <div className="pagination faq-top-pagination">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1} 
                className="nav-btn"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="page-indicator">Q&A Page {currentPage} / {Math.ceil(questionsData.length / 20)}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(questionsData.length / 20), p + 1))} 
                disabled={currentPage === Math.ceil(questionsData.length / 20)} 
                className="nav-btn"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="questions-grid">
              {questionsData.slice((currentPage - 1) * 20, currentPage * 20).map((q: any, idx) => (
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
                  <p className="card-desc">{q.answer.substring(0, 100)}...</p>
                </motion.div>
              ))}
            </div>

            {/* Bottom Pagination */}
            <div className="pagination" style={{ marginTop: '3rem' }}>
              <button 
                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }} 
                disabled={currentPage === 1} 
                className="nav-btn"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="page-indicator">{currentPage} / {Math.ceil(questionsData.length / 20)}</span>
              <button 
                onClick={() => { setCurrentPage(p => Math.min(Math.ceil(questionsData.length / 20), p + 1)); window.scrollTo(0, 0); }} 
                disabled={currentPage === Math.ceil(questionsData.length / 20)} 
                className="nav-btn"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ) : activeTab === 'examples' ? (
          <div className="examples-showcase">
            {examplesData.map((ex: any, idx) => {
              const iconMap: any = { Image, Target, FileText, TrendingUp, Award, Layers, Sparkles, Zap, Grid, Clock };
              const IconComp = iconMap[ex.icon] || Sparkles;
              const isEven = idx % 2 === 0;

              return (
                <motion.div 
                  key={ex.id}
                  className={`example-item ${isEven ? 'row' : 'row-reverse'}`}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <div className="example-visual">
                    {ex.image ? (
                      <img 
                        src={(import.meta.env.BASE_URL || '') + ex.image.replace(/^\//,"")} 
                        alt={ex.title} 
                        className="example-image" 
                      />
                    ) : (
                      <div className="example-icon-large">
                        <IconComp size={64} />
                      </div>
                    )}
                    <div className="case-badge">CASE {ex.id}</div>
                  </div>

                  <div className="example-info">
                    <h2 className="example-title-large">{ex.title}</h2>
                    <p className="example-full-desc">{ex.desc}</p>
                    
                    <div className="example-detail-split">
                      <div className="detail-section">
                        <h4><Layers size={16} /> 분석 프로세스</h4>
                        <p className="process-text">{ex.process}</p>
                      </div>
                      <div className="detail-section">
                        <h4><Target size={16} /> 기대 효과</h4>
                        <div className="impact-tag">{ex.impact}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : activeTab === 'curriculum' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            <CurriculumVisuals />

            <div className="curriculum-controls">
              <div className="control-left">
                <button 
                  className="toggle-button active"
                  onClick={() => setShowOfficial(!showOfficial)}
                >
                  {showOfficial ? <Sparkles size={16} /> : <FileText size={16} />}
                  {showOfficial ? '쉬운 표현으로 보기' : '공식 커리큘럼 보기'}
                </button>
              </div>
              <div className="control-right">
                <button 
                  className="toggle-button print-btn"
                  onClick={() => window.print()}
                >
                  <Printer size={16} />
                  <span>PDF</span>
                </button>
                <button 
                  className="toggle-button download-btn"
                  onClick={exportToExcel}
                >
                  <FileText size={16} />
                  <span>Excel</span>
                </button>
              </div>
            </div>

            <motion.div 
              key={showOfficial ? 'official' : 'easy'}
              className="table-container"
              initial={{ opacity: 0, x: showOfficial ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <table className="curriculum-table">
                <thead>
                  {showOfficial ? (
                    <tr>
                      <th style={{ width: '100px' }}>차시</th>
                      <th style={{ width: '300px' }}>주제</th>
                      <th>세부 강의 내용</th>
                      <th style={{ width: '100px' }}>시간</th>
                    </tr>
                  ) : (
                    <tr>
                      <th style={{ width: '100px' }}>단계</th>
                      <th style={{ width: '180px' }}>분류</th>
                      <th>주제</th>
                      <th>핵심 성과</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {(showOfficial ? officialData : curriculumData).map((c: any) => {
                    const isProject = c.type === 'project' || (typeof c.id === 'string' && c.id.startsWith('P'));
                    return (
                      <tr key={c.id} onClick={() => openModal(c.id)} className={isProject ? 'row-project' : ''}>
                        <td className="id-cell" data-label={showOfficial ? "차시" : "단계"}>
                          {isProject ? <div className="project-id-badge">{c.id}</div> : c.id}
                        </td>
                        {showOfficial ? (
                          <>
                            <td className="title-cell" data-label="주제">
                              {c.title}
                            </td>
                            <td className="desc-cell" data-label="세부 강의 내용">{c.content}</td>
                            <td data-label="시간"><span className="time-badge">{c.time}</span></td>
                          </>
                        ) : (
                          <>
                            <td data-label="분류"><span className="cat-badge">{c.category}</span></td>
                            <td className="title-cell" data-label="주제">
                              {c.title}
                            </td>
                            <td className="desc-cell" data-label="핵심 성과">{c.description}</td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>
          </div>
        ) : activeTab === 'analysis' ? (
          <ProcessAnalysis />
        ) : (
          <div className="terminology-container">
            <div className="terminology-nav">
              {['전체', '디스플레이', '공정', '데이터 처리', '코딩'].map(cat => (
                <button 
                  key={cat} 
                  className={`term-cat-btn ${activeTermCat === cat ? 'active' : ''}`}
                  onClick={() => { setActiveTermCat(cat); setCurrentPage(1); }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="search-wrapper">
              <Search className="search-icon" size={20} />
              <input 
                type="text" 
                placeholder={`${activeTermCat} 분야 용어 검색...`} 
                className="terminology-search"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {pageCount > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1} 
                  className="nav-btn"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="page-indicator">{currentPage} / {pageCount}</span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))} 
                  disabled={currentPage === pageCount} 
                  className="nav-btn"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            <div className="terminology-grid">
              {currentTerms.map((t, idx) => (
                <motion.div 
                  key={t.term}
                  className="term-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.01, 0.5) }}
                >
                  <div className="term-header">
                    <span className="term-cat-tag">{t.category}</span>
                    <h2 className="term-word">{t.term}</h2>
                  </div>
                  <div className="term-full">{t.full}</div>
                  <p className="term-desc">{t.desc}</p>
                </motion.div>
              ))}
            </div>
            {filteredTerms.length === 0 && (
              <div className="no-results">찾으시는 검색 결과가 없습니다.</div>
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {(selectedId !== null && currentData !== null || isPresenting) && currentData && (
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
                  {activeTab === 'faq' ? `Question ${currentData.id}` : `Step ${currentData.id}`}
                  {showOfficial && ' • Official'}
                </div>
                
                <h1 className="modal-title">
                  {activeTab === 'faq' 
                    ? (currentData as any).question 
                    : (currentData as any).title}
                </h1>
                
                <div className="modal-section">
                  <h3>
                    <MessageCircle size={14} /> 
                    {activeTab === 'faq' ? '시원한 답변' : (showOfficial ? '세부 실습 내용' : '핵심 내용')}
                  </h3>
                  <p className="highlight-text">
                    {activeTab === 'faq' 
                      ? (currentData as any).answer 
                      : (showOfficial ? (currentData as any).content : (currentData as any).description)}
                  </p>
                </div>

                <div className="modal-section">
                  <h3>
                    <Sparkles size={14} /> 
                    {activeTab === 'faq' ? '비법 비유' : (showOfficial ? '학습 목표' : '상세 설명')}
                  </h3>
                  <p className="normal-text">
                    {activeTab === 'faq' 
                      ? (currentData as any).analogy 
                      : (showOfficial ? `본 차시를 통해 디스플레이 도메인 기술과 AI 바이브 코딩을 결합한 ${currentData.id}단계 역량을 습득합니다.` : (currentData as any).details)}
                  </p>
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
                  {currentIndex + 1} / {(activeTab === 'faq' ? questionsData : (showOfficial ? officialData : curriculumData)).length}
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
        .main-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4rem; flex-wrap: wrap; gap: 1rem; }
        .nav-group { display: flex; gap: 12px; align-items: center; }
        .nav-group.tabs-group { flex-wrap: wrap; }
        .tab-button {
          background: transparent; border: none; padding: 10px 16px; border-radius: 14px;
          cursor: pointer; color: var(--text-secondary); display: flex; align-items: center;
          gap: 8px; font-weight: 700; font-size: 0.9rem; transition: all 0.2s;
          white-space: nowrap;
        }
        .tab-button.active { background: var(--bg-secondary); color: var(--accent); border: 1px solid var(--border); }
        .icon-button {
          background: var(--bg-tertiary); border: 1px solid var(--border);
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .action-button {
          background: var(--accent-gradient); border: none; padding: 0 24px;
          height: 44px; border-radius: 12px; color: white; font-weight: 700;
          display: flex; align-items: center; gap: 10px; cursor: pointer;
        }
        
        .toggle-button {
          background: var(--bg-secondary); border: 1px solid var(--border);
          padding: 8px 16px; border-radius: 10px; color: var(--text-primary);
          display: flex; align-items: center; gap: 8px; font-weight: 700; cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-button.active { background: var(--accent); color: white; border-color: var(--accent); }
        .print-btn, .download-btn { background: #34c759; color: white; border: none; }
        .print-btn:hover, .download-btn:hover { background: #28a745; transform: translateY(-2px); }

        .logo-container { display: flex; alignItems: center; justify-content: center; gap: 12px; margin-bottom: 1.5rem; }
        .logo-text { font-size: 1.2rem; font-weight: 700; color: var(--accent); letter-spacing: 0.05em; }
        
        .curriculum-controls { display: flex; justify-content: space-between; align-items: center; gap: 1rem; width: 100%; }
        .control-left, .control-right { display: flex; align-items: center; gap: 1rem; }

        /* Visuals Style */
        .visuals-container { display: flex; flex-direction: column; gap: 3rem; margin-bottom: 2rem; }
        .roadmap-section { background: var(--bg-tertiary); padding: 2.5rem; border-radius: 24px; border: 1px solid var(--border); }
        .section-label { font-size: 0.8rem; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2rem; text-align: center; }
        .roadmap-stepper { display: flex; justify-content: space-between; position: relative; gap: 8px; }
        .step-item { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; z-index: 1; min-width: 60px; }
        .step-node { width: 32px; height: 32px; background: var(--accent); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; margin-bottom: 12px; box-shadow: 0 4px 10px rgba(0, 113, 227, 0.3); flex-shrink: 0; }
        .step-label { font-size: 0.7rem; font-weight: 600; color: var(--text-secondary); text-align: center; line-height: 1.2; }
        .step-line { position: absolute; top: 16px; left: 50%; width: 100%; height: 2px; background: var(--border); z-index: -1; }

        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .stat-card { background: var(--bg-tertiary); padding: 2rem; border-radius: 24px; border: 1px solid var(--border); }
        .stat-header { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.9rem; color: var(--text-primary); margin-bottom: 1.5rem; }
        .stat-footer { font-size: 0.8rem; color: var(--accent); font-weight: 600; margin-top: 1.5rem; text-align: right; }
        
        .chart-container { display: flex; flex-direction: column; gap: 1.2rem; }
        .bar-group { display: flex; align-items: center; gap: 12px; }
        .bar-label { width: 80px; font-size: 0.75rem; color: var(--text-secondary); }
        .bar-bg { flex: 1; height: 12px; background: var(--bg-secondary); border-radius: 6px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 6px; }
        .bar-fill.legacy { background: var(--text-secondary); opacity: 0.3; }
        .bar-fill.vibe { background: var(--accent-gradient); }
        .bar-value { width: 45px; font-size: 0.75rem; font-weight: 700; font-family: 'Outfit'; }

        .skill-circles { display: flex; justify-content: space-around; align-items: center; padding-top: 0.5rem; }
        .skill-item { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .circle-bg { position: relative; width: 60px; height: 60px; }
        .circular-chart { display: block; margin: 0 auto; max-width: 100%; max-height: 100%; }
        .circle-trail { fill: none; stroke: var(--border); stroke-width: 3; }
        .circle-fill { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; }
        .circle-icon { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--accent); }
        .skill-label { font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); }

        .table-container { background: var(--bg-tertiary); border-radius: 24px; border: 1px solid var(--border); overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .curriculum-table { width: 100%; border-collapse: collapse; text-align: left; }
        .curriculum-table th { background: var(--bg-secondary); padding: 1.5rem 2rem; font-size: 1.1rem; color: var(--text-primary); font-weight: 800; letter-spacing: 0.05em; white-space: nowrap; }
        .curriculum-table td { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border); }
        .curriculum-table tr { cursor: pointer; }
        .curriculum-table tr:hover td { background: rgba(0, 113, 227, 0.05); }
        .id-cell { font-weight: 700; color: var(--accent); }
        .row-project { background: rgba(0, 113, 227, 0.03); }
        .row-project td { border-bottom: 2px solid var(--accent) !important; }
        .project-id-badge { 
          background: var(--accent); color: white; padding: 4px 8px; border-radius: 6px; 
          font-size: 0.7rem; display: inline-block; 
        }
        .p-tag { 
          background: rgba(0, 113, 227, 0.1); color: var(--accent); padding: 4px 10px; border-radius: 8px; 
          font-size: 0.7rem; font-weight: 800; margin-right: 12px; vertical-align: middle;
          border: 1px solid rgba(0, 113, 227, 0.2);
          letter-spacing: 0.05em;
        }
        .cat-badge, .time-badge { background: var(--bg-secondary); padding: 6px 14px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; white-space: nowrap; }
        .time-badge { color: var(--accent); }
        .title-cell { font-weight: 600; font-size: 1.1rem; }
        .desc-cell { color: var(--text-secondary); word-break: keep-all; overflow-wrap: break-word; }

        .modal-title { font-size: 2.8rem; line-height: 1.1; margin-bottom: 3rem; }
        .highlight-text { font-size: 1.6rem; font-weight: 700; line-height: 1.3; }
        .normal-text { font-size: 1.1rem; line-height: 1.6; color: var(--text-secondary); }
        .modal-section { margin-bottom: 3rem; }
        .modal-section h3 { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; color: var(--accent); margin-bottom: 1rem; }
        .modal-close-btn { position: absolute; top: 40px; right: 40px; background: var(--bg-secondary); border: none; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .modal-footer { margin-top: 4rem; display: flex; justify-content: space-between; align-items: center; }
        .header-subtitle { 
          font-size: 1.5rem !important; 
          font-weight: 700 !important; 
          color: var(--text-primary) !important; 
          opacity: 1 !important; 
          letter-spacing: -0.01em;
          margin-top: 1rem;
          line-height: 1.4;
        }

        .nav-btn { background: var(--bg-secondary); border: none; width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .title-cell { font-size: 1rem !important; font-weight: 700 !important; }

        /* Terminology Styles */
        .terminology-container { display: flex; flex-direction: column; gap: 2rem; }
        .terminology-nav { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 0.5rem; }
        .term-cat-btn {
          background: var(--bg-secondary); border: 1px solid var(--border); padding: 8px 18px; border-radius: 100px;
          color: var(--text-secondary); font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .term-cat-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
        .term-cat-btn:hover:not(.active) { background: var(--border); }

        .search-wrapper { position: relative; max-width: 500px; margin: 0 auto 2rem; width: 100%; }
        .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
        .terminology-search { 
          width: 100%; padding: 14px 14px 14px 48px; border-radius: 16px; border: 1px solid var(--border);
          background: var(--bg-tertiary); color: var(--text-primary); font-size: 1rem; outline: none; transition: border-color 0.2s;
        }
        .terminology-search:focus { border-color: var(--accent); }
        .terminology-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .term-card { 
          background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 20px; padding: 2rem;
          transition: transform 0.2s;
        }
        .term-card:hover { transform: translateY(-5px); border-color: var(--accent); }
        .term-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
        .term-word { font-size: 1.5rem; font-weight: 800; color: var(--accent); }
        .term-cat-tag { font-size: 0.7rem; font-weight: 700; background: var(--bg-secondary); padding: 4px 10px; border-radius: 6px; color: var(--text-secondary); text-transform: uppercase; }
        .term-full { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 1rem; opacity: 0.8; }
        .term-desc { font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); }
        .no-results { text-align: center; padding: 4rem; color: var(--text-secondary); font-weight: 600; }

        .pagination { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-bottom: 2rem; }
        .pagination .nav-btn { width: 44px; height: 44px; }
        .pagination .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        /* Mobile Styles will be at the bottom */
        .pagination .page-indicator { font-family: var(--font-main); font-weight: 700; color: var(--text-primary); }

        /* Showcase Styles */
        .examples-showcase { display: flex; flex-direction: column; gap: 6rem; padding: 2rem 0; }
        .example-item { display: flex; align-items: center; gap: 4rem; min-height: 400px; }
        .example-item.row { flex-direction: row; }
        .example-item.row-reverse { flex-direction: row-reverse; }
        
        .example-visual { 
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 40px; padding: 0;
          min-width: 300px; min-height: 340px; position: relative; overflow: hidden;
        }
        .example-image {
          width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;
          opacity: 0.85; transition: transform 0.5s ease;
        }
        .example-item:hover .example-image { transform: scale(1.05); }
        .example-icon-large { color: var(--accent); z-index: 1; filter: drop-shadow(0 0 20px rgba(0,113,227,0.4)); }
        .case-badge { 
          position: absolute; bottom: 20px; left: 30px; z-index: 2;
          font-family: var(--font-main); font-weight: 900; color: #fff; 
          background: rgba(0,0,0,0.6); padding: 8px 16px; border-radius: 20px;
          backdrop-filter: blur(10px); font-size: 1rem; letter-spacing: 0.1em; 
        }
        
        .example-info { flex: 1.5; display: flex; flex-direction: column; gap: 1.5rem; }
        .example-title-large { font-size: 2.2rem; font-weight: 800; color: var(--text-primary); line-height: 1.2; letter-spacing: -0.02em; }
        .example-full-desc { font-size: 1.1rem; line-height: 1.8; color: var(--text-secondary); }
        
        .example-detail-split { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
        .detail-section { background: var(--bg-secondary); padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border); }
        .detail-section h4 { font-size: 0.85rem; font-weight: 800; color: var(--accent); margin-bottom: 0.8rem; display: flex; align-items: center; gap: 6px; text-transform: uppercase; }
        .process-text { font-size: 0.95rem; line-height: 1.5; color: var(--text-secondary); }
        .impact-tag { font-size: 1rem; font-weight: 700; color: var(--text-primary); background: rgba(0, 113, 227, 0.1); padding: 10px 15px; border-radius: 10px; border-left: 4px solid var(--accent); }

        /* Base Styles Enhancements */
        .app-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 4rem 2rem; box-sizing: border-box; }
        
        /* Splash Screen */
        .splash-screen {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: #000; display: flex; align-items: center; justify-content: center;
          z-index: 9999; color: white;
        }
        .splash-content { display: flex; flex-direction: column; align-items: center; gap: 2rem; }
        .splash-logo { display: flex; flex-direction: column; align-items: center; gap: 1rem; text-align: center; }
        .splash-icon { color: #0071e3; filter: drop-shadow(0 0 20px rgba(0,113,227,0.5)); }
        .splash-title { font-size: 4rem; font-weight: 900; letter-spacing: 0.1em; background: linear-gradient(135deg, #fff, #888); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .splash-subtitle { font-size: 1.5rem; opacity: 0.6; font-weight: 300; }
        .loading-bar-container { width: 300px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; }
        .loading-bar-fill { height: 100%; background: #0071e3; width: 0; animation: load 2.5s forwards ease-in-out; }
        @keyframes load { from { width: 0; } to { width: 100%; } }

        /* Splash Screen Mobile Optimization (for wide viewport) */
        @media screen and (pointer: coarse) {
          .splash-icon { width: 120px; height: 120px; }
          .splash-title { font-size: 7rem; }
          .splash-subtitle { font-size: 2.2rem; }
          .loading-bar-container { width: 500px; height: 8px; }
        }

        /* Typography Auto-scaling */
        html { font-size: 16px; }
        @media screen and (max-width: 1400px) { html { font-size: 15px; } }
        @media screen and (max-width: 768px) { html { font-size: 14px; } }

        .logo-text { font-size: 1.2rem; white-space: nowrap; }

        /* Mobile Responsiveness Improvements */
        /* Desktop-first Media Queries */
        @media screen and (max-width: 1024px) {
          .curriculum-table { min-width: 850px; }
          .roadmap-stepper { overflow-x: auto; padding-bottom: 1rem; justify-content: flex-start; }
          .step-item { flex: 0 0 100px; }
        }

        @media screen and (max-width: 768px) {
          .app-container { padding: 2rem 1.2rem; }
          header { margin-bottom: 2rem; }
          header h1 { font-size: clamp(1.8rem, 8vw, 2.5rem) !important; line-height: 1.2; word-break: keep-all; }
          .header-subtitle { font-size: 1rem !important; margin-top: 1rem; line-height: 1.5; }

          .main-nav { flex-direction: column; gap: 1rem; margin-bottom: 2rem !important; align-items: stretch; }
          .nav-group { width: 100%; justify-content: center; }
          .nav-group.tabs-group { 
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%;
          }
          .tab-button { 
            white-space: nowrap; padding: 12px 10px; font-size: 0.85rem; 
            justify-content: center; background: var(--bg-secondary); border-radius: 12px;
          }
          
          .logo-container { margin-bottom: 1.5rem; }
          .logo-text { font-size: 1rem !important; }

          .roadmap-section { padding: 1.5rem 1rem; border-radius: 16px; }
          .roadmap-stepper { flex-direction: column; gap: 1.2rem; align-items: flex-start; padding-left: 10px; }
          .step-item { flex-direction: row; gap: 15px; align-items: center; width: 100%; min-width: auto; }
          .step-node { width: 32px; height: 32px; font-size: 0.8rem; flex-shrink: 0; margin-bottom: 0; }
          .step-label { text-align: left; font-size: 0.95rem; line-height: 1.4; color: var(--text-primary); font-weight: 700; }
          .step-line { left: 16px; top: 32px; width: 2px; height: calc(100% + 1.2rem); }
          
          .stats-grid { grid-template-columns: 1fr; gap: 1.2rem; }
          .stat-card { padding: 1.5rem 1.25rem; border-radius: 20px; }
          .skill-circles { justify-content: space-around; gap: 10px; }
          
          .curriculum-controls { flex-direction: column; gap: 1rem; }
          .control-left, .control-right { width: 100%; display: grid; grid-template-columns: 1fr; gap: 8px; }
          .control-right { grid-template-columns: 1fr 1fr; }
          .toggle-button { justify-content: center; font-size: 0.85rem; padding: 12px 10px; border-radius: 12px; }
          
          .table-container { 
            margin: 1.5rem 0; width: 100%; 
            border-radius: 0; border: none;
            overflow: visible;
          }
          .curriculum-table, .curriculum-table tbody, .curriculum-table tr, .curriculum-table td {
            display: block;
            width: 100%;
          }
          .curriculum-table thead {
            display: none;
          }
          .curriculum-table tr {
            background: var(--bg-tertiary);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow);
            position: relative;
          }
          .curriculum-table td {
            padding: 0.8rem 0;
            border: none !important;
            display: flex;
            flex-direction: column;
            gap: 6px;
            text-align: left;
          }
          .curriculum-table td:before {
            content: attr(data-label);
            font-size: 0.7rem;
            font-weight: 800;
            color: var(--accent);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .id-cell { 
            margin-bottom: 1rem; 
            padding-bottom: 1.2rem !important; 
            border-bottom: 1px solid var(--border) !important; 
            flex-direction: row !important;
            justify-content: space-between;
            align-items: center;
          }
          .id-cell:before { content: "CHAPTER " !important; font-size: 0.9rem !important; }
          .title-cell { font-size: 1.2rem !important; line-height: 1.4; color: var(--text-primary); }
          .desc-cell { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; }
          .curriculum-table .time-badge, .curriculum-table .cat-badge { align-self: flex-start; margin-top: 4px; }
          .title-cell { font-size: 0.95rem !important; }
          
          .modal { 
            padding: 2rem 1.5rem; border-radius: 24px; width: 95%; max-height: 85vh; 
            margin: 0 auto; overflow-y: auto;
          }
          .modal-title { font-size: 1.8rem; line-height: 1.3; margin-bottom: 2rem; }
          .highlight-text { font-size: 1.2rem; }
          .modal-close-btn { top: 15px; right: 15px; width: 40px; height: 40px; }

          .splash-title { font-size: 2.2rem; }
          .splash-subtitle { font-size: 1rem; }

          .terminology-grid { grid-template-columns: 1fr; gap: 1rem; }
          .term-card { padding: 1.5rem; }
          
          .example-visual { width: 100% !important; min-height: 200px !important; border-radius: 20px; }
          .example-info { gap: 1.2rem; }
          .example-title-large { font-size: 1.6rem; }
          .example-detail-split { grid-template-columns: 1fr; gap: 1rem; }
        }

        @media print {
          :root, [data-theme='dark'] {
            --bg-primary: #ffffff !important;
            --bg-secondary: #f0f0f2 !important;
            --bg-tertiary: #f9f9fb !important;
            --text-primary: #000000 !important;
            --text-secondary: #4b4b4b !important;
            --border: rgba(0, 0, 0, 0.12) !important;
          }
          @page { margin: 0; size: A4; }
          html, body { margin: 0 !important; padding: 0 !important; -webkit-print-color-adjust: exact !important; }
          body { background: white !important; color: black !important; padding: 1cm 1cm !important; }
          .app-container { padding: 0 !important; width: 100% !important; max-width: 100% !important; border: none; margin: 0 !important; }
          nav, footer, .toggle-button, .download-btn, .print-btn, .icon-button, .action-button, .modal-close-btn, .terminology-container, .examples-showcase { display: none !important; }
          header { margin-bottom: 4rem !important; text-align: center !important; }
          h1 { font-size: 3rem !important; margin-bottom: 1rem !important; color: #000 !important; -webkit-text-fill-color: #000 !important; display: block !important; text-align: center !important; }
          .header-subtitle { font-size: 1.3rem !important; color: #333 !important; display: block !important; margin-top: 1rem !important; text-align: center !important; }
          .visuals-container { margin-bottom: 2rem !important; break-inside: avoid; }
          .roadmap-section { border: 1px solid #ddd !important; padding: 1.5rem !important; margin-bottom: 2rem !important; }
          .stats-grid { gap: 1rem !important; margin-bottom: 2rem !important; }
          .stat-card { border: 1px solid #ddd !important; padding: 1.2rem !important; break-inside: avoid; }
          
          /* Force table to start on a new page and fit perfectly into one A4 sheet */
          .table-container { page-break-before: always; border: 2px solid #ccc !important; box-shadow: none !important; border-radius: 0; overflow: visible !important; width: 100%; margin-top: 0 !important; }
          .curriculum-table { width: 100% !important; border-collapse: collapse !important; }
          .curriculum-table th { background: #f5f5f5 !important; border-bottom: 2px solid #888 !important; color: #000 !important; padding: 0.4rem 0.4rem !important; font-size: 0.85rem !important; font-weight: 800 !important; white-space: nowrap !important; }
          .curriculum-table td { border-bottom: 1px solid #e0e0e0 !important; color: #000 !important; padding: 0.25rem 0.4rem !important; font-size: 0.75rem !important; line-height: 1.15 !important; }
          .id-cell { color: #000 !important; font-weight: 900 !important; }
          .cat-badge, .time-badge, .project-id-badge { background: #e8e8e8 !important; color: #000 !important; border: 1px solid #bbb !important; display: inline-block !important; padding: 1px 4px !important; border-radius: 4px !important; font-size: 0.65rem !important; }
          .title-cell { font-size: 0.8rem !important; font-weight: 700 !important; }
        }
      `}</style>

      <footer style={{ marginTop: '8rem', textAlign: 'center', padding: '4rem 0', borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
        <p>© 2026 Vibe Coding - For Professional Instructors</p>
      </footer>
    </div>
    </>
  );
}
