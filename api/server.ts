import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { BRAVE_API_KEY, SESSION_ID_HEADER_NAME } from "../src/constant.js";
import {
  createMCPServer as createMCPServerWithBusinessLogic,
  SBR_WS_ENDPOINT,
} from "../src/lib/createMCPServer.js";
import { setHeaderForPostRequest } from "../utils/setHeaderForPostRequest.js";
import { setHeaderForGetRequest } from "../utils/setHeaderForGetRequest.js";
import { getChrome } from "../utils/getChrome.js";
import { BraveWeb } from "../types/type.js";
import "dotenv/config";

// const BRAVE_API_KEY = "BSAfF9d5o5VYSiYDsTjIiKoLfogH9cq";

// async function performWebSearch(
//   query: string,
//   count: number = 10,
//   offset: number = 0
// ) {
//   // checkRateLimit();
//   const url = new URL("https://api.search.brave.com/res/v1/web/search");
//   url.searchParams.set("q", query);
//   url.searchParams.set("count", count.toString()); // API limit
//   url.searchParams.set("offset", offset.toString());

//   const response = await fetch(url, {
//     headers: {
//       Accept: "application/json",
//       "Accept-Encoding": "gzip",
//       "X-Subscription-Token": BRAVE_API_KEY,
//     },
//   });

//   if (!response.ok) {
//     throw new Error(
//       `Brave API error: ${response.status} ${
//         response.statusText
//       }\n${await response.text()}`
//     );
//   }

//   const data = (await response.json()) as BraveWeb;

//   // Extract just web results
//   const results = (data.web?.results || []).map((result) => ({
//     title: result.title || "",
//     description: result.description || "",
//     url: result.url || "",
//   }));

//   return results
//     .map(
//       (r) => `Title: ${r.title}\nDescription: ${r.description}\nURL: ${r.url}`
//     )
//     .join("\n\n");
// }

// function checkRateLimit() {
//   const now = Date.now();
//   if (now - requestCount.lastReset > 1000) {
//     requestCount.second = 0;
//     requestCount.lastReset = now;
//   }
//   if (requestCount.second >= RATE_LIMIT.perSecond ||
//     requestCount.month >= RATE_LIMIT.perMonth) {
//     throw new Error('Rate limit exceeded');
//   }
//   requestCount.second++;
//   requestCount.month++;
// }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!BRAVE_API_KEY) {
    console.error("Error: BRAVE_API_KEY environment variable is required");
    process.exit(1);
  }

  if (!SBR_WS_ENDPOINT) {
    console.error("Error: SBR_WS_ENDPOINT environment variable is required");
    process.exit(1);
  }
  // Servers MUST validate the Origin header on all incoming connections to prevent DNS rebinding attacks

  if (req.method === "OPTIONS") {
    createCrossOriginHeader(req);
    res.writeHead(204); // No Content
    res.end();
    return;
  }

  // const sessionId = req.headers[SESSION_ID_HEADER_NAME] as string | undefined;

  const reqBody = req.body;

  // const transportInSession = transports[sessionId ?? ""];

  try {
    const mcpServer = createMCPServerWithBusinessLogic();

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await mcpServer.connect(transport);

    // const transport = await connectWithTransport({ sessionId, mcpServer });

    // transport 내부에서 클라이언트에게 response 하므로 이후에 로직 처리는 필요하지 않음
    await transport.handleRequest(req, res, reqBody);

    return;
  } catch (error) {
    console.error("Error handling MCP request:", error);

    responseForError(res, error);
    return;
  }
}

function responseForError(res: VercelResponse, error: unknown) {
  res.writeHead(500);
  res.write(`[500] NTERNAL SERVER ERROR : ${JSON.stringify(error)}`);
  res.end();
}

function createCrossOriginHeader(req: VercelRequest) {
  req.headers["access-control-allow-headers"] = "*";
  req.headers["access-control-allow-methods"] = "*";
  req.headers["access-control-allow-origin"] = "*";
  req.headers["access-control-allow-credentials"] = "true";
}
