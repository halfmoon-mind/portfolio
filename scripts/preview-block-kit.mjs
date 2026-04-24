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
  body: [
    '2025년에 사람이 쓴 코드가 죽었다면, 2026년엔 코드 리뷰가 죽는다.',
    '',
    '리뷰는 기계 속도로 흘러가는 파이프라인에서 유일하게 남은 수동 병목이다. 이 글은 그 병목을 어떻게 해체할 수 있는지에 대한 이야기.',
  ].join('\n'),
  sourceUrl: 'https://www.latent.space/p/reviews-dead',
  sourceTitle: 'How to Kill the Code Review',
  quote: 'Review is the last manual bottleneck in a pipeline that is otherwise machine-speed.',
  tags: ['ai', 'engineering', 'future-of-work'],
  pubDate: '2026-04-22T00:00:00.000Z',
  siteUrl: 'https://halfmoon.day',
};

const msg = buildClipMessage(sample);
process.stdout.write(JSON.stringify(msg, null, 2) + '\n');
