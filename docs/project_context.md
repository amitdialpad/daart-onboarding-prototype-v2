# Project Context: DAART V2 Prototype

**CRITICAL: This is a LO-FI PROTOTYPE**

---

## Design Philosophy

### Lo-Fi Constraints
- **NO icons** (use text labels only)
- **NO colors** (black, gray, white only)
- **NO fancy styling** (simple borders, basic layouts)
- **NO animations** (instant transitions)
- **NO images** (text-only)

### Focus
- Functionality over aesthetics
- Quick iteration
- Validate concepts, not polish
- HTML form elements (native styles)

---

## Tech Stack
- Vue 3 (Composition API)
- Vue Router (hash-based)
- Vite dev server
- LocalStorage (no backend)
- NO CSS frameworks (plain CSS)

---

## URLs (Keep Same)
- `/` - Landing/signup
- `/#/onboarding-v2` - Onboarding flow
- `/#/agents-v2/:id` - Workspace
- `/#/agents-v2/:id/deploy` - Deploy view

---

## Current Implementation Status

### Completed Features (2025-01-06)
- ✅ Intent-first onboarding flow
- ✅ Dual path system (Questions vs Knowledge)
- ✅ Domain detection and adaptive questions
- ✅ Unified test & edit interface
- ✅ SiteGPT-style agent introduction
- ✅ Live configuration editing with change detection
- ✅ Agent plan generation
- ✅ Execution and deployment flow
- ✅ Web Chat widget configuration (from V1)
- ✅ Voice channel deployment flow (from V1)

### Documentation
- 📄 `onboarding_v2_implementation.md` - Detailed implementation guide
- 📄 `onboarding_quick_reference.md` - Quick lookup reference
- 📄 `onboarding_philosophy.md` - Core principles and vision

### Key Files
- `src/views/OnboardingV2View.vue` - Main onboarding flow (~2000 lines)
- `src/views/AgentsWorkspaceV2View.vue` - Agent workspace
- `src/views/DeployView.vue` - Channel deployment

---

## Prototype Status
- **Purpose:** Validate trial-to-paid conversion flow
- **Audience:** Internal team (Aykut, Josh, etc.)
- **Timeline:** Fast iteration
- **After validation:** Hand off to design team for polish

---

**Remember: LO-FI = SPEED, not beauty**
