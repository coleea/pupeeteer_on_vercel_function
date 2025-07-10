import type { VercelRequest, VercelResponse } from "@vercel/node";
import chrome from "@sparticuz/chromium";
import { setHeaderForPostRequest } from "../utils/setHeaderForPostRequest";
import { setHeaderForGetRequest } from "../utils/setHeaderForGetRequest";
import "dotenv/config";
import { getChrome } from "../utils/getChrome";
// import { getChrome } from "../utils/getChrome.backup.2";

export default async (req: VercelRequest, res: VercelResponse) => {
  const { body, method } = req;

  const isDev = process.env.VERCEL_REGION?.includes("dev") ? true : false ;

  console.debug("🐞isDev");
  console.debug(isDev);
  if (method !== "POST") {
    // CORS https://vercel.com/guides/how-to-enable-cors
    setHeaderForGetRequest(res);
    return res.status(200).end();
  }

  if (!body) return res.status(400).end(`No body provided`);

  if (typeof body === "object" && !body.url)
    return res.status(400).end(`No url provided`);

  const { executablePath, puppeteer } = await getChrome({isDev});

  console.debug("🐞process.env.NODE_ENV");
  console.debug(process.env.NODE_ENV);

  const browser = await puppeteer.launch(
    isDev
      ? {
          // args: chrome.args,
          // args: chrome.args,
          defaultViewport: chrome.defaultViewport,
          executablePath,

          headless: false,
        }
      : {
          // args: chrome.args,
          defaultViewport: chrome.defaultViewport,
          executablePath,
          headless: false,
          // args: ["--no-sandbox", "--disable-setuid-sandbox"],
        }
  );

  const page = (await browser.pages()).at(0)!;
  await page.setJavaScriptEnabled(true);
  await page.setViewport({ width: 600, height: 600 });

  // https://www.google.com/search?q=site%3Anamu.wiki&newwindow=1
  const query = req.body.query as string;
  const url = `${encodeURI(
    "https://www.google.com/search?q=site:namu.wiki+"
  )}${encodeURI(query)}`;

  console.debug("🐞url");
  console.debug(url);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  // await new Promise((r) => setTimeout(r, 500000));

  // await page.$eval()
  console.debug("🐞before eval");
  const bodyInnerHTMLGoogle = await page.$eval("body", (e) => {
    return e.innerHTML;
  });
  console.debug("🐞after eval");

  console.debug("🐞bodyInnerHTMLGoogle");
  console.debug(bodyInnerHTMLGoogle);

  const targetUrl = await page.$eval("#search a", (e) => {
    return e.href;
  });

  await page.goto(targetUrl, {
    waitUntil: "domcontentloaded",
  });

  const bodyInnerHTML = await page.$eval("body", (e) => {
    return e.innerHTML;
  });

  console.debug("🐞bodyInnerHTML");
  console.debug(bodyInnerHTML);

  await browser.close();

  setHeaderForPostRequest(res);
  res.end(bodyInnerHTML);
};
