# DAART Homepage Concepts - 5 Design Directions

## Context
After completing onboarding (or skipping it), users need a clear entry point to the DAART platform. This homepage should reflect our agent-first philosophy while supporting various user states: first-time users with no agents, users with draft agents, power users with multiple live agents, and team collaborators.

**Design Philosophy:**
- **Agent-centric** (not dashboard-centric)
- **Action-oriented** (enable rapid workflows)
- **Progressive disclosure** (adapt to user sophistication)
- **Workspace-first** (inspired by Xcode, Android Studio, Swift Playgrounds)
- **Clear trial/billing awareness** (surface limits without being pushy)

---

## Concept 1: "Studio Workspace" (Google AI Studio-inspired)

### Philosophy
A clean, minimal workspace that treats agents like projects. Focus on creating and managing agents with quick access to recent work and suggested actions.

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] DAART                                    [+ New Agent]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Home    Agents    Knowledge    Analytics    Settings        │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Your Agents                                         │   │
│  │  Build, test, and deploy AI agents                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  [Card: Chat with agents]  [Card: Monitor usage & metrics]  │
│  Quick testing interface   View performance across agents    │
│                                                               │
│  What's new                                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ Multi-channel SMS   │  │ Conversation Import │          │
│  │ Now live for all    │  │ Upload past chats   │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                               │
│  Get started with DAART                                       │
│  ┌───────────────────────────────────────────────────┐      │
│  │ [Code sample showing agent creation]              │      │
│  │ // Create your first agent                        │      │
│  │ const agent = new Agent({                         │      │
│  │   type: 'chat',                                   │      │
│  │   name: 'Customer Support Bot'                    │      │
│  │ })                                                │      │
│  └───────────────────────────────────────────────────┘      │
│                                                               │
│  [View API Keys]  [Explore Docs]                             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Features
- **Top navigation tabs** - Switch between Home, Agents, Knowledge, Analytics, Settings
- **Hero cards** - 2-3 primary actions (Chat with agents, Monitor metrics)
- **What's New section** - Feature announcements and updates
- **Code quickstart** - For developer-oriented users
- **Minimal chrome** - Focus on content, not navigation
- **Bottom persistent bar** - Trial status: "12 days left | 847/1000 conversations used"

### User States
1. **No agents yet**: Show "Create your first agent" CTA, templates, getting started guide
2. **1-2 agents**: Show agent cards, encourage testing and deployment
3. **3+ agents**: Full homepage with stats, recent activity, quick actions
4. **Skipped onboarding**: Add inline help tips, suggested next steps

### Pros
- Clean, familiar to developers
- Action-oriented without overwhelming
- Easy to understand at a glance
- Scales well from novice to power user

### Cons
- Less visual hierarchy for agent management
- May feel too minimal for non-technical users
- Trial/billing status could be missed

---

## Concept 2: "Command Center" (Dashboard-first)

### Philosophy
A comprehensive dashboard showing everything at a glance. Power users can see all metrics, agents, alerts, and actions in one place. Think "mission control" for AI agents.

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ← [Sidebar]                                                  │
│   Agents                     DAART Command Center            │
│   Knowledge                                                  │
│   Analytics          ┌──────────────────────────────┐       │
│   Billing            │ 🎉 Trial Status              │       │
│   Settings           │ 12 days remaining            │       │
│                      │ ▓▓▓▓▓▓▓▓▓░░░░░ 847/1000 convos │  │
│                      └──────────────────────────────┘       │
│                                                               │
│   Your Agents (3)    [+ Create Agent] [View All]            │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│   │ Support Bot  │  │ Sales Qual   │  │ FAQ Agent    │    │
│   │ 🟢 LIVE      │  │ ⚪ DRAFT      │  │ 🟢 LIVE      │    │
│   │ 1,234 convos │  │ 0 convos     │  │ 89 convos    │    │
│   │ 95% deflect  │  │ Ready to test│  │ 78% deflect  │    │
│   │ [Monitor]    │  │ [Test Now]   │  │ [Monitor]    │    │
│   └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                               │
│   Recent Activity                    Quick Stats             │
│   ┌────────────────────────┐        ┌──────────────────┐   │
│   │ 10m ago: New convo     │        │ Total Convos     │   │
│   │ Support Bot            │        │ 1,323 this month │   │
│   │                        │        │                  │   │
│   │ 45m ago: Published     │        │ Avg Deflection   │   │
│   │ Sales Qualifier v2     │        │ 89%              │   │
│   │                        │        │                  │   │
│   │ 2h ago: Test passed    │        │ Active Channels  │   │
│   │ FAQ Agent Scenario 3   │        │ Chat, SMS (2)    │   │
│   └────────────────────────┘        └──────────────────┘   │
│                                                               │
│   Alerts & Recommendations                                   │
│   ⚠️  Sales Qualifier has unpublished changes               │
│   💡 Enable SMS channel on Support Bot to reach more users  │
│   📊 Support Bot deflection dropped 5% - review conversations│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Features
- **Persistent sidebar** - Always visible navigation
- **Trial status banner** - Top of page, clear progress bar
- **Agent overview cards** - Rich cards showing status, metrics, quick actions
- **Activity timeline** - Real-time feed of what's happening
- **Quick stats panel** - Key metrics across all agents
- **Alerts section** - Actionable items requiring attention
- **Smart recommendations** - Contextual suggestions based on agent performance

### User States
1. **No agents yet**: Show empty state with prominent "Create Agent" CTA, hide activity/stats
2. **1-2 agents**: Show agent cards, simplified stats, hide recommendations
3. **3+ agents**: Full dashboard with all panels
4. **Trial expiring soon**: Highlight trial banner, add billing CTA

### Pros
- Information-dense, power user friendly
- Clear visibility into all agents and metrics
- Actionable alerts surface important tasks
- Scales well to many agents

### Cons
- Overwhelming for first-time users
- Too much information for users with 1-2 agents
- Requires careful progressive disclosure
- Could feel cluttered

---

## Concept 3: "Launchpad" (Apple-inspired Grid)

### Philosophy
A beautiful, visual grid of agents that feels like iOS/macOS Launchpad. Each agent is represented by a large, colorful card with status and key info. Focus on visual hierarchy and touch-friendly interactions.

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] DAART                     [Search]      [+ New Agent]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Your Workspace                                               │
│  3 agents • 1,323 conversations this month                   │
│                                                               │
│  ┏━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━┓                  │
│  ┃                 ┃  ┃                 ┃                  │
│  ┃  💬             ┃  ┃  📞             ┃                  │
│  ┃  Support Bot    ┃  ┃  Sales Qualifier┃                  │
│  ┃                 ┃  ┃                 ┃                  │
│  ┃  🟢 Live        ┃  ┃  ⚪ Draft       ┃                  │
│  ┃  1,234 convos   ┃  ┃  Ready to test  ┃                  │
│  ┃  95% deflection ┃  ┃  Last edited 2h ┃                  │
│  ┃                 ┃  ┃                 ┃                  │
│  ┃  [Open] [⋯]    ┃  ┃  [Test] [⋯]    ┃                  │
│  ┗━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━┛                  │
│                                                               │
│  ┏━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━┓                  │
│  ┃                 ┃  ┃                 ┃                  │
│  ┃  💬             ┃  ┃  ➕             ┃                  │
│  ┃  FAQ Agent      ┃  ┃  Create new     ┃                  │
│  ┃                 ┃  ┃  agent          ┃                  │
│  ┃  🟢 Live        ┃  ┃                 ┃                  │
│  ┃  89 convos      ┃  ┃  Start from     ┃                  │
│  ┃  78% deflection ┃  ┃  template or    ┃                  │
│  ┃                 ┃  ┃  describe your  ┃                  │
│  ┃  [Open] [⋯]    ┃  ┃  use case       ┃                  │
│  ┗━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━┛                  │
│                                                               │
│  ▓▓▓▓▓▓▓▓▓░░░░░ Trial: 12 days left, 847/1000 conversations │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Features
- **Large visual cards** - Agents represented as app-like tiles
- **Icon/emoji differentiation** - Each agent gets a visual identity (💬 chat, 📞 voice)
- **Grid layout** - 2-3 columns, responsive
- **In-card actions** - Quick access to primary action (Open, Test, Monitor)
- **Three-dot menu** - Secondary actions (Duplicate, Delete, Settings)
- **"Create new" card** - Always visible as last card in grid
- **Bottom status bar** - Trial/billing info in unobtrusive footer
- **Search bar** - Filter agents by name (useful for power users)

### User States
1. **No agents yet**: Show single "Create Agent" card with onboarding CTA
2. **1-2 agents**: Grid with agent cards + create card
3. **3+ agents**: Full grid, enable search
4. **Many agents (10+)**: Add filters (Status, Type, Recent), pagination

### Pros
- Visually appealing and friendly
- Easy to scan and find agents
- Clear call-to-action for each agent
- Feels modern and polished
- Great for touch devices

### Cons
- Less information density
- Metrics/analytics not immediately visible
- Doesn't scale well beyond 12-15 agents
- Trial info could be missed (footer)

---

## Concept 4: "Agent Canvas" (Workspace-first)

### Philosophy
A continuous workspace where users see agents as part of an ongoing workflow. Inspired by Notion, Linear, and other modern productivity tools. The homepage IS the workspace - no separation between "home" and "work".

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ ← [Sidebar]          🌟 Welcome back, Amit                  │
│   🏠 Home                                                    │
│   🤖 All Agents      ⚠️ You have 1 draft ready to publish   │
│   📚 Knowledge       💡 2 recommendations for you            │
│   📊 Analytics                                               │
│   💳 Billing         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│   ⚙️  Settings                                               │
│                      Your Agents                             │
│   [+ New Agent]                                              │
│                      ┌─────────────────────────────────────┐│
│                      │ 🟢 Support Bot           📊 Monitor ││
│   Trial Status       │ Live • 1,234 conversations          ││
│   ┌──────────────┐   │ Website, SMS • 95% deflection rate  ││
│   │ 12 days left │   │ ⋯                                   ││
│   │ 847/1000     │   └─────────────────────────────────────┘│
│   │ conversations│                                            │
│   │              │   ┌─────────────────────────────────────┐│
│   │ [Upgrade]    │   │ ⚪ Sales Qualifier        🧪 Test   ││
│   └──────────────┘   │ Draft • Last edited 2h ago          ││
│                      │ Ready for testing                    ││
│                      │ ⋯                                   ││
│                      └─────────────────────────────────────┘│
│   Quick Actions                                              │
│   • Test an agent    ┌─────────────────────────────────────┐│
│   • Upload knowledge │ 🟢 FAQ Agent               📊 Monitor││
│   • View analytics   │ Live • 89 conversations             ││
│                      │ Website only • 78% deflection       ││
│                      │ ⋯                                   ││
│                      └─────────────────────────────────────┘│
│                                                               │
│                      Recommendations for you                 │
│                      💡 Enable SMS on Support Bot            │
│                      📈 Sales Qualifier ready to publish     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Features
- **Persistent sidebar** with trial status widget
- **Personalized greeting** - "Welcome back, [name]"
- **Alert banner** - Top of content area, collapsible
- **List-style agent cards** - Horizontal cards with inline actions
- **Contextual actions** - Different primary action based on agent state (Monitor for live, Test for draft)
- **Recommendations panel** - Smart suggestions below agent list
- **Quick actions sidebar** - Frequently used actions pinned
- **Inbox-zero mentality** - Users can dismiss/complete recommendations

### User States
1. **No agents yet**: Show welcome message, "Create your first agent" CTA, hide recommendations
2. **Onboarding incomplete**: Show "Complete setup" banner with progress indicator
3. **1-2 agents**: Show agent cards, limited recommendations
4. **3+ agents**: Full homepage with all sections
5. **Trial expired**: Replace trial widget with "Subscribe now" CTA

### Pros
- Feels like a cohesive workspace
- Personalized and contextual
- Clear next steps for users
- Scales well to different user levels
- Good information hierarchy

### Cons
- Requires more sophisticated recommendation engine
- List view may feel dense for some users
- Sidebar trial widget could feel naggy

---

## Concept 5: "Agent Hub" (Hybrid Cards + Feed)

### Philosophy
Combine the best of cards and activity feeds. Show agents as rich cards, but also surface a real-time feed of activity, alerts, and recommendations. Balance visual appeal with information density.

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] DAART        [Search agents...]          [+ Create]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⏱️  Trial expires in 12 days • 847/1000 conversations   │ │
│ │                                    [View Usage] [Upgrade]│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  Your Agents (3)                    Activity & Alerts        │
│  ┌───────────────────────┐          ┌────────────────────┐  │
│  │ 💬 Support Bot        │          │ 2m ago             │  │
│  │ 🟢 Live               │          │ New conversation   │  │
│  │                       │          │ Support Bot        │  │
│  │ 1,234 conversations   │          │                    │  │
│  │ 95% deflection rate   │          │ 15m ago            │  │
│  │ Website, SMS          │          │ Test passed ✓      │  │
│  │                       │          │ FAQ Agent (3/3)    │  │
│  │ [Monitor] [Test] [⋯] │          │                    │  │
│  └───────────────────────┘          │ 1h ago             │  │
│                                      │ ⚠️  Draft ready    │  │
│  ┌───────────────────────┐          │ Sales Qualifier    │  │
│  │ 📞 Sales Qualifier    │          │ [Review & Deploy]  │  │
│  │ ⚪ Draft               │          │                    │  │
│  │                       │          │ 2h ago             │  │
│  │ 0 conversations       │          │ Knowledge updated  │  │
│  │ Ready for testing     │          │ Added 3 new docs   │  │
│  │ Last edited 2h ago    │          │                    │  │
│  │                       │          │ [View All →]       │  │
│  │ [Test Now] [⋯]        │          └────────────────────┘  │
│  └───────────────────────┘                                   │
│                                      Recommendations         │
│  ┌───────────────────────┐          ┌────────────────────┐  │
│  │ 💬 FAQ Agent          │          │ 💡 Enable SMS      │  │
│  │ 🟢 Live               │          │ Support Bot can    │  │
│  │                       │          │ reach more users   │  │
│  │ 89 conversations      │          │                    │  │
│  │ 78% deflection rate   │          │ 📊 Review convos   │  │
│  │ Website only          │          │ Deflection dropped │  │
│  │                       │          │ 5% on Support Bot  │  │
│  │ [Monitor] [Test] [⋯] │          └────────────────────┘  │
│  └───────────────────────┘                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Features
- **Two-column layout** - Agents on left (60%), Activity/Recommendations on right (40%)
- **Trial banner** - Top of page, prominent but not intrusive
- **Medium-sized agent cards** - Balance between Launchpad and Canvas
- **Real-time activity feed** - See what's happening across agents
- **Actionable alerts** - Inline CTAs in activity feed
- **Recommendation panel** - Below activity feed, contextual suggestions
- **In-card actions** - Primary actions + three-dot menu
- **Search bar** - Global agent search

### User States
1. **No agents yet**: Show single "Create Agent" card, hide activity/recommendations, show getting started guide in right panel
2. **1-2 agents**: Show agent cards, simplified activity feed (hide recommendations)
3. **3+ agents**: Full layout with both columns
4. **Many agents (10+)**: Add filters, pagination, or "View All Agents" link

### Pros
- Best balance of visual appeal and information density
- Activity feed keeps users engaged
- Recommendations drive feature adoption
- Scales from novice to power user
- Clear hierarchy and organization

### Cons
- Two-column layout may feel cramped on smaller screens
- Activity feed requires real backend (not for prototype)
- More complex to implement than simpler designs

---

## Comparison Matrix

| Concept | Best For | Information Density | Visual Appeal | Scalability | Implementation Complexity |
|---------|----------|---------------------|---------------|-------------|---------------------------|
| **1. Studio Workspace** | Developer users, minimalists | Low | Medium | High | Low |
| **2. Command Center** | Power users, data-driven teams | Very High | Low | High | High |
| **3. Launchpad** | Visual users, mobile-first | Medium | Very High | Medium | Medium |
| **4. Agent Canvas** | Productivity-focused users | High | Medium | High | High |
| **5. Agent Hub** | Balanced, general audience | High | High | High | Medium |

---

## Recommendations

### For MVP/Prototype: **Concept 3 (Launchpad)** or **Concept 5 (Agent Hub)**

**Launchpad** is easiest to implement and looks great with minimal data. It's friendly for first-time users and requires no backend changes.

**Agent Hub** provides more depth and feels like a "real" application, but requires activity feed logic (can be mocked).

### For Long-term Product: **Concept 5 (Agent Hub)** or **Concept 4 (Agent Canvas)**

**Agent Hub** strikes the best balance and will serve the widest range of users. It's modern, actionable, and information-rich without feeling overwhelming.

**Agent Canvas** is ideal if DAART evolves into a full workspace/productivity platform with collaboration features.

### Avoid for Now: **Concept 2 (Command Center)**

Too information-dense for a young product. Better suited for v2 when you have real usage data and advanced analytics.

---

## Next Steps

1. **Choose a concept** (or hybrid approach)
2. **Create wireframes** with real DAART data (using existing agents from store)
3. **Identify required backend changes** (activity feeds, recommendations, etc.)
4. **Build clickable prototype** in Vue
5. **User test** with 3-5 people (internal team, early beta users)
6. **Iterate** based on feedback

---

## Questions to Answer

1. **How important is the activity feed?** (Real-time events vs static view)
2. **Do we want to push analytics front-and-center?** (Metrics on homepage vs separate Analytics tab)
3. **How prominent should trial/billing be?** (Top banner, sidebar widget, footer, or hidden?)
4. **What's the primary user journey?** (Create → Test → Deploy vs Monitor → Optimize)
5. **How do we handle users who skip onboarding?** (Inline help, tooltips, empty states)

---

**Author:** Claude
**Date:** 2025-01-07
**Status:** Draft for Review
**Next Reviewer:** Ted + Team
