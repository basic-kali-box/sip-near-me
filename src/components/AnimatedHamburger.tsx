import React from "react";

interface AnimatedHamburgerIconProps {
  isOpen?: boolean;
  size?: number; // pixel size of the square icon
  strokeWidth?: number; // thickness of the lines
  className?: string;
}

/**
 * Animated hamburger icon that morphs into an "X" when open.
 * Pure CSS transforms for smooth 60fps animation.
 */
export function AnimatedHamburgerIcon({
  isOpen = false,
  size = 24,
  strokeWidth = 2,
  className,
}: AnimatedHamburgerIconProps) {
  const lineClass =
    "absolute left-1/2 -translate-x-1/2 h-[var(--stroke)] w-[calc(var(--size)-6px)] bg-current rounded-full transition-transform duration-300 ease-out will-change-transform";

  const style: React.CSSProperties = {
    // Using CSS variables lets us keep Tailwind-friendly classes while being flexible
    // with exact size without adding many class variants.
    // @ts-ignore - CSS variables are fine
    "--size": `${size}px`,
    // @ts-ignore
    "--stroke": `${strokeWidth}px`,
  } as React.CSSProperties;

  return (
    <div
      aria-hidden
      className={`relative inline-block text-current ${isOpen ? "hamburger-open" : ""} ${className ?? ""}`}
      style={{ width: size, height: size, ...style }}
    >
      {/* Top line */}
      <span
        className={`${lineClass}`}
        style={{ top: size * 0.3 }}
      />
      {/* Middle line */}
      <span
        className={`${lineClass} transition-opacity`}
        style={{ top: size * 0.5, opacity: isOpen ? 0 : 1 }}
      />
      {/* Bottom line */}
      <span
        className={`${lineClass}`}
        style={{ top: size * 0.7 }}
      />

      {/* Open state transforms */}
      <style>{`
        .hamburger-open span:first-child {
          transform: translateX(-50%) translateY(${-(size * 0.2)}px) rotate(45deg);
        }
        .hamburger-open span:last-child {
          transform: translateX(-50%) translateY(${size * 0.2}px) rotate(-45deg);
        }
      `}</style>

    </div>
  );
}
