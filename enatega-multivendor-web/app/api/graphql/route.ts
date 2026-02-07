import { NextRequest, NextResponse } from "next/server";

const GRAPHQL_BACKEND = (process.env.NEXT_PUBLIC_SERVER_URL || "").replace(
  /\/?$/,
  "/"
);
const BACKEND_GRAPHQL_URL = `${GRAPHQL_BACKEND}graphql`;

function getForwardHeaders(req: NextRequest): HeadersInit {
  const headers: Record<string, string> = {
    "content-type": req.headers.get("content-type") || "application/json",
  };
  const auth = req.headers.get("authorization");
  if (auth) headers["authorization"] = auth;
  const userId = req.headers.get("userid");
  if (userId) headers["userid"] = userId;
  const isAuth = req.headers.get("isauth");
  if (isAuth) headers["isauth"] = isAuth;
  const clientType = req.headers.get("x-client-type");
  if (clientType) headers["x-client-type"] = clientType;
  return headers;
}

export async function POST(req: NextRequest) {
  if (!BACKEND_GRAPHQL_URL || BACKEND_GRAPHQL_URL === "graphql") {
    return NextResponse.json(
      { errors: [{ message: "GraphQL backend URL not configured" }] },
      { status: 500 }
    );
  }
  try {
    const body = await req.text();
    const res = await fetch(BACKEND_GRAPHQL_URL, {
      method: "POST",
      headers: getForwardHeaders(req),
      body: body || undefined,
    });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (e) {
    console.error("GraphQL proxy error:", e);
    return NextResponse.json(
      { errors: [{ message: "Proxy request failed" }] },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  if (!BACKEND_GRAPHQL_URL || BACKEND_GRAPHQL_URL === "graphql") {
    return NextResponse.json(
      { errors: [{ message: "GraphQL backend URL not configured" }] },
      { status: 500 }
    );
  }
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const variables = searchParams.get("variables");
    const url = new URL(BACKEND_GRAPHQL_URL);
    if (query) url.searchParams.set("query", query);
    if (variables) url.searchParams.set("variables", variables);
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: getForwardHeaders(req),
    });
    const data = await res.text();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (e) {
    console.error("GraphQL proxy error:", e);
    return NextResponse.json(
      { errors: [{ message: "Proxy request failed" }] },
      { status: 502 }
    );
  }
}
