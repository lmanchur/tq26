import { type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly usernameOrEmail: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;

  constructor(private readonly page: Page) {
    this.usernameOrEmail = page.getByRole('textbox', {
      name: 'Username or email',
    });
    this.password = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Log in' });
  }

  accountMenu(username: string): Locator {
    return this.page.getByRole('link', { name: username });
  }

  async open(): Promise<void> {
    await this.page.goto('https://bearstore-testsite.smartbear.com/login');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameOrEmail.fill(username);
    await this.password.fill(password);
    await this.loginButton.click();
  }
}
