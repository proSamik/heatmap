"use client";
import React, { useEffect, useRef, useState } from "react";

export const GlowingStarsBackgroundCard = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`h-96 w-full rounded-xl border border-[#eaeaea] dark:border-neutral-600 bg-[linear-gradient(110deg,#333_0.6%,#222)] p-8 ${className}`}
    >
      <div className="flex justify-center items-center">
        <Illustration mousePosition={mousePosition} />
      </div>
      <div className="px-2 pb-6">{children}</div>
    </div>
  );
};

export const GlowingStarsTitle = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <h3 className={`text-base font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
};

export const GlowingStarsDescription = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={`text-base max-w-[16rem] text-white mt-2 mb-2 ${className}`}
    >
      {children}
    </p>
  );
};

export const Illustration = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => {
  const stars = 108;
  const columns = 18;

  const [glowingStars, setGlowingStars] = useState<number[]>([]);

  const highlightStars = () => {
    const highlights = [
      29, 41, 43, 27, 35, 39, 37, 49, 51, 63, 65, 85, 87,
    ];
    setGlowingStars([...highlights]);
  };

  const removeHighlights = () => {
    setGlowingStars([]);
  };

  useEffect(() => {
    const interval = setInterval(highlightStars, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="h-48 p-1 w-full"
      style={{
        background:
          "linear-gradient(90deg, rgba(2,0,36,0) 0%, rgba(59,130,246,0.3) 50%, rgba(2,0,36,0) 100%)",
      }}
    >
      <div
        className="w-full h-full svg-container z-10"
        style={{
          position: "relative",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 900 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full z-10"
        >
          <defs>
            <radialGradient
              id={`glowGradient`}
              cx="50%"
              cy="50%"
              r="50%"
              fx={`${(mousePosition.x / 400) * 100}%`}
              fy={`${(mousePosition.y / 400) * 100}%`}
            >
              <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
            </radialGradient>
          </defs>
          {[...Array(stars)].map((_, starIdx) => {
            const isGlowing = glowingStars.includes(starIdx);
            const delay = (starIdx % 10) * 0.1;
            const staticDelay = starIdx * 0.01;
            return (
              <circle
                key={starIdx}
                cx={18 + (starIdx % columns) * 50}
                cy={18 + Math.floor(starIdx / columns) * 50}
                r="2"
                fill={isGlowing ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)"}
                style={{
                  animation: isGlowing
                    ? `glow 2s ease-in-out infinite ${delay}s`
                    : `twinkle 4s ease-in-out infinite ${staticDelay}s`,
                }}
              ></circle>
            );
          })}
        </svg>
      </div>
    </div>
  );
}; 