import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/health - para comprobar que las rutas API se despliegan en Vercel */
export async function GET() {
  return NextResponse.json({
    ok: true,
    api: "zasapp-web",
    timestamp: new Date().toISOString(),
  });
}
