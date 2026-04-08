const { expect, test } = require("@playwright/test");

test("Browserstack playwright demo", async ({ page }) => {
  const baseUrl = "https://the-internet.herokuapp.com/";

  await page.goto(baseUrl);

  await page.waitForTimeout(3000);



  await expect(page).toHaveTitle("The Internet");

  await page.getByRole("link", { name: "Checkboxes" }).click();

  const checkbox1 = page.getByRole("checkbox").first();
  const checkbox2 = page.getByRole("checkbox").last();

  expect(await checkbox1.isChecked()).toBe(false);
  await checkbox1.check();
  expect(await checkbox1.isChecked()).toBe(true);

  expect(await checkbox2.isChecked()).toBe(true);
  await checkbox2.uncheck();
  expect(await checkbox2.isChecked()).toBe(false);

  await page.goto(baseUrl);
  await page.getByRole("link", { name: "Dropdown" }).click();

  const dropdown = page.locator("#dropdown");
  await dropdown.selectOption({ label: "Option 1" });

  await page.goBack();

  const availableExamples = page.getByRole("heading", {
    name: "Available Examples",
  });
  const headingText = await availableExamples.textContent();
  expect(headingText).toContain("Available Examples");

  const applePayDetails = {
    action: "applePayDetails",
    arguments: {
      shippingDetails: {
        firstName: "Bruce",
        lastName: "Wayne",
        street: "200 John Olds dr",
        city: "Manchester",
        state: "Connecticut",
        postCode: "06042",
        country: "United States",
      },
      billingDetails: {
        firstName: "Bruce",
        lastName: "Wayne",
        street: "200 John Olds dr",
        city: "Manchester",
        state: "Connecticut",
        postCode: "06042",
        country: "United States",
      },
      contact: {
        email: "test@gmail.com",
        phone: "+44901234567",
      },
    },
  };

  let result = "";
  // Execute the BrowserStack command
  try {
    result = await page.evaluate(
      (arg) => { return arg; },
      `browserstack_executor:
${JSON.stringify(applePayDetails)}`,
    );    
    console.log("Result from the Apple pay executor in catch block =>", result);
    console.log("typeof result ", (typeof result));
    if (typeof result === 'string' && result.includes("Error executing browserstack_executor command")) {

      console.log("Apple Pay executor with PostCode approach failed => ", result);
      console.log("trying with Zip code.. ");
      // Fallback for different key naming (zip vs postCode) if necessary
      // 1. Remove the postCode element
      delete applePayDetails.arguments.shippingDetails.postCode;

      // Also remove from billing if necessary
      delete applePayDetails.arguments.billingDetails.postCode;
      applePayDetails.arguments.shippingDetails.zip = "06042";
      applePayDetails.arguments.billingDetails.zip = "06042";
      result = await page.evaluate(
        (arg) => { return arg; },
        `browserstack_executor:
${JSON.stringify(applePayDetails)}`,
      );
      console.log("Result from the Apple pay executor in catch block =>", result);
      if (typeof result === 'string' && result.includes("Error executing browserstack_executor command")) {
        throw new Error("RETRY_TRIGGERED");
      }
    }
  } catch (err) {
    console.log("Apple Pay executor with ZipCode approach failed => ", result);
    console.log("trying with Postalcode.. ");

    delete applePayDetails.arguments.shippingDetails.zip;
    // Also remove from billing if necessary
    delete applePayDetails.arguments.billingDetails.zip;
    applePayDetails.arguments.shippingDetails.postalCode = "06042";
    applePayDetails.arguments.billingDetails.postalCode = "06042";

    result = await page.evaluate(
      (arg) => { return arg; },
      `browserstack_executor:
${JSON.stringify(applePayDetails)}`,
    );

    if (typeof result === 'string' && result.includes("Error executing browserstack_executor command")) {
      console.log("Exhausted all optinos. Apple Pay execution failed");
      console.log("Reason for failure => ",result);
    }

  }

  const testStatus = {"action": "setSessionStatus", "arguments": {"status":"passed", "reason": "Title matched!"}};

    await page.evaluate(
        (arg) => { return arg; },
        `browserstack_executor:
${JSON.stringify(testStatus)}`,
      );

});
