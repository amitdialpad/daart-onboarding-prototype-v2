# Windsurf Development Setup

## Project: DAART Onboarding Prototype

This is a Vue 3 + Vite prototype for optimizing DAART standalone onboarding and billing flows.

## Quick Start in Windsurf

The dev server is already running at: http://localhost:3000

## Project Structure

```
src/
├── main.js                 - App entry point
├── App.vue                 - Root component
├── stores/
│   └── agenticStandalone.js  - Pinia state management (matches Giselle's work)
├── router/
│   └── index.js            - Vue Router config
└── views/
    ├── SignupView.vue      - Trial signup flow
    ├── OnboardingView.vue  - 4-step onboarding
    ├── DashboardView.vue   - Main dashboard with trial status
    ├── CreditsView.vue     - Usage tracking and cost transparency
    ├── BillingView.vue     - Payment methods management
    └── UpgradeView.vue     - Trial-to-paid conversion flow
```

## Key Files to Review

1. **`stores/agenticStandalone.js`** - Core state management
   - Tracks trial status, usage, billing info
   - Matches architecture from DP-162290 (Giselle's work)

2. **`views/UpgradeView.vue`** - Critical conversion flow
   - One-page checkout
   - Cost transparency
   - Payment form

3. **`views/DashboardView.vue`** - Main user interface
   - Trial warnings at 80% usage
   - Upgrade CTAs
   - Usage visualization

## Integration Points

When integrating into firespotter repo:

1. **Store:** `src/stores/agenticStandalone.js` → Maps to Giselle's store
2. **API endpoints needed:**
   - `GET /api/agentic/standalone/account`
   - `POST /api/agentic/standalone/upgrade`
   - `GET /api/agentic/standalone/usage`

3. **Payment:** Needs Stripe integration

## For Tomorrow's Meeting

- Demo flow: signup → onboarding → dashboard → credits → upgrade
- Key optimizations: Time-to-value < 5min, proactive prompts, cost transparency
- See `RECOMMENDATIONS.md` for strategic insights

## Commands

- `npm run dev` - Start dev server (already running)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Context Reload

In Claude Code sessions, use `/daart` to reload full project context.
