# Onboarding V2 Implementation Guide

**Date:** 2025-01-06
**Status:** Current Implementation
**File:** `src/views/OnboardingV2View.vue`

---

## Overview

The V2 onboarding flow implements the dynamic, intent-first philosophy with two distinct paths for agent configuration, culminating in a unified test-and-edit interface.

---

## Flow Structure

### Step 1: Intent Capture
**Screen:** Intent Input
**Component:** `.intent-screen`

**Purpose:** Capture user's natural language description of what they want their agent to do.

**UI Elements:**
- Large textarea for intent description
- Continue button (enabled when text is present)
- Example prompts to guide users

**User Actions:**
- Types their intent in natural language
- Clicks "Continue"

**System Actions:**
- Analyzes intent text for domain detection
- Keywords trigger domain classification:
  - "appointment/booking/schedule/calendar" → `scheduling`
  - "support/help/customer service/answer questions" → `support`
  - "sales/pricing/demo/qualify leads" → `sales`
  - "order/shipping/track/return" → `orders`
  - Everything else → `general`

**Data Captured:**
- `userIntent` - Full text description
- `detectedDomain` - Classified domain type

---

### Step 2: Path Selection
**Screen:** Choice Screen
**Component:** `.choice-screen`

**Purpose:** Let users choose how they want to configure their agent.

**UI Elements:**
- Two cards side-by-side:
  1. **Answer Questions** - Guided Q&A approach
  2. **Upload Knowledge** - Document/URL-based approach
- Both cards show estimated time
- Back button to return to intent

**User Actions:**
- Clicks one of the two path cards

**System Actions:**
- Sets `pathTaken` to either `'questions'` or `'knowledge'`
- Navigates to appropriate next step

---

### Step 3a: Questions Path
**Screen:** Questions Screen
**Component:** `.questions-screen`

**Purpose:** Collect structured information through targeted questions based on detected domain.

**Question Types:**
- `text` - Single-line text input
- `textarea` - Multi-line text input
- `select` - Dropdown selection

**Domain-Specific Questions:**

#### Scheduling Domain
1. Business type (text)
2. Appointment duration (text)
3. Buffer time (text)
4. Business hours (text)
5. Calendar system (select)
6. Special rules (textarea)

#### Support Domain
1. Business name (text)
2. Support topics (textarea)
3. Support hours (text)
4. Escalation method (text)
5. Knowledge sources (textarea)

#### Sales Domain
1. Business name (text)
2. Products/services (textarea)
3. Pricing model (text)
4. Qualification criteria (textarea)
5. Call to action (text)

#### Orders Domain
1. Business name (text)
2. Order system (select)
3. Common questions (textarea)
4. Return policy (textarea)
5. Escalation method (text)

#### General Domain
1. Business/agent name (text)
2. Main tasks (textarea)
3. Target audience (text)
4. Knowledge sources (textarea)
5. Special requirements (textarea)

**User Actions:**
- Fills out all question fields
- Clicks "Continue to Test" (enabled when all fields have values)

**System Actions:**
- Stores all answers in `answers` object keyed by question ID
- Validates all questions are answered
- Proceeds to test screen

**Data Captured:**
- `answers` - Object mapping question IDs to user responses
- `clarifyingQuestions` - Array of question objects

---

### Step 3b: Knowledge Upload Path
**Screen:** Knowledge Upload Screen
**Component:** `.knowledge-screen`

**Purpose:** Allow users to upload various types of knowledge sources.

**Three Tabs:**

#### 1. Upload Files Tab
- File picker supporting: PDF, DOCX, TXT, CSV
- 10MB per file limit
- Multiple file selection
- Shows uploaded files list with remove option
- File status indicator

**Data Structure:**
```javascript
{
  id: timestamp + random,
  name: "filename.pdf",
  size: 1024000,
  status: "ready",
  content: ""
}
```

#### 2. Paste Text Tab
- Large textarea for pasting content
- Character counter
- "Add to Knowledge" button
- Shows added text snippets with titles
- Remove option for each snippet

**Data Structure:**
```javascript
{
  id: timestamp,
  title: "Text snippet 1",
  content: "actual text content..."
}
```

#### 3. Add Website Tab
- URL input field
- "Add Website" button
- Shows added URLs with status
- Remove option for each website

**Data Structure:**
```javascript
{
  id: timestamp,
  url: "https://example.com",
  status: "ready"
}
```

**User Actions:**
- Switches between tabs
- Uploads files / pastes text / adds URLs
- Removes items as needed
- Clicks "Continue to Test" (enabled when at least one item added)

**System Actions:**
- Validates file sizes
- Tracks all knowledge items in separate arrays
- Combines all knowledge sources into `knowledgeItems` computed property

**Data Captured:**
- `uploadedFiles` - Array of file objects
- `textSnippets` - Array of text snippet objects
- `websites` - Array of website URL objects

---

### Step 4: Test & Configuration Screen
**Screen:** Unified Test Screen
**Component:** `.test-screen`

**Purpose:** Allow users to test their agent while simultaneously editing configuration, eliminating the need to navigate back and forth.

**Layout:** Split view with chat on left (narrower) and configuration on right (wider)

#### Left Panel: Chat Interface (400px fixed width)

**Empty State (No chat messages):**
- **Agent Greeting:**
  - Waving hand emoji (👋)
  - Agent name as heading
  - User's original intent displayed

- **Capabilities Section:**
  - "I can help you with:" heading
  - 3-4 bullet points of agent capabilities
  - Dynamically generated based on domain/answers/knowledge

- **Suggested Prompts:**
  - "Try asking:" label
  - 3 clickable prompt buttons
  - Domain-specific suggestions
  - Clicking sends the prompt as a message

**Active Chat State (Has messages):**
- Scrollable message history
- User messages (right-aligned, black background)
- Agent messages (left-aligned, white background)
- Auto-scroll to latest message

**Chat Input (Always visible):**
- Text input field
- Send button (disabled when empty)
- Enter key submits

**Capability Generation Logic:**

For **Questions Path:**
- Scheduling: "Check appointment availability", "Book and manage appointments", "Answer scheduling questions"
- Support: Uses first 3 topics from `support_topics` answer, or defaults to generic support capabilities
- Sales: "Answer product questions", "Discuss pricing and plans", "Schedule demos and trials"
- Orders: "Track order status", "Explain return and refund policies", "Answer shipping questions"
- General: "Answer questions", "Provide information", "Help with common tasks"

For **Knowledge Path:**
- Infers capabilities from file names and URLs
- Looks for keywords: "pricing", "faq", "support", "product"
- Defaults to: "Answer questions based on your knowledge", "Provide helpful information"

**Suggested Question Generation Logic:**

For **Questions Path:**
- Scheduling: "What are your business hours?", "How do I book an appointment?", "Can I reschedule?"
- Support: "What are your support hours?", "How do I get help with my account?", "What topics can you help with?"
- Sales: "What are your pricing plans?", "Can I schedule a demo?", "What products do you offer?"
- Orders: "How do I track my order?", "What is your return policy?", "How long does shipping take?"

For **Knowledge Path:**
- Generates questions based on knowledge content keywords
- If contains "pricing" → "What are your pricing plans?"
- If contains "return/refund" → "How do I return an item?"
- If contains "faq/help" → "What are your business hours?"
- Defaults: "Tell me about your company", "How can you help me?"

#### Right Panel: Configuration Panel (Flex-grow, scrollable)

**Always Visible Sections:**

1. **Agent Name Field**
   - Label: "Agent Name"
   - Single-line text input
   - Pre-populated with generated name
   - Editable

2. **Purpose Field**
   - Label: "Purpose"
   - Multi-line textarea (3 rows)
   - Pre-populated with user's original intent
   - Editable

**Conditional Section - Questions Path:**

3. **Your Answers Section**
   - Label: "Your Answers"
   - Shows ALL questions with their answers
   - Each question displays:
     - Question text as label
     - Original answer in editable field (text/textarea/select)
   - Fields are directly editable
   - Same field types as original questions screen

**Conditional Section - Knowledge Path:**

3. **Knowledge Sources Section**
   - Label: "Knowledge Sources"
   - Three groups (if items exist):

     a. **Files Group**
        - "FILES" group label
        - List of uploaded files
        - Each item shows: filename + "Remove" button

     b. **Text Snippets Group**
        - "TEXT SNIPPETS" group label
        - List of text snippets
        - Each item shows: snippet title + "Remove" button

     c. **Websites Group**
        - "WEBSITES" group label
        - List of website URLs
        - Each item shows: URL + "Remove" button

   - "+ Add More Knowledge" button at bottom
     - Clicking returns to knowledge upload screen
     - Preserves existing knowledge items

**Action Buttons (Always at bottom):**

- **Save Changes & Refresh Agent** button
  - Green background (#4CAF50)
  - Only appears when changes detected
  - Clicking triggers save and chat reset

- **Continue Configuration** button
  - Black background
  - Always visible
  - Proceeds to execution step

**Change Detection Logic:**

System tracks changes to:
- Agent name (compares with `originalConfig.agentName`)
- Purpose/intent (compares with `originalConfig.intent`)
- For questions path: Each answer field (compares with `originalConfig.answers`)

`hasConfigChanges` computed property returns true if any field differs from original.

**Save Changes Behavior:**

When user clicks "Save Changes & Refresh Agent":
1. Updates `userIntent` with edited intent
2. Updates `generatedPlan.agentName` with edited name
3. Regenerates plan based on path (calls `generatePlanFromQuestions()` or `generatePlanFromKnowledge()`)
4. Updates `originalConfig` with new values
5. Resets chat messages array (clears conversation)
6. Resets chat input field
7. Agent greeting reappears with updated information

This allows users to:
- Test agent → Notice something wrong
- Edit configuration directly
- Save changes → Chat resets
- Test again immediately with updated agent

**User Flow Example:**

1. User sees agent introduction with greeting and capabilities
2. Clicks a suggested prompt or types own message
3. Agent responds based on configuration
4. User notices agent name is wrong
5. Edits agent name in right panel
6. Green "Save Changes" button appears
7. Clicks save
8. Chat clears, shows updated agent greeting with new name
9. User tests again

---

### Step 5: Execution & Deployment
**Screen:** Execution Screen
**Component:** `.execution-screen`

**Purpose:** Show progress as agent is being finalized and deployed.

**UI Elements:**
- "Setting up your agent..." heading
- Phase progress indicator
- Each phase shows status: ✓ (done), ⋯ (current), ○ (pending)
- Current phase shows status text
- Completion screen with "Open Workspace" button

**System Actions:**
- Executes phases sequentially with 2-second delay
- Creates agent object with all configuration
- Saves to localStorage as `daart-agents`
- Saves detailed plan to localStorage as `daart-plan-{agentId}`
- Marks onboarding as complete
- Redirects to agent workspace

**Phase Structure (Generated from Questions/Knowledge):**

Example for Scheduling:
1. Phase 1: Basic Setup
2. Phase 2: Knowledge & Policies
3. Phase 3: Testing
4. Phase 4: Integration & Deploy

**Data Saved:**

Agent Object:
```javascript
{
  id: timestamp,
  name: "Agent Name",
  problemType: "scheduling",
  status: "draft",
  statusText: "Draft",
  lastUpdated: "Just now",
  conversations: 0,
  instructions: "Full generated instructions...",
  knowledgeBase: "Description of knowledge",
  skills: [],
  knowledge: [...knowledgeItems],
  settings: {...settings from answers},
  onboardingPlan: {
    userIntent, domain, pathTaken,
    answers, knowledgeItems, phases,
    createdAt
  },
  channels: {
    webChat: { enabled: true, ... },
    voice: { enabled: false },
    sms: { enabled: false }
  },
  needsWizard: false
}
```

---

## Key Design Decisions

### 1. Unified Test & Edit Interface

**Problem:** Users had to go back to previous screens to make changes, test again, then return.

**Solution:** Single screen with chat on left and editable config on right.

**Benefits:**
- Immediate feedback loop
- No navigation friction
- Clear visual separation of testing vs configuration
- All relevant info visible at once

### 2. Path Separation (No Cross-Pollination)

**Decision:** Users cannot add knowledge if they chose questions path, and vice versa.

**Rationale:**
- **Simplicity:** Clear mental model - one approach per agent
- **Avoid Conflicts:** Prevents confusion about what the agent prioritizes
- **Focused UX:** Each path optimized for its use case

**Future Enhancement:**
- "Switch Mode" option that saves current work and switches paths
- Warning that previous data will be preserved but may not be used

### 3. SiteGPT-Style Agent Introduction

**Inspiration:** SiteGPT's friendly assistant introduction screen.

**Implementation:**
- Greeting with emoji and agent name
- "I can help you with:" capabilities list
- "Try asking:" suggested prompts as buttons

**Benefits:**
- Immediate understanding of agent's purpose
- Removes "blank canvas" friction
- Encourages testing with relevant prompts
- Professional, approachable feel

### 4. Change Detection & Conditional Save Button

**Pattern:** Save button only appears when edits are made.

**Implementation:**
- `originalConfig` stores initial values
- `hasConfigChanges` computed property compares current vs original
- Button visibility bound to this computed property

**Benefits:**
- Clear affordance - button appears when needed
- Prevents unnecessary saves
- Visual feedback that changes exist

### 5. Chat Reset on Save

**Decision:** Clearing chat when config changes are saved.

**Rationale:**
- Previous chat was based on old configuration
- Could confuse user if old responses remain
- Fresh start with updated agent
- Returns to greeting state showing new configuration

---

## Data Flow

### Questions Path Data Flow
```
Intent Input
    ↓
[userIntent, detectedDomain]
    ↓
Choice Screen → Questions Path
    ↓
[answers object populated]
    ↓
Generate Plan → Test Screen
    ↓
[editableAgentName, editableIntent, answers]
    ↓
(Optional) Edit & Save
    ↓
Execution → Agent Created
```

### Knowledge Path Data Flow
```
Intent Input
    ↓
[userIntent, detectedDomain]
    ↓
Choice Screen → Knowledge Path
    ↓
[uploadedFiles, textSnippets, websites]
    ↓
Generate Plan → Test Screen
    ↓
[editableAgentName, editableIntent, knowledgeItems]
    ↓
(Optional) Edit & Save / Add More Knowledge
    ↓
Execution → Agent Created
```

---

## Styling Philosophy

**Approach:** Lo-fi prototype styling

**Characteristics:**
- Minimal color palette (black, white, grays)
- System fonts
- Simple borders and spacing
- Hover states for interactivity
- Focus states for accessibility
- Green for save action (#4CAF50)
- Black for primary actions
- Gray borders for containers

**Layout:**
- Responsive flex layouts
- Fixed widths where needed (chat panel: 400px)
- Scrollable containers with max-heights
- Consistent padding and gaps (12px, 16px, 24px scale)

**Typography:**
- Headings: 600 weight
- Body: 400 weight
- Labels: 600 weight
- Sizes: 13px-20px range
- Line heights: 1.4-1.6 for readability

---

## State Management

**Reactive Variables:**

```javascript
// Navigation
currentStep: ref('intent') // 'intent' | 'choice' | 'questions' | 'knowledge' | 'test' | 'execution'

// Intent
userIntent: ref('')
detectedDomain: ref('')
intentError: ref('')

// Path
pathTaken: ref('') // 'questions' | 'knowledge'

// Questions Path
clarifyingQuestions: ref([])
answers: ref({})
questionsIntro: ref('')

// Knowledge Path
activeTab: ref('upload')
uploadedFiles: ref([])
textSnippets: ref([])
websites: ref([])
pasteText: ref('')
websiteUrl: ref('')

// Test Screen
chatMessages: ref([])
chatInput: ref('')
editableAgentName: ref('')
editableIntent: ref('')
originalConfig: ref({})

// Generated
generatedPlan: ref({
  agentName: '',
  purpose: '',
  phases: [],
  settings: {},
  instructions: ''
})

// Execution
currentPhaseIndex: ref(0)
currentPhaseStatus: ref('')
executionComplete: ref(false)
```

**Computed Properties:**

```javascript
// Validation
allQuestionsAnswered: computed(() =>
  clarifyingQuestions.value.every(q =>
    answers.value[q.id]?.trim().length > 0
  )
)

// Knowledge aggregation
knowledgeItems: computed(() =>
  [...uploadedFiles.value, ...textSnippets.value, ...websites.value]
)

// Agent capabilities (dynamic based on path/domain)
agentCapabilities: computed(() => [...])

// Suggested questions (dynamic based on path/domain)
suggestedQuestions: computed(() => [...])

// Change detection
hasConfigChanges: computed(() =>
  editableAgentName.value !== originalConfig.value.agentName ||
  editableIntent.value !== originalConfig.value.intent ||
  answersChanged()
)
```

---

## Testing & Validation

### Questions Path Validation
- All fields must have non-empty values
- "Continue to Test" button disabled until valid
- Error states for empty fields (future enhancement)

### Knowledge Path Validation
- Must have at least one knowledge item (file, snippet, or URL)
- File size validation (10MB limit)
- URL format validation (basic)
- "Continue to Test" button disabled until valid

### Change Detection Validation
- Compares current values with `originalConfig`
- Deep comparison for answers object
- Triggers save button visibility

---

## Future Enhancements

### Planned Features
1. **Switch Mode Option**
   - Allow switching between questions and knowledge paths
   - Preserve data from both paths
   - Clear warning about which data will be used

2. **Hybrid Approach**
   - Allow adding supplementary knowledge on questions path
   - Allow answering key questions on knowledge path
   - Clear priority system (e.g., answers override knowledge)

3. **Real-time Agent Updates**
   - Auto-save on field blur
   - Live agent updates without full reset
   - Maintain chat history with "Agent updated" indicator

4. **Enhanced Capabilities Generation**
   - More sophisticated NLP for capability extraction
   - User-editable capabilities list
   - Capability prioritization

5. **Test Case Generation**
   - Auto-generate test questions based on config
   - Pass/fail indicators
   - Edge case testing

6. **Multi-agent Support**
   - Create multiple agents in one session
   - Compare different configurations side-by-side
   - Template/clone from existing agents

---

## Troubleshooting

### Chat Not Responding
- Check `chatInput` has value
- Verify `sendMessage()` function is being called
- Check `generateAIResponse()` for domain logic

### Save Button Not Appearing
- Verify `hasConfigChanges` computed property
- Check `originalConfig` is properly initialized
- Ensure fields are bound to correct v-model

### Knowledge Items Not Showing
- Check correct tab is active
- Verify items added to correct array
- Check `knowledgeItems` computed property

### Plan Generation Failing
- Verify all required answers present (questions path)
- Check `detectedDomain` is set correctly
- Review `generatePlanFromQuestions()` or `generatePlanFromKnowledge()`

---

## File Structure

```
src/views/
  OnboardingV2View.vue          # Main onboarding component
    ├── Template
    │   ├── Intent Screen
    │   ├── Choice Screen
    │   ├── Questions Screen
    │   ├── Knowledge Screen
    │   ├── Test Screen
    │   │   ├── Chat Panel (Left)
    │   │   └── Config Panel (Right)
    │   └── Execution Screen
    ├── Script
    │   ├── State Management
    │   ├── Computed Properties
    │   ├── Navigation Functions
    │   ├── Questions Path Logic
    │   ├── Knowledge Path Logic
    │   ├── Test Screen Logic
    │   ├── Plan Generation
    │   └── Agent Creation
    └── Styles
        ├── Intent Styles
        ├── Choice Styles
        ├── Questions Styles
        ├── Knowledge Styles
        ├── Test Styles (Chat + Config)
        ├── Execution Styles
        └── Common Button Styles
```

---

**This document reflects the current state of the V2 onboarding implementation as of 2025-01-06.**
