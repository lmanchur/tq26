export type UserGender = 'male' | 'female';
export type UserStatus = 'active' | 'inactive';

export const USER_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface UserDto {
  id: number;
  name: string;
  email: string;
  gender: UserGender;
  status: UserStatus;
}

export interface CreateUserDto {
  name: string;
  email: string;
  gender: UserGender;
  status: UserStatus;
}

export type UpdateUserDto = Partial<CreateUserDto>;

export interface UserListQuery {
  name?: string;
  email?: string;
  gender?: UserGender;
  status?: UserStatus;
  page?: number;
  per_page?: number;
}

export interface GoRestErrorDto {
  message: string;
}

export function buildCreateUserDto(
  overrides: Partial<CreateUserDto> = {},
): CreateUserDto {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    name: 'GoRest Test User',
    email: `gorest.user.${unique}@example.com`,
    gender: 'female',
    status: 'active',
    ...overrides,
  };
}

export function parseUserDto(value: unknown): UserDto {
  if (!isRecord(value)) {
    throw new Error('Expected a user object');
  }

  const { id, name, email, gender, status } = value;
  if (typeof id !== 'number') {
    throw new Error('User DTO id must be a number');
  }
  if (typeof name !== 'string') {
    throw new Error('User DTO name must be a string');
  }
  if (typeof email !== 'string' || !USER_EMAIL_PATTERN.test(email)) {
    throw new Error('User DTO email must be an email string');
  }
  if (!isUserGender(gender)) {
    throw new Error(`Unexpected gender: ${String(gender)}`);
  }
  if (!isUserStatus(status)) {
    throw new Error(`Unexpected status: ${String(status)}`);
  }

  return { id, name, email, gender, status };
}

export function parseUserDtoList(value: unknown): UserDto[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected an array of users');
  }
  return value.map(parseUserDto);
}

export function parseGoRestErrorDto(value: unknown): GoRestErrorDto {
  if (!isRecord(value) || typeof value.message !== 'string') {
    throw new Error('Expected an error object with a message');
  }
  return { message: value.message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isUserGender(value: unknown): value is UserGender {
  return value === 'male' || value === 'female';
}

function isUserStatus(value: unknown): value is UserStatus {
  return value === 'active' || value === 'inactive';
}
