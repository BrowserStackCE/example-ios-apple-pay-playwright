// This is a sample config for what users might be running locally
const config = {
  testDir: './tests',
  testMatch: '**/bstack_non_sdk_test*.js',

  /* Maximum time one test can run for. */
  timeout: 900 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* tests in parallel */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'line',
  /* Configure projects for major browsers */
  projects: [
    {
      name: "safari@iPhone 15:17.3@browserstack-mobile",
      use: {
        baseURL: "https://the-internet.herokuapp.com/",
        browserName: "webkit",
        channel: "webkit",
        timeout: 900000,
      },
    },
  ],
};

module.exports = config;
