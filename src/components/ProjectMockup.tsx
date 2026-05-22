import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, TrendingUp, RefreshCw, ShoppingBag, Plus, Sparkles, Move, Code, MousePointer, Info, Cpu } from 'lucide-react';

interface ProjectMockupProps {
  type: string;
}

export default function ProjectMockup({ type }: ProjectMockupProps) {
  // Common states for interactions
  const [metric, setMetric] = useState(1320);
  const [latency, setLatency] = useState(24);
  const [cartCount, setCartCount] = useState(0);
  const [activeWatchColor, setActiveWatchColor] = useState('black');
  const [activeSize, setActiveSize] = useState('40mm');
  const [canvasNodes, setCanvasNodes] = useState([
    { id: 1, x: 50, y: 70, title: 'Input Prompt', color: 'bg-indigo-500' },
    { id: 2, x: 190, y: 35, title: 'Gemini Agent', color: 'bg-emerald-500' },
    { id: 3, x: 300, y: 110, title: 'SVG Graphics', color: 'bg-rose-500' }
  ]);
  const [btnScale, setBtnScale] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  // Interval tasks
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate dashboard fluctuations
      setMetric(prev => prev + Math.floor(Math.random() * 11) - 5);
      setLatency(prev => {
        const next = prev + Math.floor(Math.random() * 5) - 2;
        return next < 15 ? 15 : next > 35 ? 35 : next;
      });

      // Shift nodes for collaborative canvas
      setCanvasNodes(nodes => {
        return nodes.map((node, idx) => {
          const osc = Math.sin((Date.now() / 1000) + idx) * 0.4;
          return {
            ...node,
            y: node.y + (idx === 0 ? osc : idx === 1 ? -osc : osc * 1.5)
          };
        });
      });

      setPulseCount(p => p + 1);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Watch models details
  const watchColors = {
    black: { name: 'Carbon Black', bgClass: 'bg-zinc-800 border-zinc-950', hex: '#18181b', price: '$299' },
    gold: { name: 'Warm Champagne', bgClass: 'bg-yellow-100 border-yellow-400', hex: '#fef08a', price: '$349' },
    emerald: { name: 'Nordic Forest', bgClass: 'bg-emerald-800 border-emerald-950', hex: '#064e3b', price: '$329' }
  };

  const renderDashboardMockup = () => {
    return (
      <div className="w-full h-full bg-zinc-900 border border-zinc-800/85 rounded-xl p-5 flex flex-col justify-between font-mono text-[11px] text-zinc-400 relative overflow-hidden select-none">
        {/* Mock Window bar */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
          </div>
          <span className="text-zinc-650 opacity-80 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            server_node_live:3000
          </span>
        </div>

        {/* Contents */}
        <div className="grid grid-cols-3 gap-3 flex-1 mb-2">
          {/* Main Monitor */}
          <div className="col-span-2 bento-card bg-zinc-950/70 border border-zinc-800/50 rounded-lg p-3 flex flex-col justify-between relative">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 block mb-1">Live Database Query Pool</span>
            <div className="flex justify-between items-end my-2 h-16">
              {[8, 12, 10, 15, 7, 18, 25, 14, 20, 17, 24, 19, 29, 22, 34].map((h, i) => (
                <div key={i} className="w-[4%] bg-blue-500/20 group relative rounded-t-sm" style={{ height: `${h * 2.2}%` }}>
                  {/* Interactive Active Peak */}
                  {i === 14 && <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 rounded-full animate-bounce"></div>}
                  <div className="w-full h-full group-hover:bg-blue-400 transition-colors bg-blue-500/40 rounded-t-sm"></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-zinc-500">
              <span>00:00:00Z</span>
              <span className="text-blue-400">Total Ops: {metric} ops/s</span>
            </div>
          </div>

          {/* Quick Stats Column */}
          <div className="flex flex-col gap-3">
            <div className="bg-zinc-950/70 border border-zinc-800/50 rounded-lg p-2.5 flex flex-col justify-between flex-1">
              <span className="text-[9px] text-zinc-500 uppercase tracking-tight">API Delay</span>
              <div className="text-sm font-semibold text-emerald-400 flex items-baseline gap-1">
                {latency}ms
                <TrendingUp size={10} className="text-emerald-500" />
              </div>
              <p className="text-[8px] opacity-60">Avg. response threshold</p>
            </div>
            <div className="bg-zinc-950/70 border border-zinc-800/50 rounded-lg p-2.5 flex flex-col justify-between flex-1">
              <span className="text-[9px] text-zinc-500 uppercase">Load</span>
              <div className="text-sm font-semibold text-indigo-400">41.2%</div>
              <p className="text-[8px] opacity-60">12 core engine specs</p>
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center text-[9px] border-t border-zinc-800 pt-3 text-zinc-500 mt-2">
          <span>Aether Dash Web Core</span>
          <button
            onClick={() => {
              setMetric(m => m + 50);
              setLatency(l => Math.max(15, l - 5));
            }}
            className="flex items-center gap-1 hover:text-blue-400 border border-zinc-800 hover:border-blue-500 px-2 py-0.5 rounded cursor-pointer transition-colors active:scale-95"
          >
            <RefreshCw size={8} className="animate-spin" style={{ animationDuration: '6s' }} />
            TRIGGER LOAD TEST (-5ms)
          </button>
        </div>
      </div>
    );
  };

  const renderCommerceMockup = () => {
    const selectedWatch = activeWatchColor === 'black' ? watchColors.black : activeWatchColor === 'gold' ? watchColors.gold : watchColors.emerald;

    return (
      <div className="w-full h-full bg-stone-50 text-stone-900 rounded-xl p-5 flex flex-col justify-between border border-stone-200 shadow-sm relative overflow-hidden select-none">
        {/* Navigation Head */}
        <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-3 text-xs">
          <span className="font-display font-bold uppercase tracking-wider">SOLARIS</span>
          <div className="flex items-center gap-3">
            <span className="text-stone-400 text-[10px]">Shop</span>
            <span className="text-stone-400 text-[10px]">Archive</span>
            <div className="flex items-center gap-1 bg-stone-900 text-stone-50 px-2 py-0.5 rounded-full text-[9px]">
              <ShoppingBag size={8} />
              <span>{cartCount}</span>
            </div>
          </div>
        </div>

        {/* Main Interface Content */}
        <div className="grid grid-cols-5 gap-3 flex-1 items-center">
          {/* Left: Product Frame */}
          <div className="col-span-3 flex justify-center items-center relative aspect-square">
            {/* Elegant Background circle of watch */}
            <div className="absolute w-24 h-24 rounded-full bg-stone-200/50 blur-lg"></div>

            {/* Smart simulated minimalist luxury watch */}
            <div className="relative w-24 h-32 flex flex-col justify-center items-center">
              {/* Watch Straps */}
              <div className="w-8 h-8 bg-stone-700/80 rounded-t-sm"></div>
              {/* Watch Body Dial */}
              <div className={`w-16 h-16 rounded-full ${selectedWatch.bgClass} border-4 shadow-md transition-all duration-500 flex items-center justify-center relative`}>
                {/* Watch needles */}
                <div className="absolute w-1 h-5 bg-stone-900 dark:bg-stone-100 rounded-full origin-bottom -mt-5 transform rotate-45"></div>
                <div className="absolute w-1 h-4 bg-stone-900 dark:bg-stone-100 rounded-full origin-bottom -mt-4 transform -rotate-12"></div>
                <div className="absolute w-1.5 h-1.5 rounded-full bg-red-500"></div>
              </div>
              <div className="w-8 h-8 bg-stone-700/80 rounded-b-sm"></div>
            </div>
          </div>

          {/* Right: Product controls */}
          <div className="col-span-2 flex flex-col justify-center gap-2">
            <span className="text-[8px] uppercase tracking-widest text-stone-500">Edition V1</span>
            <h4 className="text-[12px] font-display font-medium leading-tight">Minimalist Chrono Watch</h4>
            <span className="text-[11px] text-stone-600 font-semibold">{selectedWatch.price}</span>

            {/* Color controls */}
            <div className="flex gap-1.5 my-1">
              {Object.keys(watchColors).map((colorKey) => {
                const active = activeWatchColor === colorKey;
                return (
                  <button
                    key={colorKey}
                    onClick={() => setActiveWatchColor(colorKey)}
                    className={`w-3.5 h-3.5 rounded-full border-2 ${active ? 'border-stone-900 scale-110' : 'border-stone-200'} p-0.5 transition-all cursor-pointer`}
                    style={{ backgroundColor: watchColors[colorKey as keyof typeof watchColors].hex }}
                  />
                );
              })}
            </div>

            {/* Size Selector */}
            <div className="flex gap-1 text-[8px] font-semibold my-0.5">
              {['38mm', '40mm', '44mm'].map((size) => (
                <button
                  key={size}
                  onClick={() => setActiveSize(size)}
                  className={`px-1.5 py-0.5 border rounded cursor-pointer transition-colors ${
                    activeSize === size ? 'bg-stone-900 border-stone-900 text-white' : 'border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Quick Purchase action */}
            <button
              onClick={() => {
                setCartCount(c => c + 1);
                setBtnScale(true);
                setTimeout(() => setBtnScale(false), 300);
              }}
              className="text-[9px] bg-stone-900 hover:bg-stone-850 text-white py-1 px-2 rounded flex items-center justify-center gap-1 mt-1 transition-transform cursor-pointer active:scale-95"
              style={{ transform: btnScale ? 'scale(1.08)' : 'scale(1)' }}
            >
              <ShoppingBag size={8} /> Add To Cart
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCanvasMockup = () => {
    return (
      <div className="w-full h-full bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between font-mono text-[10px] text-zinc-400 relative overflow-hidden select-none">
        {/* Canvas Blueprint Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1.5px)`,
            backgroundSize: '16px 16px'
          }}
        ></div>

        {/* Toolbar Header */}
        <div className="flex justify-between items-center border-b border-zinc-900 pb-2 mb-2 z-10">
          <span className="text-zinc-500 uppercase flex items-center gap-1">
            <Move size={8} className="text-blue-500" />
            Co-Presence: 2 Active Architect Cursors
          </span>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-[7px]">S</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-[7px]">K</span>
          </div>
        </div>

        {/* Dynamic Nodes Workspace */}
        <div className="relative flex-1 h-32 z-10">
          {/* SVG lines connecting nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <line
              x1={canvasNodes[0]?.x + 40}
              y1={canvasNodes[0]?.y + 12}
              x2={canvasNodes[1]?.x + 40}
              y2={canvasNodes[1]?.y + 12}
              stroke="#4b5563"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <line
              x1={canvasNodes[1]?.x + 40}
              y1={canvasNodes[1]?.y + 12}
              x2={canvasNodes[2]?.x + 40}
              y2={canvasNodes[2]?.y + 12}
              stroke="#4b5563"
              strokeWidth="1.5"
            />
          </svg>

          {/* Render individual node cards */}
          {canvasNodes.map((node) => (
            <div
              key={node.id}
              className="absolute border border-zinc-800 rounded bg-zinc-900 px-2 py-1 flex items-center gap-1.5 transition-all duration-300"
              style={{ left: `${node.x}px`, top: `${node.y}px` }}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${node.color}`}></div>
              <span className="text-[9px] text-zinc-200">{node.title}</span>
            </div>
          ))}

          {/* Mouse cursor visual replication */}
          <motion.div
            className="absolute z-30 pointer-events-none"
            animate={{
              x: [110, 240, 150, 60, 110],
              y: [40, 90, 20, 100, 40]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <MousePointer size={12} className="text-blue-400 fill-blue-400" />
            <div className="bg-blue-500 text-white text-[7px] font-semibold py-0.5 px-1 rounded ml-2.5 mt-2 shadow-md">
              Sarah (Design)
            </div>
          </motion.div>

          <motion.div
            className="absolute z-30 pointer-events-none"
            animate={{
              x: [280, 80, 190, 260, 280],
              y: [100, 30, 110, 50, 100]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <MousePointer size={12} className="text-rose-400 fill-rose-400" />
            <div className="bg-rose-500 text-white text-[7px] font-semibold py-0.5 px-1 rounded ml-2.5 mt-2 shadow-md">
              Kaelen (Dev)
            </div>
          </motion.div>
        </div>

        {/* Controls footer */}
        <div className="flex justify-between items-center text-[9px] border-t border-zinc-900 pt-2 z-10 text-zinc-500">
          <span>Real-time Multiplayer Active</span>
          <button
            onClick={() => {
              setCanvasNodes(prev => [
                ...prev,
                {
                  id: Date.now(),
                  x: Math.max(20, Math.floor(Math.random() * 250)),
                  y: Math.max(20, Math.floor(Math.random() * 100)),
                  title: `Custom Node`,
                  color: 'bg-yellow-500'
                }
              ]);
            }}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-1.5 py-0.5 rounded text-[8px] text-zinc-300 pointer-events-auto flex items-center gap-1 cursor-pointer"
          >
            <Plus size={8} /> Add Custom Node
          </button>
        </div>
      </div>
    );
  };

  const renderDesignSystemMockup = () => {
    return (
      <div className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between font-mono text-[10px] text-zinc-400 relative overflow-hidden select-none">
        {/* Token hub window menu */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-2">
          <span className="text-zinc-500 uppercase flex items-center gap-1">
            <Code size={10} className="text-pink-500" />
            nova_design_tokens
          </span>
          <span className="text-[9px] bg-zinc-800 border border-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded">
            v1.4.2
          </span>
        </div>

        {/* Renders atomic elements of the system */}
        <div className="grid grid-cols-2 gap-3 flex-grow my-1">
          {/* Colors palette panel */}
          <div className="bg-zinc-950/70 border border-zinc-800/50 rounded-lg p-2 flex flex-col justify-between">
            <span className="text-[8px] uppercase tracking-wider text-zinc-500 mb-1">Color Palette</span>
            <div className="flex gap-1.5 items-center">
              <div className="flex -space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-500 border border-zinc-950"></span>
                <span className="w-4 h-4 rounded-full bg-violet-500 border border-zinc-950"></span>
                <span className="w-4 h-4 rounded-full bg-pink-500 border border-zinc-950"></span>
                <span className="w-4 h-4 rounded-full bg-emerald-500 border border-zinc-950"></span>
              </div>
              <span className="text-[8px]">--color-primary</span>
            </div>
          </div>

          {/* Interactive Button component demo */}
          <div className="bg-zinc-950/70 border border-zinc-800/50 rounded-lg p-2 flex flex-col justify-between items-start">
            <span className="text-[8px] uppercase tracking-wider text-zinc-500">Atomic Button</span>
            <motion.button
              className="mt-1 w-full text-[8px] bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-1.5 rounded flex items-center justify-center gap-1 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles size={8} /> Pulsing Button
            </motion.button>
          </div>

          {/* Typographic fonts showcase */}
          <div className="bg-zinc-950/70 border border-zinc-800/50 rounded-lg p-2 col-span-2 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider text-zinc-500">Display Typo</span>
              <span className="font-display text-[12px] font-bold tracking-tight text-white">Space Grotesk</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[8px] uppercase tracking-wider text-zinc-500">Weight</span>
              <span className="text-[9px] text-zinc-300">Bold 700 / Medium 500</span>
            </div>
          </div>
        </div>

        {/* Footer info banner */}
        <div className="flex justify-between items-center text-[9px] border-t border-zinc-800 pt-2 text-zinc-500 mt-1">
          <span className="text-[8px] flex items-center gap-1"><Cpu size={10} /> Syncing variables...</span>
          <span className="text-zinc-600">tailwind.config.json</span>
        </div>
      </div>
    );
  };

  switch (type) {
    case 'dashboard':
      return renderDashboardMockup();
    case 'commerce':
      return renderCommerceMockup();
    case 'canvas':
      return renderCanvasMockup();
    case 'design-system':
      return renderDesignSystemMockup();
    default:
      return renderDashboardMockup();
  }
}
