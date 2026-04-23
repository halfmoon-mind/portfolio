import { escapeSlackText } from './escape';

export type ClipInput = {
  slug: string;
  title: string;
  description: string;
  sourceUrl: string;
  sourceTitle?: string;
  quote?: string;
  tags?: string[];
  heroImage?: string;
  pubDate: string; // ISO
  siteUrl: string; // e.g. https://halfmoon.day (no trailing slash)
};

export type SlackMessage = {
  text: string;
  blocks: unknown[];
};

export function buildClipMessage(clip: ClipInput): SlackMessage {
  const safeTitle = escapeSlackText(clip.title);
  const safeDescription = escapeSlackText(clip.description);
  const safeQuote = clip.quote ? escapeSlackText(clip.quote) : undefined;
  const sourceLabel = escapeSlackText(clip.sourceTitle ?? clip.sourceUrl);
  const clipUrl = `${clip.siteUrl.replace(/\/$/, '')}/clips/${clip.slug}`;

  const blocks: unknown[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🌓 New clip on Half to Full', emoji: true },
    },
  ];

  const mainSection: Record<string, unknown> = {
    type: 'section',
    text: { type: 'mrkdwn', text: `*${safeTitle}*\n${safeDescription}` },
  };
  if (clip.heroImage) {
    mainSection.accessory = {
      type: 'image',
      image_url: clip.heroImage,
      alt_text: safeTitle,
    };
  }
  blocks.push(mainSection);

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
