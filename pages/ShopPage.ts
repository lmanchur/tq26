import { type Locator, type Page } from '@playwright/test';

export class ShopPage {
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly noResultsMessage: Locator;

  constructor(private readonly page: Page) {
    this.searchBox = page.getByRole('textbox', {
      name: 'What are you looking for?',
    });
    this.searchButton = page.getByTitle('Search');
    this.noResultsMessage = page.getByText(
      'Your search did not match any products.',
    );
  }

  searchHeading(term: string): Locator {
    return this.page.getByRole('heading', {
      name: `Search result for ${term}`,
    });
  }

  productLink(name: string | RegExp): Locator {
    return this.page.getByRole('heading', { name }).getByRole('link');
  }

  async open(): Promise<void> {
    await this.page.goto('https://bearstore-testsite.smartbear.com/');
  }

  async search(term: string): Promise<void> {
    await this.searchBox.fill(term);
    await this.searchButton.click();
  }
}
