import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { saveInstall } from '../../../../lib/slack/blobs';

export const prerender = false;

type OAuthResponse = {
  ok: boolean;
  error?: string;
  team?: { id: string; name: string };
  incoming_webhook?: {
    url: string;
    channel: string;
    channel_id: string;
  };
};

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export const GET: APIRoute = async ({ cookies, url }) => {
  const code = url.searchParams.get('code') ?? '';
  const state = url.searchParams.get('state') ?? '';
  const cookieState = cookies.get('slack_oauth_state')?.value ?? '';

  if (!state || !cookieState || !safeEqual(state, cookieState)) {
    return new Response('State mismatch', { status: 400 });
  }
  cookies.delete('slack_oauth_state', { path: '/' });

  if (!code) {
    return new Response('Missing code', { status: 400 });
  }

  const clientId = import.meta.env.SLACK_CLIENT_ID;
  const clientSecret = import.meta.env.SLACK_CLIENT_SECRET;
  const siteUrl = (import.meta.env.PUBLIC_SITE_URL ?? url.origin).replace(/\/$/, '');

  if (!clientId || !clientSecret) {
    return new Response('Slack credentials not configured', { status: 500 });
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: `${siteUrl}/api/slack/oauth/callback`,
  });

  const res = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const json = (await res.json()) as OAuthResponse;
  if (!json.ok || !json.team || !json.incoming_webhook) {
    console.error('slack oauth failed', json.error);
    return new Response(`Install failed: ${json.error ?? 'unknown'}`, { status: 500 });
  }

  await saveInstall({
    team_id: json.team.id,
    team_name: json.team.name,
    webhook_url: json.incoming_webhook.url,
    channel: json.incoming_webhook.channel,
    channel_id: json.incoming_webhook.channel_id,
    installed_at: new Date().toISOString(),
  });

  const channel = json.incoming_webhook.channel;
  return new Response(
    `<!doctype html>
<meta charset="utf-8" />
<title>Installed · Half to Full</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;line-height:1.6}</style>
<h1>🌓 Installed!</h1>
<p>New clips will appear in <strong>${channel}</strong>.</p>
<p><a href="https://halfmoon.day/clips">Browse existing clips →</a></p>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
};
