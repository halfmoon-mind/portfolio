#!/usr/bin/env node
/**
 * Prints a Block Kit JSON payload for a sample clip. Copy the stdout
 * into https://app.slack.com/block-kit-builder to preview exactly how
 * Slack will render it.
 *
 * Usage: node scripts/preview-block-kit.mjs | pbcopy
 */
import { buildClipMessage } from '../src/lib/slack/block-kit.ts';

const sample = {
  slug: 'sample-clip',
  title: '코드 리뷰는 어떻게 죽을까',
  description: '2025년에 사람이 쓴 코드가 죽었다면, 2026년엔 코드 리뷰가 죽는다.',
  sourceUrl: 'https://www.latent.space/p/reviews-dead',
  sourceTitle: 'How to Kill the Code Review',
  quote: 'Review is the last manual bottleneck in a pipeline that is otherwise machine-speed.',
  tags: ['ai', 'engineering', 'future-of-work'],
  heroImage: 'https://substackcdn.com/image/fetch/f_jpg,q_auto:good/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fc28f86d4-01ff-4bce-b152-33d4d9f82683_1958x1082.png',
  pubDate: '2026-04-22T00:00:00.000Z',
  siteUrl: 'https://halfmoon.day',
};

const msg = buildClipMessage(sample);
process.stdout.write(JSON.stringify(msg, null, 2) + '\n');
