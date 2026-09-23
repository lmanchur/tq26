import { expect, test } from '../../fixtures/authenticatedPage';
import { registerSharedCartLock } from '../../fixtures/cartLock';
import { CartPage } from '../../pages/CartPage';
import { ProductPage } from '../../pages/ProductPage';
import { BEARSTORE_USERNAME } from '../../test-data/bearstore';

const DRIVER = {
  slug: 'gbb-epic-sub-zero-driver',
  name: 'GBB Epic Sub Zero Driver',
  price: 489,
} as const;

const CHRONOGRAPH = {
  slug: 'transocean-chronograph',
  name: 'TRANSOCEAN CHRONOGRAPH',
  price: 24_110,
} as const;

const expectedTotal = DRIVER.price + CHRONOGRAPH.price;
const expectedTotalText = `$${expectedTotal.toLocaleString('en-US')}.00`;

test.describe('authenticated cart', () => {
  registerSharedCartLock(test);

  test('should show the correct total after adding driver and chronograph', async ({
    authenticatedPage,
  }) => {
    test.setTimeout(90_000);

    const product = new ProductPage(authenticatedPage);
    const cart = new CartPage(authenticatedPage);

    await authenticatedPage.goto('https://bearstore-testsite.smartbear.com/');
    await expect(
      authenticatedPage.getByRole('link', {
        name: BEARSTORE_USERNAME,
      }),
    ).toBeVisible();

    await cart.clear();

    await product.open(DRIVER.slug);
    await expect(product.heading).toHaveText(DRIVER.name);
    await product.addToBasket();

    await product.open(CHRONOGRAPH.slug);
    await expect(product.heading).toHaveText(CHRONOGRAPH.name);
    await product.addToBasket();

    await cart.open();
    await expect(cart.heading).toBeVisible();
    await expect(cart.productLink(DRIVER.name)).toBeVisible();
    await expect(cart.productLink(CHRONOGRAPH.name)).toBeVisible();
    await expect(cart.totalLabel).toBeVisible();
    await expect(cart.totalAmount(expectedTotalText)).toBeVisible();
  });
});
