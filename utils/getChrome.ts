import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import puppeteerExtra from "puppeteer-extra";
import puppeteerExtraPluginStealth from "puppeteer-extra-plugin-stealth";

export async function getChrome() {
  //   console.debug("🐞process.env.VERCEL_ENV");
  //   console.debug(process.env.VERCEL_ENV);

  puppeteerExtra.use(puppeteerExtraPluginStealth());

  // vercel dev 로컬 환경
  if (process.env.VERCEL_REGION?.includes("dev")) {
    console.log("Running in local (vercel dev) environment");
    return {
      executablePath: puppeteer.executablePath(), // puppeteer가 번들로 제공하는 Chromium 경로
      puppeteer: puppeteerExtra,
      //   puppeteer: puppeteer, // 풀 버전 puppeteer 사용
    };
  }

  // (Production)
  console.log("Running in Vercel production environment");
  const executablePath = await chromium.executablePath();

  return {
    executablePath,
    puppeteer: puppeteerExtra,
    // puppeteer: puppeteerCore, // 가벼운 puppeteer-core 사용
  };
}
