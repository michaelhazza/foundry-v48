import { encrypt, decrypt } from '../lib/encryption';
import { env } from '../lib/env';
import { ValidationError } from '../lib/errors';

export interface TeamworkDeskConfig {
  provider: 'teamwork_desk';
  siteName: string;
  apiKey: string; // stored as "enc:<encrypted>" or "plain:<value>"
  dataType: 'tickets';
}

// Teamwork Desk API base URL builder
function apiBase(siteName: string): string {
  return `https://${siteName}.teamwork.com/desk/api/v2`;
}

// Store API key with encryption in production, prefixed plaintext in dev
function storeApiKey(apiKey: string): string {
  if (env.ENCRYPTION_KEY) {
    return `enc:${encrypt(apiKey)}`;
  }
  return `plain:${apiKey}`;
}

// Retrieve raw API key from stored value
function retrieveApiKey(stored: string): string {
  if (stored.startsWith('enc:')) {
    return decrypt(stored.slice(4));
  }
  if (stored.startsWith('plain:')) {
    return stored.slice(6);
  }
  // Legacy: untagged value treated as plaintext
  return stored;
}

async function teamworkRequest(siteName: string, apiKey: string, path: string): Promise<any> {
  const url = `${apiBase(siteName)}${path}`;
  const credentials = Buffer.from(`${apiKey}:`).toString('base64');

  const response = await fetch(url, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    throw new ValidationError('Invalid Teamwork Desk API key or site name');
  }

  if (response.status === 404) {
    throw new ValidationError('Teamwork Desk site not found. Check your site name.');
  }

  if (response.status === 429) {
    throw new ValidationError('Teamwork Desk API rate limit exceeded. Please try again later.');
  }

  if (!response.ok) {
    throw new ValidationError(`Teamwork Desk API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function testConnection(
  siteName: string,
  apiKey: string
): Promise<{ success: boolean; message: string }> {
  if (!siteName || !siteName.trim()) {
    throw new ValidationError('Site name is required');
  }

  if (!apiKey || !apiKey.trim()) {
    throw new ValidationError('API key is required');
  }

  await teamworkRequest(siteName.trim(), apiKey.trim(), '/tickets.json?pageSize=1');

  return { success: true, message: 'Successfully connected to Teamwork Desk' };
}

export function buildConfig(
  siteName: string,
  apiKey: string,
  dataType: 'tickets' = 'tickets'
): TeamworkDeskConfig {
  return {
    provider: 'teamwork_desk',
    siteName: siteName.trim(),
    apiKey: storeApiKey(apiKey.trim()),
    dataType,
  };
}

export async function fetchTickets(
  config: TeamworkDeskConfig,
  options: { pageSize?: number; maxRecords?: number } = {}
): Promise<any[]> {
  const apiKey = retrieveApiKey(config.apiKey);
  const pageSize = Math.min(options.pageSize ?? 50, 50);
  const maxRecords = options.maxRecords ?? 5000;

  const tickets: any[] = [];
  let pageOffset = 0;
  let totalCount: number | null = null;

  while (true) {
    const data = await teamworkRequest(
      config.siteName,
      apiKey,
      `/tickets.json?pageSize=${pageSize}&pageOffset=${pageOffset}`
    );

    const pageTickets: any[] = data.tickets ?? [];
    tickets.push(...pageTickets);

    if (totalCount === null && data.meta?.page?.count !== undefined) {
      totalCount = data.meta.page.count as number;
    }

    const exhausted = pageTickets.length < pageSize;
    const reachedTotal = totalCount !== null && tickets.length >= totalCount;
    const reachedMax = tickets.length >= maxRecords;

    if (exhausted || reachedTotal || reachedMax) {
      break;
    }

    pageOffset += pageSize;
  }

  return tickets;
}
