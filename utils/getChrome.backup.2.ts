// import puppeteerCore from "puppeteer-core";
// import { channel } from "process";

import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer";

import puppeteerExtra from "puppeteer-extra";
import puppeteerExtraPluginStealth from "puppeteer-extra-plugin-stealth";

import puppeteerRebrowser from "rebrowser-puppeteer";
import puppeteerCoreRebrowser from "rebrowser-puppeteer-core";

import rebrowserPuppeteer from "rebrowser-puppeteer-core";
import { addExtra } from "puppeteer-extra";
const puppeteerExtraRebrowserApplied = addExtra(rebrowserPuppeteer as any);

require("puppeteer-extra-plugin-stealth/evasions/chrome.app");
require("puppeteer-extra-plugin-stealth/evasions/chrome.csi");
require("puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes");
require("puppeteer-extra-plugin-stealth/evasions/chrome.runtime");
require("puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow");
require("puppeteer-extra-plugin-stealth/evasions/media.codecs");
require("puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency");
require("puppeteer-extra-plugin-stealth/evasions/navigator.languages");
require("puppeteer-extra-plugin-stealth/evasions/navigator.permissions");
require("puppeteer-extra-plugin-stealth/evasions/navigator.plugins");
require("puppeteer-extra-plugin-stealth/evasions/navigator.vendor");
require("puppeteer-extra-plugin-stealth/evasions/navigator.webdriver");
require("puppeteer-extra-plugin-stealth/evasions/sourceurl");
require("puppeteer-extra-plugin-stealth/evasions/user-agent-override");
require("puppeteer-extra-plugin-stealth/evasions/webgl.vendor");
require("puppeteer-extra-plugin-stealth/evasions/window.outerdimensions");
require("puppeteer-extra-plugin-stealth/evasions/defaultArgs");
require("puppeteer-extra-plugin-user-preferences");
require("puppeteer-extra-plugin-user-data-dir");

export async function getChrome({ isDev }: { isDev: boolean }) {
  //   console.debug("🐞process.env.VERCEL_ENV");
  //   console.debug(process.env.VERCEL_ENV);

  puppeteerExtra.use(puppeteerExtraPluginStealth());

  // vercel dev 로컬 환경
  if (isDev) {
    // console.log("Running in local (vercel dev) environment");

    console.debug("🐞puppeteer.executablePath()");
    console.debug(puppeteer.executablePath());

    return {
      executablePath: puppeteer.executablePath(), // puppeteer가 번들로 제공하는 Chromium 경로
      puppeteer: puppeteerExtraRebrowserApplied,
      //   channel:"",
      //   puppeteer: puppeteer, // 풀 버전 puppeteer 사용
    };
  }

  // (Production)
  //   console.log("Running in Vercel production environment");
  //   const executablePath = await chromium.executablePath();

  return {
    executablePath: await chromium.executablePath(),
    puppeteer: puppeteerCoreRebrowser,
    // puppeteer: puppeteerCore, // 가벼운 puppeteer-core 사용
  };
}
