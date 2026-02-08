"use client";

import React from "react";

export interface StoreBadgeProps {
  publicName: string;
  brandColor: string;
  /** Small dot-only variant for search results */
  dotOnly?: boolean;
  /** Optional glow/border for selected state */
  highlight?: boolean;
  className?: string;
}

const COLOR_NAMES: Record<string, string> = {
  "#22c55e": "Verde",
  "#3b82f6": "Azul",
  "#f97316": "Naranja",
  "#8b5cf6": "Violeta",
  "#ec4899": "Rosa",
  "#14b8a6": "Turquesa",
  "#eab308": "Amarillo",
  "#ef4444": "Rojo",
  "#06b6d4": "Cian",
  "#84cc16": "Lima",
};

export function getColorName(hex: string): string {
  const n = hex?.toLowerCase();
  return COLOR_NAMES[n] || Object.entries(COLOR_NAMES).find(([h]) => h.toLowerCase() === n)?.[1] || "Zas!";
}

export default function StoreBadge({ publicName, brandColor, dotOnly, highlight, className = "" }: StoreBadgeProps) {
  const color = brandColor || "#22c55e";
  if (dotOnly) {
    return (
      <span
        className={`inline-flex items-center shrink-0 ${className}`}
        title={publicName}
      >
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderWidth: highlight ? 2 : 0,
        borderStyle: "solid",
        borderColor: color,
      }}
    >
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {publicName}
    </span>
  );
}
