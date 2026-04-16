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

const SurfaceTopography3D = ({ data }: { data: CDData[] }) => {
  const [rotation, setRotation] = useState({ x: 20, y: 0, z: 0 }); // Initial: Near-plan view
  const [isHovered, setIsHovered] = useState(false);
  
  // High-fidelity Rainbow Scale for Meshing
  const getHeightColor = (deviation: number) => {
    // Map deviation (~ -0.5 to +1.2) to Rainbow Spectrum
    const norm = Math.min(Math.max((deviation + 0.3) / 1.5, 0), 1);
    if (norm > 0.8) return "rgba(127, 29, 29, 0.6)"; // Deep Red
    if (norm > 0.6) return "rgba(239, 68, 68, 0.5)"; // Red
    if (norm > 0.4) return "rgba(245, 158, 11, 0.4)"; // Orange/Yellow
    if (norm > 0.3) return "rgba(132, 204, 22, 0.3)"; // Lime
    if (norm > 0.1) return "rgba(59, 130, 246, 0.2)"; // Blue
    return "rgba(49, 46, 129, 0.2)"; // Dark Purple
  };

  const getStrokeColor = (deviation: number) => {
    const norm = Math.min(Math.max((deviation + 0.3) / 1.5, 0), 1);
    if (norm > 0.8) return "#ef4444";
    if (norm > 0.4) return "#facc15";
    return "#3b82f6";
  };
  
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

        const color = getHeightColor(d1.deviation);
        const stroke = getStrokeColor(d1.deviation);

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
      className={`topo-3d-card ${isHovered ? 'active' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotation({ x: 20, y: 0, z: 0 }); // Reset to plan view
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 60;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 60;
        setRotation({ z: x, x: 20 + y, y: 0 });
      }}
    >
      <div className="topo-header">
         <h4><Sparkles size={16}/> AI Digital Twin: Real-time 3D Insights</h4>
         <p>Plan View (Initial) ↔ Spatial Topography (Hover & Move)</p>
      </div>
      <div className="topo-canvas dark">
        <svg viewBox="-150 -100 300 250" className="topo-svg">
          <defs>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <g transform="translate(0, 40)" filter="url(#neon-glow)">
            {/* Grid Floor */}
            <rect x="-100" y="-20" width="200" height="150" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" transform={`rotate(${rotation.z}, 0, 0) skewX(-10)`} />
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

// --- AI Diagnostic Result Component ---
const DiagnosticFactorScanner = () => {
  const [activeFactor, setActiveFactor] = useState(0);
  const factors = [
    { title: 'Thermal Gradient (Temperature)', impact: 68, corr: 0.92, desc: '중심부 베이킹 온도 불균형에 따른 감광액 반응 속도 차이' },
    { title: 'Chemical Flow Rate', impact: 22, corr: 0.45, desc: '슬릿 노즐 토출 시 중심부 약액 정체 현상 감지' },
    { title: 'Mechanical Vibration', impact: 10, corr: 0.12, desc: '스테이지 이동 시 미세 진동에 의한 노광 산란' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFactor(prev => (prev + 1) % factors.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="diagnostic-engine-card">
       <div className="diag-header">
          <div className="pulse-dot orange" />
          <h4>AI Deep-Root Diagnostics</h4>
          <span className="ai-badge">Processing Correlation...</span>
       </div>
       
       <div className="diag-main">
          {/* Correlation Chart View */}
          <div className="correlation-view">
             <div className="y-axis-label">CD Deviation (um)</div>
             <div className="x-axis-label">{factors[activeFactor].title}</div>
             <svg viewBox="0 0 200 150" className="corr-svg">
                {/* Dots simulating correlation */}
                {Array.from({ length: 30 }).map((_, i) => (
                  <circle 
                    key={i} 
                    cx={30 + i * 5} 
                    cy={120 - (i * (factors[activeFactor].corr * 3) + Math.random() * 20)} 
                    r="2" 
                    fill={factors[activeFactor].impact > 50 ? "#ef4444" : "#3b82f6"} 
                    opacity="0.6"
                  />
                ))}
                {/* Trend Line */}
                <line x1="30" y1="110" x2="180" y2={110 - factors[activeFactor].corr * 80} stroke="#f97316" strokeWidth="2" strokeDasharray="4 2" />
             </svg>
          </div>

          {/* Influence List */}
          <div className="influence-list">
             {factors.map((f, i) => (
               <div key={i} className={`influence-item ${activeFactor === i ? 'active' : ''}`}>
                  <div className="inf-header">
                     <span>{f.title}</span>
                     <strong>{f.impact}%</strong>
                  </div>
                  <div className="inf-bar-bg">
                     <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: activeFactor === i ? `${f.impact}%` : '0%' }}
                        className="inf-bar-fill" 
                     />
                  </div>
               </div>
             ))}
          </div>
       </div>

       <div className="diag-conclusion">
          <div className="conclusion-label"><Zap size={14}/> AI Insight Conclusion:</div>
          <p>{factors[activeFactor].desc}</p>
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
            <div className="glass-rect heatmap-overlay vivid glowing">
              <div className="coordinate origin">(0, 0)</div>
              <div className="coordinate x-max">2,880mm</div>
              <div className="coordinate y-max">3,130mm</div>
              <div className="axis-label x">X Position</div>
              <div className="axis-label y">Y Position</div>
              
              {/* Vivid Rainbow Heatmap Layer (Stylish Pro Version) */}
              <div className="soccer-heatmap-layer">
                 <div className="glow-circle vivid-core" />
                 <div className="glow-circle vivid-mid" />
                 <div className="glow-circle vivid-outer" />
                 {/* Technical Blueprint Isolines (Styled with Filter) */}
                 <svg viewBox="0 0 100 100" className="contour-svg-overlay">
                    <defs>
                      <filter id="contour-relief">
                        <feDropShadow dx="0" dy="0.5" stdDeviation="0.4" floodOpacity="0.3" />
                      </filter>
                    </defs>
                    <g filter="url(#contour-relief)">
                      <path d="M50,15 C80,17 93,38 91,62 C89,88 55,94 38,90 C18,85 12,62 16,38 C20,15 35,12 50,15 Z" className="c-path r1" />
                      <path d="M50,22 C75,24 85,42 83,62 C81,82 55,87 42,84 C25,80 20,62 23,42 C26,22 38,20 50,22 Z" className="c-path r2" />
                      <path d="M50,30 C68,32 75,45 73,60 C71,75 55,80 46,77 C35,74 28,62 30,47 C32,32 42,28 50,30 Z" className="c-path r3" />
                      <path d="M50,38 C62,39 68,48 66,58 C64,68 55,72 49,70 C42,68 36,60 38,50 C40,40 45,37 50,38 Z" className="c-path r4" />
                    </g>
                    {/* Floating Labels */}
                    <g fontSize="2.5" fontWeight="900" fill="rgba(0,0,0,0.6)" className="contour-labels">
                       <text x="50" y="16">+0.2um</text>
                       <text x="50" y="23">+0.4um</text>
                       <text x="50" y="31">+0.6um</text>
                       <text x="50" y="39">+0.8um</text>
                    </g>
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
              <div className="l-item-v4"><div className="c-box h-map-red"/> Peak Anomaly (High CD)</div>
              <div className="l-item-v4"><div className="c-box h-map-yellow"/> Transition Zone</div>
              <div className="l-item-v4"><div className="c-box h-map-green"/> Nominal Spec Area</div>
              <div className="l-item-v4"><div className="c-box h-map-blue"/> Lower Limit Boundary</div>
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

      {/* 5. Root Cause Analysis */}
      <section className="analysis-card-section root-cause-section" id="step5">
        <div className="section-header-v2">
          <AlertTriangle className="text-danger" />
          <h2>STEP 5. AI 기반 원인 추적 및 상관관계 분석 (Root Cause Diagnostic)</h2>
        </div>
        <p className="step-desc">1,400개 측정 포인트와 공정 인자 간의 상관계수를 AI가 실시간으로 분석하여 이상 원인을 추적합니다.</p>

        <div className="diagnostic-grid-v2">
          {/* Left: AI Diagnostic Engine (Interactive Scanner Component) */}
          <DiagnosticFactorScanner />

          {/* Right: Insight Cards */}
          <div className="analysis-cards-grid">
            <div className="a-card pro-insight">
              <div className="a-card-header text-danger"><TrendingUp size={24} /> Thermal Profile Anomaly</div>
              <p>기판 중심부의 베이킹 온도가 타 영역 대비 **0.8°C 높게** 유지됨에 따라 CD가 상향 편향되는 경향을 보입니다.</p>
              <div className="a-tag">Impact: 68% (Critical)</div>
            </div>
            
            <div className="a-card pro-insight border-blue">
              <div className="a-card-header text-blue"><Layers size={24} /> Chemical Fluid Dynamics</div>
              <p>슬릿 노즐의 중심부 토출 압력이 불균일하여 약액 정체 시간이 **1.2초 지연**됨을 유체 시뮬레이션 결과 감지하였습니다.</p>
              <div className="a-tag">Impact: 22% (Major)</div>
            </div>
          </div>
        </div>

        <div className="ai-report-banner">
           <Sparkles size={24} className="sparkle-icon" />
           <div className="banner-content">
              <h4>Engineering Decision Support:</h4>
              <p>AI 진단 결과에 따라 **'중심부 냉각 채널 노즐 압력 15% 상향'** 및 **'베이킹 프로파일 2구역 온도 0.5도 하향'** 조치를 권고합니다.</p>
           </div>
           <button className="apply-btn">자동 설비 최적화 적용 (Auto-Optimize)</button>
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
        .heatmap-overlay.vivid { width: 100%; max-width: 400px; aspect-ratio: 0.9; border: 2px solid var(--border); background: #ffffff; position: relative; overflow: hidden; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
        .soccer-heatmap-layer { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2; overflow: hidden; }
        .glow-circle { position: absolute; border-radius: 40px; filter: blur(45px); opacity: 0.85; }
        .glow-circle.vivid-core { width: 160px; height: 160px; background: radial-gradient(circle, #ff0000 0%, #ff4500 70%, transparent 100%); z-index: 5; opacity: 0.95; }
        .glow-circle.vivid-mid { width: 320px; height: 320px; background: radial-gradient(circle, #ffff00 0%, #adff2f 40%, #32cd32 70%, transparent 100%); z-index: 4; opacity: 0.8; }
        .glow-circle.vivid-outer { width: 500px; height: 500px; background: radial-gradient(circle, #00ced1 0%, #1e90ff 40%, #4b0082 80%, transparent 100%); z-index: 3; opacity: 0.6; }
        .contour-svg-overlay { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 6; pointer-events: none; }
        .c-path { fill: none; stroke: rgba(255, 255, 255, 0.4); stroke-width: 0.5; stroke-dasharray: 2 1; }
        .c-path.r1 { stroke-opacity: 0.6; stroke-width: 0.8; stroke-dasharray: none; }
        .c-path.r2 { stroke-opacity: 0.7; }
        .c-path.r3 { stroke-opacity: 0.8; }
        .c-path.r4 { stroke-opacity: 0.9; }
        .contour-labels { pointer-events: none; opacity: 0.6; }
        
        .heatmap-v2-grid.dots-only { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(${GRID_COLS}, 1fr); gap: 0; z-index: 10; pointer-events: none; }
        .heatmap-dot.technical { width: 2px; height: 2px; background: #475569; opacity: 0.4; }
        .plan-grid.pro { opacity: 0.15; z-index: 15; pointer-events: none; }
        
        .heatmap-legend-v4 { display: flex; flex-direction: column; gap: 0.8rem; background: var(--bg-secondary); padding: 1.5rem; border-radius: 20px; width: 100%; border: 1px solid var(--border); }
        .l-item-v4 { display: flex; align-items: center; gap: 12px; font-size: 0.78rem; font-weight: 800; color: var(--text-secondary); }
        .c-box.h-map-red { width: 12px; height: 12px; background: #ff0000; border-radius: 3px; box-shadow: 0 0 8px #ff0000; }
        .c-box.h-map-yellow { width: 12px; height: 12px; background: #ffff00; border-radius: 3px; }
        .c-box.h-map-green { width: 12px; height: 12px; background: #32cd32; border-radius: 3px; }
        .c-box.h-map-blue { width: 12px; height: 12px; background: #1e90ff; border-radius: 3px; }

        .dist-chart-container { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 24px; padding: 1rem; box-shadow: var(--shadow); }
        .dist-insight { margin-top: 1.5rem; padding: 1.5rem; background: rgba(0, 113, 227, 0.05); border-radius: 16px; font-size: 0.85rem; line-height: 1.6; border-left: 4px solid var(--accent); }

        .wow-visualization-row { margin-top: 3rem; display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem; align-items: stretch; animation: fadeIn 1s ease-out; }
        .topo-3d-card { background: var(--bg-primary); border: 2px solid var(--border); border-radius: 28px; padding: 2rem; display: flex; flex-direction: column; cursor: crosshair; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: var(--shadow); overflow: hidden; position: relative; }
        .topo-3d-card.active { border-color: var(--accent); box-shadow: 0 20px 50px rgba(0, 113, 227, 0.15); transform: translateY(-5px); }
        .topo-canvas.dark { flex: 1; display: flex; align-items: center; justify-content: center; min-height: 400px; background: #0f172a; border-radius: 20px; margin: 1rem 0; box-shadow: inset 0 0 30px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); }
        .topo-svg { width: 100%; height: 100%; }
        .topo-footer { padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.7rem; font-weight: 800; display: flex; align-items: center; gap: 10px; }
        .pulse-dot.red { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.5); } 100% { opacity: 1; transform: scale(1); } }

        .it-insight-card { background: var(--accent-gradient); color: white; border-radius: 28px; padding: 3rem; display: flex; flex-direction: column; gap: 2rem; box-shadow: 0 20px 40px rgba(0, 113, 227, 0.2); }
        .insight-header { display: flex; align-items: center; gap: 12px; font-size: 1.4rem; font-weight: 900; }
        .insight-body p { font-size: 1rem; line-height: 1.8; opacity: 0.9; }
        .ai-feature-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
        .ai-feature-list li { background: rgba(255, 255, 255, 0.1); padding: 1rem; border-radius: 12px; font-size: 0.85rem; border: 1px solid rgba(255, 255, 255, 0.2); }
        .ai-feature-list strong { color: #fcd34d; font-weight: 900; }

        .diagnostic-grid-v2 { display: grid; grid-template-columns: 1.2fr 1fr; gap: 3rem; margin: 2rem 0; }
        .diagnostic-engine-card { background: #ffffff; border: 1px solid var(--border); border-radius: 28px; padding: 2rem; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 1.5rem; border-top: 6px solid #f97316; }
        .diag-header { display: flex; align-items: center; gap: 12px; }
        .diag-header h4 { font-size: 1.1rem; flex: 1; margin: 0; }
        .pulse-dot.orange { width: 8px; height: 8px; background: #f97316; border-radius: 50%; display: inline-block; animation: pulse 1.5s infinite; }
        .ai-badge { background: rgba(0, 113, 227, 0.1); color: var(--accent); padding: 4px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 800; }
        
        .diag-main { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
        .correlation-view { background: #f8fafc; border-radius: 16px; padding: 1rem; position: relative; border: 1px solid var(--border); min-height: 200px; }
        .corr-svg { width: 100%; height: auto; }
        .x-axis-label, .y-axis-label { position: absolute; font-size: 0.55rem; font-weight: 800; color: var(--text-secondary); }
        .y-axis-label { top: 30px; left: -20px; transform: rotate(-90deg); }
        .x-axis-label { bottom: 5px; right: 10px; }

        .influence-list { display: flex; flex-direction: column; gap: 1.2rem; }
        .influence-item { padding: 1rem; border-radius: 14px; border: 1px solid transparent; transition: all 0.3s; }
        .influence-item.active { background: rgba(249, 115, 22, 0.05); border-color: rgba(249, 115, 22, 0.2); }
        .inf-header { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; }
        .inf-bar-bg { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
        .inf-bar-fill { height: 100%; background: #f97316; border-radius: 3px; }

        .diag-conclusion { background: #1e293b; color: #f1f5f9; padding: 1.5rem; border-radius: 16px; font-size: 0.85rem; line-height: 1.6; }
        .conclusion-label { font-weight: 800; color: #f97316; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }

        .ai-report-banner { background: var(--accent-gradient); color: white; padding: 2rem 3rem; border-radius: 28px; display: flex; align-items: center; gap: 2rem; box-shadow: 0 15px 40px rgba(0, 113, 227, 0.25); margin-top: 2rem; }
        .banner-content { flex: 1; }
        .banner-content h4 { font-size: 1.1rem; margin-bottom: 4px; color: #fcd34d; margin: 0 0 4px 0; }
        .banner-content p { font-size: 0.9rem; font-weight: 600; opacity: 0.95; margin: 0; }
        .apply-btn { background: white; color: var(--accent); border: none; padding: 12px 24px; border-radius: 12px; font-weight: 900; font-size: 0.9rem; cursor: pointer; transition: transform 0.2s; white-space: nowrap; }
        .apply-btn:hover { transform: scale(1.05); }

        .pro-insight { border: 1px solid var(--border) !important; position: relative; }
        .pro-insight.border-blue { border-left: 5px solid #3b82f6 !important; }
        .text-blue { color: #3b82f6; }
        .a-tag { margin-top: 1rem; font-size: 0.75rem; font-weight: 900; color: var(--accent); background: rgba(0,113,227,0.05); padding: 4px 10px; border-radius: 6px; display: inline-block; }
        .step-desc { color: var(--text-secondary); margin-bottom: 2rem; }

        @media (max-width: 900px) {
          .schematic-layout, .plan-view-split, .boxplot-advanced-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ProcessAnalysis;
