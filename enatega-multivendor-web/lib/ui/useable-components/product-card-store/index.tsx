"use client";

import React from "react";
import Image from "next/image";
import StoreBadge from "@/lib/ui/useable-components/store-badge";

export interface ProductWithStore {
  _id: string;
  name: string;
  price: number;
  image?: string;
  store?: {
    _id: string;
    publicName?: string;
    brandColor?: string;
    name?: string;
  } | null;
}

export interface ProductCardStoreProps {
  product: ProductWithStore;
  storeColor?: string;
  storePublicName?: string;
  /** Highlight with store color border/glow */
  highlight?: boolean;
  onClick?: () => void;
  currencySymbol?: string;
  /** Tasa BCV del día: si se pasa, se muestra precio dual $ y Bs */
  rateBcv?: number | null;
  className?: string;
}

export default function ProductCardStore({
  product,
  storeColor,
  storePublicName,
  highlight,
  onClick,
  currencySymbol = "$",
  rateBcv,
  className = "",
}: ProductCardStoreProps) {
  const publicName = storePublicName || product.store?.publicName || product.store?.name || "Tienda";
  const color = storeColor || product.store?.brandColor || "#22c55e";
  const priceUsd = product.price ?? 0;
  const priceBs = rateBcv != null && rateBcv > 0 ? priceUsd * rateBcv : null;

  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-lg overflow-hidden bg-white dark:bg-gray-800 border-2 transition-all ${
        highlight ? "shadow-md" : "border-gray-200 dark:border-gray-700"
      } ${onClick ? "cursor-pointer hover:shadow-lg" : ""} ${className}`}
      style={
        highlight
          ? { borderColor: color, boxShadow: `0 0 0 1px ${color}, 0 4px 14px ${color}30` }
          : undefined
      }
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
            {product.name}
          </span>
          <StoreBadge
            publicName={publicName}
            brandColor={color}
            dotOnly
            className="mt-0.5"
          />
        </div>
        {product.image && (
          <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 mb-2">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 200px) 100vw, 200px"
            />
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <span className="text-secondary-color font-bold">{currencySymbol}{priceUsd.toFixed(2)}</span>
            {priceBs != null && (
              <span className="block text-xs text-gray-500 dark:text-gray-400">Bs {priceBs.toFixed(2)}</span>
            )}
          </div>
          <StoreBadge publicName={publicName} brandColor={color} className="text-[10px]" />
        </div>
      </div>
    </div>
  );
}
