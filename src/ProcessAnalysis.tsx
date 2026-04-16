import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, Zap, Search, Activity, Cpu, Settings, AlertTriangle, BarChart3, LayoutGrid, Sparkles } from 'lucide-react';

// --- Types ---
interface CDData {
  row: number;
  col: number;
  x: number;
  y: number;
  cd: number;
  deviation: number;
}

// --- Constants ---
const TARGET_CD = 3.5;
const SUBSTRATE_WIDTH = 2880;
const SUBSTRATE_HEIGHT = 3130;
const GRID_ROWS = 40;
const GRID_COLS = 35;

// --- Sub-components ---
const CrossSectionVisual = ({ step }: { step: number }) => {
  const layers = {
    glass: "#cbd5e1",
    metal: "#64748b",
    pr: "#fbbf24",
    pr_exposed: "#b45309",
    beam: "#fcd34d"
  };

  // Define persistent pattern positions for consistency across steps
  const islands = [
    { x: 50, w: 50 },
    { x: 140, w: 110 },
    { x: 290, w: 60 }
  ];

  return (
    <div className="cross-section-container">
      <svg viewBox="0 0 400 150" className="cross-section-svg">
        {/* Glass Substrate - Always bottom */}
        <rect x="50" y="100" width="300" height="30" fill={layers.glass} rx="2" />
        <text x="360" y="125" fontSize="10" fill="var(--text-secondary)">Glass Substrate</text>

        {/* Metal Layer - Dynamic based on etching step */}
        {step <= 2 ? (
          // Steps 0, 1, 2: Metal is still a full solid layer
          <rect x="50" y="85" width="300" height="15" fill={layers.metal} />
        ) : (
          // Steps 3, 4, 5: Metal has been ETCHED (only islands remain)
          islands.map((seg, i) => (
            <rect key={`metal-${i}`} x={seg.x} y={85} width={seg.w} height={15} fill={layers.metal} />
          ))
        )}
        
        {/* PR (Photoresist) Layer - Dynamic based on process flow */}
        {step === 0 && ( // PR Coating
          <motion.rect 
            initial={{ width: 0 }} animate={{ width: 300 }} transition={{ duration: 1.5, ease: "easeOut" }}
            x="50" y="70" height="15" fill={layers.pr} rx="2" 
          />
        )}

        {step === 1 && ( // Exposure
          <>
            <rect x="50" y="70" width="300" height="15" fill={layers.pr} />
            {/* Mask */}
            <rect x="50" y="25" width="300" height="8" fill="#1e293b" rx="2" />
            <rect x="100" y="25" width="40" height="8" fill="white" opacity="0.4" />
            <rect x="250" y="25" width="40" height="8" fill="white" opacity="0.4" />
            {/* UV Beams hitting "exposed" areas */}
            <motion.path 
              initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}
              d="M120,33 L120,70 M270,33 L270,70" stroke={layers.beam} strokeWidth="3" strokeDasharray="4 2"
            />
            {/* Chemical change in PR */}
            <rect x="100" y="70" width="40" height="15" fill={layers.pr_exposed} />
            <rect x="250" y="70" width="40" height="15" fill={layers.pr_exposed} />
          </>
        )}

        {step === 2 && ( // Development (Exposed areas removed - Positive PR example)
          islands.map((seg, i) => (
            <rect key={`pr-${i}`} x={seg.x} y={70} width={seg.w} height={15} fill={layers.pr} />
          ))
        )}

        {step === 3 && ( // Etching (PR is still there, Metal is being cut)
          <>
            {/* PR Islands on top */}
            {islands.map((seg, i) => (
              <rect key={`pr-etch-${i}`} x={seg.x} y={70} width={seg.w} height={15} fill={layers.pr} />
            ))}
            {/* Metal islands are already rendered by the "Metal Layer" logic above Step 3 */}
            <motion.path 
              animate={{ opacity: [0.2, 0.6, 0.2] }} transition={{ repeat: Infinity, duration: 1 }}
              d="M100,85 L140,85 M250,85 L290,85" stroke="#ef4444" strokeWidth="2"
            />
          </>
        )}

        {step === 4 && ( // Strip (PR Is GONE, Metal Islands Remain)
          // No PR here, Metal is rendered by top logic
          <motion.g initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1.5 }}>
             {islands.map((seg, i) => (
                <rect key={`pr-striping-${i}`} x={seg.x} y={70} width={seg.w} height={15} fill={layers.pr} />
              ))}
          </motion.g>
        )}

        {step === 5 && ( // Inspection (Final Pattern + Scanning)
          <>
            <motion.line 
              animate={{ x: [0, 250, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              x1="75" y1="10" x2="75" y2="100" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 3"
            />
            <motion.circle 
              animate={{ x: [0, 250, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              cx="75" cy="100" r="4" fill="#3b82f6" opacity="0.4"
            />
            <text x="360" y="95" fontSize="10" fill="#3b82f6" fontWeight="bold">Scanning...</text>
          </>
        )}
      </svg>
    </div>
  );
};

const GlassPlanView = ({ data }: { data: CDData[] }) => (
  <div className="glass-plan-container">
    <div className="glass-rect">
      <div className="coordinate origin">(0, 0)</div>
      <div className="coordinate x-max">2,880mm</div>
      <div className="coordinate y-max">3,130mm</div>
      <div className="axis-label x">X-Axis Position</div>
      <div className="axis-label y">Y-Axis Position</div>
      
      {/* Show all 1400 measurement points */}
      <svg viewBox="0 0 35 40" className="points-overlay">
        {data.map((d, i) => (
          <circle 
            key={i} 
            cx={d.col} 
            cy={d.row} 
            r="0.2" 
            fill="#d1d5db" 
            opacity="0.8"
          />
        ))}
      </svg>
      
      <div className="plan-grid">
        {[...Array(12)].map((_, i) => <div key={i} className="plan-line" />)}
      </div>
    </div>
    <div className="plan-info">
      <h4><LayoutGrid size={14}/> 10.5G Substrate (2,880 x 3,130mm)</h4>
      <p>Total {data.length} measurement sites mapped</p>
    </div>
  </div>
);

const ProcessAnalysis = () => {
  const [selectedStep, setSelectedStep] = useState(0);

  const cdData = useMemo(() => {
    const data: CDData[] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const centerDist = Math.sqrt(Math.pow(r - GRID_ROWS/2, 2) + Math.pow(c - GRID_COLS/2, 2));
        const edgeEffect = (r < 5 || r > GRID_ROWS - 6 || c < 5 || c > GRID_COLS - 6) ? 0.4 : 0;
        const radialVar = centerDist * 0.04;

        let anomaly = 0;
        if (Math.random() > 0.985) anomaly = (Math.random() - 0.5) * 1.8;
        if (Math.abs(r - GRID_ROWS*0.25) < 4 && Math.abs(c - GRID_COLS*0.75) < 4) {
          anomaly += 0.7 + Math.random() * 0.5;
        }

        const cd = TARGET_CD + (Math.random() - 0.5) * 0.2 + radialVar + edgeEffect + anomaly;
        data.push({
          row: r, col: c,
          x: (c * SUBSTRATE_WIDTH) / GRID_COLS,
          y: (r * SUBSTRATE_HEIGHT) / GRID_ROWS,
          cd: parseFloat(cd.toFixed(3)),
          deviation: parseFloat((cd - TARGET_CD).toFixed(3))
        });
      }
    }
    return data;
  }, []);

  const stats = useMemo(() => {
    const sorted = [...cdData].map(d => d.cd).sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const median = sorted[Math.floor(sorted.length / 2)];
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    const outliers = cdData.filter(d => d.cd < q1 - 1.5*(q3-q1) || d.cd > q3 + 1.5*(q3-q1));
    return { min, max, median, q1, q3, avg, outliers };
  }, [cdData]);

  // Helper to map CD values to Y coordinate (0-300px scale)
  const mapY = (val: number) => {
    const minRange = 2.5;
    const maxRange = 5.0;
    return 300 - ((val - minRange) / (maxRange - minRange)) * 250;
  };

  const steps = [
    { title: "PR Coating", desc: "감광액 도포 및 Soft Bake", icon: <Layers /> },
    { title: "Exposure", desc: "패턴 노광 시뮬레이션", icon: <Zap /> },
    { title: "Development", desc: "현상 공정 및 린스", icon: <Activity /> },
    { title: "Etching", desc: "금속막 식각(Wet/Dry)", icon: <Cpu /> },
    { title: "PR Strip", desc: "감광층 제거 및 최종 세정", icon: <Settings /> },
    { title: "Inspection", desc: "CD ADI/ASI 품질 검사", icon: <Search /> }
  ];

  return (
    <div className="analysis-page">
      {/* 1. Process Schematic */}
      <section className="analysis-card-section">
        <div className="section-header-v2">
          <Layers className="text-accent" />
          <h2>STEP 1. Layer-by-Layer 공정 단면 시뮬레이션</h2>
        </div>
        
        <div className="process-nav">
          {steps.map((s, i) => (
            <button key={i} className={`nav-item ${selectedStep === i ? 'active' : ''}`} onClick={() => setSelectedStep(i)}>
              <div className="nav-icon">{s.icon}</div>
              <span>{s.title}</span>
            </button>
          ))}
        </div>

        <div className="schematic-layout">
          <div className="schematic-box">
             <CrossSectionVisual step={selectedStep} />
          </div>
          <div className="process-info-box">
            <h3>{steps[selectedStep].title} 상세 분석</h3>
            <p>{steps[selectedStep].desc}</p>
            <div className="spec-grid">
              <div className="spec-pill"><span>Layer</span> <strong>Active (GIZO)</strong></div>
              <div className="spec-pill"><span>Status</span> <strong>In Progress</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Plan View & Data */}
      <section className="analysis-card-section">
        <div className="section-header-v2">
          <LayoutGrid className="text-accent" />
          <h2>STEP 2. 기판 평면도 및 좌표계 기반 샘플링</h2>
        </div>
        <div className="plan-view-split">
          <GlassPlanView data={cdData} />
          <div className="data-table-preview">
            <div className="table-header">Raw Data (Top 100 / {cdData.length})</div>
            <div className="scroll-table-box">
              <table className="mini-table">
                <thead><tr><th>Site</th><th>X(mm)</th><th>Y(mm)</th><th>CD(um)</th></tr></thead>
                <tbody>
                  {cdData.slice(0, 100).map((d, i) => (
                    <tr key={i}><td>S{i}</td><td>{d.x.toFixed(0)}</td><td>{d.y.toFixed(0)}</td><td>{d.cd}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Advanced BoxPlot */}
      <section className="analysis-card-section">
        <div className="section-header-v2">
          <BarChart3 className="text-accent" />
          <h2>STEP 3. 통계적 선폭 산포 분석 (Excel vs AI)</h2>
        </div>
        <div className="boxplot-advanced-grid">
          <div className="boxplot-visual-container">
            <svg viewBox="0 0 400 350" className="box-svg">
              {/* Grid Lines */}
              {[2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map(v => (
                <g key={v}>
                  <line x1="60" y1={mapY(v)} x2="350" y2={mapY(v)} stroke="var(--border)" strokeDasharray="4 2" opacity="0.5" />
                  <text x="50" y={mapY(v) + 4} fontSize="10" textAnchor="end" fill="var(--text-secondary)">{v.toFixed(1)}</text>
                </g>
              ))}
              
              <line x1="60" y1="20" x2="60" y2="300" stroke="var(--text-primary)" strokeWidth="1.5" />
              <line x1="60" y1="300" x2="350" y2="300" stroke="var(--text-primary)" strokeWidth="1.5" />
              
              {/* Whiskers */}
              <line x1="180" y1={mapY(stats.max)} x2="220" y2={mapY(stats.max)} stroke="var(--accent)" strokeWidth="2" />
              <line x1="200" y1={mapY(stats.max)} x2="200" y2={mapY(stats.q3)} stroke="var(--accent)" strokeWidth="2" />
              
              <motion.rect 
                initial={{ height: 0, y: mapY(stats.median) }} 
                animate={{ height: mapY(stats.q1) - mapY(stats.q3), y: mapY(stats.q3) }}
                x="150" width="100" fill="var(--accent-gradient)" rx="4" opacity="0.8" 
              />
              
              {/* Median Line */}
              <line x1="150" y1={mapY(stats.median)} x2="250" y2={mapY(stats.median)} stroke="white" strokeWidth="3" />
              
              <line x1="200" y1={mapY(stats.q1)} x2="200" y2={mapY(stats.min)} stroke="var(--accent)" strokeWidth="2" />
              <line x1="180" y1={mapY(stats.min)} x2="220" y2={mapY(stats.min)} stroke="var(--accent)" strokeWidth="2" />

              {/* Mean Marker */}
              <path d={`M192,${mapY(stats.avg)-8} L208,${mapY(stats.avg)+8} M208,${mapY(stats.avg)-8} L192,${mapY(stats.avg)+8}`} stroke="#ff4d4d" strokeWidth="2.5" />
              
              {/* Annotation Labels */}
              <g fontSize="11" fontWeight="700" fill="var(--text-primary)">
                <text x="260" y={mapY(stats.max)}>Max: {stats.max}</text>
                <text x="260" y={mapY(stats.q3)} fill="var(--accent)">Q3: {stats.q3}</text>
                <text x="260" y={mapY(stats.median) + 4} stroke="var(--bg-primary)" strokeWidth="3" paintOrder="stroke">Median: {stats.median}</text>
                <text x="260" y={mapY(stats.median) + 4}>Median: {stats.median}</text>
                <text x="260" y={mapY(stats.q1)} fill="var(--accent)">Q1: {stats.q1}</text>
                <text x="260" y={mapY(stats.min)}>Min: {stats.min}</text>
                <text x="140" y={mapY(stats.avg) + 4} textAnchor="end" fill="#ff4d4d">Mean: {stats.avg.toFixed(3)}</text>
              </g>

              {/* Outliers */}
              {stats.outliers.slice(0, 30).map((o, i) => (
                <circle key={i} cx="200" cy={mapY(o.cd)} r="2.5" fill="#ff4d4d" opacity="0.4" />
              ))}
            </svg>
          </div>
          <div className="insight-card">
            <h4><Sparkles size={16}/> AI 데이터 핸들링의 차이</h4>
            <p>전통적인 수동 분석 방식은 데이터의 일부 샘플만 처리할 수 있었습니다. 바이브 코딩은 <strong>{cdData.length}개</strong>의 실시간 데이터를 즉각적으로 통계 처리하여 시각화 지표를 자동 생성합니다.</p>
          </div>
        </div>
      </section>

      {/* 4. Heatmap */}
      <section className="analysis-card-section">
        <div className="section-header-v2">
          <Activity className="text-accent" />
          <h2>STEP 4. 초정밀 예지적 히트맵 (Predictive Mapping)</h2>
        </div>
        <div className="heatmap-pro-container">
          <div className="heatmap-v2-grid">
            {cdData.map((d, i) => {
              const color = d.deviation > 0.45 ? 'rgba(255, 77, 77, 1)' : d.deviation < -0.45 ? 'rgba(77, 124, 255, 1)' : 'rgba(34, 197, 94, 0.4)';
              return (
                <div key={i} className="h-cell" style={{ background: color }} title={`CD: ${d.cd}`}/>
              );
            })}
          </div>
          <div className="heatmap-legend-v2">
            <div className="l-item"><div className="c-box red"/> Over-Size (+0.5um)</div>
            <div className="l-item"><div className="c-box green"/> Normal Range</div>
            <div className="l-item"><div className="c-box blue"/> Under-Size (-0.5um)</div>
          </div>
        </div>
      </section>

      {/* 5. Root Cause */}
      <section className="analysis-card-section root-cause-section">
        <div className="section-header-v2">
          <AlertTriangle className="text-danger" />
          <h2>STEP 5. 이상 패턴 근인 분석 (Root Cause Analysis)</h2>
        </div>
        
        <div className="analysis-cards-grid">
          <div className="a-card danger">
            <div className="a-card-header"><AlertTriangle size={18}/> Anomaly Detection</div>
            <p>기판 우측 상단 구역에서 선폭이 <strong>+0.5um 이상</strong> 크게 형성되는 클러스터 패턴 확인.</p>
          </div>
          <div className="a-card">
            <div className="a-card-header"><Settings size={18}/> Technical Review</div>
            <ul className="review-list">
              <li><strong>노광 공정:</strong> Stitching 정렬 오차 0.2um 초과</li>
              <li><strong>PR 도포:</strong> EBR 노즐 막힘 현상</li>
              <li><strong>냉각판:</strong> #3 Plate 온도 편차 발생</li>
            </ul>
          </div>
          <div className="a-card vibe">
            <div className="a-card-header"><Zap size={18}/> AI Action Plan</div>
            <p>설비 파워 보정 및 이상 구역 실시간 집중 모니터링 활성.</p>
          </div>
        </div>

        <div className="summary-banner">
          <div className="banner-content">
            <h3>종합 진단 결과</h3>
            <p>공정 보완 시 <strong>수율 2.1% 향상</strong> 및 원가 절감 기대.</p>
          </div>
          <button className="download-btn-v2">Full Report Export</button>
        </div>
      </section>

      <style>{`
        .analysis-page { display: flex; flex-direction: column; gap: 2.5rem; }
        .analysis-card-section { background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 28px; padding: 3rem; }
        .section-header-v2 { display: flex; align-items: center; gap: 14px; margin-bottom: 2.5rem; }
        .section-header-v2 h2 { font-size: 1.5rem; font-weight: 900; }
        .text-accent { color: var(--accent); }
        .text-danger { color: #ff4d4d; }

        .process-nav { display: flex; justify-content: space-around; background: var(--bg-secondary); padding: 1rem; border-radius: 20px; margin-bottom: 2.5rem; }
        .nav-item { border: none; background: transparent; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; opacity: 0.4; transition: 0.2s; }
        .nav-item.active { opacity: 1; color: var(--accent); }
        .nav-icon { width: 44px; height: 44px; background: var(--bg-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow); }
        .nav-item span { font-size: 0.75rem; font-weight: 800; }

        .schematic-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; }
        .schematic-box { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 20px; padding: 2rem; }
        .schematic-svg { width: 100%; height: auto; }
        .process-info-box h3 { margin-bottom: 1rem; color: var(--accent); }
        .spec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
        .spec-pill { background: var(--bg-secondary); padding: 12px; border-radius: 12px; display: flex; flex-direction: column; gap: 4px; }
        .spec-pill span { font-size: 0.6rem; color: var(--text-secondary); text-transform: uppercase; }

        .plan-view-split { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
        .glass-rect { aspect-ratio: 0.9; background: var(--bg-primary); border: 2px solid var(--accent); position: relative; border-radius: 4px; overflow: hidden; }
        .points-overlay { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 5; }
        .coordinate { position: absolute; font-size: 0.7rem; font-weight: 800; color: var(--accent); z-index: 10; }
        .coordinate.origin { bottom: -25px; left: -10px; }
        .coordinate.x-max { bottom: -25px; right: 0; }
        .coordinate.y-max { top: 0; left: -55px; transform: rotate(-90deg); }
        .axis-label { position: absolute; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; color: var(--accent); }
        .axis-label.x { bottom: -50px; left: 50%; transform: translateX(-50%); }
        .axis-label.y { top: 50%; left: -85px; transform: translateY(-50%) rotate(-90deg); }
        .plan-grid { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(4, 1fr); border: 1px dashed var(--border); opacity: 0.2; }
        .plan-info { text-align: center; margin-top: 5rem; }

        .data-table-preview { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 20px; padding: 1.5rem; }
        .scroll-table-box { max-height: 450px; overflow-y: auto; }
        .mini-table { width: 100%; border-collapse: collapse; font-family: monospace; font-size: 0.7rem; }
        .mini-table th { position: sticky; top: 0; background: var(--bg-secondary); padding: 8px; text-align: left; }
        .mini-table td { padding: 6px 8px; border-bottom: 1px solid var(--border); }

        .boxplot-advanced-grid { display: grid; grid-template-columns: 1.3fr 1fr; gap: 3rem; }
        .boxplot-visual-container { background: var(--bg-primary); padding: 2rem; border-radius: 24px; border: 1px solid var(--border); }
        .insight-card { background: rgba(0, 113, 227, 0.04); padding: 2.5rem; border-radius: 24px; border-left: 5px solid var(--accent); }

        .heatmap-pro-container { background: #020617; padding: 1.5rem; border-radius: 24px; }
        .heatmap-v2-grid { display: grid; grid-template-columns: repeat(${GRID_COLS}, 1fr); gap: 1px; }
        .h-cell { aspect-ratio: 1; border-radius: 1px; }
        .heatmap-legend-v2 { display: flex; justify-content: center; gap: 2rem; margin-top: 1.5rem; color: #94a3b8; font-size: 0.75rem; }
        .c-box { width: 12px; height: 12px; border-radius: 2px; margin-right: 8px; }
        .c-box.red { background: #ff4d4d; }
        .c-box.green { background: rgba(34, 197, 94, 0.4); }
        .c-box.blue { background: #4d7cff; }

        .root-cause-section { margin-top: 1rem; }
        .analysis-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0; }
        .a-card { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 20px; padding: 1.8rem; }
        .a-card-header { display: flex; align-items: center; gap: 10px; font-weight: 800; margin-bottom: 1rem; color: var(--accent); }
        .a-card.danger { border-left: 5px solid #ff4d4d; }
        .a-card.vibe { background: var(--accent-gradient); color: white; border: none; }
        .a-card.vibe .a-card-header { color: white; }
        .review-list { padding-left: 1rem; font-size: 0.85rem; line-height: 1.6; color: var(--text-secondary); }
        .summary-banner { background: var(--bg-secondary); border-radius: 20px; padding: 2rem; display: flex; justify-content: space-between; align-items: center; border-left: 8px solid var(--accent); }
        .download-btn-v2 { background: var(--accent); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; }

        @media (max-width: 900px) {
          .schematic-layout, .plan-view-split, .boxplot-advanced-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ProcessAnalysis;
