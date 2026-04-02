# Flatmate

> A calendar-first shared living app — track expenses, meals, tasks, groceries, and events together with your flatmates.

---

## About

Flatmate is a full-stack web application designed for people sharing a home. It provides collaborative tools for expense splitting, grocery list management, shared meal planning, task assignment, and a unified household calendar — all accessible from a single dashboard. Built on Next.js with Supabase for real-time data and authentication.

## Features

- **Shared Expenses** — Log, split, and track household expenses between flatmates with per-person breakdowns
- **Grocery Lists** — Collaborative grocery shopping list with item assignment and status tracking
- **Meal Planner** — Plan and log shared meals; OCR-powered receipt scanning via Tesseract.js
- **Task Manager** — Create and assign household chores and recurring tasks
- **Household Calendar** — Unified event and reminder calendar for the flat
- **AI Assistant** — Google Gemini AI integration for smart household suggestions
- **Authentication** — Supabase Auth (email/password + OAuth)
- **Profile & Settings** — Per-user preferences and household configuration
- Full test suite — Vitest (unit tests) + Playwright (end-to-end tests)

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4, shadcn/ui, Base UI |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| ORM | Drizzle ORM |
| State Management | Zustand |
| AI | Google Gemini AI (@google/generative-ai) |
| OCR | Tesseract.js |
| Animations | Framer Motion |
| Unit Testing | Vitest + Testing Library |
| E2E Testing | Playwright |
| Dates | date-fns |
| Deployment | Vercel |

## Local Development

### Prerequisites

- Node.js 18+
- A Supabase project (free tier works)

```bash
git clone https://github.com/BharathLakkoju/flatmate
cd flatmate
npm install
cp .env.example .env.local   # fill in Supabase + Gemini keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Setup

```bash
npm run db:push   # push Drizzle schema to Supabase
```

### Running Tests

```bash
npm test              # unit tests (Vitest)
npm run test:e2e      # end-to-end tests (Playwright)
npm run test:coverage # coverage report
```

## App Structure

```
src/
├── app/
│   ├── (landing)/       # Marketing / landing page
│   ├── (auth)/          # Login, signup pages
│   └── app/
│       ├── home/        # Dashboard overview
│       ├── expenses/    # Expense tracking
│       ├── groceries/   # Grocery lists
│       ├── meals/       # Meal planning
│       ├── tasks/       # Task management
│       ├── calendar/    # Shared calendar
│       ├── profile/     # User profile
│       └── settings/    # App settings
├── components/          # Shared UI components
├── stores/              # Zustand state stores
├── lib/                 # DB schema, utilities
└── types/               # TypeScript types
```

## License

MIT
