import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
  readonly heading: Locator;
  readonly checkout: Locator;
  readonly continueShopping: Locator;
  readonly totalLabel: Locator;
  readonly removeButtons: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Shopping cart' });
    this.checkout = page.getByRole('button', { name: 'Checkout' });
    this.continueShopping = page.getByRole('button', {
      name: 'Continue shopping',
    });
    this.totalLabel = page.getByRole('cell', { name: 'Total:', exact: true });
    this.removeButtons = page.getByTitle('Remove');
  }

  productLink(name: string): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  totalAmount(amount: string): Locator {
    return this.page.getByRole('cell', { name: amount, exact: true });
  }

  colorText(color: string): Locator {
    return this.page.getByText(`Color: ${color}`);
  }

  leatherColorText(color: string): Locator {
    return this.page.getByText(`Leather color: ${color}`);
  }

  async open(): Promise<void> {
    await this.page.goto('https://bearstore-testsite.smartbear.com/cart');
  }

  async startCheckout(): Promise<void> {
    await this.checkout.click();
    await this.page.getByRole('heading', { name: 'Billing address' }).waitFor({
      state: 'visible',
    });
  }

  async clear(): Promise<void> {
    await this.open();
    for (;;) {
      const remaining = await this.removeButtons.count();
      if (remaining === 0) {
        return;
      }
      await this.removeButtons.first().click();
      await expect(this.removeButtons).toHaveCount(remaining - 1);
    }
  }
}
