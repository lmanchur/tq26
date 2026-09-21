import { type Locator, type Page } from '@playwright/test';

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

  async addToBasket(): Promise<void> {
    await this.addToCart.click();
    await this.goToCart.waitFor({ state: 'visible' });
  }
}
