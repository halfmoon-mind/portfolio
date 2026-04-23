import { describe, it, expect } from 'vitest';
import { buildClipMessage, type ClipInput } from './block-kit';

const sample: ClipInput = {
  slug: 'foo-bar',
  title: 'On code review',
  description: 'Short summary.',
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

  it('omits image accessory when heroImage is absent', () => {
    const out = buildClipMessage(sample);
    const raw = JSON.stringify(out.blocks);
    expect(raw.includes('"type":"image"')).toBe(false);
  });

  it('includes accessory image when heroImage is present', () => {
    const out = buildClipMessage({ ...sample, heroImage: 'https://ex.com/i.png' });
    const raw = JSON.stringify(out.blocks);
    expect(raw).toContain('https://ex.com/i.png');
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
