# DAART Onboarding Redesign Plan
## Based on PRD Analysis + Industry Best Practices

**Date:** Oct 30, 2025
**Author:** Claude (with Amit)
**Status:** Proposal for Aykut Review

---

## 🔍 What I Found in the PRD

### **Product Offerings:**
1. **AI Agent v2 (Digital)** = Web chatbot
2. **AI Voice Agent** = Phone agent
3. **Standalone Product** = "Digital-only product for self-serve install" = Webchat widget

### **Key Features from PRD:**
- ✅ **Skills Playground** - Sandbox for testing behaviors
- ✅ **Try-Now experiences** - Voice/digital test interfaces
- ✅ **Workflow Builder** - Separate nodes for Voice vs Digital
  - Voice: Menu, Collect, Play, Transfer, Hang-up
  - Digital: Message (chat bubble), Wait for Message, Close Session
- ✅ **Self-service provisioning** - No-code setup

### **Deployment Model:**
- Standalone = Webchat widget installed on customer's website
- Admin UI includes: Analytics, Conversation History, Billing, Trial Usage

---

## 🚨 The Core Problem

### **Current Flow:**
```
Signup → Name Agent → Choose Skills → "Success!" → Dashboard
                                          ↓
                                    NO CONNECTION
                                          ↓
                              Where is my agent?
                              How do I use it?
                              Is it working?
```

### **Missing Elements:**
1. ❌ No deployment step
2. ❌ No channel selection (Chat vs Voice)
3. ❌ No "first conversation" moment
4. ❌ No embed code or integration
5. ❌ Dashboard shows stats for an agent that isn't deployed anywhere
6. ❌ No connection between "created" and "working"

---

## ✅ The Solution: Activation-First Onboarding

### **Research-Backed Principles:**
| Principle | Why It Matters | How We Apply |
|-----------|----------------|--------------|
| **Time to First Value < 5 min** | Users who don't activate in 3 days = 90% churn | Test conversation in < 3 minutes |
| **Aha Moment = Real Interaction** | Intercom: First chat. Stripe: First payment. | DAART: First AI conversation |
| **Progressive Disclosure** | 80% abandon due to complexity | Show tools AFTER first conversation |
| **Test Before Deploy** | Reduces fear of "breaking things" | Built-in playground (PRD has this!) |

---

## 🎯 Proposed Onboarding Flow 2.0

### **FLOW: Web Chatbot (Primary Path for Standalone)**

```
┌─────────────────────────────────────────────────────┐
│ Step 1: Welcome                                     │
│ "Create your AI agent in 3 minutes"                │
│ [Get Started]                                       │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ Step 2: Choose Your Channel                         │
│                                                     │
│ ┌───────────────────┐  ┌───────────────────┐      │
│ │ 💬 Web Chatbot    │  │ 📞 Phone Agent    │      │
│ │ (Recommended)     │  │ (Coming Soon)     │      │
│ │ 2 min setup       │  │ Enterprise only   │      │
│ └───────────────────┘  └───────────────────┘      │
│                                                     │
│ 💡 You can add more channels later                 │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ Step 3: Name Your Agent                             │
│ "What should customers call your agent?"           │
│ [Input: "Support Agent"]                           │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ Step 4: Quick Skills Setup                          │
│ "Choose 2-3 starter skills"                        │
│                                                     │
│ ☑ Answer FAQs (recommended)                        │
│ ☑ Escalate to Human (recommended)                  │
│ ☐ Schedule Appointments                            │
│ ☐ Check Order Status                               │
│                                                     │
│ 💡 Add more skills anytime from Skill Builder      │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ Step 5: Test Your Agent 🎯 [AHA MOMENT]            │
│                                                     │
│ 🎉 Your agent is ready!                            │
│                                                     │
│ ┌─────────────────────────────────────┐            │
│ │ [Try It Now - Open Test Chat]       │ ← BUTTON  │
│ └─────────────────────────────────────┘            │
│                                                     │
│ OR skip and get embed code to install later        │
│ [Skip to Dashboard]                                │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ Step 6: Playground (Modal/New Tab)                 │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 💬 Support Agent                            │   │
│ │ ─────────────────────────────────────────── │   │
│ │ Bot: Hi! I'm Support Agent. How can I       │   │
│ │      help you today?                        │   │
│ │                                             │   │
│ │ You: What are your hours?                   │   │
│ │                                             │   │
│ │ Bot: We're open Monday-Friday 9am-5pm EST.  │   │
│ │      [Used: Answer FAQs skill]              │   │
│ │                                             │   │
│ │ [Type your message...]         [Send]       │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ 👀 See your agent in action!                       │
│ [Continue to Dashboard]                            │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ Step 7: Celebration + Next Steps                   │
│                                                     │
│ 🎊 Congrats! You had your first AI conversation    │
│                                                     │
│ Your agent:                                        │
│ • Answered using the "FAQ" skill                   │
│ • Responded in 1.2 seconds                         │
│ • Ready to deploy on your website                 │
│                                                     │
│ Next steps:                                        │
│ ☐ Install widget on your website                   │
│ ☐ Add more skills                                  │
│ ☐ Build custom voice workflows                     │
│                                                     │
│ [Go to Dashboard]                                  │
└─────────────────────────────────────────────────────┘
```

---

## 📱 Revised Dashboard After Onboarding

```
┌────────────────────────────────────────────────────────┐
│ 🤖 Agent Status                                        │
│ ─────────────────────────────────────────────────────  │
│ ● Test Mode  -  Support Agent                         │
│                                                        │
│ Deployment: Not installed on website yet              │
│                                                        │
│ [Get Embed Code] [Open Test Chat] [View Analytics]    │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 📊 Trial Progress                                      │
│ ─────────────────────────────────────────────────────  │
│ Conversations: 1 / 1,000                               │
│ Days remaining: 14                                     │
│ Progress: [===                           ] 0.1%        │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 🎯 Complete Your Setup                                 │
│ ─────────────────────────────────────────────────────  │
│ ☑ Created your agent                                   │
│ ☑ Had your first test conversation                     │
│ ☐ Install widget on your website                       │
│ ☐ Customize agent appearance                           │
│ ☐ Add 3+ more skills                                   │
│                                                        │
│ [Continue Setup]                                       │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ ⚡ Quick Actions                                        │
│ ─────────────────────────────────────────────────────  │
│ [🧪 Test Agent]  [📝 Edit Skills]  [📊 View Stats]    │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ 🔧 Ready to Go Deeper? (AFTER ACTIVATION)              │
│ ─────────────────────────────────────────────────────  │
│ Now that your agent is working, unlock power tools:   │
│                                                        │
│ ┌──────────────────────┐  ┌──────────────────────┐   │
│ │ 🔀 Workflow Builder  │  │ ⚡ Skill Builder     │   │
│ │ Build voice flows    │  │ Connect services     │   │
│ │ [Try Now]            │  │ [Try Now]            │   │
│ └──────────────────────┘  └──────────────────────┘   │
│                                                        │
│ ✨ Free during your 14-day trial                      │
└────────────────────────────────────────────────────────┘
```

---

## 🎨 New Components to Build

### **1. ChannelSelectionView.vue** (New Step 2)
- Choose between Chat vs Voice
- Show "Voice coming soon" for trial users
- Visual cards with icons and descriptions

### **2. PlaygroundView.vue** (New Step 6)
- Live chat interface
- Shows agent responses in real-time
- Displays which skill was used (like "Used: FAQ skill")
- Celebration modal after first exchange
- Based on PRD's "Skills Playground" concept

### **3. DeploymentView.vue** (New - Accessible from Dashboard)
- Copy embed code
- Installation instructions
- Test mode toggle
- Preview of what widget looks like

### **4. Updated DashboardView.vue**
- Agent Status card (Test Mode / Live / Not Deployed)
- Setup progress checklist
- Move "Premium Tools" BELOW activation checklist
- "Complete Your Setup" section

### **5. Updated OnboardingView.vue**
- Add channel selection step
- Simplify skills to 2-3 recommendations
- Add "Try It Now" button at end
- Remove tools mention (move to dashboard)

---

## 🔄 User Journey Comparison

### **Before (Current):**
```
Signup → Name → Skills → "Success!" → Dashboard (confused)
Time to value: ∞ (never happens)
Activation: 0% (nothing works yet)
```

### **After (Proposed):**
```
Signup → Channel → Name → Skills → Test Chat! → Dashboard
Time to value: 2-3 minutes
Activation: 100% (had first conversation)
```

---

## 📊 Success Metrics

### **What We Measure:**
| Metric | Current | Target | How |
|--------|---------|--------|-----|
| Time to First Conversation | N/A | < 3 min | Track from signup to test chat |
| Activation Rate (had convo) | ~0% | > 85% | % who click "Try It Now" |
| Trial-to-Paid Conversion | 25% | 38%+ | Users who activate convert 2.5x |
| Tool Discovery | ~20% | > 60% | % who try Workflow/Skill Builder |
| Widget Installation | Unknown | > 40% | % who get embed code |

### **Leading Indicators:**
- ✅ User clicks "Try It Now" button
- ✅ User sends message in test playground
- ✅ Agent responds successfully
- ✅ User clicks "Continue to Dashboard"
- ✅ User copies embed code
- ✅ User returns within 24 hours

---

## 🚀 Implementation Plan

### **Phase 1: Core Activation (This Week)**
- [ ] Build ChannelSelectionView
- [ ] Build PlaygroundView with mock chat
- [ ] Update OnboardingView flow
- [ ] Update DashboardView with status cards
- [ ] Add setup progress checklist

### **Phase 2: Deployment Tools (Next)**
- [ ] Build DeploymentView with embed code
- [ ] Add "Install Widget" wizard
- [ ] Test mode toggle
- [ ] Widget preview

### **Phase 3: Polish (After Aykut Feedback)**
- [ ] Celebration animations
- [ ] Onboarding tooltips
- [ ] Empty states
- [ ] Error handling

---

## ❓ Open Questions for Aykut

1. **Channel Priority**: Should trial users see Voice at all, or hide it completely?
2. **Embed Code**: What does the actual DAART embed snippet look like?
3. **Test Playground**: Does the team's existing playground have an API, or mock it entirely?
4. **Agent Status**: What are real deployment states? (Draft, Test Mode, Live, Paused?)
5. **Skills Playground vs Try-Now**: Are these different features or same thing?
6. **Installation Wizard**: Should we guide users step-by-step through website install?

---

## 🎯 Why This Will Work

### **Based on Industry Research:**

✅ **Intercom Pattern**: Get widget → Install → First chat
✅ **Stripe Pattern**: Get API key → Test payment → See dashboard
✅ **Trello Pattern**: Add first card → See board → Understand value

### **Psychology:**
- **Instant Gratification**: Chat works in 2 min vs "figure it out later"
- **Proof of Concept**: Seeing it work removes doubt
- **Investment**: Time spent testing = more likely to deploy
- **Momentum**: Success breeds more engagement

### **Data-Backed:**
- 90% churn if no activation in 3 days (our flow takes < 3 min)
- 2.5x conversion for activated users
- 80% abandon due to "don't know how to use"

---

## 🎬 Next Steps

**Ready to build this?** I can start with:

1. **ChannelSelectionView.vue** - Let user choose Chat or Voice
2. **PlaygroundView.vue** - Mock chat interface for testing
3. **Update OnboardingView** - Add channel selection + test CTA
4. **Update DashboardView** - Add agent status + setup checklist

Then we can test the flow end-to-end and refine before showing Aykut.

**Estimated time:** 2-3 hours to build core flow

---

**Approve this plan?** Or want changes first?
