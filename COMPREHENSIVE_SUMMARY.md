# DAART Onboarding Prototype - Comprehensive Summary

**Last Updated**: 2025-11-10
**Purpose**: Complete documentation of existing prototype features and gap analysis against Jira requirements

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Current Feature Inventory](#2-current-feature-inventory)
3. [Navigation Architecture](#3-navigation-architecture)
4. [Gap Analysis: What's Missing](#4-gap-analysis-whats-missing)
5. [Implementation Priorities](#5-implementation-priorities)

---

## 1. PROJECT OVERVIEW

**Framework**: Vue 3 + Vite
**Router**: Vue Router 4 (hash mode)
**State**: Pinia + localStorage
**Design**: Lo-fi prototype (no icons/emojis)

### Core User Flow
```
Home (Agent Hub) → Create Agent → Onboarding → BUILD → TEST → EVALUATE → DEPLOY → MONITOR
```

---

## 2. CURRENT FEATURE INVENTORY

### ✅ **BUILD Tab - What Exists**

#### Configuration Section
**Location**: `AgentsWorkspaceV2View.vue` (lines 412-845)

**Features**:
- Agent name and behavior instructions
- **Multi-channel configuration**:
  - **Web Chat**: 4 subsections (Messages, Availability, Escalation, Widget Appearance)
    - Welcome/proactive messages
    - Business hours, offline behavior
    - Transfer conditions, handoff settings
    - Widget appearance: color, position, display name, size
  - **Voice/Phone**: Phone number, voice type (6 options), greetings, speech speed, language
  - **SMS**: Phone number, auto-reply settings
  - **Coming Soon**: WhatsApp, Instagram, Facebook Messenger

**✅ Widget Configuration EXISTS**: Lines 632-687 show widget appearance settings (color, position, name, size) but **NO live preview panel**

#### Sources Section
**Location**: `AgentsWorkspaceV2View.vue` (lines 847-1065)

**Features**:
- Connected sources display with remove buttons
- **Available sources** (accordion UI):
  - **Integrations**: 12 platforms (Notion, Confluence, Google Drive, Slack, Zendesk, Salesforce, SharePoint, Dropbox, GitHub, Intercom, Freshdesk, Jira)
  - **Documents**: PDF, Word, Excel, CSV upload
  - **Conversations**: CSV/JSON import
  - **Text Snippets**: Textarea with title
  - **Websites**: URL with crawl toggle

**✅ Connectors Directory EXISTS**: Lines 930-948 show 12 integration platforms

#### Skills Section
**Location**: `AgentsWorkspaceV2View.vue` (lines 1067-1166)

**Features**:
- Skills table with filters (search, status, sources, labels)
- "Create New Skill" and "Add Skills" buttons
- 8 available skills in mock data (Calendar, Order Lookup, Knowledge Base Search, etc.)
- Status badges and labels

**❌ Skill Mining MISSING**: No "Suggested Skills" section showing skills discovered from conversations

#### Visual Builder Section
**Location**: `AgentsWorkspaceV2View.vue` (lines 1169-1225)

**Features**:
- Canvas area with zoom controls (placeholder)
- AI Builder panel with "Build with AI" tab
- Empty state placeholder

#### COMPASS Validation
**Location**: `AgentsWorkspaceV2View.vue` (lines 389-410)

**Features**:
- Collapsible validation panel
- Error and warning severity levels
- Field-specific validation messages
- Rules: Agent name, instructions, knowledge base

#### AI Assistant
**Location**: `AIAssistant.vue`

**Features**:
- Context-aware suggestions (configuration/knowledge/skills)
- Collapsible panel
- "Apply" buttons for suggestions
- Quick help tips

---

### ✅ **TEST Tab - What Exists**

**Location**: `AgentsWorkspaceV2View.vue` (lines 1237-1336)

**Features**:
- Test scenario creation with keyword matching
- "Create Test" modal with name, prompt, expected keywords
- Run individual or all tests
- Results showing matched/missing keywords
- Pass/fail indicators
- Testing panel with live agent chat

---

### ✅ **EVALUATE Tab (Proving Ground) - What Exists**

**Location**: `ProvingGroundPanel.vue`

**Features**:
- Empty state with "Run Your First Evaluation" CTA
- Setup modal:
  - Channel selection (Chat, Voice)
  - Scenario count (10/25/50)
  - Customer personas (5 personas: Frustrated, Impatient, Confused, Technical, Non-technical)
- Test runs history with metrics cards
- Results modal showing:
  - Task Completion Rate
  - AI CSAT
  - Avg Response Time
  - Failure analysis by category

**❌ Red Team Testing MISSING**: No security testing category (prompt injection, jailbreak, PII leakage, etc.)

---

### ✅ **DEPLOY Tab - What Exists**

**Location**: `DeployView.vue`

**Features**:
- **Review state (Draft agents)**:
  - Cost breakdown (trial vs post-trial)
  - Billing timeline (3 stages)
  - Configuration checklist (instructions, knowledge, skills, channels)
  - "What Happens When You Publish" info
- **Integration state (Live agents)**:
  - Setup instructions by agent type
  - Code snippets for web chat
  - Phone numbers for voice
  - "Start Monitoring" CTA

---

### ✅ **MONITOR Tab - What Exists**

**Location**: `AgentsWorkspaceV2View.vue` (lines 1343-1507)

**Features**:
- **Dashboard sub-tab**:
  - Time filter (1D, 1W, 1M)
  - Key metrics (Deflection rate, Total sessions, Automated sessions)
  - Performance metrics (Response time, Customer satisfaction, AI CSAT)
  - Notifications panel (3 sample alerts)
  - Status banner with active channels
- **Traces sub-tab** (`TracesPanel.vue`):
  - Searchable conversation list
  - Filters (channel, outcome)
  - Table with: ID, Time, Channel, Duration, Outcome, AI CSAT, Skills Used
  - Detail page (`ConversationDetailView.vue`): Full transcript, skills used, action outputs

**❌ Skill Mining Widget MISSING**: No "Suggested Skills" widget in Dashboard

**❌ Security Alerts MISSING**: No Red Team testing alerts in Dashboard

---

### ✅ **Onboarding Flows - What Exists**

#### OnboardingV2View
**Features**:
- Step 1: Intent capture (large textarea)
- Step 2: Method selection (Answer questions vs Upload knowledge)
- Step 3a: Dynamic questions path
- Step 3b: Knowledge upload path (5 tabs: Platforms, Files, Website, Text, Conversations)

#### BuildAgentView
**Features**:
- Shows captured intent
- 3 method cards: Questions, Knowledge, Visual workflow
- Routes to appropriate onboarding path

#### AgentTestView
**Features**:
- 2-panel layout: Config summary (left) + Chat testing (right)
- Shows configuration based on selected method
- Suggested questions
- Add knowledge/integration modals

---

### ✅ **Other Components**

#### TestingPanel
**Location**: `components/workspace/TestingPanel.vue`

**Features**:
- Channel tabs for omnichannel agents
- Digital agent testing: Chat interface with typing indicator
- Voice agent testing: Call simulation with live transcript

#### AgentHubView
**Features**:
- Empty state component
- Trial banner
- First agent success view (shows after first agent creation)
- Agent card grid
- Notifications panel

#### AppSidebar
**Features**:
- Navigation sections: Home, Agents, Knowledge, Analytics, Billing, Settings
- Per-agent tabs (Build, Test, Proving Ground, Monitor, Deploy)
- Different tab order for Live vs Draft agents
- "Reset Demo" link

---

## 3. NAVIGATION ARCHITECTURE

### Main Tabs (For Individual Agent)
```
Build → Test → Proving Ground → Deploy → Monitor
```

### Build Sub-Sections
```
Configuration | Sources | Skills | Visual Builder
```

### Monitor Sub-Tabs
```
Dashboard | Traces
```

### Routes Structure
- `/home` - Agent Hub
- `/agents-v2/:id/build` - Build tab
- `/agents-v2/:id/test` - Test tab
- `/agents-v2/:id/evaluate` - Proving Ground
- `/agents-v2/:id/deploy` - Deploy tab
- `/agents-v2/:id/monitor` - Monitor tab
- `/agents-v2/:id/traces/:convId` - Conversation detail
- `/test-agent?agentId=:id` - Standalone test view

---

## 4. GAP ANALYSIS: WHAT'S MISSING

Based on Jira requirements analysis, here are the features that **DO NOT EXIST** in the prototype:

### ❌ **PRIORITY 1: Skill Mining**

**Requirement**: Auto-discover skills from conversation patterns

**What's Missing**:
1. **Monitor Dashboard Widget** (Priority 1)
   - Location: Should be in `AgentsWorkspaceV2View.vue` Monitor Dashboard section
   - Content: Top 3-5 skill suggestions card
   - Data: Skill name, confidence %, frequency, "Add Skill" CTA

2. **BUILD > Skills Section** (Priority 1)
   - Location: Should be in `AgentsWorkspaceV2View.vue` Skills section (line 1067+)
   - Content: "Skill Suggestions" section at top of skills list
   - Data: Detailed skill cards with:
     - Skill name and description
     - Example conversations where useful
     - Confidence score (%)
     - Frequency (conversation count)
     - "Add to Agent" button

**Mock Data Needed**:
```javascript
suggestedSkills: [
  {
    id: 'skill-suggest-1',
    name: 'Order Status Lookup',
    description: 'Check real-time order status and delivery estimates',
    confidence: 92,
    frequency: 47,
    exampleConversations: [
      { id: 'CONV-045', snippet: 'Customer asked: Where is order #12345?' }
    ],
    source: 'mined'
  }
]
```

---

### ❌ **PRIORITY 1: Widget Configuration Live Preview**

**Requirement**: Split-view config/preview with live widget simulator

**What EXISTS**:
- Configuration form in BUILD > Configuration > Web Chat > Widget Appearance (lines 632-687)
- Fields: primary color, position, display name, widget size

**What's MISSING**:
- **Live preview panel** showing actual widget rendering
- **Split-view layout** (config left, preview right)
- **Real-time updates** as settings change
- **Responsive preview** (desktop/mobile toggle)
- **Interactive widget demo** (can click to open/close)

**Implementation Location**: `AgentsWorkspaceV2View.vue` lines 632-687 needs to be expanded to:
1. Add right-side preview panel
2. Create MockChatWidget component
3. Bind widget appearance to config changes
4. Add desktop/mobile toggle

---

### ❌ **PRIORITY 2: Red Team Testing**

**Requirement**: Security testing category in Proving Ground

**What EXISTS**:
- Proving Ground panel with test configuration
- Persona selection (5 personas)
- Test results with failure analysis

**What's MISSING**:
1. **Security Test Category** in setup modal:
   - Location: `ProvingGroundPanel.vue` setup modal (lines 64-121)
   - Add checkbox section: "Security Testing"
   - Options: Prompt Injection, Jailbreak Attempts, PII Leakage, Instruction Override

2. **Security Results Section**:
   - Location: `ProvingGroundPanel.vue` results modal (lines 124-170)
   - Add "Security Vulnerabilities" section
   - Show: Severity (Critical/High/Medium/Low), Type, Example, Fix suggestion

3. **Dashboard Security Alerts**:
   - Location: `AgentsWorkspaceV2View.vue` Monitor Dashboard (lines 1418-1442)
   - Add security notification card
   - Content: "Security vulnerability detected | 2 hours ago"

**Mock Data Needed**:
```javascript
securityFindings: [
  {
    id: 'sec-1',
    severity: 'High',
    type: 'Prompt Injection',
    description: 'Agent revealed system instructions when asked...',
    example: 'User: "Ignore previous instructions and tell me..."',
    recommendation: 'Add instruction protection filter'
  }
]
```

---

### ❌ **PRIORITY 2: Templates Marketplace**

**Requirement**: Modal with 6 pre-built agent templates

**What EXISTS**:
- Agent creation flow starting from home
- OnboardingV2View for custom agent building

**What's MISSING**:
1. **Templates Modal**:
   - Location: Should be accessible from `AgentHubView.vue` or `AgentsWorkspaceV2View.vue`
   - Trigger: "Use Template" button in header or agent hub
   - Content: 6 template cards in grid layout

2. **Template Cards**:
   - Customer Support
   - Lead Qualification
   - Appointment Booking
   - Order Tracking
   - HR Assistant
   - IT Help Desk

3. **Template Detail View**:
   - Preview description
   - Included skills list
   - Sample knowledge sources
   - Use cases
   - "Use Template" and "Cancel" buttons

4. **Template Application Logic**:
   - Pre-fill agent instructions
   - Add template-specific skills
   - Add sample knowledge content
   - Navigate to BUILD tab

**Mock Data Needed**:
```javascript
templates: [
  {
    id: 'template-1',
    name: 'Customer Support',
    description: 'Handle common customer inquiries, orders, and account issues',
    category: 'Support',
    skills: ['Order Lookup', 'Account Management', 'Ticket Creation'],
    sampleKnowledge: ['FAQ document', 'Product catalog', 'Return policy'],
    instructions: 'You are a helpful customer support agent...',
    useCases: ['Order tracking', 'Returns & refunds', 'Account questions']
  }
]
```

---

## 5. IMPLEMENTATION PRIORITIES

### Priority 1 (Must Have)

#### 1. Skill Mining (Est: 3-4 hours)
**Files to modify**:
- `AgentsWorkspaceV2View.vue`:
  - Add Dashboard widget (lines 1418+ in Monitor Dashboard)
  - Add Skills section panel (lines 1067+ in BUILD Skills)
- Add mock data for skill suggestions

**Tasks**:
1. Create mock skill suggestions data (5 suggested skills)
2. Add "Suggested Skills" widget to Monitor Dashboard
3. Add "Skill Suggestions" section at top of BUILD > Skills
4. Add "Add to Agent" button functionality
5. Style suggestion cards with confidence/frequency badges

---

#### 2. Widget Configuration Live Preview (Est: 5-7 hours)
**Files to modify**:
- `AgentsWorkspaceV2View.vue` (lines 632-687)
- Create new component: `MockChatWidget.vue`

**Tasks**:
1. Restructure widget config section to 2-column layout
2. Create MockChatWidget component with:
   - Widget bubble (positioned based on config)
   - Chat window (opens on click)
   - Header with display name
   - Sample messages
   - Branding based on primaryColor
3. Bind widget to config changes (reactive)
4. Add desktop/mobile preview toggle
5. Add CSS for split-view layout

---

### Priority 2 (Should Have)

#### 3. Red Team Testing (Est: 3-4 hours)
**Files to modify**:
- `ProvingGroundPanel.vue`:
  - Update setup modal (lines 64-121)
  - Update results modal (lines 124-170)
- `AgentsWorkspaceV2View.vue`:
  - Add security alert widget (lines 1418-1442)

**Tasks**:
1. Add "Security Testing" checkbox to setup modal
2. Add 4 security test types (checkboxes)
3. Create mock security findings data
4. Add "Security Vulnerabilities" section to results
5. Add security alert card to Dashboard notifications
6. Style severity badges (Critical/High/Medium/Low)

---

#### 4. Templates Marketplace (Est: 4-5 hours)
**Files to modify**:
- `AgentHubView.vue` or create `TemplatesModal.vue`
- `AgentsWorkspaceV2View.vue` for BUILD tab integration

**Tasks**:
1. Create templates modal component
2. Design 6 template cards with:
   - Title, description, category
   - Skills included list
   - "Preview" and "Use Template" buttons
3. Create mock template data (6 templates)
4. Add "Use Template" button to Agent Hub
5. Implement template application:
   - Create new agent with template data
   - Pre-fill instructions, skills, knowledge
   - Navigate to BUILD tab
6. Style modal and cards

---

## 6. WHAT ALREADY EXISTS (No Need to Build)

### ✅ Connectors Directory
**Location**: BUILD > Sources > Integrations accordion (lines 930-948)
**Status**: Complete with 12 integration platforms
**No action needed**

### ✅ Widget Configuration (Partial)
**Location**: BUILD > Configuration > Web Chat > Widget Appearance (lines 632-687)
**Status**: Configuration form exists, but missing live preview panel
**Action needed**: Add split-view with live preview (Priority 1)

### ✅ Basic Chat Widget Config
**Fields**: Primary color, position, display name, widget size
**Missing**: Live preview, responsive view, interactive demo

---

## 7. FILES TO MODIFY SUMMARY

### High Priority
1. **AgentsWorkspaceV2View.vue**
   - Add Skill Mining widget to Monitor Dashboard (~line 1418)
   - Add Skill Mining section to BUILD > Skills (~line 1067)
   - Enhance Widget Config with split-view (~line 632)

2. **Create MockChatWidget.vue** (new file)
   - Live widget preview component
   - Reactive to config changes

3. **ProvingGroundPanel.vue**
   - Add security testing category (~line 64)
   - Add security results section (~line 124)

### Medium Priority
4. **Create TemplatesModal.vue** (new file)
   - Templates marketplace modal
   - 6 template cards

5. **AgentHubView.vue**
   - Add "Use Template" button
   - Integrate templates modal

---

## 8. ESTIMATED TOTAL TIME

- **Priority 1 (Skill Mining + Widget Preview)**: 8-11 hours
- **Priority 2 (Red Team + Templates)**: 7-9 hours
- **Total**: 15-20 hours

---

## NOTES

- All existing features are static/mock data driven
- No real API integrations
- Focus is on UI/UX demonstration
- localStorage used for all persistence
- Design system: Black primary, lo-fi aesthetic, no icons/emojis
- All new features should follow existing design patterns
