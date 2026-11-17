import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { timingSafeEqual } from 'node:crypto';
import {
  listInstalls,
  deleteInstall,
  getState,
  setState,
  type Install,
} from '../../../lib/slack/blobs';
import { buildClipMessage, type SlackMessage } from '../../../lib/slack/block-kit';
import { getClipMetadata, getSourceDomain } from '../../../utils/clips-metadata';
import { byLocale } from '../../../i18n/content';

export const prerender = false;

const DEAD_WORKSPACE_SIGNALS = [
  'account_inactive',
  'no_service',
  'channel_not_found',
  'team_not_found',
  'no_team',
];

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

async function postToSlack(
  install: Install,
  payload: SlackMessage,
): Promise<'ok' | 'dead' | 'fail'> {
  let res: Response;
  try {
    res = await fetch(install.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error('slack fetch threw', install.team_id, err);
    return 'fail';
  }
  if (res.ok) return 'ok';
  const text = await res.text().catch(() => '');
  const deadByStatus = res.status === 404 || res.status === 410;
  const deadBySignal = DEAD_WORKSPACE_SIGNALS.some((s) => text.includes(s));
  if (deadByStatus || deadBySignal) return 'dead';
  console.error('slack non-OK', install.team_id, res.status, text);
  return 'fail';
}

export const POST: APIRoute = async ({ url }) => {
  const provided = url.searchParams.get('token') ?? '';
  const expected = import.meta.env.NETLIFY_WEBHOOK_SECRET ?? '';
  if (!expected || !safeEqual(provided, expected)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const lastRaw = await getState('last_notified_at');
  if (!lastRaw) {
    await setState('last_notified_at', new Date().toISOString());
    return new Response(JSON.stringify({ initialized: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const lastNotifiedAt = new Date(lastRaw);

  // en variants live at /en/clips/<x>; buildClipMessage would link /clips/en/<x> (404). Send ko only.
  const allClips = byLocale(await getCollection('clips'), 'ko');
  const newClips = allClips
    .filter((c) => c.data.pubDate > lastNotifiedAt)
    .sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());

  if (newClips.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const siteUrl = (import.meta.env.PUBLIC_SITE_URL ?? url.origin).replace(/\/$/, '');

  const payloads = newClips.map((c) => {
    const meta = getClipMetadata(c.data.sourceUrl);
    return buildClipMessage({
      slug: c.id,
      title: c.data.title,
      body: c.body ?? '',
      sourceUrl: c.data.sourceUrl,
      sourceTitle:
        c.data.sourceTitle ?? meta?.ogTitle ?? getSourceDomain(c.data.sourceUrl),
      quote: c.data.quote,
      tags: c.data.tags,
      pubDate: c.data.pubDate.toISOString(),
      siteUrl,
    });
  });

  const installs = await listInstalls();
  let cleaned = 0;

  // ponytail: a completed run advances last_notified_at past failed sends (no retry);
  // an interrupted or concurrent run may re-send duplicates. Add per-install cursors if that matters.
  await Promise.all(
    installs.map(async (install) => {
      for (const payload of payloads) {
        const outcome = await postToSlack(install, payload);
        if (outcome === 'dead') {
          await deleteInstall(install.team_id);
          cleaned++;
          break; // stop sending remaining clips to this dead workspace
        }
      }
    }),
  );

  const newest = newClips[newClips.length - 1].data.pubDate.toISOString();
  await setState('last_notified_at', newest);

  return new Response(
    JSON.stringify({
      sent: newClips.length,
      workspaces: installs.length,
      cleaned,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
