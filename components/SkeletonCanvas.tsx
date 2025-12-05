import React, { useEffect, useRef } from 'react';
import { HandData } from '../types';
import { THEME } from '../constants';

interface SkeletonCanvasProps {
  hands: HandData[];
  width: number;
  height: number;
}

const CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [0, 9], [9, 10], [10, 11], [11, 12], // Middle
  [0, 13], [13, 14], [14, 15], [15, 16], // Ring
  [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
];

const SkeletonCanvas: React.FC<SkeletonCanvasProps> = ({ hands, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    hands.forEach(hand => {
      // Draw Connections
      ctx.strokeStyle = THEME.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      CONNECTIONS.forEach(([start, end]) => {
        const p1 = hand.landmarks[start];
        const p2 = hand.landmarks[end];
        
        // Mirror X because webcam is mirrored
        const x1 = (1 - p1.x) * width;
        const y1 = p1.y * height;
        const x2 = (1 - p2.x) * width;
        const y2 = p2.y * height;

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      });
      ctx.stroke();

      // Draw Joints
      ctx.fillStyle = '#FFFFFF';
      hand.landmarks.forEach((p) => {
        const x = (1 - p.x) * width;
        const y = p.y * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = THEME.primary;
      });
      ctx.shadowBlur = 0;
    });

  }, [hands, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }}
    />
  );
};

export default SkeletonCanvas;
