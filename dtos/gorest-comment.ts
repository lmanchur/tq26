import { USER_EMAIL_PATTERN } from './gorest-user';

export interface CommentDto {
  id: number;
  post_id: number;
  name: string;
  email: string;
  body: string;
}

export interface CreateCommentDto {
  name: string;
  email: string;
  body: string;
}

export interface CommentListQuery {
  post_id?: number;
  name?: string;
  email?: string;
  page?: number;
  per_page?: number;
}

export function buildCreateCommentDto(
  overrides: Partial<CreateCommentDto> = {},
): CreateCommentDto {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    name: 'GoRest Commenter',
    email: `gorest.commenter.${unique}@example.com`,
    body: 'Comment used by the post-comment cascade test.',
    ...overrides,
  };
}

export function parseCommentDto(value: unknown): CommentDto {
  if (!isRecord(value)) {
    throw new Error('Expected a comment object');
  }

  const { id, post_id, name, email, body } = value;
  if (typeof id !== 'number') {
    throw new Error('Comment DTO id must be a number');
  }
  if (typeof post_id !== 'number') {
    throw new Error('Comment DTO post_id must be a number');
  }
  if (typeof name !== 'string') {
    throw new Error('Comment DTO name must be a string');
  }
  if (typeof email !== 'string' || !USER_EMAIL_PATTERN.test(email)) {
    throw new Error('Comment DTO email must be an email string');
  }
  if (typeof body !== 'string') {
    throw new Error('Comment DTO body must be a string');
  }

  return { id, post_id, name, email, body };
}

export function parseCommentDtoList(value: unknown): CommentDto[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected an array of comments');
  }
  return value.map(parseCommentDto);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
