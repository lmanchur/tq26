import { expect, test } from '@playwright/test';
import { GoRestComment } from '../../api/GoRestComment';
import { GoRestPost } from '../../api/GoRestPost';
import { GoRestUser } from '../../api/GoRestUser';
import {
  buildCreateCommentDto,
  parseCommentDto,
  parseCommentDtoList,
} from '../../dtos/gorest-comment';
import {
  buildCreatePostDto,
  parsePostDto,
  parsePostDtoList,
} from '../../dtos/gorest-post';
import {
  buildCreateUserDto,
  parseGoRestErrorDto,
  parseUserDto,
} from '../../dtos/gorest-user';

test.describe('GoRest post comments API', () => {
  test('should remove a comment when the post author deletes the post', async ({
    request,
  }) => {
    // eslint-disable-next-line playwright/no-skipped-test -- optional local/CI secret
    test.skip(
      !process.env.GOREST_TOKEN,
      'Set GOREST_TOKEN to run authenticated write tests',
    );

    const goRestUser = new GoRestUser(request);
    const goRestPost = new GoRestPost(request);
    const goRestComment = new GoRestComment(request);
    const createdUserIds: number[] = [];

    try {
      const firstResponse = await goRestUser.create(
        buildCreateUserDto({ name: 'GoRest Post Author' }),
      );
      expect(firstResponse.status()).toBe(201);
      const firstUser = parseUserDto(await firstResponse.json());
      createdUserIds.push(firstUser.id);

      const secondResponse = await goRestUser.create(
        buildCreateUserDto({ name: 'GoRest Comment Author', gender: 'male' }),
      );
      expect(secondResponse.status()).toBe(201);
      const secondUser = parseUserDto(await secondResponse.json());
      createdUserIds.push(secondUser.id);

      const postResponse = await goRestPost.createForUser(
        firstUser.id,
        buildCreatePostDto(),
      );
      expect(postResponse.status()).toBe(201);
      const post = parsePostDto(await postResponse.json());
      expect(post.user_id).toBe(firstUser.id);

      const commentResponse = await goRestComment.createForPost(
        post.id,
        buildCreateCommentDto({
          name: secondUser.name,
          email: secondUser.email,
        }),
      );
      expect(commentResponse.status()).toBe(201);
      const comment = parseCommentDto(await commentResponse.json());
      expect(comment.post_id).toBe(post.id);
      expect(comment.email).toBe(secondUser.email);

      const commentsForAuthor = await goRestComment.listByPost(post.id);
      expect(commentsForAuthor.status()).toBe(200);
      expect(
        parseCommentDtoList(await commentsForAuthor.json()).map(({ id }) => id),
      ).toContain(comment.id);

      const commentsForCommenter = await goRestComment.list({
        email: secondUser.email,
      });
      expect(commentsForCommenter.status()).toBe(200);
      expect(
        parseCommentDtoList(await commentsForCommenter.json()).map(
          ({ id }) => id,
        ),
      ).toContain(comment.id);

      const deletedPost = await goRestPost.delete(post.id);
      expect(deletedPost.status()).toBe(204);

      const authorPost = await goRestPost.getById(post.id);
      expect(authorPost.status()).toBe(404);
      expect(parseGoRestErrorDto(await authorPost.json())).toEqual({
        message: 'Resource not found',
      });

      const authorPosts = await goRestPost.listByUser(firstUser.id);
      expect(authorPosts.status()).toBe(200);
      expect(
        parsePostDtoList(await authorPosts.json()).map(({ id }) => id),
      ).not.toContain(post.id);

      const authorCommentsAfterDelete = await goRestComment.listByPost(post.id);
      expect(authorCommentsAfterDelete.status()).toBe(200);
      expect(
        parseCommentDtoList(await authorCommentsAfterDelete.json()),
      ).toEqual([]);

      const missingForAuthor = await goRestComment.getById(comment.id);
      expect(missingForAuthor.status()).toBe(404);
      expect(parseGoRestErrorDto(await missingForAuthor.json())).toEqual({
        message: 'Resource not found',
      });

      const missingForCommenter = await goRestComment.getById(comment.id);
      expect(missingForCommenter.status()).toBe(404);
      expect(parseGoRestErrorDto(await missingForCommenter.json())).toEqual({
        message: 'Resource not found',
      });

      const commenterCommentsAfterDelete = await goRestComment.list({
        email: secondUser.email,
      });
      expect(commenterCommentsAfterDelete.status()).toBe(200);
      expect(
        parseCommentDtoList(await commenterCommentsAfterDelete.json()).map(
          ({ id }) => id,
        ),
      ).not.toContain(comment.id);
    } finally {
      for (const userId of createdUserIds.reverse()) {
        await goRestUser.delete(userId);
      }
    }
  });

  test('should return 404 for a missing comment', async ({ request }) => {
    const goRestComment = new GoRestComment(request);

    const response = await goRestComment.getById(0);
    expect(response.status()).toBe(404);
    expect(parseGoRestErrorDto(await response.json())).toEqual({
      message: 'Resource not found',
    });
  });

  test('should reject creating a comment without authentication', async ({
    request,
  }) => {
    const goRestComment = new GoRestComment(request, '');

    const response = await goRestComment.createForPost(
      1,
      buildCreateCommentDto(),
    );
    expect(response.status()).toBe(401);
    expect(parseGoRestErrorDto(await response.json())).toEqual({
      message: 'Authentication failed',
    });
  });
});
