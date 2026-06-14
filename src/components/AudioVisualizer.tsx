'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  className?: string;
  isActive?: boolean;
}

interface Shape {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: { r: number; g: number; b: number };
  type: 'triangle' | 'circle' | 'square' | 'hexagon';
  opacity: number;
  life: number;
  speed: number;
  vx: number;
  vy: number;
}

export function AudioVisualizer({ className = '', isActive = true }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const shapesRef = useRef<Shape[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      // Recreate shapes on resize
      const { width, height } = { width: rect.width, height: rect.height };
      const shapeCount = 8;
      shapesRef.current = createShapes(shapeCount, width, height);
    };

    // Color palette
    const colors = [
      { r: 234, g: 179, b: 8 },   // yellowish
      { r: 99, g: 102, b: 241 },  // indigo
      { r: 6, g: 182, b: 212 },   // cyan
      { r: 239, g: 68, b: 68 },   // red
      { r: 139, g: 92, b: 246 },  // violet
    ];

    const shapeTypes: Shape['type'][] = ['triangle', 'circle', 'square', 'hexagon'];

    // Create geometric shapes
    const createShapes = (count: number, width: number, height: number): Shape[] => {
      return Array.from({ length: count }, () => {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.01 + Math.random() * 0.02;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: 15 + Math.random() * 25,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          color,
          type,
          opacity: 0,
          life: Math.random(),
          speed: 0.15 + Math.random() * 0.25,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
        };
      });
    };

    // Draw triangle
    const drawTriangle = (x: number, y: number, size: number, rotation: number) => {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const angle = (Math.PI * 2 / 3) * i + rotation;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    // Draw hexagon
    const drawHexagon = (x: number, y: number, size: number, rotation: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i + rotation;
        const px = x + Math.cos(angle) * size;
        const py = y + Math.sin(angle) * size;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    // Draw square
    const drawSquare = (x: number, y: number, size: number, rotation: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.beginPath();
      ctx.rect(-size / 2, -size / 2, size, size);
      ctx.restore();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      if (!isActive) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update time
      timeRef.current += 0.008;

      // Update shapes
      shapesRef.current.forEach((shape) => {
        // Update life cycle (fade in/out)
        shape.life += shape.speed * 0.008;
        
        // Reset shape when it completes its cycle
        if (shape.life > 1) {
          shape.life = 0;
          shape.x = Math.random() * width;
          shape.y = Math.random() * height;
          shape.color = colors[Math.floor(Math.random() * colors.length)];
          shape.type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
          shape.size = 15 + Math.random() * 25;
        }

        // Update position
        shape.x += shape.vx;
        shape.y += shape.vy;

        // Wrap around edges
        if (shape.x < -shape.size) shape.x = width + shape.size;
        if (shape.x > width + shape.size) shape.x = -shape.size;
        if (shape.y < -shape.size) shape.y = height + shape.size;
        if (shape.y > height + shape.size) shape.y = -shape.size;

        // Update rotation
        shape.rotation += shape.rotationSpeed;

        // Calculate opacity with smooth easing
        let opacity = 0;
        const fadeInDuration = 0.2;
        const fadeOutDuration = 0.2;
        
        if (shape.life < fadeInDuration) {
          opacity = shape.life / fadeInDuration;
        } else if (shape.life < 1 - fadeOutDuration) {
          opacity = 1;
        } else {
          opacity = (1 - shape.life) / fadeOutDuration;
        }

        // Draw shape
        ctx.save();
        ctx.globalAlpha = opacity * 0.18; // Subtle background
        
        const colorRgba = `rgba(${shape.color.r}, ${shape.color.g}, ${shape.color.b}, ${opacity * 0.18})`;
        ctx.fillStyle = colorRgba;
        ctx.strokeStyle = colorRgba;
        ctx.lineWidth = 1;

        switch (shape.type) {
          case 'triangle':
            drawTriangle(shape.x, shape.y, shape.size, shape.rotation);
            ctx.fill();
            break;
          case 'circle':
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'square':
            drawSquare(shape.x, shape.y, shape.size, shape.rotation);
            ctx.fill();
            break;
          case 'hexagon':
            drawHexagon(shape.x, shape.y, shape.size / 1.5, shape.rotation);
            ctx.fill();
            break;
        }

        ctx.restore();
      });

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}

