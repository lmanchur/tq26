import { type APIRequestContext, type APIResponse } from '@playwright/test';
import type {
  CommentListQuery,
  CreateCommentDto,
} from '../dtos/gorest-comment';

const POSTS_PATH = '/public/v2/posts';
const COMMENTS_PATH = '/public/v2/comments';

export class GoRestComment {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token: string | undefined = process.env.GOREST_TOKEN,
  ) {}

  async list(query?: CommentListQuery): Promise<APIResponse> {
    return this.request.get(COMMENTS_PATH, {
      headers: this.headers(),
      params: this.toParams(query),
    });
  }

  async listByPost(postId: number): Promise<APIResponse> {
    return this.request.get(`${POSTS_PATH}/${postId}/comments`, {
      headers: this.headers(),
    });
  }

  async getById(id: number): Promise<APIResponse> {
    return this.request.get(`${COMMENTS_PATH}/${id}`, {
      headers: this.headers(),
    });
  }

  async createForPost(
    postId: number,
    body: CreateCommentDto,
  ): Promise<APIResponse> {
    return this.request.post(`${POSTS_PATH}/${postId}/comments`, {
      headers: this.headers(),
      data: body,
    });
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  private toParams(
    query?: CommentListQuery,
  ): Record<string, string | number> | undefined {
    if (!query) {
      return undefined;
    }

    const params: Record<string, string | number> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params[key] = value;
      }
    }
    return params;
  }
}
