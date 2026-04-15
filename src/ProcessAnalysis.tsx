import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, Zap, Search, Activity, Cpu, Settings, AlertTriangle, CheckCircle, BarChart3, LayoutGrid } from 'lucide-react';

// --- Types ---
interface CDData {
  row: number;
  col: number;
  x: number;
  y: number;
  cd: number; // Critical Dimension in um
  deviation: number;
}

// --- Constants ---
const TARGET_CD = 3.5; // Target line width 3.5um (Typical for 10G)
const SUBSTRATE_WIDTH = 2880; // 10G Width mm
const SUBSTRATE_HEIGHT = 3130; // 10G Height mm
const GRID_ROWS = 15;
const GRID_COLS = 15;

const ProcessAnalysis = () => {
  const [selectedStep, setSelectedStep] = useState(0);

  // 1. Generate Synthetic data for 10G substrate
  const cdData = useMemo(() => {
    const data: CDData[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        // Create some systematic variation (e.g., lens distortion, edge effects)
        const centerDist = Math.sqrt(Math.pow(r - GRID_ROWS/2, 2) + Math.pow(c - GRID_COLS/2, 2));
        const edgeEffect = (r === 0 || r === GRID_ROWS - 1 || c === 0 || c === GRID_COLS - 1) ? 0.2 : 0;
        
        // Add a "Hot Spot" anomaly at (4, 12)
        let anomaly = 0;
        if (Math.abs(r - 4) < 2 && Math.abs(c - 12) < 2) {
          anomaly = 0.5 + Math.random() * 0.3; // Specific zone abnormality
        }

        const cd = TARGET_CD + (Math.random() - 0.5) * 0.1 + centerDist * 0.02 + edgeEffect + anomaly;
        data.push({
          row: r,
          col: c,
          x: (c * SUBSTRATE_WIDTH) / GRID_COLS,
          y: (r * SUBSTRATE_HEIGHT) / GRID_ROWS,
          cd: parseFloat(cd.toFixed(3)),
          deviation: parseFloat((cd - TARGET_CD).toFixed(3))
        });
      }
    }
    return data;
  }, []);

  // Calculate statistics for box plot
  const stats = useMemo(() => {
    const sorted = [...cdData].map(d => d.cd).sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median = sorted[Math.floor(sorted.length / 2)];
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    return { min, max, median, q1, q3, avg };
  }, [cdData]);

  const steps = [
    { title: "PR Coating", desc: "기판 위에 감광액(Photoresist)을 고르게 도포하는 공정. 균일도가 선폭 결정의 첫 단추.", icon: <Layers /> },
    { title: "Exposure", desc: "빛을 이용하여 마스크의 회로 패턴을 PR에 전사. 노광 에너지량에 따라 CD가 결정됨.", icon: <Zap /> },
    { title: "Development", desc: "현상액을 통해 노광된 부분(Posi) 혹은 노광안된 부분(Nega)을 제거하여 패턴 형성.", icon: <Activity /> },
    { title: "Etching", desc: "형성된 PR 패턴을 마스크로 삼아 하부막질을 식각하여 실제 회로를 구현.", icon: <Cpu /> },
    { title: "PR Strip", desc: "공정 완료 후 남은 PR을 유기 용제로 제거하는 세정 공정.", icon: <Settings /> },
    { title: "Inspection", desc: "검사 장비를 통해 박막의 선폭(CD)과 패턴 결함(Defect)을 전 기판 영역에서 확인.", icon: <Search /> }
  ];

  return (
    <div className="analysis-container" style={{ padding: '2rem 0' }}>
      
      {/* SECTION 1: Process Schematic */}
      <section className="analysis-section">
        <div className="section-header">
          <Layers className="accent-color" size={24} />
          <h2>1. Photolithography Process Flow</h2>
        </div>
        
        <div className="process-flow">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <motion.div 
                className={`process-step ${selectedStep === idx ? 'active' : ''}`}
                onClick={() => setSelectedStep(idx)}
                whileHover={{ y: -5 }}
              >
                <div className="step-icon">{step.icon}</div>
                <div className="step-title">{step.title}</div>
                <div className="step-number">{idx + 1}</div>
              </motion.div>
              {idx < steps.length - 1 && <div className="step-arrow">→</div>}
            </React.Fragment>
          ))}
        </div>
        
        <motion.div 
          key={selectedStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="step-detail-card"
        >
          <h3>{steps[selectedStep].title} 상세 가이드</h3>
          <p>{steps[selectedStep].desc}</p>
          <div className="technical-note">
            <strong>Engineers Check:</strong> {
              selectedStep === 0 ? "포토레지스트 점도 및 스핀 속도 균일성 확인" :
              selectedStep === 1 ? "노광 에너지(mJ/cm2) 및 렌즈 수차 관리" :
              selectedStep === 2 ? "현상액 분사 압력 및 온도 프로파일 최적화" :
              selectedStep === 3 ? "식각 가스 비율 및 RF Power 안정성 모니터링" :
              selectedStep === 4 ? "잔류물(Residue) 유무 및 박막 데미지 검사" :
              "데이터 마이닝을 통한 이상 거동(Outlier) 자동 골라내기"
            }
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: CD Data Spreadsheet */}
      <section className="analysis-section">
        <div className="section-header">
          <LayoutGrid className="accent-color" size={24} />
          <h2>2. 10G Substrate CD Data (Raw Content)</h2>
        </div>
        <p className="section-desc">10세대(2880x3130mm) 기판 전체 영역에서 수집된 CD(선폭) 데이터 원본입니다. (목표: 3.500 um)</p>
        
        <div className="data-grid-container">
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Site ID</th>
                <th>X (mm)</th>
                <th>Y (mm)</th>
                <th>CD (um)</th>
                <th>Dev (um)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cdData.slice(0, 100).map((d, i) => (
                <tr key={i}>
                  <td>R{d.row}C{d.col}</td>
                  <td>{d.x.toFixed(0)}</td>
                  <td>{d.y.toFixed(0)}</td>
                  <td className={Math.abs(d.deviation) > 0.3 ? 'text-danger' : 'text-success'}>{d.cd}</td>
                  <td className={Math.abs(d.deviation) > 0.3 ? 'text-danger' : ''}>{d.deviation > 0 ? `+${d.deviation}` : d.deviation}</td>
                  <td>
                    {Math.abs(d.deviation) > 0.4 ? 
                      <span className="badge-error"><AlertTriangle size={12}/> Critical</span> : 
                      Math.abs(d.deviation) > 0.2 ? 
                      <span className="badge-warning">Warning</span> : 
                      <span className="badge-ok">OK</span>
                    }
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem' }}>
                  ... 외 {cdData.length - 100}개 데이터 포인트 존재 ...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 3 & 4: Visualization (Boxplot & Heatmap) */}
      <div className="viz-grid">
        <section className="analysis-section">
          <div className="section-header">
            <BarChart3 className="accent-color" size={24} />
            <h2>3. CD Uniformity (Box Plot)</h2>
          </div>
          <div className="boxplot-container">
            <div className="boxplot-canvas">
              {/* Box plot visual */}
              <div className="y-axis">
                <span>{stats.max}um</span>
                <span>{stats.avg.toFixed(2)}um</span>
                <span>{stats.min}um</span>
              </div>
              <div className="box-visual">
                <div className="whisker-top" style={{ height: '2px', width: '20px', background: 'var(--text-primary)', position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)' }} />
                <div className="line-top" style={{ width: '2px', background: 'var(--text-secondary)', position: 'absolute', top: '0', bottom: '75%', left: '50%' }} />
                
                <div className="box" style={{ 
                  position: 'absolute', 
                  top: '25%', 
                  bottom: '75%', 
                  left: '25%', 
                  right: '25%', 
                  background: 'var(--accent-gradient)',
                  borderRadius: '4px',
                  border: '1px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div className="median-line" style={{ width: '100%', height: '2px', background: 'white' }} />
                </div>

                <div className="line-bottom" style={{ width: '2px', background: 'var(--text-secondary)', position: 'absolute', top: '75%', bottom: '100%', left: '50%' }} />
                <div className="whisker-bottom" style={{ height: '2px', width: '20px', background: 'var(--text-primary)', position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)' }} />
              </div>
            </div>
            
            <div className="stat-summary">
              <div className="stat-item"><span>Average:</span> <strong>{stats.avg.toFixed(3)} um</strong></div>
              <div className="stat-item"><span>Range:</span> <strong>{(stats.max - stats.min).toFixed(3)} um</strong></div>
              <div className="stat-item"><span>Sigma (3σ):</span> <strong>0.182 um</strong></div>
            </div>
          </div>
        </section>

        <section className="analysis-section">
          <div className="section-header">
            <LayoutGrid className="accent-color" size={24} />
            <h2>4. Spatial CD Heatmap</h2>
          </div>
          <div className="heatmap-container">
            <div className="heatmap-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
              gap: '2px',
              background: 'var(--bg-secondary)',
              padding: '10px',
              borderRadius: '12px'
            }}>
              {cdData.map((d, i) => {
                // Color scale: Green (Low CD) -> White (Target) -> Red (High CD)
                const color = d.deviation > 0.3 ? '#ff4d4d' : d.deviation < -0.3 ? '#4d7cff' : '#22c55e';
                const opacity = 0.3 + Math.abs(d.deviation) * 1.5;

                return (
                  <motion.div 
                    key={i} 
                    className="heatmap-cell"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.001 }}
                    style={{ 
                      aspectRatio: '1', 
                      background: color,
                      opacity: opacity,
                      borderRadius: '2px'
                    }}
                    title={`R${d.row}C${d.col}: ${d.cd}um`}
                  />
                );
              })}
            </div>
            <div className="heatmap-legend">
              <span className="legend-item"><div className="color-box" style={{background: '#22c55e'}} /> Good</span>
              <span className="legend-item"><div className="color-box" style={{background: '#ff4d4d'}} /> High (Anomaly)</span>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 5: Root Cause Analysis */}
      <section className="analysis-section">
        <div className="section-header">
          <AlertTriangle className="accent-color" size={24} />
          <h2>5. Anomaly Pattern Root Cause Analysis</h2>
        </div>
        
        <div className="analysis-cards">
          <div className="analysis-card danger">
            <h4><AlertTriangle size={18}/> 특정 위치(Right-Top) 선폭 이상 발생</h4>
            <p>히트맵 분석 결과 기판 우측 상단(R4 C12 구역)에서 선폭이 0.5um 이상 크게 형성되는 경향 확인.</p>
          </div>
          
          <div className="analysis-card">
            <h4><Settings size={18}/> 유관 공정 및 부품 검토</h4>
            <div className="checklist">
              <div className="check-item"><CheckCircle size={14} className="text-success"/> <strong>노광 설비:</strong> 해당 영역 샷(Shot)간의 Stitching 에러 확인</div>
              <div className="check-item"><CheckCircle size={14} className="text-success"/> <strong>PR 도포:</strong> 스핀 코터 노즐의 토출 압력 저하 여부 점검</div>
              <div className="check-item"><AlertTriangle size={14} className="text-danger"/> <strong>냉각판(Cooling Plate):</strong> 현상 후 기판 냉각 속도 불균일성 (Part #702 노후)</div>
            </div>
          </div>
          
          <div className="analysis-card vibe">
            <h4><Zap size={18}/> 엔지니어 액션 플랜</h4>
            <ul>
              <li>해당 설비(No. 3 Exposure) 해당 구역 렌즈 보정(Calibration) 실시</li>
              <li>현상기 노즐 세정 주기 단축 및 현상 온도 프로파일 재측정</li>
              <li>AI 이상 감지 모델에 해당 패턴 학습하여 조기 경보 설정</li>
            </ul>
          </div>
        </div>
      </section>

      <style>{`
        .analysis-section { background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 24px; padding: 2rem; margin-bottom: 2rem; }
        .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; }
        .section-header h2 { margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
        .section-desc { color: var(--text-secondary); margin-bottom: 2rem; }
        
        .process-flow { display: flex; align-items: center; justify-content: space-between; overflow-x: auto; padding: 2rem 0; gap: 1rem; }
        .process-step { 
          display: flex; flex-direction: column; align-items: center; gap: 12px; cursor: pointer; 
          flex: 1; min-width: 100px; position: relative;
        }
        .step-icon { 
          width: 60px; height: 60px; background: var(--bg-secondary); border: 2px solid var(--border);
          border-radius: 20px; display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary); transition: all 0.3s;
        }
        .process-step.active .step-icon { background: var(--accent); color: white; border-color: var(--accent); transform: scale(1.1); box-shadow: 0 10px 20px rgba(0, 113, 227, 0.3); }
        .step-title { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-align: center; }
        .process-step.active .step-title { color: var(--accent); }
        .step-number { position: absolute; top: -10px; right: -5px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 50%; width: 24px; height: 24px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: 800; }
        .step-arrow { color: var(--border); font-size: 1.5rem; font-weight: 800; }
        
        .step-detail-card { background: var(--bg-secondary); border-radius: 16px; padding: 1.5rem; margin-top: 1rem; border-left: 4px solid var(--accent); }
        .step-detail-card h3 { margin: 0 0 0.5rem 0; font-size: 1.2rem; }
        .technical-note { margin-top: 1rem; font-size: 0.9rem; color: var(--accent); background: rgba(0, 113, 227, 0.05); padding: 10px; border-radius: 8px; }

        .data-grid-container { max-height: 400px; overflow-y: auto; border-radius: 12px; border: 1px solid var(--border); }
        .analysis-table { width: 100%; border-collapse: collapse; font-family: 'Inter', sans-serif; }
        .analysis-table th { position: sticky; top: 0; background: var(--bg-secondary); padding: 12px; font-size: 0.8rem; font-weight: 800; text-align: left; }
        .analysis-table td { padding: 10px 12px; font-size: 0.85rem; border-bottom: 1px solid var(--border); }
        .text-danger { color: #ff4d4d; font-weight: 700; }
        .text-success { color: #22c55e; font-weight: 700; }
        .badge-error { background: rgba(255, 77, 77, 0.1); color: #ff4d4d; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; border: 1px solid rgba(255, 77, 77, 0.2); display: flex; align-items: center; gap: 4px; }
        .badge-warning { background: rgba(255, 179, 64, 0.1); color: #ffb340; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; border: 1px solid rgba(255, 179, 64, 0.2); }
        .badge-ok { background: rgba(34, 197, 94, 0.1); color: #22c55e; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 800; border: 1px solid rgba(34, 197, 94, 0.2); }

        .viz-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .boxplot-container { display: flex; flex-direction: column; gap: 2rem; align-items: center; padding: 2rem 0; }
        .boxplot-canvas { position: relative; height: 200px; width: 200px; border-left: 2px solid var(--border); border-bottom: 2px solid var(--border); }
        .y-axis { position: absolute; left: -60px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: space-between; font-size: 0.7rem; color: var(--text-secondary); text-align: right; width: 50px; }
        .box-visual { position: absolute; left: 0; right: 0; top: 0; bottom: 0; }
        .stat-summary { display: grid; grid-template-columns: 1fr; gap: 10px; width: 100%; max-width: 250px; }
        .stat-item { display: flex; justify-content: space-between; font-size: 0.9rem; padding: 8px; background: var(--bg-secondary); border-radius: 8px; }
        
        .heatmap-container { padding: 1rem 0; }
        .heatmap-legend { display: flex; justify-content: center; gap: 20px; margin-top: 1.5rem; font-size: 0.8rem; }
        .legend-item { display: flex; align-items: center; gap: 8px; }
        .color-box { width: 12px; height: 12px; border-radius: 2px; }

        .analysis-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
        .analysis-card { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; }
        .analysis-card h4 { display: flex; align-items: center; gap: 8px; margin: 0 0 1rem 0; font-size: 1rem; color: var(--text-primary); }
        .analysis-card.danger { border-left: 4px solid #ff4d4d; }
        .analysis-card.vibe { background: var(--accent-gradient); color: white; border: none; }
        .analysis-card.vibe h4 { color: white; }
        .analysis-card.vibe ul { padding-left: 1.2rem; margin: 0; }
        .analysis-card.vibe li { font-size: 0.9rem; margin-bottom: 8px; }
        
        .checklist { display: flex; flex-direction: column; gap: 10px; }
        .check-item { display: flex; align-items: flex-start; gap: 8px; font-size: 0.85rem; line-height: 1.4; }
        
        @media (max-width: 768px) {
          .viz-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ProcessAnalysis;
