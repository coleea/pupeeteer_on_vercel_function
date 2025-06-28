import chrome from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
// const chrome = require("@sparticuz/chromium");
// const puppeteer = require("puppeteer-core");

export default async (req: any, res: any) => {
  let {
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

  const isProd = process.env.NODE_ENV === "production";

  let browser;

  if (isProd) {
    browser = await puppeteer.launch({
      args: chrome.args,
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath(),
      headless: false,
      // ignoreHTTPSErrors: true,
    });
  } else {
    browser = await puppeteer.launch({
      headless: false,
      // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    });
  }

  const page = await browser.newPage();

  await page.setViewport({ width: 600, height: 600 });

  // const url = getAbsoluteURL(`?hash=${hash}`, path)
  const url = body.url;

  console.log("url", url);

  await page.goto(url);

  await page.waitForSelector("body");
  const bodyInnerHTML = await page.$eval("body", (e) => {
    return e.innerHTML;
  });

  // const element = await performCanvasCapture(page, selector); // const element = page.$(selector)
  // const data = element;

  const data = bodyInnerHTML;

  await browser.close();

  // Set the s-maxage property which caches the images then on the Vercel edge
  setHeaderForPostRequest(res);
  res.end(data);
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
