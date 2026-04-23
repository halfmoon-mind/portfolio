import { describe, it, expect } from 'vitest';
import { escapeSlackText } from './escape';

describe('escapeSlackText', () => {
  it('escapes ampersand', () => {
    expect(escapeSlackText('A & B')).toBe('A &amp; B');
  });

  it('escapes angle brackets', () => {
    expect(escapeSlackText('<script>')).toBe('&lt;script&gt;');
  });

  it('neutralizes channel mentions wrapped with angle brackets', () => {
    expect(escapeSlackText('<!channel>')).toBe('&lt;!channel&gt;');
  });

  it('leaves plain text untouched', () => {
    expect(escapeSlackText('Hello world')).toBe('Hello world');
  });

  it('handles all three chars in one string in correct order', () => {
    expect(escapeSlackText('A & <b> c')).toBe('A &amp; &lt;b&gt; c');
  });
});
