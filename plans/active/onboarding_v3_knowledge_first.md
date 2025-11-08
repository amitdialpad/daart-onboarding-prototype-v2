# Plan: Onboarding V3 - Knowledge-First Redesign

**Status:** Active
**Owner:** Amit
**Start Date:** 2025-01-05
**Target:** V2 codebase (modify OnboardingV2View.vue, no new files)
**Rollback Ready:** Yes (backup before changes)

---

## Objective

Transform onboarding from template-first to knowledge-first approach where users **upload documents and test immediately** instead of choosing templates and naming agents.

**Success Criteria:**
- Time to first agent test: < 2 minutes
- Knowledge items added: 3+ average
- Test messages during onboarding: 5+ average
- User understands "knowledge = intelligence" mental model

---

## Current State (Before)

### Flow
1. **Screen 1:** Choose agent purpose (6 templates)
2. **Screen 2:** Name your agent (modal)
3. **Redirect to workspace:** Wizard mode (Step 1: Configure, Step 2: Add Knowledge)

### Problems
- Too many steps before value
- Knowledge comes AFTER agent creation (backwards)
- No immediate feedback
- Users don't see "it working" until later

---

## Future State (After)

### Flow
1. **Welcome Screen:** Set mental model ("Your knowledge powers your AI agent")
2. **Knowledge Builder:** Single screen with split layout
   - **Left (60%):** Upload docs, paste text, add URLs
   - **Right (40%):** Test agent live as knowledge is added
3. **Auto-configuration:** Agent name, purpose, instructions inferred from knowledge
4. **Redirect to workspace:** Skip wizard (knowledge already added)

### Benefits
- See value in < 2 minutes
- Natural flow: Knowledge → Intelligence → Testing
- Confidence building (test before committing)
- Matches market leader pattern ("upload → get agent")

---

## Phase Breakdown

### Phase 1: Context Setup ✅
**Goal:** Set up file-based memory system before coding

- [x] Create `/agents/daart_v2_dev.md`
- [x] Create `/skills/vue3_development.md`
- [x] Create this plan
- [ ] Document current state snapshot

---

### Phase 2: Pre-Flight Backup
**Goal:** Ensure we can rollback if needed

**Tasks:**
- [ ] Backup OnboardingV2View.vue → `OnboardingV2View.vue.v2_backup`
- [ ] Git commit current state with message: "Backup before knowledge-first redesign"
- [ ] Document current file structure in `/logs/pre_redesign_snapshot.md`

**Acceptance Criteria:**
- Backup file exists
- Git shows clean working directory
- Snapshot documents all routes, components, state

---

### Phase 3: Add Welcome Screen (New Step 0)
**Goal:** Set user expectations before knowledge upload

**Tasks:**
- [ ] Add new section to OnboardingV2View.vue (step 0)
- [ ] Create hero content: "Build Your AI Agent in Minutes"
- [ ] Add 3-step visual flow (Upload → Test → Deploy)
- [ ] Add value prop: "Your knowledge powers your AI agent"
- [ ] Add example use cases (Support, Sales, Booking agents)
- [ ] Add "Get Started" button (advances to step 1)

**UI Specs:**
```
- Hero heading: 32px bold
- Subtitle: 18px gray
- 3 steps: numbered circles with icon + title + description
- Examples: bulleted list, 14px
- Button: Primary (black), centered
```

**Acceptance Criteria:**
- [ ] Welcome screen shows before knowledge builder
- [ ] "Get Started" button advances to next screen
- [ ] Visual hierarchy is clear
- [ ] All copy matches approved messaging

---

### Phase 4: Build Split-Screen Knowledge Builder
**Goal:** Replace template selection with knowledge upload interface

**Tasks:**
- [ ] Remove Step 1 template cards
- [ ] Remove Step 2 name agent modal
- [ ] Create 60/40 split layout (flexbox)
- [ ] Add left panel: "Add Knowledge" section
- [ ] Add right panel: "Test Your Agent" section
- [ ] Add progress header: "Step 1 of 2: Teach Your Agent"

**Layout Structure:**
```vue
<div class="knowledge-builder-screen">
  <div class="progress-header">
    <!-- Step indicator + intelligence meter -->
  </div>

  <div class="split-layout">
    <div class="knowledge-panel">
      <!-- Upload UI goes here -->
    </div>

    <div class="testing-panel">
      <!-- Testing UI goes here -->
    </div>
  </div>

  <div class="bottom-actions">
    <!-- Continue button -->
  </div>
</div>
```

**CSS Requirements:**
- Left panel: 60% width, padding 24px
- Right panel: 40% width, border-left 1px solid #e0e0e0
- Responsive: Stack vertically on mobile (< 768px)

**Acceptance Criteria:**
- [ ] Split layout renders correctly
- [ ] Panels are properly proportioned
- [ ] Header shows step indicator
- [ ] No console errors

---

### Phase 5: Build Knowledge Upload UI (Left Panel)
**Goal:** Allow users to add documents, text, and URLs

**Sub-tasks:**

#### 5a: Tab Navigation
- [ ] Add tab selector: Documents | Paste Text | Websites
- [ ] State management: `activeUploadTab = ref('documents')`
- [ ] Tab switching updates content area

#### 5b: Upload Documents Tab
- [ ] File input (hidden, triggered by button)
- [ ] Drag & drop zone
- [ ] File type validation (.pdf, .docx, .txt, .csv)
- [ ] Size validation (max 10MB per file)
- [ ] Upload progress indicator
- [ ] File list with remove button
- [ ] Status badges (uploading | processing | ready)

**State:**
```javascript
const uploadedFiles = ref([])
// Each file: { id, name, size, status, content }
```

#### 5c: Paste Text Tab
- [ ] Large textarea (rows=15)
- [ ] Character counter
- [ ] "Add to Knowledge" button
- [ ] Save as text snippet with auto-generated title

**State:**
```javascript
const textSnippets = ref([])
// Each snippet: { id, title, content, dateAdded }
```

#### 5d: Websites Tab
- [ ] URL input field
- [ ] "Add Website" button
- [ ] Website list with status (crawling | ready)
- [ ] Remove button per website
- [ ] Preview extracted content (optional MVP++)

**State:**
```javascript
const websites = ref([])
// Each site: { id, url, status, pageCount, content }
```

#### 5e: Knowledge Summary
- [ ] "Your agent understands:" section
- [ ] Bullet list of detected topics
- [ ] Auto-updates when knowledge changes

**Logic:**
```javascript
const detectedTopics = computed(() => {
  // Extract keywords from all knowledge items
  // Return array of topics like "Pricing & plans", "Return policy"
})
```

**Acceptance Criteria:**
- [ ] All three tabs functional
- [ ] Files upload and show in list
- [ ] Text can be pasted and saved
- [ ] URLs can be added
- [ ] Knowledge summary updates correctly
- [ ] State persists in component (ready for agent creation)

---

### Phase 6: Build Live Testing UI (Right Panel)
**Goal:** Let users test agent responses as they add knowledge

**Sub-tasks:**

#### 6a: Integrate TestingPanel Component
- [ ] Import TestingPanel.vue
- [ ] Pass temporary agent object with knowledge
- [ ] Handle empty state (no knowledge yet)

**Temp Agent:**
```javascript
const tempAgent = computed(() => ({
  id: 'temp',
  name: 'AI Assistant',
  instructions: 'You are a helpful AI assistant...',
  knowledge: [...uploadedFiles.value, ...textSnippets.value, ...websites.value],
  status: 'draft'
}))
```

#### 6b: Progressive Empty States
- [ ] State 1: No knowledge → "Add knowledge to start testing"
- [ ] State 2: 1 item → "Try asking a question"
- [ ] State 3: 3+ items → "Your agent is ready!"

#### 6c: Suggested Questions
- [ ] Generate questions based on uploaded content
- [ ] Click to auto-fill chat input
- [ ] Update when knowledge changes

**Logic:**
```javascript
const suggestedQuestions = computed(() => {
  const questions = []

  if (uploadedFiles.value.some(f => f.name.includes('pricing'))) {
    questions.push("What are your pricing plans?")
  }
  if (textSnippets.value.some(s => s.content.includes('return'))) {
    questions.push("How do I return an item?")
  }

  return questions.slice(0, 3) // Max 3 suggestions
})
```

#### 6d: Simulated AI Responses
- [ ] Implement `simulateAIResponse(userMessage, knowledgeContext)`
- [ ] Use keyword matching for demo purposes
- [ ] Return relevant snippets from uploaded knowledge
- [ ] Fallback: "I don't have enough information yet..."

**Acceptance Criteria:**
- [ ] Empty states show correctly
- [ ] Chat works with TestingPanel
- [ ] Suggested questions appear and work
- [ ] Responses use uploaded knowledge
- [ ] No knowledge → helpful empty state message

---

### Phase 7: Intelligence Meter & Guidance
**Goal:** Show knowledge quality and guide users to add more

**Sub-tasks:**

#### 7a: Intelligence Meter
- [ ] Progress bar in header
- [ ] Calculate level based on knowledge count
- [ ] Label: "Basic" | "Getting better" | "Good" | "Excellent"

**Logic:**
```javascript
const intelligenceLevel = computed(() => {
  const count = uploadedFiles.value.length + textSnippets.value.length + websites.value.length
  if (count === 0) return 0
  if (count === 1) return 30
  if (count === 2) return 50
  if (count >= 3 && count < 5) return 70
  return 100
})

const intelligenceLabel = computed(() => {
  const level = intelligenceLevel.value
  if (level === 0) return 'No knowledge yet'
  if (level < 40) return 'Basic - Add more to improve'
  if (level < 60) return 'Getting better...'
  if (level < 80) return 'Good! Ready to test'
  return 'Excellent!'
})
```

#### 7b: Contextual Tips
- [ ] Tip box in left panel
- [ ] Changes based on knowledge count
- [ ] Examples of what to add
- [ ] Hides after 3+ items (shows success message instead)

**Acceptance Criteria:**
- [ ] Meter animates smoothly
- [ ] Labels match knowledge quality
- [ ] Tips are helpful and contextual
- [ ] Success message shows at right time

---

### Phase 8: Auto-Configuration Logic
**Goal:** Infer agent name, purpose, instructions from knowledge

**Sub-tasks:**

#### 8a: Agent Name Generation
```javascript
function inferAgentName(knowledge) {
  // Extract company name from first document
  const firstItem = knowledge[0]
  if (!firstItem) return 'AI Assistant'

  // "Acme_pricing.pdf" → "Acme"
  // "acme.com/faq" → "Acme"
  const companyName = extractCompanyName(firstItem)
  return `${companyName} Assistant`
}
```

#### 8b: Purpose Detection
```javascript
function detectPurpose(knowledge) {
  const allText = knowledge.map(k => k.content || k.name).join(' ').toLowerCase()

  const keywords = {
    support: ['support', 'help', 'faq', 'issue', 'problem'],
    sales: ['pricing', 'plans', 'purchase', 'buy', 'demo'],
    scheduling: ['appointment', 'booking', 'schedule', 'calendar'],
    orders: ['order', 'shipping', 'tracking', 'delivery']
  }

  // Count matches, return best fit
  // Default: 'general'
}
```

#### 8c: Instructions Generation
```javascript
function generateInstructions(agentName, purpose, knowledge) {
  const templates = {
    support: `You are ${agentName}, a customer support assistant. Answer questions using the provided knowledge. Be friendly and concise.`,
    sales: `You are ${agentName}, a sales assistant. Help customers understand pricing and features. Be enthusiastic and helpful.`,
    // ...other templates
  }

  return templates[purpose] || templates.general
}
```

#### 8d: Agent Creation
```javascript
function createAgentFromKnowledge() {
  const knowledge = [
    ...uploadedFiles.value,
    ...textSnippets.value,
    ...websites.value
  ]

  const agent = {
    id: Date.now(),
    name: inferAgentName(knowledge),
    type: 'digital',
    purpose: detectPurpose(knowledge),
    instructions: generateInstructions(...),
    knowledgeSources: {
      textContent: textSnippets.value.length > 0,
      documents: uploadedFiles.value.length > 0,
      websites: websites.value.length > 0
    },
    knowledge: knowledge,
    status: 'draft',
    needsWizard: false // IMPORTANT: Skip wizard
  }

  // Save to localStorage
  const agents = JSON.parse(localStorage.getItem('daart_agents_v2') || '[]')
  agents.push(agent)
  localStorage.setItem('daart_agents_v2', JSON.stringify(agents))

  // Navigate to workspace
  router.push(`/agents-v2/${agent.id}`)
}
```

**Acceptance Criteria:**
- [ ] Agent name extracted correctly
- [ ] Purpose detected with reasonable accuracy
- [ ] Instructions generated appropriately
- [ ] Agent saved to localStorage
- [ ] Navigates to workspace
- [ ] Wizard does NOT show in workspace

---

### Phase 9: Polish & Messaging
**Goal:** Add all copy, hints, empty states, tooltips

**Sub-tasks:**
- [ ] Add all welcome screen copy
- [ ] Add knowledge builder instructions
- [ ] Add tooltips to buttons
- [ ] Add empty state messages
- [ ] Add success messages
- [ ] Add error messages
- [ ] Proofread all copy

**Copy Checklist:**
- [ ] Hero: "Build Your AI Agent in Minutes"
- [ ] Value prop: "Your knowledge powers your AI agent"
- [ ] Step 1 title: "Teach Your Agent"
- [ ] Upload hint: "Add 2-3 documents to get started"
- [ ] Test empty state: "Add knowledge to start testing"
- [ ] Success: "Your agent is ready!"
- [ ] Button: "Deploy My Agent →"

**Acceptance Criteria:**
- [ ] All copy follows approved messaging
- [ ] Tone is helpful and encouraging
- [ ] No Lorem ipsum or placeholder text
- [ ] Proofread for typos

---

### Phase 10: QA & Testing
**Goal:** Verify everything works end-to-end

**Manual Test Cases:**

#### TC1: Happy Path (Knowledge-First Flow)
1. [ ] Load localhost:3000
2. [ ] See welcome screen
3. [ ] Click "Get Started"
4. [ ] See split-screen knowledge builder
5. [ ] Upload a PDF document
6. [ ] See file in list with "ready" status
7. [ ] See suggested questions in right panel
8. [ ] Click suggested question
9. [ ] See AI response using uploaded document
10. [ ] Add 2 more items (paste text, add URL)
11. [ ] See intelligence meter reach "Good"
12. [ ] Click "Deploy My Agent"
13. [ ] See workspace (no wizard)
14. [ ] Verify knowledge is present in BUILD tab

#### TC2: Empty States
1. [ ] Start onboarding
2. [ ] See empty state in testing panel
3. [ ] Add first document
4. [ ] See testing panel become active
5. [ ] See tip change from "Add 2-3 docs" to "Add 1-2 more"

#### TC3: Error Handling
1. [ ] Try uploading > 10MB file → see error
2. [ ] Try uploading unsupported file type → see error
3. [ ] Try adding invalid URL → see error
4. [ ] Try testing with 0 knowledge → see helpful message

#### TC4: Agent Auto-Configuration
1. [ ] Upload "Acme_pricing.pdf"
2. [ ] Complete onboarding
3. [ ] Check workspace: agent name should be "Acme Assistant"
4. [ ] Check instructions: should mention pricing/sales

#### TC5: Rollback Test
1. [ ] Restore OnboardingV2View.vue.v2_backup
2. [ ] Verify old flow works (template selection)
3. [ ] Re-apply new changes

**Acceptance Criteria:**
- [ ] All test cases pass
- [ ] No console errors
- [ ] No visual glitches
- [ ] LocalStorage persists correctly
- [ ] Rollback works if needed

---

## Rollback Plan

### If Something Goes Wrong

**Step 1: Stop Development**
- Don't commit broken code
- Note what's broken in `/logs/rollback_reason.md`

**Step 2: Restore Backup**
```bash
cp OnboardingV2View.vue.v2_backup OnboardingV2View.vue
```

**Step 3: Git Revert (if committed)**
```bash
git log --oneline  # Find commit hash
git revert <hash>
```

**Step 4: Test Old Flow**
- Verify template selection works
- Verify agent creation works
- Verify workspace wizard appears

**Step 5: Document Lessons**
- Update `/plans/archive/onboarding_v3_failed.md`
- Note what went wrong
- Plan retry with different approach

---

## Success Metrics (Post-Launch)

**Track in Analytics:**
- Time to first knowledge upload (goal: < 30 sec)
- Number of knowledge items added (goal: 3+)
- Test messages sent (goal: 5+)
- Completion rate (goal: 80%+)
- Agent quality score (goal: 70%+ "good")

**Qualitative:**
- User feedback: "I saw it working immediately"
- Support tickets: Fewer "How do I add knowledge?" questions
- Activation: Higher % of users who test during onboarding

---

## References

### Related Files
- `/agents/daart_v2_dev.md` - Agent profile
- `/skills/vue3_development.md` - Vue patterns
- `README.md` - Project overview
- `WORKFLOW_SKILL_BUILDER_STATUS.md` - DAART team context

### Inspirations
- Market leader: "Upload docs → get agent in 2 weeks"
- Josh's feedback: "Let people add docs & test right there"
- Apple pattern: Direct manipulation, see results immediately

---

## Next Actions

1. Complete Phase 2: Backup current state
2. Begin Phase 3: Add welcome screen
3. Update this plan after each phase completion
4. Log learnings in `/logs/` after major milestones

---

**Last Updated:** 2025-01-05
**Status:** Ready to begin implementation
