# Scenario-Based Onboarding - Implementation Complete

## Problem Solved
The previous empty state was not user-friendly:
- Generic "Build your first AI agent" with abstract feature descriptions
- No concrete use cases
- Users had to describe their use case from scratch
- No dynamic onboarding based on scenario

## User Feedback
> "We need actual scenarios. Book appointments for my dental practice and send reminders for any business is our main used case right now. But then we also have other stuff that is needed from customers, you can think of maybe 6 things that folks will actually use this for. Then add those on the page & let user just click to get that into the Chat box, maybe type more. We need these 6 flows to have dynamic onboarding, meaning it should ask set of questions based on the context."

## Solution: 6 Clickable Scenarios with Dynamic Questions

### The 6 Primary Use Cases

1. **Book appointments** (Primary use case)
   - Schedule appointments for dental, medical, salon, or service businesses

2. **Send reminders** (Primary use case)
   - Automated reminders for appointments, payments, renewals, or deadlines

3. **Customer support 24/7**
   - Answer common questions, troubleshoot issues, and escalate when needed

4. **Qualify sales leads**
   - Ask qualifying questions and schedule demos with your sales team

5. **Track orders**
   - Help customers check order status, process returns, and answer shipping questions

6. **Restaurant reservations**
   - Take reservations, manage waitlist, and answer menu questions

## What Changed

### 1. Empty State UI Redesign ([AgentHubEmptyState.vue](../src/components/agentHub/AgentHubEmptyState.vue))

**Before:**
```
┌────────────────────────────────────────────┐
│     Build your first AI agent             │
│     Automate customer conversations...    │
│                                            │
│     [Create Your First Agent]             │
│                                            │
│     14-day free trial • 1,000 free convos │
│                                            │
│     [Multi-channel] [Test live]           │
│     [No code]       [Analytics]           │
└────────────────────────────────────────────┘
```

**After:**
```
┌────────────────────────────────────────────┐
│  What do you want your agent to do?       │
│  Choose a common scenario or describe own │
│                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Book      │ │Send      │ │Customer  │  │
│  │appts     │ │reminders │ │support   │  │
│  └──────────┘ └──────────┘ └──────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Qualify   │ │Track     │ │Restaurant│  │
│  │leads     │ │orders    │ │reserv.   │  │
│  └──────────┘ └──────────┘ └──────────┘  │
│                                            │
│             ─── or ───                     │
│                                            │
│    [Describe your own use case]           │
│                                            │
│   14-day free trial • 1,000 free convos   │
└────────────────────────────────────────────┘
```

**Key Changes:**
- Headline changed to action-oriented: "What do you want your agent to do?"
- 6 clickable scenario cards in 3x2 grid (responsive: 2x3 on tablet, 1x6 on mobile)
- Each card shows title + description
- "or" divider with option to describe custom use case
- Pricing info moved to bottom (less prominent but still visible)

### 2. Scenario Click Flow ([AgentHubView.vue](../src/views/AgentHubView.vue))

When user clicks a scenario card:
1. Scenario data stored in localStorage
2. User redirected to `/onboarding-v2`
3. Intent field pre-filled with scenario description
4. Scenario ID tracked for dynamic questions

```javascript
// Example: User clicks "Book appointments"
{
  id: 'appointments',
  title: 'Book appointments',
  description: 'Schedule appointments for dental, medical, salon, or service businesses',
  intent: 'Book appointments for my business, check availability in my calendar, and confirm bookings with customers'
}
```

### 3. Dynamic Onboarding Logic ([OnboardingV2View.vue](../src/views/OnboardingV2View.vue))

**New onMounted Hook:**
```javascript
onMounted(() => {
  const storedScenario = localStorage.getItem('daart-selected-scenario')
  if (storedScenario) {
    selectedScenario.value = JSON.parse(storedScenario)
    userIntent.value = selectedScenario.value.intent // Pre-fill intent
    localStorage.removeItem('daart-selected-scenario')
  }
})
```

**Enhanced analyzeIntent():**
```javascript
function analyzeIntent() {
  // If user clicked a scenario, use its ID
  if (selectedScenario.value) {
    detectedDomain.value = selectedScenario.value.id
  } else {
    // Otherwise, detect from free-text intent
    const intent = userIntent.value.toLowerCase()
    if (intent.includes('appointment')) detectedDomain.value = 'appointments'
    else if (intent.includes('reminder')) detectedDomain.value = 'reminders'
    // ... etc
  }
}
```

### 4. Scenario-Specific Question Sets

Each scenario now has a tailored set of 5-6 questions:

#### Appointments Scenario
```javascript
clarifyingQuestions.value = [
  { id: 'business_type', type: 'text', question: 'What type of business is this for?' },
  { id: 'appointment_duration', type: 'text', question: 'What\'s the typical appointment duration?' },
  { id: 'buffer_time', type: 'text', question: 'Any buffer time needed between appointments?' },
  { id: 'business_hours', type: 'text', question: 'What are your business hours?' },
  { id: 'calendar_system', type: 'select', question: 'Which calendar system do you use?', options: [...] },
  { id: 'special_rules', type: 'textarea', question: 'Any special scheduling rules?' }
]
```

#### Reminders Scenario (NEW)
```javascript
clarifyingQuestions.value = [
  { id: 'reminder_type', type: 'select', question: 'What type of reminders?', options: ['Appointments', 'Payments', 'Renewals', ...] },
  { id: 'reminder_timing', type: 'textarea', question: 'When should reminders be sent?' },
  { id: 'reminder_channels', type: 'select', question: 'How should reminders be delivered?', options: [...] },
  { id: 'data_source', type: 'text', question: 'Where will reminder data come from?' },
  { id: 'confirmation_needed', type: 'select', question: 'Do customers need to confirm?' }
]
```

#### Support Scenario
```javascript
clarifyingQuestions.value = [
  { id: 'business_name', type: 'text', question: 'What\'s your business name?' },
  { id: 'support_topics', type: 'textarea', question: 'What topics should agent help with?' },
  { id: 'business_hours', type: 'text', question: 'What are your support hours?' },
  { id: 'escalation', type: 'text', question: 'How to escalate complex issues?' },
  { id: 'knowledge_sources', type: 'textarea', question: 'What knowledge sources will you provide?' }
]
```

#### Sales Scenario
```javascript
clarifyingQuestions.value = [
  { id: 'business_name', type: 'text', question: 'What\'s your business name?' },
  { id: 'products_services', type: 'textarea', question: 'What do you sell?' },
  { id: 'pricing_model', type: 'text', question: 'What\'s your pricing model?' },
  { id: 'qualification_criteria', type: 'textarea', question: 'What makes a qualified lead?' },
  { id: 'call_to_action', type: 'text', question: 'What should agent ask prospects to do?' }
]
```

#### Orders Scenario
```javascript
clarifyingQuestions.value = [
  { id: 'business_name', type: 'text', question: 'What\'s your business name?' },
  { id: 'order_system', type: 'select', question: 'What system do you use?', options: ['Shopify', 'WooCommerce', ...] },
  { id: 'common_questions', type: 'textarea', question: 'What do customers usually ask?' },
  { id: 'return_policy', type: 'textarea', question: 'What\'s your return/refund policy?' },
  { id: 'escalation', type: 'text', question: 'How to handle complex order issues?' }
]
```

#### Reservations Scenario (NEW)
```javascript
clarifyingQuestions.value = [
  { id: 'restaurant_name', type: 'text', question: 'What\'s your restaurant name?' },
  { id: 'seating_capacity', type: 'text', question: 'What\'s your seating capacity?' },
  { id: 'reservation_system', type: 'select', question: 'Do you use a reservation system?', options: [...] },
  { id: 'business_hours', type: 'text', question: 'What are your operating hours?' },
  { id: 'party_size_limits', type: 'text', question: 'Any party size limits or special rules?' },
  { id: 'additional_features', type: 'textarea', question: 'What else should agent help with?' }
]
```

## User Flow Comparison

### Before (Generic Flow)
1. User sees empty state with generic CTA
2. Clicks "Create Your First Agent"
3. Sees blank textarea: "Describe what you want your agent to do"
4. Has to write from scratch
5. Generic questions asked regardless of use case

### After (Scenario-Based Flow)

#### Path 1: Using Pre-defined Scenario
1. User sees empty state with 6 scenarios
2. Clicks "Book appointments" card
3. Redirected to onboarding with intent pre-filled:
   - "Book appointments for my business, check availability in my calendar, and confirm bookings with customers"
4. User can edit/expand the pre-filled text or click Continue
5. Agent detects this is an appointments scenario
6. Shows 6 targeted questions specific to appointment scheduling:
   - Business type (dental/salon/etc)
   - Appointment duration
   - Buffer time
   - Business hours
   - Calendar system
   - Special rules
7. User answers questions
8. Agent configures based on answers

#### Path 2: Custom Use Case
1. User sees empty state with 6 scenarios
2. Clicks "Describe your own use case"
3. Sees blank textarea (same as before)
4. Writes custom intent
5. Agent tries to detect scenario from keywords
6. Shows best-match questions or generic fallback

## Visual Design

### Empty State
- **Max width:** 900px (up from 700px to fit 3 columns)
- **Grid:** 3 columns on desktop, 2 on tablet, 1 on mobile
- **Cards:** White background, light gray border, hover effect (border darkens, shadow appears, slight lift)
- **Typography:**
  - Headline: 42px, semi-bold
  - Subtitle: 18px, gray
  - Card titles: 16px, semi-bold
  - Card descriptions: 14px, gray

### Scenario Cards
```css
.scenario-card {
  padding: 24px 20px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.scenario-card:hover {
  border-color: #000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}
```

### Divider
```css
.divider {
  display: flex;
  align-items: center;
  margin: 32px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e0e0e0;
}

.divider span {
  padding: 0 16px;
}
```

## Technical Implementation

### Data Flow
```
Empty State (Click Scenario)
    ↓
localStorage.setItem('daart-selected-scenario', scenario)
    ↓
Navigate to /onboarding-v2
    ↓
OnboardingV2View.onMounted()
    ↓
Read scenario from localStorage
    ↓
Pre-fill userIntent with scenario.intent
    ↓
Set selectedScenario.value
    ↓
User clicks "Continue"
    ↓
analyzeIntent() detects domain from selectedScenario.id
    ↓
chooseQuestionsPath() shows scenario-specific questions
    ↓
User answers questions
    ↓
Agent configured with answers
```

### Files Modified

1. **[AgentHubEmptyState.vue](../src/components/agentHub/AgentHubEmptyState.vue)**
   - Added 6 scenario cards
   - Added "or" divider
   - Changed CTA to "Describe your own use case"
   - Updated CSS for 3-column grid layout

2. **[AgentHubView.vue](../src/views/AgentHubView.vue)**
   - Updated `goToOnboarding()` to accept scenario parameter
   - Store scenario in localStorage before navigation

3. **[OnboardingV2View.vue](../src/views/OnboardingV2View.vue)**
   - Added `onMounted()` hook to check for stored scenario
   - Added `selectedScenario` ref
   - Updated `analyzeIntent()` to use scenario ID if available
   - Added question set for "reminders" scenario
   - Added question set for "reservations" scenario
   - Updated domain detection keywords

## Build Impact

- **Previous:** AgentHubView = 12.40 kB (gzipped: 4.23 kB)
- **Current:** AgentHubView = 13.40 kB (gzipped: 4.71 kB)
- **Increase:** +1.00 kB (+8.1%)

- **Previous:** OnboardingV2View = 41.54 kB (gzipped: 11.59 kB)
- **Current:** OnboardingV2View = 44.17 kB (gzipped: 12.28 kB)
- **Increase:** +2.63 kB (+6.3%)

**Total impact:** +3.63 kB uncompressed, +1.17 kB gzipped - acceptable for significantly better UX

## Testing Scenarios

### Test 1: Click "Book appointments"
1. Go to `/home` with no agents
2. Click "Book appointments" card
3. **Expected:**
   - Redirected to `/onboarding-v2`
   - Intent textarea pre-filled with: "Book appointments for my business, check availability in my calendar, and confirm bookings with customers"
4. Click "Continue"
5. Choose "Answer a few questions"
6. **Expected:**
   - See intro: "I see you need appointment scheduling..."
   - See 6 questions: business type, duration, buffer time, hours, calendar system, special rules

### Test 2: Click "Send reminders"
1. Go to `/home` with no agents
2. Click "Send reminders" card
3. **Expected:** Intent pre-filled with reminder-specific text
4. Continue → Questions path
5. **Expected:** See 5 reminder-specific questions: type, timing, channels, data source, confirmation

### Test 3: Click "Customer support 24/7"
1. Click card
2. **Expected:** Intent pre-filled
3. Continue → Questions
4. **Expected:** See support-specific questions: business name, topics, hours, escalation, knowledge sources

### Test 4: Click "Qualify sales leads"
1. Click card
2. **Expected:** Intent pre-filled
3. Continue → Questions
4. **Expected:** See sales-specific questions: business name, products, pricing model, qualification criteria, CTA

### Test 5: Click "Track orders"
1. Click card
2. **Expected:** Intent pre-filled
3. Continue → Questions
4. **Expected:** See order-specific questions: business name, order system, common questions, return policy, escalation

### Test 6: Click "Restaurant reservations"
1. Click card
2. **Expected:** Intent pre-filled with restaurant reservation text
3. Continue → Questions
4. **Expected:** See 6 reservation-specific questions: restaurant name, seating capacity, reservation system, hours, party size limits, additional features

### Test 7: Click "Describe your own use case"
1. Click button
2. **Expected:** Navigate to onboarding with blank intent textarea
3. Type custom intent like "Help customers book hotel rooms"
4. **Expected:** Generic or best-match questions shown

### Test 8: Edit Pre-filled Intent
1. Click any scenario card
2. On onboarding page, edit the pre-filled intent
3. Add more details or change wording
4. Click Continue
5. **Expected:** Questions should still be scenario-specific (because we stored the scenario ID)

### Test 9: Responsive Design
1. Resize browser to tablet width (< 1024px)
2. **Expected:** Scenarios grid switches to 2 columns
3. Resize to mobile (< 768px)
4. **Expected:** Scenarios grid switches to 1 column, cards stack vertically

### Test 10: Hover States
1. Hover over scenario cards
2. **Expected:**
   - Border changes to black
   - Shadow appears
   - Card lifts slightly (-2px)
   - Smooth transition (0.2s)

## Benefits

### 1. Faster Onboarding
- Users don't have to think about how to describe their need
- Intent is pre-filled and ready to go
- Can edit if needed, or proceed immediately

### 2. Better Context Understanding
- Agent knows exactly what the user wants
- Can ask relevant questions
- No need to parse vague descriptions

### 3. Improved Question Quality
- Each scenario has hand-crafted questions
- Questions are specific to the domain
- More actionable answers

### 4. Discoverability
- Users see what's possible at a glance
- May discover use cases they hadn't considered
- Clear examples of what the platform does

### 5. Reduced Cognitive Load
- Don't have to write from scratch
- Just click and review
- Can still customize if needed

## Next Steps

### Phase 2 (Future)
- Add visual icons to scenario cards (when moving beyond lo-fi)
- Add "Popular" badge to top scenarios (appointments + reminders)
- Show example agents for each scenario
- Add "Learn more" link to each card with use case details

### Phase 3 (Future)
- Track which scenarios are most clicked
- Add more scenarios based on user feedback
- Allow users to suggest new scenarios
- A/B test different scenario descriptions

### Phase 4 (Future)
- Add scenario-specific templates
- Pre-configure agent settings based on scenario
- Suggest integrations based on scenario
- Show estimated setup time per scenario

---

**Status:** ✅ Complete
**Files Modified:** 3 (AgentHubEmptyState.vue, AgentHubView.vue, OnboardingV2View.vue)
**Lines Added:** ~200 lines
**Scenarios Created:** 6
**Question Sets:** 6 (appointments, reminders, support, sales, orders, reservations)
**Build:** Successful, +3.63 kB uncompressed, +1.17 kB gzipped
**Ready for Testing:** Yes

**Test URL:** http://localhost:3000/#/home (with no agents in localStorage)

**To test empty state:**
```javascript
// Run in browser console
localStorage.removeItem('daart-agents')
location.reload()
```
