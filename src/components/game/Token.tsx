
import React from "react";
import { cn } from "@/lib/utils";

interface TokenProps {
  position: { x: number; y: number };
  collected?: boolean;
  className?: string;
  size?: number;
}

const Token: React.FC<TokenProps> = ({
  position,
  collected = false,
  className,
  size = 30,
}) => {
  return (
    <div
      className={cn(
        "absolute transition-all duration-300",
        collected ? "scale-150 opacity-0" : "scale-100 opacity-100",
        "animate-[pulse_2s_ease-in-out_infinite]",
        "glow-yellow",
        className
      )}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        width: size,
        height: size,
      }}
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="50"
          cy="50"
          r="40"
          className="fill-space-nova-yellow"
          opacity="0.8"
        />
        <path
          d="M50 20 L60 40 L80 45 L65 60 L70 80 L50 70 L30 80 L35 60 L20 45 L40 40 Z"
          className="fill-yellow-400"
        />
        <circle cx="50" cy="50" r="15" className="fill-white" opacity="0.6" />
      </svg>
    </div>
  );
};

export default Token;
