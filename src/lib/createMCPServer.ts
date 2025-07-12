import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { SERVER_TOOL_NAME, wikiTool } from "../constant";
import { businessLogic } from "./businessLogic";

export const SBR_WS_ENDPOINT =
  "wss://brd-customer-hl_29ef282b-zone-scraping_browser1:uow2t82dtevb@brd.superproxy.io:9222";

export function createMCPServer() {
  const mcpServer = new Server(
    {
      name: "mcp-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        // completions,
        // experimental,
        // prompts,
        // resources,
        tools: {
          listChanged: false,
        },
        logging: {},
      },
    }
  );

  return mcpServer;
}

export function setupTools(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [wikiTool],
    };
  });

  // handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const args = request.params.arguments;

    const toolName = request.params.name;

    if (!args) {
      throw new Error("arguments undefined");
    }

    if (!toolName) {
      throw new Error("tool name undefined");
    }

    if (toolName === SERVER_TOOL_NAME) {
      const { query, site } = args;

      if (typeof query !== "string") {
        throw new Error("query undefined");
      }
      if (typeof site !== "string") {
        throw new Error("site undefined");
      }

      try {
        const response = await businessLogic({
          query,
          site,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "error",
              text: JSON.stringify(error),
            },
          ],
        };
      }
    }

    throw new Error("Tool not found");
  });
}
