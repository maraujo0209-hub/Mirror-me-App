'use client';

import React, { useEffect, useRef, useState } from 'react';

interface WaveformVisualizerProps {
  stream?: MediaStream | null;
  isProcessing?: boolean;
  color?: string;
}

export default function WaveformVisualizer({
  stream = null,
  isProcessing = false,
  color = '#4f46e5', // Default Indigo-600
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const [isAudioActive, setIsAudioActive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays by matching canvas backing store pixel layouts
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize Web Audio API elements if an active microphone stream is provided
    if (stream) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256; // High frequency resolution mapping

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        sourceRef.current = source;
        setIsAudioActive(true);
      } catch (err) {
        console.error('Failed to initialize Web Audio API hardware layers:', err);
      }
    } else {
      setIsAudioActive(false);
    }

    // Main Canvas Render Lifecycle Loop
    const renderFrame = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Clear canvas with a solid background matching slate-950
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      const bufferLength = analyserRef.current ? analyserRef.current.frequencyBinCount : 64;
      const dataArray = new Uint8Array(bufferLength);

      if (analyserRef.current && isAudioActive) {
        // Extract real-time frequency data from live microphone stream
        analyserRef.current.getByteFrequencyData(dataArray);
      } else if (isProcessing) {
        // Simulate a rolling sine wave matrix if backend is running an active generation task
        const timestamp = Date.now() * 0.008;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.abs(Math.sin(i * 0.15 + timestamp)) * 120 + Math.random() * 20;
        }
      } else {
        // Render a flat baseline when entirely idle
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = 4; 
        }
      }

      // Draw symmetric audio bars extending from the vertical center baseline
      const barWidth = (width / bufferLength) * 1.6;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // Normalize value multiplier relative to element height boundaries
        const percent = dataArray[i] / 255;
        const barHeight = Math.max(4, percent * height * 0.85);
        
        // Vertically center the bars
        const y = (height - barHeight) / 2;

        // Apply a gentle gradient falloff profile
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 2, barHeight, 4);
        ctx.fill();

        x += barWidth;
      }

      animationRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    // Cleanup runtime listeners and safely close hardware tracks on unmount
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stream, isProcessing, isAudioActive, color]);

  return (
    <div className="w-full bg-slate-950 rounded-2xl border border-slate-800 p-4 shadow-inner flex flex-col justify-center">
      <canvas 
        ref={canvasRef} 
        className="w-full h-24 bg-transparent rounded-lg"
      />
    </div>
  );
}
