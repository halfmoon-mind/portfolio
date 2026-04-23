import type { APIRoute } from 'astro';
import { randomBytes } from 'node:crypto';

export const prerender = false;

export const GET: APIRoute = ({ cookies, redirect, url }) => {
  const clientId = import.meta.env.SLACK_CLIENT_ID;
  const siteUrl = import.meta.env.PUBLIC_SITE_URL ?? url.origin;

  if (!clientId) {
    return new Response('SLACK_CLIENT_ID is not configured', { status: 500 });
  }

  const state = randomBytes(32).toString('hex');
  cookies.set('slack_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'incoming-webhook',
    state,
    redirect_uri: `${siteUrl.replace(/\/$/, '')}/api/slack/oauth/callback`,
  });

  return redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`, 302);
};
