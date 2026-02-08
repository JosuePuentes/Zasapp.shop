"use client";

import dynamic from "next/dynamic";

const ProductsMarketplaceScreen = dynamic(
  () => import("@/lib/ui/screens/protected/home").then((mod) => mod.ProductsMarketplaceScreen),
  { ssr: false }
);

export default function ProductsPage() {
  return <ProductsMarketplaceScreen />;
}
