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

// --- 3D Topology Component ---
const SurfaceTopography3D = ({ data }: { data: CDData[] }) => {
  const [rotation, setRotation] = useState({ x: 60, y: 0, z: 45 });
  
  // Projection logic
  const project = (x: number, y: number, z: number) => {
    const radX = (rotation.x * Math.PI) / 180;
    const radZ = (rotation.z * Math.PI) / 180;
    
    // Simple Isometric-ish projection
    const px = (x - y) * Math.cos(radZ);
    const py = (x + y) * Math.sin(radZ) * Math.cos(radX) - z * Math.sin(radX);
    return { x: px, y: py };
  };

  const meshRows = 15; // Downsampled for performance/visuals
  const meshCols = 15;
  
  const meshPaths = useMemo(() => {
    const paths = [];
    const stepR = Math.floor(GRID_ROWS / meshRows);
    const stepC = Math.floor(GRID_COLS / meshCols);

    for (let r = 0; r < meshRows - 1; r++) {
      for (let c = 0; c < meshCols - 1; c++) {
        const d1 = data[(r * stepR) * GRID_COLS + (c * stepC)];
        const d2 = data[(r * stepR) * GRID_COLS + ((c + 1) * stepC)];
        const d3 = data[((r + 1) * stepR) * GRID_COLS + ((c + 1) * stepC)];
        const d4 = data[((r + 1) * stepR) * GRID_COLS + (c * stepC)];

        if (!d1 || !d2 || !d3 || !d4) continue;

        const scale = 8;
        const hScale = 40;
        const p1 = project(c * scale, r * scale, d1.deviation * hScale);
        const p2 = project((c + 1) * scale, r * scale, d2.deviation * hScale);
        const p3 = project((c + 1) * scale, (r + 1) * scale, d3.deviation * hScale);
        const p4 = project(c * scale, (r + 1) * scale, d4.deviation * hScale);

        const color = d1.deviation > 0.6 ? "rgba(239, 68, 68, 0.4)" : "rgba(59, 130, 246, 0.2)";
        const stroke = d1.deviation > 0.6 ? "#ef4444" : "rgba(59, 130, 246, 0.5)";

        paths.push(
          <path 
            key={`${r}-${c}`}
            d={`M${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y} L${p4.x},${p4.y} Z`}
            fill={color}
            stroke={stroke}
            strokeWidth="0.5"
          />
        );
      }
    }
    return paths;
  }, [data, rotation]);

  return (
    <div 
      className="topo-3d-card"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 40;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
        setRotation(prev => ({ ...prev, z: 45 + x, x: 60 + y }));
      }}
    >
      <div className="topo-header">
         <h4><Cpu size={16}/> AI Digital Twin: 3D Topographical Analysis</h4>
         <p>Interactive Mesh: Mouse move to tilt/rotate</p>
      </div>
      <div className="topo-canvas">
        <svg viewBox="-150 -100 300 250" className="topo-svg">
          <g transform="translate(0, 50)">
            {/* Base Plate */}
            <rect x="-80" y="-20" width="160" height="120" fill="var(--bg-secondary)" opacity="0.1" transform="skewX(-20)" />
            {meshPaths}
          </g>
        </svg>
      </div>
      <div className="topo-footer">
        <span>Height = Process Deviation</span>
        <div className="pulse-dot red" /> <span>Detection Active</span>
      </div>
    </div>
  );
};

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
            
            {/* Mean Line (Orange Bar as requested) */}
            <line x1={mapX(stats.avg)} y1="-15" x2={mapX(stats.avg)} y2="15" stroke="#f97316" strokeWidth="3" strokeDasharray="2 1" />
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

              {/* Mean Marker (Orange Bar) */}
              <line x1="180" y1={mapY(stats.avg)} x2="220" y2={mapY(stats.avg)} stroke="#f97316" strokeWidth="3" strokeDasharray="3 2" />
              
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
                 {/* 7 Realistic Organic Isolines (Solid 0.5px) */}
                 <svg viewBox="0 0 100 100" className="contour-svg-overlay">
                    <path d="M50,15 C80,17 93,38 91,62 C89,88 55,94 38,90 C18,85 12,62 16,38 C20,15 35,12 50,15 Z" className="c-path r1" />
                    <path d="M50,22 C75,24 85,42 83,62 C81,82 55,87 42,84 C25,80 20,62 23,42 C26,22 38,20 50,22 Z" className="c-path r2" />
                    <path d="M50,30 C68,32 75,45 73,60 C71,75 55,80 46,77 C35,74 28,62 30,47 C32,32 42,28 50,30 Z" className="c-path r3" />
                    <path d="M50,38 C62,39 68,48 66,58 C64,68 55,72 49,70 C42,68 36,60 38,50 C40,40 45,37 50,38 Z" className="c-path r4" />
                    <path d="M52,44 C60,45 63,52 61,58 C59,64 53,66 48,64 C43,62 42,56 45,50 C48,44 50,43 52,44 Z" className="c-path r5" />
                    <path d="M51,48 C54,49 56,52 55,56 C54,59 50,60 47,58 C44,56 45,52 48,49 C50,47 50,48 51,48 Z" className="c-path r6" />
                    <path d="M50,51 C52,51 53,52 52,54 C51,55 49,55 48,54 C47,53 48,52 49,51 C50,50 50,51 50,51 Z" className="c-path r7" />
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
              <div className="l-item-v4"><div className="c-box h-deepred"/> +0.8um (High Center)</div>
              <div className="l-item-v4"><div className="c-box h-yellow"/> +0.3um (Mid Ring)</div>
              <div className="l-item-v4"><div className="c-box h-blue"/> -0.2um (Outer Edge)</div>
              <div className="l-item-v4"><div className="c-box h-darkpurple"/> Min Limit Zone</div>
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

        {/* New 3rd Visualization Row: The WOW Factor */}
        <div className="wow-visualization-row">
           <SurfaceTopography3D data={cdData} />
           <div className="it-insight-card">
              <div className="insight-header"><Zap size={20}/> Why AI Visualization?</div>
              <div className="insight-body">
                <p>전통적인 방식은 데이터를 '숫자'로만 인식하지만, AI 모델은 데이터를 **'공간적 실체'**로 재구성합니다. </p>
                <ul className="ai-feature-list">
                  <li><strong>Spatial Anomaly Mapping:</strong> 3D 공간 상의 편곡점(Inflection points) 실시간 감지</li>
                  <li><strong>Correlation Rendering:</strong> 변수 간의 입체적 상관계수 시각화</li>
                  <li><strong>Predictive Topography:</strong> 현재 추세 기반의 미래 시점 변형 예측</li>
                </ul>
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
        .glow-circle.core { width: 160px; height: 160px; background: radial-gradient(circle, #7f1d1d, #ef4444, #f59e0b); z-index: 5; }
        .glow-circle.mid { width: 300px; height: 300px; background: radial-gradient(circle, #f59e0b, #eab308, #84cc16, #10b981); z-index: 4; opacity: 0.6; }
        .glow-circle.outer { width: 500px; height: 500px; background: radial-gradient(circle, #06b6d4, #3b82f6, #6366f1, #312e81, transparent); z-index: 3; opacity: 0.5; }
        .contour-svg-overlay { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 6; pointer-events: none; }
        .c-path { fill: none; stroke: rgba(255, 255, 255, 0.2); stroke-width: 0.5; stroke-dasharray: none; }
        .c-path.r1 { stroke-opacity: 0.4; stroke-width: 0.8; }
        .c-path.r2 { stroke-opacity: 0.3; }
        .c-path.r3 { stroke-opacity: 0.4; }
        .c-path.r4 { stroke-opacity: 0.5; }
        .c-path.r5 { stroke-opacity: 0.6; }
        .c-path.r6 { stroke-opacity: 0.7; }
        .c-path.r7 { stroke-opacity: 0.8; }
        
        .heatmap-v2-grid.dots-only { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(${GRID_COLS}, 1fr); gap: 0; z-index: 10; pointer-events: none; }
        .heatmap-dot.technical { width: 2px; height: 2px; background: #475569; opacity: 0.4; }
        .plan-grid.pro { opacity: 0.15; z-index: 15; pointer-events: none; }
        
        .heatmap-legend-v4 { display: flex; flex-direction: column; gap: 0.8rem; background: var(--bg-secondary); padding: 1.5rem; border-radius: 20px; width: 100%; border: 1px solid var(--border); }
        .l-item-v4 { display: flex; align-items: center; gap: 12px; font-size: 0.78rem; font-weight: 800; color: var(--text-secondary); }
        .c-box.h-deepred { width: 12px; height: 12px; background: #7f1d1d; border-radius: 3px; }
        .c-box.h-yellow { width: 12px; height: 12px; background: #eab308; border-radius: 3px; }
        .c-box.h-blue { width: 12px; height: 12px; background: #3b82f6; border-radius: 3px; }
        .c-box.h-darkpurple { width: 12px; height: 12px; background: #312e81; border-radius: 3px; }

        .dist-chart-container { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 24px; padding: 1rem; box-shadow: var(--shadow); }
        .dist-insight { margin-top: 1.5rem; padding: 1.5rem; background: rgba(0, 113, 227, 0.05); border-radius: 16px; font-size: 0.85rem; line-height: 1.6; border-left: 4px solid var(--accent); }

        .wow-visualization-row { margin-top: 3rem; display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem; align-items: stretch; }
        .topo-3d-card { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 28px; padding: 2rem; display: flex; flex-direction: column; cursor: crosshair; transition: transform 0.3s ease; box-shadow: var(--shadow); overflow: hidden; position: relative; }
        .topo-3d-card:hover { border-color: var(--accent); }
        .topo-header h4 { color: var(--accent); margin-bottom: 4px; }
        .topo-header p { font-size: 0.75rem; opacity: 0.6; }
        .topo-canvas { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 350px; }
        .topo-svg { width: 100%; height: 100%; filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.2)); }
        .topo-footer { padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        .pulse-dot.red { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }

        .it-insight-card { background: var(--accent-gradient); color: white; border-radius: 28px; padding: 3rem; display: flex; flex-direction: column; gap: 2rem; box-shadow: 0 20px 40px rgba(0, 113, 227, 0.2); }
        .insight-header { display: flex; align-items: center; gap: 12px; font-size: 1.4rem; font-weight: 900; }
        .insight-body p { font-size: 1rem; line-height: 1.8; opacity: 0.9; }
        .ai-feature-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
        .ai-feature-list li { background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 12px; font-size: 0.85rem; border: 1px solid rgba(255, 255, 255, 0.2); }
        .ai-feature-list strong { color: #fcd34d; font-weight: 900; }

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
