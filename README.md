# Apple Pay with Playwright
This repo contains samples for running Apple Pay with [Playwright](https://playwright.dev/docs/intro) tests on BrowserStack using the browserstack-node-sdk and the non SDK approach.

![BrowserStack Logo](https://www.browserstack.com/images/static/header-logo.jpg)

## Setup

* Clone the repo `git clone -b sdk https://github.com/browserstack/node-js-playwright-browserstack.git` and run `cd node-js-playwright-browserstack`.
* Set `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` as environment variables with your [BrowserStack Username and Access Key](https://www.browserstack.com/accounts/settings) or update the same in `browserstack.yml` file.
* Run `npm i` to install the dependencies.

## Running your tests

- To run the sample tests in parallel across the platforms specified in the `browserstack.yml`, run `npm run sample-test`.
- To run the test with non sdk integration, run `npm run sample-nonsdk-test`.
- To run the sample local tests in parallel across the platforms specified in the `browserstack.yml`, run `npm run sample-local-test`.

## Notes
* Apple Pay button in most cases are secured. On the Selenium tests we normally switch to native context and perform the click to avoid issues. Playwright's inbuilt tap action doesn't work with secured Apple Pay buttons. We need to have an easy way to do this. 
* Automate team created a feature called ios-click specifically for performing native taps on Playwright on BrowserStack iOS devices. This repo leverages that feature and perform the native tap. This works well with the secured Apple Pay button