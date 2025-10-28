"use client";

import React from "react";

type Props = {
  title?: string;
  subtitle?: string;
};

/**
 * BrandedLoader - Clean loading screen without any card/border styling
 * Version: 2.0 - Completely borderless design
 * Updated: Removed all card-like appearance (no borders, shadows, backgrounds, or containers)
 */
export default function BrandedLoader({ 
  title = "Loading", 
  subtitle = "Preparing your page…" 
}: Props) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-red-50 via-purple-50 to-blue-50 flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto px-8 py-12 text-center">
        {/* Triple spinner ring */}
        <div className="relative mx-auto h-16 w-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin" />
          <div className="absolute inset-1 rounded-full border-4 border-transparent border-t-purple-500 animate-[spin_1.6s_linear_infinite]" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 animate-[spin_2s_linear_infinite]" />
        </div>

        {/* Title with gradient */}
        <h3 className="text-xl font-bold bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-600">{subtitle}</p>

        {/* Animated progress bar - completely transparent track */}
        <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-transparent">
          <div className="h-full animate-[progress_1.4s_ease-in-out_infinite] bg-gradient-to-r from-red-500 via-purple-500 to-blue-500" 
               style={{ width: '40%' }} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(280%); }
        }
      `}</style>
    </div>
  );
}
