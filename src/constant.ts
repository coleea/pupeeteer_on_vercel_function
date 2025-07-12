import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Tool } from "@modelcontextprotocol/sdk/types";
import dotenv from "dotenv";
dotenv.config();

// export const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
export const SERVER_TOOL_NAME = "wiki_web_search";
export const BRAVE_API_KEY = "BSAfF9d5o5VYSiYDsTjIiKoLfogH9cq";
export const USER_AGENT = "brave-search";

export const SESSION_ID_HEADER_NAME = "mcp-session-id";
export const JSON_RPC = "2.0";
export const transports: {
  [sessionId: string]: StreamableHTTPServerTransport;
} = {};

export const RATE_LIMIT = {
  perSecond: 1,
  perMonth: 15000,
};

export let requestCount = {
  second: 0,
  month: 0,
  lastReset: Date.now(),
};

export const wikiTool: Tool = {
  name: SERVER_TOOL_NAME,
  description:
    "searching for information using https://wikipedia.org/  or https://namu.wiki namu.wiki has a lot of Korean data. " +
    "wikipedia has all the data in the world. Korean data search for Namu.wiki first",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "there are only two sites. namuwiki and wikipedia",
        default: "namuwiki",
      },
      site: {
        type: "string",
        description: "Number of results (1-20, default 10)",
      },
    },
    required: ["site", "query"],
  },
};
