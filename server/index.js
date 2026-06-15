import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const APP_DIR = path.join(ROOT_DIR, 'lib-mgmt');
const SERVER_ENV_PATH = path.join(__dirname, '.env');
const APP_ENV_PATH = path.join(APP_DIR, '.env');

const loadEnvFile = (envPath) => {
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

loadEnvFile(SERVER_ENV_PATH);
loadEnvFile(APP_ENV_PATH);

const DATABASE_URL = process.env.DEV_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('Missing DATABASE_URL or DEV_DATABASE_URL for the shared API server.');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 5,
});

const sessions = new Map();
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 8787);
const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
const LOCAL_APP_ORIGIN_PATTERN = /^tauri:\/\/localhost$/i;
const allowedOrigins = new Set(
  String(process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim().replace(/\/+$/, ''))
    .filter(Boolean),
);

const json = (res, statusCode, payload, headers = {}) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
  res.end(JSON.stringify(payload));
};

const parseBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
};

const parseCookies = (headerValue = '') =>
  headerValue
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = decodeURIComponent(part.slice(0, separatorIndex).trim());
      const value = decodeURIComponent(part.slice(separatorIndex + 1).trim());
      accumulator[key] = value;
      return accumulator;
    }, {});

const normalizePath = (value) => value.replace(/\/+$/, '') || '/';

const readSession = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies.infolib_sid;

  if (!sessionId) {
    return null;
  }

  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    return null;
  }

  return { sessionId, session };
};

const requestIsSecure = (req) => {
  const forwardedProtoHeader = req.headers['x-forwarded-proto'];
  const forwardedProtoValue = Array.isArray(forwardedProtoHeader) ? forwardedProtoHeader[0] : forwardedProtoHeader;
  const forwardedProto = String(forwardedProtoValue || '')
    .split(',')[0]
    .trim()
    .toLowerCase();

  return forwardedProto === 'https' || req.socket.encrypted === true;
};

const formatCookie = (req, sessionId, maxAgeSeconds) => {
  const secureRequest = requestIsSecure(req);
  const parts = [
    `infolib_sid=${encodeURIComponent(sessionId)}`,
    'Path=/',
    'HttpOnly',
    `SameSite=${secureRequest ? 'None' : 'Lax'}`,
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (secureRequest) {
    parts.push('Secure');
  }

  return parts.join('; ');
};

const setSessionCookie = (req, sessionId) => formatCookie(req, sessionId, SESSION_TTL_MS / 1000);
const clearSessionCookie = (req) => formatCookie(req, '', 0);

const ensureCors = (req, res) => {
  const origin = req.headers.origin;
  if (!origin) {
    return;
  }

  const normalizedOrigin = origin.trim().replace(/\/+$/, '');
  if (LOCAL_ORIGIN_PATTERN.test(normalizedOrigin) || LOCAL_APP_ORIGIN_PATTERN.test(normalizedOrigin) || allowedOrigins.has(normalizedOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
};

const fail = (res, statusCode, message) => json(res, statusCode, { error: message });

const sanitizeNullableString = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : null;
};

const ensureAuthorCode = async (client, authorName) => {
  const normalized = sanitizeNullableString(authorName);
  if (!normalized) {
    return 0;
  }

  const existing = await client.query(
    'SELECT "AuthorCode" FROM "public"."tblAuthor" WHERE LOWER("Author") = LOWER($1) LIMIT 1',
    [normalized],
  );

  if (existing.rowCount) {
    return existing.rows[0].AuthorCode;
  }

  const nextCodeResult = await client.query('SELECT COALESCE(MAX("AuthorCode"), 0) + 1 AS next_code FROM "public"."tblAuthor"');
  const nextCode = Number(nextCodeResult.rows[0].next_code);

  await client.query('INSERT INTO "public"."tblAuthor" ("AuthorCode", "Author") VALUES ($1, $2)', [nextCode, normalized]);
  return nextCode;
};

const ensureSubjectCode = async (client, subjectName) => {
  const normalized = sanitizeNullableString(subjectName);
  if (!normalized) {
    return null;
  }

  const existing = await client.query(
    'SELECT "SubjectCode" FROM "public"."tblSubject" WHERE LOWER("subject") = LOWER($1) LIMIT 1',
    [normalized],
  );

  if (existing.rowCount) {
    return existing.rows[0].SubjectCode;
  }

  const nextCodeResult = await client.query('SELECT COALESCE(MAX("SubjectCode"), 0) + 1 AS next_code FROM "public"."tblSubject"');
  const nextCode = Number(nextCodeResult.rows[0].next_code);

  await client.query('INSERT INTO "public"."tblSubject" ("SubjectCode", "subject") VALUES ($1, $2)', [nextCode, normalized]);
  return nextCode;
};

const mapCatalogRecord = (row, index, page = 1) => ({
  id: (page - 1) * 20 + index + 1,
  controlno: row.controlno ?? '',
  title: row.title ?? '',
  author: row.author ?? 'Unknown',
  callno: row.callno ?? '',
  year: row.year ?? '',
});

const mapSessionUser = (username, profile, roleSnapshot) => ({
  username,
  displayName: profile?.display_name || username,
  idno: profile?.idno || null,
  email: profile?.email || null,
  primaryRole: roleSnapshot.roles.includes('Admin')
    ? 'Admin'
    : roleSnapshot.roles.includes('Librarian')
      ? 'Librarian'
      : roleSnapshot.roles[0] || 'Patron',
  roles: roleSnapshot.roles,
});

const loadPasswordRecord = async (client, username) => {
  const result = await client.query(
    'SELECT "username", "passwrd" FROM "public"."tblPassword" WHERE "username" = $1 LIMIT 1',
    [username],
  );

  if (!result.rowCount) {
    throw new Error('Invalid username or password.');
  }

  return {
    username: result.rows[0].username,
    password: result.rows[0].passwrd,
  };
};

const loadPermissionSnapshot = async (client, username) => {
  const result = await client.query(
    `
      SELECT
        r."RoleName" AS role_name,
        p."PermName" AS perm_name,
        ur."Idno" AS linked_idno
      FROM "public"."tblUserRoles" ur
      INNER JOIN "public"."tblRoles" r
        ON r."RoleID" = ur."RoleID"
      LEFT JOIN "public"."tblRolePermissions" rp
        ON rp."RoleID" = r."RoleID"
      LEFT JOIN "public"."tblPermissions" p
        ON p."PermID" = rp."PermID"
      WHERE ur."username" = $1 OR ur."Idno" = $1
    `,
    [username],
  );

  const roles = [...new Set(result.rows.map((row) => row.role_name).filter(Boolean))];
  if (roles.length === 0) {
    throw new Error('No RBAC role is assigned to this account.');
  }

  const permissions = [...new Set(result.rows.map((row) => row.perm_name).filter(Boolean))];
  const linkedIdno = result.rows.find((row) => row.linked_idno)?.linked_idno ?? null;

  return {
    roles,
    permissions,
    linkedIdno,
  };
};

const loadUserProfile = async (client, username, linkedIdno) => {
  const result = await client.query(
    'SELECT "Name", "Idno", "Email" FROM "public"."tblUser" WHERE "Idno" = $1 OR "Idno" = $2 LIMIT 1',
    [username, linkedIdno || ''],
  );

  if (!result.rowCount) {
    return null;
  }

  const row = result.rows[0];
  return {
    display_name: row.Name || username,
    idno: row.Idno || null,
    email: row.Email || null,
  };
};

const getAuthenticatedSession = (req, requiredPermission) => {
  const active = readSession(req);

  if (!active) {
    const error = new Error('Unauthorized. Please log in.');
    error.statusCode = 401;
    throw error;
  }

  const { sessionId, session } = active;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(sessionId);
    const error = new Error('Session expired. Please log in again.');
    error.statusCode = 401;
    throw error;
  }

  if (requiredPermission && !session.permissions.includes(requiredPermission)) {
    const error = new Error(`Missing permission: ${requiredPermission}`);
    error.statusCode = 403;
    throw error;
  }

  return session;
};

const migrateDatabase = async () => {
  // Create tables if they do not exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "public"."tblAuthor" (
      "AuthorCode" INTEGER PRIMARY KEY,
      "Author" TEXT
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "public"."tblSubject" (
      "SubjectCode" INTEGER PRIMARY KEY,
      "subject" TEXT
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "public"."tblCat" (
      "controlno" TEXT PRIMARY KEY,
      "Title" TEXT,
      "Callno" TEXT,
      "AuthorCode" INTEGER,
      "Edition" TEXT,
      "Pagination" TEXT,
      "Publisher" TEXT,
      "Pubplace" TEXT,
      "Copyright" TEXT,
      "ISBN" TEXT,
      "Subject1Code" INTEGER,
      "Subject2Code" INTEGER,
      "Subject3Code" INTEGER,
      "SeriesTitle" TEXT,
      "AEntryTitle" TEXT,
      "AEAuthor1Code" INTEGER,
      "AEAuthor2Code" INTEGER,
      "AEAuthor3Code" INTEGER,
      "Material" TEXT,
      "xNotes" TEXT
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "public"."tblHoldings" (
      "Accession" TEXT PRIMARY KEY,
      "controlno" TEXT,
      "Copy" TEXT,
      "Location" TEXT,
      "DueDate" TIMESTAMP,
      "Status" TEXT DEFAULT 'Available'
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "public"."tblPassword" (
      "username" TEXT PRIMARY KEY,
      "passwrd" TEXT
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "public"."tblUser" (
      "Idno" TEXT PRIMARY KEY,
      "Name" TEXT,
      "Email" TEXT
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "public"."tblRoles" (
      "RoleID" INTEGER PRIMARY KEY,
      "RoleName" TEXT
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "public"."tblPermissions" (
      "PermID" INTEGER PRIMARY KEY,
      "PermName" TEXT
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "public"."tblRolePermissions" (
      "RoleID" INTEGER,
      "PermID" INTEGER,
      PRIMARY KEY ("RoleID", "PermID")
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "public"."tblUserRoles" (
      "username" TEXT,
      "RoleID" INTEGER,
      "Idno" TEXT,
      PRIMARY KEY ("username", "RoleID")
    )
  `);

  // Add new columns to existing tables
  await pool.query('ALTER TABLE "public"."tblCat" ADD COLUMN IF NOT EXISTS date_added TIMESTAMP DEFAULT NOW()');
  await pool.query('ALTER TABLE "public"."tblHoldings" ADD COLUMN IF NOT EXISTS last_audit TIMESTAMP');
  await pool.query('ALTER TABLE "public"."tblHoldings" ADD COLUMN IF NOT EXISTS date_acquired TIMESTAMP DEFAULT NOW()');
};

const routes = [
  {
    method: 'GET',
    pattern: /^\/api\/health$/,
    handler: async (_req, res) => {
      await pool.query('SELECT 1');
      json(res, 200, { ok: true, mode: 'shared-postgres' });
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/auth\/login$/,
    handler: async (req, res) => {
      const body = await parseBody(req);
      const username = String(body.username || '').trim();
      const password = String(body.password || '').trim();

      if (!username || !password) {
        return fail(res, 400, 'Username and password are required.');
      }

      const client = await pool.connect();
      try {
        const authRecord = await loadPasswordRecord(client, username);
        if (!authRecord.password || authRecord.password !== password) {
          return fail(res, 401, 'Invalid username or password.');
        }

        const permissionSnapshot = await loadPermissionSnapshot(client, username);
        const profile = await loadUserProfile(client, username, permissionSnapshot.linkedIdno);
        const expiresAt = Date.now() + SESSION_TTL_MS;
        const session = {
          user: mapSessionUser(authRecord.username, profile, permissionSnapshot),
          permissions: permissionSnapshot.permissions,
          expiresAt,
        };

        const sessionId = randomUUID();
        sessions.set(sessionId, session);

        json(
          res,
          200,
          session,
          {
            'Set-Cookie': setSessionCookie(req, sessionId),
          },
        );
      } finally {
        client.release();
      }
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/auth\/logout$/,
    handler: async (req, res) => {
      const active = readSession(req);
      if (active) {
        sessions.delete(active.sessionId);
      }

      json(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie(req) });
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/auth\/session$/,
    handler: async (req, res) => {
      const active = readSession(req);
      json(res, 200, active?.session ?? null);
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/catalog\/records$/,
    handler: async (req, res, url) => {
      getAuthenticatedSession(req, 'catalog:read');
      const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
      const offset = (page - 1) * 20;
      const result = await pool.query(
        `
          SELECT
            c."controlno" AS controlno,
            c."Title" AS title,
            a."Author" AS author,
            c."Callno" AS callno,
            c."Copyright" AS year
          FROM "public"."tblCat" c
          LEFT JOIN "public"."tblAuthor" a ON c."AuthorCode" = a."AuthorCode"
          ORDER BY c."controlno" DESC
          LIMIT 20 OFFSET $1
        `,
        [offset],
      );

      json(res, 200, result.rows.map((row, index) => mapCatalogRecord(row, index, page)));
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/catalog\/count$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'catalog:read');
      const result = await pool.query('SELECT COUNT(*)::bigint AS count FROM "public"."tblCat"');
      json(res, 200, Number(result.rows[0].count || 0));
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/catalog\/search$/,
    handler: async (req, res, url) => {
      getAuthenticatedSession(req, 'catalog:read');
      const query = String(url.searchParams.get('query') || '').trim();
      if (!query) {
        return json(res, 200, []);
      }

      const needle = `%${query}%`;
      const result = await pool.query(
        `
          SELECT
            c."controlno" AS controlno,
            c."Title" AS title,
            a."Author" AS author,
            c."Callno" AS callno,
            c."Copyright" AS year
          FROM "public"."tblCat" c
          LEFT JOIN "public"."tblAuthor" a ON c."AuthorCode" = a."AuthorCode"
          WHERE c."Title" ILIKE $1 OR c."Callno" ILIKE $1 OR COALESCE(a."Author", '') ILIKE $1 OR COALESCE(c."xNotes", '') ILIKE $1
          ORDER BY c."Title" ASC
          LIMIT 20
        `,
        [needle],
      );

      json(res, 200, result.rows.map((row, index) => mapCatalogRecord(row, index, 1)));
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/catalog\/records$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'catalog:write');
      const body = await parseBody(req);
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        const controlno = String(body.controlno || '').trim();
        const title = String(body.title || '').trim();

        if (!controlno || !title) {
          throw new Error('Control number and title are required.');
        }

        const authorCode = await ensureAuthorCode(client, body.author);
        const subject1Code = await ensureSubjectCode(client, body.subject1);
        const subject2Code = await ensureSubjectCode(client, body.subject2);
        const subject3Code = await ensureSubjectCode(client, body.subject3);
        const addedAuthor1Code = await ensureAuthorCode(client, body.addedauthor1);
        const addedAuthor2Code = await ensureAuthorCode(client, body.addedauthor2);
        const addedAuthor3Code = await ensureAuthorCode(client, body.addedauthor3);

        await client.query(
          `
            INSERT INTO "public"."tblCat" (
              "controlno", "Title", "Callno", "AuthorCode", "Edition", "Pagination",
              "Publisher", "Pubplace", "Copyright", "ISBN", "Subject1Code", "Subject2Code",
              "Subject3Code", "SeriesTitle", "AEntryTitle", "AEAuthor1Code", "AEAuthor2Code",
              "AEAuthor3Code", "Material", "xNotes"
            )
            VALUES (
              $1, $2, $3, $4, $5, $6,
              $7, $8, $9, $10, $11, $12,
              $13, $14, $15, $16, $17,
              $18, $19, $20
            )
          `,
          [
            controlno,
            title,
            sanitizeNullableString(body.callno),
            authorCode,
            sanitizeNullableString(body.edition),
            sanitizeNullableString(body.physdesc),
            sanitizeNullableString(body.publisher),
            sanitizeNullableString(body.pubplace),
            sanitizeNullableString(body.date),
            sanitizeNullableString(body.isbn),
            subject1Code,
            subject2Code,
            subject3Code,
            sanitizeNullableString(body.series),
            sanitizeNullableString(body.addedtitle),
            addedAuthor1Code || null,
            addedAuthor2Code || null,
            addedAuthor3Code || null,
            sanitizeNullableString(body.material) || 'Book',
            sanitizeNullableString(body.notes),
          ],
        );

        await client.query('COMMIT');
        json(res, 201, { ok: true });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/catalog\/records\/([^/]+)$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'catalog:delete');
      await pool.query('DELETE FROM "public"."tblCat" WHERE "controlno" = $1', [decodeURIComponent(match[1])]);
      json(res, 200, { ok: true });
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/catalog\/records\/([^/]+)$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'catalog:read');
      const result = await pool.query('SELECT * FROM "public"."tblCat" WHERE "controlno" = $1', [decodeURIComponent(match[1])]);
      if (!result.rowCount) {
        return fail(res, 404, 'Catalog record not found.');
      }

      const row = result.rows[0];
      json(res, 200, {
        controlno: row.controlno ?? '',
        title: row.Title ?? '',
        callno: row.Callno ?? null,
        author_code: row.AuthorCode ?? 0,
        edition: row.Edition ?? null,
        pagination: row.Pagination ?? null,
        publisher: row.Publisher ?? null,
        pubplace: row.Pubplace ?? null,
        copyright: row.Copyright ?? null,
        isbn: row.ISBN ?? null,
        subject1_code: row.Subject1Code ?? null,
        subject2_code: row.Subject2Code ?? null,
        subject3_code: row.Subject3Code ?? null,
        series_title: row.SeriesTitle ?? null,
        a_entry_title: row.AEntryTitle ?? null,
        ae_author1_code: row.AEAuthor1Code ?? null,
        ae_author2_code: row.AEAuthor2Code ?? null,
        ae_author3_code: row.AEAuthor3Code ?? null,
        material: row.Material ?? null,
        x_notes: row.xNotes ?? null,
      });
    },
  },
  {
    method: 'PUT',
    pattern: /^\/api\/catalog\/records\/([^/]+)$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'catalog:write');
      const body = await parseBody(req);
      await pool.query(
        `
          UPDATE "public"."tblCat"
          SET "Title" = $1, "Callno" = $2, "AuthorCode" = $3, "Edition" = $4, "Pagination" = $5,
              "Publisher" = $6, "Pubplace" = $7, "Copyright" = $8, "ISBN" = $9,
              "Subject1Code" = $10, "Subject2Code" = $11, "Subject3Code" = $12,
              "SeriesTitle" = $13, "AEntryTitle" = $14, "AEAuthor1Code" = $15,
              "AEAuthor2Code" = $16, "AEAuthor3Code" = $17, "Material" = $18, "xNotes" = $19
          WHERE "controlno" = $20
        `,
        [
          body.title,
          body.callno ?? null,
          body.author_code ?? 0,
          body.edition ?? null,
          body.pagination ?? null,
          body.publisher ?? null,
          body.pubplace ?? null,
          body.copyright ?? null,
          body.isbn ?? null,
          body.subject1_code ?? null,
          body.subject2_code ?? null,
          body.subject3_code ?? null,
          body.series_title ?? null,
          body.a_entry_title ?? null,
          body.ae_author1_code ?? null,
          body.ae_author2_code ?? null,
          body.ae_author3_code ?? null,
          body.material ?? null,
          body.x_notes ?? null,
          decodeURIComponent(match[1]),
        ],
      );

      json(res, 200, { ok: true });
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/catalog\/records\/([^/]+)\/holdings$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'catalog:read');
      const result = await pool.query(
        'SELECT * FROM "public"."tblHoldings" WHERE "controlno" = $1 ORDER BY "Accession" ASC',
        [decodeURIComponent(match[1])],
      );

      json(
        res,
        200,
        result.rows.map((row) => ({
          controlno: row.controlno ?? '',
          accession: row.Accession ?? '',
          copy: row.Copy ?? '',
          location: row.Location ?? '',
          due_date: row.DueDate ?? null,
          status: row.Status ?? 'Available',
          last_audit: row.last_audit ?? null,
        })),
      );
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/catalog\/holdings$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'catalog:write');
      const body = await parseBody(req);
      await pool.query(
        `
          INSERT INTO "public"."tblHoldings" ("controlno", "Accession", "Copy", "Location", "Status")
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT ("Accession") DO UPDATE
          SET "Location" = EXCLUDED."Location", "Copy" = EXCLUDED."Copy", "Status" = EXCLUDED."Status"
        `,
        [body.controlno, body.accession, body.copy, body.location, body.status || 'Available'],
      );

      json(res, 200, { ok: true });
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/catalog\/holdings\/([^/]+)$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'catalog:delete');
      await pool.query('DELETE FROM "public"."tblHoldings" WHERE "Accession" = $1', [decodeURIComponent(match[1])]);
      json(res, 200, { ok: true });
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/catalog\/authors$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'catalog:read');
      const result = await pool.query('SELECT "Author" AS author, "AuthorCode" AS author_code FROM "public"."tblAuthor" ORDER BY "Author" ASC');
      json(res, 200, result.rows);
    },
  },
  {
    method: 'PUT',
    pattern: /^\/api\/catalog\/authors\/(\d+)$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'authorities:write');
      const body = await parseBody(req);
      await pool.query('UPDATE "public"."tblAuthor" SET "Author" = $1 WHERE "AuthorCode" = $2', [String(body.name || '').trim(), Number(match[1])]);
      json(res, 200, { ok: true });
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/catalog\/authors\/(\d+)$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'authorities:write');
      await pool.query('DELETE FROM "public"."tblAuthor" WHERE "AuthorCode" = $1', [Number(match[1])]);
      json(res, 200, { ok: true });
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/catalog\/subjects$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'catalog:read');
      const result = await pool.query('SELECT "subject" AS subject, "SubjectCode" AS subject_code FROM "public"."tblSubject" ORDER BY "subject" ASC');
      json(res, 200, result.rows);
    },
  },
  {
    method: 'PUT',
    pattern: /^\/api\/catalog\/subjects\/(\d+)$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'authorities:write');
      const body = await parseBody(req);
      await pool.query('UPDATE "public"."tblSubject" SET "subject" = $1 WHERE "SubjectCode" = $2', [String(body.name || '').trim(), Number(match[1])]);
      json(res, 200, { ok: true });
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/catalog\/subjects\/(\d+)$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'authorities:write');
      await pool.query('DELETE FROM "public"."tblSubject" WHERE "SubjectCode" = $1', [Number(match[1])]);
      json(res, 200, { ok: true });
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/patrons$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'patrons:read');
      const result = await pool.query(
        `
          SELECT
            "Name" AS name,
            "Idno" AS idno,
            "GroupName" AS group_name,
            "Expiry" AS expiry,
            "Dept" AS dept,
            "Phone" AS phone,
            "Email" AS email,
            COALESCE("UnpaidFine", 0) AS unpaid_fine
          FROM "public"."tblUser"
          ORDER BY "Name" ASC
        `,
      );

      json(res, 200, result.rows);
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/patrons$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'patrons:write');
      const body = await parseBody(req);
      await pool.query(
        `
          INSERT INTO "public"."tblUser" ("Name", "Idno", "GroupName", "Expiry", "Dept", "Phone", "Email", "UnpaidFine")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [body.name, body.idno, body.group_name, body.expiry, body.dept, body.phone, body.email, body.unpaid_fine ?? 0],
      );

      json(res, 201, { ok: true });
    },
  },
  {
    method: 'PUT',
    pattern: /^\/api\/patrons\/([^/]+)$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'patrons:write');
      const body = await parseBody(req);
      await pool.query(
        `
          UPDATE "public"."tblUser"
          SET "Name" = $1, "GroupName" = $2, "Expiry" = $3, "Dept" = $4, "Phone" = $5, "Email" = $6, "UnpaidFine" = $7
          WHERE "Idno" = $8
        `,
        [body.name, body.group_name, body.expiry, body.dept, body.phone, body.email, body.unpaid_fine ?? 0, decodeURIComponent(match[1])],
      );

      json(res, 200, { ok: true });
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/patrons\/([^/]+)$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'patrons:delete');
      await pool.query('DELETE FROM "public"."tblUser" WHERE "Idno" = $1', [decodeURIComponent(match[1])]);
      json(res, 200, { ok: true });
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/patrons\/([^/]+)\/pay$/,
    handler: async (req, res, _url, match) => {
      const session = getAuthenticatedSession(req, 'circulation:write');
      const body = await parseBody(req);
      const idno = decodeURIComponent(match[1]);
      const amount = Number(body.amount || 0);
      await pool.query('UPDATE "public"."tblUser" SET "UnpaidFine" = GREATEST(0, COALESCE("UnpaidFine", 0) - $1) WHERE "Idno" = $2', [amount, idno]);
      await pool.query(
        'INSERT INTO "public"."tblFineCode" ("AmountPay", "Idno", "dtePay", "Cashier") VALUES ($1, $2, NOW(), $3)',
        [amount, idno, session.user.username || 'System'],
      );
      json(res, 200, { ok: true });
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/circulation\/loans$/,
    handler: async (req, res, url) => {
      getAuthenticatedSession(req, 'circulation:read');
      const idno = String(url.searchParams.get('idno') || '').trim();
      const result = await pool.query(
        `
          SELECT "Accession" AS accession, "dteBorrow" AS dte_borrow, "dteDue" AS dte_due, "dteReturn" AS dte_return,
                 "FineCode" AS fine_code, "Idno" AS idno
          FROM "public"."tblRent"
          WHERE "Idno" = $1 AND "dteReturn" IS NULL
          ORDER BY "dteBorrow" DESC
        `,
        [idno],
      );

      json(res, 200, result.rows);
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/circulation\/checkout$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'circulation:write');
      const body = await parseBody(req);
      const now = new Date();
      const due = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      await pool.query(
        'INSERT INTO "public"."tblRent" ("Accession", "dteBorrow", "dteDue", "Idno") VALUES ($1, $2, $3, $4)',
        [body.accession, now.toISOString(), due.toISOString(), body.idno],
      );
      await pool.query('UPDATE "public"."tblHoldings" SET "Status" = $1, "DueDate" = $2 WHERE "Accession" = $3', [
        'Checked Out',
        due.toISOString(),
        body.accession,
      ]);

      json(res, 200, { ok: true });
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/circulation\/return$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'circulation:write');
      const body = await parseBody(req);
      const accession = String(body.accession || '').trim();
      const rentResult = await pool.query(
        'SELECT "Idno", "dteDue" FROM "public"."tblRent" WHERE "Accession" = $1 AND "dteReturn" IS NULL ORDER BY "dteBorrow" DESC LIMIT 1',
        [accession],
      );

      if (!rentResult.rowCount) {
        return fail(res, 404, 'Active loan not found for this accession.');
      }

      const rent = rentResult.rows[0];
      const now = new Date();
      const dueDate = rent.dteDue ? new Date(rent.dteDue) : null;
      const overdueDays = dueDate ? Math.max(0, Math.ceil((now.getTime() - dueDate.getTime()) / (24 * 60 * 60 * 1000))) : 0;
      const fine = overdueDays;

      await pool.query('UPDATE "public"."tblRent" SET "dteReturn" = $1 WHERE "Accession" = $2 AND "dteReturn" IS NULL', [
        now.toISOString(),
        accession,
      ]);
      await pool.query('UPDATE "public"."tblHoldings" SET "Status" = $1, "DueDate" = NULL WHERE "Accession" = $2', [
        'Available',
        accession,
      ]);

      if (fine > 0) {
        await pool.query('UPDATE "public"."tblUser" SET "UnpaidFine" = COALESCE("UnpaidFine", 0) + $1 WHERE "Idno" = $2', [
          fine,
          rent.idno,
        ]);
      }

      json(res, 200, fine);
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/circulation\/stats$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'circulation:read');
      const [activeResult, overdueResult, fineResult] = await Promise.all([
        pool.query('SELECT COUNT(*)::bigint AS count FROM "public"."tblRent" WHERE "dteReturn" IS NULL'),
        pool.query('SELECT COUNT(*)::bigint AS count FROM "public"."tblRent" WHERE "dteReturn" IS NULL AND "dteDue" < NOW()'),
        pool.query('SELECT COALESCE(SUM("UnpaidFine"), 0)::int AS total FROM "public"."tblUser"'),
      ]);

      json(res, 200, {
        total_active: Number(activeResult.rows[0].count || 0),
        total_overdue: Number(overdueResult.rows[0].count || 0),
        total_fines: Number(fineResult.rows[0].total || 0),
      });
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/circulation\/overdue$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'circulation:read');
      const result = await pool.query(
        `
          SELECT
            r."Accession" AS accession,
            c."Title" AS title,
            u."Name" AS patron_name,
            r."Idno" AS idno,
            r."dteDue" AS due_date,
            GREATEST(0, CEIL(EXTRACT(EPOCH FROM (NOW() - r."dteDue")) / 86400))::bigint AS days_overdue
          FROM "public"."tblRent" r
          LEFT JOIN "public"."tblHoldings" h ON h."Accession" = r."Accession"
          LEFT JOIN "public"."tblCat" c ON c."controlno" = h."controlno"
          LEFT JOIN "public"."tblUser" u ON u."Idno" = r."Idno"
          WHERE r."dteReturn" IS NULL AND r."dteDue" < NOW()
          ORDER BY r."dteDue" ASC
        `,
      );

      json(res, 200, result.rows);
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/circulation\/reservations$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'circulation:read');
      const result = await pool.query(
        `
          SELECT r."RecNumber" AS rec_number, r."Idno" AS idno, r."Accession" AS accession,
                 r."DateReserve" AS date_reserve, r."ReserveUntil" AS reserve_until, r."IsServed" AS is_served,
                 u."Name" AS patron_name, h."controlno" AS item_title
          FROM "public"."tblReserve" r
          LEFT JOIN "public"."tblUser" u ON u."Idno" = r."Idno"
          LEFT JOIN "public"."tblHoldings" h ON h."Accession" = r."Accession"
          WHERE r."IsServed" = 'N'
          ORDER BY r."DateReserve" ASC
        `,
      );

      json(res, 200, result.rows);
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/circulation\/reservations$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'reservations:write');
      const body = await parseBody(req);
      const maxResult = await pool.query('SELECT COALESCE(MAX("RecNumber"), 0) AS max_rec FROM "public"."tblReserve"');
      const nextRec = Number(maxResult.rows[0].max_rec || 0) + 1;
      const now = new Date();
      const reserveUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      await pool.query(
        `
          INSERT INTO "public"."tblReserve" ("RecNumber", "Idno", "Accession", "DateReserve", "ReserveUntil", "IsServed")
          VALUES ($1, $2, $3, $4, $5, 'N')
        `,
        [nextRec, body.idno, body.accession, now.toISOString(), reserveUntil.toISOString()],
      );

      json(res, 201, { ok: true });
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/circulation\/reservations\/(\d+)\/serve$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'reservations:write');
      await pool.query('UPDATE "public"."tblReserve" SET "IsServed" = $1 WHERE "RecNumber" = $2', ['Y', Number(match[1])]);
      json(res, 200, { ok: true });
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/circulation\/reservations\/(\d+)$/,
    handler: async (req, res, _url, match) => {
      getAuthenticatedSession(req, 'reservations:write');
      await pool.query('DELETE FROM "public"."tblReserve" WHERE "RecNumber" = $1', [Number(match[1])]);
      json(res, 200, { ok: true });
    },
  },
  {
    method: 'POST',
    pattern: /^\/api\/inventory\/audit$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'inventory:audit');
      const body = await parseBody(req);
      const accession = String(body.accession || '').trim();
      const now = new Date();
      await pool.query(
        `
          UPDATE "public"."tblHoldings"
          SET last_audit = $1, "Status" = CASE WHEN "Status" = 'Missing' THEN 'Available' ELSE "Status" END
          WHERE "Accession" = $2
        `,
        [now.toISOString(), accession],
      );

      const result = await pool.query(
        `
          SELECT h."Accession" AS accession, h."Location" AS location, h."Status" AS status, h.last_audit AS last_audit,
                 c."Title" AS title
          FROM "public"."tblHoldings" h
          LEFT JOIN "public"."tblCat" c ON c."controlno" = h."controlno"
          WHERE h."Accession" = $1
          LIMIT 1
        `,
        [accession],
      );

      if (!result.rowCount) {
        return fail(res, 404, `Item ${accession} not found.`);
      }

      const row = result.rows[0];
      json(res, 200, {
        accession: row.accession,
        title: row.title || 'Scanned Item',
        location: row.location || 'Library',
        status: row.status || 'Available',
        last_audit: row.last_audit || now.toISOString(),
      });
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/reports\/financial$/,
    handler: async (req, res) => {
      getAuthenticatedSession(req, 'reports:read');
      const [collectedResult, outstandingResult, paymentsResult] = await Promise.all([
        pool.query('SELECT COALESCE(SUM("AmountPay"), 0)::int AS total FROM "public"."tblFineCode"'),
        pool.query('SELECT COALESCE(SUM("UnpaidFine"), 0)::int AS total FROM "public"."tblUser"'),
        pool.query(
          `
            SELECT f."AmountPay" AS amount_pay, f."Idno" AS idno, f."dtePay" AS dte_pay, f."Cashier" AS cashier, u."Name" AS patron_name
            FROM "public"."tblFineCode" f
            LEFT JOIN "public"."tblUser" u ON u."Idno" = f."Idno"
            ORDER BY f."dtePay" DESC
            LIMIT 50
          `,
        ),
      ]);

      json(res, 200, {
        total_collected: Number(collectedResult.rows[0].total || 0),
        total_outstanding: Number(outstandingResult.rows[0].total || 0),
        recent_payments: paymentsResult.rows,
      });
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/reports\/acquisitions$/,
    handler: async (req, res, url) => {
      getAuthenticatedSession(req, 'reports:read');
      const startDate = url.searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = url.searchParams.get('endDate') || new Date().toISOString();
      const result = await pool.query(
        `
          SELECT
            c."controlno" AS controlno,
            h."Accession" AS accession,
            c."Title" AS title,
            a."Author" AS author,
            COALESCE(h.date_acquired, c.date_added, NOW()) AS date_acquired
          FROM "public"."tblCat" c
          LEFT JOIN "public"."tblHoldings" h ON h."controlno" = c."controlno"
          LEFT JOIN "public"."tblAuthor" a ON a."AuthorCode" = c."AuthorCode"
          WHERE COALESCE(h.date_acquired, c.date_added, NOW()) BETWEEN $1 AND $2
          ORDER BY COALESCE(h.date_acquired, c.date_added, NOW()) DESC
        `,
        [startDate, endDate],
      );

      json(res, 200, result.rows);
    },
  },
  {
    method: 'GET',
    pattern: /^\/api\/reports\/circulation$/,
    handler: async (req, res, url) => {
      getAuthenticatedSession(req, 'reports:read');
      const startDate = url.searchParams.get('startDate') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = url.searchParams.get('endDate') || new Date().toISOString();
      const result = await pool.query(
        `
          SELECT
            r."Accession" AS accession,
            c."Title" AS title,
            u."Name" AS patron_name,
            r."Idno" AS idno,
            r."dteBorrow" AS dte_borrow,
            r."dteDue" AS dte_due,
            r."dteReturn" AS dte_return,
            CASE WHEN r."dteReturn" IS NULL THEN 'Borrowed' ELSE 'Returned' END AS status
          FROM "public"."tblRent" r
          LEFT JOIN "public"."tblHoldings" h ON h."Accession" = r."Accession"
          LEFT JOIN "public"."tblCat" c ON c."controlno" = h."controlno"
          LEFT JOIN "public"."tblUser" u ON u."Idno" = r."Idno"
          WHERE r."dteBorrow" BETWEEN $1 AND $2
          ORDER BY r."dteBorrow" DESC
          LIMIT 500
        `,
        [startDate, endDate],
      );

      json(res, 200, result.rows);
    },
  },
];

const server = createServer(async (req, res) => {
  ensureCors(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = normalizePath(url.pathname);

  try {
    for (const route of routes) {
      if (route.method !== req.method) {
        continue;
      }

      const match = pathname.match(route.pattern);
      if (!match) {
        continue;
      }

      await route.handler(req, res, url, match);
      return;
    }

    fail(res, 404, `No route for ${req.method} ${pathname}`);
  } catch (error) {
    const statusCode = Number(error?.statusCode || 500);
    const message = error instanceof Error ? error.message : String(error);
    fail(res, statusCode, message);
  }
});

await migrateDatabase();

server.listen(PORT, HOST, () => {
  const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
  console.log(`infoLib shared API listening on http://${displayHost}:${PORT}`);
});
