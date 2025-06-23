"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "./ui/aurora-background";

interface AuroraWrapperProps {
  children: React.ReactNode;
}

/**
 * Aurora background wrapper component that provides animated background
 * with smooth transitions for the application content
 */
export function AuroraWrapper({ children }: AuroraWrapperProps) {
  return (
    <AuroraBackground className="min-h-screen">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col items-center justify-start w-full min-h-screen px-4 overflow-hidden scrollbar-hidden"
      >
        {children}
      </motion.div>
    </AuroraBackground>
  );
} 