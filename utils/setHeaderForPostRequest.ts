import { VercelResponse } from "@vercel/node";

export function setHeaderForPostRequest(res: VercelResponse) {
  res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate");
  // res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Type", "text/plain");
  // CORS
  // res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
}
