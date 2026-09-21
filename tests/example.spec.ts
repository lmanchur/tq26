import { expect, test } from '@playwright/test';
import { ShopPage } from '../pages/ShopPage';

test.describe('product search', () => {
  test('should show no results for bear', async ({ page }) => {
    const shop = new ShopPage(page);

    await shop.open();
    await shop.search('bear');

    await expect(page).toHaveURL(/q=bear/);
    await expect(shop.searchHeading('bear')).toBeVisible();
    await expect(shop.noResultsMessage).toBeVisible();
  });
});
