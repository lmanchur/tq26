import { expect, test } from '@playwright/test';
import { GoRestUser } from '../../api/GoRestUser';
import {
  buildCreateUserDto,
  parseGoRestErrorDto,
  parseUserDto,
  parseUserDtoList,
  USER_EMAIL_PATTERN,
  type UserDto,
} from '../../dtos/gorest-user';

test.describe('GoRest users API', () => {
  test('should return the default user list with valid fields', async ({
    request,
  }) => {
    const goRestUser = new GoRestUser(request);

    const response = await goRestUser.list();
    expect(response.status()).toBe(200);

    const users = parseUserDtoList(await response.json());
    expect(users.length).toBeGreaterThan(0);

    for (const user of users) {
      expect(user.id).toEqual(expect.any(Number));
      expect(user.name).toEqual(expect.any(String));
      expect(user.email).toMatch(USER_EMAIL_PATTERN);
      expect(['male', 'female']).toContain(user.gender);
      expect(['active', 'inactive']).toContain(user.status);
    }
  });

  test('should return a user by id', async ({ request }) => {
    const goRestUser = new GoRestUser(request);
    // Shared GoRest records can disappear between list and get; try a few.
    const listResponse = await goRestUser.list({ per_page: 10 });
    expect(listResponse.status()).toBe(200);
    const users = parseUserDtoList(await listResponse.json());
    expect(users.length).toBeGreaterThan(0);

    let listed = users[0];
    let fetched: UserDto | null = null;
    for (const candidate of users) {
      const response = await goRestUser.getById(candidate.id);
      if (response.status() !== 200) {
        continue;
      }
      listed = candidate;
      fetched = parseUserDto(await response.json());
      break;
    }

    expect(fetched).not.toBeNull();
    expect(fetched!.id).toBe(listed.id);
    expect(fetched!.email).toBe(listed.email);
  });

  test('should return 404 for a missing user', async ({ request }) => {
    const goRestUser = new GoRestUser(request);

    const response = await goRestUser.getById(0);
    expect(response.status()).toBe(404);
    expect(parseGoRestErrorDto(await response.json())).toEqual({
      message: 'Resource not found',
    });
  });

  test('should reject creating a user without authentication', async ({
    request,
  }) => {
    const goRestUser = new GoRestUser(request, '');

    const response = await goRestUser.create(buildCreateUserDto());
    expect(response.status()).toBe(401);
    expect(parseGoRestErrorDto(await response.json())).toEqual({
      message: 'Authentication failed',
    });
  });

  test('should create a user and deny access without a valid token', async ({
    request,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test -- optional local/CI secret
    test.skip(
      !process.env.GOREST_TOKEN,
      'Set GOREST_TOKEN to run authenticated write tests',
    );

    const goRestUser = new GoRestUser(request);
    const payload = buildCreateUserDto();
    const createdResponse = await goRestUser.create(payload);
    expect(createdResponse.status()).toBe(201);

    const created = parseUserDto(await createdResponse.json());
    expect({
      name: created.name,
      email: created.email,
      gender: created.gender,
      status: created.status,
    }).toEqual(payload);

    try {
      const fetchedResponse = await goRestUser.getById(created.id);
      expect(fetchedResponse.status()).toBe(200);
      expect(parseUserDto(await fetchedResponse.json())).toEqual(created);

      const unauthorized = new GoRestUser(request, 'invalid-token');
      const unauthorizedResponse = await unauthorized.getById(created.id);
      expect(unauthorizedResponse.status()).toBe(401);
      expect(parseGoRestErrorDto(await unauthorizedResponse.json())).toEqual({
        message: 'Invalid token',
      });
    } finally {
      const deletedResponse = await goRestUser.delete(created.id);
      expect(deletedResponse.status()).toBe(204);
    }
  });

  test('should create, update, and delete a user', async ({ request }) => {
    // eslint-disable-next-line playwright/no-skipped-test -- optional local/CI secret
    test.skip(
      !process.env.GOREST_TOKEN,
      'Set GOREST_TOKEN to run authenticated write tests',
    );

    const goRestUser = new GoRestUser(request);
    const payload = buildCreateUserDto();
    const createdResponse = await goRestUser.create(payload);
    expect(createdResponse.status()).toBe(201);

    const created = parseUserDto(await createdResponse.json());
    expect({
      name: created.name,
      email: created.email,
      gender: created.gender,
      status: created.status,
    }).toEqual(payload);

    try {
      const updatedResponse = await goRestUser.update(created.id, {
        status: 'inactive',
      });
      expect(updatedResponse.status()).toBe(200);
      expect(parseUserDto(await updatedResponse.json()).status).toBe(
        'inactive',
      );
    } finally {
      const deletedResponse = await goRestUser.delete(created.id);
      expect(deletedResponse.status()).toBe(204);

      const missingResponse = await goRestUser.getById(created.id);
      expect(missingResponse.status()).toBe(404);
    }
  });
});
