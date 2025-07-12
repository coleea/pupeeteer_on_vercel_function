import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { braveSearchTool, SERVER_TOOL_NAME } from "../constant.js";
import { performWebSearch } from "./performWebSearch.js";
import { getChrome } from "../../utils/getChrome.js";

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

  setupTools(mcpServer);
  return mcpServer;
}

export function setupTools(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [braveSearchTool],
    };
  });

  const businessLogic = async ({
    query,
    site,
  }: {
    query: string;
    site: string;
  }) => {
    const isDev = process.env.VERCEL_REGION?.includes("dev") ? true : false;

    const { executablePath, puppeteer } = await getChrome({ isDev });

    const browser = await puppeteer.connect({
      browserWSEndpoint: SBR_WS_ENDPOINT,
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    await page.setJavaScriptEnabled(true);

    // const query = req.body.query as string;

    const resultsString = await performWebSearch(query);
    const foundUrlStr = resultsString
      .split("\n")
      .find((line) => line.startsWith("URL: "));

    if (foundUrlStr == null) {
      // setHeaderForPostRequest(res);
      // res.end("foundUrlStr == null");
      return "foundUrlStr == null";
    }
    const foundUrlStrFormatted = foundUrlStr.replace("URL: ", "");

    await page.goto(foundUrlStrFormatted, {
      waitUntil: "load",
    });

    const bodyInnerHTML = await page.$eval("body", (e) => {
      return e.innerHTML;
    });

    await page.close();
    await browser.close();

    return bodyInnerHTML;
    // setHeaderForPostRequest(res);
    // res.end(bodyInnerHTML);
  };

  // handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const args = request.params.arguments;
    const toolName = request.params.name;
    console.log("Received request for tool with argument:", toolName, args);

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

      const response = await businessLogic(
        {
          query,
          site,
        }
        // count as number,
        // offset as number
      );

      console.debug("🐞searchResult");
      console.debug(response);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response),
          },
        ],
      };
    }

    throw new Error("Tool not found");
  });
}
