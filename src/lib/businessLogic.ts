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
  const isDev = process.env.VERCEL_REGION?.includes("dev") ? true : false;

  try {
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

    const resultsString = await performWebSearch(query);
    const foundUrlStr = resultsString
      .split("\n")
      .find((line) => line.startsWith("URL: "));

    if (foundUrlStr == null) {
      return "foundUrlStr == null";
    }

    const foundUrlStrFormatted = foundUrlStr.replace("URL: ", "");

    await page.goto(foundUrlStrFormatted, {
      waitUntil: "load",
    });

    const bodyInnerText = await page.$eval("body ", (e) => {
      // 광고제거
      document.querySelector(`[style="margin 0; color: #8d4298cd"]`)?.remove();
      return e.innerText;
    });

    await page.close();
    await browser.close();

    return bodyInnerText;
  } catch (error) {
    return JSON.stringify(error);
  }
};
