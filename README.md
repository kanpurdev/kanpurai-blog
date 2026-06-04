# Blog CMS — Next.js 15 + Prisma + Auth.js + Server Actions

Production-ready blog management module designed to plug into an existing SaaS platform.

## Stack
- Next.js 15 (App Router, React 19)
- TypeScript, Tailwind CSS, shadcn-style UI
- PostgreSQL via Prisma 5
- Auth.js (NextAuth v5 beta) with Credentials provider
- Server Actions throughout (no REST API)
- Tiptap rich text editor with autosave
- Recharts analytics

## Roles & Workflow
- **ADMIN** — full access; approves/rejects, manages users, taxonomy, comments, analytics
- **CONTRIBUTOR** — creates and publishes directly; can edit own blogs
- **USER** — creates drafts, submits for review, edits rejected blogs and resubmits
- **Guest** — reads published blogs at `/blog` and `/blog/[slug]`

Statuses: DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED, or REJECTED (with feedback) → edit → resubmit. Plus ARCHIVED.

## Setup

```bash
cp .env.example .env
# Edit DATABASE_URL and set AUTH_SECRET (openssl rand -base64 32)

npm install               # or pnpm / bun
npx prisma migrate dev    # creates schema in your Postgres
npm run db:seed           # creates demo users + categories + posts
npm run dev
```

### Demo logins (Password123!)
- `admin@demo.io` — Admin
- `contrib@demo.io` — Contributor
- `user@demo.io` — User

## Structure

```
prisma/
  schema.prisma           # User, Blog, Category, Tag, Comment, ReviewRequest, Notification, Analytics
  seed.ts
src/
  auth.ts                 # NextAuth setup (credentials + Prisma adapter, JWT sessions)
  auth.config.ts          # Edge-safe config (used by middleware)
  app/
    layout.tsx            # Theme + Toaster
    page.tsx              # Marketing home with featured posts
    (auth)/login, register
    (public)/blog, blog/[slug]   # Public blog with search/filters/pagination
    dashboard/             # RBAC-gated module
      layout.tsx           # Role-aware sidebar + topbar
      page.tsx             # Admin overview / personal overview
      blogs/, blogs/new, blogs/[id]/edit
      reviews/, reviews/[id]
      categories, tags, comments
      users, contributors
      analytics, settings, profile
      my-blogs, drafts, submitted, rejected
    api/auth/[...nextauth]/route.ts
  components/
    ui/                    # button, input, card, dialog, dropdown, select, tabs, badge, avatar, …
    editor/tiptap.tsx      # Rich editor with autosave
    blog/                  # blog-card, blog-form, comments, view-tracker
    dashboard/             # sidebar, topbar, stat-card, status-badge, analytics-chart, review-actions, users-table, taxonomy-manager
    theme-provider.tsx
  server/actions/          # auth.ts, blog.ts, taxonomy.ts, users.ts (all "use server")
  lib/                     # prisma client, utils, slug, rbac
middleware.ts              # Protects /dashboard/*
```

## Integrating into your existing platform

This module is self-contained. To merge into an existing Next.js platform:

1. Copy `prisma/schema.prisma` models into your schema (merge `User` carefully — keep one source of truth for users and add the `role`, `bio` fields).
2. Copy `src/server/actions/*`, `src/lib/rbac.ts`, `src/lib/slug.ts`, and `src/lib/prisma.ts` adapter (or wire to your existing one).
3. Copy the `src/app/(public)/blog/*` and `src/app/dashboard/*` route trees. Rename/relocate the dashboard segment to fit your existing nav.
4. Reuse your existing Auth.js setup — drop our `auth.ts` and ensure `session.user.role` is populated in your callbacks.
5. Copy `src/components/blog/*`, `src/components/editor/*`, `src/components/dashboard/*`, and the `ui/*` primitives you don't already have.

## Key features
- Tiptap editor: headings, lists, quotes, code blocks, images, links, undo/redo, autosave every 2.5s
- SEO: per-post metaTitle / metaDescription / OG image / canonical, Article JSON-LD, slug auto-generation with uniqueness
- Analytics: view tracking (hashed, 1 hr dedup window), 30-day chart, top blogs, top authors
- Notifications: created on submit / approve / reject / new comment
- Review workflow: feedback required on rejection, surfaced to author on edit
- Responsive, dark mode via next-themes

## Notes
- For production, swap to Postgres connection pooling (PgBouncer / Neon / Supabase) and add `directUrl` in `schema.prisma`.
- Add rate limiting to `addCommentAction` and `incrementViewAction` (e.g. Upstash) before going public.
- Replace Credentials provider with OAuth providers as needed.
