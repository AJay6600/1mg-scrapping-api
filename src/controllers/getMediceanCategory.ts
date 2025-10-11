import type { RequestHandler } from "express";
import { logger } from "../utils/helpers/logger.ts";
import { chromium, type Page } from "playwright";

type GetMediceanCategoryType = { data: Array<string> | string };

type GetMediceanRequestBodyType = { mediceanName: string };

const getMediceanCategory: RequestHandler<
  unknown,
  GetMediceanCategoryType,
  GetMediceanRequestBodyType
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
> = async (request, response) => {
  let mediceanCategory: Array<string> = [];

  let returnMessage: string = "";

  /** Open the chrome browser */
  const browser = await chromium.launch();

  try {
    const { mediceanName } = request.body;

    /** Create the context for the browser setting  */
    const context = await browser.newContext();

    /** Grant the location to the website so that geolocation pop should be closed */
    await context.grantPermissions(["geolocation"], {
      origin: "https://www.1mg.com/",
    });

    /** Create the new tab */
    const page = await context.newPage();

    /** Load the website */
    await page.goto("https://www.1mg.com/");

    const getBreadCrunch = async (pageInstance: Page) => {
      /** Get the category element */
      const breadcrumbNav = pageInstance.locator(
        'nav[aria-label="breadcrumb"]'
      );
      await breadcrumbNav.waitFor({ state: "visible", timeout: 5000 });

      /** Get all the category */
      const breadcrumbItems = await breadcrumbNav
        .locator('span[itemprop="name"]')
        .allTextContents();

      if (
        breadcrumbItems &&
        Array.isArray(breadcrumbItems) &&
        breadcrumbItems.length > 0
      ) {
        breadcrumbItems.forEach((category, index) => {
          mediceanCategory.push(category);
        });
        return;
      }

      const singleBreadcrumbItem = await pageInstance
        .locator(".Breadcrumbs__sku-name___aGbfp")
        .innerText();

      if (singleBreadcrumbItem) {
        mediceanCategory.push(singleBreadcrumbItem);
        return;
      }

      returnMessage = "medicean not found";
    };

    /** Find the the ad close button */
    const closeButton = await page.locator('role=img[name="Close"]');

    /** There is add when close button is found, if add is there then close it */
    if (closeButton) {
      /**  Click the close button */
      await closeButton.click();
    }

    /** Get the medicean search bar */
    const searchInput = page.getByRole("textbox", {
      name: "Search for Medicines and Health Products",
    });

    /** Type the name of medicean into the search bar */
    await searchInput.fill(mediceanName);

    /** Wait for suggestions to be appears for the medicean */
    const searchResultsList = page.locator("ul.styles__search-results___3rJOl");
    await searchResultsList.waitFor({ state: "visible", timeout: 5000 });

    /** List of suggestion */
    const suggestionsResult = searchResultsList.locator(`text=${mediceanName}`);

    /**
     * When the similar suggestions found then click on the first suggestion
     * when suggestion are not found then press the enter to search medicean
     */
    if ((await suggestionsResult.count()) > 0) {
      await suggestionsResult.first().click();
    } else {
      searchInput.press("Enter");
    }

    await page.waitForLoadState("domcontentloaded");

    /** Get the current page url */
    const currentURL = await page.url();

    /**
     * When the current url is start with `https://www.1mg.com/otc/`
     * then the medicean product page loaded with category
     * when the url is not that then search the product from all products
     */
    if (currentURL.startsWith("https://www.1mg.com/otc/")) {
      await getBreadCrunch(page);
    } else {
      const productBoxLocator = await page
        .locator(".style__product-box___3oEU6")
        .filter({ hasText: mediceanName });

      await productBoxLocator.waitFor({ state: "visible", timeout: 5000 });

      const productCount = await productBoxLocator.count();

      if (productCount > 0) {
        const [newPage] = await Promise.all([
          page.context().waitForEvent("page"),
          productBoxLocator.click(),
        ]);

        await newPage.waitForLoadState();
        await getBreadCrunch(newPage);
      } else {
        returnMessage = "medicean not found";
      }
    }

    browser.close();
  } catch (err) {
    const error = err as Error;
    browser.close();
    logger(error);
    returnMessage = "medicean not found";
    response.json({ data: returnMessage });
  }

  response.json({
    data: mediceanCategory.length > 0 ? mediceanCategory : returnMessage,
  });
};

export default getMediceanCategory;
