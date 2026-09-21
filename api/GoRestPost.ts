import { type APIRequestContext, type APIResponse } from '@playwright/test';
import type { CreatePostDto } from '../dtos/gorest-post';

const USERS_PATH = '/public/v2/users';
const POSTS_PATH = '/public/v2/posts';

export class GoRestPost {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token: string | undefined = process.env.GOREST_TOKEN,
  ) {}

  async listByUser(userId: number): Promise<APIResponse> {
    return this.request.get(`${USERS_PATH}/${userId}/posts`, {
      headers: this.headers(),
    });
  }

  async getById(id: number): Promise<APIResponse> {
    return this.request.get(`${POSTS_PATH}/${id}`, {
      headers: this.headers(),
    });
  }

  async createForUser(
    userId: number,
    body: CreatePostDto,
  ): Promise<APIResponse> {
    return this.request.post(`${USERS_PATH}/${userId}/posts`, {
      headers: this.headers(),
      data: body,
    });
  }

  async delete(id: number): Promise<APIResponse> {
    return this.request.delete(`${POSTS_PATH}/${id}`, {
      headers: this.headers(),
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
}
