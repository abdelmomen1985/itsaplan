import { db, issueWebLink } from '@repo/db';
import { and, asc, eq } from 'drizzle-orm';
import { HttpError, iso } from '#shared/lib';

// Links from an issue to web pages outside the tracker.

export interface IssueWebLinkRow {
  id: number;
  url: string;
  title: string | null;
  createdAt: string;
}

function toRow(row: typeof issueWebLink.$inferSelect): IssueWebLinkRow {
  return { id: row.id, url: row.url, title: row.title, createdAt: iso(row.createdAt) };
}

export async function listIssueWebLinks(issueId: number): Promise<IssueWebLinkRow[]> {
  const rows = await db
    .select()
    .from(issueWebLink)
    .where(eq(issueWebLink.issueId, issueId))
    .orderBy(asc(issueWebLink.id));
  return rows.map(toRow);
}

// Only http and https: the web app renders the url as a link, and any other scheme
// (javascript:, data:) could run script in the reader's session.
function normalizeUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new HttpError(400, 'Invalid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:')
    throw new HttpError(400, 'Only http and https links are allowed');
  return url.toString();
}

export async function addIssueWebLink(
  issueId: number,
  input: { url: string; title?: string | null },
  actorUserId: string,
): Promise<IssueWebLinkRow> {
  const title = input.title?.trim() || null;
  const [row] = await db
    .insert(issueWebLink)
    .values({ issueId, url: normalizeUrl(input.url), title, createdByUserId: actorUserId })
    .returning();
  return toRow(row);
}

// False when the issue has no such link, so a link id of another issue cannot be
// removed through this one.
export async function removeIssueWebLink(issueId: number, linkId: number): Promise<boolean> {
  const removed = await db
    .delete(issueWebLink)
    .where(and(eq(issueWebLink.id, linkId), eq(issueWebLink.issueId, issueId)))
    .returning({ id: issueWebLink.id });
  return removed.length > 0;
}
