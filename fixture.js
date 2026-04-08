const base = require("@playwright/test");
const cp = require("child_process");
const { _android } = require("playwright");
const clientPlaywrightVersion = cp
  .execSync("npx playwright --version")
  .toString()
  .trim()
  .split(" ")[1];
const BrowserStackLocal = require("browserstack-local");
const util = require("util");
const WS_CONNECT_TIMEOUT_MS = 180 * 1000;

// BrowserStack Specific Capabilities.
// Set 'browserstack.local:true For Local testing
const caps = {
  browser: "chrome",
  browserName: "chrome",
  browserVersion: "latest",
  "browserstack.username": process.env.BROWSERSTACK_USERNAME || "<USERNAME>",
  "browserstack.accessKey": process.env.BROWSERSTACK_ACCESS_KEY || "<ACCESS_KEY>",
  project: "Test-ios",
  build: "Apple-pay",
  name: "My android playwright test",
  "browserstack.local": String(process.env.BROWSERSTACK_LOCAL).toLowerCase() === "true",
  "browserstack.idleTimeout": 180,
  "browserstack.enableApplePay": true,
  "bstack:options": {
    osVersion: "13.0",
    deviceName: "Samsung Galaxy S23", // "Samsung Galaxy S22 Ultra", "Google Pixel 7 Pro", "OnePlus 9", etc.
    realMobile: true,
    projectName: "Test-ios",
    buildName: "Apple-pay",
    sessionName: "My android playwright test",
    userName: process.env.BROWSERSTACK_USERNAME || "<USERNAME>",
    accessKey: process.env.BROWSERSTACK_ACCESS_KEY || "<ACCESS_KEY>",
    local: String(process.env.BROWSERSTACK_LOCAL).toLowerCase() === "true",
    idleTimeout: 180,
    enableApplePay: true,
  },
};

exports.bsLocal = new BrowserStackLocal.Local();

// replace YOUR_ACCESS_KEY with your key. You can also set an environment variable - "BROWSERSTACK_ACCESS_KEY".
exports.BS_LOCAL_ARGS = {
  key: process.env.BROWSERSTACK_ACCESS_KEY || "ACCESSKEY",
};

// Patching the capabilities dynamically according to the project name.
const patchMobileCaps = (name, title) => {
  const bstackOptions = caps["bstack:options"];
  let combination = name.split(/@browserstack/)[0];
  let [browerCaps, osCaps] = combination.split(/:/);
  let [browser, deviceName] = browerCaps.split(/@/);
  let osCapsSplit = osCaps.split(/ /);
  let os = osCapsSplit.shift();
  let osVersion = osCapsSplit.join(" ");
  const resolvedBrowser = browser ? browser : "chrome";
  const resolvedDevice = deviceName ? deviceName : "Samsung Galaxy S22 Ultra";
  const resolvedOsVersion = osVersion ? osVersion : "17.3";
  caps.browser = resolvedBrowser;
  caps.browserName = resolvedBrowser;
  caps.device = resolvedDevice;
  caps.os_version = resolvedOsVersion;
  bstackOptions.deviceName = resolvedDevice;
  bstackOptions.osVersion = resolvedOsVersion;
  bstackOptions.sessionName = title;
  bstackOptions.realMobile = true;
  caps.name = title;
};

const patchCaps = (name, title) => {
  const bstackOptions = caps["bstack:options"];
  let combination = name.split(/@browserstack/)[0];
  let [browerCaps, osCaps] = combination.split(/:/);
  let [browser, browser_version] = browerCaps.split(/@/);
  let osCapsSplit = osCaps.split(/ /);
  let os = osCapsSplit.shift();
  let os_version = osCapsSplit.join(" ");
  caps.browser = browser ? browser : "chrome";
  caps.browserName = browser ? browser : "chrome";
  caps.browserVersion = browser_version ? browser_version : "latest";
  caps.browser_version = browser_version ? browser_version : "latest";
  caps.os = os ? os : "OS X";
  caps.os_version = os_version ? os_version : "Catalina";
  bstackOptions.os = os ? os : "OS X";
  bstackOptions.osVersion = os_version ? os_version : "Catalina";
  bstackOptions.sessionName = title;
  caps.name = title;
};

const isHash = (entity) =>
  Boolean(entity && typeof entity === "object" && !Array.isArray(entity));
const nestedKeyValue = (hash, keys) =>
  keys.reduce((hash, key) => (isHash(hash) ? hash[key] : undefined), hash);
const isUndefined = (val) => val === undefined || val === null || val === "";
const evaluateSessionStatus = (status) => {
  if (!isUndefined(status)) {
    status = status.toLowerCase();
  }
  if (status === "passed") {
    return "passed";
  } else if (status === "failed" || status === "timedout") {
    return "failed";
  } else {
    return "";
  }
};

exports.test = base.test.extend({
  page: async ({ page, playwright }, use, testInfo) => {
    console.log('fixture page hook entered');
    console.log(`Running test: ${testInfo.title} on project: ${testInfo.project.name}`);
    if (testInfo.project.name.match(/browserstack/)) {
      let vBrowser, vContext, vDevice;
      const isMobile = testInfo.project.name.match(/browserstack-mobile/);
      console.log(`Running on BrowserStack with project name: ${testInfo.project.name}`);
      if (isMobile) {
        console.log("Patching capabilities for mobile device");
        patchMobileCaps(
          testInfo.project.name,
          `${testInfo.file} - ${testInfo.title}`,
        );

        //Removing android capability 
        /* vDevice = await playwright._android.connect(
          `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
            JSON.stringify(caps)
          )}`
        );
        await vDevice.shell("am force-stop com.android.chrome");
        vContext = await vDevice.launchBrowser(); */
        const effectiveBrowser = caps.browserName || "chrome"; // from patchMobileCaps
        if (effectiveBrowser === "safari") {
          console.log("Using webkit for Safari browser");
          caps.browser = "safari";
          caps.browserName = "webkit";
        } else {
          console.log("Using browser:", effectiveBrowser);
          caps.browser = effectiveBrowser;
          caps.browserName = effectiveBrowser;
        }
        console.log("Capabilities for mobile:", caps);
        vBrowser = await playwright.chromium.connect({
          wsEndpoint:
            `wss://cdp.browserstack.com/playwright?caps=` +
            `${encodeURIComponent(JSON.stringify(caps))}`,
          timeout: WS_CONNECT_TIMEOUT_MS,
        });
        vContext = await vBrowser.newContext(testInfo.project.use);
      } else {
        patchCaps(testInfo.project.name, `${testInfo.title}`);
        delete caps.device;
        delete caps["bstack:options"].deviceName;
        delete caps["bstack:options"].realMobile;
        vBrowser = await playwright.chromium.connect({
          wsEndpoint:
            `wss://cdp.browserstack.com/playwright?caps=` +
            `${encodeURIComponent(JSON.stringify(caps))}`,
          timeout: WS_CONNECT_TIMEOUT_MS,
        });
        vContext = await vBrowser.newContext(testInfo.project.use);
      }
      const vPage = await vContext.newPage();
      await use(vPage);

      await vPage.close();

      if (isMobile) {
        //await vDevice.close();
        await vBrowser.close();
      } else {
        await vBrowser.close();
      }
    } else {
      use(page);
    }
  },

  beforeEach: [
    async ({ page }, use) => {
      await page
        .context();
        //Tracing doesn't work with iOS + PW
        //.tracing.start({ screenshots: true, snapshots: true, sources: true });
      await use();
    },
    { auto: true },
  ],

  afterEach: [
    async ({ page }, use, testInfo) => {
      await use();
      if (testInfo.status == "failed") {
        await page
          .context()
          .tracing.stop({ path: `${testInfo.outputDir}/trace.zip` });
        await page.screenshot({ path: `${testInfo.outputDir}/screenshot.png` });
        await testInfo.attach("screenshot", {
          path: `${testInfo.outputDir}/screenshot.png`,
          contentType: "image/png",
        });
        await testInfo.attach("trace", {
          path: `${testInfo.outputDir}/trace.zip`,
          contentType: "application/zip",
        });
      }
    },
    { auto: true },
  ],
});
