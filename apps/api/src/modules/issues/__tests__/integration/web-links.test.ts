import { describe, it, expect, beforeEach } from 'bun:test';
import { authedApi, type Api, createProject } from '#tests/helpers/app';
import { signUpTestUser } from '#tests/helpers/auth';
import { resetDb } from '#tests/helpers/db';

// Web links: URLs attached to an issue (POST/DELETE /issues/:issueId/web-links),
// listed on the issue read as `webLinks`.

async function setup() {
  const owner = await signUpTestUser();
  const asOwner = authedApi(owner.cookie);
  await createProject(asOwner, { key: 'MKT', name: 'Marketing' });
  const view = await asOwner.projects({ projectKey: 'MKT' }).get();
  const issue = (
    await asOwner
      .projects({ projectKey: 'MKT' })
      .issues.post({ columnId: view.data!.columns[0].id, title: 'Task' })
  ).data!;
  return { asOwner, issue };
}

function add(client: Api, issueId: number, url: string, title?: string | null) {
  return client.issues({ issueId })['web-links'].post({ url, title });
}

async function webLinksOf(client: Api, issueId: number) {
  return (await client.issues({ issueId }).get()).data!.webLinks;
}

describe('issue web links', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('adds a link and lists it on the issue', async () => {
    const { asOwner, issue } = await setup();

    const res = await add(asOwner, issue.id, 'https://example.com/spec', '  Spec  ');
    expect(res.status).toBe(201);
    expect(res.data).toMatchObject({ url: 'https://example.com/spec', title: 'Spec' });
    expect(await webLinksOf(asOwner, issue.id)).toMatchObject([
      { id: res.data!.id, url: 'https://example.com/spec', title: 'Spec' },
    ]);
  });

  it('stores a blank title as null', async () => {
    const { asOwner, issue } = await setup();

    const res = await add(asOwner, issue.id, 'http://example.com', '   ');
    expect(res.data!.title).toBeNull();
  });

  it('rejects a non-http scheme with 400', async () => {
    const { asOwner, issue } = await setup();

    expect((await add(asOwner, issue.id, 'javascript:alert(1)')).status).toBe(400);
    expect((await add(asOwner, issue.id, 'not a url')).status).toBe(400);
    expect(await webLinksOf(asOwner, issue.id)).toEqual([]);
  });

  it('rejects an empty url and one past 2048 characters', async () => {
    const { asOwner, issue } = await setup();

    expect((await add(asOwner, issue.id, '')).status).toBe(400);
    const long = `https://example.com/${'a'.repeat(2048)}`;
    expect((await add(asOwner, issue.id, long)).status).toBe(400);
  });

  it('removes a link', async () => {
    const { asOwner, issue } = await setup();
    const created = (await add(asOwner, issue.id, 'https://example.com')).data!;

    const res = await asOwner
      .issues({ issueId: issue.id })
      ['web-links']({ webLinkId: created.id })
      .delete();
    expect(res.status).toBe(204);
    expect(await webLinksOf(asOwner, issue.id)).toEqual([]);
  });

  it('returns 404 for a link of another issue', async () => {
    const { asOwner, issue } = await setup();
    const created = (await add(asOwner, issue.id, 'https://example.com')).data!;
    const view = await asOwner.projects({ projectKey: 'MKT' }).get();
    const other = (
      await asOwner
        .projects({ projectKey: 'MKT' })
        .issues.post({ columnId: view.data!.columns[0].id, title: 'Other' })
    ).data!;

    const res = await asOwner
      .issues({ issueId: other.id })
      ['web-links']({ webLinkId: created.id })
      .delete();
    expect(res.status).toBe(404);
  });

  it('denies a non-member with 403', async () => {
    const { issue } = await setup();
    const outsider = authedApi((await signUpTestUser()).cookie);

    expect((await add(outsider, issue.id, 'https://example.com')).status).toBe(403);
  });
});
