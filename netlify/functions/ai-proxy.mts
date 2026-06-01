const ARK_CHAT_COMPLETIONS_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
const DEFAULT_DOUBAO_MODEL = "doubao-seed-2-0-lite-260215";

function getEnv(name) {
  return globalThis.Netlify?.env?.get?.(name) || "";
}

function getCorsHeaders(req) {
  const requestOrigin = new URL(req.url).origin;
  const origin = req.headers.get("Origin");

  return {
    "Access-Control-Allow-Origin": origin === requestOrigin ? origin : requestOrigin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function isAllowedOrigin(req) {
  const origin = req.headers.get("Origin");
  return !origin || origin === new URL(req.url).origin;
}

function jsonResponse(req, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(req),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export default async (req) => {
  if (!isAllowedOrigin(req)) {
    return jsonResponse(req, { message: "Origin not allowed" }, 403);
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse(req, { message: "Method not allowed" }, 405);
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse(req, { message: "Invalid JSON body" }, 400);
  }

  if (payload.provider !== "doubao") {
    return jsonResponse(req, { message: "Unsupported provider" }, 400);
  }

  const apiKey = (payload.apiKey || getEnv("ARK_API_KEY") || "").trim();
  if (!apiKey) {
    return jsonResponse(req, { message: "Missing Doubao / Ark API Key" }, 400);
  }

  const userPrompt = (payload.userPrompt || "").trim();
  if (!userPrompt) {
    return jsonResponse(req, { message: "Missing user prompt" }, 400);
  }

  const upstream = await fetch(ARK_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: payload.model || DEFAULT_DOUBAO_MODEL,
      max_tokens: 1000,
      stream: true,
      messages: [
        { role: "system", content: payload.systemPrompt || "" },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!upstream.ok) {
    const errorText = await upstream.text().catch(() => "");
    return jsonResponse(req, {
      message: "Doubao request failed",
      error: errorText || `HTTP ${upstream.status}`,
    }, upstream.status);
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      ...getCorsHeaders(req),
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
};

export const config = {};
