import { useEffect, useRef } from 'react';

interface SpectraNoiseProps {
  noiseIntensity?: number;
  scanlineIntensity?: number;
  scanlineDensity?: number;
  hueShift?: number;
  animationSpeed?: number;
  warpAmount?: number;
  opacity?: number;
}

export default function SpectraNoise({
  noiseIntensity   = 0.055,
  scanlineIntensity = 0.035,
  scanlineDensity  = 4,
  animationSpeed   = 0.8,
  warpAmount       = 0.012,
  opacity          = 1,
}: SpectraNoiseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const timeRef   = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const noiseSize  = 256;
    const noiseData  = new Uint8Array(noiseSize * noiseSize);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.floor(Math.random() * 255);
    }

    function generateNoise(imageData: ImageData, time: number) {
      const data = imageData.data;
      const w    = imageData.width;
      const h    = imageData.height;

      for (let y = 0; y < h; y += 2) {
        for (let x = 0; x < w; x += 2) {
          const wx = (x + Math.sin((y + time * 40) * 0.03) * warpAmount * 30) | 0;
          const wy = (y + Math.cos((x + time * 30) * 0.03) * warpAmount * 20) | 0;

          const ni    = ((wx + (time * animationSpeed * 80 | 0)) % noiseSize + noiseSize) % noiseSize;
          const nj    = ((wy + (time * animationSpeed * 60 | 0)) % noiseSize + noiseSize) % noiseSize;
          const noise = noiseData[(nj % noiseSize) * noiseSize + (ni % noiseSize)];

          const idx = (y * w + x) * 4;

          const r = noise * noiseIntensity * 0.4;
          const g = noise * noiseIntensity * 1.0;
          const b = noise * noiseIntensity * 0.5;

          data[idx]     = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = noise * noiseIntensity * 180;

          if (x + 1 < w) {
            data[idx + 4] = r; data[idx + 5] = g; data[idx + 6] = b; data[idx + 7] = data[idx + 3];
          }
          if (y + 1 < h) {
            const idx2 = ((y+1) * w + x) * 4;
            data[idx2] = r; data[idx2+1] = g; data[idx2+2] = b; data[idx2+3] = data[idx+3];
            if (x + 1 < w) {
              data[idx2+4] = r; data[idx2+5] = g; data[idx2+6] = b; data[idx2+7] = data[idx+3];
            }
          }
        }
      }
    }

    function drawScanlines(time: number) {
      const w = canvas.width;
      const h = canvas.height;
      const lineSpacing = scanlineDensity;
      const scrollOffset = (time * animationSpeed * 60) % lineSpacing;

      ctx.fillStyle = `rgba(0, 0, 0, ${scanlineIntensity})`;
      for (let y = -scrollOffset; y < h; y += lineSpacing) {
        ctx.fillRect(0, y, w, 1);
      }

      if (Math.random() < 0.003) {
        const flashY = Math.random() * h;
        ctx.fillStyle = `rgba(0, 230, 122, 0.06)`;
        ctx.fillRect(0, flashY, w, 1);
      }
    }

    let imageData: ImageData | null = null;

    function render(timestamp: number) {
      timeRef.current = timestamp * 0.001;
      const time      = timeRef.current;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (!imageData || imageData.width !== w || imageData.height !== h) {
        imageData = ctx.createImageData(w, h);
      }
      generateNoise(imageData, time);
      ctx.putImageData(imageData, 0, 0);

      drawScanlines(time);

      const vigAlpha = 0.15 + Math.sin(time * 0.5) * 0.03;
      const gradient = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.9);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${vigAlpha})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [noiseIntensity, scanlineIntensity, scanlineDensity, animationSpeed, warpAmount]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        2,
        pointerEvents: 'none',
        opacity,
        mixBlendMode:  'screen',
      }}
      aria-hidden="true"
    />
  );
}
