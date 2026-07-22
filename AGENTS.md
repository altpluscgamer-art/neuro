<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:skills-and-knowledge -->
# Skills & Knowledge

## Site Architecture Skill

Location: `C:\script\.claude\skills\site-architecture\`

Use this skill when planning, mapping, or restructuring the website's page hierarchy, navigation, URL structure, or internal linking. Key files:

- `SKILL.md` — Information architecture: 3-click rule, flat vs deep hierarchy, navigation design, URL patterns, internal linking strategy, visual sitemaps (Mermaid)
- `references/navigation-patterns.md` — Header, mega menu, footer, sidebar, breadcrumbs, mobile navigation patterns
- `references/site-type-templates.md` — Page hierarchy templates for SaaS, content, e-commerce, documentation, small business sites
- `references/mermaid-templates.md` — Copy-paste Mermaid diagrams for visual sitemaps
- `evals/evals.json` — Test cases for the skill

When working on site structure changes, read these files first and apply the patterns.

## Awesome Hermes Agent

Source: https://github.com/0xNyk/awesome-hermes-agent

Curated directory of skills, plugins, memory providers, tools, and guides for Hermes Agent by Nous Research. Use this as a reference when:

- Looking for community skills and plugins (skill factories, litprog, multi-agent orchestration, deep-research)
- Finding memory providers and persistence layers
- Discovering tools and utilities (deployment, web search, analytics)
- Exploring integrations and bridges (Discord, WhatsApp, Telegram, Feishu, Slack)
- Researching multi-agent and swarm patterns
- Finding domain-specific applications (cybersecurity, finance, content creation)
- Reading operational playbooks and level-up blueprints

Key resources from the directory:
- **Official Hermes Agent**: https://github.com/NousResearch/hermes-agent
- **Skills Hub**: https://agentskills.io (cross-platform agent skills standard)
- **Documentation**: https://hermes-agent.nousresearch.com/docs/
- **Community**: https://discord.gg/NousResearch

Maturity tags: **production** (stable, safe to build on), **beta** (works but evolving), **experimental** (early stage).

Always check the trust boundary before enabling community skills — verify who can trigger it, what credentials it reads, and how to stop it.

## Emil Kowalski's Design Engineering Skills

Source: https://github.com/emilkowalski/skills

Skills for design engineers — UI polish, animation decisions, component design, and the invisible details that make software feel great. Based on experience at Vercel and Linear.

Key skills:
- **emil-design-eng** — Main skill: animation philosophy, component building principles, CSS transform mastery, clip-path animation, gesture/drag interactions, performance rules, accessibility, stagger animations, debugging
- **review-animations** — Strict animation review based on Emil's rules
- **improve-animations** — Audit all animations in codebase, get prioritized plans
- **find-animation-opportunities** — Find places that benefit from motion (and what NOT to animate)
- **animation-vocabulary** — Get better animations by using the right words
- **apple-design** — Apple's interface design principles translated for the web
- **pick-ui-library** — Pick the right library instead of hand-rolling or installing abandoned packages

Core principles to apply:
- Taste is trained, not innate — study why best interfaces feel good
- Unseen details compound — invisible correctness creates interfaces people love
- Only animate `transform` and `opacity` (GPU-accelerated)
- Never use `ease-in` for UI — use `ease-out` with custom cubic-bezier curves
- UI animations under 300ms — 100-160ms for button press, 150-250ms for dropdowns
- Buttons must feel responsive: `transform: scale(0.97)` on `:active`
- Never animate from `scale(0)` — start from `scale(0.95)` with `opacity: 0`
- Popovers scale from trigger (not center); modals stay centered
- Use `@media (prefers-reduced-motion: reduce)` for accessibility
- Gate hover animations behind `@media (hover: hover) and (pointer: fine)`
- CSS animations beat JS under load (off main thread)
- Stagger delays: 30-80ms between items
- Review animations the next day with fresh eyes

Use these skills when building UI components, adding animations, reviewing interface quality, or making design decisions.
<!-- END:skills-and-knowledge -->

<!-- BEGIN:project-context -->
# Project: NEURO

Онлайн-платформа для родителей и детских нейропсихологов.

## Tech Stack
- Next.js 16 (App Router, Turbopack)
- TypeScript + Tailwind CSS v4
- Prisma 7 + SQLite (dev) / PostgreSQL (prod)
- NextAuth.js v4 (credentials provider)
- @react-pdf/renderer (PDF reports)
- Vitest (tests)

## Admin Access
- URL: /auth/login
- Email: admin@neuro.ru
- Password: admin123

## Color Palette (from business card)
- Primary: olive-green #6A7450
- Accent: warm orange #EC8538
- Background: cream #FAF5EF
- Dark: #2A3023

## Key Directories
- `src/app/(public)/` — public pages with Header/Footer
- `src/app/admin/` — admin panel (no public Header/Footer)
- `src/app/api/` — API routes
- `src/lib/` — prisma, auth, screening-logic, settings, notifications
- `src/components/` — Header, Footer, ErrorBoundary, etc.
- `prisma/` — schema, migrations
- `scripts/` — backup, deployment scripts

## Running
- `setup.bat` — one-click full deploy
- `dev.bat` — dev mode with hot reload
- `backup.bat` — manual backup
- `install-backup.bat` — weekly auto-backup (Windows Task Scheduler)
<!-- END:project-context -->
