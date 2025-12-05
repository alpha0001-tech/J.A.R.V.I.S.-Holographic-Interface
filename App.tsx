import React, { useEffect, useRef, useState, useCallback } from 'react';
import { initializeVision, detectHands } from './services/visionService';
import SkeletonCanvas from './components/SkeletonCanvas';
import Scene3D from './components/Scene3D';
import HUD from './components/HUD';
import FloatingPanel from './components/FloatingPanel';
import { HandData, HUDState } from './types';

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>(0);
  const [loading, setLoading] = useState(true);
  
  // Real-time Visual State
  const [hands, setHands] = useState<HandData[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // UI State
  const [hudState, setHudState] = useState<HUDState>({
    fps: 0,
    systemStatus: 'INITIALIZING...',
    time: new Date().toLocaleTimeString(),
  });
  const [detectedRegion, setDetectedRegion] = useState<string>("SCANNING...");

  // Panel State
  const [panelState, setPanelState] = useState({
    x: window.innerWidth - 300,
    y: window.innerHeight / 2 - 100,
    isDragging: false
  });

  // Interaction Refs (for high frequency 3D updates without re-renders)
  const interactionRef = useRef({
    rotation: { x: 0, y: 0 },
    scale: 1,
  });

  // Helper: Calculate distance for pinch
  const getDistance = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
  };

  const processHands = useCallback((results: any) => {
    const newHands: HandData[] = [];
    let isLeftDetected = false;
    let isRightDetected = false;
    let isPinchingRight = false;
    
    // Process results
    if (results && results.landmarks) {
       results.landmarks.forEach((landmarks: any[], index: number) => {
         const handedness = results.handedness[index][0].categoryName as 'Left' | 'Right';
         newHands.push({ landmarks, handedness, score: results.handedness[index][0].score });

         // Logic separation
         // Note: MediaPipe "Left" is the person's left hand. 
         // If mirrored video, it appears on the right side of the screen.
         // We will stick to the prompt's request: Left Hand -> Earth, Right Hand -> Panel.
         
         if (handedness === 'Left') {
            isLeftDetected = true;
            // Rotation Control (Palm Center roughly at index 0 or 9)
            // Map X (0-1) to Rotation Y (-PI to PI)
            const x = landmarks[9].x; 
            const y = landmarks[9].y;
            
            // Scaling Control (Thumb Tip 4 to Index Tip 8)
            const pinchDist = getDistance(landmarks[4], landmarks[8]);
            
            // Update Ref
            interactionRef.current.rotation.y = (x - 0.5) * Math.PI * 4; // Amplify rotation
            interactionRef.current.rotation.x = (y - 0.5) * Math.PI * 2;
            
            // Map pinch (approx 0.02 to 0.2) to scale (0.5 to 2.0)
            const scale = Math.max(0.5, Math.min(2.5, pinchDist * 10));
            interactionRef.current.scale = scale;
         }

         if (handedness === 'Right') {
            isRightDetected = true;
            // Drag Control
            const pinchDist = getDistance(landmarks[4], landmarks[8]);
            const pinchThreshold = 0.05;
            
            if (pinchDist < pinchThreshold) {
               isPinchingRight = true;
               // Update Panel Position (inverted X because of mirror)
               const screenX = (1 - landmarks[9].x) * window.innerWidth;
               const screenY = landmarks[9].y * window.innerHeight;
               
               // Direct update to state to move panel
               setPanelState(prev => ({
                 ...prev,
                 x: screenX - 128, // center offset
                 y: screenY - 50,
                 isDragging: true
               }));
            } else {
               setPanelState(prev => ({ ...prev, isDragging: false }));
            }
         }
       });
    }

    setHands(newHands);
    // If we stopped pinching, ensure state reflects that
    if (!isPinchingRight && panelState.isDragging) {
       setPanelState(prev => ({ ...prev, isDragging: false }));
    }

    // Update Status for HUD
    setHudState(prev => ({
       ...prev,
       systemStatus: newHands.length > 0 ? 'TARGET_ACQUIRED' : 'SCANNING_SECTOR',
       time: new Date().toLocaleTimeString()
    }));

  }, [panelState.isDragging]);

  const loop = useCallback((time: number) => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      const results = detectHands(videoRef.current, time);
      processHands(results);
    }
    requestRef.current = requestAnimationFrame(loop);
  }, [processHands]);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeVision();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            facingMode: 'user' // selfie camera
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadeddata = () => {
             setDimensions({
               width: videoRef.current!.videoWidth,
               height: videoRef.current!.videoHeight
             });
             setLoading(false);
             requestRef.current = requestAnimationFrame(loop);
          };
        }
      } catch (err) {
        console.error("Initialization failed", err);
        setHudState(prev => ({ ...prev, systemStatus: 'CAMERA_ERROR' }));
      }
    };

    init();
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  // Handle Resize
  useEffect(() => {
     const handleResize = () => {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
     };
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handStatus = {
    left: hands.some(h => h.handedness === 'Left'),
    right: hands.some(h => h.handedness === 'Right')
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100 filter brightness-75 contrast-125 sepia-[0.3] hue-rotate-180 saturate-50"
        style={{ zIndex: 0 }}
      />
      
      {/* Visual Effects Layers */}
      <div className="scanlines"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_120%)] pointer-events-none z-[1]"></div>

      {/* Loading Screen */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
          <div className="text-cyan-400 font-mono text-xl animate-pulse">
            INITIALIZING J.A.R.V.I.S. PROTOCOLS...
          </div>
        </div>
      )}

      {/* Content Layer */}
      {!loading && (
        <>
           {/* 2D Skeletons */}
           <SkeletonCanvas 
              hands={hands} 
              width={dimensions.width || window.innerWidth} 
              height={dimensions.height || window.innerHeight} 
           />
           
           {/* 3D Scene */}
           <Scene3D 
              interactionRef={interactionRef} 
              onRegionUpdate={setDetectedRegion}
           />
           
           {/* Floating Panel */}
           <FloatingPanel 
              x={panelState.x} 
              y={panelState.y} 
              region={detectedRegion}
              isDragging={panelState.isDragging}
           />

           {/* HUD Overlay */}
           <HUD status={hudState} handStatus={handStatus} />
        </>
      )}
    </div>
  );
};

export default App;
