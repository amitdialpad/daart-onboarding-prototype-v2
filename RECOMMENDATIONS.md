# DAART Standalone - Onboarding & Billing Optimization Recommendations

**For:** Aykut Meeting (Oct 30, 2025)
**Author:** Amit Ayre
**Date:** October 30, 2025

---

## Executive Summary

After analyzing the PRD, Jira tickets (DP-162290, DP-161474, etc.), and building this prototype, I've identified **key optimization opportunities** for the standalone onboarding and billing flows.

**TL;DR:**
- ✅ **What's working:** Core functionality is being built (Giselle's work on agentic_standalone store)
- ⚠️ **What needs work:** Trial-to-paid conversion flow is largely unbuilt
- 🎯 **Biggest impact:** Optimize the "approaching trial limit" experience and upgrade flow

---

## Key Findings from PRD & Jira Analysis

### 1. **Trial Limits Behavior** (DP-161474)
**Finding:** When users hit 1,000 conversations, the system should keep them at 1000/1000 (not auto-convert to pay-as-you-go) if still in trial period.

**Why this matters:** This is GOOD for conversion psychology - creates urgency without forcing the decision.

**Recommendation:**
- ✅ Keep this behavior (already implemented in prototype)
- Add: Banner saying "You've reached your trial limit. Upgrade to continue using your agent."
- Add: Allow them to upgrade mid-trial without losing remaining days

---

### 2. **Billing Page Integration** (DP-162175)
**Finding:** Jira ticket shows "Show agentic on billing page" is in progress.

**What I learned:** The billing page exists but agentic standalone features are being added.

**Recommendation:**
- Separate "Agentic AI" section on billing page
- Show usage + cost separately from other Dialpad products
- Clear breakdown: "Agentic AI: 847 conversations × $0.50 = $423.50"

---

### 3. **Pay-as-You-Go Cancellation** (DP-162273)
**Finding:** Ticket "Cancel Pay as you Go from billing page" is in backlog.

**Why this matters:** Users need confidence they can cancel anytime (reduces upgrade friction).

**Recommendation:**
- Add prominent "Cancel Anytime" messaging in upgrade flow
- One-click cancellation from billing page
- Confirm modal: "Are you sure? You'll lose access to your agent."
- Offer: "Pause" option instead of cancellation

---

### 4. **Frontend Store** (DP-162290 - Giselle's Work)
**Finding:** The `agentic_standalone` Pinia store is being built to track trial/paid state.

**Status:** Merged to beta, ready for testing.

**Recommendation:**
- ✅ My prototype store matches Giselle's architecture
- Extend with: `trialExpiryWarningShown` (track if user saw warning)
- Add: `upgradeAttempts` (track how many times user viewed upgrade page)
- Add: `conversionSource` (track which CTA led to upgrade)

---

## Top 5 Conversion Optimization Recommendations

### #1: **Time-to-Value < 5 Minutes**
**Problem:** Users who don't see value quickly will churn.

**Solution:**
- Pre-built skill templates (not blank slate)
- Skip optional steps in onboarding
- "Test Agent" button immediately after creation
- Show success metrics: "Your agent is ready! Here's what it can do..."

**Impact:** Estimated 20-30% improvement in trial completion rate

---

### #2: **Proactive Upgrade Prompts**
**Problem:** Users hit limits unexpectedly and churn.

**Solution:**
- **80% usage:** Warning banner "You're running low on conversations"
- **90% usage:** Modal overlay "Upgrade now to avoid interruption"
- **100% usage:** Agent stops working, upgrade required
- **Day 12 of trial:** Email + in-app notification "2 days left"

**Impact:** Estimated 15-25% improvement in conversion rate

---

### #3: **Cost Transparency**
**Problem:** Fear of unknown costs prevents upgrades.

**Solution:**
- Show estimated monthly cost based on trial usage
- Example: "Based on your usage, expect ~$423/month"
- Calculator: "Try it: X conversations × $0.50 = Y"
- Compare: "That's X% cheaper than hiring a support agent"

**Impact:** Reduces "upgrade anxiety" - estimated 10-15% conversion lift

---

### #4: **Friction-Free Upgrade**
**Problem:** Multi-step checkout flows lose users.

**Solution:**
- One-page checkout (all fields visible)
- Auto-fill email from account
- Stripe Elements (no payment processor redirect)
- "You won't be charged until [date]" prominent
- Success modal: celebrate the conversion

**Impact:** Estimated 5-10% reduction in cart abandonment

---

### #5: **Payment Method During Trial**
**Problem:** Users who add payment during trial convert 3x higher (industry standard).

**Solution:**
- "Add Payment Method" CTA in trial notice (not just upgrade page)
- Messaging: "Add now, get charged later. Cancel anytime."
- Badge: "Payment on file" for users who added card
- Auto-upgrade when trial expires (with email confirmation)

**Impact:** Estimated 30-40% improvement in conversion for users who add card

---

## Red Flags from PRD Analysis

### 🚩 Red Flag #1: "Skills Are Just Prompts"
**Quote from PRD:** "Quality depends on customers writing good prompts (spoiler: they won't be good at it)."

**Mitigation:** Forward deploy engineers + Skill Templates

**Our Problem:** This doesn't scale for standalone customers.

**Recommendation:**
- Build 20+ high-quality skill templates
- Skill "wizard" with guardrails (prevent bad prompts)
- AI-assisted skill writing (suggest improvements)
- Community skill library (users share templates)

---

### 🚩 Red Flag #2: "Customer Journey Gaps" (Accepted Risk in PRD)
**Quote:** "Not enough time to address customer journey gaps... plan to spend time helping with onboarding"

**Translation:** Onboarding UX is incomplete, they'll compensate with humans.

**Our Problem:** Standalone customers don't have dedicated CSMs.

**Recommendation:**
- In-app tutorials (tooltips, videos)
- "Help" widget with chat support
- Self-service docs and FAQs
- Email drip campaign with tips

---

### 🚩 Red Flag #3: Timeline Pressure
**Timeline:** Oct 9 marketing launch, Oct 14 EAP - that's 15 days from now.

**Risk:** Rushing to ship may compromise conversion optimization.

**Recommendation:**
- Ship MVP with basic flows
- A/B test improvements post-launch
- Fast-follow releases every 2 weeks
- Prioritize: signup → onboarding → upgrade (in that order)

---

## Competitive Analysis (Implied from PRD)

**Competitors mentioned:** Unspecified, but "time to market with voicebot" is a concern.

**What this means:** Others are building similar products.

**Our Advantage:** Dialpad brand + existing customer base

**Conversion Lessons from SaaS Leaders:**
- **Slack:** 7-day trial, proactive upgrade prompts, team invites increase conversion
- **Zoom:** Freemium model, upgrade when hitting participant limits
- **Intercom:** Usage-based pricing, transparent cost calculator

**Apply to DAART:**
- Proactive prompts when nearing limits ✅
- Usage-based pricing ($0.50/conversation) ✅
- Team features? (multi-agent management for larger customers)

---

## A/B Testing Roadmap

### Phase 1 (Week 1-2)
- **Test A:** Trial length (14 days vs 30 days)
- **Test B:** Conversation limit (1,000 vs 2,000)
- **Measure:** Conversion rate, time-to-value

### Phase 2 (Week 3-4)
- **Test A:** Upgrade CTA placement (banner vs modal)
- **Test B:** Cost messaging ("$0.50/conversation" vs "$15/day for 30 conversations")
- **Measure:** Click-through rate, conversion rate

### Phase 3 (Week 5-6)
- **Test A:** Onboarding flow (3-step vs 5-step)
- **Test B:** Skill templates (4 options vs 8 options)
- **Measure:** Completion rate, time-to-first-agent

---

## Success Metrics

### North Star Metric
**Trial-to-Paid Conversion Rate**

**Industry Benchmarks:**
- SaaS average: 25%
- Best-in-class: 40%+

**Our Target:** 30% (Year 1)

### Supporting Metrics

| Metric | Target | How to Track |
|--------|--------|-------------|
| Signup completion rate | >80% | GA4 funnel |
| Onboarding completion rate | >90% | Mixpanel event |
| Time-to-first-agent | <5 min | Custom metric |
| Trial exhaustion rate | <30% | Usage data |
| Payment method add rate | >40% | Stripe webhook |
| Upgrade CTA click rate | >20% | GA4 event |
| Trial-to-paid conversion | >30% | Stripe + internal DB |

---

## Technical Implementation Notes

### Payment Integration (Stripe Recommended)
```javascript
// Stripe setup
import { loadStripe } from '@stripe/stripe-js'

// Create payment intent
const paymentIntent = await fetch('/api/create-payment-intent', {
  method: 'POST',
  body: JSON.stringify({ amount: 0 }) // $0 for trial, verify card only
})

// Collect payment method
const stripe = await loadStripe(STRIPE_PUBLIC_KEY)
const { paymentMethod } = await stripe.createPaymentMethod({
  type: 'card',
  card: cardElement
})

// Attach to customer
await fetch('/api/attach-payment-method', {
  method: 'POST',
  body: JSON.stringify({ paymentMethodId: paymentMethod.id })
})
```

### Usage Tracking Events
```javascript
// Track critical events
analytics.track('Trial Signup Started')
analytics.track('Trial Signup Completed', { email, company })
analytics.track('Onboarding Started')
analytics.track('Agent Created', { agentName, skillsCount })
analytics.track('Upgrade Page Viewed')
analytics.track('Payment Method Added')
analytics.track('Upgrade Completed', { plan: 'pay-as-you-go' })
```

### Email Triggers
```
Day 0:  Welcome email + onboarding tips
Day 3:  "How's it going?" + best practices
Day 7:  "You're halfway through your trial"
Day 12: "2 days left - don't lose access"
Day 14: "Your trial has ended" + upgrade CTA

80% usage: "You're running low on conversations"
100% usage: "Upgrade to continue using your agent"
```

---

## Open Questions for Aykut

### Design
1. **Design system:** What components exist in Dialpad's library?
2. **Illustrations:** Do we have assets for empty states, success moments?
3. **Mobile:** What % of users are on mobile? Responsive design priority?
4. **Brand:** Payment form styling - match Dialpad brand guidelines?

### UX
1. **Onboarding:** 3-step vs 5-step flow - your preference?
2. **Upgrade prompts:** Banner vs modal for "approaching limit" warning?
3. **Success moments:** How to celebrate key milestones (agent created, upgraded)?
4. **Error handling:** What happens if payment fails?

### User Research
1. **Have we tested:** Trial signup flow with real users?
2. **Pain points:** What feedback have beta users given?
3. **Drop-off points:** Where are users getting stuck?

---

## Next Steps

### Immediate (This Week)
1. ✅ Review this prototype with Aykut
2. Get feedback on flows and UX
3. Identify which components exist in firespotter codebase
4. Map prototype components → real codebase files

### Short-term (Next 2 Weeks)
1. Implement upgrade flow in firespotter
2. Add trial warning banners
3. Integrate payment method collection (Stripe)
4. Add analytics tracking events

### Medium-term (Next Month)
1. A/B test upgrade prompts
2. Build email notification system
3. Add usage forecasting
4. Customer success playbook for high-value trials

---

## Conclusion

The DAART standalone product has **huge potential**, but the **trial-to-paid conversion flow is the make-or-break moment**.

**Key Takeaways:**
1. Time-to-value must be < 5 minutes
2. Proactive upgrade prompts at 80% usage
3. Cost transparency reduces upgrade anxiety
4. One-page checkout minimizes friction
5. Payment method during trial = 3x conversion

**Estimated Impact:**
If we implement these recommendations, I estimate we can achieve **35-40% trial-to-paid conversion** (vs industry average of 25%).

**Let's discuss!**

---

**Questions? Feedback?**
- Amit Ayre
- Pairing with: Aykut Durmayaz (Design)
- Team: tiger-team-agentic-ai@dialpad.com
