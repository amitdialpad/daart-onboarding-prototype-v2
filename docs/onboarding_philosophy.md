# Dynamic Onboarding Philosophy

**Date:** 2025-01-05
**Critical Context:** This is how onboarding MUST work

---

## Core Principles

### 1. Intent-First, Not Template-First
- Start with **open text field** for user's natural language intent
- No forced wizard steps
- Build dynamically from what user typed

### 2. Conversational Clarification
- Ask targeted follow-up questions based on intent domain
- Example: "appointment scheduling" → ask about duration, buffers, calendars, hours
- Make it feel like a conversation, not a form

### 3. Settings as Source of Truth
- Operational facts (hours, phone numbers) → Update system settings
- Knowledge files are breadcrumbs, settings are canonical
- Offer to update settings when user provides operational data

### 4. Auto-Generate Plan
- Convert intent + answers → structured plan with phases & tasks
- Show plan to user for confirmation
- Drive onboarding from checklist

### 5. Plan Materialization
Create `plans/active/<agent>_onboarding.md`:
- Current capabilities discovered
- Required integrations
- Phase breakdown
- Testing steps

### 6. Hello World First
- Let user try immediately: add knowledge → test chat/voice
- Simplest publishable app first, then deepen
- No brittle multi-step wizard

### 7. Data Ingestion in Chat
- Drop PDF or type facts → auto-create knowledge markdown
- Facts overlapping with settings → propose settings update

### 8. Builder Agent with Skills
- Planning skill
- Step-by-step execution
- Reads plan, executes tasks, checks acceptance criteria

### 9. Test Early and Often
- Generate test cases from plan
- Mark pass/fail in plan file
- Include edge cases

### 10. Breadcrumbs for Retrieval
- Maintain READMEs and cross-links
- Claude can re-hydrate context on restart

---

## What Claude Creates on First Run

### plans/active/<agent>_onboarding.md
Sections:
- Objective
- Questions asked
- User answers
- Plan phases
- Tasks with acceptance criteria
- Test checklist
- References

### skills/plan_execution.md
Step-by-step execution with validation and testing

### docs/settings_links.md
Pointers to mutable system settings

### Optional: agents/<agent>.md
Purpose, linked skills, docs, active plan paths

---

## User Flow

1. **Open text field:** "Describe what you want your agent to do"
2. **Claude analyzes intent:** Detects domain (scheduling, support, etc.)
3. **Claude asks clarifiers:** Targeted questions based on domain
4. **User answers:** In natural language
5. **Claude generates plan:** Shows structured plan for confirmation
6. **User confirms:** "Yes, build this"
7. **Claude executes plan:** Phase by phase, checks off tasks
8. **Test as you go:** Quick validation at each phase
9. **Deploy:** Agent is ready

---

## Example: Appointment Scheduling

**User types:**
> "I need an agent to book appointments for my dental office"

**Claude asks:**
- What's the typical appointment duration?
- Any buffer time between appointments?
- Which calendar system do you use?
- Business hours?
- Do you need calendar integration?
- Any special scheduling rules?

**Claude generates plan:**
```markdown
# Plan: Dental Office Appointment Agent

## Phase 1: Basic Setup
- [ ] Create agent with scheduling purpose
- [ ] Set business hours: Mon-Fri 9am-5pm
- [ ] Configure 30min appointments with 10min buffer

## Phase 2: Knowledge
- [ ] Add service types (cleaning, checkup, etc.)
- [ ] Add pricing info
- [ ] Add office policies

## Phase 3: Testing
- [ ] Test: "Book a cleaning appointment"
- [ ] Test: "What times are available tomorrow?"
- [ ] Test: Edge case - booking outside hours

## Phase 4: Deploy
- [ ] Connect to Google Calendar
- [ ] Enable SMS reminders
- [ ] Deploy to website
```

**Claude executes each phase, asks user to validate, then proceeds.**

---

**This is the new onboarding paradigm. No more fixed steps!**
