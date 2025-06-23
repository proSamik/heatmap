"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <main>
      <div
        className={cn(
          "relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden -z-10">
          {/* Primary Aurora Layer */}
          <div
            className="absolute inset-0 opacity-60 pointer-events-none"
            style={{
              background: `
                repeating-linear-gradient(
                  100deg,
                  rgba(59, 130, 246, 0.03) 0%,
                  rgba(59, 130, 246, 0.08) 7%,
                  transparent 10%,
                  transparent 12%,
                  rgba(59, 130, 246, 0.03) 16%
                ),
                repeating-linear-gradient(
                  100deg,
                  rgba(139, 92, 246, 0.1) 10%,
                  rgba(99, 102, 241, 0.08) 15%,
                  rgba(59, 130, 246, 0.06) 20%,
                  rgba(196, 181, 253, 0.04) 25%,
                  rgba(59, 130, 246, 0.08) 30%
                )
              `,
              backgroundSize: "300% 200%",
              animation: "aurora 60s linear infinite",
              filter: "blur(1px)",
            }}
          ></div>
          
          {/* Secondary Aurora Layer */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background: `
                repeating-linear-gradient(
                  80deg,
                  rgba(147, 51, 234, 0.08) 0%,
                  rgba(236, 72, 153, 0.06) 10%,
                  rgba(59, 130, 246, 0.04) 20%,
                  rgba(34, 211, 238, 0.06) 30%,
                  rgba(99, 102, 241, 0.08) 40%
                )
              `,
              backgroundSize: "400% 300%",
              animation: "aurora-slow 80s ease-in-out infinite",
              mixBlendMode: "overlay",
            }}
          ></div>

          {/* Subtle gradient overlay */}
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at top, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
            }}
          ></div>
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </main>
  );
};
