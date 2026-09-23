import { expect, type Locator, type Page } from '@playwright/test';

export class CheckoutPage {
  readonly billToThisAddress: Locator;
  readonly shipToThisAddress: Locator;
  readonly next: Locator;
  readonly agreeToTerms: Locator;
  readonly confirm: Locator;
  readonly shippingMethodHeading: Locator;
  readonly paymentMethodHeading: Locator;
  readonly confirmHeading: Locator;
  readonly termsError: Locator;
  readonly orderReceivedHeading: Locator;
  readonly thankYouHeading: Locator;
  readonly orderNumberLabel: Locator;
  readonly orderNumber: Locator;

  constructor(private readonly page: Page) {
    this.billToThisAddress = page.getByRole('button', {
      name: 'Bill to this address',
    });
    this.shipToThisAddress = page.getByRole('button', {
      name: 'Ship to this address',
    });
    this.next = page.getByRole('button', { name: 'Next' });
    this.agreeToTerms = page.getByRole('checkbox', {
      name: 'I agree with the terms of service',
    });
    this.confirm = page.getByRole('button', { name: 'Confirm' });
    this.shippingMethodHeading = page.getByRole('heading', {
      name: 'Select shipping method',
    });
    this.paymentMethodHeading = page.getByRole('heading', {
      name: 'Select payment method',
    });
    this.confirmHeading = page.getByRole('heading', {
      name: 'Please confirm your order.',
    });
    this.termsError = page.getByText(
      'Please accept the terms of service before the next step.',
    );
    this.orderReceivedHeading = page.getByRole('heading', {
      name: 'Your order has been received',
    });
    this.thankYouHeading = page.getByRole('heading', {
      name: 'Thank you for your purchase!',
    });
    this.orderNumberLabel = page.getByText('Your order number:');
    this.orderNumber = page.getByRole('link', { name: /^\d+$/ });
  }

  async useSavedBillingAddress(): Promise<void> {
    await this.billToThisAddress.click();
    await this.shipToThisAddress.waitFor({ state: 'visible' });
  }

  async useSavedShippingAddress(): Promise<void> {
    await this.shipToThisAddress.click();
    await this.shippingMethodHeading.waitFor({ state: 'visible' });
  }

  async continueWithDefaultShippingMethod(): Promise<void> {
    await this.next.click();
    await this.paymentMethodHeading.waitFor({ state: 'visible' });
  }

  async continueWithDefaultPaymentMethod(): Promise<void> {
    await this.next.click();
    await this.confirmHeading.waitFor({ state: 'visible' });
  }

  async confirmWithoutAcceptingTerms(): Promise<void> {
    await this.confirm.scrollIntoViewIfNeeded();
    await this.confirm.click();
  }

  async agreeToTermsAndConfirmOrder(): Promise<void> {
    await this.agreeToTerms.check();
    await expect(async () => {
      await this.confirm.scrollIntoViewIfNeeded();
      await this.confirm.click();
      await expect(this.orderReceivedHeading).toBeVisible({ timeout: 10_000 });
    }).toPass({ timeout: 60_000 });
  }
}
