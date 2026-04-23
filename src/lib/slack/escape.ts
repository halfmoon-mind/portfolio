/**
 * Escapes Slack control characters. Apply to any user-supplied string
 * before embedding it in mrkdwn payloads. Do NOT apply to markup you
 * own (e.g., the leading `>` of a blockquote or `<url|label>` links).
 *
 * https://api.slack.com/reference/surfaces/formatting#escaping
 */
export function escapeSlackText(input: string): string {
  return input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
