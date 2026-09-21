import { type Locator, type Page } from '@playwright/test';

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

  async open(): Promise<void> {
    await this.page.goto('https://bearstore-testsite.smartbear.com/cart');
  }

  async clear(): Promise<void> {
    await this.open();
    while ((await this.removeButtons.count()) > 0) {
      const remove = this.removeButtons.first();
      const productName = await remove.getAttribute('data-name');
      await remove.click();
      if (productName) {
        await this.productLink(productName).waitFor({ state: 'hidden' });
      } else {
        await remove.waitFor({ state: 'hidden' });
      }
    }
  }
}
