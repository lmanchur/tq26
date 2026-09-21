export interface PostDto {
  id: number;
  user_id: number;
  title: string;
  body: string;
}

export interface CreatePostDto {
  title: string;
  body: string;
}

export function buildCreatePostDto(
  overrides: Partial<CreatePostDto> = {},
): CreatePostDto {
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    title: `GoRest test post ${unique}`,
    body: 'Body used by the post-comment cascade test.',
    ...overrides,
  };
}

export function parsePostDto(value: unknown): PostDto {
  if (!isRecord(value)) {
    throw new Error('Expected a post object');
  }

  const { id, user_id, title, body } = value;
  if (typeof id !== 'number') {
    throw new Error('Post DTO id must be a number');
  }
  if (typeof user_id !== 'number') {
    throw new Error('Post DTO user_id must be a number');
  }
  if (typeof title !== 'string') {
    throw new Error('Post DTO title must be a string');
  }
  if (typeof body !== 'string') {
    throw new Error('Post DTO body must be a string');
  }

  return { id, user_id, title, body };
}

export function parsePostDtoList(value: unknown): PostDto[] {
  if (!Array.isArray(value)) {
    throw new Error('Expected an array of posts');
  }
  return value.map(parsePostDto);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
