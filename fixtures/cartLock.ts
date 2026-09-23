import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test as baseTest } from '@playwright/test';

const cartLockPath = path.join('playwright', '.auth', 'cart.lock');

async function acquireCartLock(): Promise<void> {
  await mkdir(path.dirname(cartLockPath), { recursive: true });
  for (;;) {
    try {
      await writeFile(cartLockPath, String(process.pid), { flag: 'wx' });
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
}

async function releaseCartLock(): Promise<void> {
  await unlink(cartLockPath).catch(() => undefined);
}

export function registerSharedCartLock(test: typeof baseTest): void {
  let held = false;

  test.beforeAll(async ({}, testInfo) => {
    testInfo.setTimeout(15 * 60_000);
    await acquireCartLock();
    held = true;
  });

  test.afterAll(async () => {
    if (held) {
      await releaseCartLock();
    }
  });
}
