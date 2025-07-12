import { getChrome } from "../../utils/getChrome";
import { SBR_WS_ENDPOINT } from "./createMCPServer";
import { performWebSearch } from "./performWebSearch";

export const businessLogic = async ({
  query,
  site,
}: {
  query: string;
  site: string;
}) => {
  console.debug("🐞3.5");

  const isDev = process.env.VERCEL_REGION?.includes("dev") ? true : false;

  console.debug("🐞4");

  console.debug("🐞isDev");
  console.debug(isDev);

  try {
    const { executablePath, puppeteer } = await getChrome({ isDev });
    console.debug("🐞5");

    const browser = await puppeteer.connect({
      browserWSEndpoint: SBR_WS_ENDPOINT,
    });
    console.debug("🐞6");

    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    );

    await page.setJavaScriptEnabled(true);

    // const query = req.body.query as string;
    console.debug("🐞7");

    const resultsString = await performWebSearch(query);
    const foundUrlStr = resultsString
      .split("\n")
      .find((line) => line.startsWith("URL: "));

    if (foundUrlStr == null) {
      // setHeaderForPostRequest(res);
      // res.end("foundUrlStr == null");
      return "foundUrlStr == null";
    }

    console.debug("🐞8");

    const foundUrlStrFormatted = foundUrlStr.replace("URL: ", "");

    await page.goto(foundUrlStrFormatted, {
      waitUntil: "load",
    });
    console.debug("🐞9");

    const bodyInnerHTML = await page.$eval("body", (e) => {
      return e.innerHTML;
    });
    console.debug("🐞10");

    await page.close();
    await browser.close();
    console.debug("🐞11");

    return bodyInnerHTML;
    // setHeaderForPostRequest(res);
    // res.end(bodyInnerHTML);
  } catch (error) {
    return JSON.stringify(error);
  }
};
