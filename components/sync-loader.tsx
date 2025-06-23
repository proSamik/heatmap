"use client";
import React, { useState, useEffect } from "react";
import { MultiStepLoader } from "./ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";

// Pool of inspirational quotes to randomize from
const inspirationalQuotes = [
  "💪 \"We are what we repeatedly do. Excellence is a habit\" - Aristotle",
  "🚀 \"The secret of getting ahead is getting started\" - Mark Twain", 
  "⭐ \"Your habits will determine your future\" - Jack Canfield",
  "🔥 \"Discipline is freedom\" - Jocko Willink",
  "🌟 \"Success is the sum of small efforts repeated daily\" - Robert Collier",
  "✨ \"The only impossible journey is the one you never begin\" - Tony Robbins",
];

// Function to get randomized syncing states based on a seed
const getSyncingStates = (seed = Date.now()) => {
  // Use a simple deterministic randomization based on seed
  const quote1Index = seed % inspirationalQuotes.length;
  const quote2Index = (seed + 1) % inspirationalQuotes.length;
  
  return [
    { text: "🔄 Initializing transformation journey..." },
    { text: inspirationalQuotes[quote1Index] },
    { text: "📊 Syncing GitHub contributions..." },
    { text: "🎥 Fetching YouTube data..." },
    { text: inspirationalQuotes[quote2Index] },
    { text: "🎨 Rendering your heatmaps..." },
    { text: "✅ Ready to change your life!" },
  ];
};

interface SyncLoaderProps {
  loading: boolean;
  onComplete?: () => void;
  duration?: number;
}

/**
 * Enhanced sync loader component that shows syncing states with inspirational quotes
 * to motivate users while their habit data is being processed
 */
export function SyncLoader({ loading, onComplete, duration = 1500 }: SyncLoaderProps) {
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [syncingStates, setSyncingStates] = useState<{ text: string }[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Ensure this only runs on the client to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
    setSyncingStates(getSyncingStates()); // Generate states only on client
  }, []);

  useEffect(() => {
    if (loading) {
      // Show close button after all states have been shown
      const totalDuration = syncingStates.length * duration;
      const timer = setTimeout(() => {
        setShowCloseButton(true);
        if (onComplete) {
          onComplete();
        }
      }, totalDuration);

      return () => clearTimeout(timer);
    } else {
      setShowCloseButton(false);
    }
  }, [loading, duration, onComplete, syncingStates.length]);

  // Show a simple loading state until client-side states are ready
  if (!isClient || syncingStates.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">🔄 Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MultiStepLoader 
        loadingStates={syncingStates} 
        loading={loading} 
        duration={duration}
        loop={false}
      />

      {loading && showCloseButton && (
        <button
          className="fixed top-4 right-4 text-white hover:text-gray-300 z-[120] transition-colors"
          onClick={() => {
            if (onComplete) {
              onComplete();
            }
          }}
          title="Close loading screen"
        >
          <IconSquareRoundedX className="h-10 w-10" />
        </button>
      )}
    </>
  );
} 