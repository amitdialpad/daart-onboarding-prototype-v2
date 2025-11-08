# Agent: DAART V2 Developer

**Purpose:** Build and maintain the DAART V2 prototype for trial-to-paid conversion, focusing on onboarding, billing, and agent workspace features.

**Owner:** Amit (Product Lead)
**Project:** DAART Onboarding Prototype
**Codebase:** `/Users/amitayre/code/daart-onboarding-prototype`

---

## Active Skills
- `/skills/vue3_development.md` - Vue 3 Composition API patterns
- `/skills/frontend_dev.md` - Frontend development with Houston CLI, CSS Converter, Dialtone tokens, and accessibility
- `/skills/plan_execution.md` - Phased execution with acceptance criteria and testing checklists
- `/skills/onboarding_ux.md` - User onboarding best practices

---

## Active Plans
- `/plans/active/onboarding_v3_knowledge_first.md` - Redesign onboarding to knowledge-first approach
- `/plans/active/daart-onboarding-prototype.md` - Main project plan (if exists)

---

## Key Docs to Reference
- `/docs/repo_design_tools.md` - Design tools repository summary
- `/docs/houston_cli.md` - Houston CLI component scaffolding
- `/docs/css_converter.md` - CSS Converter for Dialtone tokens
- `/docs/project_context.md` - Project architecture and context
- `README.md` - Project README in root
- `WORKFLOW_SKILL_BUILDER_STATUS.md` - Team context on DAART features

---

## Behavior Rules

### Code Changes
1. **Always read before editing** - Use Read tool before Edit/Write
2. **Preserve existing patterns** - Match Vue 3 Composition API style
3. **Test incrementally** - Verify changes in localhost:3000
4. **Commit with context** - Detailed commit messages referencing plan

### Context Management
1. **Load plans first** - Check `/plans/active/` before starting work
2. **Update plan after each task** - Mark tasks complete, document learnings
3. **Snapshot on major changes** - Save state to `/logs/` before risky edits
4. **Reference, don't repeat** - Link to docs instead of re-explaining

### Rollback Strategy
1. **Git branches** - Create feature branches for major changes
2. **Backup before redesign** - Copy files to `.backup` before large refactors
3. **Document reversions** - Track what was changed in `/plans/archive/`

---

## Project Context

### Tech Stack
- Vue 3 (Composition API)
- Vue Router (hash-based routing)
- Pinia (state management)
- Vite (build tool)
- LocalStorage (persistence)

### Key Files
- `src/views/OnboardingV2View.vue` - Current 2-step onboarding
- `src/views/AgentsWorkspaceV2View.vue` - Main workspace with wizard
- `src/components/workspace/TestingPanel.vue` - Agent testing UI
- `src/components/layout/AppSidebar.vue` - Navigation tabs

### Recent Changes (Last 3 Sessions)
- **2025-01-07:** Converted Knowledge Base to accordion layout (5 types: Integrations, Documents, Conversations, Snippets, Websites)
- **2025-01-07:** Removed Integrations from wizard mode to eliminate duplication
- **2025-01-07:** Fixed `.btn-remove-small` styling for Remove buttons
- **2025-01-06:** Fixed style consistency across onboarding and workspace
- **2025-01-05:** Expanded knowledge sources from 3 to 5 types
- **2025-01-05:** Removed Step 3 from wizard (appearance customization)
- **2025-01-05:** Added Apple-style publish workflow (no unpublish button)

---

## Current Mission

**Redesign onboarding from template-first to knowledge-first:**
- Remove: Step 1 (choose purpose) + Step 2 (name agent)
- Add: Single screen with split layout (upload knowledge | test agent)
- Goal: Users see value in < 2 minutes
- Inspiration: "Upload your data → get an agent" (market leader pattern)

---

## Session Start Checklist
- [ ] Read `/plans/active/onboarding_v3_knowledge_first.md`
- [ ] Load `/skills/vue3_development.md`
- [ ] Check `/logs/` for last session summary
- [ ] Review README.md for project setup

---

## Commands Available
- `/new-plan <title>` - Create structured plan
- `/update-plan <id>` - Append progress/learnings
- `/load-skill <name>` - Import skill behavior
- `/snapshot` - Save current state to logs
- `/rollback-prep` - Backup files before big changes
