"use client";

import { cn } from "@/lib/utils";
import React, {
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { createNoise3D } from "simplex-noise";

type WavyBackgroundProps = {
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
};

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth = 50,
  backgroundFill = "black",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: PropsWithChildren<WavyBackgroundProps>) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const noise = useRef(createNoise3D());
  const animationIdRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  const getSpeed = () => {
    return speed === "fast" ? 0.002 : 0.001;
  };

  const drawWave = (count: number, width: number, height: number) => {
    timeRef.current += getSpeed();
    const ctx = ctxRef.current;
    if (!ctx) return;

    const waveColors = colors ?? [
      "#38bdf8",
      "#818cf8",
      "#c084fc",
      "#e879f9",
      "#22d3ee",
    ];

    for (let i = 0; i < count; i++) {
      ctx.beginPath();
      ctx.lineWidth = waveWidth;
      ctx.strokeStyle = waveColors[i % waveColors.length];

      for (let x = 0; x < width; x += 5) {
        const y = noise.current(x / 800, 0.3 * i, timeRef.current) * 100;
        ctx.lineTo(x, y + height * 0.5);
      }

      ctx.stroke();
      ctx.closePath();
    }
  };

  const render = (width: number, height: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.fillStyle = backgroundFill;
    ctx.globalAlpha = waveOpacity;
    ctx.fillRect(0, 0, width, height);

    drawWave(5, width, height);
    animationIdRef.current = requestAnimationFrame(() => render(width, height));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctxRef.current = ctx;
    ctx.filter = `blur(${blur}px)`;

    const resizeCanvas = () => {
      const width = (canvas.width = window.innerWidth);
      const height = (canvas.height = window.innerHeight);
      ctx.filter = `blur(${blur}px)`;
      render(width, height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
    };
  });

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(
      typeof window !== "undefined" &&
        navigator.userAgent.includes("Safari") &&
        !navigator.userAgent.includes("Chrome")
    );
  }, []);

  return (
    <div
      className={cn(
        "h-screen flex flex-col items-center justify-center",
        containerClassName
      )}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      />
      <div className={cn("relative z-10", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
