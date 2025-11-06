# Onboarding V2 Quick Reference

**Quick lookup for common operations and troubleshooting**

---

## Navigation Flow

```
Intent → Choice → Questions/Knowledge → Test → Execution
                     ↓                      ↓
                  (answers)          (edit config)
                                           ↓
                                     (save & refresh)
```

---

## Component States

### currentStep Values
- `'intent'` - Intent capture screen
- `'choice'` - Path selection screen
- `'questions'` - Questions path screen
- `'knowledge'` - Knowledge upload screen
- `'test'` - Test & configuration screen
- `'execution'` - Execution/deployment screen

### pathTaken Values
- `''` - Not yet chosen
- `'questions'` - User chose questions path
- `'knowledge'` - User chose knowledge path

### detectedDomain Values
- `'scheduling'` - Appointment/booking agents
- `'support'` - Customer support agents
- `'sales'` - Sales/lead generation agents
- `'orders'` - Order management agents
- `'general'` - General purpose agents

---

## Key Data Structures

### Question Object
```javascript
{
  id: 'business_hours',
  type: 'text',              // 'text' | 'textarea' | 'select'
  question: 'What are your business hours?',
  placeholder: 'e.g., Mon-Fri 9am-5pm',
  hint: 'When should the agent accept bookings?',
  options: []                // For select type only
}
```

### Knowledge Item Types

**File:**
```javascript
{
  id: 1641234567890,
  name: 'pricing.pdf',
  size: 102400,
  status: 'ready',
  content: ''
}
```

**Text Snippet:**
```javascript
{
  id: 1641234567890,
  title: 'Text snippet 1',
  content: 'Full text content...'
}
```

**Website:**
```javascript
{
  id: 1641234567890,
  url: 'https://example.com/faq',
  status: 'ready'
}
```

### Chat Message
```javascript
{
  id: 1641234567890,
  role: 'user',           // 'user' | 'assistant'
  content: 'Message text'
}
```

### Generated Plan
```javascript
{
  agentName: 'Dental Office Assistant',
  purpose: 'User intent description',
  phases: [
    {
      name: 'Phase 1: Basic Setup',
      tasks: [
        'Create agent',
        'Configure settings'
      ]
    }
  ],
  settings: {
    'Business Hours': 'Mon-Fri 9-5',
    'Duration': '30 minutes'
  },
  instructions: 'Full agent instructions...'
}
```

---

## Common Functions

### Navigation
```javascript
analyzeIntent()           // Intent → Choice
chooseQuestionsPath()     // Choice → Questions
chooseKnowledgePath()     // Choice → Knowledge
proceedToTest()           // Questions/Knowledge → Test
continueConfiguration()   // Test → Execution
goBackToIntent()          // Any → Intent
goBackToChoice()          // Questions/Knowledge → Choice
```

### Knowledge Management
```javascript
handleFileUpload(event)   // Add files
addTextSnippet()          // Add text snippet
addWebsite()              // Add website URL
removeFile(id)            // Remove file
removeSnippet(id)         // Remove snippet
removeWebsite(id)         // Remove website
addMoreKnowledge()        // Return to knowledge screen
```

### Chat Operations
```javascript
askQuestion(question)     // Click suggested prompt
sendMessage()             // Send chat message
generateAIResponse(msg)   // Generate agent response
```

### Configuration
```javascript
saveConfigChanges()       // Save edits and refresh agent
generatePlanFromQuestions() // Generate plan from Q&A
generatePlanFromKnowledge() // Generate plan from knowledge
```

---

## CSS Class Reference

### Layout Classes
```css
.test-layout              // Main flex container
.chat-panel               // Left chat panel (400px)
.config-panel             // Right config panel (flex-grow)
```

### Chat Classes
```css
.agent-introduction       // Empty state greeting
.agent-greeting           // Greeting section
.agent-capabilities       // Capabilities list
.suggested-prompts        // Suggested prompt buttons
.chat-messages            // Message history
.chat-message.user        // User message
.chat-message.assistant   // Agent message
.chat-input-container     // Input + send button
```

### Config Classes
```css
.config-section           // Config section container
.config-label             // Field label
.config-input             // Text input
.config-textarea          // Textarea input
.editable-answers         // Questions path answers
.answer-item              // Single answer field
.knowledge-list           // Knowledge path items
.knowledge-group          // Knowledge type group
.knowledge-item           // Single knowledge item
.config-actions           // Action buttons container
```

### Button Classes
```css
.btn-primary              // Primary action (black)
.btn-secondary            // Secondary action (outlined)
.btn-save-changes         // Save button (green)
.btn-add-knowledge        // Add knowledge button
.btn-remove-small         // Small remove button
.prompt-btn               // Suggested prompt button
```

---

## Computed Properties Quick Ref

```javascript
// Validation
allQuestionsAnswered      // All Q&A fields filled?
hasConfigChanges          // Config edited?

// Data aggregation
knowledgeItems            // All knowledge combined
agentCapabilities         // Dynamic capability list
suggestedQuestions        // Dynamic prompt suggestions
```

---

## LocalStorage Keys

```javascript
'daart-agents'                    // Array of all agents
'daart-plan-{agentId}'           // Agent-specific plan
'daart-onboarding-complete'      // Boolean flag
```

---

## Domain-Specific Question Sets

### Scheduling (6 questions)
1. business_type (text)
2. appointment_duration (text)
3. buffer_time (text)
4. business_hours (text)
5. calendar_system (select)
6. special_rules (textarea)

### Support (5 questions)
1. business_name (text)
2. support_topics (textarea)
3. business_hours (text)
4. escalation (text)
5. knowledge_sources (textarea)

### Sales (5 questions)
1. business_name (text)
2. products_services (textarea)
3. pricing_model (text)
4. qualification_criteria (textarea)
5. call_to_action (text)

### Orders (5 questions)
1. business_name (text)
2. order_system (select)
3. common_questions (textarea)
4. return_policy (textarea)
5. escalation (text)

### General (5 questions)
1. business_name (text)
2. main_tasks (textarea)
3. target_audience (text)
4. knowledge_sources (textarea)
5. special_requirements (textarea)

---

## Agent Response Logic

### Questions Path Responses

**Scheduling:**
- "hours/when" → Return business hours
- "book/appointment/schedule" → Offer booking help
- "reschedule/cancel" → Provide rescheduling info

**Support:**
- "hours" → Return support hours
- "help/support" → List support topics

**Sales:**
- "pricing/price/cost" → Describe pricing model
- "demo/trial" → Guide to call-to-action
- "product/service" → List products/services

**Orders:**
- "track/order/status" → Explain tracking process
- "return/refund" → Provide return policy

### Knowledge Path Responses
- Searches knowledge items for relevant keywords
- Returns summary of available information
- Notes: "[In production, would retrieve from documents]"

---

## Troubleshooting Checklist

### Chat not working?
- [ ] `chatInput` has value?
- [ ] Event handler calling `sendMessage()`?
- [ ] `chatMessages` array updating?
- [ ] Check browser console for errors

### Save button not showing?
- [ ] Made actual changes to fields?
- [ ] `originalConfig` initialized correctly?
- [ ] `hasConfigChanges` computing correctly?

### Knowledge items missing?
- [ ] Items added to correct array?
- [ ] Array reactive (using .value)?
- [ ] Correct `v-if` conditions?

### Plan not generating?
- [ ] All required answers present?
- [ ] `detectedDomain` set correctly?
- [ ] Check plan generation function logic

### Suggested prompts empty?
- [ ] `pathTaken` set correctly?
- [ ] `detectedDomain` valid?
- [ ] Check `suggestedQuestions` computed property

---

## Testing Scenarios

### Happy Path - Questions
1. Enter intent: "appointment scheduling"
2. Choose "Answer Questions"
3. Fill all 6 scheduling questions
4. Click "Continue to Test"
5. See agent greeting with capabilities
6. Click suggested prompt
7. See agent response
8. Edit business hours
9. Click "Save Changes"
10. Chat resets, test again
11. Click "Continue Configuration"
12. See execution progress
13. Redirected to workspace

### Happy Path - Knowledge
1. Enter intent: "customer support"
2. Choose "Upload Knowledge"
3. Upload FAQ PDF
4. Paste help text
5. Add website URL
6. Click "Continue to Test"
7. See agent greeting
8. Test with prompts
9. Remove one file
10. Click "+ Add More Knowledge"
11. Add another file
12. Click "Continue to Test"
13. Continue to execution

### Edge Cases
- Empty intent → Error message
- Skip questions → Button disabled
- No knowledge items → Button disabled
- File too large → Alert message
- Edit without saving → Changes lost warning (future)
- Invalid URL → Validation error (future)

---

## Performance Notes

- Chat history stored in memory only
- No persistence between page refreshes during onboarding
- Final agent saved to localStorage
- File content not actually processed in prototype
- AI responses are simulated, not real API calls
- 2-second delay per execution phase

---

## Browser Compatibility

**Tested:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- ES6+ JavaScript
- CSS Grid/Flexbox
- LocalStorage
- File API

---

**Last Updated:** 2025-01-06
