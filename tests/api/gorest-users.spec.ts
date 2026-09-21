import { expect, test } from '@playwright/test';
import { GoRestUser } from '../../api/GoRestUser';
import {
  buildCreateUserDto,
  parseGoRestErrorDto,
  parseUserDto,
  parseUserDtoList,
  USER_EMAIL_PATTERN,
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
    const createResponse = await goRestUser.create(buildCreateUserDto());
    expect(createResponse.status()).toBe(201);
    const created = parseUserDto(await createResponse.json());

    const response = await goRestUser.getById(created.id);
    expect(response.status()).toBe(200);
    expect(parseUserDto(await response.json())).toEqual(created);

    await goRestUser.delete(created.id);
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
