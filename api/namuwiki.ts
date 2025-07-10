import type { VercelRequest, VercelResponse } from "@vercel/node";
import chrome from "@sparticuz/chromium";
import { setHeaderForPostRequest } from "../utils/setHeaderForPostRequest";
import { setHeaderForGetRequest } from "../utils/setHeaderForGetRequest";
import "dotenv/config";
import { getChrome } from "../utils/getChrome";
import { argsBySparticuz } from "../utils/argsBySparticuz";
// import { connect } from "puppeteer-real-browser";

// import { getChrome } from "../utils/getChrome.backup.2";

export default async (req: VercelRequest, res: VercelResponse) => {
  const { body, method } = req;

  const isDev = process.env.VERCEL_REGION?.includes("dev") ? true : false;

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

  const { executablePath, puppeteer } = await getChrome({ isDev });

  console.debug("🐞process.env.NODE_ENV");
  console.debug(process.env.NODE_ENV);

  // ChromePathNotSetError
  // const browser = await connect({
  //   headless: false,
  //   turnstile: true,

  // });

  const browser = await puppeteer.launch(
    isDev
      ? {
          // args: argsBySparticuz(),
          // args: chrome.args,
          defaultViewport: chrome.defaultViewport,
          executablePath,

          headless: false,
        }
      : {
          args: chrome.args,
          defaultViewport: chrome.defaultViewport,
          executablePath,
          headless: false,
          // args: ["--no-sandbox", "--disable-setuid-sandbox"],
        }
  );

  const page2 = await browser.newPage()
  // const { page } = browser;
  const page = (await browser.pages()).at(0)!;

  await page.setViewport({ width: 1920, height: 1080 });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
  );

  await page.setJavaScriptEnabled(true);
  // await page.setViewport({ width: 600, height: 600 });

  

  // https://www.google.com/search?q=site%3Anamu.wiki&newwindow=1
  const query = req.body.query as string;
  const url = `${encodeURI(
    // "https://duckduckgo.com/?q=site%3Anamu.wiki+"
    // "https://www.google.com/search?q=site:namu.wiki+"
    "https://www.bing.com/search?q=site:namu.wiki "
  )}${encodeURI(query)}`;

  console.debug("🐞url");
  console.debug(url);

  // await new Promise((r) => setTimeout(r, 2000));

  // new Error('Navigating frame was detached'),
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    // waitUntil: "",
  });

  // await new Promise((r) => setTimeout(r, 500000));

  // await page.$eval()
  // console.debug("🐞before eval");
  // const bodyInnerHTMLGoogle = await page.$eval("body", (e) => {
  //   return e.innerHTML;
  // });
  // console.debug("🐞after eval");

  // console.debug("🐞bodyInnerHTMLGoogle");
  // console.debug(bodyInnerHTMLGoogle);

  const targetUrl = await page.$eval(
    // "#search a"
    "h2 a",
    // ".react-results--main li article h2 a",
    (e) => {
      return e.href;
    }
  );

  // await new Promise((r) => setTimeout(r, 2000));

  console.debug('🐞targetUrl');
  console.debug(targetUrl);
  console.debug('🐞1');
  await page2.goto(targetUrl, {
    waitUntil: "load",
  });
  console.debug('🐞2');

  // await new Promise((r) => setTimeout(r, 3000));

  // await new Promise((r) => setTimeout(r, 3000));

  console.debug('🐞3');

  const bodyInnerHTML = await page2.$eval("body", (e) => {
    return e.innerHTML;
  });

  console.debug('🐞4');

  // await new Promise((r) => setTimeout(r, 1000));

  console.debug("🐞bodyInnerHTML");
  console.debug(bodyInnerHTML);

  
  await page.close();
  await browser.close();

  // await new Promise((r) => setTimeout(r, 1000));

  setHeaderForPostRequest(res);
  res.end(bodyInnerHTML);
};

