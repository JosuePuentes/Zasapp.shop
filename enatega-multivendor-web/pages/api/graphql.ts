import type { NextApiRequest, NextApiResponse } from "next";

const getBackendUrl = (): string => {
  const base =
    (process.env.NEXT_PUBLIC_SERVER_URL || "").replace(/\/graphql\/?$/, "").replace(/\/?$/, "") ||
    (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/graphql\/?$/, "").replace(/\/?$/, "");
  return base ? `${base}/graphql` : "";
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backendUrl = getBackendUrl();
  if (!backendUrl) {
    return res.status(500).json({ errors: [{ message: "GraphQL backend URL not configured" }] });
  }

  const headers: Record<string, string> = {
    "content-type": req.headers["content-type"] || "application/json",
  };
  if (req.headers.authorization) headers["authorization"] = req.headers.authorization as string;
  if (req.headers.userid) headers["userid"] = req.headers.userid as string;
  if (req.headers.isauth) headers["isauth"] = req.headers.isauth as string;
  if (req.headers["x-client-type"]) headers["x-client-type"] = req.headers["x-client-type"] as string;

  try {
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
      const response = await fetch(backendUrl, {
        method: "POST",
        headers,
        body,
      });
      const data = await response.text();
      res.setHeader("content-type", response.headers.get("content-type") || "application/json");
      res.status(response.status).send(data);
      return;
    }
    if (req.method === "GET") {
      const url = new URL(backendUrl);
      if (typeof req.query.query === "string") url.searchParams.set("query", req.query.query);
      if (typeof req.query.variables === "string") url.searchParams.set("variables", req.query.variables);
      const response = await fetch(url.toString(), { method: "GET", headers });
      const data = await response.text();
      res.setHeader("content-type", response.headers.get("content-type") || "application/json");
      res.status(response.status).send(data);
      return;
    }
    res.setHeader("Allow", "GET, POST");
    res.status(405).end();
  } catch (e) {
    console.error("GraphQL proxy error:", e);
    res.status(502).json({ errors: [{ message: "Proxy request failed" }] });
  }
}
