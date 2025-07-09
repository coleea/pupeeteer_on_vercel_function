import type { VercelRequest, VercelResponse } from "@vercel/node";
import chrome from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { setHeaderForPostRequest } from "../utils/setHeaderForPostRequest";
import { setHeaderForGetRequest } from "../utils/setHeaderForGetRequest";

// const chrome = require("@sparticuz/chromium");
// const puppeteer = require("puppeteer-core");

export default async (req: VercelRequest, res: VercelResponse) => {
  const {
    // query: { hash, path, resolution },
    body,
    method,
  } = req;

  if (method !== "POST") {
    // CORS https://vercel.com/guides/how-to-enable-cors
    setHeaderForGetRequest(res);
    return res.status(200).end();
  }

  if (!body) return res.status(400).end(`No body provided`);

  if (typeof body === "object" && !body.url)
    return res.status(400).end(`No url provided`);

  // const isProduction = process.env.NODE_ENV === "production";

  const browser = await puppeteer.launch(
    process.env.NODE_ENV === "production"
      ? {
          args: chrome.args,
          defaultViewport: chrome.defaultViewport,
          executablePath: await chrome.executablePath(),
          headless: false,
          // args: ["--no-sandbox", "--disable-setuid-sandbox"],
          
        }
      : {
          headless: false,
        }
  );

  const page = (await browser.pages()).at(0)!;
  // const page = await browser.newPage();

  await page.setJavaScriptEnabled(true) ;
  
  await page.setViewport({ width: 600, height: 600 });

  // const url = getAbsoluteURL(`?hash=${hash}`, path)
  // const url = req.body.url

  // console.log("url", req.body.url);
  console.debug("🐞req.body.query");
  console.debug(req.body.query);

  // https://www.google.com/search?q=site%3Anamu.wiki&newwindow=1
  // "https://duckduckgo.com/?q=!ducky+=site:namu.wiki"
  const query = req.body.query as string;
  const url = `${encodeURI(
    "https://www.google.com/search?q=site%3Anamu.wiki+"
  )}${encodeURI(query)}`;

  console.debug("🐞url");
  console.debug(url);

  await page.goto(url, {
    waitUntil: "domcontentloaded",
  });

  const bodyInnerHTMLGoogle = await page.$eval("body", (e) => {
    return e.innerHTML;
  });

  console.debug("🐞bodyInnerHTMLGoogle");
  console.debug(bodyInnerHTMLGoogle);

  // const targetUrl = await page.$eval("#search div[data-rpos] a", (e) => {
  const targetUrl = await page.$eval("#search a", (e) => {
    return e.href;
  });

  await page.goto(targetUrl, {
    waitUntil: "domcontentloaded",
  });

  // document.querySelector(`#search div[data-rpos] a`).click();

  // await page.waitForSelector("body");{}

  const bodyInnerHTML = await page.$eval("body", (e) => {
    return e.innerHTML;
  });

  console.debug("🐞bodyInnerHTML");
  console.debug(bodyInnerHTML);

  // const element = await performCanvasCapture(page, selector); // const element = page.$(selector)
  // const data = element;

  // const data = bodyInnerHTML;

  await browser.close();

  // Set the s-maxage property which caches the images then on the Vercel edge
  setHeaderForPostRequest(res);
  res.end(bodyInnerHTML);
};
