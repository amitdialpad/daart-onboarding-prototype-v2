# Design Decisions & Rationale

**Document:** Key decisions made during V2 onboarding implementation
**Date:** 2025-01-06

---

## 1. Unified Test & Edit Interface

### Decision
Combine testing and configuration into a single screen with chat on the left (narrower, 400px) and editable configuration on the right (wider, flexible).

### Problem
Original design had separate screens for testing and editing. Users would:
1. Test agent
2. Notice something wrong
3. Click "Go Back and Edit"
4. Navigate to previous screen
5. Make changes
6. Navigate forward to test screen
7. Test again
8. Repeat

This created friction and broke the testing flow.

### Solution
Single screen where users can:
- Test agent in left panel
- See editable configuration in right panel
- Make changes inline
- Click "Save Changes" to refresh agent
- Test immediately with updated config
- No navigation required

### Benefits
- **Reduced friction:** No back-and-forth navigation
- **Immediate feedback:** See results of changes instantly
- **Clear separation:** Visual distinction between testing and configuration
- **Complete context:** All relevant information visible at once
- **Natural workflow:** Mirrors how users naturally think (test → adjust → test)

### Tradeoffs
- **Narrower chat:** Less space for conversation history (400px vs full width)
- **More scrolling:** Config panel scrollable for long configurations
- **Complexity:** More code to manage dual-panel state

### Implementation Notes
- Chat panel fixed width ensures consistent testing experience
- Config panel scrollable with max-height to prevent excessive vertical growth
- Change detection prevents accidental overwrites
- Chat reset on save ensures clean slate with updated agent

---

## 2. Path Separation (Questions vs Knowledge)

### Decision
Keep questions path and knowledge path completely separate. No cross-pollination allowed.

### Problem
Should users be able to:
- Add knowledge sources after answering questions?
- Answer questions after uploading knowledge?

### Analysis

**Option A: Allow Cross-Pollination**
- ✅ Maximum flexibility
- ✅ Users can supplement with additional info
- ❌ Confusing: which takes priority?
- ❌ Complex UI: both sections visible
- ❌ Unclear mental model: "Is this Q&A agent or knowledge agent?"
- ❌ Conflicting data: What if answer says "9-5" but doc says "10-6"?

**Option B: Keep Separate (Chosen)**
- ✅ Clear mental model: one approach per agent
- ✅ Simple UI: only relevant section shown
- ✅ No data conflicts
- ✅ Optimized UX for each path
- ❌ Less flexible
- ❌ Can't easily supplement

### Solution
Keep paths separate for initial prototype. Plan future enhancement: "Switch Mode" option that:
- Preserves data from both paths
- Shows warning about which data is active
- Allows switching if user realizes they chose wrong path

### Benefits
- **Simplicity:** Users understand which approach they're using
- **Clarity:** No ambiguity about data priority
- **Focus:** Each path optimized for its use case
- **Prevents errors:** No conflicting information

### Future Enhancement Path
```
Config Panel (Questions Path):
┌─────────────────────────────────┐
│ Your Answers                    │
│ • Business hours: [edit]        │
│ • Duration: [edit]              │
│                                 │
│ ⚠️ Want to use knowledge docs   │
│    instead?                     │
│ [Switch to Knowledge Mode]      │
│                                 │
│ Your answers will be saved but  │
│ the agent will use documents.   │
└─────────────────────────────────┘
```

---

## 3. SiteGPT-Style Agent Introduction

### Decision
Show agent greeting, capabilities, and suggested prompts when chat is empty, inspired by SiteGPT's assistant UI.

### Problem
Original design showed empty chat with input field. Users faced:
- "Blank canvas" problem: What should I ask?
- No context: What can this agent do?
- Generic suggestions: Not tailored to this specific agent

### Reference
User shared screenshot of SiteGPT Assistant showing:
- Greeting: "👋 Hi, I'm the SiteGPT Assistant"
- Capabilities list: "Ask me about: Plans & pricing, Setup & integrations..."
- Suggested prompts as buttons
- Clean, approachable design

### Solution
Implement similar pattern with dynamic content:

**Empty State:**
```
┌─────────────────────────────────┐
│         👋                      │
│   Hi, I'm [Agent Name]          │
│   [User's intent]               │
│                                 │
│   I can help you with:          │
│   • [Capability 1]              │
│   • [Capability 2]              │
│   • [Capability 3]              │
│                                 │
│   Try asking:                   │
│   [Prompt 1 button]             │
│   [Prompt 2 button]             │
│   [Prompt 3 button]             │
└─────────────────────────────────┘
```

**Active Chat State:**
```
┌─────────────────────────────────┐
│ User: What are your hours?      │
│ Agent: We're open Mon-Fri...    │
│ User: Can I book an appointment?│
│ Agent: Yes, I can help with...  │
└─────────────────────────────────┘
```

### Dynamic Content Generation

**Capabilities:**
- Questions path: Derived from domain and answers
  - Scheduling: "Check availability", "Book appointments"
  - Support: Lists actual support topics from answers
  - Sales: "Discuss pricing", "Schedule demos"
- Knowledge path: Inferred from file names/URLs
  - "pricing.pdf" → "Pricing & plans"
  - "faq" → "Frequently asked questions"

**Suggested Prompts:**
- Domain-specific questions
- Scheduling: "What are your business hours?", "How do I book?"
- Support: "What are your support hours?", "What topics?"
- Sales: "What are your pricing plans?", "Can I schedule a demo?"
- Knowledge: Based on uploaded content keywords

### Benefits
- **Removes friction:** No blank canvas anxiety
- **Sets expectations:** Clear what agent can do
- **Encourages action:** Clickable prompts lower barrier to testing
- **Professional feel:** Modern, approachable UI
- **Context-aware:** Shows relevant info, not generic placeholders

### Implementation Notes
- Greeting disappears when first message sent
- Can return to greeting by resetting chat (e.g., after config save)
- Suggested prompts generate realistic responses
- Capabilities list limited to 4 items (most important)

---

## 4. Change Detection & Conditional Save Button

### Decision
Save button only appears when configuration has been edited. Uses computed property to detect changes.

### Problem
Options:
- A) Always show save button
- B) Show save button only when needed (chosen)

### Analysis

**Option A: Always Show**
- ✅ Consistent UI
- ❌ Unnecessary action when nothing changed
- ❌ No visual feedback that edits were made
- ❌ Users might save repeatedly for no reason

**Option B: Show When Needed**
- ✅ Clear affordance: button appears when relevant
- ✅ Visual feedback: "Yes, you made changes"
- ✅ Prevents unnecessary saves
- ✅ Modern pattern (common in web apps)
- ❌ Slightly more complex implementation

### Solution
Implement change detection with `hasConfigChanges` computed property:

```javascript
const originalConfig = ref({})  // Stored on test screen init

const hasConfigChanges = computed(() => {
  if (editableAgentName.value !== originalConfig.value.agentName)
    return true
  if (editableIntent.value !== originalConfig.value.intent)
    return true

  // Check answers (questions path)
  if (pathTaken.value === 'questions') {
    for (const question of clarifyingQuestions.value) {
      if (answers.value[question.id] !== originalConfig.value.answers?.[question.id]) {
        return true
      }
    }
  }

  return false
})
```

Button visibility:
```vue
<button
  v-if="hasConfigChanges"
  class="btn-save-changes"
  @click="saveConfigChanges">
  Save Changes & Refresh Agent
</button>
```

### Benefits
- **Clear feedback:** Button appears = changes detected
- **Prevents errors:** Can't accidentally save unchanged config
- **Modern UX:** Follows industry best practices
- **Performance:** No unnecessary regeneration

### Limitations
- Knowledge path: Currently only detects name/intent changes, not knowledge item changes
- Deep comparison: Needs improvement for nested object changes
- No "Discard Changes" button (future enhancement)

---

## 5. Chat Reset on Configuration Save

### Decision
Clear chat messages and return to greeting when configuration changes are saved.

### Problem
When user edits configuration (e.g., changes business hours from "9-5" to "10-6"):
- A) Keep existing chat history
- B) Clear chat and reset to greeting (chosen)

### Analysis

**Option A: Keep Chat**
- ✅ Preserves context
- ✅ No work lost
- ❌ Old responses now incorrect (based on old config)
- ❌ Confusing: "You just said 9-5, now you say 10-6?"
- ❌ Mixed messages: Old + new info

**Option B: Clear Chat**
- ✅ Clean slate with new configuration
- ✅ All responses reflect updated config
- ✅ Clear signal: "Agent has been updated"
- ✅ Returns to greeting showing new info
- ❌ Loses conversation history

### Solution
Clear chat and reset to greeting when save is clicked:

```javascript
function saveConfigChanges() {
  // Update configuration
  userIntent.value = editableIntent.value
  generatedPlan.value.agentName = editableAgentName.value

  // Regenerate plan
  if (pathTaken.value === 'questions') {
    generatePlanFromQuestions()
  } else {
    generatePlanFromKnowledge()
  }

  // Update original config
  originalConfig.value = {
    agentName: editableAgentName.value,
    intent: editableIntent.value,
    answers: pathTaken.value === 'questions' ? { ...answers.value } : {}
  }

  // Clear chat and reset
  chatMessages.value = []
  chatInput.value = ''
}
```

### Benefits
- **Consistency:** All responses based on current config
- **Clarity:** Clear signal that agent updated
- **Fresh start:** Greeting shows updated information
- **No confusion:** Eliminates conflicting information

### User Flow
1. User tests agent: "What are your hours?"
2. Agent responds: "We're open 9-5"
3. User edits hours to "10-6"
4. User clicks "Save Changes"
5. Chat clears
6. Greeting reappears with updated agent name/intent
7. User tests again: "What are your hours?"
8. Agent responds: "We're open 10-6" ✅

### Alternative Considered
Show "Agent Updated" banner in chat without clearing:
```
[Previous messages...]
─────────────────────────
⚠️ Agent configuration updated
─────────────────────────
[New messages use new config]
```

Rejected because:
- More complex implementation
- Still potentially confusing
- Doesn't solve conflicting info problem
- Greeting already provides clear reset signal

---

## 6. Domain Detection Keywords

### Decision
Use simple keyword matching for domain detection rather than NLP/ML.

### Keywords
- **Scheduling:** appointment, booking, schedule, calendar
- **Support:** support, help, customer service, answer questions
- **Sales:** sales, pricing, demo, qualify leads
- **Orders:** order, shipping, track, return
- **General:** Everything else

### Rationale
- **Prototype speed:** Simple implementation
- **Good enough:** Catches 80% of cases correctly
- **Easy to debug:** Clear what triggers what
- **No dependencies:** No external NLP libraries
- **Extensible:** Easy to add more keywords

### Limitations
- Ambiguous cases: "Help customers book appointments" → support or scheduling?
- Currently: First match wins (order matters)
- Handles: "appointment" checked before "help"
- Edge cases: Generic descriptions like "Help people" → general

### Future Enhancement
- More sophisticated intent classification
- ML model for ambiguous cases
- Multi-domain agents (e.g., support + scheduling)
- User confirmation: "I detected scheduling. Is that right?"

---

## 7. Simulated Agent Responses

### Decision
Generate responses using simple conditional logic based on domain and user input, not real AI.

### Implementation
```javascript
function generateAIResponse(message) {
  const msg = message.toLowerCase()

  if (pathTaken.value === 'questions') {
    if (detectedDomain.value === 'scheduling') {
      if (msg.includes('hours') || msg.includes('when')) {
        return `Our business hours are ${answers.value.business_hours}...`
      }
      if (msg.includes('book') || msg.includes('appointment')) {
        return `I can help you book an appointment!...`
      }
    }
    // ... more domains
  }

  // Generic fallback
  return `I understand your question about "${message}"...`
}
```

### Rationale
- **Prototype:** No need for real AI in prototype
- **Demonstrates concept:** Shows how agent would respond
- **Fast:** Instant responses, no API calls
- **Deterministic:** Same input = same output (easier testing)
- **No costs:** No API usage fees

### Limitations
- Not realistic conversation
- No context awareness
- Limited response variety
- Can't handle complex queries

### Production Path
Replace with:
- Real LLM API calls (Anthropic Claude, OpenAI, etc.)
- RAG (Retrieval Augmented Generation) for knowledge
- Vector search for relevant information
- Conversation memory/context
- Streaming responses

---

## 8. localStorage for Persistence

### Decision
Use browser localStorage for all data persistence. No backend.

### What's Stored
```javascript
localStorage.setItem('daart-agents', JSON.stringify(agents))
localStorage.setItem('daart-plan-{agentId}', JSON.stringify(plan))
localStorage.setItem('daart-onboarding-complete', 'true')
```

### Rationale
- **Prototype speed:** No backend setup required
- **Client-side:** Works without server
- **Simple:** Standard Web API
- **Sufficient:** Prototype doesn't need multi-user support

### Limitations
- **Not persistent across devices:** Each browser has own data
- **Can be cleared:** User can delete browser data
- **No collaboration:** Can't share between users
- **Limited size:** ~5-10MB limit
- **No backup:** Data loss if localStorage cleared

### Production Path
- Real database (PostgreSQL, MongoDB, etc.)
- User accounts and authentication
- Cloud storage for uploaded files
- Real-time sync across devices
- Backup and recovery systems

---

## 9. Questions Before Knowledge

### Decision
Offer "Answer Questions" as first choice, "Upload Knowledge" as second.

### Rationale
- **Guided experience:** Questions provide structure
- **Lower barrier:** No files needed to start
- **Better data:** Structured answers easier to work with
- **Immediate value:** Can create agent without any prep
- **Common path:** Most users benefit from guided approach

### Alternative Considered
- Make knowledge path first (rejected: requires prep)
- Equal visual weight (current: both cards same size)
- Single path only (rejected: limits flexibility)

### User Research Needed
- Which path do users prefer?
- Does order matter?
- Should we recommend based on use case?
- A/B test different presentations?

---

## 10. Lo-Fi Styling Approach

### Decision
Maintain strict lo-fi aesthetic throughout implementation.

### Constraints
- No colors (black, white, gray only)
  - Exception: Green for save button (#4CAF50) - semantic meaning
- No icons (text labels only)
  - Exception: Emoji in agent greeting (👋) - personality
- No animations (instant transitions)
- No images
- Simple borders (1px solid)
- System fonts only
- Native form elements

### Rationale
- **Speed:** No design decisions required
- **Focus:** Validate flow, not aesthetics
- **Iteration:** Easy to change structure
- **Handoff:** Design team has blank canvas
- **Performance:** No asset loading

### Where Lo-Fi Was Challenged
1. **Save button color:** Green adds semantic meaning (safe to proceed)
2. **Agent emoji:** Adds personality without complexity
3. **Hover states:** Minimal affordance for interactivity

All exceptions approved as necessary for UX, not aesthetics.

---

## Summary of Key Decisions

| Decision | Approach | Rationale |
|----------|----------|-----------|
| Test & Edit UI | Unified screen | Reduce navigation friction |
| Path Separation | Keep separate | Clear mental model |
| Agent Introduction | SiteGPT-style | Remove blank canvas anxiety |
| Save Button | Conditional | Visual feedback for changes |
| Chat Reset | Clear on save | Avoid conflicting info |
| Domain Detection | Keyword matching | Simple, fast, good enough |
| Agent Responses | Simulated | Prototype speed |
| Persistence | localStorage | No backend needed |
| Path Order | Questions first | Guided > unguided |
| Styling | Strict lo-fi | Speed and focus |

---

**These decisions prioritize prototype speed and concept validation over production-ready implementation.**

**Last Updated:** 2025-01-06
