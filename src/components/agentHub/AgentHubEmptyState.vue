<template>
  <div class="empty-state-wrapper">
    <!-- Minimal Top Bar -->
    <div class="top-bar">
      <a v-if="hasBackupAgents" href="#" class="cancel-link" @click.prevent="cancelCreateAgent">← Back to My Agents</a>
      <div v-else class="logo">Dialpad Agents</div>
      <a href="#" class="reset-link" @click.prevent="resetDemo">Reset Demo</a>
    </div>

    <div class="empty-state-container">
      <div class="empty-content" :class="{ 'transitioning': isTransitioning }">
        <h1>What do you want your agent to do?</h1>

        <!-- Input Area (primary focal point) -->
        <div class="input-section">
          <textarea
            ref="intentInput"
            v-model="customIntent"
            placeholder="Describe what you want your agent to do..."
            rows="4"
            class="intent-textarea"
            @input="onIntentChange"
          ></textarea>

          <p v-if="intentError" class="error-message">{{ intentError }}</p>

          <div class="input-actions">
            <button
              v-if="customIntent.trim()"
              class="btn-secondary"
              @click="clearInput"
            >
              Clear
            </button>
            <button
              class="btn-primary"
              @click="submitIntent"
              :disabled="!customIntent.trim()"
            >
              Continue
            </button>
          </div>
        </div>

        <p class="subtitle">
          OR Choose a scenario below
        </p>

        <!-- Scenarios Grid (helpers to fill the input) -->
        <div class="scenarios-grid">
          <div
            v-for="scenario in scenarios"
            :key="scenario.id"
            class="scenario-card"
            :class="{ 'selected': selectedScenario?.id === scenario.id }"
            @click="selectScenario(scenario)"
          >
            <h3 class="scenario-title">{{ scenario.title }}</h3>
            <p class="scenario-desc">{{ scenario.description }}</p>
          </div>
        </div>

        <!-- Trial Info -->
        <div class="trial-info">
          <div class="trial-item">
            <strong>14-day free trial</strong>
            <span>No credit card required</span>
          </div>
          <div class="trial-divider">•</div>
          <div class="trial-item">
            <strong>1,000 conversations free</strong>
            <span>Then $0.50 per conversation</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['create-agent'])

const customIntent = ref('')
const intentError = ref('')
const selectedScenario = ref(null)
const intentInput = ref(null)
const isTransitioning = ref(false)

// Check if user has backup agents (came from "Create Agent" button)
const hasBackupAgents = computed(() => {
  return localStorage.getItem('daart-creating-new-agent') === 'true' &&
         localStorage.getItem('daart-agents-backup') !== null
})

function cancelCreateAgent() {
  // Restore backed up agents
  const backup = localStorage.getItem('daart-agents-backup')
  if (backup) {
    localStorage.setItem('daart-agents', backup)
    localStorage.removeItem('daart-agents-backup')
  }
  localStorage.removeItem('daart-creating-new-agent')
  localStorage.removeItem('daart-building-agent')

  // Force reload to clear any stale state
  window.location.reload()
}

function resetDemo() {
  if (confirm('This will clear all agents and reset the demo. Continue?')) {
    localStorage.removeItem('daart-agents')
    localStorage.removeItem('daart-trial')
    localStorage.removeItem('daart-selected-scenario')
    window.location.reload()
  }
}

function selectScenario(scenario) {
  selectedScenario.value = scenario
  customIntent.value = scenario.intent
  intentError.value = ''

  // Start transition animation - show selected card moving up
  isTransitioning.value = true

  // Wait for card animation to complete before proceeding
  setTimeout(() => {
    emit('create-agent', scenario)
  }, 600)
}

function onIntentChange() {
  intentError.value = ''
  // If user starts typing custom text, deselect scenario
  if (selectedScenario.value && customIntent.value !== selectedScenario.value.intent) {
    selectedScenario.value = null
  }
}

function clearInput() {
  customIntent.value = ''
  selectedScenario.value = null
  intentError.value = ''
}

function submitIntent() {
  if (!customIntent.value.trim()) {
    intentError.value = 'Please describe what you want your agent to do'
    return
  }

  // Create scenario object (use selected one or create custom)
  const scenario = selectedScenario.value || {
    id: 'custom',
    title: 'Custom agent',
    description: customIntent.value,
    intent: customIntent.value
  }

  emit('create-agent', scenario)
}

const scenarios = ref([
  {
    id: 'appointments',
    title: 'Book appointments',
    description: 'Schedule appointments for dental, medical, salon, or service businesses',
    intent: 'Book appointments for my business, check availability in my calendar, and confirm bookings with customers'
  },
  {
    id: 'reminders',
    title: 'Send reminders',
    description: 'Automated reminders for appointments, payments, renewals, or deadlines',
    intent: 'Send automated reminders to customers for appointments, payments, and important deadlines via SMS and voice calls'
  },
  {
    id: 'support',
    title: 'Customer support 24/7',
    description: 'Answer common questions, troubleshoot issues, and escalate when needed',
    intent: 'Answer customer support questions 24/7, help troubleshoot common issues, and escalate complex cases to my team'
  },
  {
    id: 'sales',
    title: 'Qualify sales leads',
    description: 'Ask qualifying questions and schedule demos with your sales team',
    intent: 'Qualify inbound sales leads by asking questions about their needs, budget, and timeline, then schedule demos with my sales team'
  },
  {
    id: 'orders',
    title: 'Track orders',
    description: 'Help customers check order status, process returns, and answer shipping questions',
    intent: 'Help customers track their orders, check delivery status, process returns, and answer questions about shipping and products'
  },
  {
    id: 'reservations',
    title: 'Restaurant reservations',
    description: 'Take reservations, manage waitlist, and answer menu questions',
    intent: 'Handle restaurant reservations, manage our waitlist, answer questions about the menu and hours, and take takeout orders'
  }
])
</script>

<style scoped>
.empty-state-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Minimal Top Bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  border-bottom: 1px solid #e0e0e0;
}

.logo {
  font-size: 18px;
  font-weight: 600;
  color: #000;
}

.cancel-link {
  font-size: 14px;
  color: #000;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.cancel-link:hover {
  color: #666;
}

.reset-link {
  font-size: 14px;
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.reset-link:hover {
  color: #000;
}

.empty-state-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  overflow: auto;
}

.empty-content {
  width: 100%;
  max-width: 900px;
  text-align: center;
}

.empty-content.transitioning h1,
.empty-content.transitioning .subtitle,
.empty-content.transitioning .input-section,
.empty-content.transitioning .trial-info {
  animation: fadeOutUp 0.4s ease-out forwards;
}

.empty-content.transitioning .scenarios-grid {
  animation: cardsExit 0.6s ease-out forwards;
}

@keyframes fadeOutUp {
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}

@keyframes cardsExit {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  50% {
    opacity: 0.3;
    transform: translateY(-30px);
  }
  100% {
    opacity: 0;
    transform: translateY(-50px);
  }
}

h1 {
  font-size: 42px;
  font-weight: 600;
  margin: 0 0 32px 0;
  color: #000;
  line-height: 1.2;
}

.subtitle {
  font-size: 18px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

/* Scenarios Grid */
.scenarios-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 48px;
}

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

.scenario-card.selected {
  border-color: #000;
  background: #f8f8f8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Selected card animation during transition */
.empty-content.transitioning .scenario-card.selected {
  animation: selectedCardHighlight 0.6s ease-out forwards;
  z-index: 10;
  position: relative;
}

/* Non-selected cards fade faster */
.empty-content.transitioning .scenario-card:not(.selected) {
  animation: fadeOutFast 0.3s ease-out forwards;
}

@keyframes selectedCardHighlight {
  0% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
  30% {
    transform: scale(1.05) translateY(-10px);
    opacity: 1;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
  100% {
    transform: scale(1.05) translateY(-60px);
    opacity: 0;
  }
}

@keyframes fadeOutFast {
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.scenario-title {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.scenario-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* Input Section */
.input-section {
  max-width: 800px;
  margin: 0 auto 48px auto;
}

/* Trial Info */
.trial-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: #f8f8f8;
  border-radius: 8px;
}

.trial-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.trial-item strong {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.trial-item span {
  font-size: 12px;
  color: #666;
}

.trial-divider {
  color: #ddd;
  font-size: 18px;
  line-height: 1;
}

.intent-textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 15px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  margin-bottom: 16px;
  transition: border-color 0.2s;
}

.intent-textarea:focus {
  outline: none;
  border-color: #000;
}

.intent-textarea::placeholder {
  color: #999;
}

.error-message {
  color: #d32f2f;
  font-size: 14px;
  margin: -8px 0 16px 0;
}

.input-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn-secondary {
  padding: 14px 32px;
  background: #fff;
  color: #000;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #000;
  background: #fafafa;
}

.btn-primary {
  padding: 14px 32px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #333;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 1024px) {
  .scenarios-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .top-bar {
    padding: 16px 20px;
  }

  .logo {
    font-size: 16px;
  }

  .reset-link {
    font-size: 13px;
  }

  .empty-state-container {
    padding: 40px 20px;
  }

  h1 {
    font-size: 32px;
  }

  .subtitle {
    font-size: 16px;
  }

  .scenarios-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .trial-info {
    flex-direction: column;
    gap: 16px;
  }

  .trial-divider {
    display: none;
  }

  .input-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>
