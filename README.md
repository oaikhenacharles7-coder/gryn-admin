# Gryn Admin / Staff — Vercel UI, existing Cloudflare backend

This release replaces the old React interface with the created CRM's static interface (admin release 44). All `/api/gryn/*` requests go to the existing Gryn Cloudflare backend; its role checks, sessions, D1 database and R2 document store remain authoritative. No database is copied, cleared or initialized by this repository. This is not a standalone database migration.

Run `npm test` and `npm run build` with Node 22 or newer. No npm dependencies are required. Vercel build emits Build Output API v3 assets and conditional proxy routes. Mutable requests require an exact permitted browser Origin before the upstream Origin is set. Other mutable requests are rejected; API responses are never cached. Session cookies are supplied by the backend, remain HttpOnly/Secure, and are scoped to the Vercel hostname. Users sign in again on Vercel; existing Cloudflare sessions are not copied.

Set Vercel framework to Other, build command `node scripts/build.mjs`, install command `echo No dependencies required`; use the supplied `vercel.json`. Production and current preview origins are generated at build time from Vercel's URL variables. Do not add wildcard Origin rules or expose database credentials. No service-role token or Cloudflare API token belongs in public assets.

Before switching production: verify preview login/dashboard assets, invalid-origin POST rejection, same-origin POST reaches backend authentication, and unauthenticated state requests return 401. Test real login, saving and document uploads in an authorized acceptance session. A production switch does not change records, but normal user actions continue writing to the SAME existing backend.

Remove project-level redirects for `/` and `/admin_login` after promoting this deployment; otherwise those project routes take precedence over local pages. Keep other routes unchanged. Restore the previous deployment and redirects if acceptance fails. The original `Iamfineboyygabriel/gryn-admin` repository and old `api.grynindexedu.com` backend are not used or modified by this release.

Storage availability and feature behavior depend on the current Cloudflare-hosted Gryn backend, which must remain published. The external agent/student portal remains separate.
