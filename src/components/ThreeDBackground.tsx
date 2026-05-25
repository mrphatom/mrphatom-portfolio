import { useEffect, useRef } from 'react';

export default function ThreeDBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const tiltRef = useRef({ alpha: 0, beta: 0, targetAlpha: 0, targetBeta: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resize responsiveness
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Track mouse coordinates for interactive mouse 3D parallax shifts
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX - window.innerWidth / 2) / 60;
      mouseRef.current.targetY = (e.clientY - window.innerHeight / 2) / 60;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Device orientation for mobile/tablet 3D parallax steering
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        tiltRef.current.targetAlpha = e.gamma / 5; // horizontal steer
        tiltRef.current.targetBeta = (e.beta - 45) / 5; // vertical steer
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);

    // Set up elegant particles & orbit rings
    interface Shape {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      orbitRadius: number;
      orbitSpeed: number;
      angle: number;
      depth: number; // 3D depth multiplier
    }

    const shapes: Shape[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1.5,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.3 + 0.1,
      orbitRadius: Math.random() * 120 + 40,
      orbitSpeed: (Math.random() - 0.5) * 0.002,
      angle: Math.random() * Math.PI * 2,
      depth: Math.random() * 0.8 + 0.2, // items further away move slower (high depth concept)
    }));

    let basePulse = 0;

    const render = () => {
      // Clear with very slight transparency to prevent trails while staying snappy
      ctx.clearRect(0, 0, width, height);

      // Interpolate coordinates for buttery smooth, dampened cursor & orientation responses
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      tiltRef.current.alpha += (tiltRef.current.targetAlpha - tiltRef.current.alpha) * 0.05;
      tiltRef.current.beta += (tiltRef.current.targetBeta - tiltRef.current.beta) * 0.05;

      // Combine interactive offsets (mouse + gyroscope device sensors + automated sinus breathing cycle)
      basePulse += 0.003;
      const autoOscillatorX = Math.sin(basePulse) * 4;
      const autoOscillatorY = Math.cos(basePulse * 1.3) * 3;

      const parallaxX = mouseRef.current.x + tiltRef.current.alpha + autoOscillatorX;
      const parallaxY = mouseRef.current.y + tiltRef.current.beta + autoOscillatorY;

      // Draw standard blueprint style thin concentric grids or reference dots (super premium detail)
      ctx.strokeStyle = document.documentElement.classList.contains('dark')
        ? 'rgba(255, 255, 255, 0.015)'
        : 'rgba(0, 0, 0, 0.02)';
      ctx.lineWidth = 1;

      // Main focal orbital field lines
      const centerX = width / 2 + parallaxX * 2.5;
      const centerY = height / 2 + parallaxY * 2.5;

      ctx.beginPath();
      ctx.arc(centerX, centerY, 300, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 520, 0, Math.PI * 2);
      ctx.stroke();

      // Render shapes
      shapes.forEach((shape) => {
        // Animate automatic orbit drifting
        shape.angle += shape.orbitSpeed;
        shape.x += shape.speedX;
        shape.y += shape.speedY;

        // Warp bounds check to loop elements
        if (shape.x < -100) shape.x = width + 100;
        if (shape.x > width + 100) shape.x = -100;
        if (shape.y < -100) shape.y = height + 100;
        if (shape.y > height + 100) shape.y = -100;

        // Apply 3D perspective displacement based on depth layer
        const offsetX = parallaxX * 8 * shape.depth;
        const offsetY = parallaxY * 8 * shape.depth;

        // Calculate current render position with added interactive and orbiting values
        const finalX = shape.x + Math.cos(shape.angle) * (shape.orbitRadius * 0.1) + offsetX;
        const finalY = shape.y + Math.sin(shape.angle) * (shape.orbitRadius * 0.1) + offsetY;

        // Establish relative color themes inside canvas natively
        const isDark = document.documentElement.classList.contains('dark');
        const gradient = ctx.createRadialGradient(finalX, finalY, 0, finalX, finalY, shape.size * 3);
        
        if (isDark) {
          gradient.addColorStop(0, `rgba(255, 255, 255, ${shape.alpha})`);
          gradient.addColorStop(0.4, `rgba(186, 230, 253, ${shape.alpha * 0.4})`); // subtle sky tint
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          gradient.addColorStop(0, `rgba(0, 0, 0, ${shape.alpha})`);
          gradient.addColorStop(0.4, `rgba(59, 130, 246, ${shape.alpha * 0.3})`); // subtle blue tint
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(finalX, finalY, shape.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw soft orbital trails connecting shapes dynamically to focus coordinates
        if (shape.depth > 0.6) {
          ctx.beginPath();
          ctx.moveTo(finalX, finalY);
          ctx.lineTo(centerX + (finalX - centerX) * 0.96, centerY + (finalY - centerY) * 0.96);
          ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${shape.alpha * 0.08})` : `rgba(0, 0, 0, ${shape.alpha * 0.06})`;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('deviceorientation', handleOrientation);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[-1] opacity-90 dark:opacity-45"
    />
  );
}
