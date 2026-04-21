'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Canvas, useFrame } from '@react-three/fiber';
import { Grid } from '@react-three/drei';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faEnvelope } from '@fortawesome/free-solid-svg-icons';

// --- 3D BACKGROUND COMPONENT ---
function MovingGridBackground({ themeColor }: { themeColor: string }) {
  const gridRef = useRef<any>(null);
  
  useFrame((state) => {
    if (gridRef.current) {
      // Adjusted the movement speed slightly to match the new diagonal angle
      gridRef.current.position.y = (state.clock.elapsedTime * -0.4) % 4;
      gridRef.current.position.x = (state.clock.elapsedTime * -0.4) % 4;
    }
  });

  return (
    <Grid
      ref={gridRef}
      // Moved it slightly down (y: -2) so the horizon line sits better behind the timer
      position={[0, -2, -8]} 
      
      // ROTATION ARRAY: [X-axis, Y-axis, Z-axis]
      // Math.PI / 2.3 tilts it backward like a floor
      // Math.PI / 6 spins it diagonally (30 degrees)
      rotation={[Math.PI / 2.3, 0, Math.PI / 6]} 
      
      infiniteGrid
      fadeDistance={80} // Increased so the diagonal lines stretch further out
      fadeStrength={1.5} // Made the fade a bit stronger at the edges
      cellSize={1}
      cellThickness={0.4}
      sectionSize={4}
      sectionThickness={0.8}
      cellColor={themeColor}
      sectionColor={themeColor}
    />
  );
}

// --- MAIN TIMER COMPONENT ---
interface TimerProps {
  themeColor?: string;
  bgColor?: string;
  positions?: string[];
}

const DEFAULT_POSITIONS = [
  'Select Position',
  'Chairperson & Student Regent',
  'Internal Vice Chairperson',
  'External Vice Chairperson',
  'Secretary-General',
  'Deputy Secretary-General',
  'Finance Officer',
  'Deputy Finance Officer',
  'Auditor',
  'Business Manager',
  'Public Information Officer'
];

export default function HarapanTimer({
  themeColor = '#1e4b41',
  bgColor = '#fefbf5',
  positions = DEFAULT_POSITIONS,
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(positions[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('00:00');
  
  // To prevent Next.js Hydration errors with 3D Canvas
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio refs
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const tenSecSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    startSoundRef.current = new Audio('/assets/audios/startSound.mp3');
    tenSecSoundRef.current = new Audio('/assets/audios/10secSound.mp3');
    endSoundRef.current = new Audio('/assets/audios/timerEnd.mp3');
  }, []);

  // --- Timer Logic ---
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          // Play 10-second warning sound
          if (newTime === 10) {
            tenSecSoundRef.current?.play().catch(e => console.log("Audio play prevented"));
          }
          // Play end sound when timer reaches 0
          if (newTime === 0) {
            endSoundRef.current?.play().catch(e => console.log("Audio play prevented"));
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  // --- Formatting & Input ---
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length > 2) val = val.slice(0, 2) + ':' + val.slice(2);
    setEditValue(val);
  };

  const handleEditSubmit = (e: React.KeyboardEvent | React.FocusEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    setIsEditing(false);
    const parts = editValue.split(':');
    const mins = parseInt(parts[0] || '0', 10);
    const secs = parseInt(parts[1] || '0', 10);
    if (!isNaN(mins) && !isNaN(secs)) setTimeLeft(mins * 60 + secs);
  };

  const toggleTimer = () => {
    if (timeLeft > 0) {
      setIsRunning(!isRunning);
    }
  };
  const resetTimer = () => { setIsRunning(false); setTimeLeft(0); setSelectedPosition(positions[0]); };
  const setPreset = (seconds: number) => { setIsRunning(false); setTimeLeft(seconds); };

  // --- Dynamic Styling States ---
  const isWarningText = timeLeft <= 10 && timeLeft > 0;
  const isCriticalScreen = timeLeft <= 5 && timeLeft > 0;
  const isExpired = timeLeft === 0 && !isEditing;

  return (
    <div 
      className="relative flex flex-col items-center justify-between min-h-screen font-sans selection:bg-[#1e4b41]/20 overflow-hidden"
      style={{ backgroundColor: bgColor }} // Base Cream Background
    >
      {/* 1. IMMERSIVE FULL-SCREEN RED OVERLAY */}
      <div 
        className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-1000 ease-in-out
          ${isCriticalScreen ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <div className="w-full h-full bg-red-600/15 shadow-[inset_0_0_250px_rgba(220,38,38,0.5)] animate-pulse" />
      </div>

      {/* 2. REACT THREE FIBER MOVING GRID */}
      {isMounted && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
          <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
            <MovingGridBackground themeColor={themeColor} />
          </Canvas>
        </div>
      )}

      {/* 3. SOFT BLUR & VIGNETTE MASK */}
      {/* This creates the "soft" look by slightly blurring the grid and fading it into the cream color at the edges */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none backdrop-blur-[2px]"
        style={{
          background: `radial-gradient(circle at center, transparent 30%, ${bgColor} 90%)`
        }}
      />

      {/* TOP HEADER */}
      <div className="w-full flex justify-start p-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <Image 
              src="/assets/ballotwatch-submark.png" 
              alt="Ballotwatch Submark" 
              width={48} 
              height={48}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span style={{ color: themeColor }} className="text-sm font-serif italic mb-[-5px]">The Bicol</span>
            <span style={{ color: themeColor }} className="text-xl font-serif font-black tracking-tight">Universitarian</span>
          </div>
        </div>
      </div>

      {/* MAIN CENTER CONTENT */}
      <div className="flex flex-col items-center justify-center w-full max-w-6xl z-10 px-6 -mt-10 pb-20">
        
        {/* Title Area */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="flex items-center drop-shadow-sm">
            <h1 
              className="text-7xl md:text-9xl font-black italic tracking-tighter"
              style={{ color: themeColor, fontFamily: 'Times New Roman, serif' }}
            >
              HARAPAN
            </h1>
          </div>
          <h2 
            className="text-lg md:text-2xl font-bold tracking-[0.2em] mt-4 opacity-90"
            style={{ color: themeColor }}
          >
            UNIVERSITY ELECTIONS SPECIAL COVERAGE
          </h2>
        </div>

        {/* Timer Display */}
        <div className="w-full flex justify-center my-6 relative">
          {/* Subtle glow behind the timer */}
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full" />
          
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={handleEditChange}
              onBlur={handleEditSubmit}
              onKeyDown={handleEditSubmit}
              autoFocus
              className="text-[14rem] sm:text-[16rem] md:text-[24rem] leading-none font-black text-center bg-transparent outline-none tracking-widest relative z-10"
              style={{ color: themeColor, fontFamily: 'var(--font-orbitron), sans-serif' }}
            />
          ) : (
            <div 
              onClick={() => {
                setIsEditing(true);
                setEditValue(formatTime(timeLeft));
                setIsRunning(false);
              }}
              className={`text-[14rem] sm:text-[14rem] md:text-[24rem] leading-none font-black cursor-pointer transition-all duration-300 tracking-widest select-none relative z-10
                ${isWarningText ? 'text-red-600 drop-shadow-[0_0_40px_rgba(220,38,38,0.6)] scale-[1.02]' : 'drop-shadow-sm'}
              `}
              style={{ 
                color: isWarningText ? undefined : themeColor,
                fontFamily: 'var(--font-orbitron), sans-serif' 
              }}
            >
              {isExpired ? <span style={{ color: themeColor }}>00:00</span> : formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Position Dropdown */}
        <div className="relative w-full max-w-4xl mx-auto my-10 z-50">
          <Listbox value={selectedPosition} onChange={setSelectedPosition}>
            <div className="relative">
              <ListboxButton
                className="w-full text-center text-3xl md:text-5xl py-4 appearance-none outline-none cursor-pointer tracking-wider font-bold border-b-4 transition-colors"
                style={{ 
                  color: themeColor,
                  backgroundColor: bgColor,
                  borderColor: `${themeColor}80`
                }}
              >
                {selectedPosition}
              </ListboxButton>
              <ListboxOptions
                className="absolute mt-2 w-full bg-[#fefbf5] border-2 rounded-lg shadow-xl max-h-60 overflow-auto focus:outline-none z-20"
                style={{ borderColor: themeColor }}
              >
                {positions.map((pos) => (
                  <ListboxOption
                    key={pos}
                    value={pos}
                    className="relative cursor-pointer select-none py-3 px-4 text-center text-2xl font-bold transition-all hover:scale-105 hover:bg-black/5"
                    style={{ color: themeColor }}
                  >
                    {pos}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-6 items-center w-full">
          <div className="flex flex-wrap justify-center gap-4">
            {[120, 90, 60, 30].map((secs) => (
              <button
                key={secs}
                onClick={() => setPreset(secs)}
                className="px-6 py-2 rounded-full font-medium tracking-wide transition-all cursor-pointer hover:bg-black/10 border"
                style={{ backgroundColor: 'transparent', color: `${themeColor}50`, borderColor: `${themeColor}25` }}
              >
                {secs} SECS
              </button>
            ))}
            <button
              onClick={toggleTimer}
              className="px-8 py-2 rounded-full font-medium tracking-wide transition-all cursor-pointer hover:bg-black/10 border-2"
              style={{ 
                backgroundColor: isRunning ? `${themeColor}08` : 'transparent', 
                color: `${themeColor}50`,
                borderColor: `${themeColor}25` 
              }}
            >
              {isRunning ? 'PAUSE' : 'START'}
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button 
              onClick={() => startSoundRef.current?.play().catch(e => console.log("Audio play prevented"))}
              className="px-4 py-1.5 rounded-full font-normal text-sm border transition-colors cursor-pointer hover:bg-black/10"
              style={{ backgroundColor: 'transparent', color: `${themeColor}40`, borderColor: `${themeColor}20` }}
            >
              Start Sound
            </button>
            <button 
              onClick={() => tenSecSoundRef.current?.play().catch(e => console.log("Audio play prevented"))}
              className="px-4 py-1.5 rounded-full font-normal text-sm border transition-colors cursor-pointer hover:bg-black/10"
              style={{ backgroundColor: 'transparent', color: `${themeColor}40`, borderColor: `${themeColor}20` }}
            >
              10 Sec Sound
            </button>
            <button 
              onClick={() => endSoundRef.current?.play().catch(e => console.log("Audio play prevented"))}
              className="px-4 py-1.5 rounded-full font-normal text-sm border transition-colors cursor-pointer hover:bg-black/10"
              style={{ backgroundColor: 'transparent', color: `${themeColor}40`, borderColor: `${themeColor}20` }}
            >
              End Sound
            </button>
            <button 
              onClick={resetTimer}
              className="px-4 py-1.5 rounded-full font-medium text-sm border transition-colors cursor-pointer hover:bg-red-50"
              style={{ backgroundColor: 'transparent', color: `${themeColor}40`, borderColor: `${themeColor}20` }}
            >
              RESET
            </button>
          </div>
        </div>

      </div>

      {/* BOTTOM FOOTER */}
      <div className="w-full flex justify-between items-center p-6 text-sm font-semibold relative z-10 opacity-80" style={{ color: themeColor }}>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faGlobe} className="w-4 h-4" />
          www.bicolunibe.com
        </div>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
          bu-unibe@bicol-u.edu.ph
        </div>
        <div className="flex gap-4">
          <span>FB: The Bicol Universitarian</span>
          <span>X / IG: @bicolunibe</span>
        </div>
      </div>
    </div>
  );
}