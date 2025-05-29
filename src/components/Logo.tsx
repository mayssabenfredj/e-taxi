
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className = "h-8 w-auto", showText = true }: LogoProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <div className="w-10 h-10 bg-gradient-to-br from-etaxi-yellow to-yellow-400 rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-black font-bold text-lg">E</span>
        </div>
      </div>
      {showText && (
        <span className="text-2xl font-bold">
          <span className="text-etaxi-yellow">E</span>
          <span className="text-foreground">TAXI</span>
        </span>
      )}
    </div>
  );
}
