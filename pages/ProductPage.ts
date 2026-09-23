import { expect, type Locator, type Page } from '@playwright/test';

export class ProductPage {
  readonly addToCart: Locator;
  readonly goToCart: Locator;
  readonly heading: Locator;

  constructor(private readonly page: Page) {
    this.addToCart = page.getByRole('link', { name: 'Add to cart' });
    this.goToCart = page.getByRole('link', { name: 'Go to cart' });
    this.heading = page.getByRole('heading', { level: 1 });
  }

  async open(slug: string): Promise<void> {
    await this.page.goto(`https://bearstore-testsite.smartbear.com/${slug}`);
  }

  async selectColor(name: string): Promise<void> {
    await this.page.getByTitle(name, { exact: true }).first().click();
  }

  async selectLeatherColor(name: string): Promise<void> {
    await this.page.getByTitle(name, { exact: true }).last().click();
  }

  async addToBasket(): Promise<void> {
    await expect(async () => {
      await this.addToCart.click();
      await expect(this.goToCart).toBeVisible({ timeout: 5_000 });
    }).toPass({ timeout: 20_000 });
  }
}
