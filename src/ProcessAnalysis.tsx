import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Zap, Search, Activity, Cpu, Settings, AlertTriangle, BarChart3, LayoutGrid, Sparkles, CheckCircle, TrendingUp } from 'lucide-react';

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
      <h4><LayoutGrid size={14} /> 10.5G Substrate (2,880 x 3,130mm)</h4>
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
        <h4><Sparkles size={16} /> AI Digital Twin: Real-time 3D Insights</h4>
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

// --- Industrial Heatmap Component (Step 4) ---
const IndustrialHeatmap = ({ data }: { data: CDData[] }) => {
  const getColor = (cd: number) => {
    // Normalizing CD for the specific palette in the reference image
    // TARGET_CD is 3.5. We map the range [3.3, 4.8] to colors.
    const val = (cd - 3.3) / 1.5;
    const n = Math.max(0, Math.min(1, val));

    if (n < 0.15) return '#102a71'; // Deep Blue (Background)
    if (n < 0.3) return '#1e40af';  // Blue
    if (n < 0.45) return '#0ea5e9'; // Cyan
    if (n < 0.6) return '#22c55e';  // Green
    if (n < 0.75) return '#eab308'; // Yellow
    if (n < 0.9) return '#ef4444';  // Red
    return '#ffffff';               // Peak (White)
  };

  return (
    <div className="industrial-monitor-wrapper">
      <div className="monitor-frame">
        <div className="monitor-inner-glow" />
        
        {/* Header Metadata */}
        <div className="monitor-header">
          <div className="monitor-title">
            OLED SUBSTRATE - DEFECT ANALYSIS [REV. 12C]
          </div>
          <div className="monitor-icons">
            <div className="monitor-token" />
            <div className="monitor-token" />
            <div className="monitor-token circle" />
          </div>
        </div>

        <div className="monitor-content">
          {/* Heatmap Grid */}
          <div className="industrial-heatmap-grid">
            {data.map((d, i) => (
              <div 
                key={i} 
                className="heatmap-pixel"
                style={{ backgroundColor: getColor(d.cd) }}
              />
            ))}
          </div>

          {/* Grid Lines Overlay */}
          <div className="monitor-grid-overlay">
            {[...Array(5)].map((_, i) => <div key={`v-${i}`} className="grid-line vertical" style={{ left: `${i * 25}%` }} />)}
            {[...Array(5)].map((_, i) => <div key={`h-${i}`} className="grid-line horizontal" style={{ top: `${i * 25}%` }} />)}
          </div>

          {/* Axis Labels */}
          <div className="monitor-labels labels-x">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400</span>
          </div>

          <div className="monitor-labels labels-y-left">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>100</span>
            <span>0</span>
          </div>

          <div className="monitor-labels labels-y-right">
            <span>420</span>
            <span>310</span>
            <span>200</span>
            <span>100</span>
            <span>0</span>
          </div>
        </div>
      </div>
      
      <div className="monitor-decoration">
        <div className="scan-line" />
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
        <div className="conclusion-label"><Zap size={14} /> AI Insight Conclusion:</div>
        <p>{factors[activeFactor].desc}</p>
      </div>
    </div>
  );
};

// --- Hyper-Dense Sankey Diagram (AI Traceability Mesh) ---
const SankeyProcessFlow = () => {
  const col1 = ['Exposure', 'Coating', 'Dev', 'Etch'];
  const col2 = Array.from({ length: 25 }, (_, i) => `P-${i + 100}`);
  const col3 = ['Temp Layer #3', 'P-L1', 'Slit #1', 'Vibe', 'Heat'];

  const renderLinks = () => {
    const links: any[] = [];

    // Layer 1 -> 2 (Dense Mesh)
    col1.forEach((_, i) => {
      col2.forEach((_, j) => {
        const isRoot = (i === 0 && j === 4); // Example root start
        links.push(
          <path
            key={`l1-${i}-${j}`}
            d={`M 70,${35 + i * 30} C 120,${35 + i * 30} 120,${15 + j * 6} 170,${15 + j * 6}`}
            fill="none"
            stroke={isRoot ? "#f97316" : "var(--sankey-link)"}
            strokeWidth={isRoot ? "2" : "0.3"}
            opacity={isRoot ? 1 : 0.4}
            filter={isRoot ? "url(#orange-glow)" : "none"}
          />
        );
      });
    });

    // Layer 2 -> 3 (Converging to Filters)
    col2.forEach((_, i) => {
      const targetIdx = Math.floor(i / 5);
      const isRoot = (i === 4 && targetIdx === 0);
      links.push(
        <path
          key={`l2-${i}`}
          d={`M 230,${15 + i * 6} C 280,${15 + i * 6} 280,${35 + targetIdx * 25} 330,${35 + targetIdx * 25}`}
          fill="none"
          stroke={isRoot ? "#f97316" : "var(--sankey-link)"}
          strokeWidth={isRoot ? "3" : "0.4"}
          opacity={isRoot ? 1 : 0.5}
          filter={isRoot ? "url(#orange-glow)" : "none"}
        />
      );
    });

    // Layer 3 -> 4 (Final Conclusion)
    col3.forEach((_, i) => {
      const isRoot = (i === 0);
      links.push(
        <path
          key={`l3-${i}`}
          d={`M 390,${35 + i * 25} C 440,${35 + i * 25} 440,80 500,80`}
          fill="none"
          stroke={isRoot ? "#f97316" : "var(--sankey-link)"}
          strokeWidth={isRoot ? "4" : "0.5"}
          opacity={isRoot ? 1 : 0.6}
          filter={isRoot ? "url(#orange-glow)" : "none"}
        />
      );
    });

    return links;
  };

  return (
    <div className="sankey-card">
      <div className="sankey-header">
        <div className="sh-left">
          <h4><Zap size={18} /> AI Multi-Dimensional Traceability Mesh</h4>
          <p>Cross-analyzing 500+ correlations: Isolating the 'Center Anomaly' logic thread</p>
        </div>
        <div className="sh-status">Status: Deep-Scan Ready</div>
      </div>
      <div className="sankey-canvas-box">
        <svg viewBox="0 0 600 180" className="sankey-svg">
          <defs>
            <filter id="orange-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {renderLinks()}

          {/* Column 1: Stages */}
          <g transform="translate(60, 0)">
            <text x="10" y="10" textAnchor="middle" fontSize="9" fontWeight="900" fill="var(--accent)" opacity="0.8">Process Stages</text>
            {col1.map((item, i) => (
              <g key={i} transform={`translate(0, ${35 + i * 30})`}>
                <rect x="-40" y="-12" width="70" height="24" rx="6" fill="#f8fafc" stroke="var(--border)" strokeWidth="1.5" />
                <text y="4" textAnchor="middle" fontSize="7" fontWeight="900" fill="#334155">{item}</text>
              </g>
            ))}
          </g>

          {/* Column 2: Parameters (Small Dots) */}
          <g transform="translate(200, 0)">
            <text x="0" y="10" textAnchor="middle" fontSize="9" fontWeight="900" fill="var(--accent)" opacity="0.8">500+ Parameter Nodes</text>
            {col2.map((_, i) => (
              <circle key={i} cx="0" cy={15 + i * 6} r="2" fill={i === 4 ? "#f97316" : "var(--border)"} filter={i === 4 ? "url(#orange-glow)" : "none"} />
            ))}
          </g>

          {/* Column 3: AI Filters */}
          <g transform="translate(360, 0)">
            <text x="0" y="10" textAnchor="middle" fontSize="9" fontWeight="900" fill="var(--accent)" opacity="0.8">AI Selected Factors</text>
            {col3.map((item, i) => (
              <g key={i} transform={`translate(0, ${35 + i * 25})`}>
                <rect x="-35" y="-10" width="70" height="20" rx="4" fill="var(--bg-primary)" stroke={i === 0 ? "#f97316" : "var(--border)"} strokeWidth={i === 0 ? 2 : 1} />
                <text y="3" textAnchor="middle" fontSize="6.5" fontWeight="800" fill={i === 0 ? "#f97316" : "var(--text-secondary)"}>{item}</text>
              </g>
            ))}
          </g>

          {/* Column 4: Outcome */}
          <g transform="translate(530, 0)">
            <text x="0" y="10" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ef4444" opacity="0.8">Final Decision</text>
            <g transform="translate(0, 80)">
              <rect x="-35" y="-15" width="70" height="30" rx="6" fill="#1e293b" />
              <text y="5" textAnchor="middle" fontSize="7" fontWeight="900" fill="white">Center CD Anomaly</text>
            </g>
          </g>
        </svg>
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
            <line x1={mapX(v)} y1={padding} x2={mapX(v)} y2={height - padding} stroke="var(--border)" strokeDasharray="3 2" />
            <text x={mapX(v)} y={height - padding + 20} fontSize="10" textAnchor="middle" fill="var(--text-secondary)">{v}um</text>
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
        <g transform={`translate(0, ${height / 2})`}>
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

        <text x={width / 2} y="30" fontSize="12" fontWeight="900" textAnchor="middle" fill="var(--text-primary)">CD Distribution & Density Analysis</text>
      </svg>
    </div>
  );
};

const ProcessAnalysis = () => {
  const [selectedStep, setSelectedStep] = useState(0);

  const cdData = useMemo(() => {
    const data: CDData[] = [];
    const maxDist = Math.sqrt(Math.pow(GRID_ROWS / 2, 2) + Math.pow(GRID_COLS / 2, 2));

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const centerDist = Math.sqrt(Math.pow(r - GRID_ROWS / 2, 2) + Math.pow(c - GRID_COLS / 2, 2));

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
    const outliers = cdData.filter(d => d.cd < q1 - 1.5 * (q3 - q1) || d.cd > q3 + 1.5 * (q3 - q1));
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
            <h4><Sparkles size={16} /> AI 데이터 핸들링의 차이</h4>
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
          {/* Left: Industrial Monitor Heatmap */}
          <div className="heatmap-column">
            <IndustrialHeatmap data={cdData} />
            
            <div className="industrial-spectrum-legend">
              <div className="spectrum-title">CD MEASUREMENT SPECTRUM (um)</div>
              <div className="spectrum-bar" />
              <div className="spectrum-labels">
                <div className="s-label"><span>3.3</span><br/>Baseline</div>
                <div className="s-label center"><span>3.5</span><br/>Nominal</div>
                <div className="s-label text-red"><span>4.8+</span><br/>Critical</div>
              </div>
            </div>
          </div>

          {/* Right: Distribution Analysis */}
          <div className="distribution-column">
            <DistributionChart data={cdData} stats={stats} />
            <div className="dist-insight">
              <p><Sparkles size={14} /> <strong>Kernel Density Estimation:</strong> 1,400개 전수 데이터를 활용한 비모수적 밀도 추정으로 공정의 안정성 및 멀티 모달(Multi-modal) 분포 자동 감지.</p>
            </div>
          </div>
        </div>

        {/* New 3rd Visualization Row: The WOW Factor */}
        <div className="wow-visualization-row">
          <SurfaceTopography3D data={cdData} />
          <div className="it-insight-card">
            <div className="insight-header"><Zap size={20} /> Why AI Visualization?</div>
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

        <div className="summary-banner">
          <div className="banner-content">
            <h4>Engineering Decision Support:</h4>
            <p>AI 진단 결과에 따라 **'중심부 냉각 채널 노즐 압력 15% 상향'** 및 **'베이킹 프로파일 2구역 온도 0.5도 하향'** 조치를 권고합니다.</p>
          </div>
          <button className="apply-btn">자동 설비 최적화 적용 (Auto-Optimize)</button>
        </div>

        {/* Sankey Traceability Row */}
        <div className="trace-row">
          <SankeyProcessFlow />
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
        /* Industrial Monitor Styles */
        .industrial-monitor-wrapper { width: 100%; max-width: 500px; padding: 20px; background: #0f172a; border-radius: 12px; position: relative; }
        .monitor-frame { 
          border: 1px solid rgba(0, 229, 255, 0.4); border-radius: 8px; position: relative; padding: 10px;
          box-shadow: 0 0 30px rgba(0, 229, 255, 0.2), inset 0 0 20px rgba(0, 229, 255, 0.1);
          background: #020617; overflow: hidden;
        }
        .monitor-inner-glow { position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 0 40px rgba(0, 229, 255, 0.1); }
        .monitor-header { display: flex; justify-content: space-between; align-items: center; padding: 4px 10px; border-bottom: 1px solid rgba(0, 229, 255, 0.3); margin-bottom: 10px; }
        .monitor-title { font-size: 0.65rem; font-weight: 800; color: #00e5ff; letter-spacing: 1px; font-family: monospace; }
        .monitor-icons { display: flex; gap: 6px; }
        .monitor-token { width: 10px; height: 10px; border: 1px solid #00e5ff; }
        .monitor-token.circle { border-radius: 50%; opacity: 0.6; }
        
        .monitor-content { position: relative; padding: 10px 40px 40px 40px; }
        .industrial-heatmap-grid { display: grid; grid-template-columns: repeat(${GRID_COLS}, 1fr); gap: 0; aspect-ratio: ${GRID_COLS}/${GRID_ROWS}; }
        .heatmap-pixel { width: 100%; height: 100%; border: 0.1px solid rgba(0,0,0,0.1); }
        
        .monitor-grid-overlay { position: absolute; inset: 10px 40px 40px 40px; pointer-events: none; }
        .grid-line { position: absolute; background: rgba(0, 229, 255, 0.15); }
        .grid-line.vertical { width: 1px; height: 100%; }
        .grid-line.horizontal { width: 100%; height: 1px; }

        .monitor-labels { position: absolute; font-family: monospace; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.7); display: flex; justify-content: space-between; }
        .labels-x { bottom: 15px; left: 40px; right: 40px; }
        .labels-y-left { top: 10px; bottom: 40px; left: 10px; flex-direction: column; }
        .labels-y-right { top: 10px; bottom: 40px; right: 10px; flex-direction: column; text-align: right; }

        .scan-line { position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: rgba(0, 229, 255, 0.1); animation: scan 4s linear infinite; pointer-events: none; }
        @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }

        .industrial-style { margin-top: 1rem; background: #020617 !important; border-color: rgba(0, 229, 255, 0.3) !important; border-radius: 8px !important; }
        .industrial-style .l-item-v4 { color: #e2e8f0 !important; }

        .industrial-spectrum-legend { 
          width: 100%; max-width: 500px; margin-top: 1.5rem; background: #020617; 
          border: 1px solid rgba(0, 229, 255, 0.2); border-radius: 8px; padding: 15px 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        .spectrum-title { font-size: 0.6rem; color: rgba(0, 229, 255, 0.8); font-weight: 800; margin-bottom: 8px; font-family: monospace; letter-spacing: 0.5px; }
        .spectrum-bar { 
          height: 12px; width: 100%; border-radius: 2px;
          background: linear-gradient(to right, #102a71, #1e40af, #0ea5e9, #22c55e, #eab308, #ef4444, #ffffff);
          margin-bottom: 8px; border: 1px solid rgba(255,255,255,0.1);
        }
        .spectrum-labels { display: flex; justify-content: space-between; position: relative; }
        .s-label { font-size: 0.65rem; color: #94a3b8; font-weight: 700; line-height: 1.3; }
        .s-label span { color: #e2e8f0; font-size: 0.75rem; font-family: monospace; }
        .s-label.center { text-align: center; }
        .s-label.text-red { text-align: right; color: #ef4444; }
        .s-label.text-red span { color: #ef4444; }
        .c-box.h-map-peak { width: 12px; height: 12px; background: #ffffff; border-radius: 2px; box-shadow: 0 0 8px #ffffff; }
        .c-box.h-map-high { width: 12px; height: 12px; background: #ef4444; border-radius: 2px; }
        .c-box.h-map-nominal { width: 12px; height: 12px; background: #22c55e; border-radius: 2px; }
        .c-box.h-map-bg { width: 12px; height: 12px; background: #102a71; border-radius: 2px; }

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
        .correlation-view { background: #f8fafc; border-radius: 16px; padding: 1rem 1.5rem; position: relative; border: 1px solid var(--border); min-height: 200px; }
        .corr-svg { width: 100%; height: auto; }
        .x-axis-label, .y-axis-label { position: absolute; font-size: 0.55rem; font-weight: 800; color: var(--text-secondary); }
        .y-axis-label { top: 50%; left: 10px; transform: rotate(-90deg) translate(-50%, -50%); transform-origin: top left; white-space: nowrap; }
        .x-axis-label { bottom: 10px; left: 50%; transform: translateX(-50%); text-align: center; }

        .influence-list { display: flex; flex-direction: column; gap: 1.2rem; }
        .influence-item { padding: 1rem; border-radius: 14px; border: 1px solid transparent; transition: all 0.3s; }
        .influence-item.active { background: rgba(249, 115, 22, 0.05); border-color: rgba(249, 115, 22, 0.2); }
        .inf-header { display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; }
        .inf-bar-bg { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
        .inf-bar-fill { height: 100%; background: #f97316; border-radius: 3px; }

        .diag-conclusion { background: #1e293b; color: #f1f5f9; padding: 1.5rem; border-radius: 16px; font-size: 0.85rem; line-height: 1.6; }
        .conclusion-label { font-weight: 800; color: #f97316; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }

        .ai-report-banner, .summary-banner { background: var(--accent-gradient); color: white; padding: 2rem 3rem; border-radius: 28px; display: flex; align-items: center; gap: 2rem; box-shadow: 0 15px 40px rgba(0, 113, 227, 0.25); margin-top: 2rem; }

        .trace-row { margin-top: 2rem; }
        .sankey-card { background: var(--bg-primary); border: 1px solid var(--border); border-radius: 28px; padding: 2.5rem; box-shadow: var(--shadow); border-bottom: 8px solid var(--accent); }
        .sankey-svg { width: 100%; height: auto; }
        .sankey-header { margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; }
        .sankey-header h4 { font-size: 1.25rem; color: var(--accent); margin: 0 0 5px 0; font-weight: 900; }
        .sankey-header p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }
        .sh-status { font-size: 0.7rem; font-weight: 800; color: #34c759; background: rgba(52, 199, 89, 0.1); padding: 4px 10px; border-radius: 6px; }
        .pulse-circle { animation: pulseSankey 1.5s infinite; }
        @keyframes pulseSankey { 0% { r: 3; opacity: 1; } 50% { r: 6; opacity: 0.4; } 100% { r: 3; opacity: 1; } }

        :root { --sankey-link: rgba(71, 85, 105, 0.35); }
        [data-theme='dark'] { --sankey-link: rgba(203, 213, 225, 0.25); }

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
