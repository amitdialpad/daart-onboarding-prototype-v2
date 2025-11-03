# Dialpad AI Agents - Onboarding Prototype

A fully functional prototype demonstrating an intuitive, workspace-based approach to building and deploying AI agents for customer conversations across voice and digital channels.

## Design Philosophy

### Why We Chose the "Workspace Studio" Approach

This prototype deliberately moves away from traditional chatbot builder patterns (form-heavy, wizard-locked flows) and cart-style checkout processes in favor of a **workspace-first, iteration-friendly model** inspired by modern development environments like Apple's Swift Playgrounds and Xcode.

#### What We *Didn't* Do (And Why)

**❌ Traditional Chatbot Builder Pattern**
- Linear, wizard-locked flows that force users through rigid step-by-step processes
- Users can't easily jump between sections or iterate on different parts
- Configuration feels like filling out forms rather than building something
- Testing is separated from building, making iteration slow

**❌ E-Commerce Checkout Flow**
- Deployment treated as a transactional "purchase" moment
- Heavy emphasis on pricing/billing upfront, creating friction before value is demonstrated
- Users must commit to configuration before understanding what they're building
- Feels like buying a product rather than crafting a solution

#### What We *Did* Instead

**✅ Workspace Studio Model** (Inspired by Apple Swift Playgrounds / Xcode)

**Continuous Building & Testing**
- All configuration is immediately testable through integrated testing panels
- No separation between "build mode" and "test mode" - they coexist
- Users can modify instructions, knowledge, or skills and test instantly
- Natural iteration cycle: Build → Test → Refine → Test Again

**Workspace Persistence**
- Agents exist in a persistent workspace, always accessible
- Drafts are saved automatically (auto-save on every change)
- Users can switch between multiple agents effortlessly
- No "wizard completion" required - work is never lost

**Progressive Disclosure**
- Start simple: Agent type → Template → Name → You're in
- Advanced features (channels, skills, voice configuration) appear contextually
- Deploy is the last step, only when ready
- Users aren't overwhelmed with all options upfront

**Build-First, Deploy-Later**
- Users build and test their agent fully before ever thinking about deployment
- Deployment is streamlined into a single review-and-publish flow
- Billing/credits are presented at deploy time, not during building
- The focus is on creating something great, not on purchasing

**Real Development Environment Feel**
- Tabs (BUILD, TEST, MONITOR, DEPLOY) mimic IDE tabs
- Side-by-side testing panel (like a playground/preview)
- Real-time feedback through test conversations
- Version control concepts (publish/unpublish, historical data views)

---

## Core Features

### 1. Onboarding Flow

**Fast Time-to-Workspace** (Under 2 minutes)

- **Step 1: Choose Agent Type**
  - Voice Agent (handles phone calls)
  - Digital Agent (handles text-based channels: web chat, SMS, WhatsApp, etc.)

- **Step 2: Select Template or Start from Scratch**
  - Pre-built templates: Customer Support, Sales Qualifier, Appointment Scheduler, Order Tracking, Simple FAQ
  - Each template includes sample knowledge base, skills, instructions, and test scenarios
  - "Start from Scratch" option for custom builds

- **Step 3: Name Your Agent**
  - Agent is created as a draft and opens directly in the workspace

---

### 2. Workspace Interface

**Persistent, Multi-Agent Workspace**

- **Agent Selector Dropdown**
  - Switch between multiple agents instantly
  - Shows agent status (Draft, Live, Unpublished)
  - Quick access to create new agent
  - Multi-channel indicators (e.g., "Web Chat +SMS" badge)

- **Auto-Save**
  - All changes saved automatically
  - Real-time save indicators ("Saving..." / "Saved")
  - No manual save required

- **Agent Actions Menu**
  - **Duplicate Agent**: Copy agent to modify without affecting original
  - **Duplicate to Voice/Chat**: Cross-channel duplication (e.g., turn a chat agent into a voice agent)
  - **Delete Agent**: Remove agent with confirmation modal

---

### 3. BUILD Tab

**Configure Your Agent's Behavior, Knowledge, and Channels**

#### Core Configuration

**Instructions**
- Natural language instructions defining agent behavior
- Examples: tone, escalation rules, boundaries

**Knowledge Base**
- Upload documents (PDFs, text files)
- Add website URLs for content scraping
- Paste raw text content
- Each item shows status (Processing, Processed, Failed)
- View/delete individual knowledge items

**Skills**
- Enable/disable specific capabilities
- Examples: Order Lookup, Return Policy, Meeting Scheduler, Lead Capture
- Toggle switches for easy enabling
- Add custom skills via Skills Builder modal

**Test Scenarios**
- Pre-configured test prompts with expected keywords
- Run individual scenarios or "Run All Tests"
- Real-time test results with pass/fail indicators
- Results stored in conversation history

#### Voice Agent Configuration (Voice Agents Only)

**Phone Settings**
- Phone number assignment
- Initial greeting message
- End-of-call message
- Voice type selection (Friendly Male, Professional Female, Enthusiastic, etc.)
- Language selection (en-US, en-GB, es-ES, etc.)
- Speech speed control (0.8x - 1.5x)
- Interruption sensitivity slider

#### Digital Agent Configuration (Digital Agents Only)

**Chat Configuration**
- Widget position (bottom-right, bottom-left, etc.)
- Primary color picker
- Display name
- Welcome message
- Placeholder text

**Channels (NEW Omnichannel Feature)**
- **Website Chat**: Always enabled for digital agents
- **SMS / Text**: Toggle to enable
  - Phone number selection (+provision new numbers)
  - Auto-reply message configuration
  - Max message length (160/320/480 characters)
  - Active channels shown with "+SMS" badge throughout UI
- **Coming Soon Channels**: WhatsApp, Instagram, Twitter DMs, Facebook Messenger
  - Displayed with "Coming Soon" badges
  - Placeholders for future functionality

---

### 4. TEST Tab

**Integrated Testing Panel**

- **Quick Testing**
  - Send test messages and receive AI responses
  - Real-time typing indicators
  - Suggested prompts when starting fresh
  - Clear conversation history
  - Active channels displayed (e.g., "Active Channels: Website Chat, SMS")

- **Voice Testing (Voice Agents Only)**
  - Simulate phone calls with "Start Test Call" / "End Call"
  - Live transcript of conversation
  - Call duration tracking
  - Voice status indicators (Idle, Connecting, Connected)

- **Scenario Testing**
  - Run pre-configured test scenarios
  - Validate expected keywords in responses
  - Track test results per scenario
  - Bulk "Run All Tests" option

---

### 5. MONITOR Tab

**Real-Time Analytics and Conversation History**

- **Metrics Dashboard**
  - Total Conversations
  - Deflection Rate
  - Avg Response Time
  - Customer Satisfaction Score

- **Conversation History**
  - Shows all test conversations and live interactions
  - Displays conversation type (Quick Test, Scenario Test)
  - Preview of user query and agent response
  - Timestamp and channel information
  - Up to 10 most recent conversations visible

- **Historical Data View**
  - For unpublished agents with previous live history
  - Banner indicating viewing historical data
  - Shows last unpublish date
  - Allows reviewing performance before republishing

---

### 6. DEPLOY (Overlay)

**Streamlined Review-and-Publish Flow**

- **Pre-Deployment Review**
  - Agent Overview (name, description, channel)
  - Active Channels (shows Website Chat + SMS if enabled)
  - Voice Configuration (phone number, voice type, greetings) [Voice agents]
  - Chat Widget Configuration (position, colors, messages) [Digital agents]
  - SMS Configuration (phone number, auto-reply, message length) [If SMS enabled]
  - Agent Instructions
  - Knowledge Base items
  - Enabled Skills

- **Credits & Billing**
  - Pre-load credits before publishing
  - Credit options: $50, $100, $250, $500
  - Pay-as-you-go pricing display
  - "What happens when credits run out?" explainer

- **Validation**
  - ⚠️ Warning if SMS is enabled but not configured
  - Blocks publish if critical configuration is missing
  - Clear error messages guiding users to fix issues

- **Publish Button**
  - One-click publish after review
  - Agent status changes from "Draft" to "Live"
  - Success notification with confirmation

---

### 7. Published Agent View

**Live Dashboard for Published Agents**

- **Simplified Interface**
  - Live agent dashboard replaces BUILD/TEST tabs
  - Focus shifts to monitoring and performance
  - Cleaner view emphasizing live status

- **Agent Details Card**
  - Status: Live with green indicator
  - Channel, conversations count, deflection rate, satisfaction
  - Last published date

- **Key Actions**
  - Unpublish Agent (with confirmation modal)
  - Duplicate Agent
  - View Billing & Credits
  - Go to Analytics (detailed insights)

- **Ongoing Metrics**
  - Ongoing Conversations (real-time counter)
  - Today's Conversations
  - Credits Remaining

- **Unpublish Flow**
  - Confirmation modal: "Are you sure you want to unpublish?"
  - Explanation of what happens (agent goes offline, data preserved)
  - Option to return agent to draft state
  - Historical data view enabled after unpublish

---

## Key Design Decisions

### 1. **No Forced Linear Flow**
Users can jump between BUILD, TEST, and MONITOR tabs freely. Configuration doesn't need to be "complete" to test - you can test at any stage.

### 2. **Testing as a First-Class Feature**
Testing isn't buried in a submenu. It's a persistent panel available on every tab, encouraging continuous iteration and validation.

### 3. **Deployment as Final Step, Not Transaction**
Users build and perfect their agent in draft mode with zero commitment. Only when ready do they review and deploy. Billing is presented at deploy time, not during onboarding.

### 4. **Real-Time Feedback**
Auto-save, live testing, instant results, and real-time status indicators create a responsive, modern development experience.

### 5. **Progressive Disclosure**
Advanced features (channels, skills, voice settings) are contextual. Voice agents see voice config, digital agents see chat and channel config. Users aren't overwhelmed with irrelevant options.

### 6. **Omnichannel Architecture**
Instead of creating separate "SMS Agent" or "WhatsApp Agent" types, digital agents can enable multiple channels from one interface. One agent, one knowledge base, multiple channels. This reduces duplication and complexity.

### 7. **Templates as Starting Points**
Templates aren't rigid. They provide a foundation (pre-filled knowledge, instructions, skills) that users can immediately test and then customize. This balances speed with flexibility.

---

## Technical Architecture

### Frontend Stack
- **Vue 3** (Composition API)
- **Vue Router** (for navigation)
- **LocalStorage** (for persistence - prototype only)
- **Vanilla CSS** (no framework - clean, minimal design)

### Key Components
- `OnboardingWizardView.vue` - Initial agent creation flow
- `AgentsWorkspaceView.vue` - Main workspace interface with BUILD/TEST/MONITOR/DEPLOY
- `templates.js` - Agent templates with sample data

### Data Model
```javascript
{
  id: Number,
  name: String,
  description: String,
  channel: 'web-chat' | 'phone',
  agentType: 'chat' | 'phone',
  status: 'draft' | 'published',
  instructions: String,
  knowledge: Array<KnowledgeItem>,
  skills: Array<Skill>,
  testScenarios: Array<TestScenario>,

  // Digital agent specific
  chatConfig: { widgetPosition, primaryColor, displayName, welcomeMessage },
  smsEnabled: Boolean,
  smsConfig: { phoneNumber, autoReply, maxLength },

  // Voice agent specific
  voiceConfig: { phoneNumber, voiceType, language, speechSpeed, initialGreeting },

  // Metadata
  createdAt: Date,
  lastUpdated: String,
  hasBeenPublished: Boolean,
  firstPublishedDate: Date,
  lastPublishedDate: Date,
  lastUnpublishedDate: Date
}
```

---

## Running the Prototype

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
```

---

## Testing the Prototype

### Test Flow 1: Voice Agent from Template
1. Start at `/` (redirects to signup)
2. Click "Sign Up" → Redirects to onboarding
3. Select **Voice Agent**
4. Choose **Appointment Scheduler** template
5. Name it "Booking Bot" → Go to Workspace
6. **BUILD Tab**: Review pre-filled instructions, knowledge, and phone settings
7. **TEST Tab**: Click "Start Test Call" and view transcript
8. **MONITOR Tab**: View test call in conversation history
9. **DEPLOY**: Click "Deploy Agent" → Review → Add credits → Publish
10. View published dashboard with live status

### Test Flow 2: Digital Agent with SMS
1. Select **Digital Agent** in onboarding
2. Choose **Customer Support Bot** template
3. Name it "Support Assistant" → Go to Workspace
4. **BUILD Tab**:
   - Review chat configuration
   - Scroll to **Channels** section
   - Toggle **SMS / Text** to ON
   - Select phone number: +1 (555) 0123
   - Add auto-reply: "Thanks for reaching out! I'll respond shortly."
   - Set max message length: 160 characters
5. **TEST Tab**: Notice "Active Channels: Website Chat, SMS" bar
6. Send test messages in chat interface
7. **MONITOR Tab**: View test conversations with metrics
8. **DEPLOY**:
   - Review shows "Active Channels: Website Chat, SMS"
   - SMS Configuration section displays phone number and settings
   - Add credits → Publish
9. Agent is live with multi-channel support

### Test Flow 3: Build from Scratch
1. Select **Digital Agent**
2. Choose **Start from Scratch**
3. Name it "Custom Bot" → Go to Workspace
4. **BUILD Tab**:
   - Write custom instructions
   - Upload a PDF to knowledge base
   - Enable 2-3 skills
   - Create a test scenario
5. **TEST Tab**: Run your test scenario
6. Iterate: Go back to BUILD → modify instructions → test again
7. **DEPLOY**: Review and publish

### Test Flow 4: Duplicate Agent
1. Open an existing agent
2. Click **⋮** menu → **Duplicate Agent**
3. New agent created as "[Name] Copy" in draft state
4. Modify the duplicate without affecting the original
5. Test independently
6. Publish or delete as needed

### Test Flow 5: Cross-Channel Duplication
1. Open a **Digital Agent**
2. Click **⋮** menu → **Duplicate Agent** → **Duplicate to Voice**
3. New voice agent created with same knowledge and skills
4. Voice-specific settings (phone number, greetings) need configuration
5. Test voice agent with simulated calls
6. Publish separately from original digital agent

### Test Flow 6: Unpublish and Historical Data
1. Open a published agent
2. Click **Unpublish Agent** button
3. Confirm in modal: "Yes, Unpublish"
4. Agent returns to draft state with "Unpublished" badge
5. **MONITOR Tab** shows **Historical Data View banner**: "You're viewing historical data from when this agent was last published. Last unpublished: [date]"
6. Metrics and conversations remain visible
7. Make changes in BUILD tab
8. Test changes
9. **DEPLOY** again to republish

---

## Key Differences from Traditional Patterns

| Feature | Traditional Chatbot Builder | This Prototype |
|---------|----------------------------|----------------|
| **Onboarding** | 10+ step wizard, must complete all before access | 3 steps, immediately enter workspace |
| **Testing** | Separate "Test" page after building | Always-on testing panel, test anytime |
| **Iteration** | Linear flow, hard to go back and change | Freeform tabs, switch sections anytime |
| **Deployment** | Checkout cart with pricing upfront | Build first, deploy when ready, billing at end |
| **Multi-Channel** | Create separate agents per channel | One agent, enable multiple channels |
| **Draft Saving** | Manual save or "Save Draft" button | Auto-save on every change |
| **Published Agents** | Hard to edit, must "unpublish" first | Can unpublish, edit, and republish easily |
| **Templates** | Rigid, lock you into structure | Starting points, fully customizable |
| **Voice/Chat Separation** | Separate products, different UIs | Unified workspace, contextual config |

---

## Future Enhancements

This prototype demonstrates the core experience. Future iterations could include:

- **Real AI Integration**: Connect to actual LLM APIs for real responses (currently simulated)
- **Live Deployment**: Integrate with real telephony/SMS/chat APIs
- **Advanced Analytics**: Deeper insights into conversation quality, user sentiment, topic clustering
- **Version Control**: Save snapshots of agent configurations, rollback to previous versions
- **Team Collaboration**: Multi-user access, comments, approval workflows
- **A/B Testing**: Compare two agent configurations side-by-side
- **Integration Marketplace**: Connect to CRMs, ticketing systems, calendars
- **Actual SMS/WhatsApp Provisioning**: Real phone number provisioning and channel enablement
- **Voice Call Recording**: Playback actual voice test calls

---

## Design Credits

Inspired by modern development environments:
- **Apple Swift Playgrounds**: Real-time code execution with immediate feedback
- **Xcode**: Tabbed interface, integrated testing, live previews
- **VS Code**: Fast workspace switching, auto-save, status indicators
- **Figma**: Collaborative workspace, persistent drafts, inspect-before-commit

Built for:
- **Speed**: Get users building and testing in under 2 minutes
- **Confidence**: Test thoroughly before ever deploying
- **Flexibility**: No locked flows, full iteration freedom
- **Clarity**: Progressive disclosure, only show what's relevant
- **Delight**: Smooth interactions, real-time feedback, zero friction

---

## Feedback & Questions

This prototype is designed to demonstrate a new paradigm for AI agent creation. We welcome feedback on:
- Does the workspace model feel intuitive?
- Is the omnichannel approach (one agent, multiple channels) clear?
- Does the deploy-last flow reduce anxiety compared to upfront pricing?
- Are there missing features critical for your use case?

---

**Built with ❤️ for a better AI agent creation experience**
