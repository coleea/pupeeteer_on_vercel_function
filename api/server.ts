import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createMCPServer as createMCPServer,
  SBR_WS_ENDPOINT,
  setupTools,
} from "../src/lib/createMCPServer";
import { BRAVE_API_KEY } from "../src/constant";
import "dotenv/config";

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
    const mcpServer = createMCPServer();

    setupTools(mcpServer);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await mcpServer.connect(transport);

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
