import { expect, test } from '../../fixtures/authenticatedPage';
import { registerSharedCartLock } from '../../fixtures/cartLock';
import { CartPage } from '../../pages/CartPage';
import { CheckoutPage } from '../../pages/CheckoutPage';
import { ProductPage } from '../../pages/ProductPage';

const BALL_CHAIR = {
  slug: 'ball-chair',
  name: 'Ball Chair',
} as const;

test.describe('ball chair checkout', () => {
  registerSharedCartLock(test);

  test('should confirm an order for a white and a blue ball chair', async ({
    authenticatedPage,
  }) => {
    test.setTimeout(180_000);

    const product = new ProductPage(authenticatedPage);
    const cart = new CartPage(authenticatedPage);
    const checkout = new CheckoutPage(authenticatedPage);

    await cart.clear();

    await product.open(BALL_CHAIR.slug);
    await expect(product.heading).toHaveText(BALL_CHAIR.name);
    await product.selectColor('White');
    await product.addToBasket();

    await product.open(BALL_CHAIR.slug);
    await expect(product.heading).toHaveText(BALL_CHAIR.name);
    await product.selectLeatherColor('Blue');
    await product.addToBasket();

    await cart.open();
    await expect(cart.heading).toBeVisible();
    await expect(cart.productLink(BALL_CHAIR.name)).toHaveCount(2);
    await expect(cart.colorText('White').first()).toBeVisible();
    await expect(cart.leatherColorText('Blue')).toBeVisible();

    await cart.startCheckout();
    await checkout.useSavedBillingAddress();
    await checkout.useSavedShippingAddress();
    await checkout.continueWithDefaultShippingMethod();
    await checkout.continueWithDefaultPaymentMethod();
    await checkout.agreeToTermsAndConfirmOrder();

    await expect(checkout.orderReceivedHeading).toBeVisible();
    await expect(checkout.thankYouHeading).toBeVisible();
    await expect(checkout.orderNumberLabel).toBeVisible();
    await expect(checkout.orderNumber).toBeVisible();
    await expect(authenticatedPage).toHaveURL(/\/checkout\/completed/);
  });

  test('should not confirm an order without accepting the terms', async ({
    authenticatedPage,
  }) => {
    test.setTimeout(180_000);

    const product = new ProductPage(authenticatedPage);
    const cart = new CartPage(authenticatedPage);
    const checkout = new CheckoutPage(authenticatedPage);

    await cart.clear();

    await product.open(BALL_CHAIR.slug);
    await expect(product.heading).toHaveText(BALL_CHAIR.name);
    await product.selectColor('White');
    await product.addToBasket();

    await cart.open();
    await expect(cart.heading).toBeVisible();
    await cart.startCheckout();
    await checkout.useSavedBillingAddress();
    await checkout.useSavedShippingAddress();
    await checkout.continueWithDefaultShippingMethod();
    await checkout.continueWithDefaultPaymentMethod();
    await checkout.confirmWithoutAcceptingTerms();

    await expect(checkout.termsError).toBeVisible();
    await expect(checkout.orderReceivedHeading).toBeHidden();
    await expect(authenticatedPage).toHaveURL(/\/checkout\/confirm/);
  });
});
