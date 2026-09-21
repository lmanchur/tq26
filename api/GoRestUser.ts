import { type APIRequestContext, type APIResponse } from '@playwright/test';
import type {
  CreateUserDto,
  UpdateUserDto,
  UserListQuery,
} from '../dtos/gorest-user';

const USERS_PATH = '/public/v2/users';

export class GoRestUser {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token: string | undefined = process.env.GOREST_TOKEN,
  ) {}

  async list(query?: UserListQuery): Promise<APIResponse> {
    return this.request.get(USERS_PATH, {
      headers: this.headers(),
      params: this.toParams(query),
    });
  }

  async getById(id: number): Promise<APIResponse> {
    return this.request.get(`${USERS_PATH}/${id}`, {
      headers: this.headers(),
    });
  }

  async create(body: CreateUserDto): Promise<APIResponse> {
    return this.request.post(USERS_PATH, {
      headers: this.headers(),
      data: body,
    });
  }

  async update(id: number, body: UpdateUserDto): Promise<APIResponse> {
    return this.request.patch(`${USERS_PATH}/${id}`, {
      headers: this.headers(),
      data: body,
    });
  }

  async delete(id: number): Promise<APIResponse> {
    return this.request.delete(`${USERS_PATH}/${id}`, {
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

  private toParams(
    query?: UserListQuery,
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
