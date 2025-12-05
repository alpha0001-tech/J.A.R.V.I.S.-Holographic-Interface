import React, { useEffect, useState } from 'react';
import { HUDState } from '../types';

interface HUDProps {
  status: HUDState;
  handStatus: { left: boolean; right: boolean };
}

const HUD: React.FC<HUDProps> = ({ status, handStatus }) => {
  const [randomHex, setRandomHex] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const codes = Array.from({ length: 6 }, () => 
        '0x' + Math.floor(Math.random()*16777215).toString(16).toUpperCase().padStart(6, '0')
      );
      setRandomHex(codes);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between" style={{ zIndex: 30 }}>
      
      {/* Top Header */}
      <div className="flex justify-between items-start">
        {/* Left: System Status */}
        <div className="bg-black/40 backdrop-blur-md border-l-4 border-cyan-400 p-4 w-64">
           <div className="text-xs text-cyan-200 mb-1">SYSTEM_STATUS</div>
           <div className="text-xl font-bold text-cyan-400 tracking-wider mb-2">{status.systemStatus}</div>
           <div className="space-y-1">
             {randomHex.map((hex, i) => (
               <div key={i} className="text-[10px] text-cyan-600 font-mono flex justify-between">
                  <span>MEM_ADDR_{i}:</span>
                  <span>{hex}</span>
               </div>
             ))}
           </div>
        </div>

        {/* Right: Main Title & Time */}
        <div className="text-right">
           <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-cyan-600 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)] tracking-tighter">
             J.A.R.V.I.S.
           </h1>
           <div className="text-2xl text-cyan-200 mt-2 font-mono flex items-center justify-end gap-3">
             <span className="animate-pulse w-3 h-3 bg-red-500 rounded-full inline-block" />
             {status.time}
           </div>
        </div>
      </div>

      {/* Bottom Status */}
      <div className="flex justify-between items-end">
        {/* Left: Hand Tracking Indicators */}
        <div className="flex gap-4">
           <div className={`border-2 p-2 w-32 text-center transition-all ${handStatus.left ? 'border-cyan-400 bg-cyan-900/30' : 'border-gray-800 text-gray-700'}`}>
              <div className="text-xs font-bold">L_HAND</div>
              <div className="text-[10px]">ROTATION_CTRL</div>
           </div>
           <div className={`border-2 p-2 w-32 text-center transition-all ${handStatus.right ? 'border-cyan-400 bg-cyan-900/30' : 'border-gray-800 text-gray-700'}`}>
              <div className="text-xs font-bold">R_HAND</div>
              <div className="text-[10px]">PANEL_DRAG</div>
           </div>
        </div>
        
        {/* Center Bottom: Decoration */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-70">
           <div className="w-64 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
           <div className="text-[10px] text-cyan-500 mt-1 tracking-[0.5em]">ONLINE</div>
        </div>
      </div>

      {/* Vignette & Color Grading Overlay handled by CSS classes on App container, but added structure here just in case */}
    </div>
  );
};

export default HUD;
