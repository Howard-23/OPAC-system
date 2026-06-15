import {
  Channel,
  convertFileSrc as tauriConvertFileSrc,
  invoke as tauriInvoke,
} from '@tauri-apps/api/core';

import { hasTauriInvoke } from '../utils/tauriRuntime';

const resolveApiBaseUrl = () => {
  const configuredUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return null;
    }
  }

  return 'http://localhost:8787/api';
};

const API_BASE_URL = resolveApiBaseUrl();
const DESKTOP_ONLY_MESSAGE = 'This feature is only available in the desktop app.';
const MISSING_API_BASE_URL_MESSAGE =
  'Shared API is not configured. Set VITE_API_BASE_URL in Vercel to your Railway API URL ending in /api, then redeploy.';

const buildUrl = (path: string, query?: Record<string, string | number | undefined | null>) => {
  if (!API_BASE_URL) {
    throw new Error(MISSING_API_BASE_URL_MESSAGE);
  }

  const url = new URL(`${API_BASE_URL}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
};

const readJson = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch (_error) {
    const contentType = response.headers.get('content-type') || 'unknown content type';
    throw new Error(
      `Shared API returned ${contentType} instead of JSON. Check VITE_API_BASE_URL and make sure it points to the Railway API, not the Vercel site.`,
    );
  }
};

const request = async <T>(method: string, path: string, options?: { body?: unknown; query?: Record<string, string | number | undefined | null> }) => {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, options?.query), {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options?.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    if (error instanceof Error && error.message === MISSING_API_BASE_URL_MESSAGE) {
      throw error;
    }

    throw new Error('Shared web API is not reachable. Start `npm run dev:api` from the repo root and try again.');
  }

  const payload = await readJson(response);
  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'error' in payload && typeof payload.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
};

const desktopOnly = () => {
  throw new Error(DESKTOP_ONLY_MESSAGE);
};

const SHARED_API_COMMANDS = new Set([
  'login',
  'logout',
  'get_current_session',
  'check_db_connection',
  'get_catalog_records',
  'get_catalog_count',
  'search_catalog_semantic',
  'create_catalog_record',
  'delete_catalog_record',
  'get_catalog_entry',
  'update_catalog_record',
  'get_holdings',
  'add_holding',
  'delete_holding',
  'get_authors',
  'update_author',
  'delete_author',
  'get_subjects',
  'update_subject',
  'delete_subject',
  'get_patrons',
  'add_patron',
  'update_patron',
  'delete_patron',
  'pay_fine',
  'get_active_loans',
  'check_out_item',
  'return_item',
  'get_circulation_stats',
  'get_overdue_items',
  'get_reservations',
  'add_reservation',
  'serve_reservation',
  'cancel_reservation',
  'audit_item',
  'get_financial_reports',
  'get_acquisitions_report',
  'get_circulation_report',
]);

export const isDesktopRuntime = () => hasTauriInvoke();
export const isWebRuntime = () => !hasTauriInvoke();
export const getApiBaseUrl = () => API_BASE_URL || 'Not configured';
export { Channel };

export const convertFileSrc = (path: string) => (isDesktopRuntime() ? tauriConvertFileSrc(path) : path);

export const invoke = async <T>(command: string, args: Record<string, unknown> = {}) => {
  if (isDesktopRuntime() && !SHARED_API_COMMANDS.has(command)) {
    return tauriInvoke<T>(command, args);
  }

  switch (command) {
    case 'login':
      return request<T>('POST', '/auth/login', { body: args });
    case 'logout':
      return request<T>('POST', '/auth/logout');
    case 'get_current_session':
      return request<T>('GET', '/auth/session');
    case 'maximize_window':
    case 'reset_window_size':
    case 'quit_app':
      return undefined as T;
    case 'check_db_connection':
      await request('GET', '/health');
      return 'Connected to shared web API' as T;
    case 'get_catalog_records':
      return request<T>('GET', '/catalog/records', { query: { page: Number(args.page || 1) } });
    case 'get_catalog_count':
      return request<T>('GET', '/catalog/count');
    case 'search_catalog_semantic':
      return request<T>('GET', '/catalog/search', { query: { query: String(args.query || '') } });
    case 'create_catalog_record':
      return request<T>('POST', '/catalog/records', { body: args });
    case 'delete_catalog_record':
      return request<T>('DELETE', `/catalog/records/${encodeURIComponent(String(args.controlno || ''))}`);
    case 'get_catalog_entry':
      return request<T>('GET', `/catalog/records/${encodeURIComponent(String(args.controlno || ''))}`);
    case 'update_catalog_record':
      return request<T>('PUT', `/catalog/records/${encodeURIComponent(String((args.entry as { controlno?: string } | undefined)?.controlno || ''))}`, {
        body: args.entry,
      });
    case 'get_holdings':
      return request<T>('GET', `/catalog/records/${encodeURIComponent(String(args.controlno || ''))}/holdings`);
    case 'add_holding':
      return request<T>('POST', '/catalog/holdings', { body: args.holding });
    case 'delete_holding':
      return request<T>('DELETE', `/catalog/holdings/${encodeURIComponent(String(args.accession || ''))}`);
    case 'get_authors':
      return request<T>('GET', '/catalog/authors');
    case 'update_author':
      return request<T>('PUT', `/catalog/authors/${encodeURIComponent(String(args.code || ''))}`, { body: { name: args.name } });
    case 'delete_author':
      return request<T>('DELETE', `/catalog/authors/${encodeURIComponent(String(args.code || ''))}`);
    case 'get_subjects':
      return request<T>('GET', '/catalog/subjects');
    case 'update_subject':
      return request<T>('PUT', `/catalog/subjects/${encodeURIComponent(String(args.code || ''))}`, { body: { name: args.name } });
    case 'delete_subject':
      return request<T>('DELETE', `/catalog/subjects/${encodeURIComponent(String(args.code || ''))}`);
    case 'get_patrons':
      return request<T>('GET', '/patrons');
    case 'add_patron':
      return request<T>('POST', '/patrons', { body: args.patron });
    case 'update_patron':
      return request<T>('PUT', `/patrons/${encodeURIComponent(String((args.patron as { idno?: string } | undefined)?.idno || args.idno || ''))}`, {
        body: args.patron,
      });
    case 'delete_patron':
      return request<T>('DELETE', `/patrons/${encodeURIComponent(String(args.idno || ''))}`);
    case 'pay_fine':
      return request<T>('POST', `/patrons/${encodeURIComponent(String(args.idno || ''))}/pay`, { body: { amount: args.amount } });
    case 'get_active_loans':
      return request<T>('GET', '/circulation/loans', { query: { idno: String(args.idno || '') } });
    case 'check_out_item':
      return request<T>('POST', '/circulation/checkout', { body: args });
    case 'return_item':
      return request<T>('POST', '/circulation/return', { body: args });
    case 'get_circulation_stats':
      return request<T>('GET', '/circulation/stats');
    case 'get_overdue_items':
      return request<T>('GET', '/circulation/overdue');
    case 'get_reservations':
      return request<T>('GET', '/circulation/reservations');
    case 'add_reservation':
      return request<T>('POST', '/circulation/reservations', { body: args });
    case 'serve_reservation':
      return request<T>('POST', `/circulation/reservations/${encodeURIComponent(String(args.recNumber || args.rec_number || ''))}/serve`);
    case 'cancel_reservation':
      return request<T>('DELETE', `/circulation/reservations/${encodeURIComponent(String(args.recNumber || args.rec_number || ''))}`);
    case 'audit_item':
      return request<T>('POST', '/inventory/audit', { body: args });
    case 'get_financial_reports':
      return request<T>('GET', '/reports/financial');
    case 'get_acquisitions_report':
      return request<T>('GET', '/reports/acquisitions', {
        query: {
          startDate: String(args.startDate || ''),
          endDate: String(args.endDate || ''),
        },
      });
    case 'get_circulation_report':
      return request<T>('GET', '/reports/circulation', {
        query: {
          startDate: String(args.startDate || ''),
          endDate: String(args.endDate || ''),
        },
      });
    case 'get_logo_path':
      return null as T;
    case 'chat_with_ai':
    case 'check_ollama_model':
    case 'pull_ollama_model':
    case 'get_db_config':
    case 'save_db_config':
    case 'upload_logo':
    case 'process_logo':
    case 'export_settings':
    case 'import_settings':
    case 'import_mdb_database':
      return desktopOnly();
    default:
      throw new Error(`Unsupported web command: ${command}`);
  }
};
