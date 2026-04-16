import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, Zap, Search, Activity, Cpu, Settings, AlertTriangle, BarChart3, LayoutGrid, Sparkles, CheckCircle } from 'lucide-react';

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

const DistributionChart = ({ data, stats }: { data: CDData[], stats: any }) => {
  const width = 400;
  const height = 350;
  const padding = 50;

  const mapX = (val: number) => padding + ((val - 2.0) / (6.0 - 2.0)) * (width - 2 * padding);
  const mapY = (val: number) => (height - padding) - (val * (height - 2 * padding));

  // Perfectly Unimodal Gaussian Curve logic for Instruction
  const mean = stats.avg;
  const stdDev = 0.5; // Fixed for a broad, perfect curve as requested
  const points = 60;
  
  const gaussian = (x: number) => {
    return Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
  };

  const densityPath = Array.from({ length: points }).map((_, i) => {
    const cdVal = 2.0 + (i / points) * 4.0;
    const x = mapX(cdVal);
    const y = mapY(gaussian(cdVal));
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');

  return (
    <div className="dist-chart-container">
      <svg viewBox={`0 0 ${width} ${height}`} className="dist-svg">
          {/* Grid lines */}
          {[2, 3, 4, 5, 6].map(v => (
            <g key={v}>
              <line x1={mapX(v)} y1={padding} x2={mapX(v)} y2={height-padding} stroke="var(--border)" strokeDasharray="3 2" />
              <text x={mapX(v)} y={height-padding+20} fontSize="10" textAnchor="middle" fill="var(--text-secondary)">{v}um</text>
            </g>
          ))}

          {/* Scatter dots (Jitter) */}
          {data.filter((_, i) => i % 2 === 0).map((d, i) => (
            <circle 
              key={i} 
              cx={mapX(d.cd)} 
              cy={padding + Math.random() * (height - 2 * padding)} 
              r="1.5" 
              fill="var(--accent)" 
              opacity="0.1" 
            />
          ))}

          {/* Density Curve */}
          <path d={densityPath} fill="rgba(0, 113, 227, 0.1)" stroke="var(--accent)" strokeWidth="2.5" />

          {/* Consistent Boxplot Overlay (Matching Step 3) */}
          {/* Consistent Boxplot Overlay (Matching Step 3) */}
          <g transform={`translate(0, ${height/2})`}>
            {/* Whiskers */}
            <line x1={mapX(stats.min)} y1="0" x2={mapX(stats.max)} y2="0" stroke="var(--accent)" strokeWidth="1.5" opacity="0.6" />
            
            {/* Box (Extra Slim: height 20) */}
            <rect 
              x={mapX(stats.q1)} y="-10" 
              width={mapX(stats.q3) - mapX(stats.q1)} height="20" 
              fill="transparent" stroke="var(--accent)" strokeWidth="2" rx="2"
            />
            {/* Median Line */}
            <line x1={mapX(stats.median)} y1="-10" x2={mapX(stats.median)} y2="10" stroke="var(--accent)" strokeWidth="3" />
            
            {/* Mean Line (Blue Bar) */}
            <line x1={mapX(stats.avg)} y1="-10" x2={mapX(stats.avg)} y2="10" stroke="#3b82f6" strokeWidth="3" strokeDasharray="2 1" />
          </g>

          <text x={width/2} y="30" fontSize="12" fontWeight="900" textAnchor="middle" fill="var(--text-primary)">CD Distribution & Density Analysis</text>
      </svg>
    </div>
  );
};

const ProcessAnalysis = () => {
  const [selectedStep, setSelectedStep] = useState(0);

  const cdData = useMemo(() => {
    const data: CDData[] = [];
    const maxDist = Math.sqrt(Math.pow(GRID_ROWS/2, 2) + Math.pow(GRID_COLS/2, 2));
    
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const centerDist = Math.sqrt(Math.pow(r - GRID_ROWS/2, 2) + Math.pow(c - GRID_COLS/2, 2));
        
        // Strong Radial Effect (Concentric)
        const radialEffect = (1 - (centerDist / maxDist)) * 1.2;
        const edgeEffect = (r < 3 || r > GRID_ROWS - 4 || c < 3 || c > GRID_COLS - 4) ? 0.3 : 0;
        
        let noise = (Math.random() - 0.5) * 0.2;
        const cd = TARGET_CD + radialEffect - edgeEffect + noise;
        
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

  // Helper to map CD values to Y coordinate (2.0 - 6.0 range as requested)
  const mapY = (val: number) => {
    const minRange = 2.0;
    const maxRange = 6.0;
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
          <h2>STEP 1. 디스플레이 노광 공정 엔지니어링 (Photolithography)</h2>
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
          <h2>STEP 3. 통계적 선폭 산포 분석 (엑셀, 미니탭 기존통계 툴)</h2>
        </div>
        <div className="boxplot-advanced-grid">
          <div className="boxplot-visual-container">
            <svg viewBox="0 0 400 350" className="box-svg">
              {/* Grid Lines (Zoomed to 2-6 range) */}
              {[2, 3, 4, 5, 6].map(v => (
                <g key={v}>
                  <line x1="60" y1={mapY(v)} x2="350" y2={mapY(v)} stroke="var(--border)" strokeDasharray="4 2" opacity="0.5" />
                  <text x="50" y={mapY(v) + 4} fontSize="10" textAnchor="end" fill="var(--text-secondary)">{v}</text>
                </g>
              ))}
              
              {/* Axis Labels */}
              <text x="15" y="150" transform="rotate(-90, 15, 150)" fontSize="11" fontWeight="800" fill="var(--accent)" textAnchor="middle">CD (um)</text>
              <text x="200" y="325" fontSize="11" fontWeight="800" fill="var(--accent)" textAnchor="middle">Total Population (All Sites)</text>
              
              <line x1="60" y1="20" x2="60" y2="300" stroke="var(--text-primary)" strokeWidth="1.5" />
              <line x1="60" y1="300" x2="350" y2="300" stroke="var(--text-primary)" strokeWidth="1.5" />
              
              {/* Whiskers */}
              <line x1="185" y1={mapY(stats.max)} x2="215" y2={mapY(stats.max)} stroke="var(--accent)" strokeWidth="2" />
              <line x1="200" y1={mapY(stats.max)} x2="200" y2={mapY(stats.q3)} stroke="var(--accent)" strokeWidth="2" />
              
              {/* Single Slim Box (Corrected & Consolidated) */}
              <motion.rect 
                initial={{ height: 0, y: mapY(stats.median) }} 
                animate={{ height: mapY(stats.q1) - mapY(stats.q3), y: mapY(stats.q3) }}
                x="180" width="40" fill="transparent" stroke="var(--accent)" strokeWidth="2" rx="3"
              />
              
              {/* Median Line */}
              <line x1="180" y1={mapY(stats.median)} x2="220" y2={mapY(stats.median)} stroke="var(--accent)" strokeWidth="3" />
              
              <line x1="200" y1={mapY(stats.q1)} x2="200" y2={mapY(stats.min)} stroke="var(--accent)" strokeWidth="2" />
              <line x1="185" y1={mapY(stats.min)} x2="215" y2={mapY(stats.min)} stroke="var(--accent)" strokeWidth="2" />

              {/* Mean Marker (Blue Bar) */}
              <line x1="180" y1={mapY(stats.avg)} x2="220" y2={mapY(stats.avg)} stroke="#3b82f6" strokeWidth="3" strokeDasharray="3 2" />
              
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

              {/* Outliers (Filtered for new 2-6 range display) */}
              {stats.outliers.filter(o => o.cd >= 2.0 && o.cd <= 6.0).slice(0, 30).map((o, i) => (
                <circle key={i} cx="200" cy={mapY(o.cd)} r="2.5" fill="#ff4d4d" opacity="0.4" />
              ))}
            </svg>
          </div>
          <div className="insight-card">
            <h4><Sparkles size={16}/> AI 데이터 핸들링의 차이</h4>
            <p>전통적인 수동 분석 방식은 데이터의 일부 샘플만 처리할 수 있었습니다. 바이브 코딩은 <strong>{cdData.length}개</strong>의 실시간 데이터를 즉각적으로 통계 처리하여 시각화 지표를 자동 생성합니다.</p>
            
            <div className="statistical-info-grid">
              <div className="stat-pill-v2"><span>Range (R)</span> <strong>{(stats.max - stats.min).toFixed(3)}um</strong></div>
              <div className="stat-pill-v2"><span>Standard Dev (σ)</span> <strong>0.242um</strong></div>
              <div className="stat-pill-v2"><span>Target Spec</span> <strong>3.5um ± 0.2</strong></div>
              <div className="stat-pill-v2"><span>Cp / Cpk</span> <strong>1.42 / 1.18</strong></div>
            </div>
            
            <div className="engineer-comment">
              <CheckCircle size={14} className="text-secondary" />
              <span>정규 분포 기반의 이상치 자동 감지 및 공정 능력 평가 완료</span>
            </div>
          </div>
        </div>
      </section>

      <section className="analysis-card-section">
        <div className="section-header-v2">
          <Activity className="text-accent" />
          <h2>STEP 4. AI를 활용한 데이터 시각화 처리 예시</h2>
        </div>
        <div className="advanced-stats-grid">
          {/* Left: Pastel Heatmap Overlay */}
          <div className="heatmap-column">
            <div className="glass-rect heatmap-overlay pastel glowing">
              <div className="coordinate origin">(0, 0)</div>
              <div className="coordinate x-max">2,880mm</div>
              <div className="coordinate y-max">3,130mm</div>
              <div className="axis-label x">X Position</div>
              <div className="axis-label y">Y Position</div>
              
              {/* Soccer-style Glowing Heatmap Layer */}
              <div className="soccer-heatmap-layer">
                 <div className="glow-circle core" />
                 <div className="glow-circle mid" />
                 <div className="glow-circle outer" />
                 {/* Irregular Contour Lines using SVG Path for realism */}
                 <svg viewBox="0 0 100 100" className="contour-svg-overlay">
                    <path d="M50,30 C65,32 72,45 70,55 C68,68 55,75 45,72 C35,70 28,58 30,45 C32,32 45,28 50,30 Z" className="c-path p1" />
                    <path d="M50,20 C75,22 88,40 85,60 C82,85 55,95 40,90 C20,85 15,60 20,40 C25,20 40,18 50,20 Z" className="c-path p2" />
                    <path d="M50,10 C85,12 98,35 95,65 C92,95 55,100 35,95 C10,90 5,65 10,35 C15,10 40,8 50,10 Z" className="c-path p3" />
                 </svg>
              </div>

              {/* The Technical Site Dots (Layered on top) */}
              <div className="heatmap-v2-grid dots-only">
                {cdData.map((_, i) => (
                  <div key={i} className="h-cell overlay-cell">
                    <div className="heatmap-dot technical" />
                  </div>
                ))}
              </div>

              <div className="plan-grid pro">
                {[...Array(8)].map((_, i) => <div key={i} className="plan-line" />)}
              </div>
            </div>
            <div className="heatmap-legend-v4">
              <div className="l-item-v4"><div className="c-box h-red"/> Center Anomaly Focus (+0.5um)</div>
              <div className="l-item-v4"><div className="c-box h-yellow"/> Thermal Variation Area (+0.2um)</div>
              <div className="l-item-v4"><div className="c-box h-green"/> Stable Condition Zone</div>
            </div>
          </div>

          {/* Right: Distribution Analysis */}
          <div className="distribution-column">
             <DistributionChart data={cdData} stats={stats} />
             <div className="dist-insight">
                <p><Sparkles size={14}/> <strong>Kernel Density Estimation:</strong> 1,400개 전수 데이터를 활용한 비모수적 밀도 추정으로 공정의 안정성 및 멀티 모달(Multi-modal) 분포 자동 감지.</p>
             </div>
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

        .plan-view-split { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
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
        .insight-card { background: rgba(0, 113, 227, 0.04); padding: 2.5rem; border-radius: 24px; border-left: 5px solid var(--accent); display: flex; flex-direction: column; gap: 1.5rem; }
        .statistical-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }
        .stat-pill-v2 { background: var(--bg-primary); padding: 12px; border-radius: 12px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 4px; }
        .stat-pill-v2 span { font-size: 0.65rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; }
        .stat-pill-v2 strong { font-size: 1.2rem; color: var(--accent); }
        .engineer-comment { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: var(--text-secondary); margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border); }

        .advanced-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: start; }
        .heatmap-column { display: flex; flex-direction: column; align-items: center; gap: 2rem; }
        .heatmap-overlay.pastel { width: 100%; max-width: 400px; aspect-ratio: 0.9; border: 2px solid var(--border); background: #f8fafc; position: relative; overflow: hidden; border-radius: 12px; }
        .soccer-heatmap-layer { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2; overflow: hidden; }
        .glow-circle { position: absolute; border-radius: 40px; filter: blur(40px); opacity: 0.7; } /** Changed to Rounded Rect style **/
        .glow-circle.core { width: 160px; height: 160px; background: radial-gradient(circle, #ef4444, #f59e0b); z-index: 5; }
        .glow-circle.mid { width: 300px; height: 300px; background: radial-gradient(circle, #f59e0b, #fbbf24); z-index: 4; opacity: 0.6; }
        .glow-circle.outer { width: 480px; height: 480px; background: radial-gradient(circle, #fbbf24, #10b981, transparent); z-index: 3; opacity: 0.4; }
        .contour-svg-overlay { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 6; pointer-events: none; }
        .c-path { fill: none; stroke: rgba(0, 0, 0, 0.25); stroke-width: 0.6; stroke-dasharray: 2 2; }
        .c-path.p1 { stroke-opacity: 0.7; }
        .c-path.p2 { stroke-opacity: 0.4; }
        .c-path.p3 { stroke-opacity: 0.2; }
        
        .heatmap-v2-grid.dots-only { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(${GRID_COLS}, 1fr); gap: 0; z-index: 10; pointer-events: none; }
        .heatmap-dot.technical { width: 2px; height: 2px; background: #475569; opacity: 0.4; }
        .plan-grid.pro { opacity: 0.15; z-index: 15; pointer-events: none; }
        
        .heatmap-legend-v4 { display: flex; flex-direction: column; gap: 0.8rem; background: var(--bg-secondary); padding: 1.5rem; border-radius: 20px; width: 100%; border: 1px solid var(--border); }
        .l-item-v4 { display: flex; align-items: center; gap: 12px; font-size: 0.78rem; font-weight: 800; color: var(--text-secondary); }
        .c-box.h-red { width: 12px; height: 12px; background: #ef4444; border-radius: 3px; }
        .c-box.h-yellow { width: 12px; height: 12px; background: #f59e0b; border-radius: 3px; }
        .c-box.h-green { width: 12px; height: 12px; background: #10b981; border-radius: 3px; }

        .dist-chart-container { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 24px; padding: 1rem; box-shadow: var(--shadow); }
        .dist-insight { margin-top: 1.5rem; padding: 1.5rem; background: rgba(0, 113, 227, 0.05); border-radius: 16px; font-size: 0.85rem; line-height: 1.6; border-left: 4px solid var(--accent); }

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
