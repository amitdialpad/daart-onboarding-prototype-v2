<template>
  <div class="onboarding-v2">
    <!-- Step 1: Problem Selection -->
    <div class="step-content">
      <h1>Choose your agent's purpose</h1>
      <p class="step-description">Describe what you need or select from common use cases</p>

      <!-- Optional Intent Description -->
      <div class="intent-input-container">
        <textarea
          v-model="userIntent"
          class="intent-textarea"
          placeholder="Describe what you want your agent to do (e.g., 'Answer calls for my dental office, check appointment availability, and book patients into our calendar system')"
          rows="3">
        </textarea>
        <button
          v-if="userIntent.trim()"
          @click="createFromIntent"
          class="btn-create-from-intent">
          Create Agent from Description →
        </button>
      </div>

      <div class="or-divider">
        <span>or choose a quick-start template</span>
      </div>

      <div class="templates-label">Quick Start Templates</div>
      <div class="cards-grid">
        <div v-for="problem in problems" :key="problem.id"
             class="selection-card"
             :class="{ selected: selectedProblem === problem.id }"
             @click="selectProblem(problem.id)">
          <div class="card-title">{{ problem.name }}</div>
          <div class="card-description">{{ problem.description }}</div>
        </div>
      </div>
    </div>

    <!-- Step 2: Name Agent Modal -->
    <div v-if="currentStep === 2" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content">
        <button class="modal-close" @click="closeModal">×</button>

        <h2>Name your agent</h2>
        <p class="modal-description">Give your agent a memorable name. You can change this later.</p>

        <div class="modal-input-container">
          <input
            v-model="agentName"
            type="text"
            class="modal-input"
            placeholder="e.g., Support Assistant"
            @keyup.enter="createAgent"
            autofocus>

          <div class="example-names">
            <span class="example-label">Examples:</span>
            <button v-for="example in exampleNames" :key="example"
                    class="example-button"
                    @click="agentName = example">
              {{ example }}
            </button>
          </div>
        </div>

        <button class="btn-primary" @click="createAgent" :disabled="!agentName.trim()">
          Create Agent
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State
const currentStep = ref(1)
const selectedProblem = ref(null)
const agentName = ref('')
const userIntent = ref('')

// Problem types
const problems = [
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Answer customer questions, troubleshoot issues, and provide product help'
  },
  {
    id: 'sales',
    name: 'Sales & Lead Generation',
    description: 'Qualify leads, answer product questions, and schedule demos'
  },
  {
    id: 'hr',
    name: 'HR & Employee Support',
    description: 'Help employees with benefits, PTO, policies, and internal questions'
  },
  {
    id: 'orders',
    name: 'Order Tracking & Updates',
    description: 'Provide order status, shipping updates, and handle returns'
  },
  {
    id: 'scheduling',
    name: 'Appointment Scheduling',
    description: 'Book appointments, manage calendar, and send reminders'
  },
  {
    id: 'general',
    name: 'General Information',
    description: 'Answer FAQs, provide business hours, locations, and basic info'
  }
]

// Example names based on problem selected
const exampleNames = computed(() => {
  const examples = {
    support: ['Support Assistant', 'Help Desk Agent', 'Customer Care Bot'],
    sales: ['Sales Assistant', 'Lead Qualifier', 'Product Expert'],
    hr: ['HR Helper', 'Employee Support', 'Benefits Assistant'],
    orders: ['Order Tracker', 'Shipping Assistant', 'Returns Agent'],
    scheduling: ['Booking Assistant', 'Scheduler', 'Appointment Bot'],
    general: ['Info Assistant', 'Help Bot', 'Virtual Assistant']
  }
  return examples[selectedProblem.value] || ['Assistant', 'Helper', 'Agent']
})

// Methods
function createFromIntent() {
  // Simple intent analysis - extract keywords to determine problem type
  const text = userIntent.value.toLowerCase()

  const keywords = {
    support: ['support', 'help', 'customer service', 'troubleshoot', 'assist', 'questions', 'answer questions', 'resolve issues'],
    sales: ['sales', 'lead', 'demo', 'qualify', 'prospect', 'selling', 'sell'],
    scheduling: ['appointment', 'schedule', 'booking', 'calendar', 'book', 'reservation', 'meeting'],
    orders: ['order', 'tracking', 'shipping', 'delivery', 'return', 'track', 'shipment', 'package'],
    hr: ['hr', 'employee', 'benefits', 'pto', 'time off', 'policy', 'policies', 'internal', 'onboarding'],
    general: ['information', 'faq', 'hours', 'location', 'contact', 'about', 'services']
  }

  // Find best matching problem type based on keywords
  let bestMatch = 'general' // default
  let maxMatches = 0

  for (const [problemId, words] of Object.entries(keywords)) {
    const matches = words.filter(word => text.includes(word)).length
    if (matches > maxMatches) {
      maxMatches = matches
      bestMatch = problemId
    }
  }

  // Set the selected problem (this will be used for template + intent combination)
  selectedProblem.value = bestMatch

  // Go to name modal
  setTimeout(() => {
    currentStep.value = 2
  }, 300)
}

function selectProblem(problemId) {
  selectedProblem.value = problemId

  // Go directly to name modal
  setTimeout(() => {
    currentStep.value = 2
  }, 300)
}

function closeModal() {
  // Close modal and go back to step 1
  currentStep.value = 1
  // Reset agent name
  agentName.value = ''
}

function createAgent() {
  if (!agentName.value.trim()) return

  // Create agent object with omnichannel structure
  const newAgent = {
    id: Date.now().toString(),
    name: agentName.value.trim(),
    problemType: selectedProblem.value,
    status: 'draft',
    statusText: 'Draft',
    lastUpdated: 'Just now',
    conversations: 0,
    instructions: getDefaultInstructions(),
    knowledgeBase: '',
    skills: [],
    // New omnichannel structure - users can enable any channel they want
    channels: {
      webChat: {
        enabled: true,  // Default enabled
        widgetPosition: 'bottom-right',
        primaryColor: '#6366f1',
        welcomeMessage: 'Hi! How can I help you today?',
        // Messages & Greetings
        enableProactive: false,
        proactiveMessage: '👋 Need help? I\'m here to assist!',
        responseTime: 'Usually replies in 2 minutes',
        showTypingIndicator: true,
        awayMessage: 'Let me look that up for you...',
        // Availability & Hours
        businessHours: 'Monday-Friday, 9 AM - 5 PM EST',
        offlineBehavior: 'always-on',
        offlineMessage: 'We\'re currently offline. Leave your email and we\'ll get back to you!',
        autoAwayTimeout: 5,
        // Escalation & Handoff
        transferConditions: '',
        transferDestination: '',
        handoffMessage: 'Let me connect you with a team member who can help...',
        contextToTransfer: 'Full conversation history, user info, detected intent',
        enableTranscript: false,
        // Widget Appearance
        displayName: 'Support Assistant',
        widgetSize: 'standard'
      },
      voice: {
        enabled: false,
        phoneNumber: '',
        voiceType: 'nova',
        language: 'en-US',
        speechSpeed: 1.0,
        greeting: 'Hello! How can I assist you today?',
        endingMessage: 'Thank you for calling. Have a great day!'
      },
      sms: {
        enabled: false,
        smsNumber: '',
        autoReply: false,
        autoReplyMessage: ''
      }
    },
    needsWizard: true  // Flag to show wizard on first visit
  }

  // Save to localStorage
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  agents.push(newAgent)
  localStorage.setItem('daart-agents', JSON.stringify(agents))

  // Mark onboarding complete
  localStorage.setItem('daart-onboarding-complete', 'true')

  // Redirect to agent workspace (BUILD tab for draft agents)
  router.push(`/agents-v2/${newAgent.id}/build`)
}

function getDefaultInstructions() {
  const baseInstructions = {
    support: 'You are a helpful customer support assistant. Answer questions clearly and professionally. If you cannot help, offer to escalate to a human agent.',
    sales: 'You are a sales assistant. Help qualify leads by understanding their needs. Answer product questions and offer to schedule a demo with the sales team.',
    hr: 'You are an HR assistant helping employees. Provide information about benefits, policies, and procedures. For sensitive matters, direct employees to their HR representative.',
    orders: 'You are an order tracking assistant. Help customers check order status, track shipments, and process returns. Be proactive about providing tracking information.',
    scheduling: 'You are an appointment scheduling assistant. Help customers book appointments, check availability, and send confirmations. Be friendly and efficient.',
    general: 'You are a virtual assistant providing general information. Answer frequently asked questions about the business, hours, locations, and services.'
  }

  let instructions = baseInstructions[selectedProblem.value] || 'You are a helpful AI assistant.'

  // If user provided intent, personalize the instructions
  if (userIntent.value.trim()) {
    instructions += `\n\nSpecific context: ${userIntent.value.trim()}`
  }

  return instructions
}
</script>

<style scoped>
.onboarding-v2 {
  min-height: 100vh;
  background: #fff;
  padding: 60px 40px 40px;
  font-family: apple-system, BlinkMacSystemFont, "SF Pro", "Segoe UI Adjusted", "Segoe UI", SFMono, "Helvetica Neue", Cantarell, Ubuntu, Roboto, Arial, "Noto Sans", sans-serif;
}

/* Step Content */
.step-content {
  max-width: 900px;
  margin: 0 auto;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-content h1 {
  font-size: 48px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 12px;
}

.step-description {
  font-size: 16px;
  color: #666;
  text-align: center;
  margin-bottom: 48px;
}

/* Intent Input */
.intent-input-container {
  max-width: 700px;
  margin: 0 auto 32px;
}

.intent-textarea {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #ddd;
  font-size: 16px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s;
  margin-bottom: 16px;
}

.intent-textarea:focus {
  outline: none;
  border-color: #000;
}

.intent-textarea::placeholder {
  color: #999;
}

.btn-create-from-intent {
  width: 100%;
  padding: 14px 24px;
  background: #000;
  color: #fff;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-create-from-intent:hover {
  background: #333;
}

/* Divider */
.or-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 32px 0 24px;
  color: #999;
}

.or-divider::before,
.or-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #ddd;
}

.or-divider span {
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
}

/* Templates Label */
.templates-label {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

/* Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.cards-grid.two-columns {
  grid-template-columns: repeat(2, 1fr);
}

.selection-card {
  padding: 24px;
  border: 2px solid #ddd;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.selection-card:hover {
  border-color: #666;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.selection-card.selected {
  border-color: #000;
  background: #fafafa;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.card-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.card-features {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

/* Name Input */
.name-input-container {
  max-width: 500px;
  margin: 0 auto 40px;
}

.agent-name-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #ddd;
  font-size: 18px;
  font-weight: 500;
  transition: border-color 0.2s;
}

.agent-name-input:focus {
  outline: none;
  border-color: #000;
}

.example-names {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.example-label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.example-button {
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.example-button:hover {
  background: #e8e8e8;
  border-color: #999;
}

/* Buttons */
.button-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 40px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 32px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #000;
  color: #fff;
  border: 2px solid #000;
}

.btn-primary:hover:not(:disabled) {
  background: #333;
  border-color: #333;
}

.btn-primary:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #fff;
  color: #000;
  border: 2px solid #ddd;
}

.btn-secondary:hover {
  border-color: #000;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

.modal-content {
  background: #fff;
  padding: 48px;
  max-width: 600px;
  width: 90%;
  position: relative;
  animation: slideUp 0.3s;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 32px;
  line-height: 1;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #000;
}

.modal-content h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.modal-description {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
}

.modal-input-container {
  margin-bottom: 32px;
}

.modal-input {
  width: 100%;
  padding: 16px 20px;
  border: 2px solid #ddd;
  font-size: 18px;
  font-weight: 500;
  transition: border-color 0.2s;
  margin-bottom: 16px;
}

.modal-input:focus {
  outline: none;
  border-color: #000;
}

.modal-content .btn-primary {
  width: 100%;
  padding: 16px 32px;
  font-size: 16px;
}
</style>
