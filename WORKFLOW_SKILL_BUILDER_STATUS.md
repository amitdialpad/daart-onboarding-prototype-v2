# Workflow Builder & Skill Builder - What's Been Built

**Status as of Oct 30, 2025**

---

## Overview

The DAART team has built two major configuration tools:

1. **Workflow Builder** - Visual IVR-like editor for voice agent workflows
2. **Skill Builder** - Interface for configuring chatbot skills and actions

Both are **actively in development** with recent bug fixes and improvements.

---

## 1. Workflow Builder (Voice Workflows)

### Purpose
Visual node-based editor for creating voice agent call flows - similar to traditional IVR builders but AI-powered.

### What's Built
Based on 15+ recent Jira tickets (Oct 14-28, 2025), the team has built:

#### Core Features
- **Node-based canvas** - Drag-and-drop workflow editor
- **Node types:**
  - Play (audio prompts)
  - Collect (gather input)
  - Menu (branching logic with options)
  - API call nodes
  - Custom workflows

- **Audio recording** - Record prompts directly in browser
- **Templates** - Pre-built workflow templates ("one moment please", etc.)
- **Publishing system** - Deploy workflows to production
- **Disconnect/reconnect flows** - Break and rejoin workflow branches

#### Recent Bug Fixes (Active Development)
The team is actively fixing bugs in:
- Node connection/disconnection logic (DP-162734, DP-162723, DP-162722)
- Audio recording for multiple nodes (DP-161930, DP-162712)
- Keyboard shortcuts (Delete key on Windows - DP-160248)
- Template audio file handling (DP-162715)
- Node overlap and positioning (DP-160932, DP-160933)
- Large MP3 file uploads (DP-162130)
- Publishing validation (DP-162723)

#### Team
- **Eng DRI:** Shefali Gupta
- **PM:** Martina Recare
- **Design:** Bradley Hawkins (from consolidated PRD info)

#### Live Location
- Accessible at: `dialpadbeta.com/csr/company/{company_id}` (CSR = Customer Self-Service)
- Figma designs: https://www.figma.com/design/YdBOJ6tCfhVyCkauzO6UAA/AgenticAi---Workflows

---

## 2. Skill Builder (Chatbot Skills)

### Purpose
Configure AI Agent skills - what actions the chatbot can perform and which external services it can connect to.

### What's Built
Based on technical specs and recent Jira tickets:

#### Core Features

**1. MCP Marketplace Integration**
- Browse available connectors (Google Calendar, Salesforce, etc.)
- View actions/tools for each connector
- OAuth flow for connecting services
- Connection management (create, rename, delete, test)

**2. Skill Configuration**
- Add up to 15 actions per skill (recently increased from 10)
- Search tools by name/keyword
- Two search modes:
  - **Connected tools** - Only services already connected
  - **All available tools** - Show all possible integrations

**3. Connection Picker**
- Select which connection to use when multiple exist
- Connection scoping per organization
- User/admin permission handling

**4. Tool Categories**
- **External services** (via Integration.app):
  - Google Calendar (create-event, update-event, list-events)
  - Salesforce (search-contacts, create-contact)
  - Microsoft Dynamics
  - Google Maps

- **Dialpad native** (always connected):
  - send-sms
  - Other Dialpad API actions

**5. Request Flow**
- Non-admins can request connections
- Admins get notified via Dialbot
- Requestor gets notified when connection is ready

#### Technical Architecture

**Tool Index System:**
```javascript
// Example indexed tool structure
{
  tool_id: "create-event",
  server: "mcp-intapp-google-calendar",
  connections: [
    { id: 7788, name: "my calendar" }
  ],
  connected: true
}
```

**MCP Server Types:**
- `mcp-intapp-{connector}` - External services via Integration.app
- `mcp-dialpad` - Native Dialpad actions (always connected)
- `mcp-custom` - Custom API integrations

**Event-Driven Updates:**
- Pub/sub for connection events (created, deleted, updated)
- Real-time tool index updates
- Topic: `mind.mcpregistry.mcp_connection_event`

#### Recent Work
- DP-161944: Increased max actions to 15
- DP-161211: Prevent selecting duplicate tool names
- DP-159978: Hide "improve" button (conflicted with linter)

#### Team
- **Eng DRI:** Joao Noronha (from Jira tickets)
- **PM:** Dave Skiba, Martina Recare
- **Design:** Marshall Norman, Aykut Durmayaz

#### Live Location
- Part of AI Agent configuration flow
- Accessible via DAART console
- Figma designs: https://www.figma.com/design/zmLjCqY9hZFt2WPrWa2qRb/-DP-135734--AgenticAi

---

## 3. Integration with Your Onboarding Prototype

### Gaps You're Addressing

Your prototype focuses on **trial-to-paid conversion** and **billing/usage** - areas the team hasn't built yet:

✅ **What exists:**
- Workflow Builder (voice agent setup)
- Skill Builder (chatbot action setup)
- MCP Marketplace (connector management)

❌ **What's missing (your prototype):**
- Trial signup flow
- Onboarding wizard
- Usage/credits tracking UI
- Trial warnings at 80%
- Upgrade/conversion flow
- Payment methods management
- Trial limit enforcement (DP-161474 red flag)

### Key Integration Points

When your flows go live, they'll need to:

1. **Onboarding (Step 3: "Choose Skills")**
   - Integrate with Skill Builder UI
   - Show skill templates
   - Guide users to select 3-5 skills quickly

2. **Dashboard**
   - Pull real usage data from backend
   - Show trial status
   - Link to Workflow Builder and Skill Builder

3. **Upgrade Flow**
   - Trigger when hitting 80% or 1000 conversations
   - One-click upgrade with payment
   - Seamless transition to pay-as-you-go

---

## 4. References

### Confluence Pages
- Main DAART page: https://dialpad.atlassian.net/wiki/spaces/EPD/pages/1606025282
- MCP Marketplace tech specs: https://dialpad.atlassian.net/wiki/spaces/EPD/pages/1748762650

### Figma Files
- Agentic AI (main): https://www.figma.com/design/zmLjCqY9hZFt2WPrWa2qRb
- Workflows: https://www.figma.com/design/YdBOJ6tCfhVyCkauzO6UAA
- Analytics: https://www.figma.com/design/5dq3TDGWXShzsnb375Q6Pf

### PRD Documents (Google Docs - require auth)
- Skill Builder PRD: `189iiq_xGfavn9zp1ze9k-i35Ozg-PvDWAS4W69H_nbo`
- Workflow Builder PRD: `1aMYvgGlkRtuK9cwayNCz1ObAEdn2tZWQYpC7Y2jajYY`
- Connector Manager PRD: `1JVTuO5ert4ErY8mTZmB5sIJeuMdIWLzPAmXOWZB0zDU`

### Key Jira Dashboards
- October Dashboard: https://dialpad.atlassian.net/jira/dashboards/16052

---

## 5. Recommendations for Your Meeting with Aykut

### Questions to Ask:
1. **Onboarding integration:** "How do we integrate skill selection into the onboarding wizard?"
2. **Usage tracking:** "Where does conversation usage data come from? Is there an API?"
3. **Trial limits:** "How is the 1000 conversation cap enforced? Is it automatic or manual?"
4. **Workflow templates:** "What pre-built workflow templates exist for quick setup?"
5. **Analytics:** "What metrics are tracked for trial users vs paid users?"

### Show Your Prototype:
- Walk through the full flow: Signup → Onboarding → Dashboard → Upgrade
- Highlight the **80% warning** and **proactive prompts**
- Emphasize **time-to-value < 5 minutes** goal
- Show **cost transparency** in Credits view

### Get Design Feedback:
- Ask if Aykut has updated designs for onboarding
- Check if skill builder UI has recent changes
- Confirm payment flow design patterns
- Validate trial status UI patterns

---

## Summary

**Workflow Builder** and **Skill Builder** are the core configuration UIs that customers use to set up their AI agents. Both are actively being polished (15+ bug fixes in Oct 2025).

Your onboarding/billing prototype fills the critical gap of getting users from **signup → configured agent → paying customer** - which is exactly what Aykut and the team need for the standalone product launch.
