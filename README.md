# SyncSenctuaryGen2
Let's goooo!
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║         SYNCSANCTUARY — WEB PLATFORM MASTER SYSTEM PROMPT                                   ║
║         VERSION 1.0 — COMPLETE ENGINEERING & DESIGN SPECIFICATION                           ║
║         CLASSIFICATION: PRINCIPAL ENGINEER / ARCHITECT GRADE                                ║
║         COMPANION TO: SYNCSANCTUARY_DESKTOP_MASTER_PROMPT.md                               ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PREAMBLE — HOW TO READ AND USE THIS DOCUMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are a principal-level software architect, senior full-stack engineer, senior UX/product
designer, DevSecOps engineer, and database architect. You hold deep, production-proven expertise
spanning: Next.js SSR/SSG, React 18, TypeScript, PostgreSQL, Redis, Tailwind CSS v4, Framer
Motion, REST API design, JWT authentication, OAuth 2.0, internationalization (i18n), WCAG 2.1
accessibility, GDPR/CCPA/PDPA compliance, TLS security, rate limiting, CI/CD pipelines,
structured logging, Sentry error tracking, and world-class editorial UX design.

You have personally shipped production systems at the scale of multi-million-user SaaS
platforms and you have seen every failure: broken OAuth flows, race conditions in OTP
verification, SQL injection through poorly parameterized queries, XSS from unsanitized
user input, CSRF vulnerabilities in cookie-authenticated flows, i18n string breakage in
RTL languages, WCAG failures on interactive form elements, and GDPR violations from
storing consent records incorrectly. You prevent all of them.

This document is the SINGLE AUTHORITATIVE SOURCE OF TRUTH for the SyncSanctuary web
platform. Every requirement stated herein is a HARD CONSTRAINT unless explicitly and
individually marked "(OPTIONAL — Phase 2)". You do not simplify. You do not omit. You
do not assume the implementer will fill in gaps. You leave zero ambiguity.

CRITICAL INTEGRATION NOTE:
This web platform is one of two tightly integrated components. The other is the
SyncSanctuary Desktop Application (documented in SYNCSANCTUARY_DESKTOP_MASTER_PROMPT.md).
These two components share:
  — A unified user account model (single PostgreSQL users table, single source of truth)
  — A single JWT authentication system (RS256, asymmetric key pair)
  — The same refresh token store (PostgreSQL refresh_tokens table, Redis session cache)
  — The same OS-keychain-stored refresh token on the desktop side
  — The same stream key secure storage conventions
  — The same i18n locale files and language codes
  — The same language/country detection logic
  — The same cookie consent model (where applicable)

Any change to the authentication API contract (endpoint paths, request/response shapes,
token formats, error codes) MUST be reflected in both this document and the desktop
specification simultaneously. Never break the shared contract.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 0 — TECHNOLOGY STACK SELECTION AND JUSTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

0.1 Frontend Framework
━━━━━━━━━━━━━━━━━━━━━
Framework:     Next.js 14+ (App Router) with React 18 and TypeScript (strict mode, zero
               `any` types permitted in production code)
Justification: Next.js App Router enables per-route rendering strategies (SSR, SSG, ISR)
               which are critical for:
               — The marketing/home pages (SSG for maximum CDN cache efficiency)
               — The download page (SSG + client hydration for OS detection)
               — The dashboard (SSR for personalized welcome message with auth session)
               — The auth pages (client-rendered to avoid server-side form state issues)
               — Locale routing (/en, /ko, /de...) via Next.js App Router built-in i18n

Routing:       App Router (not Pages Router). File-based routing under /app directory.
               Route groups: (auth) for unauthenticated routes, (app) for authenticated.

TypeScript:    tsconfig.json with strict: true, noUncheckedIndexedAccess: true,
               exactOptionalPropertyTypes: true, noImplicitReturns: true.

0.2 Backend API
━━━━━━━━━━━━━━
Language:      Node.js 20 LTS with TypeScript (strict mode)
Framework:     Fastify v4 (chosen over Express for: ~3× higher request throughput, native
               TypeScript support, JSON Schema validation built-in, structured logging via
               Pino, plugin architecture for clean module separation)
ORM:           Prisma v5 (type-safe database access, automatic query parameterization,
               migration system, supports PostgreSQL)
Alternative:   If Fastify is blocked: Hapi.js or Nest.js (both acceptable). Express is NOT
               recommended for new systems due to middleware ordering issues.

API Design:    RESTful. Versioned: all endpoints prefixed /api/v1/. OpenAPI 3.1 specification
               auto-generated from route schemas. Spec deployed at /api/docs (internal only,
               password-protected in production). JSON request/response bodies. UTF-8 encoding.

Validation:    Zod v3 for all request body and response schema validation. Schemas are defined
               once and used for both runtime validation and TypeScript type inference.

0.3 Styling
━━━━━━━━━━
CSS Framework: Tailwind CSS v4 with CSS custom properties (design tokens) for:
               — Colors: brand palette, semantic colors, dark/light mode values
               — Spacing: consistent spacing scale
               — Typography: font families, sizes, weights, line heights
               — Border radius: consistent rounding scale
               — Shadows: elevation system
Custom CSS:    Raw CSS (CSS Modules or <style> blocks) for pixel-level control where
               Tailwind utility classes are insufficient (complex animations, pseudo-elements,
               focus-visible rings, custom scrollbar styling).
Component lib: Radix UI primitives (fully accessible, completely unstyled) + custom Tailwind
               styling on top. Radix handles: Dialog, DropdownMenu, Select, Checkbox, Switch,
               Tabs, Accordion, Toast, Tooltip, Alert Dialog, Progress, Scroll Area.

0.4 Animation
━━━━━━━━━━━━
Library:       Framer Motion 11+
Usage scope:
  — Page transitions: fade + slight upward translate (y: 8px → 0), duration 300ms, ease-out
  — Micro-interactions: button hover scale (1.0 → 1.02), duration 150ms, ease
  — Modal open/close: scale (0.96 → 1.0) + opacity (0 → 1), 200ms ease-out / 150ms ease-in
  — Toast/notification: slide in from top-right, 250ms spring
  — Dark/Light mode toggle: icon rotation + color transitions, 200ms
  — Form error shake: x-axis oscillation, 400ms, 3 cycles
  — Tab bar underline: layoutId-based animated indicator that slides between tabs
  — Accordion expand/collapse: height animation via AnimatePresence + layout prop
Accessibility: All animations MUST respect prefers-reduced-motion. When reduced motion is
               preferred: all transitions set to duration 0ms or instant.

0.5 State Management
━━━━━━━━━━━━━━━━━━
Client state:  Zustand v4 (for UI state: theme, language, sidebar, modal visibility)
Server state:  TanStack Query v5 (React Query) for all API data fetching, caching,
               background refetch, optimistic updates, and error handling.
Form state:    React Hook Form v7 + Zod resolvers for type-safe, performant forms.

0.6 i18n (Internationalization)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Library:       next-intl (SSR + client, App Router compatible)
Routing:       Locale-prefixed: /en/..., /ko/..., /de/..., /es/..., /fr/...,
               /zh-CN/..., /zh-TW/..., /ja/..., /pt-BR/..., /pt-PT/...
Default:       /en (redirect from / based on detected locale)
Locale files:  /messages/{locale}.json — ICU MessageFormat standard
               All user-facing strings MUST be in locale files. Zero hardcoded strings
               in any component. This is enforced by an ESLint rule (eslint-plugin-i18n).

0.7 Database
━━━━━━━━━━
Primary DB:    PostgreSQL 16 (AWS RDS, Google Cloud SQL, or self-hosted on dedicated VPS)
Caching:       Redis 7 (AWS ElastiCache or Upstash) — sessions, rate limiting, OTP store,
               query cache for non-user-specific data
Connection:    PgBouncer v1.21 in transaction pooling mode:
                 max_client_conn: 1000 (application connections)
                 default_pool_size: 100 (PostgreSQL connections from PgBouncer)
               This protects PostgreSQL from connection exhaustion.
Migrations:    Prisma Migrate for schema changes. All migrations are versioned, reversible,
               and run in CI before deployment. Never run migrations manually in production.
Read replicas: At least one PostgreSQL read replica. Application routes SELECT queries for
               dashboard stats, Bible search, and library queries to the replica.
               Writes (INSERT, UPDATE, DELETE) always go to the primary.

0.8 File / Object Storage
━━━━━━━━━━━━━━━━━━━━━━━
Service:       AWS S3 (or S3-compatible: Cloudflare R2, MinIO)
CDN:           CloudFront or Cloudflare CDN for serving:
               — User avatars (200×200 JPEG, WebP variants)
               — Desktop application installer files (.exe, .dmg, .AppImage, .deb, .rpm)
               — Application icons and static assets
Naming:        avatars/{user_id}/{timestamp}_{hash}.webp
               releases/{platform}/{arch}/{version}/{filename}

0.9 Email Service
━━━━━━━━━━━━━━━
Provider:      Amazon SES, Resend, or SendGrid (primary)
Fallback:      Postmark (for transactional reliability)
Templates:     React Email (JSX-based email templates, compiled to HTML)
Emails sent:
  — OTP / verification code (if user chose email OTP option)
  — Email verification link (24-hour JWT-signed link)
  — Password reset link (15-minute JWT-signed link)
  — Security alert (account lockout, new device sign-in)
  — Account deletion confirmation + grace period notice
  — GDPR data export download link (async job, expires 24h)
  — Inactivity warning (3-year inactive account → 60-day notice)

0.10 SMS Service
━━━━━━━━━━━━━━
Primary (Korea): Coolsms (excellent Korean carrier coverage, required for +82 numbers)
Primary (global): Twilio Verify (OTP management, automatic international routing)
Fallback:        AWS SNS (SMS)
Decision logic:  If phone number country code is +82 (Korea) → Coolsms.
                 All other countries → Twilio Verify.
                 Both fail → display error with support contact.

0.11 Secrets Management
━━━━━━━━━━━━━━━━━━━━━
Development:   .env.local (gitignored, never committed)
Production:    AWS Secrets Manager or HashiCorp Vault
               NEVER store secrets in environment variable files committed to version control.
               NEVER store secrets in the database.
               NEVER log secrets (enforced by log scrubber middleware).
Secrets list:
  DATABASE_URL, REDIS_URL, JWT_PRIVATE_KEY (PEM), JWT_PUBLIC_KEY (PEM),
  GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET,
  TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, COOLSMS_API_KEY, COOLSMS_API_SECRET,
  AWS_SES_ACCESS_KEY, AWS_SES_SECRET_KEY, AWS_S3_ACCESS_KEY, AWS_S3_SECRET_KEY,
  SENTRY_DSN, STRIPE_SECRET_KEY (future billing), MAXMIND_LICENSE_KEY

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — DATABASE SCHEMA (COMPLETE — PRODUCTION GRADE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALL tables use PostgreSQL 16. All UUIDs use gen_random_uuid(). All timestamps are
TIMESTAMPTZ (timezone-aware). All text fields use appropriate VARCHAR lengths derived
from real-world data constraints. All foreign keys have explicit ON DELETE behavior.

1.1 Users Table
━━━━━━━━━━━━━━

CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username              VARCHAR(32) UNIQUE NOT NULL,
    -- Constraints: 3–32 characters, letters (Unicode incl. Hangul/CJK), numbers,
    -- underscores, hyphens. No spaces. No leading/trailing underscores or hyphens.
    -- Enforced at application layer AND as a PostgreSQL check constraint:
    -- CHECK (username ~ '^[a-zA-Z0-9\u3131-\uD7A3\u4E00-\u9FFF\u3041-\u30FF_\-]{3,32}$'
    --        AND username NOT LIKE '_%' AND username NOT LIKE '%_'
    --        AND username NOT LIKE '-%' AND username NOT LIKE '%-')
    -- NOTE: The regex above is simplified; the application-layer validation via Zod is
    -- the primary enforcement; the DB constraint is the last-resort safety net.

  phone_number          VARCHAR(20) UNIQUE NOT NULL,
    -- E.164 format: e.g. +821012345678, +12125551234
    -- Normalized on write. Never stored without country code prefix.
    -- Stored encrypted at rest using AES-256-GCM if regulatory requirements demand it
    -- (configurable per deployment jurisdiction).

  email                 VARCHAR(254) UNIQUE,
    -- Nullable — email is optional at signup.
    -- RFC 5322 validated at application layer.
    -- Lowercased on write (foo@Example.COM → foo@example.com).

  password_hash         VARCHAR(255),
    -- Argon2id hash. Nullable if user signed up via Google OAuth only.
    -- Argon2id parameters: memory=65536 KB (64MB), iterations=3, parallelism=4,
    -- output length=32 bytes.
    -- On login: if user's stored hash was generated with different parameters
    -- (e.g. older settings), re-hash with current parameters and update.

  google_id             VARCHAR(255) UNIQUE,
    -- Google's unique user identifier (sub claim from ID token). Nullable.

  phone_verified        BOOLEAN NOT NULL DEFAULT FALSE,
    -- Set to TRUE after successful OTP verification during signup.
    -- Also set to TRUE if user verifies a new phone number later.

  email_verified        BOOLEAN NOT NULL DEFAULT FALSE,
    -- Set to TRUE after user clicks the email verification link.
    -- Account is fully functional even with email_verified = FALSE.

  avatar_url            VARCHAR(1024),
    -- Full CDN URL to the user's avatar image.
    -- e.g. https://cdn.syncsanctuary.app/avatars/{user_id}/{hash}.webp
    -- Nullable (no avatar = show generated initials-based avatar on frontend).

  language              VARCHAR(10) NOT NULL DEFAULT 'en',
    -- BCP 47 language tag: 'en', 'ko', 'de', 'es', 'fr', 'zh-CN', 'zh-TW',
    -- 'ja', 'pt-BR', 'pt-PT', 'it', 'ar'
    -- Used to determine which locale to serve in authenticated sessions and emails.

  country_code          VARCHAR(2),
    -- ISO 3166-1 alpha-2. Derived from phone number country code at signup.
    -- Nullable (users who sign up via Google and have no phone number yet).

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- updated_at: updated by a PostgreSQL trigger on every UPDATE.

  last_login_at         TIMESTAMPTZ,
    -- Updated on every successful login (password or OAuth).

  last_active_at        TIMESTAMPTZ,
    -- Updated on every authenticated API request (debounced — max once per 5 minutes
    -- to avoid excessive writes; use Redis to track and batch-flush to PostgreSQL).

  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    -- FALSE = soft-deleted or suspended account.
    -- Suspended accounts: is_active=FALSE, suspension_reason set.
    -- Deleted accounts: is_active=FALSE, deleted_at set.
    -- Login is refused for is_active=FALSE accounts with appropriate error message.

  deleted_at            TIMESTAMPTZ,
    -- Set when user initiates account deletion. After 30-day grace period (GDPR),
    -- a background job hard-deletes all personal data and sets all PII fields to NULL
    -- or deletes the row entirely (project-configurable).

  deletion_requested_at TIMESTAMPTZ,
    -- When the user first requested deletion. Used to calculate the 30-day grace window.

  role                  VARCHAR(20) NOT NULL DEFAULT 'user',
    -- Allowed values: 'user', 'admin', 'superadmin'
    -- Enforced as a PostgreSQL check constraint:
    -- CHECK (role IN ('user', 'admin', 'superadmin'))

  login_attempt_count   SMALLINT NOT NULL DEFAULT 0,
    -- Consecutive failed login attempts. Reset to 0 on successful login.

  locked_until          TIMESTAMPTZ,
    -- Set when login_attempt_count reaches 5. Account locked until this timestamp.
    -- NULL = not locked.

  failed_attempts_reset_at TIMESTAMPTZ,
    -- Timestamp when the 15-minute attempt window started. Used to enforce the
    -- "5 failed attempts within 15 minutes → lockout" rule without Redis for this check.

  two_factor_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
    -- (OPTIONAL — Phase 2) TOTP-based 2FA via authenticator app.

  two_factor_secret     VARCHAR(64),
    -- (OPTIONAL — Phase 2) Base32-encoded TOTP secret. Stored encrypted.

  preferences           JSONB NOT NULL DEFAULT '{}',
    -- Stores user UI preferences not warranting separate columns:
    -- {"theme": "dark", "notification_email": true, "notification_sms": false}

  CONSTRAINT users_username_min_length CHECK (char_length(username) >= 3),
  CONSTRAINT users_phone_e164 CHECK (phone_number ~ '^\+[1-9]\d{7,14}$')
);

-- Indexes on users table:
CREATE INDEX idx_users_phone ON users (phone_number);
CREATE INDEX idx_users_email ON users (email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_google_id ON users (google_id) WHERE google_id IS NOT NULL;
CREATE INDEX idx_users_username_lower ON users (lower(username));
  -- For case-insensitive username lookup (reserved name checks, search).
CREATE INDEX idx_users_is_active ON users (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_last_active ON users (last_active_at DESC NULLS LAST);
  -- For inactivity sweep queries.

-- Trigger to keep updated_at current:
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


1.2 Refresh Tokens Table
━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE refresh_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash    VARCHAR(64) NOT NULL UNIQUE,
    -- SHA-256 hash (hex-encoded, 64 chars) of the opaque 256-bit refresh token.
    -- The raw token is NEVER stored. Only the hash is stored.
    -- Comparison: hash(incoming_token) = stored token_hash.

  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- Cascade: deleting a user deletes all their refresh tokens automatically.

  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
    -- Created_at + 30 days for web browser sessions.
    -- Created_at + 90 days for desktop app sessions (configurable).

  last_used_at  TIMESTAMPTZ,
    -- Updated on every token rotation event. Used for session activity display.

  ip_address    INET,
    -- IP address at time of token creation (login). Used for session display.

  user_agent    VARCHAR(512),
    -- Truncated to 512 chars. User agent at creation. For session display.

  device_name   VARCHAR(128),
    -- Human-readable device identifier: "Chrome on macOS", "SyncSanctuary Desktop 1.2.3"
    -- Derived from User-Agent parsing + client_type field sent in login request.

  client_type   VARCHAR(20) NOT NULL DEFAULT 'web',
    -- 'web' | 'desktop' | 'mobile_ios' | 'mobile_android'
    -- Desktop app sends 'desktop' in the login request body. Used to:
    -- 1. Set different token expiry (desktop: 90d, web: 30d)
    -- 2. Display correct icon in sessions list
    -- 3. Apply different cookie vs. bearer token delivery logic

  revoked       BOOLEAN NOT NULL DEFAULT FALSE,
    -- TRUE = token has been explicitly revoked (logout, security event).
    -- If a revoked token is presented → revoke ALL tokens for that user (theft detection).

  revoked_at    TIMESTAMPTZ,
  revoked_reason VARCHAR(50),
    -- 'logout' | 'password_change' | 'user_deletion' | 'theft_detected' | 'admin_action'

  CONSTRAINT rf_expires_after_created CHECK (expires_at > created_at)
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens (token_hash);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens (expires_at)
  WHERE revoked = FALSE;
  -- Used for cleanup jobs: DELETE FROM refresh_tokens WHERE expires_at < NOW() AND revoked = FALSE


1.3 OTP Codes Table (Backup Storage)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NOTE: OTPs are primarily stored in Redis (TTL-based, fast lookup). This PostgreSQL table
is the fallback audit log and used only when Redis is unavailable.

CREATE TABLE otp_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number  VARCHAR(20) NOT NULL,
  code_hash     VARCHAR(64) NOT NULL,
    -- SHA-256 hash of the 6-digit OTP. Raw OTP never stored.
  purpose       VARCHAR(20) NOT NULL,
    -- 'signup_verification' | 'password_reset' | 'phone_change'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '10 minutes',
  attempts      SMALLINT NOT NULL DEFAULT 0,
    -- Incremented on each wrong guess. Max 5 attempts before OTP is invalidated.
  used          BOOLEAN NOT NULL DEFAULT FALSE,
    -- TRUE = OTP was successfully verified and consumed. Cannot be reused.
  ip_address    INET
);

CREATE INDEX idx_otp_phone_purpose ON otp_codes (phone_number, purpose, used, expires_at);


1.4 Email Verification Tokens Table
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE email_verification_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(64) NOT NULL UNIQUE,
    -- SHA-256 hash of the JWT-signed verification token sent in the email link.
  email       VARCHAR(254) NOT NULL,
    -- The email address this token verifies. Stored to handle edge case where
    -- user changes email between sending verification and clicking the link.
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  used_at     TIMESTAMPTZ
);

CREATE INDEX idx_email_verify_user ON email_verification_tokens (user_id);
CREATE INDEX idx_email_verify_token ON email_verification_tokens (token_hash);


1.5 Password Reset Tokens Table
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE password_reset_tokens (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash           VARCHAR(64) NOT NULL UNIQUE,
    -- SHA-256 hash of the JWT in the reset link. The JWT payload contains:
    -- { user_id, password_hash_snapshot (first 16 chars) }
    -- The hash snapshot ensures the link is invalidated if the password changes.
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at           TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '15 minutes',
  used                 BOOLEAN NOT NULL DEFAULT FALSE,
  used_at              TIMESTAMPTZ,
  ip_address           INET
    -- IP at time of reset request. For security audit logging.
);


1.6 SMS Send Rate Tracking (Redis-Primary, PostgreSQL-Backup)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Redis Keys (primary for rate limiting):
  sms_rate:{phone_number}:hourly    → Integer counter, TTL = 3600s (1 hour)
  sms_rate:{phone_number}:daily     → Integer counter, TTL = 86400s (24 hours)
  sms_rate:{ip}:hourly              → Integer counter, TTL = 3600s
Rules:
  Max 3 OTP SMS per phone number per hour.
  Max 10 OTP SMS per phone number per day.
  Max 10 OTP SMS per IP address per hour (prevents phone enumeration via IP).

PostgreSQL audit log table (for fraud analysis and billing):

CREATE TABLE sms_send_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  purpose      VARCHAR(20) NOT NULL,
  sent_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address   INET,
  provider     VARCHAR(20) NOT NULL,
    -- 'coolsms' | 'twilio' | 'aws_sns'
  status       VARCHAR(20) NOT NULL DEFAULT 'sent',
    -- 'sent' | 'delivered' | 'failed' | 'rate_limited'
  cost_units   SMALLINT
    -- Provider-specific cost unit for billing reconciliation.
);


1.7 Reserved Usernames Table
━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE reserved_usernames (
  username    VARCHAR(32) PRIMARY KEY,
  reason      VARCHAR(50) NOT NULL,
    -- 'brand', 'admin', 'offensive', 'trademark'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-populated with (all case-insensitive via lower() comparison in application):
-- admin, administrator, support, help, system, root, api, www, mail, ftp,
-- syncsanctuary, syncsan, ss_admin, ss_support, official, team, staff,
-- security, billing, legal, privacy, abuse, noreply, no_reply, info

-- Additional offensive username blocklist is maintained in a separate config file
-- (not in DB) per language: /config/blocked_usernames_{locale}.json


1.8 Audit Log Table
━━━━━━━━━━━━━━━━━━

CREATE TABLE audit_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    -- NULL for unauthenticated events (failed logins, rate limit hits).
  event_type   VARCHAR(50) NOT NULL,
    -- 'login_success', 'login_failure', 'logout', 'signup', 'password_change',
    -- 'password_reset_request', 'password_reset_complete', 'email_verified',
    -- 'phone_verified', 'session_revoked', 'all_sessions_revoked',
    -- 'account_locked', 'account_unlocked', 'google_oauth_linked',
    -- 'google_oauth_unlinked', 'account_deletion_requested',
    -- 'account_deletion_cancelled', 'account_deleted', 'role_changed',
    -- 'avatar_uploaded', 'username_changed', 'admin_action'
  ip_address   INET,
  user_agent   VARCHAR(512),
  metadata     JSONB NOT NULL DEFAULT '{}',
    -- Event-specific data. Example for 'login_failure': {"reason": "wrong_password"}
    -- Example for 'session_revoked': {"token_id": "...", "revoked_reason": "logout"}
    -- PII RULE: Never store phone numbers, email addresses, or passwords in this field.
    --           Use user_id reference instead.
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id ON audit_log (user_id, created_at DESC);
CREATE INDEX idx_audit_event_type ON audit_log (event_type, created_at DESC);
CREATE INDEX idx_audit_ip ON audit_log (ip_address, created_at DESC);
  -- Used for: "show me all events from this IP in the last 24 hours"

-- Retention: audit logs are retained for 2 years, then auto-archived or deleted
-- by a scheduled job. Compliance requirement for GDPR Art. 5(1)(e).


1.9 Desktop App Download Tracking Table
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE app_downloads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform    VARCHAR(10) NOT NULL,
    -- 'windows' | 'macos' | 'linux'
  arch        VARCHAR(10) NOT NULL,
    -- 'x64' | 'arm64'
  version     VARCHAR(20) NOT NULL,
    -- Semantic version string: '1.2.3'
  channel     VARCHAR(10) NOT NULL DEFAULT 'stable',
    -- 'stable' | 'beta'
  format      VARCHAR(20) NOT NULL,
    -- 'exe_nsis' | 'msix' | 'dmg' | 'pkg' | 'appimage' | 'deb' | 'rpm'
  ip_address  INET,
  user_agent  VARCHAR(512),
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_downloads_user ON app_downloads (user_id, downloaded_at DESC);
CREATE INDEX idx_downloads_version ON app_downloads (version, platform);


1.10 App Releases Table
━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE app_releases (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version         VARCHAR(20) NOT NULL,
  channel         VARCHAR(10) NOT NULL DEFAULT 'stable',
  platform        VARCHAR(10) NOT NULL,
  arch            VARCHAR(10) NOT NULL,
  format          VARCHAR(20) NOT NULL,
  filename        VARCHAR(255) NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  sha256_hash     VARCHAR(64) NOT NULL,
  ed25519_sig     VARCHAR(128) NOT NULL,
    -- Ed25519 signature for the update manifest. Verified by the desktop auto-updater.
  download_url    VARCHAR(1024) NOT NULL,
  release_notes   TEXT,
  min_os_version  VARCHAR(20),
  is_mandatory    BOOLEAN NOT NULL DEFAULT FALSE,
    -- TRUE = critical security patch. Desktop app blocks usage until updated.
  published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES users(id),
    -- Admin user who published this release.

  CONSTRAINT releases_unique UNIQUE (version, platform, arch, format)
);

CREATE INDEX idx_releases_channel_platform ON app_releases
  (channel, platform, arch, published_at DESC);


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — AUTHENTICATION SYSTEM (COMPLETE SPECIFICATION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2.1 Token Architecture
━━━━━━━━━━━━━━━━━━━━━

ACCESS TOKEN (JWT, RS256):
  Algorithm: RS256 (asymmetric). The private key signs tokens; the public key verifies.
  The public key is exposed at GET /api/v1/auth/.well-known/jwks.json (JWKS endpoint)
  so the desktop application and any microservices can independently verify tokens
  without calling the auth server on every request.
  
  Payload:
  {
    "sub": "uuid",               // user ID
    "username": "string",        // display name
    "role": "user|admin|superadmin",
    "client_type": "web|desktop|mobile_ios|mobile_android",
    "iat": 1700000000,           // issued at (Unix timestamp)
    "exp": 1700000900,           // expiry: iat + 15 minutes (900 seconds)
    "jti": "uuid"                // JWT ID — unique per token, for optional blocklist
  }
  
  Delivery to web browser:  NOT in a cookie. In memory only (React state / Zustand).
  The access token is placed in memory on login and discarded on tab close.
  On every page load: a silent token refresh is attempted immediately.
  
  Delivery to desktop app: returned in the JSON response body of POST /api/v1/auth/login.
  The desktop app stores it in process memory only (never on disk).

REFRESH TOKEN (Opaque, 256-bit random):
  Generation: crypto.randomBytes(32) → hex string (64 chars) = the raw token.
  Storage server-side: SHA-256 hash stored in refresh_tokens table. Raw token discarded.
  
  Delivery to web browser:
    httpOnly: true         (not accessible to JavaScript — prevents XSS theft)
    SameSite: Strict       (not sent on cross-origin requests — prevents CSRF)
    Secure: true           (HTTPS only)
    Path: /api/v1/auth/    (scoped to auth endpoints only — not sent to every API call)
    Max-Age: 2592000       (30 days for web; 7776000 = 90 days for desktop)
    Cookie name: ss_refresh_token
  
  Delivery to desktop app: returned in JSON response body. Desktop stores in OS keychain
  (macOS Keychain, Windows Credential Manager, Linux libsecret). Never on filesystem.

TOKEN ROTATION:
  Every call to POST /api/v1/auth/refresh:
    1. Verify the incoming refresh token hash exists and is not revoked and not expired.
    2. Issue a NEW refresh token (rotate).
    3. Mark the OLD refresh token as revoked (revoked=TRUE, revoked_at=NOW(),
       revoked_reason='rotation').
    4. Issue a NEW access token.
    5. Return both to the client.
  
  THEFT DETECTION:
  If a refresh token that is already marked revoked is presented:
    1. Look up the user_id associated with that revoked token.
    2. Revoke ALL refresh tokens for that user_id (revoked=TRUE, revoked_reason='theft_detected').
    3. Return HTTP 401 with error code "TOKEN_THEFT_DETECTED".
    4. Send a security alert email/SMS to the user: "All sessions have been terminated
       due to suspicious activity. If this was you, you can log back in. If not,
       please reset your password immediately."
    5. Log to audit_log: event_type='all_sessions_revoked', metadata={reason:'theft_detected'}.

2.2 Password Hashing
━━━━━━━━━━━━━━━━━━━

Algorithm: Argon2id (OWASP-recommended over bcrypt for new systems).
  Parameters (must match the desktop spec exactly):
    type:        Argon2id
    memory:      65536 (64 MB)
    iterations:  3
    parallelism: 4
    hash_length: 32 bytes
    salt_length: 16 bytes (randomly generated per hash)
  
  Library: argon2 (Node.js, using native bindings to libargon2)
  
  Hash format: $argon2id$v=19$m=65536,t=3,p=4${base64_salt}${base64_hash}
  Total stored string length: ~95 characters → fits in VARCHAR(255).
  
  Parameter upgrade policy:
  On every successful password login, compare the hash's stored parameters
  against the current parameters. If different (parameters were upgraded since
  this account was created), re-hash the plaintext password (available at login
  time only) with the new parameters and update password_hash in the database.
  This ensures the entire user base gradually upgrades to stronger parameters
  without forcing mass password resets.
  
  LOG SCRUBBER RULE:
  A Fastify hook (onRequest + onSend) scrubs the following fields from ALL
  request and response logs before any log sink:
    password, confirmPassword, newPassword, currentPassword, passwordHash,
    phone_number, phoneNumber, email (partially masked: first 2 chars + *** + domain),
    token, access_token, refresh_token, otp, code, secret, api_key, client_secret
  
  This rule applies globally and cannot be bypassed for individual routes.

2.3 Sign-Up Flow (Manual — Phone + Password)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The manual sign-up flow is a 5-step wizard. Each step is a separate UI "card" within
the same page (/[locale]/auth/signup). No full page reloads between steps.
React Hook Form manages the form state across steps.

━━ STEP 1: PHONE NUMBER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UI Elements:
  — Country code picker: a combobox (searchable dropdown) showing flag emoji + country
    name + calling code (e.g. 🇰🇷 South Korea +82). Default selection determined by
    IP geolocation on page load. Sorted by: user's likely country first, then A-Z.
    Flag rendering: use Twemoji or similar accessible flag emoji set for cross-platform
    consistency (native emoji flags vary significantly across OS/browser).
    Library for phone validation: libphonenumber-js (client-side) for format validation
    and E.164 normalization.
  — Phone number input: numeric keyboard on mobile (inputMode="numeric"), no spaces or
    dashes enforced (app formats automatically). Placeholder adapts to selected country:
    South Korea → "10 1234 5678", USA → "(201) 555-0123".
  — "Send verification code" button: primary button, disabled until phone is valid format.

Client-side validation:
  — As user types: show inline green checkmark if phone is valid format, red error if invalid.
  — Validate using libphonenumber-js isPossiblePhoneNumber + isValidPhoneNumber.
  — Display formatted version below input: "+82 10-1234-5678"

On submit (POST /api/v1/auth/signup/send-otp):
  Request body:
  {
    "phone_number": "+821012345678",  // E.164, normalized server-side regardless
    "locale": "ko"
  }
  
  Server-side processing:
  1. Normalize phone to E.164 using libphonenumber-js server-side (defense in depth).
  2. Validate E.164 format with regex: ^\+[1-9]\d{7,14}$.
  3. Check rate limits (Redis):
     — sms_rate:{phone_number}:hourly: if >= 3, return HTTP 429.
     — sms_rate:{phone_number}:daily: if >= 10, return HTTP 429.
     — sms_rate:{ip}:hourly: if >= 10, return HTTP 429.
     — If rate limited: return { error: "RATE_LIMITED", retry_after_seconds: N }
  4. Check if phone_number already exists in users table:
     — SELECT id FROM users WHERE phone_number = $1 AND is_active = TRUE
     — If found: return HTTP 409 { error: "PHONE_ALREADY_EXISTS" }
     — Frontend shows: "An account already exists with this phone number. Log in instead?"
       with a link to /[locale]/auth/login.
  5. Generate 6-digit OTP: crypto.randomInt(100000, 999999).toString()
  6. Hash OTP: SHA-256 of the 6-digit string (hex output).
  7. Store in Redis:
       otp:{phone_number}:signup → JSON.stringify({hash, attempts: 0})
       TTL: 600 seconds (10 minutes)
     (Also log to otp_codes table for audit trail.)
  8. Increment SMS rate counters in Redis (INCR + EXPIRE).
  9. Route to SMS provider:
     — If phone country code = +82 → Coolsms API
     — Else → Twilio Verify API
  10. Return HTTP 200 { success: true, resend_allowed_after_seconds: 60 }

  Error responses (all with appropriate HTTP status codes):
  HTTP 400: INVALID_PHONE_FORMAT
  HTTP 409: PHONE_ALREADY_EXISTS
  HTTP 429: RATE_LIMITED (with retry_after_seconds)
  HTTP 500: SMS_SEND_FAILED (with user-friendly message, do not expose provider errors)

OTP Input UI:
  — 6 individual single-character input boxes, each width 44px, height 56px.
  — Auto-advance focus to next box after each digit entry.
  — Delete in an empty box: move focus to previous box.
  — Paste of full 6-digit code: distributed across all 6 boxes automatically.
  — Auto-submit: when all 6 digits are filled, automatically trigger OTP verification.
  — Visual state:
      Default: border 1px solid #E5E7EB (light) / #3A3A3A (dark)
      Focused: border 2px solid #1A56DB, light blue outer ring
      Filled: border 1px solid #9CA3AF
      Error state: border 2px solid #EF4444, shake animation (400ms, 4 cycles)
  — Digit display: font-size 24px, font-weight 600, text-align center.

Resend OTP:
  — "Resend code" link/button, disabled for 60 seconds after OTP is sent.
  — Countdown timer displayed: "Resend in 0:47" (decrements every second).
  — After 60 seconds: link becomes active, clicking sends a new OTP and resets counter.
  — Resending invalidates the previous OTP (delete and regenerate in Redis).

OTP Verification (POST /api/v1/auth/signup/verify-otp):
  Request: { "phone_number": "+821012345678", "otp": "123456" }
  Server:
  1. Fetch from Redis: otp:{phone_number}:signup → { hash, attempts }
  2. If key not found (expired or never created): HTTP 404 { error: "OTP_EXPIRED" }
  3. If attempts >= 5: HTTP 429 { error: "OTP_MAX_ATTEMPTS" } — OTP already invalidated.
  4. Compare: sha256(incoming_otp) vs stored hash.
  5. Mismatch: increment attempts in Redis. Return HTTP 400:
     { error: "OTP_INVALID", attempts_remaining: 5 - (attempts+1) }
     If attempts_remaining == 0: delete OTP from Redis (invalidated). Return HTTP 400
     with error "OTP_MAX_ATTEMPTS".
  6. Match: delete OTP from Redis (consumed, cannot be reused).
     Return HTTP 200 { success: true, phone_verified_token: "JWT" }
     phone_verified_token: a short-lived (15 minute) JWT containing:
     { phone_number, purpose: 'signup', verified_at: timestamp }
     This token is passed to subsequent steps to prove phone ownership.
     It is NOT an access token and cannot be used to authenticate API calls.

━━ STEP 2: EMAIL (OPTIONAL) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UI:
  — Label: "Email address (optional)" — the word "(optional)" is visually distinct
    (lighter color, smaller font) but still part of the label text.
  — Clear "Skip" button (secondary style, right-aligned): allows skipping this step
    entirely without entering an email.
  — Email input: standard text input, type="email", autocomplete="email".
  — Below input (visible only when email is filled in):
    "We'll send a verification link to this address. You can verify later."

Client-side validation:
  — On blur (when field loses focus): validate with comprehensive RFC 5322 regex.
  — Simpler check first: must contain @, must have domain with TLD.
  — The Zod schema on the backend uses z.string().email() for server-side validation.

On submit (POST /api/v1/auth/signup/check-email) — only called if user provides email:
  Request: { "email": "user@example.com", "phone_verified_token": "JWT" }
  Server:
  1. Verify phone_verified_token JWT (signature + expiry).
  2. Normalize email to lowercase.
  3. Validate RFC 5322 format.
  4. Check: SELECT id FROM users WHERE email = $1 AND is_active = TRUE
     If found: HTTP 409 { error: "EMAIL_ALREADY_EXISTS" }
     Frontend shows: "This email is already associated with an account."
     User can either change the email or skip this step.
  5. If not found: HTTP 200 { available: true }
     Store email in frontend form state. Verification email will be sent after account
     creation (Step 5), not during this step.

━━ STEP 3: USERNAME ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UI:
  — Label: "Choose your username"
  — Sublabel: "Your unique display name. 3–32 characters. Letters, numbers, _ and - only."
  — Input field with character counter: "15/32" (right-aligned, below field).
  — Real-time availability indicator (right side of input):
      Typing: spinner icon (⟳)
      Available: green checkmark (✓) + "Available"
      Taken: red X (✗) + "Already taken"
      Reserved: red X + "This username is reserved"
      Invalid format: red X + specific error (too short, invalid characters, etc.)
      Empty: no indicator

Real-time availability check:
  — Debounced: 500ms after last keystroke.
  — Client validates format first (Zod schema) before making API call.
  — API call: GET /api/v1/auth/signup/check-username?username={value}
  — Rate limited: 30 checks per minute per IP (to prevent enumeration abuse).
  — Server checks:
    a. Format validation (Zod regex).
    b. Convert to lowercase for reserved name check:
       SELECT 1 FROM reserved_usernames WHERE username = lower($1)
    c. Offensive word check: load /config/blocked_usernames_{locale}.json, compare.
    d. Existence check: SELECT 1 FROM users WHERE lower(username) = lower($1)
    — Return: { available: bool, reason: "taken"|"reserved"|"offensive"|"invalid_format" }

Username constraints (both client and server):
  — Min length: 3 characters
  — Max length: 32 characters
  — Allowed characters: Unicode letters (including Korean Hangul 가-힣, Chinese CJK 一-龯,
    Japanese Hiragana/Katakana), ASCII letters a-z A-Z, digits 0-9, underscore _, hyphen -
  — NOT allowed: spaces, dots, @, !, ?, and all other special characters
  — Cannot start or end with _ or -
  — Cannot be entirely numeric (must have at least one letter)

━━ STEP 4: PASSWORD ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UI:
  — Two separate input fields:
    Field 1: "Password" — type="password", autocomplete="new-password"
    Field 2: "Confirm password" — type="password", autocomplete="new-password"
  — Each field has a show/hide toggle: eye icon (👁) on the right. Both are independent.
    When show is toggled: changes type to "text". Icon changes to eye-with-slash (👁‍🗨).
  — Password strength meter: a 4-segment horizontal bar below Field 1.
    Segments: Weak (all red) | Fair (2 orange) | Good (3 yellow-green) | Strong (4 green)
    Implementation: zxcvbn library (Dropbox). Accepts the username and email as
    "user inputs" to penalize passwords that contain the username/email.
    Display the score label below the bar: "Weak", "Fair", "Good", "Strong"
    and a short hint from zxcvbn: e.g. "Add another word or two. Uncommon words are better."
  — Requirements checklist (live, checks off as requirements are met):
    ✓ At least 10 characters
    ✓ At least 1 uppercase letter (A–Z or Unicode uppercase)
    ✓ At least 1 lowercase letter (a–z or Unicode lowercase)
    ✓ At least 1 digit (0–9)
    ✓ At least 1 special character (!@#$%^&*...)
    Each requirement shows: gray circle → green checkmark when met.
  — Confirm field: real-time match check after user begins typing in confirm field.
    Match: green checkmark. Mismatch: "Passwords do not match" in red, field border red.
  — HaveIBeenPwned (HIBP) check: triggered on Field 1 blur (after field loses focus).
    Implementation (k-Anonymity model):
      1. SHA-1 hash of the password in JavaScript (using SubtleCrypto API).
      2. Send only the first 5 characters of the hex hash to HIBP API:
         GET https://api.pwnedpasswords.com/range/{first5chars}
      3. Check if the remaining hash characters appear in the response.
      4. If found: display a non-blocking warning below Field 1:
         "⚠ This password has appeared in a data breach. We recommend choosing a different one."
         Yellow/amber background, not red (it is a warning, not a blocking error).
         The "Continue" button remains enabled — HIBP is a recommendation, not a hard block.

Password strength requirement for form submission:
  zxcvbn score must be >= 2 ("Good" or "Strong"). If score is 0 or 1, the Continue
  button is disabled AND shows "Password too weak" tooltip on hover.

━━ STEP 5: CONSENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

UI:
  — Required checkbox: "I agree to the Terms of Service and Privacy Policy"
    Both "Terms of Service" and "Privacy Policy" are inline links:
    — Open in a new tab (target="_blank" rel="noopener noreferrer").
    — "Create account" button is disabled until this checkbox is checked.
  — Cookie consent: handled by the global cookie consent banner (see Part 4),
    NOT in this step. The consent banner appears on first visit (before reaching signup).
  — Optional newsletter checkbox (unchecked by default, separate from required consent):
    "Send me product updates and tips" — unchecked by default (GDPR opt-in).

On submit (POST /api/v1/auth/signup/create-account):
  Request body:
  {
    "phone_verified_token": "JWT",   // proves phone ownership
    "email": "user@example.com",     // optional, null if skipped
    "username": "PastorKim",
    "password": "SecureP@ssword1",
    "consent": {
      "terms_accepted": true,
      "terms_version": "2024-01",   // version of ToS accepted
      "privacy_accepted": true,
      "privacy_version": "2024-01",
      "marketing_emails": false
    },
    "locale": "ko",
    "client_type": "web"
  }
  
  Server-side processing (all in a single database transaction):
  1. Verify phone_verified_token JWT (signature + expiry + purpose='signup').
  2. Extract phone_number from token.
  3. Re-validate all fields (Zod schema — defense in depth).
  4. Re-check phone uniqueness (race condition protection).
  5. Re-check email uniqueness if provided (race condition protection).
  6. Re-check username uniqueness (race condition protection).
  7. Hash password with Argon2id.
  8. BEGIN TRANSACTION:
     a. INSERT INTO users (username, phone_number, email, password_hash,
        phone_verified, language, country_code, preferences)
        VALUES (...)
     b. If email provided: INSERT INTO email_verification_tokens (user_id, token_hash, email)
        (generate a JWT + store its hash)
     c. INSERT INTO audit_log (user_id, event_type='signup', ip_address, user_agent, metadata)
  9. COMMIT TRANSACTION.
  10. Issue access token + refresh token.
  11. Set ss_refresh_token httpOnly cookie.
  12. If email provided: send verification email asynchronously (background job, do not
      delay the API response).
  13. Return HTTP 201:
  {
    "access_token": "JWT",
    "user": {
      "id": "uuid",
      "username": "PastorKim",
      "email": "user@example.com",
      "email_verified": false,
      "phone_number": "+821012345678",
      "phone_verified": true,
      "language": "ko",
      "role": "user",
      "avatar_url": null
    }
  }

  On return: frontend stores access_token in Zustand, marks user as authenticated,
  redirects to /[locale]/dashboard with a smooth transition.

  Error codes (all return HTTP 422 unless noted):
  PHONE_TOKEN_INVALID (401): phone_verified_token is invalid or expired
  PHONE_ALREADY_EXISTS (409): phone registered in the race window
  EMAIL_ALREADY_EXISTS (409): email registered in the race window
  USERNAME_TAKEN (409): username taken in the race window
  USERNAME_INVALID (422): format validation failed
  PASSWORD_TOO_WEAK (422): zxcvbn score < 2 (server-side check)
  CONSENT_REQUIRED (422): terms_accepted is false
  INTERNAL_ERROR (500): database error (transaction failed)


2.4 Sign-Up Flow (Google OAuth)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Button specification:
  — Uses Google Identity Services (GIS) JavaScript library v1.
  — Must follow Google's Brand Guidelines exactly:
    • Width: minimum 400px desktop, 100% on mobile.
    • Height: 40px (standard) or 44px (large).
    • Font: Roboto or Google Sans (loaded from Google Fonts).
    • Text: "Continue with Google" (approved wording).
    • Google G logo: official multicolor SVG, left of text.
    • Background: white (#FFFFFF) in light mode, dark (#1E1E1E) in dark mode.
    • Border: 1px solid #747775.
    • Border-radius: 4px (per Google spec — do not round to pill).
  — The button is shown on both the /signup and /login pages.

OAuth flow:
  1. User clicks "Continue with Google".
  2. Frontend calls google.accounts.id.initialize() + google.accounts.id.prompt()
     OR redirects to GET /api/v1/auth/google/initiate:
     Server generates a CSRF state parameter (random 32 bytes, stored in Redis
     with TTL 10 minutes: oauth_state:{state} → user_ip) and redirects to:
     https://accounts.google.com/o/oauth2/v2/auth?
       client_id={GOOGLE_OAUTH_CLIENT_ID}
       &redirect_uri=https://syncsanctuary.app/api/v1/auth/google/callback
       &response_type=code
       &scope=openid email profile
       &state={state}
       &access_type=offline
       &prompt=select_account
  3. User authenticates with Google and is redirected back to:
     GET /api/v1/auth/google/callback?code={auth_code}&state={state}
  4. Server validates state parameter (fetch from Redis, verify IP matches, delete key).
     If state is invalid or expired: redirect to /auth/error?error=oauth_state_invalid
  5. Exchange code for tokens via Google Token API:
     POST https://oauth2.googleapis.com/token with client credentials.
     Receives: id_token, access_token (Google's, not ours), refresh_token (Google's).
  6. Decode and verify id_token (JWT RS256, verify with Google's public keys from
     https://www.googleapis.com/oauth2/v3/certs).
  7. Extract: sub (google_id), email, email_verified, name, picture, locale.
  8. Lookup: SELECT * FROM users WHERE google_id = $1
     — FOUND: user exists → log in:
       a. Update last_login_at.
       b. Issue our access + refresh tokens.
       c. Set cookie, redirect to /[locale]/dashboard?welcome=back
     — NOT FOUND: check if email exists: SELECT * FROM users WHERE email = $1
       — Email exists (different sign-in method): show error page:
         "An account with this email already exists. Please log in with your password."
         with option to link Google to existing account (Phase 2 feature).
       — Email does not exist: new user. Redirect to /[locale]/auth/signup/google-complete
         with a temporary session token (short-lived JWT, 15 min):
         { google_id, email, email_verified, google_name, google_picture }
         This page shows a simplified signup form (Steps 3+4+5 only — username,
         password optional, and consent). Phone number is still collected here
         because it is required in our system.

Google-complete page additional considerations:
  — If the Google account has email_verified: true, skip email verification step
    (set email_verified=TRUE in our database immediately on account creation).
  — Password is optional for Google-linked accounts (password_hash will be NULL).
    The "Password" section is labeled "Set a password (optional — you can always log in
    with Google)" with a "Skip this step" button.
  — If user sets a password: apply same strength requirements as manual signup.
  — Phone number is REQUIRED even for Google OAuth signup. Show a Step 1 screen
    (phone + OTP verification) BEFORE the Google-complete form.


2.5 Login Flow
━━━━━━━━━━━━

Page: /[locale]/auth/login
Form elements:
  — Single "Phone number or email" field (auto-detect which was entered):
    Detection logic (client-side): if value contains @ → treat as email.
    Otherwise → try to parse as phone (libphonenumber-js). If parseable → phone. Else → neither.
    Visual indicator: small icon inside the field changes dynamically:
    📱 (phone detected), ✉ (email detected), ? (unrecognized).
  — Password field with show/hide toggle.
  — "Forgot password?" link: right-aligned, below password field.
  — "Log in" primary button.
  — "Continue with Google" button.
  — "Don't have an account? Sign up" link.
  — "Remember this device" checkbox (14px, below buttons):
    When checked: refresh token expiry is set to 30 days (web) / 90 days (desktop).
    When unchecked: refresh token expiry is set to 24 hours (web session).
    NOT related to auto-fill or browser password saving.

POST /api/v1/auth/login:
  Request:
  {
    "identifier": "string",  // phone (E.164) or email
    "password": "string",
    "client_type": "web",
    "client_version": null,  // version string, required for desktop client_type
    "platform": null,        // "windows"|"macos"|"linux", required for desktop
    "remember_device": false
  }
  
  Server processing:
  1. Detect identifier type:
     — Contains @: treat as email
     — Matches ^\+[1-9]\d{7,14}$: treat as phone (already in E.164)
     — Else: attempt libphonenumber-js parse with country detection
     — If still unrecognizable: return HTTP 400 { error: "INVALID_IDENTIFIER" }
  
  2. Look up user:
     — Email: SELECT * FROM users WHERE email = lower($1) AND is_active = TRUE
     — Phone: SELECT * FROM users WHERE phone_number = $1 AND is_active = TRUE
  
  3. If not found: return HTTP 401 { error: "INVALID_CREDENTIALS" }
     NOTE: The error message "Invalid credentials" does NOT specify whether the
     identifier or password was wrong. This prevents account enumeration.
     (The signup flow IS different — it tells users if a phone/email exists because
     users need that information to not re-register.)
  
  4. If found but is_active = FALSE:
     — If deleted_at is set: return HTTP 401 { error: "ACCOUNT_DELETED" }
       (Account in 30-day grace period or permanently deleted.)
     — Else: return HTTP 401 { error: "ACCOUNT_SUSPENDED" }
  
  5. Check lockout: if locked_until IS NOT NULL AND locked_until > NOW():
     Return HTTP 423 { error: "ACCOUNT_LOCKED",
       locked_until: "ISO8601",
       retry_after_seconds: (locked_until - NOW()) in seconds }
  
  6. If user.password_hash IS NULL (Google-only account) and no Google OAuth was used:
     Return HTTP 401 { error: "NO_PASSWORD_SET",
       hint: "This account was created with Google. Please use 'Continue with Google'." }
  
  7. Verify password: argon2.verify(user.password_hash, incoming_password)
     — Failure:
       a. INCREMENT users SET login_attempt_count = login_attempt_count + 1
          WHERE id = $user_id
       b. If login_attempt_count >= 5 AND failed_attempts_reset_at > NOW() - INTERVAL '15 min':
          SET locked_until = NOW() + INTERVAL '15 minutes'
          SET login_attempt_count = 0
          Log audit: account_locked
          Send security alert email/SMS if contact info is verified:
          "Your account has been locked due to 5 failed login attempts.
           It will unlock automatically in 15 minutes."
          Return HTTP 423 { error: "ACCOUNT_LOCKED", locked_until: "...", retry_after_seconds: N }
       c. Else: return HTTP 401 { error: "INVALID_CREDENTIALS" }
     — Success:
       a. Reset login_attempt_count = 0, locked_until = NULL.
       b. Update last_login_at = NOW().
       c. Check if password re-hashing is needed (parameter upgrade). If so, re-hash and update.
       d. Issue access token + refresh token.
       e. INSERT INTO refresh_tokens (token_hash, user_id, expires_at, ip_address,
          user_agent, device_name, client_type, revoked=FALSE).
       f. Set ss_refresh_token httpOnly cookie (expiry based on remember_device).
       g. Log audit: login_success.
       h. Return HTTP 200 { access_token: "JWT", user: { ...profile } }

  Rate limiting on /login endpoint:
  — 5 requests per 15 minutes per IP (sliding window, Redis).
  — 20 requests per hour per IP.
  — Exceeding: HTTP 429 { error: "RATE_LIMITED", retry_after_seconds: N }
  — This is separate from the per-account lockout above.


2.6 Token Refresh Endpoint
━━━━━━━━━━━━━━━━━━━━━━━━━

POST /api/v1/auth/refresh
Authentication: reads ss_refresh_token httpOnly cookie (web) OR
                reads Authorization: Bearer {refresh_token} header (desktop)
No request body needed.

Processing:
  1. Extract raw refresh token from cookie or header.
  2. Compute SHA-256 hash.
  3. SELECT * FROM refresh_tokens WHERE token_hash = $1
  4. If not found: HTTP 401 { error: "REFRESH_TOKEN_NOT_FOUND" }
  5. If revoked = TRUE: trigger theft detection (see Section 2.1). HTTP 401 { error: "TOKEN_THEFT_DETECTED" }
  6. If expires_at < NOW(): HTTP 401 { error: "REFRESH_TOKEN_EXPIRED" }
  7. Fetch user: SELECT * FROM users WHERE id = $user_id AND is_active = TRUE
  8. If user not active: HTTP 401 { error: "USER_INACTIVE" }
  9. Generate new refresh token (rotate):
     a. New raw token: crypto.randomBytes(32).toString('hex')
     b. New token hash: SHA-256 of new raw token
     c. UPDATE old token: revoked=TRUE, revoked_at=NOW(), revoked_reason='rotation'
     d. INSERT new refresh token into refresh_tokens table
  10. Issue new access token JWT.
  11. Set new ss_refresh_token cookie (same Max-Age as original login).
  12. Return HTTP 200 { access_token: "JWT", user: { ...profile } }


2.7 Logout
━━━━━━━━━

POST /api/v1/auth/logout
Authentication: requires valid access token (Bearer).
Body: { "all_devices": false }  // true = revoke all refresh tokens for this user

Processing:
  1. Extract user_id from JWT.
  2. If all_devices = false:
     — Find refresh token from cookie/header, revoke only that one.
  3. If all_devices = true:
     — UPDATE refresh_tokens SET revoked=TRUE, revoked_reason='logout'
       WHERE user_id=$1 AND revoked=FALSE
  4. Clear the ss_refresh_token cookie (set Max-Age=0).
  5. Log audit: logout (or all_sessions_revoked if all_devices=true).
  6. Return HTTP 200 { success: true }


2.8 Password Reset Flow
━━━━━━━━━━━━━━━━━━━━━━

Step 1 — Request reset (POST /api/v1/auth/password-reset/request):
  Request: { "identifier": "phone or email" }
  
  Processing:
  1. Look up user by phone or email.
  2. CRITICAL: Always return HTTP 200 regardless of whether user was found.
     Returning different responses for found/not-found leaks account existence.
     Response: { "message": "If an account exists with this contact, a reset code has been sent." }
  3. If user was found AND has verified contact info:
     — If identifier is phone (or user has no email): send SMS OTP (same OTP flow as signup).
     — If identifier is email (and email_verified=TRUE): generate JWT reset link,
       store hash in password_reset_tokens table, send email.
     — If identifier is email but NOT verified: send via phone instead (if available).
  4. Rate limit: 3 reset requests per phone/email per hour.

Step 2 — Verify (same OTP UI or email link click):
  — OTP path: POST /api/v1/auth/password-reset/verify-otp
    Same as signup OTP verification but purpose='password_reset'.
    Returns a short-lived reset_token JWT (15 min).
  — Email link path: GET /api/v1/auth/password-reset/verify-link?token={JWT}
    Server validates JWT, checks it against hash in password_reset_tokens table.
    If valid: redirect to /[locale]/auth/reset-password with reset_token in URL fragment
    (#token={reset_token}) — fragments are not sent to servers, preventing logging.

Step 3 — Set new password (POST /api/v1/auth/password-reset/complete):
  Request: { "reset_token": "JWT", "new_password": "NewP@ssword1" }
  
  Processing:
  1. Verify reset_token JWT.
  2. Extract user_id and password_hash_snapshot from token.
  3. Fetch current password_hash from DB. Verify first 16 chars match snapshot
     (ensures link is invalidated if password was already changed).
  4. Validate new password strength (same rules as signup).
  5. Hash new password with Argon2id.
  6. UPDATE users SET password_hash=$1 WHERE id=$2.
  7. Mark reset token as used in password_reset_tokens table.
  8. REVOKE ALL refresh tokens for this user (force logout of all devices):
     UPDATE refresh_tokens SET revoked=TRUE, revoked_reason='password_change'
     WHERE user_id=$1 AND revoked=FALSE
  9. Send security notification: "Your password was changed. If this wasn't you, contact support."
  10. Log audit: password_reset_complete.
  11. Return HTTP 200 { success: true }
  12. Frontend: redirect to /[locale]/auth/login with success toast:
      "Password changed successfully. Please log in with your new password."


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — COOKIE CONSENT SYSTEM (GDPR/CCPA/PDPA/PIPL COMPLIANT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3.1 Consent Banner Specification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Trigger: appears on first visit when no consent cookie (ss_consent_v1) is present.
Position: fixed at bottom of viewport (NOT a full-screen modal — this is poor UX and
          increasingly challenged by regulators as "consent walls").
Z-index: 9999 (above all other content).
Does NOT block page interaction. User can browse the page while banner is visible.

Banner visual specification:
  Width: 100% (full viewport width)
  Background: #FFFFFF (light mode) / #1E1E1E (dark mode)
  Border-top: 1px solid #E5E7EB (light) / #333333 (dark)
  Padding: 16px 24px
  Box-shadow: 0 -4px 24px rgba(0,0,0,0.08) (light) / 0 -4px 24px rgba(0,0,0,0.4) (dark)
  Layout: flexbox, align-items center, gap 24px, flex-wrap wrap
  
  Left content (flex: 1):
    Heading: "We use cookies" — font-size 14px, font-weight 600
    Body: "SyncSanctuary uses cookies to keep you logged in and improve your experience.
           Read our [Privacy Policy] for details."
    "[Privacy Policy]" is an inline link, opens in new tab.
    Font-size: 13px, color: #6B7280 (light) / #9CA3AF (dark)
  
  Right buttons (flex-shrink 0):
    [Manage preferences] — secondary button (outlined): shows preferences panel
    [Accept all] — primary button (filled, brand blue)
    Gap between buttons: 8px
  
  Dismiss animation: slides down out of viewport (translateY(100%)) over 300ms ease-in
  when user makes a selection.

3.2 Manage Preferences Expansion
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When "Manage preferences" is clicked, the banner EXPANDS in place (not a new modal)
to show the detailed preferences:

Expanded height: approximately 280px additional.
Animation: height transition 300ms ease-out (use CSS grid-template-rows trick for
smooth height animation without JavaScript).

Expanded content: three toggle rows.

Toggle Row 1 — Strictly Necessary:
  Label: "Strictly Necessary"
  Description: "Required for the website to function. Cannot be disabled."
  Toggle: LOCKED ON (visually disabled, cannot be toggled off).
  Toggle style: green, small padlock icon beside it.
  Includes: session management cookie, CSRF token cookie, language preference cookie,
            consent record cookie itself.

Toggle Row 2 — Analytics:
  Label: "Analytics"
  Description: "Anonymous usage data to help us improve the product."
  Toggle: DEFAULT OFF. User must explicitly opt in.
  Includes: PostHog or Plausible page view events, Sentry error reporting.
  Toggle style: gray (off) / green (on). Animated 200ms slide.

Toggle Row 3 — Preferences:
  Label: "Preferences"
  Description: "Remember your UI settings like theme and language."
  Toggle: DEFAULT OFF.
  Includes: theme preference cookie (dark/light), language override cookie.
  Toggle style: same as Analytics.

Buttons in expanded state:
  [Save preferences] — primary button, saves current toggle state as consent record.
  [Accept all] — same as before.
  [Reject all] — only necessary cookies active.

3.3 Consent Record Storage
━━━━━━━━━━━━━━━━━━━━━━━━━

Cookie name: ss_consent_v1
Max-Age: 31536000 (365 days)
SameSite: Lax
Secure: true (HTTPS only)
Value: JSON stringified, then URL-encoded:

{
  "necessary": true,         // always true, not configurable
  "analytics": false,        // user choice
  "preferences": false,      // user choice
  "timestamp": "2024-01-15T10:30:00.000Z",  // ISO8601 of when consent was given
  "version": 1               // consent schema version number
}

3.4 Server-Side Consent Enforcement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL: The server MUST read the ss_consent_v1 cookie on every response and
only SET analytical/preference cookies if the corresponding consent flag is true.
This is enforced in a Fastify onSend hook that runs before every response.

Hook logic:
  1. Parse ss_consent_v1 cookie. If absent: treat as { analytics: false, preference: false }.
  2. If analytics = false: do NOT set any analytics cookies in this response.
     Also: do NOT inject PostHog/Plausible tracking scripts into HTML responses.
  3. If preferences = false: do NOT set the theme or language preference cookies.

3.5 Consent Version Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current consent schema version: 1.
If new cookie categories are added in the future, increment to 2.
On every page load: middleware reads ss_consent_v1. If version < current_version,
show the banner again with a note: "We've updated our cookie policy. Please review your preferences."
The old consent remains in effect until the user makes a new choice.

3.6 Legal Compliance Notes
━━━━━━━━━━━━━━━━━━━━━━━━━

GDPR (EU/EEA): The banner and opt-in model above satisfies GDPR Article 7 requirements.
CCPA (California): Analytics and preference cookies are "sale/sharing" opt-outs under CCPA.
  A "Do Not Sell or Share My Personal Information" link must appear in the footer.
PDPA (Korea — 개인정보 보호법): Phone number is PII requiring explicit consent.
  The signup flow obtains explicit consent via the Terms/Privacy checkboxes.
PIPL (China): Data localization requirements apply if serving users in mainland China.
  All user data for CN users must be stored on servers physically located in China.
  (OPTIONAL — Phase 2 — requires separate infrastructure.)
Legal review: Before launching in each jurisdiction, have local counsel review the
consent flow and Privacy Policy. This document does not constitute legal advice.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — INTERNATIONALIZATION (i18n) — COMPLETE SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4.1 Supported Languages at Launch
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Locale      Language                      Default Region(s)       Notes
─────────── ────────────────────────────  ──────────────────────  ──────────────────────────
en          English                       Global fallback         UTF-8, LTR, 12-hour time
ko          한국어 (Korean)                KR                      UTF-8, LTR, 12-hour time
de          Deutsch (German)              DE, AT, CH              UTF-8, LTR, 24-hour time
es          Español (Spanish)             ES, LATAM               UTF-8, LTR, 24-hour time
fr          Français (French)             FR, BE, CA              UTF-8, LTR, 24-hour time
zh-CN       中文简体 (Mandarin Simplified) CN, SG                  UTF-8, LTR, 24-hour time
zh-TW       中文繁體 (Mandarin Traditional) TW, HK                 UTF-8, LTR, 12-hour time
ja          日本語 (Japanese)              JP                      UTF-8, LTR, 24-hour time
pt-BR       Português (Brazilian)         BR                      UTF-8, LTR, 24-hour time
pt-PT       Português (European)          PT                      UTF-8, LTR, 24-hour time
it          Italiano (Italian)            IT                      UTF-8, LTR, 24-hour time
ar          العربية (Arabic)              AR, AE, SA, EG          UTF-8, RTL — Phase 2

Phase 2 additions (planned, not required at launch):
  hi (Hindi), ru (Russian), nl (Dutch), pl (Polish), sv (Swedish), tr (Turkish)

4.2 Language Detection on First Visit (Priority Order)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The following is evaluated in order, stopping at the first successful detection:

1. Explicit URL locale prefix: if the URL contains /ko/ → use Korean. Trust the URL above all.
2. Stored preference cookie: if ss_consent_v1 includes preferences:true AND a language
   preference cookie (ss_lang) is present → use that language.
3. Authenticated user's stored language: if user is logged in → use users.language field.
4. Accept-Language HTTP header: parse the header (e.g. "ko-KR,ko;q=0.9,en;q=0.8") and
   map the highest-priority language to our supported locales. Use the BCP 47 subtag
   matching algorithm (exact match first, then language prefix match).
5. IP Geolocation: use MaxMind GeoLite2 (bundled, updated monthly) to determine country
   from client IP address. Map country to default language:
   KR → ko, DE/AT/CH → de, ES/MX/CO/AR/PE/CL/VE/EC/BO/UY/PY/GT/CR/PA/DO/HN/SV/NI/CU/PR → es,
   FR/BE/CH/CA-QC → fr, CN/SG → zh-CN, TW/HK → zh-TW, JP → ja, BR → pt-BR, PT → pt-PT,
   IT/CH → it, All others → en.
6. Fallback: English (en).

"Confirm your language" dialog:
On first visit (no stored preference, regardless of detection method used):
  — Show a non-blocking modal (dismissible, does not prevent browsing) after 2 seconds.
  — Title: "Is this the right language?" (shown in the detected language).
  — Shows: "We detected your language as [Language Name]."
  — Dropdown to change if wrong.
  — Two buttons: [Yes, continue] and [Change language] (opens dropdown).
  — On confirm: store in preference cookie (if consent allows) + redirect to correct locale URL.

4.3 Locale File Format
━━━━━━━━━━━━━━━━━━━━

File location: /messages/{locale}.json
All files are identical in key structure; only values differ.
Format: flat JSON (no nesting deeper than 2 levels). Key naming: dot-separated namespaced.

ICU MessageFormat is used for all strings. Key rules:
  — Simple string: "nav.home": "Home"
  — Interpolation: "auth.otp_sent": "We sent a code to {phone}"
  — Pluralization: "slides.count": "{count, plural, one {# slide} other {# slides}}"
  — Select: "auth.gender": "{gender, select, male {Mr.} female {Ms.} other {Mx.}}"
  — Number formatting: "stats.percentage": "{value, number, percent}"
  — Date formatting: "dates.joined": "Joined {date, date, long}"

COMPLETE key namespace list (all keys must exist in all locale files):

nav.*            — Navigation labels (Home, Download, Dashboard, Account, Log In, Sign Up)
auth.*           — Authentication UI strings (all signup/login/reset labels, errors, hints)
cookie.*         — Cookie consent banner strings
dashboard.*      — Dashboard page content
download.*       — Download page content
account.*        — Account settings page content
pricing.*        — Pricing page (future)
footer.*         — Footer links and text
errors.*         — API error messages displayed to users
common.*         — Shared strings (Save, Cancel, Continue, Back, Loading, Error, Success)
meta.*           — Page titles and SEO meta descriptions for each page
aria.*           — Accessible labels for screen readers (non-visible UI strings)

Adding a new language:
  1. Create /messages/{locale}.json with all keys translated.
  2. Add locale to the supported locales array in next-intl config.
  3. Add locale to the language picker dropdown component.
  4. Add locale to the database language column CHECK constraint.
  5. ZERO code changes required anywhere else.
  6. Verify with i18n linter: npx next-intl-cli check (reports missing keys).

4.4 Locale-Aware Formatting (Implemented via Intl API)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All formatting uses the native JavaScript Intl API:

Number formatting:
  new Intl.NumberFormat(locale).format(1234567.89)
  → en: "1,234,567.89"
  → de: "1.234.567,89"
  → ko: "1,234,567.89"

Date/time formatting:
  new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(date)
  → en: "January 15, 2024"
  → ko: "2024년 1월 15일"
  → de: "15. Januar 2024"

Time format:
  12-hour (en, ko, zh-TW, pt-BR, it): format includes AM/PM
  24-hour (de, es, fr, zh-CN, ja, pt-PT): format uses 24-hour clock

Relative time:
  new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  → "3 days ago" / "3일 전" / "vor 3 Tagen"

Currency (future):
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' })

4.5 URL Structure for Locales
━━━━━━━━━━━━━━━━━━━━━━━━━━━

/ → automatic redirect to /{detected_locale}/
/[locale]/ → Home page
/[locale]/auth/signup → Sign-up page
/[locale]/auth/login → Login page
/[locale]/auth/reset-password → Password reset page
/[locale]/dashboard → Post-login dashboard
/[locale]/download → Download page
/[locale]/account → Account settings
/[locale]/account/security → Security settings (sessions, password)
/[locale]/account/preferences → Notification and language preferences
/[locale]/terms → Terms of Service
/[locale]/privacy → Privacy Policy
/[locale]/support → Support portal
/[locale]/features → Features overview (marketing)
/[locale]/changelog → Release notes

Canonical URL handling:
  <link rel="canonical" href="https://syncsanctuary.app/en/..." />
  <link rel="alternate" hreflang="ko" href="https://syncsanctuary.app/ko/..." />
  — hreflang tags: one per supported locale + hreflang="x-default" pointing to /en/
  These are essential for international SEO.

4.6 Language Switcher Component
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Location: appears in:
  — Navigation bar (right side, always visible, globe icon + current language abbreviation)
  — Footer (text links to each locale)
  — Cookie consent banner (small link, for users who need to change language before
    reading cookie information)

Behavior:
  — Click globe icon → dropdown appears with all supported languages.
  — Each language shown in its own script: "English", "한국어", "Deutsch", "Español"...
  — On selection: navigate to the same page in the new locale.
    E.g. /en/download → /ko/download (path structure is locale-agnostic).
  — Store preference in ss_lang cookie (if preference consent is given).
  — If user is logged in: update users.language field via
    PATCH /api/v1/account/preferences { "language": "ko" }.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — DESIGN SYSTEM (VISUAL LANGUAGE & TOKENS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5.1 Design Philosophy and Reference
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Aesthetic direction: editorial, dignified, world-class. Think of the kind of craftsmanship
you see at floema.com — generous whitespace, typography as the primary design element,
subtle organic touches, refined micro-interactions, nothing cluttered or garish.

The church context demands seriousness and warmth simultaneously. The design must convey
trust, professionalism, and care — appropriate for institutions handling people's sacred
community experiences. It must NOT look like generic SaaS software. It must NOT look like
a gaming product. It must feel like beautifully designed software built by people who
respect the craft of worship production.

Characteristics to achieve:
  — Generous whitespace: let elements breathe.
  — Typography-forward: the best typeface combination carries more weight than any graphic.
  — Restrained color palette: mostly neutrals with one considered accent color.
  — Smooth, purposeful motion: every animation communicates meaning, not decoration.
  — Pixel-precision: 1px off is wrong. Every measurement is intentional.
  — Accessible by default: beautiful design that excludes users is failed design.

5.2 Typography
━━━━━━━━━━━━━

Font loading: Google Fonts (preconnect + preload for performance).

Display / Hero font (for large headings, H1, hero statements):
  Primary: "Fraunces" — a variable font with optical size axis.
    Usage: hero headlines, marketing page H1/H2.
    Weight range: 300–700 (variable).
    Style: italic variant used for emphasis within headings.
    Optical size: `opsz` axis set to match point size for optimal rendering.
    Character: warm, slightly literary, gravitas without being stuffy.
  Fallback: Georgia, "Times New Roman", serif

UI / Body font (for all interface text, body copy, labels, inputs):
  Primary: "Inter" — optimized for screen readability.
    Usage: all UI elements, body text, navigation, labels, buttons, inputs.
    Weight range: 300–700 (variable with `wght` axis).
    Fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif

Monospace font (for code, timecodes, OTP inputs):
  Primary: "JetBrains Mono" (or "Fira Code" as fallback)
  Weight: 400 (regular), 500 (medium)
  Fallback: "SF Mono", Menlo, Monaco, Consolas, monospace

Type scale (based on a 1.25 modular scale, base 16px):

Token           Size    Line Height  Weight  Usage
─────────────── ──────  ───────────  ──────  ─────────────────────────────────────
display-2xl     72px    80px         400     Hero statement (Fraunces)
display-xl      60px    68px         400     Primary hero heading (Fraunces)
display-lg      48px    56px         500     Section hero (Fraunces)
display-md      36px    44px         500     Large subheadings (Fraunces)
display-sm      30px    38px         600     Card headlines (Inter or Fraunces)
display-xs      24px    32px         600     Section titles (Inter)
text-xl         20px    30px         400     Intro paragraphs
text-lg         18px    28px         400     Body text (important)
text-md         16px    24px         400     Standard body text (default)
text-sm         14px    20px         400     Secondary text, labels
text-xs         12px    18px         400     Captions, fine print, badges
text-xxs        11px    16px         500     Status text, timestamps

5.3 Color Palette
━━━━━━━━━━━━━━━

Brand accent color: Deep Indigo Blue.
  Chosen for: dignity, trust, creativity, appropriate for a professional church context.
  Does not feel corporate/cold but does feel serious and reliable.

CSS Custom Properties — all defined in :root and [data-theme="dark"]:

Light Mode (default):
  /* Backgrounds */
  --color-bg-base:           #FAFAFA    /* Page background — slightly off-white */
  --color-bg-surface:        #FFFFFF    /* Cards, panels, modals */
  --color-bg-surface-raised: #F3F4F6    /* Elevated cards, dropdowns */
  --color-bg-muted:          #F9FAFB    /* Subtle sections, code blocks */
  --color-bg-inverse:        #111827    /* Dark sections on light page */

  /* Brand */
  --color-brand-50:          #EEF2FF
  --color-brand-100:         #E0E7FF
  --color-brand-200:         #C7D2FE
  --color-brand-300:         #A5B4FC
  --color-brand-400:         #818CF8
  --color-brand-500:         #6366F1    /* Primary brand color */
  --color-brand-600:         #4F46E5    /* Default button, links */
  --color-brand-700:         #4338CA    /* Button hover */
  --color-brand-800:         #3730A3    /* Button active/pressed */
  --color-brand-900:         #312E81
  --color-brand-950:         #1E1B4B

  /* Text */
  --color-text-primary:      #111827    /* Main body text */
  --color-text-secondary:    #4B5563    /* Supporting text */
  --color-text-tertiary:     #9CA3AF    /* Placeholder, muted */
  --color-text-inverse:      #FFFFFF    /* Text on dark backgrounds */
  --color-text-brand:        #4F46E5    /* Links, brand-colored text */
  --color-text-danger:       #DC2626    /* Error messages */
  --color-text-warning:      #D97706    /* Warning messages */
  --color-text-success:      #059669    /* Success messages */

  /* Borders */
  --color-border-default:    #E5E7EB
  --color-border-strong:     #D1D5DB
  --color-border-focus:      #6366F1    /* Focus rings */
  --color-border-danger:     #FCA5A5

  /* Semantic status */
  --color-success-bg:        #ECFDF5
  --color-success-text:      #065F46
  --color-success-border:    #6EE7B7
  --color-warning-bg:        #FFFBEB
  --color-warning-text:      #92400E
  --color-warning-border:    #FCD34D
  --color-danger-bg:         #FEF2F2
  --color-danger-text:       #991B1B
  --color-danger-border:     #FCA5A5
  --color-info-bg:           #EFF6FF
  --color-info-text:         #1E40AF
  --color-info-border:       #93C5FD

Dark Mode ([data-theme="dark"] or @media (prefers-color-scheme: dark)):
  --color-bg-base:           #0D0D0F    /* Near-black, NOT gray — for dim production rooms */
  --color-bg-surface:        #18181B
  --color-bg-surface-raised: #232329
  --color-bg-muted:          #141417
  --color-bg-inverse:        #FAFAFA
  --color-text-primary:      #F9FAFB
  --color-text-secondary:    #9CA3AF
  --color-text-tertiary:     #6B7280
  --color-text-inverse:      #111827
  --color-text-brand:        #818CF8
  --color-border-default:    #2D2D35
  --color-border-strong:     #3F3F4A
  [All brand, semantic colors adjusted for dark backgrounds]

Dark/Light mode toggle:
  — Toggle button: sun icon in light mode, moon icon in dark mode.
  — Animated icon transition: the icon rotates 20° and the moon/sun morphs via SVG path
    animation (not just a src swap) over 300ms.
  — Preference stored in localStorage AND in ss_lang cookie (if preference consent given).
  — System preference (prefers-color-scheme) is the default before user explicitly toggles.
  — SSR dark mode: read from cookie on server to avoid flash of incorrect theme (FOIT).
    The Fastify backend reads ss_theme cookie and injects data-theme attribute into
    the HTML <html> tag before sending to client.

5.4 Spacing Scale
━━━━━━━━━━━━━━━

Based on a 4px base unit:
  --spacing-0:    0px
  --spacing-1:    4px
  --spacing-2:    8px
  --spacing-3:    12px
  --spacing-4:    16px
  --spacing-5:    20px
  --spacing-6:    24px
  --spacing-8:    32px
  --spacing-10:   40px
  --spacing-12:   48px
  --spacing-16:   64px
  --spacing-20:   80px
  --spacing-24:   96px
  --spacing-32:   128px
  --spacing-40:   160px
  --spacing-48:   192px

5.5 Grid System
━━━━━━━━━━━━━

Based on a 12-column grid with CSS Grid:
  Max content width: 1280px (centered on large screens)
  Wide content width: 1440px (for full-bleed hero sections)
  
  Breakpoints:
    xs:   0 – 374px      (small phones — rare but must not break)
    sm:   375px           (standard phones: iPhone SE, Galaxy S)
    md:   768px           (tablets: iPad, landscape phone)
    lg:   1024px          (laptops: 13" MacBook)
    xl:   1280px          (desktops: 15" MacBook, external monitor)
    2xl:  1440px          (wide monitors: 27" iMac, external UHD)
  
  Column gap: 24px (desktop), 16px (tablet), 16px (mobile)
  Outer margin: 24px (mobile), 32px (tablet), auto (desktop, max-width enforced)

5.6 Border Radius Scale
━━━━━━━━━━━━━━━━━━━━━

  --radius-none:  0px
  --radius-sm:    4px     (buttons, inputs, small chips)
  --radius-md:    8px     (cards, panels, dropdown menus)
  --radius-lg:    12px    (modals, feature cards)
  --radius-xl:    16px    (large cards, hero image frames)
  --radius-2xl:   24px    (pill-shaped elements)
  --radius-full:  9999px  (avatars, toggle switches)

5.7 Elevation / Shadow Scale
━━━━━━━━━━━━━━━━━━━━━━━━━━━

  --shadow-xs:    0 1px 2px rgba(0,0,0,0.05)
  --shadow-sm:    0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
  --shadow-md:    0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)
  --shadow-lg:    0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)
  --shadow-xl:    0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)
  --shadow-2xl:   0 25px 50px rgba(0,0,0,0.25)
  Dark mode adjustments: multiply all rgba alpha values by 2–3× (dark surfaces need stronger
  shadows to maintain elevation hierarchy).

5.8 Component Library Specification
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All interactive components are built on Radix UI primitives (for accessibility) with custom
Tailwind CSS styling. NEVER use a pre-styled component library like shadcn/ui or MUI without
customizing every visual to match this design system.

Button variants:
  Primary:    background var(--color-brand-600), text white, hover: brand-700, active: brand-800
  Secondary:  background transparent, border 1.5px brand-600, text brand-600, hover: brand-50
  Ghost:      background transparent, no border, text secondary, hover: bg-surface-raised
  Danger:     background red-600, text white, hover: red-700
  
  Sizes:
    sm:     height 32px, padding 0 12px, font 13px, radius-sm
    md:     height 40px, padding 0 16px, font 14px, radius-sm (default)
    lg:     height 48px, padding 0 20px, font 15px, radius-md
    xl:     height 56px, padding 0 24px, font 16px, radius-md
  
  States: default → hover → active → focus-visible → disabled (opacity 0.5 + not-allowed)
  Loading state: spinner replaces leading icon, text changes to "Loading...", button disabled.
  Focus ring: 2px solid var(--color-brand-500), 2px offset (focus-visible only, not :focus).

Input fields:
  Height: 40px (md), 36px (sm), 48px (lg)
  Background: var(--color-bg-surface)
  Border: 1.5px solid var(--color-border-default)
  Border-radius: var(--radius-sm)
  Padding: 0 12px
  Font-size: 14px (md)
  Placeholder color: var(--color-text-tertiary)
  States:
    Default: border default
    Hover: border strong
    Focus: border brand-500 (var --color-border-focus), shadow 0 0 0 3px rgba(99,102,241,0.15)
    Error: border danger (red-400), shadow 0 0 0 3px rgba(220,38,38,0.15)
    Success: border success (green-400)
    Disabled: background bg-muted, border border-default, cursor not-allowed, opacity 0.6

5.9 Scrollbar Styling
━━━━━━━━━━━━━━━━━━━

/* WebKit-based browsers (Chrome, Safari, Edge): */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--color-bg-muted); border-radius: 4px; }
::-webkit-scrollbar-thumb { background: var(--color-border-strong); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--color-text-tertiary); }

/* Firefox: */
* { scrollbar-width: thin; scrollbar-color: var(--color-border-strong) var(--color-bg-muted); }


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 6 — PAGE-BY-PAGE SPECIFICATION (COMPLETE UX + CONTENT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6.1 Navigation Bar (Global Component)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Present on all pages. Two states: unauthenticated / authenticated.

Layout:
  Height: 64px
  Background: var(--color-bg-surface) with backdrop-filter: blur(12px) saturate(180%)
              + background-color: rgba(255,255,255,0.85) (light) / rgba(24,24,27,0.85) (dark)
  Border-bottom: 1px solid var(--color-border-default)
  Position: sticky, top: 0, z-index: 50
  Max-width: 1280px, centered, padding: 0 24px
  Layout: flex, align-items center, justify-content space-between

Left section:
  — SyncSanctuary logo: SVG logotype (mark + wordmark).
    Mark: a stylized "SS" monogram or abstract symbol conveying broadcast/media/church.
    Wordmark: "SyncSanctuary" in display font (Fraunces), font-weight 500, font-size 20px.
    Color: var(--color-text-primary) in light mode, white in dark mode.
    Clicking logo: navigates to /[locale]/ (home).
    Screen reader: <a href="/en/" aria-label="SyncSanctuary home">

Center section (desktop only — hidden below lg breakpoint):
  — Navigation links: Features | Download | Pricing | Support
    Font: 14px, font-weight 500, color: var(--color-text-secondary)
    Hover: color var(--color-text-primary), underline via text-decoration
    Active page: color var(--color-brand-600), font-weight 600

Right section:
  UNAUTHENTICATED:
  — Language switcher (globe icon + current locale abbr)
  — Dark/Light mode toggle (sun/moon icon)
  — [Log in] ghost button
  — [Get started] primary button (links to /[locale]/auth/signup)

  AUTHENTICATED:
  — Language switcher
  — Dark/Light mode toggle
  — Avatar/username dropdown:
    Trigger: circular avatar image (32×32px) or initials fallback + chevron-down icon
    Dropdown items:
      "Welcome, {username}!" (non-clickable heading, 13px bold)
      separator
      Dashboard (links to /dashboard)
      Account settings (links to /account)
      separator
      Log out (triggers POST /api/v1/auth/logout, clears state, redirects to home)

Mobile navigation (below lg breakpoint):
  — Hamburger menu button (right side, 44×44px tap target).
  — Opens a full-height slide-in drawer from the right.
  — Drawer: contains all nav links, language switcher, auth buttons.
  — Close: tap outside the drawer, or tap the X button within.
  — Animation: translate from right (translateX(100%) → translateX(0)), 300ms ease-out.
  — Overlay: semi-transparent background (rgba(0,0,0,0.4)) behind the drawer.

Accessibility:
  — All links have descriptive aria-label when icon-only.
  — Current page: aria-current="page" on the active nav link.
  — Mobile menu: aria-expanded on hamburger, aria-controls pointing to drawer ID.
  — Keyboard: Tab navigates all items. Escape closes the mobile drawer and all dropdowns.
  — Focus trap: when mobile drawer is open, focus is trapped inside it.

6.2 Footer (Global Component)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Present on all marketing pages. Not present on /dashboard, /account, and auth pages
(those pages have a minimal footer with just copyright).

Background: var(--color-bg-inverse) (dark background even in light mode)
Color: var(--color-text-inverse) for text
Padding: 80px 24px 40px
Max-width: 1280px, centered

Layout: 4-column grid (12-column CSS grid, each section spans 3 columns).
On tablet: 2 columns. On mobile: 1 column (stacked).

Column 1 — Brand:
  Logo (white version) + tagline: "The professional production suite for modern worship."
  Font: 14px, color: rgba(255,255,255,0.6)
  Social icons below: YouTube, Instagram, X (Twitter), Discord, GitHub — 24×24px SVG icons
  Note: all social icons open external links, target="_blank" rel="noopener noreferrer"

Column 2 — Product:
  Heading: "Product" (11px, uppercase, letter-spacing 1.5px, color rgba(255,255,255,0.4))
  Links: Features, Download, Changelog, Roadmap, Pricing

Column 3 — Company:
  Heading: "Company"
  Links: About, Blog, Careers, Press Kit, Contact

Column 4 — Legal:
  Heading: "Legal"
  Links: Privacy Policy, Terms of Service, Cookie Policy
  Also: "Do Not Sell or Share My Personal Information" (CCPA compliance link)
         Links to a page where California users can opt out.

Bottom bar (below columns, full-width separator line above):
  Left: "© 2024 SyncSanctuary. All rights reserved."
  Center: Language switcher (link list: English | 한국어 | Deutsch | Español | ...)
  Right: "Made with ♥ for the church community"
  Font: 12px, color: rgba(255,255,255,0.4)

6.3 Home Page (/[locale]/)
━━━━━━━━━━━━━━━━━━━━━━━━━

Page title: "SyncSanctuary — Professional Church Media Production Suite"
Meta description: "The all-in-one platform for church media teams. AI-powered video editing,
                   live presentation control, and real-time transcription in one beautiful app."

━━ HERO SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Layout: Two-column grid (7/5 split on desktop: text left, visual right). Full-height on
        desktop (100vh minus nav height). Vertically centered content.

Left column — Copy:
  Eyebrow label: "Church Media Production Platform" — 12px, uppercase, letter-spacing 2px,
    color var(--color-brand-500), font-weight 600. Framer Motion: fade in + slide from left
    (x: -20px → 0, opacity: 0 → 1, delay: 0s, duration: 0.6s, ease: easeOut).
  
  Headline (H1): "Every sermon, every song. Perfectly captured."
    Font: Fraunces, 72px (desktop) / 48px (tablet) / 36px (mobile)
    Font-weight: 400 (regular weight in Fraunces looks intentional and elegant)
    Line-height: 1.1
    Letter-spacing: -0.02em (tight tracking for large display text)
    Color: var(--color-text-primary)
    "Perfectly" is italicized (Fraunces italic is distinctive and beautiful)
    Animation: fade in + slide up (y: 24px → 0), delay: 0.1s, duration: 0.7s
  
  Subheading: "SyncSanctuary brings AI-powered video editing, live slide control,
               real-time transcription, and professional streaming together in one
               suite — built specifically for church media teams."
    Font: Inter, 18px (desktop) / 16px (mobile), weight 400
    Color: var(--color-text-secondary)
    Max-width: 480px
    Line-height: 1.7
    Animation: fade in, delay: 0.3s, duration: 0.6s
  
  CTA buttons (row, gap 12px):
    [Download free] — primary, size: lg, icon: download arrow icon on left
    [Watch demo] — secondary (outlined), size: lg, icon: play circle icon on left
    Animation: fade in + slide up, delay: 0.5s, duration: 0.5s
  
  Social proof line: "Trusted by 2,400+ churches in 48 countries"
    Font: 13px, color var(--color-text-tertiary)
    Left: 5 stacked circular avatars (overlap by 8px) of diverse team members
    Animation: fade in, delay: 0.7s

Right column — Visual:
  A high-quality mockup of the SyncSanctuary desktop application:
    — macOS window chrome (traffic light buttons, window title)
    — Shows the slide grid view with a worship service loaded
    — Shows a preview of the output monitor on the right
    — Application frame displayed at a slight perspective angle (15° Y-axis tilt,
      CSS transform: perspective(1200px) rotateY(-15deg) rotateX(5deg))
    — Subtle drop shadow: box-shadow: 40px 40px 80px rgba(0,0,0,0.3)
    — A floating "LIVE" badge in the top-right corner of the mockup (pulsing red dot + "LIVE")
  
  Animation: fade in + scale (0.95 → 1.0) + slide from right (x: 40px → 0), delay: 0.2s,
             duration: 0.8s, ease: easeOut.

Background effects:
  — A very subtle radial gradient blob in the top-right area of the hero:
    background: radial-gradient(circle at 70% 30%, rgba(99,102,241,0.15) 0%, transparent 60%)
  — Animated: slowly moves/pulses using CSS @keyframes, animation-duration: 8s, infinite.
  — Respects prefers-reduced-motion (pauses the blob animation).

━━ TRUST STRIP ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full-width strip, background var(--color-bg-muted), padding 24px 0, border-top/bottom
1px solid var(--color-border-default).

Content: "Trusted by churches of every size" centered label, then a horizontal scrolling
marquee of church/organization logos (placeholder: 8 gray rounded rectangles on light bg).
Animation: infinite horizontal scroll, pausable on hover.

━━ FEATURES SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Padding: 120px 24px (desktop), 80px 24px (mobile)

Section heading:
  Eyebrow: "Everything you need" (same style as hero eyebrow)
  H2: "Built for Sunday morning. Designed for every day."
    Font: Fraunces, 48px, weight 400, italic "every day"
  Body: "From Wednesday rehearsal to Sunday livestream, SyncSanctuary handles
         every step of your church's media production workflow."

Feature cards grid: 3 columns (desktop), 2 (tablet), 1 (mobile). Gap: 32px.

Feature Card Component:
  Background: var(--color-bg-surface)
  Border: 1px solid var(--color-border-default)
  Border-radius: var(--radius-xl)
  Padding: 32px
  Box-shadow: var(--shadow-sm)
  Hover: translateY(-4px), box-shadow: var(--shadow-xl), border-color brand-300
  Transition: all 200ms ease
  
  Content:
    — Icon: 48×48px colored icon container (brand-100 bg, brand-600 icon color)
    — Category tag: "AI • Video" (12px, brand-600, uppercase, letter-spacing)
    — Feature name H3: Inter, 20px, weight 600
    — Description: 15px, color secondary, line-height 1.6
    — "Learn more →" link: 13px, brand-600, hover: brand-700, underline on hover

6 feature cards:

Card 1 — AI Video Editor:
  Icon: film strip or magic wand
  Name: "AI-Powered Video Editor"
  Description: "Whisper-based transcription automatically segments your recordings into
                sermon, worship, prayer, and announcements. Export perfectly trimmed MP4
                or M4A files in minutes — not hours."

Card 2 — Live Presentation:
  Icon: monitor/display
  Name: "Professional Presentation Control"
  Description: "Control up to 16 simultaneous displays with sub-16ms slide switching
                latency. Import PowerPoint, PDF, ProPresenter, and more. Switch in a
                second. Never drop a moment."

Card 3 — Real-Time Transcription:
  Icon: text/speech bubble
  Name: "Live Captioning & Transcription"
  Description: "Real-time speech-to-text runs locally on your machine — no cloud required.
                Display captions on your stage monitor, stream them to your audience, and
                export a full transcript after every service."

Card 4 — Audio Engine:
  Icon: waveform or equalizer
  Name: "Professional Audio Mixer"
  Description: "Full parametric EQ, compression, noise gate, and 8-band EQ on every
                channel. Route audio to FOH, IEM, recording bus, and streaming bus
                independently. Sub-5ms round-trip latency."

Card 5 — Live Streaming:
  Icon: broadcast/signal
  Name: "Multi-Platform Live Streaming"
  Description: "Stream to YouTube, Twitch, Facebook Live, and custom RTMP endpoints
                simultaneously. Adaptive bitrate, automatic reconnect, and stream health
                monitoring built in."

Card 6 — AI Slide Automation:
  Icon: sparkles/ai
  Name: "AI Slide Automator"
  Description: "The AI listens to the speaker and automatically advances slides to match
                what's being said. No button press needed. Manual override is always
                one keypress away."

━━ DETAILED FEATURE SHOWCASE SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Three alternating rows (text + visual). Each row: two-column layout (6/6 desktop split).
Text and visual alternate sides on each row (first row: text left / visual right;
second row: visual left / text right; third row: text left / visual right).

Each row:
  Padding: 80px 24px
  Separator: 1px solid var(--color-border-default) between rows

  Text block:
    — Eyebrow label
    — H3 heading (Fraunces, 36px, weight 500)
    — 2–3 bullet points with check icons (brand-600 color)
    — CTA link: "See it in action →"

  Visual block:
    — An annotated screenshot or illustration of the relevant feature
    — Slight drop shadow + rounded corners
    — Animated on scroll-enter: slide in from the appropriate side, opacity 0→1

Row 1 — Video Editor:
  "From recording to finished video in under 10 minutes. Automatically segment your
   service by type, choose which segments to export, and let the AI handle the rest."

Row 2 — Multi-Display Control:
  "Control your screens with confidence. Pixel-perfect rendering, instant switching,
   studio mode, and independent configuration per output — all in one window."

Row 3 — AI Transcription:
  "Every word. Time-stamped, speaker-labeled, and searchable. Export as SRT, VTT,
   or a full JSON transcript compatible with any post-production workflow."

━━ TESTIMONIALS SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Background: var(--color-bg-muted), padding 100px 24px.

Section heading:
  H2: "What media directors are saying" (Fraunces, 40px)

Carousel / grid of 3 testimonial cards (horizontal scroll on mobile):

Testimonial Card:
  Background: var(--color-bg-surface)
  Padding: 32px
  Border-radius: var(--radius-lg)
  Border: 1px solid var(--color-border-default)
  Box-shadow: var(--shadow-sm)
  
  Content:
    — Star rating: 5 gold stars (★★★★★)
    — Quote: 2–3 sentences, font-size 16px, line-height 1.7, font-style italic
    — Author: name (14px, weight 600) + role + church name (13px, color secondary)
    — Avatar: 40×40px circular photo or initials

━━ HOW IT WORKS SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Padding: 100px 24px.
Section heading: "From zero to livestream in 3 steps"

Three numbered steps (horizontal on desktop, vertical on mobile):
  Connector line between steps (horizontal line with dot markers on desktop).

Step 1: "Create your account"
  Icon: user-plus icon inside a colored circle (brand-100 bg, brand-600 icon)
  Description: "Sign up in under 2 minutes. Just your phone number and a password."

Step 2: "Download and install"
  Icon: download icon
  Description: "Available for Windows, macOS, and Linux. Auto-updates keep you current."

Step 3: "Start your first service"
  Icon: broadcast icon
  Description: "Import your slides, connect your cameras, and go live. The AI handles the rest."

━━ CTA BANNER SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full-width section.
Background: a gradient from brand-800 to brand-600 (dark indigo to mid indigo).
Padding: 100px 24px.

Content (centered):
  H2: "Ready to transform your church's media production?" — Fraunces, 48px, white
  Subtext: "Join thousands of church media teams who trust SyncSanctuary every Sunday." — white 60% opacity
  Buttons:
    [Download free — it's free to start] — white filled, text brand-800
    [Talk to our team] — white outlined, text white

Background texture: very subtle noise texture overlay (5% opacity PNG) for depth.

6.4 Sign-Up Page (/[locale]/auth/signup)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Page title: "Create your SyncSanctuary account"
No navigation bar (auth pages use a minimal header with just the logo + back button).
Background: var(--color-bg-muted) with a subtle geometric pattern at very low opacity.

Layout: Two-column on large screens (lg+):
  Left column (40%): branding panel
  Right column (60%): signup form

LEFT COLUMN (branding panel):
  Background: brand-900 (deep indigo)
  Content centered, padding 40px
  — Logo (white version)
  — "Join SyncSanctuary" headline: Fraunces, 36px, white
  — Subtext: "The professional production suite for modern worship."
  — 3–4 benefit bullet points with checkmark icons (green, white text):
    ✓ AI-powered video editing
    ✓ Multi-display presentation control
    ✓ Real-time transcription
    ✓ Multi-platform live streaming
  — Decorative: subtle isometric illustration of a church media setup

RIGHT COLUMN (form area):
  Background: var(--color-bg-surface)
  Padding: 48px 40px (desktop), 32px 24px (mobile)
  
  Progress indicator at top:
    5 dots (one per step). Active dot: brand-600 filled circle, 10px.
    Completed dot: brand-200 filled + white checkmark inside. Inactive: gray outline.
    Connected by a line (brand-200 for completed segments, gray for incomplete).
    Animated: the line fills with brand color as steps are completed.
  
  Step title: "Step N of 5 — [Step Name]" — 12px, color secondary, above the step card.
  
  Step card:
    Background: var(--color-bg-surface)
    Border-radius: var(--radius-lg)
    Padding: 0 (the form content is within the column directly, not boxed)
    
    Step transition animation: when advancing to the next step, the current step
    slides out to the left (x: 0 → -30px, opacity: 1 → 0, 250ms) while the next step
    slides in from the right (x: 30px → 0, opacity: 0 → 1, 250ms).
    When going back, the directions are reversed.
  
  "Back" button: appears from Step 2 onwards. Ghost button, left-aligned, with left arrow icon.
  "Continue" button: primary, right-aligned (or full-width on mobile), with right arrow icon.
  
  "Already have an account? Log in" — below form, centered, 13px.

On mobile (below lg breakpoint):
  Only show right column (form). The branding panel is replaced by:
  — Logo centered at top
  — "Create your account" heading
  — Progress dots below heading

6.5 Login Page (/[locale]/auth/login)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Page title: "Log in to SyncSanctuary"
Same two-column layout as signup (branding left, form right).
No navigation bar.

LEFT COLUMN (branding):
  Same as signup but with different headline: "Welcome back."
  And a quote from a church media director (social proof).

RIGHT COLUMN (form):
  Heading: "Log in to your account" — Inter, 24px, weight 700
  Subheading: "Enter your phone number or email and password." — 14px, secondary

  Form fields:
    1. Phone / Email field (as specified in Section 2.5)
    2. Password field with show/hide toggle
  
  Row below password:
    Left: [Forgot password?] link
    Right: "Remember this device" checkbox + label (13px)
  
  [Log in] button: full-width primary, height 48px, font-size 15px
  
  Divider: "or continue with"
  
  [Continue with Google] button: full-width, per Google brand guidelines (Section 2.4)
  
  "Don't have an account? Sign up" link — centered, 14px
  
  Error display:
    A red error banner appears below the password field on login failure:
    Background: var(--color-danger-bg), border: 1px solid var(--color-danger-border),
    border-radius: var(--radius-sm), padding: 12px 16px.
    Icon: ⚠ (warning triangle, red)
    Text: error message (user-friendly, not raw API error code)
    Error messages by code:
      INVALID_CREDENTIALS: "Incorrect phone/email or password. Please try again."
      ACCOUNT_LOCKED: "Account temporarily locked. Try again in {N} minutes."
      ACCOUNT_DELETED: "This account no longer exists."
      ACCOUNT_SUSPENDED: "Your account has been suspended. Contact support."
      RATE_LIMITED: "Too many login attempts. Please wait {N} minutes."
    
    Animation: slide down into view + fade in (300ms), shake after appearing (150ms).

6.6 Dashboard (/[locale]/dashboard) — Post-Login Home
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTHENTICATION REQUIRED. If not authenticated: redirect to /[locale]/auth/login
with ?redirect_to=/[locale]/dashboard so user is returned after login.

Navigation bar: full version (authenticated state).
No left branding panel. Full-width layout with sidebar navigation.

Sidebar navigation (left, 240px fixed width):
  Top: Avatar (40×40px) + username (14px, bold) + email/phone (12px, muted)
  Navigation links:
    Dashboard (home icon, active)
    Download (download icon)
    Account (user icon)
    Security (shield icon)
    Support (question mark icon)
  Bottom: Log out (exit icon, red hover)

Main content area:
  Padding: 40px 48px (desktop), 24px 16px (mobile)

━━ WELCOME HEADER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

H1: "Welcome back, {username}! 👋"
  Font: Inter, 32px (desktop) / 24px (mobile), weight 700
  The {username} portion is colored brand-600.
  The 👋 emoji is rendered at a slightly larger size (1.2em).
  This is an SSR-rendered heading — the username is embedded server-side.

Subtext: "Here's what's happening with your SyncSanctuary account."
  Font: 16px, color secondary

━━ EMAIL VERIFICATION BANNER (conditional) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Show only when user has an email address AND email_verified = FALSE.
Non-dismissible until email is verified (can be minimized but reappears on next visit).

Background: var(--color-warning-bg)
Border: 1px solid var(--color-warning-border)
Border-radius: var(--radius-md)
Padding: 16px 20px
Layout: flex, align-items center, gap 12px, flex-wrap wrap

Content:
  Left icon: ⚠ (warning icon, warning amber color)
  Text: "Please verify your email address to enable all features. We sent a link to {email}."
  Right: [Resend verification email] button (small secondary)
  Very right: [Dismiss] X button (only minimizes for this session)

Clicking "Resend": calls POST /api/v1/account/resend-email-verification.
Rate limited: 3 resends per hour.
On success: banner text changes to "Verification email sent! Check your inbox." (green).

━━ QUICK ACTIONS CARDS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4-column grid (desktop) / 2-column (tablet) / 1-column (mobile). Gap: 20px.
Each card:
  Background: var(--color-bg-surface)
  Border: 1px solid var(--color-border-default)
  Border-radius: var(--radius-lg)
  Padding: 24px
  Box-shadow: var(--shadow-sm)
  Hover: transform: translateY(-2px), shadow-md
  Transition: all 150ms ease
  Cursor: pointer (entire card is a link)

Card 1 — Download:
  Icon: download icon (brand-600, 32px)
  Title: "Download SyncSanctuary" (15px, weight 600)
  Description: "Get the latest version for your operating system." (13px, secondary)
  Badge: "v1.2.3 — Latest" (green badge)
  Link: /[locale]/download

Card 2 — Account:
  Icon: user-circle icon
  Title: "Account Settings"
  Description: "Update your profile, password, and preferences."
  Link: /[locale]/account

Card 3 — Sessions:
  Icon: shield-check icon
  Title: "Active Sessions"
  Description: "{N} active session{s} — review and manage your devices."
  N is the count of non-expired refresh tokens for this user.
  Link: /[locale]/account/security

Card 4 — Support:
  Icon: life-saver icon
  Title: "Help & Support"
  Description: "Documentation, tutorials, and community forum."
  Link: external — https://docs.syncsanctuary.app

━━ RECENT ACTIVITY SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Title: "Recent Activity" (16px, weight 600)
Shows last 10 audit log events for this user.
Table:
  Columns: Event | Date/Time | Device | IP Address
  Row height: 48px
  Border-bottom on each row (1px, border-default)
  
  Event icons (small, 16px, color-coded):
    login_success: green shield-check
    login_failure: red shield-x
    password_change: blue key
    session_revoked: gray x-circle
    account_locked: red lock
  
  Date/time: formatted in user's locale (e.g. "January 15, 2024 at 10:32 AM")
  IP Address: partially masked (show first 2 octets only: "192.168.x.x")
  
  "View full activity log" link at bottom.

━━ WHAT'S NEW SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Shows 3 most recent changelog entries from the app_releases table (stable channel only).
Each entry: release version badge + date + 2-line release notes summary + "Read more →"

6.7 Download Page (/[locale]/download)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTHENTICATION REQUIRED: The download buttons are only active when logged in.
If not logged in: Download buttons are replaced with "Log in to download" buttons
that redirect to /[locale]/auth/login?redirect_to=/[locale]/download.

UNAUTHENTICATED state: the page is still accessible and shows all information, but
the download action requires login. Show a banner:
  "Log in or create a free account to download SyncSanctuary."
  [Log in] [Create free account] buttons

Page title: "Download SyncSanctuary"

━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

H1: "Download SyncSanctuary"
Subtext: "Available for Windows, macOS, and Linux. Free to start."
Channel selector: [Stable ●] [Beta] — pill toggle, default: Stable.
Switching to Beta: shows beta release files and a warning badge "Beta — may contain bugs"

━━ PLATFORM DETECTION AND HIGHLIGHTING ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server-side (SSR): read the User-Agent HTTP header and detect:
  Windows: /Windows NT/ → highlight Windows card
  macOS: /Mac OS X/ → highlight macOS card
  Linux: /Linux/ + not Android → highlight Linux card
  Mobile: /Android/ or /iPhone|iPad/ → no card highlighted (app is desktop-only)
    Show a banner: "SyncSanctuary is a desktop application. Please visit on a computer."

The highlighted card shows:
  — A "Recommended for you" badge (green, top-right of card)
  — Slightly elevated appearance (scale 1.02, shadow-xl, brand-200 border)

ALL THREE cards are always visible regardless of detection — do not hide other platforms.

━━ PLATFORM CARDS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Three cards side by side (desktop), stacked (mobile). Gap: 24px.

Each card:
  Background: var(--color-bg-surface)
  Border: 2px solid var(--color-border-default)
  Border-radius: var(--radius-xl)
  Padding: 32px
  Box-shadow: var(--shadow-md)

Card internal structure:

  TOP:
    OS logo icon: Windows logo (SVG, official colors), Apple logo (SVG, gray/black),
                  Linux Tux penguin (SVG, black/yellow)
    OS name: "Windows" / "macOS" / "Linux"
      Font: Inter, 24px, weight 700
    Version badge: "v1.2.3" (gray badge, small)
    Release date: "Released January 15, 2024" (12px, muted)

  ARCHITECTURE selector (macOS only — Apple Silicon vs Intel):
    Pill toggle: [Apple Silicon (M1/M2/M3)] [Intel] — default: Apple Silicon
    Switching changes the download URL and file size.
    
    Linux: three format options displayed as small selectable pills:
    [AppImage] [.deb (Ubuntu)] [.rpm (Fedora)] — default: AppImage

  DOWNLOAD BUTTON:
    When authenticated + stable channel:
      [⬇ Download for {OS}] — primary button, full width, height 48px
      Click: triggers file download from CDN + logs to app_downloads table
             + shows "What's next?" panel (see below)
    When authenticated + beta channel:
      Same button but with a warning: "This is a beta build." below
    When not authenticated:
      [Log in to download] — secondary button linking to login

  FILE INFO:
    File size: "Download size: 124 MB" (12px, muted)
    Format: "Format: .exe installer" / ".dmg disk image" / ".AppImage"
    SHA-256 link: "Verify download integrity ↗" (opens a dialog showing the hash)

  SYSTEM REQUIREMENTS (collapsed accordion by default, expand with click):
    Accordion header: "System requirements ▾" (13px, brand-600)
    Content when expanded:
      Windows: Windows 10 22H2 or Windows 11, 8GB RAM, 4GB free disk, GPU with DirectX 12
      macOS: macOS 13 Ventura or later, 8GB RAM, 4GB free disk
      Linux: Ubuntu 22.04 LTS, glibc 2.35+, 8GB RAM, 4GB free disk

  CHANGELOG LINK: "View full changelog →" (12px, brand-600, opens /[locale]/changelog)

━━ "WHAT'S NEXT?" PANEL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After the user clicks a download button:
  1. The file download begins (browser standard file download).
  2. A slide-in panel appears from the right side of the screen (or a modal on mobile):
     Width: 360px (drawer on desktop, full-screen on mobile)
     Background: var(--color-bg-surface)
     Box-shadow: var(--shadow-2xl)
  
  Panel content:
    — "Your download is starting..." heading with animated download progress icon
    — Installation instructions for the detected OS (numbered steps):
        Windows: Run the installer → Follow setup wizard → Launch from Start Menu
        macOS: Open the .dmg → Drag to Applications folder → Launch + accept Gatekeeper
        Linux (AppImage): Mark as executable (chmod +x) → Double-click to launch
    — Link to Getting Started guide (opens docs.syncsanctuary.app)
    — Link to video tutorial (YouTube embed)
    — Close button (X, top-right)
  
  Auto-closes after 60 seconds if user doesn't interact.

6.8 Account Settings Page (/[locale]/account)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AUTHENTICATION REQUIRED.
Same dashboard layout (sidebar nav + main content).

Tabs within the account settings page:
  Profile | Security | Preferences | Data | Danger Zone
  
  (Use Radix UI Tabs component for accessible tab switching)

━━ PROFILE TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Section title: "Profile" (20px, weight 700)

AVATAR SECTION:
  Circular avatar: 80×80px displayed, border-radius-full, border: 3px solid brand-200
  Shows: uploaded photo OR generated initials avatar (first letter of username in a
         circle with a brand gradient background — deterministic color from username hash)
  
  Hover state: a dark overlay appears over the avatar with a camera icon and "Change" text
  
  "Change avatar" button: small secondary button below the avatar
  On click: opens a file picker (accept: image/jpeg,image/png,image/webp,image/gif)
  
  Upload process:
    1. Client-side: validate file size (<5MB), validate type.
    2. Show a crop tool (modal with aspect-ratio 1:1 locked, zoom slider, drag to reposition)
       implemented with react-image-crop or similar.
    3. On "Apply": upload the cropped image (as JPEG, 200×200px) to a pre-signed S3 URL.
       API call: POST /api/v1/account/avatar/upload-url → { upload_url, public_url }
       Then: PUT the image to the pre-signed URL.
    4. On success: PATCH /api/v1/account/profile { avatar_url: public_url }
       Update Zustand state with new avatar_url. Refresh avatar everywhere immediately.
  
  "Remove avatar" link (shown only if avatar is set): text-danger, 12px.
  On click: confirmation dialog "Remove your avatar photo?". On confirm: 
  DELETE /api/v1/account/avatar. Shows initials avatar immediately.

USERNAME SECTION:
  Label: "Username"
  Current username displayed in an input (editable).
  Same real-time availability check as signup (debounced 500ms, GET /api/.../check-username).
  [Save username] button: disabled until a valid, different username is entered.
  On save: PATCH /api/v1/account/profile { username: "NewUsername" }
  Username changes are rate-limited: max 2 changes per 30 days.
  If rate-limited: show "You can change your username again in N days."
  On success: toast notification "Username updated successfully."
  Log: audit_log username_changed.

CONTACT SECTION:
  Phone number:
    Displayed as: "+82 10 ****-5678" (partially masked)
    [Change phone number] link → opens a flow (modal with OTP verification of new number)
    Cannot be removed (phone is required for the account).
  
  Email address:
    Displayed as current email OR "No email address" if null.
    [Add email] button (if no email) or [Change email] (if email exists).
    → Opens a modal: enter new email → send verification → verify in email link → update.
    [Remove email] link (small, only if email is set and is_active but not required for auth).
    Shows verified status badge: "✓ Verified" (green) or "⚠ Unverified" (amber) + resend link.

━━ SECURITY TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHANGE PASSWORD:
  Three fields:
    Current password (required to change password — prevents session hijacking)
    New password (same strength requirements as signup)
    Confirm new password
  [Update password] button.
  On success: all sessions invalidated (except current), toast success message.
  Users who signed up via Google only (no password_hash): show a different UI:
    "You signed up with Google. Set a password to enable phone/email login."
    [Set password] — shows just the two new password fields (no current password required).

ACTIVE SESSIONS:
  Title: "Active Sessions" with session count badge
  
  Table of all non-revoked, non-expired refresh tokens for this user:
  Columns:
    Device: icon (desktop/mobile/browser) + device_name
    Location: IP address (partially masked) + country flag + country name (from MaxMind)
    Last active: relative time ("2 hours ago")
    Actions: [Revoke] button (secondary, small, red text)
  
  Current session row: highlighted with a green dot + "This device" badge
  (Identified by matching the current refresh token's ID in the session.)
  The current session's [Revoke] button is replaced with [Log out of this device].
  
  [Revoke all other sessions] button: below the table, secondary/danger style.
  On click: confirmation modal "This will log you out of all other devices."
            On confirm: POST /api/v1/auth/sessions/revoke-all-except-current
  
  On individual [Revoke]: DELETE /api/v1/auth/sessions/{token_id}
  Removes that row from the table immediately (optimistic update).
  Log: audit_log session_revoked.

━━ PREFERENCES TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Language preference:
  Dropdown showing all supported languages with their native name.
  On change: PATCH /api/v1/account/preferences { language: "ko" }
             Redirects to the same page in the new locale.

Notifications:
  Toggle: "Security alerts via email" — default ON (cannot be disabled for security events)
  Toggle: "Security alerts via SMS" — default ON
  Toggle: "Product updates via email" — default OFF
  Toggle: "Product updates via SMS" — default OFF

━━ DATA TAB (GDPR Right to Access) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Title: "Your Data"
Description: "You have the right to receive a copy of all personal data we hold about you."

[Request data export] button:
  On click: POST /api/v1/account/data-export
  Server queues a background job that:
    1. Collects all user data: profile, login history (last 90 days), sessions.
    2. Formats as a JSON file.
    3. Uploads encrypted to S3.
    4. Sends an email with a download link (expires 24 hours).
  
  Button becomes disabled after click: "Export requested — check your email within 5 minutes."
  Rate limited: 1 request per 24 hours.

━━ DANGER ZONE TAB ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Red bordered section. Ominous but clear.

"Delete account" section:
  Description: "Permanently deleting your account will immediately suspend access.
                Your data will be retained for 30 days before permanent deletion,
                per GDPR Right to Erasure requirements."
  
  [Delete my account] button: danger style (red background).
  
  On click: opens a mandatory confirmation modal (cannot be bypassed):
    Modal title: "Permanently delete your account?" (bold red text)
    Body: warning about what will be lost (access, data, downloads history)
    
    Step 1: password re-entry field:
      "Enter your current password to confirm."
      (Google-only users: must authenticate via Google OAuth instead)
    
    Step 2: typed confirmation:
      Input: "Type DELETE MY ACCOUNT to confirm"
      [Delete account] button: disabled until BOTH password AND correct phrase are entered.
    
    On confirm: POST /api/v1/account/delete { password: "...", confirmation: "DELETE MY ACCOUNT" }
    Server:
      1. Verify password (or Google token).
      2. Verify confirmation phrase.
      3. SET users.is_active = FALSE, deletion_requested_at = NOW()
      4. Schedule background job: in 30 days, set deleted_at = NOW(),
         nullify all PII fields (name, phone, email, password_hash, google_id, avatar_url),
         delete all refresh tokens, delete all email/otp verification tokens.
      5. Revoke all refresh tokens immediately.
      6. Clear the ss_refresh_token cookie.
      7. Send "Account deletion initiated" email (with cancellation link valid for 30 days).
      8. Log audit: account_deletion_requested.
      9. Redirect to /[locale]/?message=account_deletion_initiated
      
    Grace period: during the 30-day window, if the user logs back in:
      Show a banner: "Your account is scheduled for deletion on [date].
                      [Cancel deletion] to keep your account."
      DELETE /api/v1/account/cancel-deletion — cancels the scheduled deletion,
      sets is_active = TRUE, clears deletion_requested_at and deleted_at.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 7 — API SPECIFICATION (COMPLETE ENDPOINT REFERENCE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All endpoints:
  — Prefix: /api/v1/
  — Content-Type: application/json (request + response)
  — All timestamps in responses: ISO8601 with timezone (e.g. "2024-01-15T10:30:00.000Z")
  — Error responses:
    { "error": "ERROR_CODE", "message": "Human-readable description", "details": {} }
    HTTP status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request,
    401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Unprocessable Entity,
    423 Locked, 429 Too Many Requests, 500 Internal Server Error.

7.1 Auth Endpoints
━━━━━━━━━━━━━━━━━

POST   /api/v1/auth/signup/send-otp           (no auth)
POST   /api/v1/auth/signup/verify-otp         (no auth)
POST   /api/v1/auth/signup/check-email        (no auth, rate limited)
GET    /api/v1/auth/signup/check-username     (no auth, rate limited)
POST   /api/v1/auth/signup/create-account     (no auth)
GET    /api/v1/auth/google/initiate           (no auth) → redirect to Google
GET    /api/v1/auth/google/callback           (no auth) → handles OAuth callback
POST   /api/v1/auth/login                     (no auth, rate limited)
POST   /api/v1/auth/refresh                   (refresh token in cookie/header)
POST   /api/v1/auth/logout                    (access token)
POST   /api/v1/auth/password-reset/request    (no auth, rate limited)
POST   /api/v1/auth/password-reset/verify-otp (no auth)
GET    /api/v1/auth/password-reset/verify-link (no auth) → redirect
POST   /api/v1/auth/password-reset/complete    (reset token in body)
DELETE /api/v1/auth/sessions/{token_id}        (access token, must own the session)
POST   /api/v1/auth/sessions/revoke-all-except-current (access token)
GET    /api/v1/auth/.well-known/jwks.json      (no auth, public, cached 24h CDN)

7.2 Account Endpoints
━━━━━━━━━━━━━━━━━━━━

GET    /api/v1/account/profile           → { user object }
PATCH  /api/v1/account/profile           → update username, display preferences
GET    /api/v1/account/sessions          → list of active sessions (non-expired, non-revoked)
POST   /api/v1/account/avatar/upload-url → returns pre-signed S3 URL for avatar upload
DELETE /api/v1/account/avatar            → remove avatar
POST   /api/v1/account/resend-email-verification
GET    /api/v1/account/verify-email?token={JWT}  → verifies email from the link
PATCH  /api/v1/account/preferences      → update language, notification settings
POST   /api/v1/account/change-password  → requires current_password (or Google re-auth)
POST   /api/v1/account/data-export      → queues GDPR data export job
GET    /api/v1/account/data-exports     → list pending/completed export requests
POST   /api/v1/account/delete           → initiate account deletion (30-day grace period)
POST   /api/v1/account/cancel-deletion  → cancel pending deletion within grace period

7.3 Download Endpoints
━━━━━━━━━━━━━━━━━━━━━

GET    /api/v1/releases/latest?platform=windows&arch=x64&channel=stable
         → { version, download_url, file_size_bytes, sha256_hash, release_notes, published_at }
GET    /api/v1/releases?channel=stable&limit=10
         → paginated list of releases
POST   /api/v1/releases/download-intent  (authenticated)
         → { platform, arch, version, format } — logs to app_downloads table
         → returns a short-lived signed download URL (15-minute expiry)
         The actual file download goes through this signed URL, NOT a public URL.
         Reason: requires authentication, enables download analytics, prevents hotlinking.

7.4 Update Manifest Endpoint (For Desktop Auto-Updater)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET    /updates/desktop/{platform}/{arch}/latest.json
  Response (Tauri-compatible update manifest):
  {
    "version": "1.3.0",
    "pub_date": "2024-06-01T12:00:00Z",
    "url": "https://cdn.syncsanctuary.app/releases/...",
    "signature": "ed25519 base64-encoded signature",
    "notes": "What's new...",
    "mandatory": false
  }
  Cache-Control: public, max-age=300 (5 min cache, so updates propagate quickly)
  CDN-served (not API server — reduces load).

7.5 Admin Endpoints (Protected: role='admin' or 'superadmin')
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GET    /api/v1/admin/users               → paginated user list with filters
GET    /api/v1/admin/users/{id}          → single user details + audit log
PATCH  /api/v1/admin/users/{id}          → update role, is_active, suspension
POST   /api/v1/admin/releases            → publish a new app release
GET    /api/v1/admin/downloads/stats     → download analytics
GET    /api/v1/admin/audit-log           → full audit log with filters

All admin endpoints: additionally require:
  — The request must come from a trusted IP range (optional, configurable allowlist).
  — An additional X-Admin-Key header (a separate long-lived secret, different from JWT).
  — Or: require 2FA TOTP verification for every admin action (Phase 2).


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 8 — SECURITY ARCHITECTURE (WEB PLATFORM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8.1 Transport Security
━━━━━━━━━━━━━━━━━━━━━

TLS: 1.3 minimum. TLS 1.2 as fallback with modern cipher suites ONLY:
     TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256, TLS_AES_128_GCM_SHA256
     (TLS 1.2 suite: ECDHE-RSA-AES256-GCM-SHA384, ECDHE-RSA-CHACHA20-POLY1305)
     TLS 1.0 and 1.1: DISABLED explicitly.
     
HSTS (HTTP Strict Transport Security):
  max-age=63072000; includeSubDomains; preload
  Submitted to the HSTS preload list at hstspreload.org before launch.

Certificate: Let's Encrypt (auto-renewed via certbot/Caddy ACME client).
  Monitor expiry: alert ops team 30 days before expiry via PagerDuty/OpsGenie.
Certificate Transparency: subscribe to CT log alerts (using Facebook CT monitoring or
  similar) for unexpected certificate issuances for syncsanctuary.app domain.

8.2 HTTP Security Headers
━━━━━━━━━━━━━━━━━━━━━━━━

These headers are set by the Fastify server on EVERY response:

Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY  (prevent clickjacking)
X-Content-Type-Options: nosniff  (prevent MIME sniffing)
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
  (Only the desktop app, not the website, uses camera/mic. Browser website doesn't need them.)
X-XSS-Protection: 0  (deprecated but some scanners check — set to 0, CSP is the real protection)

Content-Security-Policy (carefully crafted, no 'unsafe-eval', minimal 'unsafe-inline'):
  default-src 'self';
  script-src 'self' 'nonce-{random_nonce_per_request}' https://accounts.google.com
             https://static.cloudflareinsights.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: blob: https://cdn.syncsanctuary.app https://*.googleusercontent.com;
  connect-src 'self' https://api.syncsanctuary.app https://api.pwnedpasswords.com;
  frame-src https://accounts.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
  
  Nonce: a cryptographically random base64-encoded 128-bit value, generated per-request,
  injected into the HTML response via a Fastify hook. Inline scripts in the Next.js app
  that require script execution use this nonce.
  
  Note: 'unsafe-inline' for style-src is necessary for Next.js's built-in CSS handling
  (style tags injected by Next.js). This is acceptable as inline styles do not pose the
  same XSS risk as inline scripts.

8.3 API Security
━━━━━━━━━━━━━━━

Authentication middleware:
  Every protected endpoint (marked with auth: required) runs the following middleware:
  1. Extract JWT from Authorization: Bearer {token} header.
     Also accept from: session cookie ss_access_token (for web browser compatibility
     in SSR rendering contexts where header injection isn't available).
  2. Verify JWT signature using the RS256 public key (cached on server startup).
  3. Check exp claim (token not expired).
  4. Optional: check jti against a Redis blocklist (for explicitly revoked access tokens).
     The blocklist entry has TTL = remaining token lifetime. This is the token blocklist.
  5. Attach { user_id, username, role, client_type } to request context.
  
  Failure modes:
  — Missing token: HTTP 401 { error: "MISSING_AUTH_TOKEN" }
  — Invalid signature: HTTP 401 { error: "INVALID_TOKEN" }
  — Expired token: HTTP 401 { error: "TOKEN_EXPIRED" }
  — Token in blocklist: HTTP 401 { error: "TOKEN_REVOKED" }

Authorization middleware (RBAC):
  After authentication, route-level authorization checks the required role:
  — route.requiredRole = 'admin' → check req.user.role === 'admin' || 'superadmin'
  — route.requiredRole = 'superadmin' → check req.user.role === 'superadmin'
  — Default: any authenticated user can access.
  This check runs at the route middleware level, NOT inside individual request handlers.
  This pattern prevents authorization bypass via business logic bugs.

CSRF Protection:
  — For browser API requests (authenticated with cookie, not Bearer token):
    Use the Double Submit Cookie pattern:
    a. On login: set a CSRF token in a SameSite=Lax, NOT httpOnly cookie (so JS can read it).
       Name: ss_csrf_token. Value: a random 32-byte hex string.
    b. The React app reads this cookie (accessible via JS since it's NOT httpOnly).
       Sends it as X-CSRF-Token header on all non-GET requests.
    c. The server compares the X-CSRF-Token header against the ss_csrf_token cookie value.
       Mismatch → HTTP 403 CSRF_VALIDATION_FAILED.
  — For desktop API requests (authenticated with Bearer token): CSRF not applicable
    (CSRF attacks require a browser to automatically attach credentials, Bearer tokens
    are not automatically attached by browsers on cross-origin requests).

Input Validation:
  ALL request body fields are validated using Zod schemas at the route level,
  BEFORE any business logic runs. Malformed requests are rejected at the Zod layer
  with HTTP 400 { error: "VALIDATION_ERROR", details: { field: "error description" } }.
  
  Example schema (login):
  const LoginSchema = z.object({
    identifier: z.string().min(3).max(254),
    password: z.string().min(1).max(128),  // max 128: prevents DoS via argon2 with huge input
    client_type: z.enum(['web', 'desktop', 'mobile_ios', 'mobile_android']),
    client_version: z.string().optional(),
    platform: z.enum(['windows', 'macos', 'linux']).optional(),
    remember_device: z.boolean().default(false)
  });

SQL injection prevention:
  ALL database queries use Prisma ORM with parameterized queries.
  Zero string interpolation of user input into SQL. This is enforced by Prisma's
  query builder API which makes raw SQL injection impossible for standard operations.
  If raw SQL is needed (complex queries): use Prisma's $queryRaw with tagged template
  literals (automatically parameterized by Prisma's SQL safety layer).

XSS prevention:
  — All output in Next.js is React-rendered. React escapes all strings by default.
  — dangerouslySetInnerHTML is NEVER used with user-supplied content. ESLint rule enforces this.
  — The CSP header provides a second layer of defense.

8.4 Rate Limiting
━━━━━━━━━━━━━━━━

Implemented with Redis using a sliding window algorithm (more accurate than fixed window).

Endpoint limits:
  POST /auth/signup/send-otp:         3 per phone/hour, 10 per phone/day, 10 per IP/hour
  POST /auth/login:                   5 per IP/15min, 20 per IP/hour
  GET  /auth/signup/check-username:   30 per IP/minute (enumeration prevention)
  POST /auth/password-reset/request:  3 per phone or email/hour, 10 per IP/hour
  POST /account/resend-email-verification: 3 per user/hour
  POST /account/data-export:          1 per user/24hours
  All authenticated API endpoints:    200 per user/minute (general limit)
  Unauthenticated API endpoints:      30 per IP/minute
  POST /account/avatar/upload-url:    5 per user/hour
  POST /auth/logout:                  10 per user/hour (prevent refresh token exhaustion)

Rate limit response: HTTP 429 with headers:
  X-RateLimit-Limit: {limit}
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: {Unix timestamp when limit resets}
  Retry-After: {seconds until retry allowed}
  Body: { error: "RATE_LIMITED", retry_after_seconds: N }

8.5 Dependency Security
━━━━━━━━━━━━━━━━━━━━━

Automated dependency vulnerability scanning:
  — npm audit (run in CI on every commit)
  — Dependabot (GitHub) or Renovate (GitLab) for automated PR creation on vulnerability fixes
  — CI pipeline FAILS on HIGH or CRITICAL vulnerabilities with no known fix.
  — MODERATE vulnerabilities: create a tracking issue but do not block the pipeline.
  — A dependency with a CRITICAL vulnerability and no available fix: must be isolated,
    mitigated, or replaced before deployment. Document the decision in SECURITY.md.

8.6 Secrets and Key Management
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JWT key rotation:
  RS256 key pair rotated annually (or immediately on suspected compromise).
  Key rotation procedure:
    1. Generate a new RS256 key pair.
    2. Add the new PUBLIC key to the JWKS endpoint (keep old key too — "grace period").
    3. Issue new tokens signed with the new PRIVATE key.
    4. Wait for all old access tokens (15-minute TTL) to expire naturally.
    5. Remove the old PUBLIC key from JWKS.
  
  The JWKS endpoint must always return all currently valid public keys (to support
  in-flight tokens signed with a key that's being rotated out).

PostgreSQL passwords: 32+ random characters. Rotated quarterly.
  Rotation: update in Secrets Manager → trigger rolling restart of API instances
  (connection pool drains naturally, new connections use new credentials).

All secrets: stored in AWS Secrets Manager or HashiCorp Vault. Application fetches
secrets on startup (not at build time). Secret changes take effect on next deployment
or next fetch cycle (configurable refresh interval: 1 hour for non-critical secrets,
immediate for security secrets via manual trigger).


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 9 — INFRASTRUCTURE AND DEVOPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9.1 Deployment Architecture
━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend (Next.js):
  Deploy on Vercel (recommended for Next.js) OR on self-hosted infrastructure:
    — Docker container (multi-stage build: Node.js builder → minimal runtime image)
    — Kubernetes (k8s) deployment with horizontal pod autoscaler
    — CDN: Cloudflare or CloudFront (both work well with Next.js static assets)
  
  Self-hosted Docker setup:
    FROM node:20-alpine AS builder
    [install deps, build Next.js]
    FROM node:20-alpine AS runtime
    COPY --from=builder /app/.next /app/.next
    COPY --from=builder /app/node_modules /app/node_modules
    EXPOSE 3000
    CMD ["node", "server.js"]

Backend (Fastify API):
  Docker container, deployed on:
    — AWS ECS (Fargate): serverless container execution, auto-scales based on CPU/memory
    — OR: Fly.io, Railway (simpler managed options for smaller teams)
  
  Horizontal scaling: stateless API (JWT auth, Redis session store).
  Min instances: 2 (for HA). Auto-scale triggers: CPU > 70% or request queue depth > 100.

Database (PostgreSQL):
  AWS RDS PostgreSQL 16:
    Multi-AZ deployment (automatic failover to standby in another AZ — ~60 second RTO).
    Instance type: db.r6g.xlarge (minimum for production: 4 vCPU, 32GB RAM).
    Storage: 100GB GP3 SSD, auto-expand enabled.
    Automated backups: enabled (7-day retention). Plus manual snapshots weekly (30-day retention).
    Continuous WAL archiving to S3 for Point-In-Time Recovery (PITR) to any second within 7 days.
    Deletion protection: enabled. Cannot be deleted without disabling protection first.
    Performance Insights: enabled.
    Enhanced Monitoring: 1-second granularity.

Redis:
  AWS ElastiCache for Redis (cluster mode):
    3 nodes minimum (1 primary + 2 replicas) for HA.
    Automatic failover.
    Redis 7.x.
    Data persistence: AOF (Append Only File) enabled (every second sync).

9.2 CI/CD Pipeline
━━━━━━━━━━━━━━━━━

Platform: GitHub Actions (or GitLab CI)

Trigger rules:
  Push to any branch → runs: lint + unit tests + type check
  Push to main → runs full pipeline
  Tag v*.*.* → runs release pipeline

Pipeline stages (in order):

STAGE 1 — Code Quality:
  - TypeScript compilation (tsc --noEmit) — fails on type errors
  - ESLint (eslint . --max-warnings 0) — zero warnings tolerance in CI
  - Prettier check (prettier --check .) — enforces code style
  - i18n completeness check (custom script: all locale files have same keys)

STAGE 2 — Security:
  - npm audit --audit-level=high (fail on high/critical)
  - Snyk (or Trivy) dependency scan
  - SAST scan: CodeQL (GitHub) or Semgrep for common security patterns
  - Secret detection: git-secrets or truffleHog (fail if secrets found in code)

STAGE 3 — Tests:
  - Unit tests: Vitest (Jest-compatible, faster). Coverage: minimum 80% line coverage.
    Coverage report uploaded to Codecov/Coveralls. PR comment with coverage delta.
  - Integration tests: test Fastify routes with a real test database (PostgreSQL in Docker).
    Test isolation: each test runs in a transaction that is rolled back after the test.
  - E2E tests: Playwright (run in headless Chrome, Firefox, Safari/WebKit).
    Covers: full signup flow, login, download page, account settings.
    E2E tests run on the staging environment (not localhost) for realistic testing.

STAGE 4 — Build:
  - Next.js production build (next build). Fails if build fails.
  - Docker images built and pushed to ECR (Amazon Elastic Container Registry).
  - Image scanning: Amazon Inspector or Trivy on the built Docker image.
    Fail on critical vulnerabilities in the image.

STAGE 5 — Deploy to Staging:
  - Automatic on merge to main.
  - Run Prisma migrate deploy against staging database.
  - Deploy new Docker images to staging ECS cluster (blue/green deployment).
  - Run smoke tests (Playwright E2E on staging URL).

STAGE 6 — Manual Gate:
  - A GitHub environment protection rule requires a manual approval from a team member
    before deploying to production.
  - The PR author cannot approve their own deployment.

STAGE 7 — Deploy to Production:
  - Prisma migrate deploy against production database (in a transaction, with automatic
    rollback if migration fails).
  - Blue/green deployment to production ECS cluster.
  - Zero-downtime deployment: new containers spin up, health checks pass, then old ones drain.
  - Post-deployment smoke tests run automatically.

STAGE 8 — Release:
  (Only on tags v*.*.*):
  - Create GitHub Release with auto-generated changelog.
  - Publish the update manifest JSON to the CDN.
  - Send release notification to team Slack/Discord.

9.3 Database Operations
━━━━━━━━━━━━━━━━━━━━━━

Migration safety rules:
  — Never drop a column without first removing all code that writes/reads it.
    (Backward compatibility: deploy code change first, then schema change.)
  — Never rename a column without a 3-phase migration:
    1. Add new column. 2. Update code to write both columns. 3. Remove old column.
  — Adding a NOT NULL column to an existing table: always add with a DEFAULT first,
    then optionally remove the default after backfilling all rows.
  — Index creation: always use CREATE INDEX CONCURRENTLY in production to avoid table locks.

Connection pooling:
  PgBouncer configuration:
    pool_mode = transaction
    max_client_conn = 1000
    default_pool_size = 100
    min_pool_size = 10
    reserve_pool_size = 5
    reserve_pool_timeout = 3
    max_db_connections = 100
    log_connections = 0
    log_disconnections = 0

Read replica routing:
  The Prisma client is configured with two connections:
    prisma.$primary (for writes, INSERT/UPDATE/DELETE)
    prisma.$replica (for reads, SELECT queries)
  
  Automatic routing:
  — All queries inside a transaction: always go to primary (Prisma default).
  — Explicit reads (dashboard stats, user list, audit log): routed to replica.
  — Auth queries (login lookup, token verification): routed to primary
    (to avoid replication lag causing stale reads during login).


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 10 — OBSERVABILITY AND MONITORING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10.1 Structured Logging
━━━━━━━━━━━━━━━━━━━━━━

Library: Pino (Fastify's default, extremely fast JSON logger).
All logs are structured JSON objects. No plain text logs in production.

Log format (per line):
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "info",                          // trace|debug|info|warn|error|fatal
  "component": "auth.login",               // module identifier
  "request_id": "uuid",                    // per-request correlation ID
  "user_id": "uuid",                       // null for unauthenticated requests
  "method": "POST",
  "path": "/api/v1/auth/login",
  "status_code": 200,
  "duration_ms": 42,
  "ip": "192.168.1.x",                     // partially masked in logs
  "message": "Login successful",
  "meta": {}                               // event-specific extra fields
}

Log scrubber middleware (Pino's serializers):
  — phone_number: replace with "[REDACTED]"
  — email: replace with "u***@domain.com" (show first char + domain only)
  — password, password_hash, token, otp, code, secret, api_key: replace with "[REDACTED]"
  — This runs on EVERY log event before it is written to any sink.

Log levels:
  trace:  Only in development. Never in production (too verbose).
  debug:  Development only. Disable in production.
  info:   Normal operations (requests, auth events, job completions).
  warn:   Recoverable issues (rate limit hit, retried operation, degraded service).
  error:  Errors requiring investigation (DB connection failure, third-party API failure).
  fatal:  Process crash or unrecoverable state. Triggers immediate PagerDuty alert.

Log sinks (production):
  — Stdout (Docker/ECS captures this)
  — AWS CloudWatch Logs (via Fluent Bit sidecar)
  — DataDog or Grafana Loki for log aggregation and search

10.2 Error Tracking
━━━━━━━━━━━━━━━━━━

Service: Sentry (sentry.io)
  — Backend (Fastify): @sentry/node integration. Captures all unhandled exceptions.
  — Frontend (Next.js): @sentry/nextjs. Captures browser JS errors + SSR errors.
  — Source maps: uploaded to Sentry on every production deployment (so stack traces
    are readable even for minified/bundled code).

Alert policy:
  — New error type detected (never seen before): immediate Slack notification to #errors
  — Error rate spike (>10 occurrences of same error in 5 minutes): PagerDuty alert
  — Fatal error: PagerDuty alert (high priority, phone call)

10.3 Metrics and Alerting
━━━━━━━━━━━━━━━━━━━━━━━━

Metrics collection: Prometheus (via Fastify's prom-client integration).
Dashboard: Grafana.

Key metrics exposed at GET /metrics (internal, not public):
  — api_request_duration_seconds{method, path, status} (histogram, P50/P95/P99)
  — api_requests_total{method, path, status} (counter)
  — api_active_connections (gauge)
  — auth_login_attempts_total{success, failure_reason} (counter)
  — auth_signup_attempts_total{step, success} (counter)
  — otp_send_total{provider, status} (counter)
  — db_query_duration_seconds{operation, table} (histogram)
  — redis_command_duration_seconds{command} (histogram)
  — sms_send_cost_units_total{provider} (counter, for billing)
  — download_count_total{platform, version, channel} (counter)

Alerting rules (PagerDuty integration):
  — API P99 latency > 2 seconds for 5 minutes
  — API error rate (5xx) > 1% for 5 minutes
  — Database connection pool saturation > 90% for 2 minutes
  — Redis connection failure (any duration)
  — SMS provider error rate > 10% for 10 minutes (OTP failures)
  — Disk space (for logging/storage instances) < 20%

10.4 Uptime SLO
━━━━━━━━━━━━━━

Web platform uptime SLO: 99.9% (≤8.7 hours downtime per year)
Calculated as: (total_minutes - downtime_minutes) / total_minutes

Uptime monitoring: external monitoring from at least 3 geographic regions:
  — Pingdom, Better Uptime, or UptimeRobot (check every 1 minute)
  — Monitor: homepage, /api/v1/auth/refresh (health check), /api/v1/releases/latest
  — Alert: if check fails from 2/3 regions simultaneously (reduces false positives from
    single region network issues)

Public status page: status.syncsanctuary.app (hosted on Statuspage.io or Instatus)
  — Shows real-time status of: Web Platform, API, Downloads, Auth Service
  — Historical uptime for last 90 days
  — Incident history with post-mortems
  — Users can subscribe for email/SMS notifications


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 11 — ACCESSIBILITY (WCAG 2.1 AA COMPLIANCE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALL of the following requirements are HARD CONSTRAINTS. Shipping an inaccessible
product is shipping a broken product.

11.1 Semantic HTML
━━━━━━━━━━━━━━━━━

  — Every page has exactly ONE <h1> (the primary page heading).
  — Heading hierarchy (h1 → h2 → h3...) is never skipped.
  — Navigation: wrapped in <nav> with aria-label="Main navigation" (or "Site navigation").
  — Main content: wrapped in <main>.
  — Footer: wrapped in <footer>.
  — Buttons that trigger actions: <button> (not <div> or <span>).
  — Links that navigate: <a href="..."> (not <button>).
  — Forms: every input has an associated <label> (via htmlFor + id, or wrapping).
    Never use placeholder text as the only label (placeholder disappears on focus).
  — Icons that convey meaning (not decorative): aria-label on the element.
  — Icons that are decorative (visual only): aria-hidden="true".
  — Tables: use <th scope="col"> or <th scope="row"> for all header cells.
  — Lists: use <ul>/<ol> + <li>. Never use <div> for list-like UI without proper ARIA roles.

11.2 Keyboard Navigation
━━━━━━━━━━━━━━━━━━━━━━━

  — Tab order: follows DOM source order. No tabindex > 0 (tabindex="0" is fine for
    making non-interactive elements focusable when needed; tabindex="-1" for
    programmatically focused elements that shouldn't be in tab order).
  — All interactive elements reachable by Tab.
  — Skip link: "Skip to main content" link as the very first focusable element on every page.
    Visually hidden by default (opacity: 0, position: absolute), visible on focus
    (opacity: 1, styled clearly with brand colors, positioned at top-left of viewport).
  — Escape key closes: all modals, all dropdowns, all drawers. Confirmed with useEffect
    listening to keydown events and calling the close handler.
  — Enter/Space activate: all buttons (standard HTML behavior, but verify for custom components).
  — Arrow keys navigate: within dropdown menus, within tab bars (using Radix UI which
    handles this correctly with the roving tabindex pattern).
  — Focus management:
    — Modal open: focus moves to the first focusable element inside the modal.
    — Modal close: focus returns to the element that triggered the modal.
    — Route change: focus moves to the <h1> of the new page.
    (Implement via Next.js router.events + document.querySelector('h1')?.focus())

11.3 Focus Visible
━━━━━━━━━━━━━━━━━

  NEVER remove :focus-visible outlines. The default browser focus outline is ugly;
  replace it with a beautiful one — but always replace, never remove.
  
  Custom focus style:
    :focus-visible {
      outline: 2px solid var(--color-brand-500);
      outline-offset: 2px;
      border-radius: 2px;
    }
    /* Override for elements with border-radius: */
    .button:focus-visible {
      box-shadow: 0 0 0 2px var(--color-bg-surface), 0 0 0 4px var(--color-brand-500);
      outline: none; /* box-shadow provides the visible ring */
    }

11.4 Color Contrast
━━━━━━━━━━━━━━━━━━

  All text must meet WCAG 2.1 AA contrast ratios:
    Normal text (<18px or <14px bold): minimum 4.5:1 contrast ratio
    Large text (≥18px or ≥14px bold): minimum 3:1 contrast ratio
  
  Run automated checks: axe-core (via jest-axe for unit tests + Playwright for E2E).
  Manual check: use Colour Contrast Analyser tool for all color combinations.
  
  Specific checks:
    — Primary text (#111827) on white (#FFFFFF): 16.1:1 ✓
    — Secondary text (#4B5563) on white: 7.0:1 ✓
    — Brand-600 (#4F46E5) on white: 4.6:1 ✓ (barely passes — verify every usage)
    — White text on brand-600: 4.6:1 ✓
    — Muted text (#9CA3AF) on white: 2.9:1 ✗ — ONLY use for decorative text, NEVER
      for content or labels that convey information.

11.5 Screen Reader Testing
━━━━━━━━━━━━━━━━━━━━━━━━━

  Mandatory test matrix before each release:
    VoiceOver + Safari (macOS): full signup, login, dashboard, download flows
    NVDA + Firefox (Windows): same flows
    TalkBack + Chrome (Android): responsive layout + auth flows
    
  Specific screen reader requirements:
    — Form errors: announced via aria-live="polite" region. The error message container
      has role="alert" (which is aria-live="assertive") for validation errors that
      appear on submit. For real-time field errors (as user types): aria-live="polite".
    — Page loading state: aria-busy="true" on the main content area during navigation.
    — Progress indicator (multi-step signup): aria-label="Step 2 of 5" on the indicator.
    — OTP input: each digit input has aria-label="Digit 1" through "Digit 6".
      The group is wrapped in a <fieldset> with <legend>Enter verification code</legend>.
    — Avatar upload crop modal: aria-label="Crop your profile photo" on the modal.
    — Toggle switches (dark mode, preferences): role="switch", aria-checked="true/false",
      accessible name from the visible label.

11.6 Motion and Animation
━━━━━━━━━━━━━━━━━━━━━━━━

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  
  Framer Motion: useReducedMotion() hook. When reduced motion is preferred,
  all animation variants use duration: 0 and no position offsets.

11.7 i18n and Accessibility
━━━━━━━━━━━━━━━━━━━━━━━━━━

  — <html lang="{locale}"> is set server-side to the active locale.
    This is critical for screen readers to use the correct language voice.
  — When a language switch occurs: the new page's <html lang> is updated.
  — Date/time formatting: always include time zone information in screen-reader-
    accessible text (visually hidden span with full date/time for relative times like
    "3 days ago").
  — Phone number display: wrap in <span aria-label="Phone number: plus 8 2 1 0 star star star star 5 6 7 8">
    for screen reader-friendly reading of partially masked numbers.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 12 — SEO SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

12.1 Meta Tags (per page)
━━━━━━━━━━━━━━━━━━━━━━━━

Each page exports metadata (Next.js App Router generateMetadata function):

Home page:
  <title>SyncSanctuary — Professional Church Media Production Suite</title>
  <meta name="description" content="AI-powered video editing, live presentation control,
    real-time transcription, and multi-platform streaming. Built for church media teams.">
  <meta property="og:title" content="SyncSanctuary">
  <meta property="og:description" content="...">
  <meta property="og:image" content="https://cdn.syncsanctuary.app/og/home.png">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://syncsanctuary.app/en/">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@SyncSanctuary">
  <link rel="canonical" href="https://syncsanctuary.app/en/">
  <link rel="alternate" hreflang="en" href="https://syncsanctuary.app/en/">
  <link rel="alternate" hreflang="ko" href="https://syncsanctuary.app/ko/">
  [... all other supported locales ...]
  <link rel="alternate" hreflang="x-default" href="https://syncsanctuary.app/en/">

Auth pages (login, signup, reset):
  <meta name="robots" content="noindex, nofollow">
  (Auth pages should not be indexed by search engines)

Dashboard and Account:
  <meta name="robots" content="noindex, nofollow">
  (Authenticated user pages must not be indexed)

12.2 Structured Data (JSON-LD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Home page: SoftwareApplication schema
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SyncSanctuary",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Windows, macOS, Linux",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Professional church media production suite...",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "142"
  }
}

Download page: SoftwareApplication + DownloadAction schema per platform.

12.3 Performance (Core Web Vitals)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Performance targets (measured by Lighthouse and Google CrUX):
  Largest Contentful Paint (LCP): < 2.5 seconds (Good threshold)
  First Input Delay (FID) / Interaction to Next Paint (INP): < 200ms
  Cumulative Layout Shift (CLS): < 0.1

Strategies to achieve targets:
  — Images: all images use Next.js <Image> with proper width/height to prevent CLS.
    WebP format, responsive srcset, lazy loading (below the fold), eager loading (hero).
    OG images: pre-generated at build time (not on-demand).
  — Fonts: preconnect + preload for Google Fonts. font-display: swap to prevent FOIT.
  — JavaScript: bundle splitting via Next.js automatic code splitting.
    Third-party scripts (Sentry, PostHog) loaded with next/script strategy="lazyOnload".
  — Server-side rendering: home page, download page, feature pages are SSG (static).
    Dashboard is SSR (personalized content, session-required).
  — CSS: critical CSS inlined. Non-critical CSS deferred.
  — CDN: all static assets served from CDN with long-lived cache headers:
    Cache-Control: public, max-age=31536000, immutable (for versioned assets)
    Cache-Control: public, max-age=86400 (for app icons, favicons)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 13 — PRIVACY AND DATA GOVERNANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

13.1 Privacy Policy Requirements
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The Privacy Policy must be written in plain, non-legal language, available in ALL
supported languages, and must specify for EVERY category of data collected:
  — What data is collected
  — Why (purpose / legal basis under GDPR Article 6)
  — When (at what point in the user journey)
  — How long it is retained
  — Who it is shared with (third-party processors: AWS, Twilio, Coolsms, PostHog, Sentry)
  — User's rights (access, rectification, erasure, portability, objection)

Data processing legal bases (GDPR Article 6):
  — Account data (phone, email, password hash): Article 6(1)(b) — necessary for the contract
  — Authentication logs (IP, user agent): Article 6(1)(f) — legitimate interests (security)
  — Analytics (PostHog): Article 6(1)(a) — consent (only collected after user opts in)
  — Marketing emails: Article 6(1)(a) — consent

13.2 Data Retention Policy
━━━━━━━━━━━━━━━━━━━━━━━━━

Data Category                       Retention Period     Deletion Method
──────────────────────────────────  ───────────────────  ────────────────────
Active user account data            While account active  On deletion request
Deleted account data (PII fields)   30 days grace period  Hard delete after grace period
Audit log                           2 years               Scheduled job purge
Refresh tokens (expired/revoked)    90 days after expiry  Scheduled job: DELETE WHERE expires_at < NOW() - INTERVAL '90 days'
OTP codes                           7 days                Scheduled job
Password reset tokens               7 days                Scheduled job
Email verification tokens           30 days after use     Scheduled job
App download logs                   3 years               Aggregated/anonymized after 1 year
SMS send log                        1 year                Scheduled job
Sentry error data                   90 days               Sentry retention policy
PostHog analytics                   365 days              PostHog retention policy

All scheduled retention jobs run daily at 2:00 AM UTC.
All jobs are logged and errors alert to ops team.

13.3 Third-Party Data Processors
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each third-party processor, a Data Processing Agreement (DPA) must be in place
before launch. Required DPAs:
  — AWS (hosting, S3, SES, ElastiCache, RDS)
  — Twilio (SMS delivery)
  — Coolsms (SMS delivery for Korean numbers)
  — Sentry (error tracking — ensure PII scrubbing is configured)
  — PostHog or Plausible (analytics — ensure IP anonymization is enabled)
  — MaxMind (IP geolocation — evaluate if GeoLite2 use requires DPA)
  — Google (OAuth — Google's DPA covers this via their Terms)

13.4 Inactivity Sweep
━━━━━━━━━━━━━━━━━━━━

Monthly scheduled job:
  SELECT id, email, phone_number FROM users
  WHERE last_active_at < NOW() - INTERVAL '3 years'
  AND is_active = TRUE
  AND deletion_requested_at IS NULL;
  
  For each found user:
  1. Send a "Your account will be deleted" email/SMS:
     "Your SyncSanctuary account has been inactive for 3 years.
      It will be permanently deleted on [date + 60 days].
      Log in to keep your account: [link]"
  2. Set a "inactivity_warning_sent_at" flag on the user record.
  3. After 60 days: if still inactive, initiate deletion (same as user-requested deletion).


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 14 — BROWSER AND DEVICE COMPATIBILITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Browser support matrix (all features must work in all of these):
  Chrome / Chromium 120+      (Windows, macOS, Linux, Android)
  Firefox 121+                (Windows, macOS, Linux)
  Safari 17+                  (macOS, iOS)
  Edge 120+                   (Windows, macOS)
  Samsung Internet 23+        (Android — significant market share in Korea)
  Chrome for Android 120+     (Android)
  Safari on iOS 17+           (iPhone, iPad)

Mobile (responsive design):
  The marketing pages (Home, Download, Features) are fully responsive and work
  on all screen sizes down to 375px width.
  Auth pages (Login, Signup) are fully responsive.
  Dashboard and Account settings are responsive (sidebar collapses to hamburger on mobile).
  
  NOTE: The SyncSanctuary desktop application is a desktop-only product.
  The website's download page shows a mobile-specific message:
  "SyncSanctuary is a desktop application. Please visit on a Windows, Mac, or Linux computer."
  The download buttons are hidden on mobile (replaced with the message above).

CSS polyfills and fallbacks:
  — CSS custom properties: supported in all target browsers. No polyfill needed.
  — CSS Grid: supported in all target browsers. No polyfill needed.
  — CSS Container Queries: supported in Chrome 105+, Firefox 110+, Safari 16+.
    Fallback: use media queries for Safari 16 (still widely used).
  — CSS :has() selector: supported in Chrome 105+, Safari 15.4+, Firefox 121+.
    Use progressive enhancement — styles using :has() are enhancements, not critical.
  — Intl.RelativeTimeFormat: polyfill from @formatjs/intl-relativetimeformat for
    older browsers.

JavaScript polyfills:
  Next.js handles most polyfills automatically via SWC transpilation.
  Explicit polyfills needed:
  — Crypto.randomUUID(): supported everywhere in target browsers. No polyfill.
  — SubtleCrypto (SHA-1 for HIBP): supported everywhere. No polyfill.
  — Intersection Observer (for scroll-triggered animations): supported. No polyfill.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 15 — INTEGRATION POINTS WITH THE DESKTOP APPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This section is CRITICAL. The desktop app and web platform share a unified auth system.
Every point below must be implemented consistently across both components.

15.1 Shared Token Contract
━━━━━━━━━━━━━━━━━━━━━━━━━

The JWT format (RS256, payload structure, expiry, claims) is identical for both
web and desktop clients. The only difference is delivery mechanism:
  Web: access token in memory (React state), refresh token in httpOnly cookie.
  Desktop: access token in process memory (Rust Mutex), refresh token in OS keychain.

The /api/v1/auth/refresh endpoint:
  Web: reads refresh token from ss_refresh_token cookie.
  Desktop: reads refresh token from Authorization: Bearer {refresh_token} header.
  Both receive the same response structure.

The /api/v1/auth/login endpoint:
  Web: sets ss_refresh_token httpOnly cookie + returns access_token in body.
  Desktop: does NOT set a cookie (desktop has no cookie store in this context).
           Returns BOTH access_token AND refresh_token in the response body.
  The desktop app uses client_type: "desktop" to signal this behavior to the server.

15.2 Shared Account Actions
━━━━━━━━━━━━━━━━━━━━━━━━━━

When a user changes their password on the web, all existing refresh tokens are revoked.
This means the desktop app's stored refresh token will be rejected on next refresh.
The desktop app receives HTTP 401 TOKEN_REVOKED → shows login screen.
Message: "Your session has expired. Please log in again."

When a user changes their username on the web: the desktop app will reflect this
on next access token refresh (the new username is included in the JWT payload).

15.3 Shared Locale
━━━━━━━━━━━━━━━━━

The user's preferred language (users.language column) is the source of truth.
Both the web and desktop app respect this field.
When the user changes language on the web (PATCH /api/v1/account/preferences { language }),
the desktop app reads the updated language from the user profile on next startup or session.

15.4 Google OAuth Desktop Flow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The desktop app supports "Continue with Google" by:
  1. Generating a random state + PKCE code_verifier (for security).
  2. Opening the system default browser to:
     GET https://syncsanctuary.app/api/v1/auth/google/desktop-initiate
          ?state={random_state}&code_challenge={SHA-256(code_verifier)}&redirect_port={PORT}
  3. Starting a local HTTP server on 127.0.0.1:{PORT} (random available port).
  4. The web platform initiates Google OAuth.
  5. On callback: web platform validates everything, issues tokens.
     Redirects browser to:
     http://127.0.0.1:{PORT}/callback?access_token={JWT}&refresh_token={token}
     (loopback only — this URL is only accessible on the local machine)
     OR uses the custom URL scheme: syncsanctuary://auth/callback?... 
     (requires the desktop app to register the syncsanctuary:// scheme in the OS).
  6. Desktop app receives tokens, stores them, marks user as authenticated.
  7. Local HTTP server shuts down.

15.5 API Version Compatibility
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The desktop app sends its version in every request:
  User-Agent: SyncSanctuary-Desktop/1.2.3 (windows; x64)
  X-Client-Version: 1.2.3
  X-Client-Platform: windows

The API uses this to:
  — Flag outdated desktop clients (version < minimum_supported_version)
  — Return HTTP 426 Upgrade Required if client is critically outdated
  — Log analytics on desktop version distribution

Minimum supported version policy:
  Stored in a database table or config file.
  The API checks the client version on every authenticated request.
  If below minimum: return HTTP 426 { error: "CLIENT_OUTDATED",
    minimum_version: "1.1.0",
    download_url: "https://syncsanctuary.app/en/download",
    message: "Your SyncSanctuary app is too old. Please update." }
  The desktop app handles HTTP 426 by showing a mandatory update prompt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 16 — TESTING SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

16.1 Unit Tests (Vitest)
━━━━━━━━━━━━━━━━━━━━━━━

Minimum 80% line coverage. Coverage enforced in CI.

Required unit test coverage:
  — All Zod validation schemas (test valid + invalid inputs for each)
  — Argon2id hashing + verification
  — JWT generation + verification (test expiry, invalid signature, missing claims)
  — OTP generation + hashing
  — Phone number normalization (test E.164 conversion for all supported countries)
  — Rate limit logic
  — Log scrubber middleware (verify all PII fields are redacted correctly)
  — Database helper functions
  — All utility functions (token generation, hash functions, date utilities)

16.2 Integration Tests (Vitest + Supertest)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Test the full API routes against a real (test) PostgreSQL database.
Test isolation: each test or test suite wraps its database operations in a transaction
that is rolled back after the test (via Prisma's transaction rollback or per-test DB reset).

Required integration test coverage:
  — POST /auth/signup/send-otp: valid phone, invalid phone, existing phone, rate limit
  — POST /auth/signup/verify-otp: correct code, incorrect code, expired code, max attempts
  — POST /auth/signup/create-account: complete happy path, all error conditions
  — POST /auth/login: happy path, wrong password, account lock, rate limit
  — POST /auth/refresh: valid token, revoked token (theft detection), expired token
  — POST /auth/logout: single session, all sessions
  — POST /auth/password-reset/request: found user, not found user (response is identical)
  — POST /auth/password-reset/complete: success, expired token, wrong password snapshot
  — PATCH /account/profile: valid username change, duplicate username, rate limited
  — POST /account/delete: correct confirmation, wrong password

16.3 End-to-End Tests (Playwright)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Run against the staging environment. Three browser engines: Chromium, Firefox, WebKit.

Required E2E test flows:

FLOW 1: Complete signup (manual):
  Navigate to /en/auth/signup
  Enter valid South Korean phone number
  Wait for OTP input to appear
  (Playwright intercepts the Twilio/Coolsms webhook to get the OTP in CI)
  Enter OTP
  Skip email
  Enter valid username (check real-time validation)
  Enter strong password (verify strength meter updates)
  Check terms checkbox
  Submit → verify redirect to /en/dashboard
  Verify welcome message shows correct username

FLOW 2: Login:
  Navigate to /en/auth/login
  Enter phone number and password (from FLOW 1 account)
  Submit → verify redirect to /en/dashboard
  Verify username appears in nav bar

FLOW 3: Download page:
  Login first
  Navigate to /en/download
  Verify OS detection highlights correct platform
  Verify download button is enabled
  Click download → verify file download starts (Playwright can intercept the download)
  Verify "What's next?" panel appears

FLOW 4: Account settings:
  Login
  Navigate to /en/account
  Change username to a new unique name
  Verify success toast
  Verify new username in nav bar (immediate reflection)

FLOW 5: Session revocation:
  Login
  Navigate to /en/account/security
  Verify current session appears in list
  Click "Revoke all other sessions"
  Verify confirmation dialog appears
  Confirm → verify other sessions removed from list

FLOW 6: Accessibility:
  Run axe-core on every page (via @axe-core/playwright)
  Fail if any WCAG 2.1 AA violations are found

FLOW 7: i18n:
  Navigate to /ko/ → verify page is in Korean
  Navigate to /de/ → verify page is in German
  Signup in Korean locale → verify OTP SMS content is in Korean
  (SMS content is verified by checking the Twilio message body via API in test mode)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPENDIX A — COMPLETE LOCALE FILE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Example /messages/en.json (all keys required in all locale files):

{
  "meta.home.title": "SyncSanctuary — Professional Church Media Production Suite",
  "meta.home.description": "AI-powered video editing, live presentation, and transcription for church media teams.",
  "meta.signup.title": "Create your SyncSanctuary account",
  "meta.login.title": "Log in to SyncSanctuary",
  "meta.dashboard.title": "Dashboard — SyncSanctuary",
  "meta.download.title": "Download SyncSanctuary",
  "meta.account.title": "Account Settings — SyncSanctuary",

  "nav.home": "Home",
  "nav.features": "Features",
  "nav.download": "Download",
  "nav.pricing": "Pricing",
  "nav.support": "Support",
  "nav.login": "Log in",
  "nav.signup": "Get started",
  "nav.dashboard": "Dashboard",
  "nav.account": "Account settings",
  "nav.logout": "Log out",
  "nav.open_menu": "Open navigation menu",
  "nav.close_menu": "Close navigation menu",

  "auth.signup.step1.title": "Enter your phone number",
  "auth.signup.step1.description": "We'll send you a verification code.",
  "auth.signup.step1.phone_label": "Phone number",
  "auth.signup.step1.send_code": "Send verification code",
  "auth.signup.step1.otp_sent": "We sent a 6-digit code to {phone}",
  "auth.signup.step1.otp_label": "Enter verification code",
  "auth.signup.step1.resend": "Resend code",
  "auth.signup.step1.resend_in": "Resend in {seconds}s",
  "auth.signup.step1.error.invalid_phone": "Please enter a valid phone number with country code.",
  "auth.signup.step1.error.phone_exists": "An account already exists with this phone number.",
  "auth.signup.step1.error.otp_invalid": "Incorrect code. {remaining} attempts remaining.",
  "auth.signup.step1.error.otp_expired": "This code has expired. Please request a new one.",
  "auth.signup.step1.error.otp_max_attempts": "Too many incorrect attempts. Please request a new code.",
  "auth.signup.step1.error.rate_limited": "Too many code requests. Please wait {minutes} minutes.",

  "auth.signup.step2.title": "Email address (optional)",
  "auth.signup.step2.description": "Add an email for account recovery and notifications.",
  "auth.signup.step2.email_label": "Email address (optional)",
  "auth.signup.step2.skip": "Skip for now",
  "auth.signup.step2.verification_note": "We'll send a verification link. You can verify later.",
  "auth.signup.step2.error.email_exists": "This email is already associated with an account.",
  "auth.signup.step2.error.invalid_format": "Please enter a valid email address.",

  "auth.signup.step3.title": "Choose your username",
  "auth.signup.step3.description": "Your unique display name. 3–32 characters.",
  "auth.signup.step3.username_label": "Username",
  "auth.signup.step3.available": "Available",
  "auth.signup.step3.taken": "Already taken",
  "auth.signup.step3.reserved": "This username is reserved",
  "auth.signup.step3.checking": "Checking...",
  "auth.signup.step3.error.too_short": "Username must be at least 3 characters.",
  "auth.signup.step3.error.too_long": "Username must be 32 characters or fewer.",
  "auth.signup.step3.error.invalid_chars": "Only letters, numbers, underscores, and hyphens allowed.",

  "auth.signup.step4.title": "Create your password",
  "auth.signup.step4.password_label": "Password",
  "auth.signup.step4.confirm_label": "Confirm password",
  "auth.signup.step4.show": "Show password",
  "auth.signup.step4.hide": "Hide password",
  "auth.signup.step4.strength.weak": "Weak",
  "auth.signup.step4.strength.fair": "Fair",
  "auth.signup.step4.strength.good": "Good",
  "auth.signup.step4.strength.strong": "Strong",
  "auth.signup.step4.req.length": "At least 10 characters",
  "auth.signup.step4.req.uppercase": "At least 1 uppercase letter",
  "auth.signup.step4.req.lowercase": "At least 1 lowercase letter",
  "auth.signup.step4.req.digit": "At least 1 number",
  "auth.signup.step4.req.special": "At least 1 special character",
  "auth.signup.step4.mismatch": "Passwords do not match",
  "auth.signup.step4.hibp_warning": "This password appeared in a known data breach. We recommend choosing a different one.",

  "auth.signup.step5.title": "Almost done!",
  "auth.signup.step5.terms_label": "I agree to the {terms} and {privacy}",
  "auth.signup.step5.terms_link": "Terms of Service",
  "auth.signup.step5.privacy_link": "Privacy Policy",
  "auth.signup.step5.marketing_label": "Send me product updates and tips",
  "auth.signup.step5.submit": "Create account",
  "auth.signup.step5.creating": "Creating your account...",
  "auth.signup.step5.error.consent_required": "You must accept the Terms of Service to continue.",

  "auth.login.title": "Log in to your account",
  "auth.login.identifier_label": "Phone number or email",
  "auth.login.password_label": "Password",
  "auth.login.forgot_password": "Forgot password?",
  "auth.login.remember_device": "Remember this device",
  "auth.login.submit": "Log in",
  "auth.login.logging_in": "Logging in...",
  "auth.login.google": "Continue with Google",
  "auth.login.no_account": "Don't have an account?",
  "auth.login.signup_link": "Sign up",
  "auth.login.error.invalid_credentials": "Incorrect phone/email or password. Please try again.",
  "auth.login.error.account_locked": "Account temporarily locked. Try again in {minutes} minutes.",
  "auth.login.error.account_deleted": "This account no longer exists.",
  "auth.login.error.account_suspended": "Your account has been suspended. Contact support.",
  "auth.login.error.rate_limited": "Too many login attempts. Please wait {minutes} minutes.",
  "auth.login.error.no_password": "This account was created with Google. Please use 'Continue with Google'.",

  "auth.reset.request.title": "Reset your password",
  "auth.reset.request.description": "Enter your phone number or email and we'll send a reset link.",
  "auth.reset.request.identifier_label": "Phone number or email",
  "auth.reset.request.submit": "Send reset link",
  "auth.reset.request.success": "If an account exists with this contact, a reset code has been sent.",
  "auth.reset.complete.title": "Set new password",
  "auth.reset.complete.submit": "Update password",
  "auth.reset.complete.success": "Password changed successfully. Please log in with your new password.",

  "dashboard.welcome": "Welcome back, {username}! 👋",
  "dashboard.subtitle": "Here's what's happening with your SyncSanctuary account.",
  "dashboard.email_unverified": "Please verify your email address to enable all features. We sent a link to {email}.",
  "dashboard.resend_verification": "Resend verification email",
  "dashboard.verification_sent": "Verification email sent! Check your inbox.",
  "dashboard.download_card.title": "Download SyncSanctuary",
  "dashboard.download_card.description": "Get the latest version for your operating system.",
  "dashboard.account_card.title": "Account Settings",
  "dashboard.account_card.description": "Update your profile, password, and preferences.",
  "dashboard.sessions_card.title": "Active Sessions",
  "dashboard.sessions_card.description": "{count, plural, one {# active session} other {# active sessions}} — review and manage your devices.",
  "dashboard.support_card.title": "Help & Support",
  "dashboard.support_card.description": "Documentation, tutorials, and community forum.",
  "dashboard.activity.title": "Recent Activity",
  "dashboard.activity.view_all": "View full activity log",
  "dashboard.whats_new.title": "What's New",

  "download.title": "Download SyncSanctuary",
  "download.subtitle": "Available for Windows, macOS, and Linux. Free to start.",
  "download.channel.stable": "Stable",
  "download.channel.beta": "Beta",
  "download.beta_warning": "Beta — may contain bugs. Not recommended for live services.",
  "download.login_required": "Log in or create a free account to download SyncSanctuary.",
  "download.mobile_message": "SyncSanctuary is a desktop application. Please visit on a Windows, Mac, or Linux computer.",
  "download.recommended": "Recommended for you",
  "download.button": "Download for {platform}",
  "download.version": "Version {version}",
  "download.released": "Released {date}",
  "download.size": "Download size: {size}",
  "download.format": "Format: {format}",
  "download.verify": "Verify download integrity",
  "download.requirements": "System requirements",
  "download.changelog_link": "View full changelog",
  "download.whats_next.title": "Your download is starting...",
  "download.whats_next.install.windows": "Run the installer and follow the setup wizard.",
  "download.whats_next.install.macos": "Open the .dmg file and drag SyncSanctuary to your Applications folder.",
  "download.whats_next.install.linux": "Mark the AppImage as executable, then double-click to launch.",

  "account.title": "Account Settings",
  "account.tab.profile": "Profile",
  "account.tab.security": "Security",
  "account.tab.preferences": "Preferences",
  "account.tab.data": "Your Data",
  "account.tab.danger": "Danger Zone",
  "account.avatar.change": "Change avatar",
  "account.avatar.remove": "Remove avatar",
  "account.avatar.upload_label": "Upload a photo",
  "account.username.label": "Username",
  "account.username.save": "Save username",
  "account.username.rate_limited": "You can change your username again in {days} days.",
  "account.phone.label": "Phone number",
  "account.phone.change": "Change phone number",
  "account.email.label": "Email address",
  "account.email.add": "Add email address",
  "account.email.change": "Change email",
  "account.email.remove": "Remove email",
  "account.email.verified": "Verified",
  "account.email.unverified": "Unverified",
  "account.email.resend": "Resend verification",
  "account.password.title": "Change Password",
  "account.password.current": "Current password",
  "account.password.new": "New password",
  "account.password.confirm": "Confirm new password",
  "account.password.save": "Update password",
  "account.password.set_title": "Set a Password",
  "account.sessions.title": "Active Sessions",
  "account.sessions.current": "This device",
  "account.sessions.revoke": "Revoke",
  "account.sessions.revoke_all": "Revoke all other sessions",
  "account.sessions.revoke_all_confirm": "This will log you out of all other devices. Continue?",
  "account.sessions.last_active": "Last active {time}",
  "account.preferences.language": "Language",
  "account.preferences.notifications": "Notifications",
  "account.preferences.security_email": "Security alerts via email",
  "account.preferences.security_sms": "Security alerts via SMS",
  "account.preferences.marketing_email": "Product updates via email",
  "account.preferences.marketing_sms": "Product updates via SMS",
  "account.data.title": "Your Data",
  "account.data.description": "You have the right to receive a copy of all personal data we hold about you.",
  "account.data.export_button": "Request data export",
  "account.data.export_requested": "Export requested — check your email within 5 minutes.",
  "account.danger.title": "Danger Zone",
  "account.danger.delete_description": "Permanently deleting your account will immediately suspend access. Your data will be retained for 30 days.",
  "account.danger.delete_button": "Delete my account",
  "account.danger.delete_confirm.title": "Permanently delete your account?",
  "account.danger.delete_confirm.password_label": "Enter your current password to confirm",
  "account.danger.delete_confirm.phrase_label": "Type DELETE MY ACCOUNT to confirm",
  "account.danger.delete_confirm.phrase": "DELETE MY ACCOUNT",
  "account.danger.delete_confirm.submit": "Delete account",
  "account.danger.delete_confirm.cancel": "Cancel",
  "account.deletion.grace_banner": "Your account is scheduled for deletion on {date}.",
  "account.deletion.cancel": "Cancel deletion",

  "cookie.banner.heading": "We use cookies",
  "cookie.banner.body": "SyncSanctuary uses cookies to keep you logged in and improve your experience. Read our {privacy_policy} for details.",
  "cookie.banner.privacy_link": "Privacy Policy",
  "cookie.banner.accept_all": "Accept all",
  "cookie.banner.manage": "Manage preferences",
  "cookie.necessary.label": "Strictly Necessary",
  "cookie.necessary.description": "Required for the website to function. Cannot be disabled.",
  "cookie.analytics.label": "Analytics",
  "cookie.analytics.description": "Anonymous usage data to help us improve the product.",
  "cookie.preferences_cookies.label": "Preferences",
  "cookie.preferences_cookies.description": "Remember your UI settings like theme and language.",
  "cookie.save": "Save preferences",
  "cookie.reject_all": "Reject all",

  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.continue": "Continue",
  "common.back": "Back",
  "common.loading": "Loading...",
  "common.error": "Error",
  "common.success": "Success",
  "common.close": "Close",
  "common.confirm": "Confirm",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.view": "View",
  "common.optional": "(optional)",
  "common.required": "(required)",
  "common.or": "or",
  "common.step_of": "Step {current} of {total}",

  "errors.network": "Network error. Please check your connection and try again.",
  "errors.server": "Something went wrong on our end. Please try again in a moment.",
  "errors.unauthorized": "You must be logged in to access this page.",
  "errors.forbidden": "You don't have permission to access this resource.",
  "errors.not_found": "The page you're looking for doesn't exist.",
  "errors.session_expired": "Your session has expired. Please log in again.",
  "errors.offline": "⚠ Working offline — some features may be unavailable.",

  "aria.toggle_theme": "Toggle dark/light mode",
  "aria.toggle_menu": "Toggle navigation menu",
  "aria.close_modal": "Close dialog",
  "aria.language_switcher": "Select language",
  "aria.user_menu": "User account menu",
  "aria.otp_digit": "Digit {number} of 6",
  "aria.password_strength": "Password strength: {level}",
  "aria.avatar_upload": "Upload profile photo",
  "aria.progress": "Step {current} of {total}: {step_name}",

  "footer.brand_tagline": "The professional production suite for modern worship.",
  "footer.product_heading": "Product",
  "footer.company_heading": "Company",
  "footer.legal_heading": "Legal",
  "footer.features": "Features",
  "footer.download": "Download",
  "footer.changelog": "Changelog",
  "footer.roadmap": "Roadmap",
  "footer.pricing": "Pricing",
  "footer.about": "About",
  "footer.blog": "Blog",
  "footer.careers": "Careers",
  "footer.press": "Press Kit",
  "footer.contact": "Contact",
  "footer.privacy": "Privacy Policy",
  "footer.terms": "Terms of Service",
  "footer.cookies": "Cookie Policy",
  "footer.ccpa": "Do Not Sell or Share My Personal Information",
  "footer.copyright": "© {year} SyncSanctuary. All rights reserved.",
  "footer.made_with": "Made with ♥ for the church community"
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPENDIX B — RECOMMENDED IMPLEMENTATION ORDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Milestone 1 — Foundation (Week 1–2):
  ✓ PostgreSQL schema (users, refresh_tokens, otp_codes tables)
  ✓ Fastify backend project structure, Zod schemas, log scrubber middleware
  ✓ Argon2id password hashing utilities
  ✓ JWT generation and verification (RS256)
  ✓ Redis setup (OTP storage, rate limiting)
  ✓ SMS provider integration (Twilio + Coolsms)
  ✓ Next.js project structure, Tailwind CSS, design tokens
  ✓ next-intl i18n setup with all locale files

Milestone 2 — Auth System (Week 3–4):
  ✓ Signup API (all 5 steps)
  ✓ Login API + account lockout
  ✓ Token refresh API + rotation + theft detection
  ✓ Logout API
  ✓ Password reset flow (OTP + email link)
  ✓ Google OAuth flow
  ✓ Full signup page UI (5-step wizard with all validations)
  ✓ Login page UI

Milestone 3 — Core Pages (Week 5–6):
  ✓ Home page (hero + features + testimonials + CTA)
  ✓ Dashboard page
  ✓ Download page (with OS detection, all 3 platform cards)
  ✓ Account settings page (profile, security, preferences tabs)
  ✓ Cookie consent banner
  ✓ Navigation bar + footer (both states)

Milestone 4 — Account Management (Week 7):
  ✓ Session management (view + revoke sessions)
  ✓ Avatar upload + crop
  ✓ Username change (with rate limiting)
  ✓ Email verification flow
  ✓ Account deletion flow (with 30-day grace period)
  ✓ GDPR data export

Milestone 5 — Quality, Security, Polish (Week 8):
  ✓ Full E2E test suite (Playwright)
  ✓ WCAG 2.1 AA accessibility audit + fixes
  ✓ Security headers audit
  ✓ Performance optimization (Core Web Vitals)
  ✓ All locale files translated (work with native translators)
  ✓ Sentry integration
  ✓ Prometheus metrics + Grafana dashboards
  ✓ CI/CD pipeline (lint, test, build, deploy staging, manual gate, deploy production)

Milestone 6 — Launch Prep:
  ✓ Privacy Policy and Terms of Service (reviewed by legal counsel)
  ✓ HSTS preload submission
  ✓ CDN configuration (CloudFront / Cloudflare)
  ✓ Database backup verification (test PITR restore)
  ✓ Load testing (simulate 1000 concurrent users on auth endpoints)
  ✓ Penetration testing (or bug bounty program pre-launch)
  ✓ Status page setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 17 — CRITICAL IMPLEMENTATION REQUIREMENTS (NON-NEGOTIABLE HARD CONSTRAINTS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These requirements exist because AI-generated code frequently produces UI that LOOKS
correct but is fundamentally broken — placeholder logic, missing event handlers, skipped
validation, and fake authentication that accepts any input. Every single point below is
a hard constraint. Shipping code that violates any of these is shipping broken software.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
17.1 AUTHENTICATION MUST BE REAL — ZERO PLACEHOLDER LOGIC
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE: The login form MUST verify credentials against the real database.
Under no circumstances is the following acceptable:
  — Accepting ANY username/password combination as valid
  — Allowing login with empty fields
  — Bypassing auth when the login button is clicked without input
  — Hardcoded credentials ("admin"/"password" or similar)
  — A login function that always returns success
  — Commenting out the auth check with "// TODO: add real auth later"
  — if (true) { allowLogin() } or any equivalent
  — Returning a fake user object without querying the database
WHAT MUST HAPPEN on login form submit:
  1. Read the identifier field value. If empty → show error "Please enter your phone
     or email." Do NOT proceed. Do NOT call the API.
  2. Read the password field value. If empty → show error "Please enter your password."
     Do NOT proceed. Do NOT call the API.
  3. Validate identifier format client-side. If invalid format → show error. Do NOT proceed.
  4. Call POST /api/v1/auth/login with the real values.
  5. If the API returns an error → display the error message. Reject login.
  6. ONLY if the API returns HTTP 200 with a valid access_token → mark user as authenticated.
  7. Any other outcome → user is NOT logged in.
The login button click handler MUST look like this (pseudocode):
  onClick = async () => {
    if (!identifier || !password) { showValidationError(); return; }
    const result = await callRealLoginAPI(identifier, password);
    if (result.error) { showError(result.error); return; }
    if (result.access_token) { storeToken(result.access_token); redirectToDashboard(); }
  }
NEVER write:
  onClick = () => { redirectToDashboard(); }  // ← THIS IS FORBIDDEN
  onClick = () => { setLoggedIn(true); }       // ← THIS IS FORBIDDEN WITHOUT API CALL
17.2 ALL BUTTONS AND INTERACTIVE ELEMENTS MUST BE WIRED UP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE: Every visible button, link, and interactive element MUST have a working
event handler that does something real. There must be ZERO unconnected UI elements.
The following are NEVER acceptable in delivered code:
  — <Button onClick={() => {}} />                        (empty handler)
  — <Button onClick={() => console.log('clicked')} />    (console.log only)
  — <Button disabled />  without a documented reason and timeline to enable it
  — onClick={handleSubmit} where handleSubmit is not defined anywhere
  — A link with href="#" that does nothing
  — A form with no onSubmit handler
  — A component that renders inputs but never reads their values
EVERY button must be verified before delivery:
  Login button          → calls real auth API, handles success AND error
  Sign Up button        → navigates to signup flow, starts the 5-step wizard
  Continue with Google  → initiates real OAuth flow (see Section 2.4), not a no-op
  Forgot Password       → navigates to /auth/reset-password, shows the reset form
  Send OTP button       → calls real SMS API, shows OTP input on success
  Continue (each step)  → validates current step, advances to next step only if valid
  Back button           → returns to previous step, preserves form state
  Save buttons          → calls real PATCH API, shows success/error feedback
  Revoke session        → calls real DELETE API, removes row from UI
  Delete account        → opens confirmation modal, requires password + phrase
  All nav links         → navigate to the correct route
VERIFICATION REQUIREMENT: After implementing any page, the implementer MUST manually
click every interactive element and confirm it produces the correct behavior.
"It looks right" is not verification. Actually clicking it is verification.
17.3 PERSISTENT AUTHENTICATION — USERS MUST STAY LOGGED IN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE: A user who successfully logs in MUST remain logged in across:
  — App restarts
  — System reboots
  — Closing and reopening the application window
This is non-negotiable. Asking the user to log in every time they open the app
is broken behavior, not a feature.
HOW PERSISTENT AUTH WORKS (must be implemented exactly as follows):
On successful login:
  1. Receive access_token (15-min JWT) and refresh_token (opaque, 30–90 day) from API.
  2. Store the refresh_token in persistent storage:
     — Web browser: httpOnly cookie (already set by the server — verify the server
       IS setting the Set-Cookie header and the client is NOT stripping it)
     — Desktop app: OS keychain (macOS Keychain, Windows Credential Manager,
       Linux libsecret). NEVER store in a plain text file. NEVER store in
       localStorage. NEVER store in a config file on disk.
  3. Store the access_token in memory only (process memory / React state / Zustand).
     The access_token does NOT need to survive restarts — the refresh_token handles that.
On app startup / window open:
  1. Check if a refresh_token exists in persistent storage.
  2. If yes: call POST /api/v1/auth/refresh immediately (silent refresh).
     — Success: receive new access_token. User is logged in. Proceed to app.
     — Failure (token expired or revoked): clear stored refresh_token.
       Show login screen. This is the ONLY time the login screen should appear
       after a user has already logged in.
  3. If no refresh_token exists: show login screen.
The startup flow MUST NOT show the login screen to a user who has a valid
refresh_token stored. If this is happening, the bug is one of:
  a. The refresh_token is not being stored persistently (stored in memory only)
  b. The startup sequence is not calling /api/v1/auth/refresh before showing login
  c. The server is not setting the cookie correctly (check Set-Cookie response header)
  d. The stored token is being cleared on every app close (check storage mechanism)
Diagnose and fix whichever of the above is the cause. Do not ship until
a user can close and reopen the app and be immediately taken to the dashboard
without seeing the login screen.
Silent token refresh during active use:
  The access_token expires every 15 minutes. The app MUST silently refresh it:
  — Set a timer when the access_token is issued: refresh at 13 minutes
    (2 minutes before expiry — provides buffer for slow networks)
  — On any API call that returns HTTP 401 TOKEN_EXPIRED: immediately call
    /api/v1/auth/refresh, get a new access_token, retry the original request.
  — The user MUST NOT see a login screen or any interruption during this refresh.
  — If the refresh itself fails (refresh_token expired/revoked): clear credentials,
    show login screen with message "Your session expired. Please log in again."
17.4 FORM INPUTS MUST BE REAL — CONTROLLED AND READABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE: Every input field must be a controlled component. The value the user
types MUST be captured and MUST be sent to the API.
The following are NEVER acceptable:
  — An <input> field with no value prop and no onChange handler (uncontrolled, unread)
  — A form that sends empty strings to the API regardless of what the user typed
  — Sending hardcoded values instead of user input
  — A field that displays text but does not capture it for submission
Every input field MUST have:
  — A state variable or ref that captures the current value
  — An onChange handler that updates that state variable on every keystroke
  — The captured value used in the API call body on form submit
Example of CORRECT implementation:
  const [identifier, setIdentifier] = useState('');
  <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
  // On submit: fetch('/api/v1/auth/login', { body: JSON.stringify({ identifier }) })
Example of BROKEN implementation (never do this):
  <input placeholder="Phone or email" />
  // On submit: fetch('/api/v1/auth/login', { body: JSON.stringify({ identifier: '' }) })
17.5 ERROR STATES MUST BE VISIBLE AND INFORMATIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE: Every API call can fail. Every failure MUST be shown to the user.
Silent failures — where the API returns an error and nothing happens on screen — 
are broken behavior.
Every API call MUST handle:
  — Network failure (no connection): show "Network error. Check your connection."
  — HTTP 4xx (client error): show the user-friendly error message from the API response
  — HTTP 5xx (server error): show "Something went wrong. Please try again."
  — Timeout (>10 seconds with no response): show "Request timed out. Please try again."
Error display rules:
  — The error MUST appear on screen in a visible location near the relevant action.
  — The error MUST NOT be only in the browser console (console.error is not user feedback).
  — The error MUST NOT be silently swallowed by an empty catch block.
  — The loading state MUST be cleared when an error occurs (no infinite spinner).
NEVER write:
  try { await loginAPI() } catch (e) {}               // silent failure — FORBIDDEN
  try { await loginAPI() } catch (e) { console.log(e) } // console only — FORBIDDEN
ALWAYS write:
  try {
    await loginAPI()
  } catch (e) {
    setErrorMessage('Login failed. Please try again.');  // visible to user
    setIsLoading(false);                                  // clear loading state
  }
17.6 LOADING STATES MUST BE SHOWN AND CLEARED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every async action (API call) MUST:
  — Show a loading indicator (spinner, disabled button, "Loading..." text) immediately
    when the action starts
  — Disable the submit button during loading (prevents double-submission)
  — CLEAR the loading state when the action completes, whether success or failure
  — Never leave the UI in a permanent loading state
If a button click triggers an API call:
  — The button MUST show a spinner and become disabled immediately on click
  — The button MUST return to normal state after the API responds (success or error)
  — The user MUST be able to try again after a failed attempt
17.7 NAVIGATION MUST WORK
━━━━━━━━━━━━━━━━━━━━━━━━━
HARD RULE: Every navigation action must result in the correct screen appearing.
After login success: user MUST see the dashboard. Not the login screen again.
After signup success: user MUST see the dashboard. Not the signup screen again.
After logout: user MUST see the home/login screen. Not the dashboard.
Back button on multi-step forms: MUST go back one step. Not crash. Not go to home.
All nav links: MUST navigate to the correct route when clicked.
Route protection MUST be implemented:
  — Visiting /dashboard without being logged in: redirect to /auth/login
  — Visiting /auth/login while already logged in: redirect to /dashboard
  — These redirects must happen automatically, not manually by the user
17.8 PRE-DELIVERY SELF-CHECK (MANDATORY BEFORE SUBMITTING CODE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before delivering any implementation, the implementer MUST verify each item:
AUTH CHECKS:
  [ ] Clicking login with empty fields → shows validation error, does NOT log in
  [ ] Clicking login with wrong password → shows error, does NOT log in  
  [ ] Clicking login with correct credentials → logs in, goes to dashboard
  [ ] Closing the app and reopening → user is still logged in (no login screen)
  [ ] Waiting 15 minutes while logged in → session silently refreshes, no interruption
  [ ] Logout → clears session, login screen appears, dashboard is inaccessible
BUTTON CHECKS:
  [ ] Every button on every screen has been physically clicked during testing
  [ ] No button produces no visible response when clicked
  [ ] No button navigates to the wrong screen
  [ ] No button throws an unhandled error
FORM CHECKS:
  [ ] Every input field captures what the user types
  [ ] Submitting a form sends the actual typed values to the API
  [ ] Submitting an empty required field shows a validation error
ERROR CHECKS:
  [ ] Disconnecting the network and trying to log in shows a visible error
  [ ] API errors are displayed on screen (not just in the console)
  [ ] No action leaves the UI in a permanent loading/spinner state
If ANY item above is not checked, the implementation is not complete.
Do not submit. Fix the failing items first.━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 18 — UNIFIED DATABASE AUTHENTICATION CONTRACT: WEB PLATFORM ↔ DESKTOP APPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This part documents the COMPLETE database-level authentication contract shared between
the SyncSanctuary web platform and the SyncSanctuary desktop application. Every rule
defined here is a HARD CONSTRAINT that overrides any component-level assumption.
The core principle: there is ONE users table, ONE refresh_tokens table, and ONE auth API.
The web browser and the desktop application are two different clients of the same
identity system. Neither is "primary". Both must behave identically with respect to
database state and token lifecycle.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.1 SINGLE SOURCE OF TRUTH — THE DATABASE IS THE AUTHORITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The PostgreSQL database is the only source of truth for all of the following. The web
platform and desktop application MUST NOT maintain independent authoritative copies of
any of these values:
— Whether a user account exists and is active (users.is_active)
— Whether a user's phone is verified (users.phone_verified)
— Whether a user's email is verified (users.email_verified)
— The user's current password hash (users.password_hash)
— The user's current role (users.role)
— The user's preferred language (users.language)
— Whether a refresh token is valid, expired, or revoked (refresh_tokens.revoked,
refresh_tokens.expires_at)
— Whether the account is locked (users.locked_until)
— Whether the account is pending deletion (users.deleted_at,
users.deletion_requested_at)
— The user's current avatar URL (users.avatar_url)
— The user's current username (users.username)
CONSEQUENCE: If the desktop application caches any of these values locally (in its
own SQLite, config file, or process memory) and serves that cache as truth rather than
re-verifying against the API, it is WRONG. The ONLY value the desktop may cache without
re-verification is the access token JWT (which has a 15-minute TTL and is cryptographically
self-validating). All other state must be fetched from the API.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.2 SHARED DATABASE TABLES — COLUMN-LEVEL OWNERSHIP RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following table defines, for every column in the shared tables, which client(s)
may write to it (via the API), which may read it, and what happens when a write
from one client must be reflected in the other.
18.2.1 users Table — Column Ownership
Column                    Writer(s)            Readers        Cross-client sync rule
───────────────────────── ──────────────────── ────────────── ────────────────────────────────────────────────────────
id                        DB only (gen)        Both           Immutable. Never changes.
username                  Web, Desktop         Both           Change by either client → JWT payload updates on next
token refresh. Desktop reads new username from the
refreshed access token's "username" claim.
phone_number              Web only (signup,    Both           Desktop cannot change phone. If phone changes on web,
phone change flow)                  desktop learns of it from the next GET /account/profile
call, not from the token.
email                     Web only             Both           Same as phone_number.
password_hash             Web, Desktop         API only       Change by either → all refresh tokens revoked for user.
(via change-                        The other client's next token refresh attempt will
password endpoint)                  receive HTTP 401 TOKEN_REVOKED and must re-authenticate.
google_id                 Web only             API only       Desktop cannot initiate Google linking directly.
phone_verified            API only (internal   Both           Read-only to both clients. Set by OTP verification flow.
to signup/verify)
email_verified            API only (internal   Both           Read-only to both clients. Set by email link click.
avatar_url                Web, Desktop         Both           Change by either → other client sees new URL on next
(via avatar upload)                 GET /account/profile call. No active push.
language                  Web, Desktop         Both           Change by either → stored in DB. Each client should
re-read on startup and on PATCH /account/preferences
response. Desktop locale files must match web locale
keys exactly (shared /messages/{locale}.json).
country_code              API only (signup)    API only       Derived from phone number. Neither client writes this
after account creation.
created_at                DB only              Both           Immutable.
updated_at                DB trigger           Both           Automatically updated by the set_updated_at() trigger
on every UPDATE. Neither client writes this directly.
last_login_at             API only (login      API only       Updated on every POST /auth/login success and every
handler)                            Google OAuth callback, regardless of which client
triggered the login.
last_active_at            API only (debounced  API only       Updated at most once per 5 minutes per authenticated
request middleware)                  request. Both clients' API calls contribute to this.
is_active                 API only (admin,     Both           If set to FALSE (suspension or deletion), the next
deletion flow)                      POST /auth/refresh for any client returns HTTP 401
USER_INACTIVE. Both clients must handle this by
clearing credentials and showing the login screen.
deleted_at                API only             API only       Set by POST /account/delete. During grace period, the
refresh token remains valid — the user can cancel
deletion by logging back in from either client.
deletion_requested_at     API only             API only       Same as deleted_at.
role                      Admin API only       Both           Included in JWT payload. Both clients read from token.
Role change → old access tokens still valid until 15min
expiry. New role effective on next token refresh.
login_attempt_count       API only (login      API only       Shared across clients. 5 failed attempts from the
handler)                            desktop counts toward the account lockout just as
web failures do.
locked_until              API only             Both           If account is locked, POST /auth/refresh still works
(locking only prevents password login, not token
refresh). POST /auth/login returns HTTP 423 while
locked, from both clients.
two_factor_enabled        API only (Phase 2)   Both           Phase 2. Both clients must respect this flag.
two_factor_secret         API only (Phase 2)   API only       Never exposed to clients directly.
preferences               Web, Desktop         Both           JSON blob. PATCH /account/preferences merges, not
replaces. Desktop reads this on startup. Concurrent
writes from both clients: last-write-wins per field.
Recommended structure:
{"theme": "dark",
"notification_email": true,
"notification_sms": false,
"desktop_auto_update": true,
"desktop_hardware_acceleration": true,
"web_marketing_emails": false
}Keys prefixed "desktop_" are ignored by the web
platform. Keys prefixed "web_" are ignored by the
desktop. Shared keys (theme, language, notifications)
are respected by both.
18.2.2 refresh_tokens Table — Cross-Client Rules
Every row in refresh_tokens identifies its originating client via the client_type column.
The following rules apply regardless of which client created a given token:
RULE 1 — Global revocation propagates instantly to all clients.
When POST /account/delete, POST /auth/logout { all_devices: true },
or POST /account/change-password is called from ANY client, ALL refresh tokens for
that user are revoked regardless of client_type. This means:
— A user changes their password on the web → desktop refresh token is revoked →
desktop app's next POST /auth/refresh returns HTTP 401 TOKEN_REVOKED →
desktop must clear keychain and show login screen.
— A user uses "Revoke all other sessions" on the web → all desktop tokens revoked.
— An admin revokes all sessions from the admin panel → web and desktop both logged out.
RULE 2 — Theft detection is global.
If a revoked refresh token is presented by either client, ALL tokens for that user
are immediately revoked across all clients, and a security alert is sent. The user
must re-authenticate on all clients after a theft event.
RULE 3 — Session list shows all client types together.
GET /api/v1/account/sessions returns ALL non-expired, non-revoked refresh tokens
for the user, regardless of client_type. The web account settings page shows desktop
sessions alongside browser sessions. Users can revoke individual desktop sessions
from the web, and vice versa (if a future desktop account page is built).
RULE 4 — Token expiry differs by client type but shares the same table.
web sessions:     expires_at = created_at + 30 days
(or + 24 hours if remember_device = false at login)
desktop sessions: expires_at = created_at + 90 days
Both rows live in the same refresh_tokens table. The cleanup job at midnight UTC
deletes expired tokens regardless of client_type:
DELETE FROM refresh_tokens
WHERE expires_at < NOW() AND revoked = FALSE;
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.3 LOGIN FLOW — EXACT DATABASE STATE TRANSITIONS (BOTH CLIENTS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following state machine applies IDENTICALLY to the web login form (POST /auth/login
from a browser) and the desktop login form (POST /auth/login with client_type: "desktop").
The database transitions are the same regardless of which client initiated the login.
STATE 1: Pre-login (database state before the login attempt)
users row:
is_active        = TRUE
login_attempt_count >= 0 (any value)
locked_until     = NULL or a past timestamp
password_hash    = Argon2id hash (non-null for password accounts)
STATE 2: Successful login
Database writes (all in a single UPDATE, no transaction required for this step):
users.last_login_at          = NOW()
users.login_attempt_count    = 0
users.locked_until           = NULL
users.failed_attempts_reset_at = NULL
New row inserted into refresh_tokens:
id            = gen_random_uuid()
token_hash    = SHA-256(raw_refresh_token_hex)
user_id       = users.id
created_at    = NOW()
expires_at    = NOW() + INTERVAL '30 days'   (web, remember_device = true)
= NOW() + INTERVAL '1 day'     (web, remember_device = false)
= NOW() + INTERVAL '90 days'   (desktop)
last_used_at  = NULL
ip_address    = <client IP>
user_agent    = <User-Agent header, truncated to 512 chars>
device_name   = <derived from User-Agent: "Chrome 120 on macOS" or "SyncSanctuary Desktop 1.2.3 on Windows">
client_type   = "web" | "desktop" | "mobile_ios" | "mobile_android"
revoked       = FALSE
revoked_at    = NULL
revoked_reason = NULL
Audit log row inserted:
event_type    = 'login_success'
user_id       = users.id
ip_address    = <client IP>
user_agent    = <User-Agent>
metadata      = { "client_type": "web" | "desktop" }
STATE 3: Failed login (wrong password)
Database writes:
IF users.failed_attempts_reset_at IS NULL
OR users.failed_attempts_reset_at < NOW() - INTERVAL '15 minutes':
— This is the start of a new attempt window:
users.login_attempt_count     = 1
users.failed_attempts_reset_at = NOW()
ELSE:
— Still within the 15-minute window:
users.login_attempt_count     = login_attempt_count + 1
(failed_attempts_reset_at is NOT updated — it marks the window START)
IF users.login_attempt_count >= 5:
  users.locked_until             = NOW() + INTERVAL '15 minutes'
  users.login_attempt_count      = 0
  users.failed_attempts_reset_at = NULL
  — Send security alert to verified phone/email.
  — Insert audit log: event_type = 'account_locked'
No refresh token is inserted. No access token is issued.
Audit log row inserted:
event_type    = 'login_failure'
metadata      = { "reason": "wrong_password", "client_type": "web" | "desktop",
"attempt_count": <new login_attempt_count value> }
STATE 4: Login blocked (account locked)
No database writes.
Response: HTTP 423 ACCOUNT_LOCKED.
Both clients must display: "Account temporarily locked. Try again in {N} minutes."
Both clients must show a countdown timer derived from users.locked_until.
Neither client should auto-retry; the user must wait.
NOTE ON CROSS-CLIENT LOCKOUT:
A user who triggers lockout via 5 failed attempts on the desktop is also locked out
on the web, and vice versa. The lockout is per-account, not per-client. The locked_until
value in the users table is shared. This is intentional: it prevents brute-force attacks
that rotate between web and desktop to double the attempt count.
STATE 5: Account suspended or deleted (is_active = FALSE)
The API checks is_active BEFORE checking the password. This means:
— A suspended user cannot login from either client.
— A user in the 30-day deletion grace period has is_active = FALSE.
Their refresh tokens WERE revoked at deletion request time.
Therefore their next token refresh attempt fails with HTTP 401 USER_INACTIVE.
The desktop must clear its keychain entry and show the login screen with:
"Your account is scheduled for deletion. Log in to cancel."
— On the web login page: the error message "This account is scheduled for deletion.
Log in with your original credentials to restore access and cancel deletion."
This is intentionally different from a suspended account message; users must
understand they CAN recover by logging in.
IMPORTANT EXCEPTION: During the 30-day deletion grace period, the login endpoint
still processes valid password login attempts (is_active = FALSE does NOT block login
for accounts in the grace period — ONLY the refresh path is blocked). On successful
password login during grace period:
1. Set users.is_active = TRUE (restore access).
2. Clear users.deletion_requested_at, users.deleted_at.
3. Proceed with normal STATE 2 database writes.
4. Return HTTP 200 with access token AND a special flag:
{ "access_token": "...", "user": {...}, "account_restored": true }
5. Both clients must show a prominent notice: "Welcome back! Your account deletion
has been cancelled."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.4 SIGNUP FLOW — CROSS-CLIENT DATABASE CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Signup can only be initiated from the web platform (the desktop app links to the web
signup flow — it does not have its own signup form). However, the following database
constraints affect both clients after signup completes.
18.4.1 Race Condition Protection — Uniqueness Re-Checks
The POST /auth/signup/create-account endpoint re-checks all uniqueness constraints
inside a database transaction immediately before the INSERT. This protects against:
— Two users signing up with the same phone number simultaneously (one from the web
and one from a shared device where someone else had the app open).
— A username that was available during Step 3 but taken in the milliseconds before
Step 5 submission.
The re-check queries run inside a SERIALIZABLE transaction:
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT 1 FROM users WHERE phone_number = $1 FOR UPDATE;  -- locks the row if found
SELECT 1 FROM users WHERE email = $2 FOR UPDATE;
SELECT 1 FROM users WHERE lower(username) = lower($3) FOR UPDATE;
-- If any SELECT returns a row: ROLLBACK; return appropriate 409 error.
-- If all SELECTs return nothing: INSERT ... COMMIT.
18.4.2 Phone Number Uniqueness — E.164 Normalization Before Write
Before ANY database read or write involving phone_number, normalize to E.164 using
libphonenumber-js (server-side). This ensures that "+82 10-1234-5678", "010-1234-5678",
and "+821012345678" are all stored and looked up as "+821012345678".
The normalization happens:
In POST /auth/signup/send-otp (before the rate limit check)
In POST /auth/login (before the user lookup)
In POST /auth/password-reset/request (before the user lookup)
In any account/phone-change flow (before OTP send)
It NEVER happens client-side as the final value — client-side normalization is for UX
display only. The server always re-normalizes regardless.
18.4.3 Username Case Sensitivity in the Database
Usernames are stored in their original case (users.username preserves "PastorKim").
However, uniqueness checks always use lower():
SELECT 1 FROM users WHERE lower(username) = lower($1)
The index idx_users_username_lower uses the expression lower(username) for this purpose.
This means "pastorkim" and "PastorKim" cannot both exist. The stored value uses the
case the user typed at signup; all lookups are case-insensitive.
Desktop app consequences:
— The desktop must display usernames in their original stored case (from the JWT
"username" claim or from GET /account/profile).
— The desktop must NOT lowercase usernames for display.
— If the desktop has any username search or lookup feature, it must query the API
(which applies lower() server-side) rather than performing a client-side string
comparison.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.5 SESSION MANAGEMENT — COMPLETE LIFECYCLE ACROSS BOTH CLIENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.5.1 Token Refresh — Shared Logic
The POST /api/v1/auth/refresh endpoint is called by both clients whenever the access
token needs to be renewed. The endpoint behavior is identical; only the token delivery
mechanism differs (cookie vs. Authorization header). The database writes are the same:
On every successful refresh:
1. Old token row: UPDATE refresh_tokens SET
revoked        = TRUE,
revoked_at     = NOW(),
revoked_reason = 'rotation'
WHERE id = <old_token_id>
2. New token row: INSERT INTO refresh_tokens (
     token_hash, user_id, created_at, expires_at, last_used_at, ip_address,
     user_agent, device_name, client_type, revoked
   ) VALUES (
     SHA-256(new_raw_token), user_id, NOW(),
     <same expires_at as the old token — expiry does NOT reset on rotation>,
     NOW(),
     <current request IP>,
     <current User-Agent>,
     <derived device name>,
     <same client_type as old token>,
     FALSE
   )
CRITICAL: expires_at is inherited from the old token, NOT recalculated from NOW().
This is intentional. Token rotation should not extend the session beyond its original
lifetime. A 30-day session that was created 25 days ago and has been rotating
continuously still expires in 5 days, not in 30 more days.
last_used_at on the new row is set to NOW() at creation time. It is also updated
on every subsequent successful refresh where this token is the old token being rotated.
This provides accurate "last active" timestamps for the session list UI.
18.5.2 Session Display — What Both Clients See
GET /api/v1/account/sessions returns all non-revoked, non-expired tokens:
SELECT
id,
created_at,
expires_at,
last_used_at,
ip_address,
user_agent,
device_name,
client_type,
revoked
FROM refresh_tokens
WHERE user_id = $1
AND revoked = FALSE
AND expires_at > NOW()
ORDER BY last_used_at DESC NULLS LAST;
The response includes sessions from ALL client types. The web account settings UI
must render appropriate icons per client_type:
client_type = 'web'           → browser icon (e.g. chrome/firefox/safari)
client_type = 'desktop'       → desktop computer icon
client_type = 'mobile_ios'    → iPhone icon
client_type = 'mobile_android' → Android icon
The device_name field is the human-readable label. It is constructed at login time from
the User-Agent string. Examples:
Web login from Chrome:         "Chrome 120 on macOS"
Web login from Firefox:        "Firefox 121 on Windows"
Desktop login:                 "SyncSanctuary Desktop 1.2.3 on Windows"
Desktop login:                 "SyncSanctuary Desktop 1.3.0 on macOS"
For desktop client_type rows, the device_name is constructed by the server from the
X-Client-Version and X-Client-Platform headers that the desktop app sends with every
request (see Section 15.5).
18.5.3 Current Session Identification
The "current session" badge in the session list (both web and any future desktop
session management UI) is determined by matching the current refresh token's id
against the sessions list. The server must include the current session's token id
in the GET /account/sessions response:
Response shape:
{"sessions": [
{"id": "uuid",
"device_name": "Chrome 120 on macOS",
"client_type": "web",
"ip_address": "192.168.x.x",
"created_at": "ISO8601",
"last_used_at": "ISO8601",
"expires_at": "ISO8601",
"is_current": true   ← server computes this by comparing against the
},                         refresh token used to authenticate this request
{"id": "uuid",
"device_name": "SyncSanctuary Desktop 1.2.3 on Windows",
"client_type": "desktop",
...
"is_current": false
}],
"total": 2
}The server computes is_current by reading the refresh token from the request's cookie
(web) or Authorization header (desktop), hashing it, and comparing the hash to each
row's token_hash field. The row that matches has is_current = true.
18.5.4 Session Revocation — Cross-Client Authorization
A user can revoke any session from any client. Authorization rules:
DELETE /api/v1/auth/sessions/{token_id}
Server checks:
Authenticate the request (valid access token required).
Fetch the target session: SELECT user_id FROM refresh_tokens WHERE id = $token_id
Verify user_id matches the authenticated user's user_id.
If not: HTTP 403 FORBIDDEN (prevents user A from revoking user B's session).
Revoke:
UPDATE refresh_tokens SET
revoked        = TRUE,
revoked_at     = NOW(),
revoked_reason = 'logout'
WHERE id = $token_id
If the revoked token is the CURRENT session (is_current = true):
— Also clear the ss_refresh_token cookie in the response.
— Return HTTP 200 { "success": true, "current_session_revoked": true }
— The client (web or desktop) must handle "current_session_revoked": true
by clearing local credentials and redirecting to the login screen.
Audit log: event_type = 'session_revoked',
metadata = { "revoked_token_id": "uuid", "client_type": "web|desktop",
"revoked_by_client": "web|desktop" }
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.6 PASSWORD OPERATIONS — CROSS-CLIENT DATABASE IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.6.1 Password Change (POST /api/v1/account/change-password)
Can be called from the web account settings page or from a future desktop settings
panel. The database impact is the same regardless of caller.
Database writes (all in a single transaction):
Verify current_password against users.password_hash (Argon2id verify).
If mismatch: HTTP 401 INVALID_CURRENT_PASSWORD. No writes. Return.
Hash new_password with Argon2id (current parameters).
UPDATE users SET password_hash = $new_hash WHERE id = $user_id
Revoke all refresh tokens EXCEPT the one used to authenticate this request:
UPDATE refresh_tokens SET
revoked        = TRUE,
revoked_at     = NOW(),
revoked_reason = 'password_change'
WHERE user_id = $user_id
AND revoked = FALSE
AND token_hash != $current_token_hash
Audit log: event_type = 'password_change', metadata = { "initiated_by": "web|desktop" }
Send security notification email/SMS: "Your password was changed. If this wasn't
you, contact support immediately and reset your password."
Return HTTP 200 { "success": true }
NOTE: The current client's session is preserved (only OTHER sessions are revoked).
This is intentional — the user who just changed their password stays logged in.
All other devices (web tabs, desktop app, other browsers) will be logged out on
their next token refresh attempt.
18.6.2 Argon2id Parameters — Must Be Identical Across Both Clients
Both the web API and the desktop application authenticate passwords via the same
POST /api/v1/auth/login endpoint. The Argon2id parameters are configured on the SERVER
only — neither client performs Argon2id hashing directly (the client sends the plaintext
password over TLS; the server hashes it). This ensures no parameter divergence.
The Argon2id parameters (on the server, used for both web and desktop logins):
type:        Argon2id
memory:      65536 KB (64 MB)
iterations:  3
parallelism: 4
hash_length: 32 bytes
salt_length: 16 bytes (randomly generated per hash)
Password re-hashing policy applies to logins from both clients:
On every successful login (password path, not Google OAuth), the server compares
the stored hash's parameters against the current parameters. If different, re-hash
with current parameters and update users.password_hash. This is invisible to the
client. Both web and desktop login flows benefit from this automatic upgrade.
18.6.3 Password Reset — Desktop Handling
The password reset flow is initiated via the web (POST /auth/password-reset/request).
The reset link/OTP is delivered to the user's phone or email. The final reset step
(POST /auth/password-reset/complete) can be completed from any browser.
After reset completes:
— ALL refresh tokens for the user are revoked (including any desktop tokens).
— The desktop app's next POST /auth/refresh returns HTTP 401 TOKEN_REVOKED.
— Desktop must clear the OS keychain entry and show the login screen with:
"Your password was recently changed. Please log in again."
— The desktop does NOT provide its own password reset flow. It must direct users
to the web platform: "Visit syncsanctuary.app to reset your password."
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.7 ACCOUNT DELETION — CROSS-CLIENT GRACE PERIOD BEHAVIOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Account deletion can only be initiated from the web platform (Danger Zone tab in account
settings). The desktop app must handle all the resulting database state changes.
18.7.1 What Happens in the Database on Deletion Request
POST /api/v1/account/delete triggers the following writes (inside a transaction):
UPDATE users SET
is_active              = FALSE,
deletion_requested_at  = NOW()
WHERE id = $user_id
UPDATE refresh_tokens SET
revoked        = TRUE,
revoked_at     = NOW(),
revoked_reason = 'user_deletion'
WHERE user_id = $user_id AND revoked = FALSE
INSERT INTO audit_log (event_type = 'account_deletion_requested', ...)
Schedule a background job: 30 days from now, if is_active is still FALSE and
deletion_requested_at is still set, run the hard deletion:
a. DELETE all rows from refresh_tokens WHERE user_id = $user_id
b. DELETE all rows from email_verification_tokens WHERE user_id = $user_id
c. DELETE all rows from password_reset_tokens WHERE user_id = $user_id
d. UPDATE users SET
username               = 'deleted_' || substring(id::text, 1, 8),
phone_number           = 'DELETED_' || id::text,
email                  = NULL,
password_hash          = NULL,
google_id              = NULL,
avatar_url             = NULL,
deleted_at             = NOW()
WHERE id = $user_id
(The row is kept for referential integrity with audit_log; all PII is nullified.)
18.7.2 Desktop App Behavior During Deletion Grace Period
The desktop app's current refresh token was revoked in step 2 above. On the next
attempt to refresh (background refresh timer or app restart):
POST /auth/refresh → HTTP 401 USER_INACTIVE (because is_active = FALSE)
Desktop must:
Clear the refresh token from OS keychain.
Clear the access token from process memory.
Show a login screen with the specific message:
"Your account is scheduled for deletion. Log in with your password to cancel."
NOT show a generic "session expired" message — the user needs to understand
they can cancel deletion.
If the user logs in via the desktop login form during the grace period:
The POST /auth/login endpoint detects deletion_requested_at IS NOT NULL AND
is_active = FALSE and enters the grace period restoration flow (see Section 18.3,
STATE 5). The desktop must handle the "account_restored": true flag and show:
"Your account has been restored. The scheduled deletion has been cancelled."
18.7.3 Hard Deletion — Desktop Cleanup Obligation
After the 30-day grace period, the background job runs the hard deletion (step 4 above).
At this point, the user's account is permanently destroyed at the database level. If
the user attempts to log in from a desktop app that still has their old credentials
cached (which should not happen — the credentials were cleared in Section 18.7.2 — but
as a defense-in-depth check):
POST /auth/login → HTTP 401 INVALID_CREDENTIALS
(because the phone_number no longer matches any is_active account — the row exists
but the phone has been replaced with 'DELETED_' + uuid, which no user would enter)
The desktop app handles this the same as any other INVALID_CREDENTIALS response.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.8 AUDIT LOG — SHARED EVENT TAXONOMY FOR BOTH CLIENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The audit_log table receives events from both web and desktop clients via the same API.
The metadata.client_type field distinguishes the source.
Complete event taxonomy (all values for the event_type column, with the clients that
can produce each event):
Event Type                      Web   Desktop  Description
──────────────────────────────  ───   ───────  ──────────────────────────────────────────────
login_success                   Yes   Yes      Successful password or Google login
login_failure                   Yes   Yes      Wrong password or identifier not found
login_blocked_locked            Yes   Yes      Login attempted while account is locked
logout                          Yes   Yes      Single session logout
all_sessions_revoked            Yes   Yes      Logout from all devices
signup                          Yes   No       New account created (web only)
google_oauth_linked             Yes   Yes*     Google account linked to existing account
(desktop via web OAuth redirect flow)
google_oauth_unlinked           Yes   No       Google account removed from profile (web only)
password_change                 Yes   Yes*    Password changed via account settings
(future — desktop settings page)
password_reset_request          Yes   No       Password reset requested (web only, desktop
directs to web)
password_reset_complete         Yes   No       Password reset completed (web only)
email_verified                  Yes   No       Email address verified via link (web only)
phone_verified                  Yes   No       Phone OTP verified during signup (web only)
session_revoked                 Yes   Yes      A specific session was revoked
account_locked                  Yes   Yes      Account locked after 5 failed attempts
account_unlocked                Auto  Auto     Account auto-unlocked after 15 min (no client,
set when locked_until < NOW() on next login)
avatar_uploaded                 Yes   No       New avatar uploaded (web only currently)
username_changed                Yes   Yes    Username changed via profile settings
account_deletion_requested      Yes   No       User initiated account deletion (web only)
account_deletion_cancelled      Yes   Yes      User cancelled deletion during grace period
(web button or desktop login during grace period)
account_deleted                 Auto  Auto     Hard deletion by background job (no client)
role_changed                    Admin Admin    Admin changed user's role
admin_action                    Admin Admin    Generic admin action
PRIVACY RULE FOR audit_log.metadata:
NEVER store the following in the metadata JSON field:
— Plaintext phone numbers (use user_id to reference the user instead)
— Plaintext email addresses
— Passwords or password hashes
— Refresh tokens or access tokens
— OTP codes
ALLOWED in metadata:
— client_type: "web" | "desktop"
— session token IDs (UUID of the refresh_tokens.id — not the token itself)
— Reason strings from the pre-defined vocabulary
— Version strings (e.g. "desktop_version": "1.2.3")
— Platform strings (e.g. "platform": "windows")
— Boolean flags (e.g. "account_restored": true)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.9 DATABASE MIGRATION POLICY — SHARED TABLE CHANGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Because both the web platform and the desktop application depend on the shared tables
(users, refresh_tokens, otp_codes, audit_log, and others), any schema migration to
these tables MUST follow an expanded safety protocol beyond the rules in Section 9.3.
RULE 1 — Both application codebases must be updated in a single coordinated release.
A migration that adds a new column to users must be paired with:
a. A web platform release that reads/writes the new column.
b. A desktop application release that ignores or handles the new column gracefully.
Both must be deployed within the same release window. A migration that leaves either
application incompatible for more than a few minutes is unacceptable.
RULE 2 — Backward-compatible migrations only.
New columns must be NULLABLE or have a DEFAULT, so that old application code
(deployed before the migration runs) does not break when inserting rows.
Example (CORRECT):
ALTER TABLE users ADD COLUMN inactivity_warning_sent_at TIMESTAMPTZ;
Example (WRONG — breaks existing INSERTs that don't include this column):
ALTER TABLE users ADD COLUMN inactivity_warning_sent_at TIMESTAMPTZ NOT NULL;
RULE 3 — Column renames follow the 3-phase pattern described in Section 9.3.
Phase 1: Add new column (nullable). Deploy web + desktop code that writes BOTH
old and new columns.
Phase 2: Backfill new column from old column data.
Phase 3: Remove old column. Deploy web + desktop code that reads/writes ONLY new column.
RULE 4 — The JWKS endpoint content must remain stable across migrations.
Adding new columns to users does NOT change the JWT payload structure. The JWT
payload claims (sub, username, role, client_type, iat, exp, jti) are fixed.
To add a new claim to the JWT payload, a full key rotation procedure (Section 8.6)
must be followed so old tokens (with the old payload structure) are still valid
until they expire naturally.
RULE 5 — The refresh_tokens table schema is considered frozen for Phase 1.
No columns are to be added to refresh_tokens without a full cross-team review.
The schema as defined in Section 1.2 is the production schema. New session metadata
should be stored in the users.preferences JSONB field or a new separate table, not
as additional columns on refresh_tokens.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.10 CROSS-CLIENT TESTING REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following test scenarios MUST be run against staging before every production
release that touches auth, account, or shared database tables. Each scenario verifies
that the web platform and desktop application remain consistent at the database level.
SCENARIO 1 — Password change propagates to desktop logout
Pre-condition: User is logged in on both web (browser) and desktop (app).
Action: User changes password from the web account settings page.
Expected web behavior: Web session is preserved. Success toast shown.
Expected desktop behavior: Within 15 minutes (next background refresh attempt),
the desktop receives HTTP 401 TOKEN_REVOKED. Keychain is cleared. Login screen
appears with "Your password was changed. Please log in again."
Database verification:
SELECT COUNT(*) FROM refresh_tokens WHERE user_id = $user_id AND revoked = FALSE;
Expected: 1 (only the web session that initiated the change)
SCENARIO 2 — Session revoked from web affects desktop
Pre-condition: User has an active desktop session visible in web account → Security tab.
Action: User clicks "Revoke" on the desktop session row in the web session list.
Expected web behavior: The row disappears from the sessions list immediately.
Expected desktop behavior: Next POST /auth/refresh returns HTTP 401 TOKEN_REVOKED.
Desktop clears keychain and shows login screen.
Database verification:
SELECT revoked, revoked_reason FROM refresh_tokens WHERE id = $desktop_token_id;
Expected: revoked = TRUE, revoked_reason = 'logout'
SCENARIO 3 — Account deletion during active desktop session
Pre-condition: User has active desktop session.
Action: User initiates account deletion from the web Danger Zone tab.
Expected desktop behavior: Within 15 minutes (next refresh attempt), desktop receives
HTTP 401 USER_INACTIVE. Desktop clears keychain and shows login screen with
"Your account is scheduled for deletion" message.
Database verification:
SELECT is_active, deletion_requested_at FROM users WHERE id = $user_id;
Expected: is_active = FALSE, deletion_requested_at IS NOT NULL
SELECT COUNT(*) FROM refresh_tokens WHERE user_id = $user_id AND revoked = FALSE;
Expected: 0
SCENARIO 4 — Grace period cancellation from desktop
Pre-condition: User's account is in the 30-day deletion grace period. Desktop shows
the "scheduled for deletion" login screen.
Action: User logs in from the desktop login form with correct credentials.
Expected desktop behavior: Login succeeds. User sees "Your account has been restored"
notice. Dashboard appears.
Database verification:
SELECT is_active, deletion_requested_at FROM users WHERE id = $user_id;
Expected: is_active = TRUE, deletion_requested_at = NULL
SELECT COUNT(*) FROM refresh_tokens WHERE user_id = $user_id AND revoked = FALSE;
Expected: 1 (new desktop session created by the login)
SCENARIO 5 — Simultaneous login from web and desktop
Action: User logs in from the web browser and the desktop app within the same second.
Expected behavior: Both logins succeed. Two separate rows in refresh_tokens, each
with their own token_hash and client_type.
Database verification:
SELECT client_type, created_at FROM refresh_tokens
WHERE user_id = $user_id AND revoked = FALSE
ORDER BY created_at DESC LIMIT 2;
Expected: one row with client_type = 'web', one with client_type = 'desktop'
Both should have different token_hash values.
SCENARIO 6 — Theft detection fires globally
Pre-condition: Attacker has obtained and used a refresh token (e.g. via a hypothetical
server-side breach). The token has been rotated and the old token is now marked revoked.
Action: The old (revoked) token is replayed against POST /auth/refresh.
Expected behavior: ALL refresh tokens for the user are revoked. Security alert sent.
HTTP 401 TOKEN_THEFT_DETECTED returned.
Expected cross-client behavior: Both web and desktop sessions are immediately
terminated. Both clients' next request fails with 401.
Database verification:
SELECT COUNT(*) FROM refresh_tokens WHERE user_id = $user_id AND revoked = FALSE;
Expected: 0
SELECT revoked_reason FROM refresh_tokens WHERE user_id = $user_id;
Expected: ALL rows have revoked_reason = 'theft_detected'
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
18.11 QUICK REFERENCE — HTTP STATUS CODE HANDLING BY BOTH CLIENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Both the web platform and the desktop application must handle every auth-related HTTP
status code identically in terms of database-affecting behavior. The UI response may
differ (a toast vs. a native dialog) but the credential clearing behavior must not.
HTTP Status  Error Code              Web Behavior                   Desktop Behavior
───────────  ──────────────────────  ─────────────────────────────  ────────────────────────────────────────
200          (success)               Proceed normally               Proceed normally
201          (created)               User created, redirect to dash N/A (signup is web-only)
400          INVALID_IDENTIFIER      Show inline field error        Show inline field error
400          INVALID_PHONE_FORMAT    Show inline field error        Show inline field error
400          OTP_INVALID             Show OTP error, decrement UI   N/A (OTP is web-only flow)
401          INVALID_CREDENTIALS     Show error banner, no logout   Show error dialog, no logout
401          TOKEN_EXPIRED           Silent refresh, retry request  Silent refresh, retry request
401          TOKEN_REVOKED           Clear cookie, show login        Clear keychain, show login
401          TOKEN_THEFT_DETECTED    Clear cookie, show login +      Clear keychain, show login +
"Security alert" message        "Security alert" message
401          REFRESH_TOKEN_EXPIRED   Clear cookie, show login        Clear keychain, show login
401          USER_INACTIVE           Clear cookie, show login with   Clear keychain, show login with
deletion-specific message       deletion-specific message
401          ACCOUNT_DELETED         Clear cookie, show home page   Clear keychain, show login
401          NO_PASSWORD_SET         Show "use Google" message      Show "use Google to log in" message
403          FORBIDDEN               Show "access denied" message   Show "access denied" dialog
409          PHONE_ALREADY_EXISTS    Show field error               N/A
409          EMAIL_ALREADY_EXISTS    Show field error               N/A
409          USERNAME_TAKEN          Show field error               N/A
422          VALIDATION_ERROR        Show field-level errors        Show field-level errors
423          ACCOUNT_LOCKED          Show countdown banner          Show countdown dialog
426          CLIENT_OUTDATED         N/A (web is always current)    Show mandatory update prompt,
block app usage until updated
429          RATE_LIMITED            Show "wait N minutes" message  Show "wait N minutes" message
500          INTERNAL_ERROR          Show generic error, retry btn  Show generic error, retry btn
CREDENTIAL CLEARING RULES — both clients MUST follow these exactly:
When to clear credentials (clear stored token AND redirect to login):
— HTTP 401 with any of: TOKEN_REVOKED, TOKEN_THEFT_DETECTED, REFRESH_TOKEN_EXPIRED,
USER_INACTIVE, ACCOUNT_DELETED
— HTTP 401 from POST /auth/refresh (any error code — a failed refresh means the
session is unrecoverable)
When NOT to clear credentials (show an error but keep the user logged in):
— HTTP 401 INVALID_CREDENTIALS from POST /auth/login (this is a login attempt
failure, not a session invalidation — the user is not currently logged in anyway)
— HTTP 401 TOKEN_EXPIRED from a protected endpoint (this triggers a silent refresh,
not a logout)
— HTTP 403 FORBIDDEN (the user is still logged in; they just lack permission)
— HTTP 422, 429, 409, 400, 500 (these are request errors, not session errors)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF PART 18 — UNIFIED DATABASE AUTHENTICATION CONTRACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This part is a companion to and extension of:
— Part 1 (Database Schema)
— Part 2 (Authentication System)
— Part 7 (API Specification)
— Part 8 (Security Architecture)
— Part 15 (Integration Points with the Desktop Application)
Any conflict between Part 18 and an earlier Part should be resolved in favor of Part 18,
as it represents the more specific cross-client contract. Flag the conflict in CHANGELOG.md
and update both parts in the same commit to eliminate the ambiguity permanently.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF DOCUMENT: SYNCSANCTUARY WEB PLATFORM MASTER SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Version 1.0 — Complete Engineering & Design Specification
Companion document: SYNCSANCTUARY_DESKTOP_MASTER_PROMPT.md

Every requirement herein is a hard constraint. Nothing is omitted. Nothing is simplified.
The web platform and desktop application share one account system, one JWT contract,
and one source of truth for every user. Build them as if they are two halves of one product —
because they are. A church's Sunday service depends on both working perfectly together.

╔══════════════════════════════════════════════════════════════════════════════════╗
║         SYNCSANCTUARY — DESKTOP APPLICATION MASTER SYSTEM PROMPT               ║
║         VERSION 2.0 — COMPLETE ENGINEERING SPECIFICATION                       ║
║         CLASSIFICATION: PRINCIPAL ENGINEER / ARCHITECT GRADE                   ║
║         SUPERSEDES: VERSION 1.0                                                 ║
║         COMPANION TO: SYNCSANCTUARY_WEB_MASTER_PROMPT.md                      ║
╚══════════════════════════════════════════════════════════════════════════════════╝
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERSION 2.0 CRITICAL DELTA — READ THIS BEFORE EVERYTHING ELSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Version 1.0 of this specification produced a desktop application with the following
catastrophic, production-blocking failures. Version 2.0 exists entirely to prevent
every single one of them. Every failure is documented here with its root cause, and
every root cause has a hard-coded prevention in the specification that follows.
FAILURE 1 — FAKE AUTHENTICATION:
The login screen accepted ANY combination of characters as a valid username and
password. Clicking the login button with empty fields, with "aaa"/"bbb", or with
completely fabricated credentials immediately granted access to the full application.
ROOT CAUSE: The login button's onClick handler called redirectToDashboard() directly
without invoking the real API. The API call was either absent, commented out, or
wrapped in a condition that always evaluated to true.
V2 PREVENTION: Part ZERO of this document defines the authentication contract before
any UI specification. Zero UI code may be written until Part ZERO is fully implemented
and manually verified. The verification checklist in Part ZERO.5 is mandatory.
FAILURE 2 — NO SESSION PERSISTENCE:
Every time the application was launched, the user was required to log in again,
regardless of having previously authenticated successfully.
ROOT CAUSE: The refresh token was stored in a non-persistent location (JavaScript
variable, in-memory Zustand state, or localStorage without OS keychain fallback).
On process exit, the token was lost. No startup routine attempted to read a persisted
token and silently refresh the session before showing any UI.
V2 PREVENTION: Part ZERO.3 specifies the exact startup sequence. The login screen
MUST NOT render until the startup token refresh attempt has completed and returned
a definitive failure (not a pending state).
FAILURE 3 — ENTIRELY NON-INTERACTIVE APPLICATION SHELL:
After bypassing the fake login, the application rendered what appeared to be a
fully designed UI, but every element — every button, every panel, every control —
was visually present but functionally inert. Clicking anything produced no response.
ROOT CAUSE: Components were scaffolded with visual markup but no event handler
wiring. onClick props were absent, undefined, or pointed to undefined functions.
The application was a static image disguised as software.
V2 PREVENTION: Part ZERO.4 defines the mandatory interactivity contract. Every
interactive element MUST be verified by physically clicking it before any code is
considered complete.
FAILURE 4 — GOOGLE OAUTH AND FORGOT PASSWORD ARE DECORATIVE:
The "Continue with Google" button and the "Forgot password?" link rendered
correctly but clicking them produced no observable behavior — no browser window
opened, no modal appeared, nothing happened.
ROOT CAUSE: The handlers were either empty arrow functions or the functions they
called were stubs that returned immediately without performing any action.
V2 PREVENTION: Both flows are fully specified in Part ONE with exact implementation
requirements. Stub functions are explicitly forbidden by Part ZERO.4.
FAILURE 5 — SIGN UP BUTTON NON-FUNCTIONAL:
The "Create account" / sign-up link did not open the web platform signup page,
did not navigate anywhere, and produced no response to user interaction.
ROOT CAUSE: href="#" or an empty onClick handler, never wired to the OS default
browser open call.
V2 PREVENTION: Specified explicitly in Part ONE.1.1 with the exact Tauri/Electron
API call required.
These five failures share one root cause: code was shipped that looked correct
visually but contained zero functional wiring. This version of the specification
treats functional wiring as a first-class, non-negotiable requirement equal in
weight to every visual and architectural specification. Nothing in this document
is decorative guidance. Every sentence is a hard constraint.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART ZERO — THE AUTHENTICATION AND INTERACTIVITY FOUNDATION
(This part is implemented before all other parts, with no exceptions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ZERO.1 — THE CARDINAL RULES (Violation of any of these is a build-blocking defect)
RULE A — NO PLACEHOLDER AUTHENTICATION:
The login form MUST verify credentials against the real web platform API endpoint
POST /api/v1/auth/login. Under no circumstances shall the login process grant access
without a successful HTTP 200 response from that endpoint containing a valid JWT
access_token. The following patterns are strictly forbidden and constitute a
critical security defect:
— Any login handler that calls a navigation/redirect function without first
receiving a successful API response.
— Hardcoded credentials of any kind.
— An "if (true)" or "if (username)" or similar trivially-true condition that
bypasses credential verification.
— Any commented-out API call with "// TODO: wire up real auth later".
— Any login function that returns success unconditionally.
— Any login function that returns success based solely on client-side string
comparison without calling the server.
RULE B — NO UNCONNECTED INTERACTIVE ELEMENTS:
Every element that is visually rendered as interactive (button, link, input, toggle,
slider, dropdown, checkbox, radio) MUST have a fully implemented event handler that
performs a real, observable action when triggered. The following patterns are strictly
forbidden:
— onClick={() => {}}  (empty handler)
— onClick={() => console.log('clicked')}  (console-only handler)
— onClick={handleClick} where handleClick is not defined in scope
— onClick={handleClick} where handleClick is defined as an empty function body
— href="#"  (anchor that goes nowhere)
— href="javascript:void(0)"  (anchor that goes nowhere)
— <button disabled /> without a documented, time-bounded reason
— Any form with no onSubmit or button onClick handler
— Any input with no onChange handler and no ref, making its value unreadable
RULE C — NO SILENT ERRORS:
Every async operation (API call, file I/O, IPC message, hardware enumeration) MUST
handle both success and failure paths. The failure path MUST produce a visible,
user-readable error state in the UI. console.error() alone does not satisfy this
requirement. The error MUST appear on screen.
RULE D — SESSION PERSISTENCE IS MANDATORY:
A user who has successfully authenticated MUST remain authenticated across application
restarts, system reboots, and window close/reopen cycles. The application MUST NOT
show the login screen to a user who has a valid refresh token stored in the OS
keychain, UNLESS the token refresh API call has definitively failed (HTTP 401/403,
not a network timeout that should be retried).
RULE E — LOADING STATES MUST BE SHOWN AND CLEARED:
Every async operation that affects the UI MUST immediately show a loading indicator
(spinner, disabled button, "..." text) when it begins, and MUST clear that loading
indicator when the operation completes, whether it succeeds or fails. An application
stuck in a permanent loading state is broken software.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ZERO.2 — APPLICATION STARTUP SEQUENCE (Exact implementation required)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following sequence MUST be implemented exactly. No step may be skipped or reordered.
STEP 1 — APPLICATION BOOTSTRAP (Rust/Tauri main process, before WebView loads):
a. Start the AI sidecar process (see Part ZERO.6).
b. Begin device enumeration in a background thread (non-blocking).
c. Load application settings from {appDataDir}/settings.json.
d. Spawn the WebView window in a "loading splash" state: a centered SyncSanctuary
logo on a #0D0D0D background, with a subtle pulsing animation. This state
NEVER shows the main application UI or the login form.
e. Set a Tauri managed state value: AuthState::Loading.
STEP 2 — TOKEN RETRIEVAL FROM OS KEYCHAIN (Rust, non-blocking):
a. Attempt to read the refresh token from the OS keychain:
— macOS: kSecClassGenericPassword, service "SyncSanctuary", account "refresh_token"
— Windows: CredRead(L"SyncSanctuary/refresh_token", CRED_TYPE_GENERIC, ...)
— Linux: secret_password_lookup_sync(schema, "service", "SyncSanctuary",
"account", "refresh_token", NULL)
b. If the keychain read fails (no entry found):
— Set AuthState::Unauthenticated.
— Signal the frontend to render the login screen.
— STOP. Do not proceed to Step 3.
c. If the keychain read succeeds (token string retrieved):
— Proceed to Step 3 with the raw refresh token string.
STEP 3 — SILENT TOKEN REFRESH (Rust, HTTP request to web platform API):
a. POST to {WEB_PLATFORM_BASE_URL}/api/v1/auth/refresh
Headers: { "Content-Type": "application/json",
"Authorization": "Bearer {raw_refresh_token}",
"X-Client-Version": "{app_version}",
"X-Client-Platform": "{windows|macos|linux}" }
Body: { "client_type": "desktop" }
Timeout: 15 seconds.
b. On HTTP 200 response:
— Extract access_token from response body.
— Extract new refresh_token from response body.
— Store access_token in Rust Mutex<Option<String>> (process memory ONLY).
— Store new refresh_token in OS keychain, replacing the old one.
— Extract user object from response body.
— Set AuthState::Authenticated { user }.
— Signal frontend: emit Tauri event "auth::session-restored" with the user payload.
— Frontend receives this event and renders the main application shell.
— The login screen is NEVER shown.
c. On HTTP 401 or HTTP 403 response:
— The refresh token is invalid, expired, or revoked.
— Delete the invalid refresh token from the OS keychain.
— Set AuthState::Unauthenticated.
— Signal frontend: emit "auth::session-expired" with reason from response body.
— Frontend renders the login screen with the appropriate message:
TOKEN_REVOKED → "Your session was ended from another device. Please log in."
TOKEN_THEFT_DETECTED → "Security alert: all sessions terminated. Please log in."
REFRESH_TOKEN_EXPIRED → "Your session has expired. Please log in again."
USER_INACTIVE → "Your account is inactive. Visit syncsanctuary.app for help."
(Any other reason) → "Your session has expired. Please log in again."
d. On network error (DNS failure, connection refused, timeout):
— DO NOT delete the keychain token. The token may be perfectly valid.
— Set AuthState::Offline { user: last_cached_user }.
— Signal frontend: emit "auth::offline-mode" with cached user payload.
— Frontend renders the main application in OFFLINE MODE (see Part 1.2 of the
main specification). The login screen is NOT shown.
— Begin background reconnection attempts: retry POST /auth/refresh every 30 seconds.
— On successful reconnect: emit "auth::session-restored", exit offline mode.
e. On HTTP 426 CLIENT_OUTDATED response:
— The desktop app version is below the minimum supported version.
— Signal frontend: emit "auth::update-required" with download_url and min_version.
— Frontend renders a mandatory update screen (not the login screen, not the app).
— The update screen shows: version info, [Download Update] button (opens browser
to download URL), and nothing else. The app is non-functional until updated.
STEP 4 — ACCESS TOKEN LIFECYCLE MANAGEMENT:
After a successful token refresh (Step 3b), schedule an automatic silent refresh:
a. Decode the JWT access_token to extract the "exp" (expiry) Unix timestamp.
b. Calculate refresh_at_timestamp = exp - 120  (refresh 2 minutes before expiry).
c. Set a non-blocking timer (Tokio timer in Rust) to fire at refresh_at_timestamp.
d. On timer fire: execute Step 3 again (silent token refresh).
If the refresh fails with a network error: retry with exponential backoff
(5s, 10s, 20s, 40s, capped at 60s). If all retries fail for 5 minutes:
enter degraded mode (cloud features disabled, local features continue).
e. On any authenticated API request returning HTTP 401 TOKEN_EXPIRED:
— Immediately trigger a synchronous token refresh.
— On success: retry the original request with the new access token.
— On failure: the user MUST NOT see a login screen interruption mid-session.
Queue the request and display a brief, non-blocking "Reconnecting..." indicator.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ZERO.3 — THE API COMMUNICATION LAYER (Rust — must be implemented as a shared service)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following Rust module structure is REQUIRED. All HTTP communication with the web
platform API MUST go through this module. No component may make its own HTTP calls.
FILE: src-tauri/src/api/client.rs
pub struct ApiClient {
http: reqwest::Client,
base_url: String,
access_token: Arc<Mutex<Option<String>>>,
app_version: String,
platform: String,
}
impl ApiClient {
// Every API request MUST use this method, which:
// 1. Reads the current access_token from the Mutex.
// 2. Sets the Authorization: Bearer {token} header.
// 3. Sets X-Client-Version and X-Client-Platform headers.
// 4. Executes the request.
// 5. If response is 401 TOKEN_EXPIRED:
//    a. Attempts a token refresh (calls refresh_tokens()).
//    b. If refresh succeeds: retries the original request once with new token.
//    c. If refresh fails: returns an Err indicating session loss.
// 6. Returns the full response or a typed ApiError.
pub async fn request(&self, method: Method, path: &str, body: Option<Value>)
-> Result<Response, ApiError>;
// Token refresh — called by request() and by the startup sequence.
pub async fn refresh_tokens(&self, raw_refresh_token: &str)
    -> Result<TokenPair, ApiError>;

// Login — called by the login form submit handler.
// This is the ONLY place where login happens. It is NOT bypassed for any reason.
pub async fn login(&self, identifier: &str, password: &str, platform: &str)
    -> Result<AuthResponse, ApiError>;

// Logout — called when the user clicks "Log Out".
pub async fn logout(&self, refresh_token: &str) -> Result<(), ApiError>;
}
// ApiError encodes every failure mode the frontend must handle.
#[derive(Debug, Serialize)]
pub enum ApiError {
Network { message: String },
InvalidCredentials,
AccountLocked { locked_until: DateTime<Utc>, retry_after_seconds: i64 },
AccountSuspended,
AccountDeleted,
NoPasswordSet,
TokenExpired,
TokenRevoked { reason: String },
TokenTheftDetected,
UserInactive,
ClientOutdated { minimum_version: String, download_url: String },
RateLimited { retry_after_seconds: i64 },
ServerError { status: u16, message: String },
Timeout,
}
// The Tauri command that the frontend calls to log in.
// This is a Tauri command (#[tauri::command]) — not a JavaScript function.
// The login form calls this via invoke("login", { identifier, password }).
// It NEVER accepts empty strings. It NEVER returns success without calling the API.
#[tauri::command]
pub async fn login(
identifier: String,
password: String,
state: State<'_, AppState>,
app: AppHandle,
) -> Result<AuthResponse, String> {
// Validation before ANY API call:
let identifier = identifier.trim().to_string();
let password = password.trim().to_string();
if identifier.is_empty() {
    return Err(serde_json::to_string(&ApiError::ServerError {
        status: 400,
        message: "Please enter your phone number or email.".to_string(),
    }).unwrap());
}
if password.is_empty() {
    return Err(serde_json::to_string(&ApiError::ServerError {
        status: 400,
        message: "Please enter your password.".to_string(),
    }).unwrap());
}
if password.len() > 128 {
    return Err(serde_json::to_string(&ApiError::ServerError {
        status: 400,
        message: "Password is too long.".to_string(),
    }).unwrap());
}

// Call the real API. This line MUST exist and MUST NOT be bypassed.
let result = state.api_client
    .login(&identifier, &password, &state.platform)
    .await;

match result {
    Ok(auth_response) => {
        // ONLY on real API success:
        // 1. Store access token in memory.
        *state.access_token.lock().unwrap() = Some(auth_response.access_token.clone());
        // 2. Store refresh token in OS keychain.
        store_refresh_token_in_keychain(&auth_response.refresh_token, &state.platform)?;
        // 3. Emit auth state change to frontend.
        app.emit_all("auth::logged-in", &auth_response.user).unwrap();
        // 4. Return the auth response to the frontend.
        Ok(auth_response)
    }
    Err(api_error) => {
        // Serialize the typed error and return it to the frontend.
        // The frontend MUST display this error to the user.
        Err(serde_json::to_string(&api_error).unwrap())
    }
}
}
FILE: src-tauri/src/api/keychain.rs
// Platform-specific OS keychain integration:
#[cfg(target_os = "macos")]
pub fn store_refresh_token(token: &str, user_id: Option<&str>) -> Result<(), KeychainError> {
use security_framework::passwords::set_generic_password;
let account = user_id.map(|id| format!("refresh_token_{}", id))
.unwrap_or_else(|| "refresh_token".to_string());
set_generic_password("SyncSanctuary", &account, token.as_bytes())
.map_err(|e| KeychainError::MacOS(e.to_string()))
}
#[cfg(target_os = "windows")]
pub fn store_refresh_token(token: &str, user_id: Option<&str>) -> Result<(), KeychainError> {
use windows::Win32::Security::Credentials::*;
let target_name = user_id
.map(|id| format!("SyncSanctuary/refresh_token_{}", id))
.unwrap_or_else(|| "SyncSanctuary/refresh_token".to_string());
// Use CredWriteW with CRED_TYPE_GENERIC and DPAPI encryption.
// Implementation: crate "windows-credentials" or raw Win32 bindings.
windows_credential_write(&target_name, token)
.map_err(|e| KeychainError::Windows(e.to_string()))
}
#[cfg(target_os = "linux")]
pub fn store_refresh_token(token: &str, user_id: Option<&str>) -> Result<(), KeychainError> {
// libsecret via the "secret-service" crate or direct dbus calls.
let attribute_key = user_id.unwrap_or("default");
secret_service_store("SyncSanctuary", "refresh_token", attribute_key, token)
.map_err(|e| KeychainError::Linux(e.to_string()))
}
// Corresponding read functions for each platform follow the same pattern.
// NEVER store the token in:
//   - A plain text file
//   - SQLite database
//   - The Windows Registry (non-DPAPI)
//   - localStorage or sessionStorage (JavaScript layer)
//   - Any location that is not encrypted at rest by the OS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ZERO.4 — THE FRONTEND INTERACTIVITY CONTRACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every React component in the frontend MUST satisfy the following contract:
INPUTS MUST BE CONTROLLED COMPONENTS:
Every <input>, <textarea>, <select> element MUST have:

A state variable: const [value, setValue] = useState('');
An onChange handler: onChange={(e) => setValue(e.target.value)}
The state variable MUST be read and included in any form submission or API call.
The following patterns are forbidden:
<input placeholder="Phone or email" />  // uncontrolled — value is NEVER read
<input ref={myRef} />  // acceptable only when imperative access is required
// and the ref.current.value is explicitly read on submit

TAURI COMMAND CALLS MUST USE THE CORRECT PATTERN:
All backend calls from the frontend use Tauri's invoke() API:
import { invoke } from '@tauri-apps/api/tauri';
The pattern for every command call:
const handleLogin = async () => {
// Guard: validate inputs before any async operation
if (!identifier.trim()) { setIdentifierError('Please enter your phone or email.'); return; }
if (!password.trim()) { setPasswordError('Please enter your password.'); return; }
  // Show loading state immediately
  setIsLoading(true);
  setError(null);
  
  try {
    const result = await invoke('login', { identifier, password });
    // result is the AuthResponse — the user is now authenticated
    // Navigate to the main application shell
    setAuthState({ status: 'authenticated', user: result.user });
  } catch (rawError) {
    // invoke throws on Rust Err(). Parse the error.
    const apiError = JSON.parse(rawError as string);
    setError(mapApiErrorToMessage(apiError));
  } finally {
    // ALWAYS clear loading state
    setIsLoading(false);
  }
};
ERROR MESSAGE MAPPING (mapApiErrorToMessage):
Every ApiError variant from the Rust backend MUST map to a user-readable string:
'InvalidCredentials' → "Incorrect phone number/email or password."
'AccountLocked' → Account temporarily locked. Try again in ${data.retry_after_seconds}s.
'AccountSuspended' → "This account has been suspended. Contact support."
'AccountDeleted' → "This account no longer exists."
'NoPasswordSet' → "This account was created with Google. Use 'Continue with Google' to log in."
'RateLimited' → Too many attempts. Please wait ${data.retry_after_seconds} seconds.
'Network' → "Could not connect to SyncSanctuary servers. Check your internet connection."
'Timeout' → "The connection timed out. Check your internet connection."
'ServerError' → "Something went wrong on our end. Please try again."
'TokenTheftDetected' → "Security alert: all sessions terminated. Please log in again."
(default) → "An unexpected error occurred. Please try again."
LOADING STATES:
Every button that triggers an async operation MUST:

Become disabled immediately on click (disabled={isLoading})
Show a visible loading indicator (a spinner component or "..." text)
Return to its normal state when the operation completes
NEVER remain in a loading state after a response (success or error) is received

Button loading pattern:
<button
onClick={handleLogin}
disabled={isLoading}
className={isLoading ? 'btn-loading' : 'btn-primary'}
>
{isLoading ? <Spinner size={16} /> : 'Log in'}
</button>
EVENT LISTENERS MUST BE REGISTERED AT COMPONENT MOUNT:
Tauri events emitted by the Rust backend (e.g., "auth::session-restored",
"auth::session-expired", "device::connected") MUST be listened to in useEffect
with proper cleanup:
import { listen } from '@tauri-apps/api/event';
useEffect(() => {
  const unlisten = await listen('auth::session-restored', (event) => {
    const { user } = event.payload;
    setAuthState({ status: 'authenticated', user });
  });
  return () => { unlisten(); }; // MUST clean up to prevent memory leaks
}, []);
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ZERO.5 — MANDATORY PRE-DELIVERY VERIFICATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Before ANY code is considered deliverable, the implementing engineer MUST physically
execute every item on this checklist on a real running instance of the application.
"I believe it works" is not a check. "I read the code and it looks right" is not a
check. Actually performing the action and observing the result is the only valid check.
AUTHENTICATION CHECKS — ALL MUST PASS:
[ ] Launch the app for the first time (no cached session).
EXPECTED: Login screen appears. The main application shell does NOT appear.
[ ] Click the "Log in" button with BOTH fields empty.
EXPECTED: Field-level error messages appear. NO navigation occurs.
The button returns to its normal state (not stuck loading).
[ ] Click the "Log in" button with a valid-looking identifier but empty password.
EXPECTED: Password field error appears. NO navigation occurs.
[ ] Enter completely fabricated credentials ("fake@fake.com" / "wrongpassword123").
Click "Log in".
EXPECTED: An error message appears: "Incorrect phone number/email or password."
NO navigation to the application shell occurs.
The button returns to its normal state.
[ ] Enter correct credentials for a real account. Click "Log in".
EXPECTED: A loading spinner appears in the button. After the API responds,
the main application shell renders. The login screen disappears.
[ ] Close the application completely. Reopen it.
EXPECTED: The login screen does NOT appear. The main application shell
renders immediately (after a brief loading splash of <3 seconds).
The user is already authenticated.
[ ] Close the application. Reopen it while the machine has no internet connection.
EXPECTED: The application enters offline mode. The main application shell
renders with the offline banner. The login screen does NOT appear.
[ ] Remain logged in for 20 minutes without any interaction.
EXPECTED: The application continues to function. No logout occurs. No login
prompt appears. (The access token silently refreshed at minute 13.)
[ ] Log out via the account menu.
EXPECTED: The OS keychain entry is deleted. The login screen appears.
Relaunching the application now shows the login screen (no cached token).
BUTTON AND INTERACTIVITY CHECKS — ALL MUST PASS:
[ ] Click "Continue with Google" on the login screen.
EXPECTED: The system default browser opens (or a browser window opens) to the
Google OAuth authorization page. This is a real browser, not a WebView
showing a blank page or an error.
[ ] Click "Forgot password?" on the login screen.
EXPECTED: The system default browser opens to the web platform's password reset
page at {WEB_PLATFORM_BASE_URL}/[locale]/auth/reset-password.
[ ] Click "Create account" / "Sign up" on the login screen.
EXPECTED: The system default browser opens to the web platform's signup page
at {WEB_PLATFORM_BASE_URL}/[locale]/auth/signup.
[ ] Once logged in: click every item in the toolbar.
EXPECTED: Each button produces a visible, observable response (panel appears,
modal opens, state changes, etc.). NO button produces zero response.
[ ] Once logged in: click every item in every dropdown menu.
EXPECTED: Each item navigates, opens a dialog, or performs its described action.
[ ] Once logged in: click a slide thumbnail in the slide grid.
EXPECTED: The slide becomes selected (visual selection state changes).
The inspector panel on the right updates to reflect the selected slide.
[ ] Once logged in: press Enter on a selected slide.
EXPECTED: The slide is sent LIVE. The red LIVE border appears. The output preview
in the right panel updates.
[ ] Once logged in: click "Go Live" or equivalent button.
EXPECTED: The currently selected slide is sent to the output display.
[ ] Once logged in: toggle Dark Mode / Light Mode.
EXPECTED: The entire application UI transitions color scheme. The preference
is persisted (closing and reopening the app preserves the last choice).
[ ] Once logged in: resize a panel by dragging the resize handle.
EXPECTED: The panel resizes smoothly. The new size is preserved after closing
and reopening the application.
Any item that does not pass MUST be fixed before the code is considered deliverable.
Do NOT ship code with failing checklist items. Do NOT mark items as passing without
performing the physical action.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ZERO.6 — WEB PLATFORM ↔ DESKTOP AUTH CORRELATION CONTRACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This section defines the EXACT database-level contract between the web platform
(SYNCSANCTUARY_WEB_MASTER_PROMPT.md) and this desktop application. Both components
share the same PostgreSQL database via the web platform's API. The desktop is a
CLIENT of the web API. It has NO independent database. It has NO independent auth.
SHARED STATE — THE DATABASE IS THE ONLY AUTHORITY:
The desktop application MUST treat the following as immutable facts owned by the
web platform's PostgreSQL database, readable only via API calls, never cached as
local truth beyond the lifetime of a single access token:
— Whether the user's account is active (users.is_active)
— Whether the user's account is locked (users.locked_until)
— The user's current role (users.role)
— The user's username (users.username)
— The user's preferred language (users.language)
— The validity of any refresh token (refresh_tokens.revoked, expires_at)
— Whether a deletion grace period is active (users.deletion_requested_at)
CROSS-CLIENT SESSION LIFECYCLE (how web platform actions affect the desktop):
SCENARIO A — User changes password on the web:
Database effect: All refresh tokens for the user are revoked (revoked=TRUE,
revoked_reason='password_change') EXCEPT the web session that initiated the change.
Desktop effect: The desktop's stored refresh token is now revoked. On the next
silent token refresh attempt (within 13 minutes), the API returns HTTP 401
TOKEN_REVOKED. The desktop MUST:
1. Delete the revoked refresh token from the OS keychain.
2. Clear the access token from process memory.
3. Display the login screen with the message:
"Your password was changed. Please log in again."
(NOT a generic "session expired" message.)
SCENARIO B — User revokes the desktop session from the web account settings page:
Database effect: The specific refresh_tokens row for the desktop session is set
to revoked=TRUE, revoked_reason='logout'.
Desktop effect: Next token refresh returns HTTP 401 TOKEN_REVOKED. Same as A.
SCENARIO C — Security alert / token theft detected:
Database effect: ALL refresh tokens for the user are set to revoked=TRUE,
revoked_reason='theft_detected'.
Desktop effect: Next token refresh returns HTTP 401 TOKEN_THEFT_DETECTED. Desktop MUST:
1. Delete token from keychain.
2. Clear memory token.
3. Display login screen with PROMINENT security message:
"Security alert: All sessions were terminated due to suspicious activity.
If this wasn't you, reset your password immediately."
Button: [Reset password] → opens browser to /auth/reset-password
Button: [Log in] → returns to normal login form
SCENARIO D — User initiates account deletion from the web:
Database effect: users.is_active = FALSE, deletion_requested_at = NOW().
All refresh tokens revoked.
Desktop effect: Next token refresh returns HTTP 401 USER_INACTIVE. Desktop MUST:
1. Delete token from keychain.
2. Display login screen with deletion-specific message:
"Your account is scheduled for deletion. Log in to cancel and restore access."
3. If user successfully logs in during the 30-day grace period:
The API response includes "account_restored": true.
Desktop MUST show: "Your account has been restored."
SCENARIO E — Desktop app is below minimum supported version:
API effect: Every authenticated request returns HTTP 426 CLIENT_OUTDATED.
Desktop effect: Render a mandatory update screen that BLOCKS all application
functionality. Show version information and a [Download Update] button that opens
the system browser to the download page. No other UI is accessible.
TOKEN DELIVERY DIFFERENCES (web vs desktop):
The web platform uses httpOnly cookies for the refresh token.
The desktop uses Authorization: Bearer header for the refresh token.
Both receive the refresh token in the JSON response body on login and refresh.
The desktop IGNORES any Set-Cookie headers (they are irrelevant to the desktop).
The desktop ALWAYS sends the refresh token as: Authorization: Bearer {raw_token}
The desktop ALWAYS sends client identification headers:
X-Client-Version: {semver e.g. "1.2.3"}
X-Client-Platform: {windows|macos|linux}
User-Agent: SyncSanctuary-Desktop/{version} ({platform}; {arch})
SESSION DISPLAY ON WEB (what the user sees in web account settings):
When the user views their active sessions on the web platform, the desktop session
appears as a separate row with:
client_type: "desktop"
device_name: "SyncSanctuary Desktop {version} on {OS}"
icon: a desktop computer icon
The user can revoke the desktop session from the web. The desktop handles this
revocation via SCENARIO B above. The web can revoke any desktop session; the desktop
CANNOT revoke web sessions (it has no UI for this — it can only log itself out).
MULTI-ACCOUNT SUPPORT:
Each account has its own keychain entry keyed by user_id:
macOS: service="SyncSanctuary", account="refresh_token_{user_id}"
Windows: target="SyncSanctuary/refresh_token_{user_id}"
Linux: attribute "account"="refresh_token_{user_id}"
Each account has its own isolated data directory: {appDataDir}/accounts/{user_id}/
Switching accounts: clear the active access token from memory, load the selected
account's refresh token from the keychain, execute Step 3 of the startup sequence.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART ONE — AUTHENTICATION AND ACCOUNT SYSTEM (DESKTOP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1.1 Login Screen — Full Specification
1.1.1 — RENDERING PRECONDITION:
The login screen renders ONLY when the Tauri event "auth::session-expired" or
"auth::unauthenticated" is received. It DOES NOT render while the startup token
refresh is in progress (that shows the loading splash). It DOES NOT render after
"auth::session-restored", "auth::offline-mode", or "auth::update-required" is received.
AuthGate component (root component, wraps all other components):
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'offline' | 'update-required';
The AuthGate listens to all auth:: Tauri events and maintains this state.
- 'loading' → renders: <SplashScreen />
- 'authenticated' → renders: <MainApplicationShell />
- 'unauthenticated' → renders: <LoginScreen message={expiredReason} />
- 'offline' → renders: <MainApplicationShell offlineMode={true} user={cachedUser} />
- 'update-required' → renders: <MandatoryUpdateScreen info={updateInfo} />

NO OTHER COMPONENT decides what to render based on auth state. Only AuthGate.
This prevents any path from bypassing authentication.
1.1.2 — VISUAL SPECIFICATION:
The login screen is a centered card on a #0D0D0D full-screen background.
Card: width 420px, background #1E1E1E, border 1px solid #333333,
border-radius 12px, padding 40px, box-shadow 0 24px 64px rgba(0,0,0,0.8).
Elements (top to bottom):
[A] App Logo: centered, 64×64px SVG.
[B] App name "SyncSanctuary": Inter, 24px, weight 700, color #EAEAEA, centered.
[C] Tagline: "Professional Church Media Production", Inter, 13px, color #888888,
centered, margin-bottom 32px.
[D] Session message banner (renders ONLY when a reason message exists, e.g. after
session expiry or forced logout):
Background #1A0D00, border 1px solid #5C3500, border-radius 6px, padding 8px 12px.
Text: 12px, color #FFB347. Content: the reason message from the auth event.
Margin-bottom 16px.
[E] Phone/Email input field:
State: const [identifier, setIdentifier] = useState('');
Label: "Phone number or email", 11px, color #999999, display block, margin-bottom 4px.
Input:
type="text"
value={identifier}
onChange={(e) => setIdentifier(e.target.value)}
onKeyDown={(e) => { if (e.key === 'Enter') passwordInputRef.current?.focus(); }}
placeholder="+82 10 1234 5678 or email@example.com"
autoComplete="username"
style: height 40px, background #161616, border 1px solid #333333,
border-radius 6px, font-size 14px, color #EAEAEA, padding 0 12px,
width 100%, box-sizing border-box.
Focus style: border-color #1A56DB, outline none.
Error style (when identifierError is set): border-color #FF3B30.
Error message: renders below input when identifierError !== null.
Color #FF3B30, font-size 12px, margin-top 4px.
[F] Password input field:
State: const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
Label: "Password", same style as above.
Input:
type={showPassword ? 'text' : 'password'}
value={password}
onChange={(e) => setPassword(e.target.value)}
onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
autoComplete="current-password"
ref={passwordInputRef}
style: same as identifier input, padding-right 44px.
Eye icon button (show/hide toggle):
position absolute, right 12px, top 50%, transform translateY(-50%).
onClick={() => setShowPassword(prev => !prev)}
aria-label={showPassword ? "Hide password" : "Show password"}
Color #555555, hover #AAAAAA. Icon: 20×20px.
Error message: renders below input when passwordError !== null. Same style.
[G] "Forgot password?" link:
Position: right-aligned, below password field.
Font-size 11px, color #4A90E2, cursor pointer.
Hover: underline.
onClick handler — THIS MUST BE IMPLEMENTED:
import { open as openBrowser } from '@tauri-apps/api/shell';
const handleForgotPassword = () => {
openBrowser(${WEB_PLATFORM_BASE_URL}/${currentLocale}/auth/reset-password);
};
This handler MUST be assigned: onClick={handleForgotPassword}
An empty handler is forbidden (see RULE B in Part ZERO.1).
[H] "Log In" primary button:
width 100%, height 40px, background #1A56DB, color #FFFFFF, border-radius 6px,
font-size 14px, font-weight 600, border none, cursor pointer.
Hover: background #1E63F5.
Loading state:
disabled={isLoading}
style when loading: background #1044AB, cursor not-allowed.
Content when loading: <Spinner size={16} color="white" /> "Logging in..."
Content when idle: "Log In"
onClick={handleLogin}  ← MUST be assigned. See ZERO.4 for handleLogin implementation.
[I] Divider: full-width, "or" centered, 1px solid #2A2A2A line, "or" in 11px #555555.
[J] "Continue with Google" button:
width 100%, height 40px, background #2A2A2A, border 1px solid #444444,
border-radius 6px, cursor pointer.
Content: Google G logo SVG (18px, official colors) + "Continue with Google" (14px #EAEAEA).
Hover: background #333333.
onClick handler — THIS MUST BE IMPLEMENTED:
const handleGoogleOAuth = async () => {
// Step 1: Generate PKCE code_verifier (32 random bytes, base64url encoded).
const codeVerifier = generateCodeVerifier(); // crypto.getRandomValues based
// Step 2: Compute code_challenge = base64url(SHA-256(codeVerifier))
const codeChallenge = await computeCodeChallenge(codeVerifier);
// Step 3: Generate random state parameter for CSRF protection.
const state = generateRandomState(); // 16 random bytes, hex encoded
// Step 4: Store verifier and state temporarily (process memory only).
setOAuthPending({ codeVerifier, state });
// Step 5: Open browser to the web platform's OAuth initiation endpoint.
// The web platform initiates the Google OAuth flow.
// After completion, it redirects to syncsanctuary://auth/callback
const params = new URLSearchParams({
state,
code_challenge: codeChallenge,
code_challenge_method: 'S256',
client_type: 'desktop',
platform: currentPlatform,
});
await openBrowser(
${WEB_PLATFORM_BASE_URL}/api/v1/auth/google/desktop-initiate?${params}
);
// Step 6: The Rust backend listens for the deep link callback.
// When the syncsanctuary://auth/callback?token=...&refresh_token=...
// deep link fires (handled by Tauri's deep link plugin), the Rust
// process_oauth_callback() function:
//   a. Extracts the tokens from the URL.
//   b. Validates the state parameter matches the stored state.
//   c. Stores the refresh token in keychain.
//   d. Emits "auth::logged-in" to the frontend.
// Note: this event listener is already registered in the AuthGate component.
};
onClick={handleGoogleOAuth}  ← MUST be assigned.
[K] "Create account" link:
Text: "Don't have an account? " (12px, color #888888) + "Sign up" (color #4A90E2)
Centered, below all buttons.
onClick handler — THIS MUST BE IMPLEMENTED:
const handleSignUp = () => {
openBrowser(${WEB_PLATFORM_BASE_URL}/${currentLocale}/auth/signup);
};
onClick={handleSignUp}  ← MUST be assigned.
This opens the web platform's signup page in the system default browser.
Signup is ONLY done on the web platform. The desktop does not implement signup.
The user signs up on the web, then returns to the desktop and logs in.
1.1.3 — LOGIN FORM HANDLER (Complete implementation):
const handleLogin = async () => {
// Clear previous errors
setIdentifierError(null);
setPasswordError(null);
setGlobalError(null);
// Client-side validation (before any API call)
const trimmedIdentifier = identifier.trim();
const trimmedPassword = password.trim();

if (!trimmedIdentifier) {
  setIdentifierError('Please enter your phone number or email.');
  return; // STOP. Do not call the API.
}

if (!trimmedPassword) {
  setPasswordError('Please enter your password.');
  return; // STOP. Do not call the API.
}

// Show loading state
setIsLoading(true);

try {
  // THIS IS THE REAL API CALL. It MUST be present and MUST NOT be bypassed.
  const result = await invoke('login', {
    identifier: trimmedIdentifier,
    password: trimmedPassword,
  });
  // result.user is the authenticated user object
  // AuthGate will receive the "auth::logged-in" event from Rust
  // and transition to the 'authenticated' state automatically.
  // No manual navigation is needed here — the event handles it.
} catch (rawError) {
  const apiError = typeof rawError === 'string'
    ? JSON.parse(rawError)
    : { type: 'ServerError', message: 'Unknown error' };
  
  switch (apiError.type) {
    case 'InvalidCredentials':
      setGlobalError('Incorrect phone number/email or password. Please try again.');
      break;
    case 'AccountLocked':
      setGlobalError(
        `Account temporarily locked. Try again in ${Math.ceil(apiError.retry_after_seconds / 60)} minutes.`
      );
      break;
    case 'AccountSuspended':
      setGlobalError('Your account has been suspended. Contact support.');
      break;
    case 'AccountDeleted':
      setGlobalError('This account no longer exists.');
      break;
    case 'NoPasswordSet':
      setGlobalError("This account uses Google sign-in. Click 'Continue with Google'.");
      break;
    case 'RateLimited':
      setGlobalError(`Too many login attempts. Please wait ${apiError.retry_after_seconds} seconds.`);
      break;
    case 'Network':
      setGlobalError('Could not connect to SyncSanctuary servers. Check your internet connection.');
      break;
    case 'Timeout':
      setGlobalError('The connection timed out. Check your internet connection.');
      break;
    default:
      setGlobalError('An unexpected error occurred. Please try again.');
  }
} finally {
  setIsLoading(false); // ALWAYS clear loading state
}
};
Global error display (element [H] context — renders below the "Log In" button
when globalError !== null):
Background #2A0000, border 1px solid #5C0000, border-radius 6px, padding 10px 14px.
Text: 12px, color #FF6B6B. Content: {globalError}.
Margin-top 12px.
1.2 Offline Mode (fully specified in V1 — no changes. Restated for emphasis):
Offline mode does NOT show the login screen. It shows the full application shell
with an amber banner and grayed-out cloud features. The user remains authenticated.
1.3 Session Management:
All behaviors specified in Part ZERO.2, Step 4 apply here.
Logout handler:
const handleLogout = async () => {
setIsLoggingOut(true);
try {
const refreshToken = await invoke('get_refresh_token_from_keychain');
// Best-effort server-side logout (revoke the token in the database)
// This call failing does NOT prevent local logout.
await invoke('logout', { refreshToken }).catch(() => {});
} finally {
// Local cleanup ALWAYS happens, regardless of server response.
await invoke('clear_keychain_token');
await invoke('clear_memory_token');
// Emit the unauthenticated event to transition AuthGate to the login screen.
// The Rust side emits this after clearing state.
setIsLoggingOut(false);
}
};
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART TWO — APPLICATION SHELL AND GLOBAL INTERACTIVITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2.1 — MainApplicationShell Component Responsibilities:
The MainApplicationShell renders ONLY when AuthGate is in the 'authenticated' or
'offline' state. It MUST NOT render at any other time.
On mount, MainApplicationShell MUST:
a. Load user preferences from {appDataDir}/accounts/{user_id}/preferences.json.
b. Load the active scene collection.
c. Load the last open project (if "Open last project on startup" is enabled).
d. Register all keyboard shortcut handlers (see Part TWO.4).
e. Register all hardware device event listeners (see Part NINE.1 of the main spec).
f. Initialize the audio engine (establish connection to audio backend thread).
g. Initialize the video render thread.
h. Emit a "shell::ready" event to the Rust backend, signaling that the frontend
is ready to receive device events and other backend messages.
2.2 — Panel Architecture and Interactivity:
EVERY panel component MUST be an independent, stateful React component.
EVERY panel's resize handle MUST implement drag-to-resize:
const ResizeHandle = ({ onResize, direction }) => {
const handleMouseDown = (e) => {
e.preventDefault();
const startX = e.clientX;
const startY = e.clientY;
    const handleMouseMove = (e) => {
      requestAnimationFrame(() => {
        if (direction === 'horizontal') {
          onResize(e.clientX - startX);
        } else {
          onResize(e.clientY - startY);
        }
      });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Persist the new size to user preferences
      invoke('save_panel_size', { panel: panelId, size: currentSize });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  return (
    <div
      className={`resize-handle resize-handle-${direction}`}
      onMouseDown={handleMouseDown}
      role="separator"
      aria-orientation={direction}
    />
  );
};
Panel size constraints MUST be enforced on every resize event:
Left panel: min 160px, max 400px.
Right panel: min 220px, max 500px.
Center panel: min 400px (enforced implicitly by the min/max of side panels).
Persisted sizes MUST be loaded on MainApplicationShell mount and applied to panel
initial widths. If no persisted size: use defaults (left 220px, right 280px).
2.3 — Dark/Light Mode Toggle:
Toggle button onClick:
const handleThemeToggle = () => {
const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
setTheme(newTheme); // Updates CSS custom properties via data-theme attribute
// Persist to user preferences
invoke('save_preference', { key: 'theme', value: newTheme });
// Sync to web platform account (best-effort, do not block UI on failure)
invoke('sync_preference_to_server', { key: 'theme', value: newTheme }).catch(() => {});
};
Theme application — apply to document root:
document.documentElement.setAttribute('data-theme', theme);
On startup: read saved theme preference before rendering any UI to prevent flash:
const savedTheme = await invoke('get_preference', { key: 'theme' });
document.documentElement.setAttribute('data-theme', savedTheme || 'dark');
2.4 — Keyboard Shortcut Handler Registration:
ALL keyboard shortcuts defined in Part TWENTY-ONE of the original V1 specification
MUST be registered. Registration happens in MainApplicationShell on mount:
useEffect(() => {
const handleKeyDown = (e) => {
// Determine modifier key state
const ctrl = e.ctrlKey || e.metaKey;
const shift = e.shiftKey;
const alt = e.altKey;
    // Example handlers — all shortcuts must be registered:
    if (e.key === 'Enter' && !ctrl && !shift && !alt) {
      e.preventDefault();
      sendSelectedSlideToLive();
    }
    if (e.key === ' ' && !ctrl && !shift && !alt) {
      e.preventDefault();
      cueNextSlide();
    }
    if (e.key === 'Escape' && !ctrl && !shift && !alt) {
      e.preventDefault();
      clearAllOutput();
    }
    if (ctrl && e.key === '1') { e.preventDefault(); clearAllLayers(); }
    if (ctrl && e.key === '2') { e.preventDefault(); clearSlide(); }
    if (ctrl && e.key === '3') { e.preventDefault(); clearMedia(); }
    if (ctrl && e.key === '4') { e.preventDefault(); clearAudio(); }
    if (ctrl && e.key === '5') { e.preventDefault(); clearAnnouncements(); }
    if (ctrl && e.key === '6') { e.preventDefault(); clearMessages(); }
    // ... all remaining shortcuts from Part TWENTY-ONE must be registered
    // Configurable shortcuts are read from user preferences, not hardcoded
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [/* all action function dependencies */]);
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART THREE — SLIDE GRID INTERACTIVITY (Complete Wiring Specification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Every interaction defined in the V1 specification's Section 6.6 MUST be wired up.
The SlideGrid component must handle:
3.1 — SlideCard Component (each card in the grid):
interface SlideCardProps {
slide: Slide;
isSelected: boolean;
isLive: boolean;
isCued: boolean;
onSelect: (slideId: string, event: React.MouseEvent) => void;
onDoubleClick: (slideId: string) => void;
onContextMenu: (slideId: string, event: React.MouseEvent) => void;
onDragStart: (slideId: string, event: React.DragEvent) => void;
}
const SlideCard = ({ slide, isSelected, isLive, isCued, onSelect, onDoubleClick,
onContextMenu, onDragStart }: SlideCardProps) => {
// EVERY event must be wired:
return (
<div
className={slide-card ${isSelected ? 'selected' : ''} ${isLive ? 'live' : ''} ${isCued ? 'cued' : ''}}
onClick={(e) => onSelect(slide.id, e)}            // ← WIRED
onDoubleClick={() => onDoubleClick(slide.id)}      // ← WIRED
onContextMenu={(e) => { e.preventDefault(); onContextMenu(slide.id, e); }} // ← WIRED
draggable={true}
onDragStart={(e) => onDragStart(slide.id, e)}     // ← WIRED
tabIndex={0}
onKeyDown={(e) => {
if (e.key === 'Enter') onSendToLive(slide.id);
if (e.key === ' ') onCue(slide.id);
}}
aria-selected={isSelected}
aria-label={Slide: ${slide.name}${isLive ? ', Live' : ''}${isCued ? ', Cued' : ''}}
>
<SlidePreview slide={slide} />
{isLive && <span className="live-badge" aria-hidden="true">LIVE</span>}
<span className="slide-number">{slide.index + 1}</span>
<SelectionCheckbox checked={isSelected} slideId={slide.id} />
</div>
);
};
3.2 — Slide Selection Logic:
const handleSlideSelect = (slideId: string, event: React.MouseEvent) => {
if (event.ctrlKey || event.metaKey) {
// Add to multi-selection
setSelectedIds(prev => {
const newSet = new Set(prev);
if (newSet.has(slideId)) { newSet.delete(slideId); }
else { newSet.add(slideId); }
return newSet;
});
} else if (event.shiftKey && lastSelectedId !== null) {
// Range-select from last selected to current
const allIds = slides.map(s => s.id);
const fromIdx = allIds.indexOf(lastSelectedId);
const toIdx = allIds.indexOf(slideId);
const [start, end] = fromIdx <= toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
setSelectedIds(new Set(allIds.slice(start, end + 1)));
} else {
// Single selection
setSelectedIds(new Set([slideId]));
setLastSelectedId(slideId);
}
// Update inspector panel with selected slide's properties
setInspectorSlide(slides.find(s => s.id === slideId) || null);
};
3.3 — Send to Live:
const sendSlideToLive = async (slideId: string) => {
const slide = slides.find(s => s.id === slideId);
if (!slide) return;
// Update local state immediately for zero-latency UI response
setLiveSlideId(slideId);

// Tell the Rust video engine to composite this slide
await invoke('video::set_live_slide', { slideId });

// Log to session history
await invoke('session::log_slide_change', {
  slideId,
  timestamp: Date.now(),
  triggeredBy: 'manual'
});
};
3.4 — Context Menu (right-click on any slide card):
The context menu MUST be implemented with Radix UI's ContextMenu primitive.
Every menu item MUST have a real onClick handler. No item may be decorative.
Example of required handlers:
"Go Live" → sendSlideToLive(contextSlideId)
"Cue as Next" → setCuedSlideId(contextSlideId)
"Edit Slide..." → setSlideEditorOpen(contextSlideId)
"Duplicate Slide" → invoke('presentation::duplicate_slide', { slideId: contextSlideId })
"Delete Slide" → showDeleteConfirmDialog(contextSlideId)
"Add to Playlist" → (submenu) → addSlideToPlaylist(contextSlideId, playlistId)
"Export Slide as Image..." → invoke('export::slide_as_image', { slideId: contextSlideId })
"Slide Properties..." → setPropertiesDialogOpen(contextSlideId)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART FOUR — TOOLBAR CLEAR BUTTONS (Complete Wiring Specification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The six clear buttons MUST each invoke their corresponding Rust command:
const CLEAR_BUTTONS = [
{ color: '#FFFFFF', label: 'Clear All', key: '1', command: 'video::clear_all' },
{ color: '#FF6B00', label: 'Clear Slide', key: '2', command: 'video::clear_slide' },
{ color: '#00B4D8', label: 'Clear Media', key: '3', command: 'video::clear_media' },
{ color: '#2ECC71', label: 'Clear Audio', key: '4', command: 'audio::mute_all' },
{ color: '#F1C40F', label: 'Clear Ann.', key: '5', command: 'video::clear_announcements' },
{ color: '#E74C3C', label: 'Clear Msg', key: '6', command: 'video::clear_messages' },
];
// Each button's click handler:
const handleClear = async (command: string) => {
// Flash animation (CSS)
setFlashingCommand(command);
setTimeout(() => setFlashingCommand(null), 120);
// Real action
await invoke(command);
};
The Rust commands for each:
video::clear_all → sets live slide to null, media to null, messages to empty.
Emits "output::changed" event. Output goes to pure black.
video::clear_slide → removes the slide text/content layer. Background/media remains.
video::clear_media → removes the background media. Slide content remains.
audio::mute_all → sets all channel mute flags to true. Emits "audio::state_changed".
video::clear_announcements → removes announcement overlay from compositor.
video::clear_messages → removes message ticker from compositor.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART FIVE — SETTINGS MODAL (Complete Wiring Specification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Settings modal is opened via the menu (File → Settings or ⌘,/Ctrl+,) or a toolbar
button. It MUST NOT be a static rendering — every control MUST read from and write to
real state.
5.1 — Modal Open/Close:
State: const [settingsOpen, setSettingsOpen] = useState(false);
Keyboard: Ctrl/Cmd+, listener registered in Part TWO.4 calls setSettingsOpen(true).
Menu item: "Settings..." → onClick={() => setSettingsOpen(true)} ← MUST be wired.
ESC key within modal: closes modal and discards pending changes.
[Cancel] button → discards pending changes, closes modal.
[Apply] button → saves all settings, keeps modal open.
[OK] button → saves all settings, closes modal.
5.2 — Settings Persistence:
All settings are read from a local SQLite database on modal open:
invoke('settings::load_all')  → Record<string, unknown>
All setting changes are accumulated in local React state (not saved immediately).
On Apply/OK: invoke('settings::save_all', { settings: pendingSettings })
Sensitive settings (stream keys, API keys) are stored via:
invoke('settings::save_secure', { key, value })  → writes to OS keychain
Settings that require application restart display a banner:
"These changes will take effect after restarting SyncSanctuary."
5.3 — Category Navigation:
The left sidebar categories are clickable links — clicking any category renders
that category's settings pane in the right content area. The active category has
the visual active state (background #1F2D45, left blue border).
State: const [activeCategory, setActiveCategory] = useState('general');
Each sidebar item: onClick={() => setActiveCategory(categoryId)} ← MUST be wired.
5.4 — Audio Settings Category (critical example):
All dropdowns MUST be Radix UI Select components with real value/onValueChange:
<Select
value={settings.audio.sampleRate}
onValueChange={(v) => setPendingSetting('audio.sampleRate', v)}


<SelectTrigger><SelectValue /></SelectTrigger>
<SelectContent>
  <SelectItem value="44100">44.1 kHz</SelectItem>
  <SelectItem value="48000">48 kHz</SelectItem>
  <SelectItem value="96000">96 kHz</SelectItem>
</SelectContent>
  </Select>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART SIX — FLOATING PANELS (Complete Wiring Specification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All floating panels (Timers, Props, Messages, Macros) share a common floating panel
infrastructure:
6.1 — FloatingPanel Base Component:
Props: { title, isOpen, onClose, defaultPosition, children }
Features that MUST be implemented:
- Drag to reposition: mousedown on header → follow cursor → mouseup to stop.
Persist final position to user preferences.
- Minimum distance from viewport edges: 8px on all sides.
- [✕] close button: onClick={onClose} ← MUST be wired.
- [+] add button (for Timers, Props, Messages): onClick={handleAddItem} ← MUST be wired.
- Position and open/closed state persisted to user preferences.
- Restored on application restart to previous position and state.
6.2 — Timers Panel (each timer item):
Every timer MUST have working controls:
interface TimerState {
id: string; name: string; mode: 'countdown' | 'countup' | 'elapsed';
targetSeconds: number; elapsedSeconds: number; isRunning: boolean;
showOnStage: boolean;
}
[▶ Start] button:
onClick={() => invoke('timer::start', { timerId })}
Updates local state immediately, backend confirms via "timer::tick" events.
[⏸ Pause] button:
onClick={() => invoke('timer::pause', { timerId })}
[⏹ Reset] button:
onClick={() => invoke('timer::reset', { timerId })}
Target time input: onBlur triggers invoke('timer::set_target', { timerId, seconds })
[Show on Stage] toggle:
onCheckedChange={(checked) => invoke('stage::set_timer_visible', { timerId, visible: checked })}
Timer ticking: The Rust backend emits "timer::tick" every second for all running timers.
The frontend listens: listen('timer::tick', (e) => updateTimerDisplay(e.payload))
Timer color logic (applied to the time display text):
seconds > 300: color #22A35B (green)
seconds <= 300 && > 60: color #FF9500 (amber)
seconds <= 60 && > 0: color #E03A2F (red, steady)
seconds === 0: color #E03A2F (red, flashing at 500ms interval)
6.3 — Macros Panel (each macro button):
Every macro button MUST execute its action sequence on click:
const handleMacroClick = async (macroId: string) => {
// Flash animation
setClickedMacro(macroId);
setTimeout(() => setClickedMacro(null), 300);
// Execute the macro's action sequence
await invoke('macro::execute', { macroId });
};
onClick={handleMacroClick}  ← MUST be assigned to every macro button.
Macro editor (right-click on any macro → "Edit..."):
Opens the macro editor modal.
Modal MUST be a real, functional form — not a placeholder.
Save button calls: invoke('macro::save', { macroId, definition })
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART SEVEN — OUTPUT PREVIEW MONITORS (Complete Wiring Specification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The output preview monitors in the right panel MUST show live content:
7.1 — Preview Update Mechanism:
The Rust video engine emits "output::frame" events every render frame (60fps, or less
if the preview is not visible). The payload is a compressed preview image (JPEG, 320×180px).
The frontend listens:
listen('output::audience_frame', (e) => {
setAudiencePreviewSrc(data:image/jpeg;base64,${e.payload.imageBase64});
});
listen('output::stage_frame', (e) => {
setStagePrevieSrc(data:image/jpeg;base64,${e.payload.imageBase64});
});
The preview images are rendered in <img> tags with the data URI as src.
When no output is active: show "No Output" placeholder text (not a broken image).
7.2 — Live Indicator:
The red dot (● #E03A2F) shows when the audience output is active.
State: isOutputActive, driven by "output::state_changed" events from Rust.
listen('output::state_changed', (e) => setIsOutputActive(e.payload.audienceActive));
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART EIGHT — MENU BAR (Complete Wiring Specification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EVERY menu item defined in Part THREE of the original V1 specification MUST have a
wired handler. The following are the MINIMUM required handlers that were previously
missing or broken:
FILE MENU:
"New Presentation" → invoke('project::new_presentation')
"Open..." → invoke('dialog::open_file', { filters: ['SyncSanctuary Presentation'] })
.then((path) => path && invoke('project::open', { path }))
"Save" → invoke('project::save')
"Save As..." → invoke('dialog::save_file').then((path) => path && invoke('project::save_as', { path }))
"Settings..." → setSettingsOpen(true)
"Exit / Quit" → invoke('app::quit')
"Always on Top" → invoke('window::toggle_always_on_top')
EDIT MENU:
"Undo" → invoke('history::undo')
"Redo" → invoke('history::redo')
"Find..." → setFindOpen(true)
VIEW MENU:
"Dark Mode" → handleThemeToggle()
"Pro Mode" → setProMode(prev => !prev)
"Studio Mode" → setStudioMode(prev => !prev)
"Full Screen" → invoke('window::toggle_fullscreen')
"Toggle Library Panel" → setLibraryPanelVisible(prev => !prev)
"Toggle Right Panel" → setRightPanelVisible(prev => !prev)
TOOLS MENU:
"MIDI Controller Setup..." → setMidiSetupOpen(true)
"Macro Editor..." → setMacroEditorOpen(true)
"Hotkey Manager..." → setHotkeyManagerOpen(true)
"AI Settings..." → setSettingsOpen(true); setSettingsCategory('ai')
"Model Manager..." → setModelManagerOpen(true)
HELP MENU:
"Help Portal" → openBrowser('https://docs.syncsanctuary.app')
"User Manual (PDF)" → openBrowser('https://docs.syncsanctuary.app/manual.pdf')
"Keyboard Shortcuts..." → setKeyboardShortcutsOpen(true)
"Check for Updates..." → invoke('updater::check')
"Log Files → View Current Log" → invoke('logs::open_folder')
"About SyncSanctuary..." → setAboutOpen(true)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART NINE — STREAMING AND RECORDING CONTROLS (Complete Wiring Specification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
9.1 — Start/Stop Recording:
const handleStartRecording = async () => {
setIsStartingRecording(true);
try {
await invoke('recording::start', {
outputPath: recordingOutputPath,
format: selectedFormat,
includeIso: includeIsoRecording,
});
setIsRecording(true);
} catch (e) {
showError(Failed to start recording: ${parseError(e)});
} finally {
setIsStartingRecording(false);
}
};
const handleStopRecording = async () => {
// Show confirmation if recording time is significant (> 5 minutes)
if (recordingDurationSeconds > 300) {
const confirmed = await invoke('dialog::confirm', {
title: 'Stop Recording?',
message: 'Are you sure you want to stop the recording?'
});
if (!confirmed) return;
}
await invoke('recording::stop');
setIsRecording(false);
};
9.2 — Start/Stop Streaming:
const handleStartStreaming = async () => {
setIsStartingStream(true);
try {
await invoke('streaming::start', {
destinations: selectedStreamDestinations,
bitrateKbps: selectedBitrate,
});
setIsStreaming(true);
} catch (e) {
showError(Failed to start stream: ${parseError(e)});
} finally {
setIsStartingStream(false);
}
};
// Stream health monitoring events:
listen('streaming::health', (e) => {
setStreamHealth(e.payload); // { bitrate, droppedFrames, rtt, status }
});
listen('streaming::disconnected', (e) => {
showStreamDisconnectedDialog(e.payload.reason);
setIsStreaming(false);
});
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART TEN — AUDIO MIXER (Complete Wiring Specification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The audio mixer is a real-time control surface. Every control MUST communicate with
the Rust audio engine via Tauri commands:
10.1 — Channel Fader:
<Slider
min={-Infinity}
max={6}
step={0.1}
value={channel.faderDb}
onValueChange={(value) => {
// Immediately update local state for zero-latency UI feedback
updateChannelLocal(channelId, { faderDb: value });
// Send to audio engine (debounced to avoid flooding IPC)
debouncedInvoke('audio::set_fader', { channelId, db: value }, 16);
}}
/>
10.2 — Mute Toggle:
<button
className={channel.muted ? 'mute-btn muted' : 'mute-btn'}
onClick={() => {
const newMuted = !channel.muted;
updateChannelLocal(channelId, { muted: newMuted });
invoke('audio::set_mute', { channelId, muted: newMuted });
}}
aria-pressed={channel.muted}
aria-label={${channel.name} mute}


{channel.muted ? <MuteIcon /> : <VolumeIcon />}
  </button>
10.3 — VU Meter:
The VU meter is driven by "audio::levels" events from the Rust audio engine,
emitted at 30fps (every ~33ms):
listen('audio::levels', (e) => {
// e.payload: { channelId: string, leftDb: number, rightDb: number, peakLeftDb: number, peakRightDb: number }
updateMeterLevels(e.payload);
});
The meter renders as a canvas element (not SVG) for performance:
The paint function runs in requestAnimationFrame and draws colored bars:
0% to 60% of range: #00C800 (green)
60% to 80% of range: #C8C800 (yellow)
80% to 100% of range: #C80000 (red)
Peak hold line: 2px white line at the peak position, decays after 1500ms.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART ELEVEN — AI SLIDE AUTOMATION (Complete Wiring Specification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
11.1 — AI Auto-Advance Toggle:
const handleAutoAdvanceToggle = (enabled: boolean) => {
setAutoAdvanceEnabled(enabled);
invoke('ai::set_auto_advance_enabled', { enabled });
};
<Switch
 checked={autoAdvanceEnabled}
 onCheckedChange={handleAutoAdvanceToggle}
 aria-label="AI slide auto-advance"
/>
11.2 — Auto-Advance Preview Notification:
The Rust AI engine emits "ai::advance_preview" when it is about to trigger a slide
advance. The frontend has 2 seconds to cancel it:
listen('ai::advance_preview', (e) => {
setAdvancePreview({
targetSlide: e.payload.slide,
matchText: e.payload.matchedText,
score: e.payload.similarityScore,
cancelDeadline: Date.now() + 2000,
});
// Auto-dismiss after 2 seconds (the advance has fired)
setTimeout(() => setAdvancePreview(null), 2000);
});
// Cancel button in the notification:
const handleCancelAdvance = () => {
invoke('ai::cancel_advance');
setAdvancePreview(null);
};
// Manual override lock detection:
listen('ai::manual_override_active', (e) => {
setManualOverrideLockSeconds(e.payload.remainingSeconds);
});
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART TWELVE — HARDWARE DEVICE EVENTS (Complete Wiring Specification)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
12.1 — Device Hot-Plug Notifications:
The Rust backend monitors hardware events (USB, DisplayPort, HDMI) and emits:
"device::connected" → { device: DeviceInfo }
"device::disconnected" → { deviceId: string, deviceName: string, role: string }
"device::signal_lost" → { deviceId: string, deviceName: string }
The frontend MUST handle all three:
listen('device::connected', (e) => {
showDeviceToast({
type: 'connected',
device: e.payload.device,
// Toast shows: device name, icon, "Assign to output ▾" dropdown
// Auto-dismisses after 8 seconds
// "Assign" button onClick: invoke('device::assign_role', { deviceId, role })
});
});
listen('device::signal_lost', (e) => {
  // Show red warning overlay on the affected panel
  setDeviceWarning({
    deviceId: e.payload.deviceId,
    deviceName: e.payload.deviceName,
    message: normalMode ? 'Camera disconnected — check the cable'
                        : `Signal lost: ${e.payload.deviceName}`,
  });
});
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART THIRTEEN — TAURI COMMAND REGISTRY (Complete Required Command List)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following Tauri commands MUST be registered in the Rust backend and properly
handled. Every command listed here corresponds to a frontend call via invoke().
No command may be a stub that returns immediately without performing its action.
AUTH COMMANDS:
login(identifier, password) → AuthResponse | ApiError
logout(refreshToken) → void
refresh_tokens() → TokenPair | ApiError
get_refresh_token_from_keychain() → String | KeychainError
clear_keychain_token() → void
clear_memory_token() → void
store_refresh_token_in_keychain(token, userId?) → void
PRESENTATION COMMANDS:
project::new_presentation() → PresentationId
project::open(path) → Presentation
project::save() → void
project::save_as(path) → void
project::duplicate_slide(slideId) → SlideId
project::delete_slide(slideId) → void
project::reorder_slides(slideIds) → void
VIDEO COMMANDS:
video::set_live_slide(slideId) → void
video::set_cued_slide(slideId) → void
video::clear_all() → void
video::clear_slide() → void
video::clear_media() → void
video::clear_announcements() → void
video::clear_messages() → void
video::set_scene(sceneId) → void
AUDIO COMMANDS:
audio::set_fader(channelId, db) → void
audio::set_mute(channelId, muted) → void
audio::set_solo(channelId, solo) → void
audio::mute_all() → void
audio::set_eq_band(channelId, bandIndex, params) → void
audio::set_compressor(channelId, params) → void
TIMER COMMANDS:
timer::start(timerId) → void
timer::pause(timerId) → void
timer::reset(timerId) → void
timer::set_target(timerId, seconds) → void
timer::create(definition) → TimerId
timer::delete(timerId) → void
STREAMING COMMANDS:
streaming::start(destinations, bitrateKbps) → void
streaming::stop() → void
streaming::get_health() → StreamHealth
RECORDING COMMANDS:
recording::start(outputPath, format, includeIso) → void
recording::stop() → RecordingFile
recording::pause() → void
recording::resume() → void
recording::get_remaining_disk_space() → DiskSpaceInfo
AI COMMANDS:
ai::set_auto_advance_enabled(enabled) → void
ai::cancel_advance() → void
ai::set_sensitivity(value) → void
ai::get_session_report() → SessionReport
DEVICE COMMANDS:
device::assign_role(deviceId, role) → void
device::enumerate() → DeviceList
device::get_current() → ActiveDevices
SETTINGS COMMANDS:
settings::load_all() → Settings
settings::save_all(settings) → void
settings::save_secure(key, value) → void
settings::get_secure(key) → String
settings::save_panel_size(panel, size) → void
settings::save_preference(key, value) → void
settings::get_preference(key) → Value
MACRO COMMANDS:
macro::execute(macroId) → void
macro::save(macroId, definition) → void
macro::delete(macroId) → void
macro::list() → Macro[]
SYSTEM COMMANDS:
app::quit() → void
window::toggle_fullscreen() → void
window::toggle_always_on_top() → void
updater::check() → UpdateInfo | None
logs::open_folder() → void
dialog::confirm(title, message) → bool
dialog::open_file(filters) → String | None
dialog::save_file(defaultPath, filters) → String | None
SHELL COMMANDS:
shell::open_url(url) → void
(This replaces the direct @tauri-apps/api/shell import in commands that need
the browser to open — all external links MUST use this command, not window.open())
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART FOURTEEN — STATE MANAGEMENT ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
14.1 — Zustand Store Architecture (required stores):
authStore:
status: AuthStatus
user: User | null
offlineMode: boolean
sessionExpiryReason: string | null
actions: { setAuthenticated, setUnauthenticated, setOffline, setUpdateRequired }
presentationStore:
presentations: Presentation[]
activePresentation: Presentation | null
activePresentationId: string | null
selectedSlideIds: Set<string>
liveSlideId: string | null
cuedSlideId: string | null
lastSelectedSlideId: string | null
actions: { selectSlide, sendToLive, setCued, addPresentation, removePresentation }
uiStore:
theme: 'dark' | 'light'
proMode: boolean
studioMode: boolean
leftPanelWidth: number
rightPanelWidth: number
libraryPanelVisible: boolean
rightPanelVisible: boolean
activeLeftTab: 'library' | 'playlist'
activeRightTab: 'theme' | 'slide' | 'arrangement' | 'bible'
settingsOpen: boolean
settingsCategory: string
searchQuery: string
actions: { setTheme, setProMode, toggleStudioMode, setSettingsOpen, setSearchQuery }
audioStore:
channels: AudioChannel[]
masterFaderDb: number
isMasterMuted: boolean
meterLevels: Record<string, MeterLevel>
actions: { setFader, setMute, setSolo, updateMeterLevel }
streamingStore:
isStreaming: boolean
isRecording: boolean
streamHealth: StreamHealth | null
recordingDurationSeconds: number
actions: { setStreamingState, setRecordingState, updateHealth }
deviceStore:
connectedDevices: Device[]
deviceWarnings: DeviceWarning[]
actions: { addDevice, removeDevice, setWarning, clearWarning }
timerStore:
timers: Timer[]
actions: { startTimer, pauseTimer, resetTimer, updateTimer }
14.2 — Tauri Event → Zustand Store Binding:
The AuthGate component binds all auth:: events to authStore.
The MainApplicationShell binds all other events to their respective stores.
All bindings happen in useEffect with proper unlisten cleanup.
NO component outside of the designated binding component may emit or listen to
Tauri events for state that is managed by a Zustand store.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART FIFTEEN — ERROR BOUNDARY AND CRASH RECOVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
15.1 — React Error Boundaries:
Every major panel (SlideGrid, AudioMixer, VideoOutputPanel, MediaBin, Inspector,
LibraryPanel, PlaylistPanel) MUST be wrapped in an ErrorBoundary component:
class ErrorBoundary extends React.Component {
state = { hasError: false, error: null };
static getDerivedStateFromError(error) { return { hasError: true, error }; }
componentDidCatch(error, info) {
invoke('logs::report_error', {
component: this.props.componentName,
error: error.message,
stack: info.componentStack,
});
}
render() {
if (this.state.hasError) {
return (
<div className="error-fallback">
<p>{this.props.componentName} encountered an error.</p>
<button onClick={() => this.setState({ hasError: false })}>Retry</button>
</div>
);
}
return this.props.children;
}
}
Panel failure MUST NOT crash the entire application. If the audio mixer panel
throws an error, the slide grid and output must continue to function.
15.2 — Rust Panic Recovery:
All Tauri command handlers MUST use std::panic::catch_unwind or the equivalent
to prevent Rust panics from crashing the main process. A panic in a command handler
MUST be caught, logged, and returned as an error to the frontend.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART SIXTEEN — CROSS-REFERENCE TO SYNCSANCTUARY_WEB_MASTER_PROMPT.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The following sections of the web platform specification directly constrain this
desktop specification. Any conflict between a web spec section and this document
is resolved by referring to both and implementing the more restrictive requirement.
WEB SPEC PART 2.1 — Token Architecture:
The desktop uses Authorization: Bearer {raw_refresh_token} for refresh calls.
The JWT payload structure (sub, username, role, client_type, iat, exp, jti) is
identical. The desktop reads username and role from the JWT claims.
WEB SPEC PART 2.5 — Login Flow:
The desktop sends client_type: "desktop", client_version, and platform in every
POST /auth/login request body. The server routes these appropriately.
WEB SPEC PART 7.4 — Update Manifest:
The desktop auto-updater polls: GET /updates/desktop/{platform}/{arch}/latest.json
Verified with ed25519 signature before any installation.
WEB SPEC PART 18 — Unified Database Auth Contract:
All scenarios in Part 18 of the web spec (password change, session revocation,
account deletion grace period, theft detection, etc.) MUST be handled by the
desktop as specified. The HTTP status code handling table in Part 18.11 is the
authoritative reference for how the desktop responds to every auth error code.
WEB SPEC PART 1.2 — refresh_tokens.client_type:
Desktop login sets client_type = 'desktop'.
Desktop tokens expire at created_at + 90 days (not 30 days like web sessions).
This is determined server-side — the desktop does not set its own expiry.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART SEVENTEEN — ALL V1 SPECIFICATIONS REMAIN IN EFFECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All parts of Version 1.0 of this specification that are not explicitly superseded by
Version 2.0 remain in full effect. Version 2.0 adds to and overrides Version 1.0.
It does not replace the following V1 sections, which are unchanged:
Part 0 (Technology Stack) — unchanged.
Part 2 (Application Shell Visual Spec) — unchanged, wiring added in V2 Part TWO.
Part 3 (Menu Bar Visual Spec) — unchanged, wiring added in V2 Part EIGHT.
Part 4 (Toolbar Visual Spec) — unchanged, wiring added in V2 Part FOUR.
Part 5 (Left Panel Visual Spec) — unchanged.
Part 6 (Center Panel Visual Spec) — unchanged, wiring added in V2 Part THREE.
Part 7 (Right Panel Visual Spec) — unchanged, wiring added in V2 Part SEVEN.
Part 8 (AI Video Editor) — unchanged.
Part 9 (Presentation and Production Engine) — unchanged, wiring in V2 Part TEN-TWELVE.
Part 10 (Floating Panels Visual Spec) — unchanged, wiring added in V2 Part SIX.
Part 11 (Settings Modal Visual Spec) — unchanged, wiring added in V2 Part FIVE.
Part 12 (Reflow Editor) — unchanged.
Part 13 (Stage Display) — unchanged.
Part 14 (Slide Editor) — unchanged.
Part 15 (Performance Architecture) — unchanged.
Part 16 (Internationalization) — unchanged.
Part 17 (Security) — unchanged.
Part 18 (Auto-Update) — unchanged.
Part 19 (Sample Data) — unchanged.
Part 20 (Observability) — unchanged.
Part 21 (Keyboard Shortcuts) — unchanged, wiring mandatory per V2 Part TWO.4.
Appendix A (Speech Recognition) — unchanged.
Appendix B (ProPresenter/OBS Compatibility) — unchanged.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL COMPLIANCE STATEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
An implementation is only compliant with Version 2.0 of this specification if and only
if every item in the verification checklist in Part ZERO.5 passes physical testing.
Partial compliance does not exist. An application with a working slide grid but a
non-functional login is not "mostly working" — it is a non-functional application.
An application where the login works but none of the application controls respond is
not "better" than Version 1.0 — it is the same defect in a different location.
The purpose of every church using this software is to facilitate their community's
worship experience on Sunday morning. A production tool that fails silently, requires
login on every launch, or presents unresponsive controls is not a minor inconvenience —
it is a direct failure of the people depending on it when it matters most.
Build this correctly, completely, and verifiably. Every line. Every button. Every API call.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
END OF DOCUMENT: SYNCSANCTUARY DESKTOP APPLICATION V2.0 MASTER SPECIFICATION
Version 2.0 — Supersedes Version 1.0 in all auth, wiring, and interactivity matters.
Companion: SYNCSANCTUARY_WEB_MASTER_PROMPT.md (unchanged, remains in full effect)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


APPENDIX A — AI SYSTEM: ADVANCED SPEECH RECOGNITION (COMPLETE REFERENCE)
This appendix documents the full production-grade speech recognition system for the
SyncSanctuary platform. This system is designed for MAXIMUM accuracy under the
most challenging real-world conditions: background music, PA reverb, congregational
ambient noise, singing with vibrato and elongated phonemes, overlapping speakers,
and poor microphone placement.
A.1 End-to-End Pipeline Diagram
┌─────────────────────────────────────────────────────────────────────┐
│                      INPUT LAYER                                     │
│  Microphone Array → Beamforming → AGC → ADC (48kHz/24-bit)         │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  SIGNAL PREPROCESSING                                │
│  DC Removal → Pre-emphasis (α=0.97) → STFT → Log-Mel (80 bins)     │
│  Z-score normalization per chunk                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│              AEC (Acoustic Echo Cancellation)                        │
│  WebRTC AEC3, 150ms tail, reference = loopback audio               │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│              NOISE REDUCTION                                         │
│  RNNoise / DeepFilterNet2, configurable 0–100%                      │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│              VAD (Voice Activity Detection)                          │
│  Silero VAD v4, 32ms windows, <5ms latency                         │
│  Gate: only speech-active frames advance to next stage              │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓ (speech frames only)
┌─────────────────────────────────────────────────────────────────────┐
│              SOURCE SEPARATION (Optional / GPU only)                 │
│  Demucs v4 (htdemucs), extracts vocal stem                         │
│  Runs 4× real-time on GPU, disabled on CPU-only systems             │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│         SINGING / SPEECH CLASSIFIER (lightweight CNN, <1ms)         │
│  Routes to singing-optimized path if sung audio detected            │
└──────────────┬───────────────┴──────────────────────────────────────┘
               ↓ Speech path       ↓ Singing path
               │                   │ Pitch normalization (PSOLA)
               │                   │ Elongated phoneme handling
               └─────────┬─────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────────┐
│              ASR: WHISPER LARGE-V3                                   │
│  Beam size 5, word timestamps, custom vocabulary bias               │
│  Multi-hypothesis output (top-5 beams)                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│              LM RE-SCORING                                           │
│  KenLM 4-gram (church corpus), λ=0.7                                │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│              POST-PROCESSING                                         │
│  Punctuation restoration → Capitalization → Filler detection        │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│              SPEAKER DIARIZATION                                     │
│  pyannote.audio 3.x, ECAPA-TDNN embeddings                         │
│  Overlap-aware, renaming support                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│              CONFIDENCE SCORING + HALLUCINATION FILTER              │
│  Entropy masking, repetition detection, no_speech_prob gate         │
└──────────────────────────────┬──────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│              OUTPUT                                                  │
│  Word-level timestamped transcript → subscribers:                   │
│  - Live captioning display                                          │
│  - Segment classifier                                               │
│  - AI slide automator                                               │
│  - Transcript database                                              │
└─────────────────────────────────────────────────────────────────────┘
A.2 Metrics and Evaluation Targets
ScenarioTarget WERNotesClean speech, neutral accent<3%BaselineLight background noise (SNR >20dB)<5%Typical worship band at practice volumeHeavy noise (SNR 5–10dB)<15%Congregation singing + PA reverbSpeech + background music<10%Sermon with background musicSinging only (congregation)<25%Lyrics recognition modeSinging + music<35%Most challenging scenarioOverlapping speakers (2)<20%Per-speaker WERKorean church service<5%With ko language pack
Additional advanced metrics:

Hallucination Rate: frequency of model generating words when only background noise is present.
Target: <1% (measured as word insertions per minute during silence/music-only periods).
DER (Diarization Error Rate): <10% on 2-speaker scenarios, <20% on 3–4 speaker scenarios.
Insertion/Deletion/Substitution breakdown: logged per session for diagnostics.

A.3 MLOps — Continuous Improvement Lifecycle
Shadow deployment:

When a new model version is available, it can be enabled in "shadow mode":
route 100% of live audio through both the current (serving) and new (shadow) models.
Log both outputs. Compare WER on accumulated data. If new model shows ≥5% WER improvement
with no regressions: promote to serving. If regression detected: keep current model.

Teacher-student distillation:

The large-v3 model (teacher) is used to generate pseudo-labels on church-domain audio.
A medium or small model (student) is then fine-tuned on these labels.
Student achieves ~80% of teacher's accuracy at ~4× the inference speed.
The student model is used for real-time streaming; the teacher is used for batch transcription.

Telemetry metadata logged per session (used for monitoring data drift):
json{
  "session_id": "uuid",
  "timestamp": "ISO8601",
  "duration_ms": 5400000,
  "language_detected": "ko",
  "language_confidence": 0.94,
  "avg_snr_db": 12.4,
  "music_present": true,
  "music_presence_fraction": 0.65,
  "avg_word_confidence": 0.87,
  "hallucination_events": 2,
  "model_version": "large-v3",
  "inference_device": "cuda",
  "avg_inference_latency_ms": 210
}
Note: no audio content, no transcript text, no PII is included in telemetry.
User must explicitly opt in to telemetry in Settings → Privacy.

APPENDIX B — COMPATIBILITY WITH PROPRESENTER AND OBS
This appendix documents how SyncSanctuary provides full feature parity with ProPresenter 7
and OBS Studio 30.x, so that churches migrating from those platforms lose no functionality.
B.1 ProPresenter Feature Parity
Every feature listed in the ProPresenter 7 specification is implemented in SyncSanctuary.
Specific callouts:

Presentation file import: .pro, .pro6, .pro7 formats fully parsed (reverse-engineered
XML schema). Slides, themes, arrangements, media references, and stage display configurations
are all imported correctly.
Looks: fully implemented (see Part 10.6 of this spec).
Arrangements: fully implemented with the same drag-to-reorder behavior.
Stage display: fully implemented with identical layout options (current/next/clock/notes).
Props / lower thirds: fully implemented (see Part 10.2).
Messages / ticker: fully implemented (see Part 10.3).
Macros: fully implemented (see Part 10.4).
Bible search and display: fully implemented with same translations.
Reflow editor: fully implemented (see Part 12 of this spec).
CCLI song info: stored per song presentation (CCLI number, copyright, author fields).
Confidence monitors / stage display: fully implemented.
Hot keys per slide: each slide can have a keyboard shortcut assigned.

B.2 OBS Studio Feature Parity
Every feature listed in the OBS Studio 30.x specification is implemented in SyncSanctuary.
Specific callouts:

Scene collections and profiles: fully implemented.
All source types: Display Capture, Window Capture, Game Capture, Video Capture Device,
Audio Input Capture, Audio Output Capture, Image, Image Slideshow, Media Source, Browser Source,
Color Source, Text, Nested Scene — all implemented.
All filter types: Color Correction, Chroma Key, Color Key, Luma Key, Crop/Pad, Gain,
Compressor, Noise Suppression, Noise Gate, VST 2.x Plugin, Video Delay, Audio/Video Sync,
Render Delay, Image Mask/Blend, Scaling/Aspect Ratio, Sharpen, Color Grade — all implemented.
Audio mixer: full channel strip (see Part 9.2 of this spec).
Virtual camera: output any scene as a virtual camera (V4L2 on Linux, OBSVirtualCam-style
driver on Windows, DAL plugin on macOS).
NDI output: fully implemented (see Part 9.3.4).
RTMP/RTMPS streaming: fully implemented (see Part 9.3.8).
Multi-platform simultaneous streaming: fully implemented.
Hotkeys and macro system: fully implemented.
Stats dock: all OBS stats metrics implemented in SyncSanctuary's Pro mode status bar.
Projector outputs: implemented as "display output windows" (see Part 9.3.4).
Studio mode (preview/program): fully implemented (see Part 9.4).
Transition types: all OBS transitions implemented plus additional ones from ProPresenter.
Scene transitions dock: implemented as part of the right panel controls area.

B.3 Migration Assistant
A "Migration Wizard" (accessible from File → Import) guides users through:

Detecting installed ProPresenter or OBS Studio on the same machine.
Reading their existing project/scene collections.
Converting to SyncSanctuary's format.
Flagging any features that could not be automatically converted (e.g., custom OBS Lua scripts)
for manual review.

Context:
You have generated the foundational code and wired up the logic for the application. However, AI coding assistants often leave behind mocked states, disconnected UI components, or unhandled promises. We are not moving forward until we triple-check that the current codebase is 100% functional and adheres strictly to the Master Specification.

Engineering Directive:
Shift your persona to a Principal QA Engineer and Code Reviewer. Your sole task in this response is to brutally audit the code you have provided so far. Do not write new features. You must "triple-check" the existing implementation using the methodology below.

THE TRIPLE-CHECK METHODOLOGY:

1. The "Dead End" Trace (UI to Backend):

Audit every interactive element on the screen (e.g., Login button, Slide selection, App startup).

Trace the logic path: Does the button trigger a React event? Does the event update the Zustand store? Does the store trigger a Tauri invoke()? Does the Rust backend actually execute the logic, or is it returning a hardcoded Ok()?

Action: If any part of this chain is broken, mocked, or missing, output the exact code required to complete the circuit.

2. The State Integrity Check (Zustand):

Audit the Zustand store implementation.

Are components actually subscribing to the store, or are they using local useState variables that will desync?

Action: Identify any component that is not properly reacting to global state changes and provide the code to fix it.

3. The "Sad Path" Verification (Error Handling):

Audit the data validation and network calls.

What happens if the backend server is offline? What happens if the Postgres database rejects the input due to our strict CHECK constraints? What happens if the user inputs an invalid password format?

Action: If the app currently just throws a silent console error, you must provide the code to catch that error and display a proper UI notification/alert to the user as defined in the spec.

Execution & Reporting Format:
Do not simply say "Everything looks good." I require a strict Audit Report.

Failures Found: List exactly what was mocked, broken, or missing based on your triple-check.

The Fixes: Provide the exact, complete code blocks (with file paths) to remediate every failure you found. No pseudo-code. No // ... existing code.

Begin the audit now.

