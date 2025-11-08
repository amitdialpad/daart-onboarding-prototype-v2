# DAART AI Agents - Onboarding Prototype

**Live Demo:** https://amitdialpad.github.io/daart-onboarding-prototype

A Vue 3 prototype demonstrating an intuitive, problem-first approach to building and deploying AI agents for customer conversations across voice and digital channels.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server (opens at http://localhost:5173)
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## What This Prototype Demonstrates

### 1. Problem-First Onboarding
- **Empty State**: Full-screen intent capture with scenario-based quick starts
- **6 Pre-defined Scenarios**: Support, Sales, Scheduling, Orders, HR, Lead Qualification
- **Custom Intent**: Inline text input for unique use cases
- **Zero Friction**: From intent to working agent in 3 clicks

### 2. Celebration & Success
- **First Agent Success View**: Celebratory page showing what was built
- **Clear Next Steps**: Refine → Test → Deploy progression
- **Visual Summaries**: Knowledge base, configuration, channels at a glance

### 3. Workspace-Based Building
- **Configuration**: Agent name, behavior instructions, channels
- **Sources**: Two-section design (Connected / Available) with 5 source types
- **Skills**: Production table UI with filters and search
- **Visual Builder**: Two-panel interface (canvas + AI chat)
- **Integrated Testing**: Side-by-side testing panel (auto-hidden for Visual Builder)

### 4. Multi-Agent Management
- **Agent Hub**: Card grid for multiple agents
- **Activity Feed**: Recent activities and recommendations
- **Trial Banner**: Contextual trial information
- **Easy Creation**: "+ Create Agent" button restores empty state

## Design Philosophy

### Workspace Studio Model
Inspired by Apple Swift Playgrounds and Xcode, this prototype emphasizes:

- **Continuous Testing**: Build and test side-by-side, instant iteration
- **Persistent Workspace**: Agents always accessible, no wizard lock-in
- **Progressive Disclosure**: Start simple, reveal complexity contextually
- **Celebration Moments**: Acknowledge progress and build confidence

### What We Avoided
- ❌ Linear wizard flows that trap users
- ❌ Form-heavy interfaces
- ❌ Separation of build/test modes
- ❌ Upfront commitment before value demonstration

## Project Structure

```
src/
├── components/
│   ├── agentHub/          # Home page components
│   ├── buildAgent/        # Method selection
│   ├── layout/            # App layout & sidebar
│   └── workspace/         # Testing panel
├── views/
│   ├── AgentHubView.vue           # Home (empty/success/multi)
│   ├── BuildAgentView.vue         # Method selection
│   ├── AgentSetupAnimation.vue    # Setup progress
│   └── AgentsWorkspaceV2View.vue  # Main workspace
├── stores/
│   └── activityFeed.js            # Activity & recommendations
└── router/
    └── index.js                    # Routes
```

## Key Features

### Implemented ✅
- Empty state with scenario quick starts
- First agent success view with summaries
- Multi-agent hub with activity feed
- Sources page with Connected/Available sections
- Skills table UI with horizontal filters
- Visual Builder (static prototype, full-width)
- Integrated testing panel
- Auto-save functionality
- LocalStorage persistence

### Prototyped (Static) 🎨
- Visual Builder functionality
- Skills creation and management
- Deploy workflow
- Monitor tab
- Evaluate tab

## Documentation

- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - Complete project overview and current state
- **[DEMO_GUIDE.md](./DEMO_GUIDE.md)** - How to demo the prototype
- **[DEPLOY.md](./DEPLOY.md)** - Deployment instructions
- **[docs/](./docs/)** - Detailed implementation guides

## Technology Stack

- **Vue 3** - Composition API
- **Vue Router** - Navigation
- **Pinia** - State management
- **Vite** - Build tool
- **LocalStorage** - Prototype persistence

## Browser Support

Requires a modern browser with:
- ES6+ support
- `:has()` CSS selector (recent Chrome, Safari, Firefox)
- LocalStorage enabled

## Recent Updates (January 9, 2025)

### Sources Page Restructure
- Split into "Connected sources" (top) and "Available sources" (bottom)
- Grouped connected sources by type with labels
- Simplified accordions to focus on adding sources
- Better visual hierarchy

### Visual Builder Improvements
- Full-width layout when active
- Testing panel auto-hidden
- Increased right panel width (450px)

### Skills UI Fixes
- Horizontal filter layout (Status, All sources, All labels)
- Fixed flex wrapping issues

## Resources

- **Design Context**: https://docs.google.com/document/d/1RGd-Y3AwwT1srBENvkVaA4ANqW1HieJt-OP8NGFkLfg/edit
- **Confluence**: https://dialpad.atlassian.net/wiki/spaces/EPD/pages/1606025282/Agentic+AI+Voicebot+DAART

## Team Notes

This is a high-fidelity prototype for UX validation. The focus is on visual design and user flow rather than production-ready code. All design decisions are documented for the engineering team to reference during implementation.

---

**Last Updated:** January 9, 2025
