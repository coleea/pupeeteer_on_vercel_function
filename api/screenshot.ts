import type { VercelRequest, VercelResponse } from "@vercel/node";
import chrome from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
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
        }
      : {
          headless: false,
        }
  );

  const page = (await browser.pages()).at(0)!
  // const page = await browser.newPage();

  await page.setViewport({ width: 600, height: 600 });

  // const url = getAbsoluteURL(`?hash=${hash}`, path)
  // const url = req.body.url

  console.log("url", req.body.url);

  await page.goto(req.body.url, {
    waitUntil : "domcontentloaded"
  });

  // await page.waitForSelector("body");

  const bodyInnerHTML = await page.$eval("body", (e) => {
    return e.innerHTML;
  });

  // const element = await performCanvasCapture(page, selector); // const element = page.$(selector)
  // const data = element;

  // const data = bodyInnerHTML;


  await browser.close();

  // Set the s-maxage property which caches the images then on the Vercel edge
  setHeaderForPostRequest(res);
  res.end(bodyInnerHTML);
};

function setHeaderForPostRequest(res: any) {
  res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate");
  // res.setHeader("Content-Type", "image/png");
  res.setHeader("Content-Type", "text/plain");
  // CORS
  // res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader("Access-Control-Allow-Credentials", true);
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

function setHeaderForGetRequest(res: any) {
  res.setHeader("Access-Control-Allow-Credentials", true);
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
