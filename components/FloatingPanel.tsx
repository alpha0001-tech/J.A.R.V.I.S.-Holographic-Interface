import React from 'react';
import { THEME } from '../constants';

interface FloatingPanelProps {
  x: number;
  y: number;
  region: string;
  isDragging: boolean;
}

const FloatingPanel: React.FC<FloatingPanelProps> = ({ x, y, region, isDragging }) => {
  return (
    <div
      style={{
        transform: `translate(${x}px, ${y}px)`,
        borderColor: isDragging ? '#FFFFFF' : THEME.primary,
        boxShadow: `0 0 15px ${isDragging ? 'rgba(255,255,255,0.5)' : 'rgba(0,255,255,0.3)'}`,
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      className="absolute w-64 p-4 border-2 bg-black/60 backdrop-blur-sm rounded-lg select-none pointer-events-none z-30"
    >
      <div className="flex justify-between items-center border-b border-cyan-800 pb-2 mb-2">
        <h3 className="text-cyan-400 font-bold text-sm tracking-widest">GEO-INTEL</h3>
        <div className={`w-2 h-2 rounded-full ${isDragging ? 'bg-white animate-ping' : 'bg-cyan-500'}`} />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-cyan-200/70">
          <span>TARGET:</span>
          <span className="text-cyan-400 font-bold">{region}</span>
        </div>
        
        <div className="h-20 overflow-hidden relative">
           <div className="absolute inset-0 opacity-30">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between text-[10px] text-cyan-600 font-mono">
                   <span>DATA_BLK_{i*32}</span>
                   <span>{Math.floor(Math.random() * 9999)}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="mt-2 pt-2 border-t border-cyan-900 flex gap-1">
          <div className="h-1 flex-1 bg-cyan-900/50 overflow-hidden">
            <div className="h-full bg-cyan-400 w-[70%] animate-pulse" />
          </div>
          <div className="h-1 w-1/4 bg-red-900/50">
             <div className="h-full bg-red-500 w-[40%]" />
          </div>
        </div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-white" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-white" />
    </div>
  );
};

export default FloatingPanel;
