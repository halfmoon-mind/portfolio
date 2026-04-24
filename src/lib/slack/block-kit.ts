import { escapeSlackText } from './escape';

export type ClipInput = {
  slug: string;
  title: string;
  body: string;
  sourceUrl: string;
  sourceTitle?: string;
  quote?: string;
  tags?: string[];
  pubDate: string; // ISO
  siteUrl: string; // e.g. https://halfmoon.day (no trailing slash)
};

export type SlackMessage = {
  text: string;
  blocks: unknown[];
};

const BODY_CHAR_BUDGET = 2800;

function truncateBody(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length <= BODY_CHAR_BUDGET) return trimmed;
  return trimmed.slice(0, BODY_CHAR_BUDGET - 1).trimEnd() + '…';
}

export function buildClipMessage(clip: ClipInput): SlackMessage {
  const safeTitle = escapeSlackText(clip.title);
  const safeBody = escapeSlackText(truncateBody(clip.body));
  const safeQuote = clip.quote ? escapeSlackText(clip.quote) : undefined;
  const sourceLabel = escapeSlackText(clip.sourceTitle ?? clip.sourceUrl);
  const clipUrl = `${clip.siteUrl.replace(/\/$/, '')}/clips/${clip.slug}`;

  const blocks: unknown[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🌓 New clip on Half to Full', emoji: true },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*${safeTitle}*\n${safeBody}` },
    },
  ];

  if (safeQuote) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `> ${safeQuote}` },
    });
  }

  if (clip.tags && clip.tags.length > 0) {
    const tagText = clip.tags.map((t) => `\`${escapeSlackText(t)}\``).join(' · ');
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: `🏷 ${tagText}` }],
    });
  }

  blocks.push({
    type: 'context',
    elements: [
      { type: 'mrkdwn', text: `Source: <${clip.sourceUrl}|${sourceLabel}>` },
    ],
  });

  blocks.push({
    type: 'actions',
    elements: [
      {
        type: 'button',
        text: { type: 'plain_text', text: 'Open on halfmoon.day', emoji: true },
        url: clipUrl,
        style: 'primary',
      },
    ],
  });

  return {
    text: `New clip on Half to Full: ${clip.title}`,
    blocks,
  };
}
