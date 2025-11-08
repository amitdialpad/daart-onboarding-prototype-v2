# Skill: Plan Execution

**Purpose:** Execute project plans with clear phases, acceptance criteria, and testing

---

## Core Principles

### 1. Phased Execution
Break large tasks into small, testable phases with clear boundaries

### 2. Acceptance Criteria
Every task must have measurable success conditions

### 3. Testing Checklist
Validate each phase before moving to the next

---

## Phase Structure

### Phase Template
```markdown
## Phase N: [Phase Name]

**Goal:** [What this phase accomplishes]

**Tasks:**
- [ ] Task 1 with specific action
- [ ] Task 2 with specific action
- [ ] Task 3 with specific action

**Acceptance Criteria:**
- [ ] Criterion 1 (measurable)
- [ ] Criterion 2 (testable)
- [ ] Criterion 3 (verifiable)

**Testing:**
- [ ] Test case 1
- [ ] Test case 2
- [ ] Test case 3

**Rollback Plan:**
- Backup files: [list]
- Git commit: [commit hash]
- Restore command: `[command]`
```

---

## Step-by-Step Execution

### Step 1: Review Phase
- Read phase goal and tasks
- Check dependencies on previous phases
- Verify resources available
- Note any blockers

### Step 2: Backup
- Create file backups if needed
- Commit current state to git
- Document current working state

### Step 3: Execute Tasks
- Work through tasks sequentially
- Update checkboxes as completed
- Document any deviations
- Take notes on learnings

### Step 4: Validate Acceptance Criteria
- Test each criterion
- Mark as complete only when verified
- Document any partial completions

### Step 5: Run Testing Checklist
- Execute all test cases
- Note any failures
- Fix issues before proceeding

### Step 6: Document Learnings
- Update plan with notes
- Log unexpected issues
- Record solutions for future reference

### Step 7: Commit Progress
- Commit completed phase
- Update plan status
- Move to next phase

---

## Acceptance Criteria Guidelines

### Good Criteria (SMART)
- **Specific:** "Upload button triggers file dialog"
- **Measurable:** "Intelligence meter shows 70% with 3+ items"
- **Achievable:** "Agent saves to localStorage"
- **Relevant:** "Testing panel shows AI responses"
- **Time-bound:** "Loads in < 2 seconds"

### Bad Criteria (Vague)
- ❌ "It works"
- ❌ "Looks good"
- ❌ "Users like it"
- ❌ "Better than before"

---

## Testing Checklist Template

### Functional Testing
```markdown
#### TC1: Happy Path
1. [ ] Action 1
2. [ ] Expected result 1
3. [ ] Action 2
4. [ ] Expected result 2

#### TC2: Error Handling
1. [ ] Trigger error condition
2. [ ] Error message displays
3. [ ] User can recover

#### TC3: Edge Cases
1. [ ] Test with 0 items
2. [ ] Test with max items
3. [ ] Test with invalid input
```

### Visual Testing
- [ ] Layout matches design
- [ ] Responsive at all breakpoints
- [ ] Colors match design tokens
- [ ] Spacing consistent
- [ ] Typography correct

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader announcements
- [ ] ARIA attributes present
- [ ] Tab order logical

### Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

---

## Rollback Strategy

### When to Rollback
- Feature breaks existing functionality
- Acceptance criteria cannot be met
- Critical bugs introduced
- Timeline exceeded significantly

### How to Rollback
1. **Stop work immediately**
2. **Document failure reason** in `/logs/rollback_[date].md`
3. **Restore backup files**
   ```bash
   cp file.backup file.vue
   ```
4. **Or revert git commit**
   ```bash
   git revert [commit-hash]
   ```
5. **Test restored state**
6. **Update plan with learnings**
7. **Plan retry with different approach**

---

## Progress Tracking

### Update Plan After Each Phase
```markdown
### Phase 3: Build Knowledge UI ✅
**Status:** COMPLETE
**Completed:** 2025-01-07

**Notes:**
- File upload works with validation
- Drag & drop added (not in original plan)
- Character counter added to textarea

**Issues Encountered:**
- File size validation needed adjustment (5MB → 10MB)
- Fixed drag & drop z-index conflict

**Next Phase:** Phase 4 - Build Testing UI
```

### Log Major Milestones
Create log entries in `/logs/` after:
- Completing major phases
- Finishing full features
- Before/after risky changes
- Deployment to production

---

## Communication

### Update Stakeholders
- Show progress after each phase
- Demo working features early
- Report blockers immediately
- Share learnings regularly

### Documentation
- Keep plan up-to-date
- Log decisions and rationale
- Document workarounds
- Reference related issues

---

## Quality Gates

### Before Moving to Next Phase
- [ ] All tasks completed
- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] Code reviewed (if applicable)
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Performance acceptable
- [ ] Accessibility verified

### Before Marking Complete
- [ ] Feature works end-to-end
- [ ] Edge cases handled
- [ ] Error states designed
- [ ] Loading states shown
- [ ] Empty states handled
- [ ] Success states clear

---

## Example: Good Phase Execution

### Phase 4: Build Live Testing UI ✅

**Goal:** Let users test agent responses as they add knowledge

**Tasks:**
- [x] Import TestingPanel component
- [x] Pass temporary agent object with knowledge
- [x] Handle empty state (no knowledge yet)
- [x] Generate suggested questions based on content
- [x] Implement simulated AI responses

**Acceptance Criteria:**
- [x] Empty states show correctly (tested with 0 items)
- [x] Chat works with TestingPanel (sent 5 test messages)
- [x] Suggested questions appear and work (clicked all 3)
- [x] Responses use uploaded knowledge (verified keyword matching)
- [x] No knowledge → helpful empty state message (verified)

**Testing:**
- [x] TC1: Happy Path - Upload doc → See suggestions → Click → Get response
- [x] TC2: Empty State - Load with 0 knowledge → See empty message
- [x] TC3: Error Handling - Type gibberish → Get fallback response

**Learnings:**
- Suggested questions should update live as knowledge changes
- Added keyword matching for better demo responses
- Empty state needed clearer CTA

**Status:** COMPLETE - Ready for Phase 5

---

## References

- `/plans/active/` - Active project plans
- `/logs/` - Execution logs and learnings
- `/agents/daart_v2_dev.md` - Agent behavior rules

---

**Last Updated:** 2025-01-07
