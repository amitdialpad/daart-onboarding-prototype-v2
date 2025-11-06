# DAART Onboarding V2 Documentation

**Complete documentation for the V2 onboarding prototype**

---

## 📚 Documentation Index

### Core Documentation

#### [Project Context](./project_context.md)
**Start here** - High-level project overview, tech stack, and lo-fi constraints.

**Contents:**
- Design philosophy (lo-fi constraints)
- Tech stack
- URL structure
- Implementation status
- Key files

**Read this if:** You're new to the project or need to understand the lo-fi approach.

---

#### [Onboarding Philosophy](./onboarding_philosophy.md)
**The vision** - Core principles and intended user experience.

**Contents:**
- 10 core principles (intent-first, settings as truth, etc.)
- What Claude creates on first run
- Ideal user flow
- Example: Appointment scheduling agent

**Read this if:** You want to understand the "why" behind the design.

---

#### [V2 Implementation Guide](./onboarding_v2_implementation.md)
**Most detailed** - Complete implementation documentation (~15 pages).

**Contents:**
- Step-by-step flow breakdown
- Every screen and component
- Data structures
- State management
- Styling details
- Future enhancements
- Troubleshooting guide

**Read this if:** You need to understand or modify the implementation.

---

#### [Quick Reference](./onboarding_quick_reference.md)
**Fast lookup** - Condensed reference for common operations.

**Contents:**
- Navigation flow diagram
- Component states
- Data structures
- Common functions
- CSS class reference
- Domain-specific question sets
- Troubleshooting checklist

**Read this if:** You know the system and need quick answers.

---

#### [Design Decisions](./design_decisions.md)
**Rationale** - Why we made specific choices.

**Contents:**
- 10 major decisions with full analysis
- Problems, solutions, tradeoffs
- Alternative approaches considered
- Future enhancement paths
- Summary table

**Read this if:** You want to understand why things work the way they do.

---

#### [Context System Setup](./context_system_setup.md)
**Meta** - How to set up development environment with AI assistance.

**Contents:**
- Claude Code setup
- Context configuration
- /daart slash command
- Git workflow
- Best practices

**Read this if:** You're setting up your development environment.

---

## 🗺️ Information Hierarchy

```
Start Here
    ↓
Project Context ────────→ Quick overview, tech stack
    ↓
Onboarding Philosophy ──→ Vision and principles
    ↓
    ├─→ Need details? ───→ V2 Implementation Guide
    │
    ├─→ Need quick info? → Quick Reference
    │
    └─→ Why decisions? ──→ Design Decisions
```

---

## 📖 Reading Guide by Role

### New Developer
1. [Project Context](./project_context.md) - Understand the project
2. [Onboarding Philosophy](./onboarding_philosophy.md) - Learn the vision
3. [V2 Implementation Guide](./onboarding_v2_implementation.md) - Study implementation
4. [Quick Reference](./onboarding_quick_reference.md) - Bookmark for daily use

### Product Manager
1. [Onboarding Philosophy](./onboarding_philosophy.md) - Understand vision
2. [Design Decisions](./design_decisions.md) - See rationale
3. [V2 Implementation Guide](./onboarding_v2_implementation.md) (§ User Flow) - Review UX

### Designer (Taking Over)
1. [Project Context](./project_context.md) - See current lo-fi constraints
2. [V2 Implementation Guide](./onboarding_v2_implementation.md) - Understand structure
3. [Design Decisions](./design_decisions.md) - Learn why decisions were made
4. Design from scratch, keeping core UX patterns

### QA/Tester
1. [Quick Reference](./onboarding_quick_reference.md) (§ Testing Scenarios) - Test cases
2. [V2 Implementation Guide](./onboarding_v2_implementation.md) (§ Troubleshooting) - Debug help
3. [Quick Reference](./onboarding_quick_reference.md) (§ Edge Cases) - Edge case list

---

## 🎯 Common Questions

### "How does the onboarding flow work?"
→ Read: [Onboarding Philosophy](./onboarding_philosophy.md) (User Flow)
→ Then: [V2 Implementation Guide](./onboarding_v2_implementation.md) (Flow Structure)

### "What are all the screens and components?"
→ Read: [V2 Implementation Guide](./onboarding_v2_implementation.md) (Flow Structure)

### "How do I find X in the code?"
→ Read: [Quick Reference](./onboarding_quick_reference.md) (Component lookup)

### "Why did you make this decision?"
→ Read: [Design Decisions](./design_decisions.md) (Find specific decision)

### "What data structures are used?"
→ Read: [Quick Reference](./onboarding_quick_reference.md) (Key Data Structures)
→ Also: [V2 Implementation Guide](./onboarding_v2_implementation.md) (Data Flow)

### "How do I test this feature?"
→ Read: [Quick Reference](./onboarding_quick_reference.md) (Testing Scenarios)

### "Where is X styled?"
→ Read: [Quick Reference](./onboarding_quick_reference.md) (CSS Class Reference)

### "How does the agent generate responses?"
→ Read: [Design Decisions](./design_decisions.md) (#7 Simulated Agent Responses)
→ Also: [Quick Reference](./onboarding_quick_reference.md) (Agent Response Logic)

---

## 📝 Document Summaries

| Document | Length | Best For | Update Frequency |
|----------|--------|----------|-----------------|
| Project Context | 1 page | Overview | When project scope changes |
| Onboarding Philosophy | 3 pages | Vision | Rarely (core principles) |
| V2 Implementation | 15 pages | Deep dive | When features change |
| Quick Reference | 5 pages | Daily use | When APIs change |
| Design Decisions | 8 pages | Understanding | When major decisions made |
| Context System Setup | 2 pages | Dev setup | When tools change |

---

## 🔄 Maintenance

### When to Update Documentation

**Add to V2 Implementation:**
- New screen/component added
- Data structure changes
- State management changes
- New computed properties or methods

**Add to Quick Reference:**
- New common operation
- New CSS class pattern
- New troubleshooting case
- API signature changes

**Add to Design Decisions:**
- Major architectural choice
- UX pattern change
- Tradeoff analysis needed
- Alternative approaches considered

**Update Project Context:**
- Feature completion status
- Tech stack changes
- New key files

---

## 🚀 Quick Start

**For Developers:**
```bash
# 1. Read project context
open docs/project_context.md

# 2. Set up environment
open docs/context_system_setup.md

# 3. Start dev server
npm run dev

# 4. Open onboarding flow
open http://localhost:5173/#/onboarding-v2

# 5. Bookmark quick reference
open docs/onboarding_quick_reference.md
```

**For Non-Technical:**
```
1. Read: Onboarding Philosophy (the vision)
2. Read: Design Decisions (the reasoning)
3. Try: http://localhost:5173/#/onboarding-v2 (live demo)
```

---

## 📂 File Locations

```
docs/
├── README.md                          # This file
├── project_context.md                 # Project overview
├── onboarding_philosophy.md           # Core principles
├── onboarding_v2_implementation.md    # Detailed implementation
├── onboarding_quick_reference.md      # Quick lookup
├── design_decisions.md                # Rationale and tradeoffs
└── context_system_setup.md            # Dev environment setup

src/views/
├── OnboardingV2View.vue              # Main onboarding (~2000 lines)
├── AgentsWorkspaceV2View.vue         # Agent workspace
└── DeployView.vue                    # Channel deployment

.claude/
└── commands/
    └── daart.md                      # /daart slash command context
```

---

## 🔗 External References

- [Vue 3 Composition API Docs](https://vuejs.org/guide/introduction.html)
- [Vue Router Hash Mode](https://router.vuejs.org/guide/essentials/history-mode.html#Hash-Mode)
- [Web Storage API (localStorage)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [SiteGPT](https://sitegpt.ai/) - UI inspiration

---

## 📮 Feedback

For questions or suggestions about documentation:
1. Check if answer is in existing docs
2. If not found, document the question and answer
3. Submit PR to improve docs

**Documentation is code** - Keep it accurate, clear, and up-to-date.

---

**Last Updated:** 2025-01-06
**Maintainer:** Development Team
**Status:** Active Prototype
