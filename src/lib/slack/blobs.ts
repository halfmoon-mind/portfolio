import { getStore, type Store } from '@netlify/blobs';

const STORE_NAME = 'slack-clips-bot';
const INSTALL_PREFIX = 'installs:';
const STATE_PREFIX = 'state:';

export type Install = {
  team_id: string;
  team_name: string;
  webhook_url: string;
  channel: string;
  channel_id: string;
  installed_at: string; // ISO
};

function store(): Store {
  return getStore(STORE_NAME);
}

export async function saveInstall(install: Install): Promise<void> {
  await store().setJSON(`${INSTALL_PREFIX}${install.team_id}`, install);
}

export async function getInstall(team_id: string): Promise<Install | null> {
  const v = (await store().get(`${INSTALL_PREFIX}${team_id}`, { type: 'json' })) as Install | null;
  return v ?? null;
}

export async function deleteInstall(team_id: string): Promise<void> {
  await store().delete(`${INSTALL_PREFIX}${team_id}`);
}

export async function listInstalls(): Promise<Install[]> {
  const { blobs } = await store().list({ prefix: INSTALL_PREFIX });
  const results = await Promise.all(
    blobs.map((b) => store().get(b.key, { type: 'json' }) as Promise<Install | null>),
  );
  return results.filter((x): x is Install => x !== null);
}

export async function getState(key: string): Promise<string | null> {
  const v = await store().get(`${STATE_PREFIX}${key}`);
  return typeof v === 'string' ? v : null;
}

export async function setState(key: string, value: string): Promise<void> {
  await store().set(`${STATE_PREFIX}${key}`, value);
}
