import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { expect, test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import {
  BEARSTORE_PASSWORD,
  BEARSTORE_USERNAME,
} from '../test-data/bearstore';

const authFile = path.join('playwright', '.auth', 'user.json');

setup('authenticate', async ({ page }) => {
  mkdirSync(path.dirname(authFile), { recursive: true });

  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(BEARSTORE_USERNAME, BEARSTORE_PASSWORD);

  await expect(loginPage.accountMenu(BEARSTORE_USERNAME)).toBeVisible();

  await page.context().storageState({ path: authFile });
});
