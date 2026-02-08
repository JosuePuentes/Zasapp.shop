"use client";

import dynamic from "next/dynamic";

const B2BComparativeScreen = dynamic(
  () => import("@/lib/ui/screens/protected/home").then((mod) => mod.B2BComparativeScreen),
  { ssr: false }
);

export default function B2BComparativePage() {
  return <B2BComparativeScreen />;
}
