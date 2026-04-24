import { describe, it, expect } from 'vitest';
import { buildClipMessage, type ClipInput } from './block-kit';

const sample: ClipInput = {
  slug: 'foo-bar',
  title: 'On code review',
  body: 'Body paragraph one.\n\nBody paragraph two.',
  sourceUrl: 'https://example.com/a',
  sourceTitle: 'Example Post',
  pubDate: '2026-04-22T00:00:00.000Z',
  siteUrl: 'https://halfmoon.day',
};

describe('buildClipMessage', () => {
  it('produces a plain-text fallback that contains the title', () => {
    const out = buildClipMessage(sample);
    expect(out.text).toContain('On code review');
  });

  it('starts with a header block', () => {
    const out = buildClipMessage(sample);
    expect((out.blocks[0] as { type: string }).type).toBe('header');
  });

  it('omits quote block when quote is absent', () => {
    const out = buildClipMessage(sample);
    const raw = JSON.stringify(out.blocks);
    expect(raw.includes('> ')).toBe(false);
  });

  it('includes a blockquote section when quote is present', () => {
    const out = buildClipMessage({ ...sample, quote: 'Brilliant.' });
    const raw = JSON.stringify(out.blocks);
    expect(raw).toContain('> Brilliant.');
  });

  it('escapes control chars inside quote content', () => {
    const out = buildClipMessage({ ...sample, quote: 'I <!channel> said &.' });
    const raw = JSON.stringify(out.blocks);
    expect(raw).toContain('&lt;!channel&gt;');
    expect(raw).toContain('&amp;');
  });

  it('never attaches an image accessory', () => {
    const out = buildClipMessage(sample);
    const raw = JSON.stringify(out.blocks);
    expect(raw.includes('"type":"image"')).toBe(false);
  });

  it('renders the clip body in the main section', () => {
    const out = buildClipMessage(sample);
    const raw = JSON.stringify(out.blocks);
    expect(raw).toContain('Body paragraph one.');
    expect(raw).toContain('Body paragraph two.');
  });

  it('truncates bodies that exceed Slack section limits with an ellipsis', () => {
    const longBody = 'ㄱ'.repeat(5000);
    const out = buildClipMessage({ ...sample, body: longBody });
    const section = (out.blocks[1] as { text: { text: string } }).text.text;
    // `*<title>*\n` prefix adds ~`title.length + 3` chars; body itself must
    // be kept under the 2800-char budget and end with an ellipsis.
    expect(section.length).toBeLessThanOrEqual(2800 + 'On code review'.length + 3);
    expect(section.endsWith('…')).toBe(true);
  });

  it('escapes control chars inside the body', () => {
    const out = buildClipMessage({ ...sample, body: 'Watch out for <!channel> & co.' });
    const raw = JSON.stringify(out.blocks);
    expect(raw).toContain('&lt;!channel&gt;');
    expect(raw).toContain('&amp;');
  });

  it('preserves tag order', () => {
    const out = buildClipMessage({ ...sample, tags: ['zulu', 'alpha', 'mike'] });
    const raw = JSON.stringify(out.blocks);
    const iZ = raw.indexOf('zulu');
    const iA = raw.indexOf('alpha');
    const iM = raw.indexOf('mike');
    expect(iZ).toBeGreaterThan(-1);
    expect(iA).toBeGreaterThan(iZ);
    expect(iM).toBeGreaterThan(iA);
  });

  it('escapes control chars in title', () => {
    const out = buildClipMessage({ ...sample, title: 'A <!channel> & thing' });
    const raw = JSON.stringify(out.blocks);
    expect(raw).toContain('&lt;!channel&gt;');
    expect(raw).toContain('&amp;');
  });

  it('produces an Open button linking to siteUrl/clips/slug', () => {
    const out = buildClipMessage(sample);
    const raw = JSON.stringify(out.blocks);
    expect(raw).toContain('https://halfmoon.day/clips/foo-bar');
  });

  it('includes source link back to sourceUrl with sourceTitle', () => {
    const out = buildClipMessage(sample);
    const raw = JSON.stringify(out.blocks);
    expect(raw).toContain('<https://example.com/a|Example Post>');
  });
});
