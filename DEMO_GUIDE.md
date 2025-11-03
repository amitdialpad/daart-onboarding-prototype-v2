# DAART Studio - Phase 1 Demo Guide

## What Was Built

Phase 1 implements the complete end-to-end flow from onboarding to agent management, addressing all major feedback from the product review.

### New Components

1. **OnboardingWizardView** - 6-step guided wizard
2. **AgentsWorkspaceView** - Unified workspace with agent list + details
3. **SettingsView** - Account, Team, Integrations, API Keys, Audit Log
4. **Templates System** - 5 pre-built agent templates with sample data

---

## End-to-End Flow

### Step 1: First-Time User Experience
**URL:** http://localhost:3000/

**What happens:**
- New users land on the Onboarding Wizard
- Shows value proposition (Voice-First AI Agent Platform)
- Clear differentiation from Intercom Fin

### Step 2: Choose Template
**What happens:**
- User selects from 5 pre-built templates:
  - Customer Support Bot
  - Sales Qualifier
  - Appointment Scheduler
  - Order Tracking Bot
  - Simple FAQ Bot
- Or "Start from Scratch"

**Key Feature:** Each template includes pre-populated knowledge, skills, and test scenarios for guaranteed success.

### Step 3: Customize Agent
**What happens:**
- Pre-filled with template defaults
- User can edit name, description, instructions
- Sample knowledge already included
- Shows exactly what they're getting

### Step 4: Test It
**What happens:**
- Pre-written test scenarios based on template
- Live chat interface to test agent responses
- User can run pre-defined tests or type custom questions
- Simulated responses (using template knowledge keywords)
- Must run at least 1 test to proceed

**Why this matters:** Users see their agent work BEFORE deploying. Guaranteed success = confidence.

### Step 5: Deploy
**What happens:**
- Choose channel: Web Chat, Phone/Voice, or SMS
- Configure channel-specific settings
- Phone number assignment for voice agents
- Widget positioning for web chat

**Key Differentiation:** Voice/Phone deployment is front and center (Dialpad's advantage over Intercom)

### Step 6: Success!
**What happens:**
- Celebration screen
- Shows agent is live
- Provides embed code (for web) or phone number (for voice)
- "What's Next" guidance
- Button to "Go to My Agents"

**Data Persistence:** Agent is saved to localStorage and can be accessed later.

---

## Agent Workspace (Post-Onboarding)

**URL:** http://localhost:3000/agents-workspace

### Layout
```
┌────────────────────────────────────────┐
│ DAART Studio                           │
│ [AGENTS] [INSIGHTS] [SETTINGS]         │
├──────────┬─────────────────────────────┤
│          │                             │
│ My Agents│  Selected Agent Workspace   │
│          │                             │
│ + [New]  │  [Agent Name & Status]      │
│          │                             │
│ Agent 1  │  [BUILD|TEST|DEPLOY|ANALYZE]│
│ Agent 2  │                             │
│ Agent 3  │  [Tab Content...]           │
│          │                             │
└──────────┴─────────────────────────────┘
```

### Left Sidebar: Agent List
- Always visible (like Xcode project navigator)
- Shows all agents with status indicators
- Click to select
- "+ " button to create new agent

### Right Panel: Agent Details

#### BUILD Tab
**2-column layout:**
- **Left:** Configuration sections
  - Agent settings (name, description, instructions)
  - Knowledge base upload
  - Skills management

- **Right:** Quick Test Panel
  - Embedded chat for instant testing
  - No need to switch views
  - Test as you build

#### TEST Tab
- Full test scenarios management
- Run individual or batch tests
- View results inline
- Pass/fail indicators

#### DEPLOY Tab
- Multi-channel deployment
- Web Chat (with embed code)
- Phone/Voice (with number assignment)
- SMS/Text
- Toggle channels on/off
- Channel-specific configuration
- Deployment status with "Go Live" button

#### ANALYZE Tab
- Per-agent metrics
- Empty state if no conversations yet
- Links to deploy if not live
- Charts and metrics (when live)

---

## Navigation Structure

### Top Level
```
AGENTS | INSIGHTS | SETTINGS
```

### AGENTS
- Agent list (sidebar)
- Selected agent workspace (main area)
  - BUILD | TEST | DEPLOY | ANALYZE (tabs)

### INSIGHTS
- Cross-agent analytics
- Live monitoring
- Handover tracking
- (Existing view from previous work)

### SETTINGS
- Account (profile, password)
- Team (members, roles, permissions)
- Integrations (Zendesk, Salesforce, Slack, Google Drive)
- API Keys (generate, revoke)
- Audit Log (activity history)

---

## Key Features Implemented

### ✅ Templates System
- 5 pre-built agent templates
- Each with complete sample data:
  - Pre-written knowledge base
  - Configured skills
  - Test scenarios
  - Default instructions
- "Start from Scratch" option

### ✅ Voice/Phone Capabilities
- Phone number assignment
- Voice agent deployment
- SMS/text deployment
- Multi-channel support
- Dialpad differentiation clearly shown

### ✅ Integrated Testing
- Testing panel embedded in BUILD tab
- Quick test while building
- Separate TEST tab for scenarios
- No context switching needed

### ✅ Settings & Admin
- Complete settings view with 5 tabs
- Team management (invite, roles)
- Integrations hub
- API key management
- Audit log

### ✅ Progressive Disclosure
- Simple 6-step wizard for first agent
- Complexity revealed gradually
- Pre-filled defaults reduce cognitive load
- Guaranteed success with templates

### ✅ Empty States
- No agents: Clear CTA to create
- No conversations: Prompt to deploy
- No tests: Guidance to add scenarios

### ✅ Agent-Centric Navigation
- Agents are the center of everything
- Sidebar always shows agent list
- Select and work on agents
- No "Home" tab - straight to work

---

## Demo Script (3 Minutes)

### Minute 1: Onboarding
1. Open http://localhost:3000/
2. Show value prop (Voice-First, Dialpad integration)
3. Click "Continue"
4. Select "Customer Support Bot" template
5. Click "Continue"
6. Show pre-filled agent name, instructions, knowledge
7. Click "Continue"

### Minute 2: Test & Deploy
8. Show pre-written test scenarios
9. Click "Test" on one scenario
10. Show agent response in chat
11. Click "Continue"
12. Select "Phone / Voice" channel
13. Show phone number assignment
14. Click "Deploy Agent"

### Minute 3: Success & Workspace
15. Show success screen with phone number
16. Click "Go to My Agents"
17. Show agent list sidebar (agent is there!)
18. Click on agent to select
19. Show BUILD | TEST | DEPLOY | ANALYZE tabs
20. Quick tour of each tab
21. Show Quick Test panel in BUILD tab
22. Show multi-channel deployment in DEPLOY tab

**End with:** "From zero to live agent with phone number in 3 minutes"

---

## Technical Implementation

### Data Structure
```javascript
// src/data/templates.js
- agentTemplates[] - 5 template definitions
- createAgentFromTemplate() - Creates agent from template

// localStorage
- 'daart-agents' - Array of user's agents
- 'daart-onboarding-complete' - Flag for first-time flow
```

### Key Files
```
src/
├── data/
│   └── templates.js                    # Template data & logic
├── views/
│   ├── OnboardingWizardView.vue        # 6-step wizard
│   ├── AgentsWorkspaceView.vue         # Main workspace (list + details)
│   ├── SettingsView.vue                # Settings with 5 tabs
│   ├── InsightsView.vue                # (Enhanced with handovers)
│   └── [old views still exist]
└── router/
    └── index.js                         # Smart routing based on onboarding status
```

### Router Logic
```javascript
path: '/'
redirect: () => {
  const onboardingComplete = localStorage.getItem('daart-onboarding-complete')
  return onboardingComplete ? '/agents-workspace' : '/onboarding-wizard'
}
```

New users → Onboarding Wizard
Returning users → Agents Workspace

---

## What's Different from Before

### Before
- Separate HOME, AGENTS, INSIGHTS, BILLING tabs
- Studio/Test/Deploy as separate full views
- No templates
- No first-time experience
- No voice/phone deployment
- No settings area
- No team management

### After
- Agent-centric workspace
- Integrated testing panel
- 5 pre-built templates
- 6-step guided onboarding
- Voice/phone as primary deployment option
- Complete settings with all admin features
- Team, integrations, API keys

---

## What to Highlight in Demo

1. **Voice-First:** Show phone agent deployment (Dialpad's advantage)
2. **Templates:** Show how easy it is with pre-built agents
3. **3-Minute Success:** From zero to live agent in 3 minutes
4. **Integrated Testing:** Test while building, no context switch
5. **Professional Workspace:** Xcode-like, built for creators
6. **Multi-Channel:** One agent, multiple channels

---

## Next Steps (Not in Phase 1)

- Billing integration
- Real backend connections
- Live WebSocket for real-time
- Actual knowledge processing
- Real testing with AI
- Channel integration (actual phone numbers from Dialpad)
- Advanced analytics charts
- A/B testing
- Gradual rollout
- Usage tracking

---

## Testing the Flow

### Reset for Fresh Demo
```javascript
// In browser console:
localStorage.clear()
// Refresh page - will start onboarding
```

### Create Multiple Agents
1. Go through onboarding once
2. In workspace, click "+ " button
3. Will start onboarding again for new agent
4. All agents appear in sidebar

### Test Multi-Channel
1. Select an agent
2. Go to DEPLOY tab
3. Toggle Web Chat, Phone, SMS on
4. Each shows its configuration

---

## Questions to Address in Demo

**Q:** How is this different from Intercom Fin?
**A:** Voice-first. Phone agents. Dialpad integration. That's our moat.

**Q:** Why templates?
**A:** Time to value. User sees success in 3 minutes, not 3 hours.

**Q:** Why integrated testing?
**A:** Developers test as they build. No context switching.

**Q:** Why the sidebar?
**A:** Manage multiple agents easily. Like Xcode manages multiple projects.

**Q:** Where's billing?
**A:** Next phase. Foundation first.

---

## Success Metrics

If demo goes well, stakeholders should say:
1. "This feels professional, like a real development tool"
2. "The voice deployment is a clear differentiator"
3. "Templates make it so easy"
4. "I love that testing is built in"
5. "The workspace layout makes sense"

---

## Current URL to Demo
http://localhost:3000/

That's it! Ready to demo.
