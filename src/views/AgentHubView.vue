<template>
  <div class="agent-hub" :class="{ 'empty-hub': agents.length === 0 }">
    <!-- Empty State: Full Screen Focus -->
    <AgentHubEmptyState v-if="agents.length === 0" @create-agent="goToOnboarding" />

    <!-- Has Agents: Normal Layout -->
    <template v-else>
      <!-- Trial Banner (less prominent) -->
      <TrialBanner v-if="isInTrial && !showSuccessView" />

      <!-- Header Row: Agents title and Create Agent button -->
      <div v-if="agents.length > 1 || (agents.length === 1 && !showSuccessView)" class="main-header">
        <h1 class="main-title">Agents ({{ agents.length }})</h1>
        <button class="btn-create-agent" @click="goToOnboarding">+ Create Agent</button>
      </div>

      <!-- Main Layout -->
      <div class="hub-layout" :class="{ 'single-column': agents.length === 1 && showSuccessView, 'two-column': agents.length >= 1 && !showSuccessView }">
        <!-- Left: Agents Section -->
        <div class="agents-section">
          <!-- Enhanced first agent success view (only show right after onboarding) -->
          <div v-if="agents.length === 1 && showSuccessView" class="first-agent-success">
            <div class="success-header">
              <h2 class="success-title">Your agent is ready!</h2>
              <p class="success-subtitle">Here's what we set up for you</p>
            </div>

            <!-- Agent Summary Card -->
            <div class="agent-summary-card">
              <div class="summary-header">
                <h3 class="agent-name">{{ agents[0].name }}</h3>
                <span class="status-badge draft">Draft</span>
              </div>
              <p class="agent-purpose">{{ getAgentPurpose(agents[0]) }}</p>
            </div>

            <!-- What We Built -->
            <div class="setup-summary">
              <h3 class="section-title">What we built</h3>
              <div class="setup-items">
                <div class="setup-item">
                  <div class="item-content">
                    <div class="item-title">Knowledge base</div>
                    <div class="item-description">
                      {{ getKnowledgeSummary(agents[0]) }}
                    </div>
                  </div>
                </div>

                <div class="setup-item">
                  <div class="item-content">
                    <div class="item-title">Agent configuration</div>
                    <div class="item-description">
                      {{ getConfigSummary(agents[0]) }}
                    </div>
                  </div>
                </div>

                <div class="setup-item">
                  <div class="item-content">
                    <div class="item-title">Communication channels</div>
                    <div class="item-description">
                      {{ getChannelsSummary(agents[0]) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Next Steps -->
            <div class="next-steps">
              <h3 class="section-title">Next steps</h3>
              <div class="steps-grid">
                <div class="step-card primary" @click="continueToBuild">
                  <div class="step-content">
                    <div class="step-title">1. Refine your agent</div>
                    <div class="step-description">
                      Customize responses, add more knowledge, and configure advanced settings
                    </div>
                  </div>
                </div>

                <div class="step-card" @click="continueToTest">
                  <div class="step-content">
                    <div class="step-title">2. Test conversations</div>
                    <div class="step-description">
                      Try different scenarios to see how your agent responds
                    </div>
                  </div>
                </div>

                <div class="step-card disabled">
                  <div class="step-content">
                    <div class="step-title">3. Deploy to production</div>
                    <div class="step-description">
                      Go live after testing and make your agent available to customers
                    </div>
                  </div>
                </div>
              </div>

              <!-- Create Another Agent Link -->
              <div class="create-another-link">
                <a href="#" @click.prevent="goToOnboarding()">+ Create another agent</a>
              </div>
            </div>
          </div>

          <AgentCardGrid v-if="agents.length > 1 || (agents.length === 1 && !showSuccessView)" :agents="agents" />
        </div>

        <!-- Right: Notifications (show when not in success view) -->
        <div v-if="!showSuccessView" class="activity-section">
          <NotificationsPanel />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import TrialBanner from '../components/agentHub/TrialBanner.vue'
import AgentCardGrid from '../components/agentHub/AgentCardGrid.vue'
import AgentHubEmptyState from '../components/agentHub/AgentHubEmptyState.vue'
import NotificationsPanel from '../components/agentHub/NotificationsPanel.vue'
import { useActivityFeedStore } from '../stores/activityFeed'

const router = useRouter()
const agents = ref([])
const activityStore = useActivityFeedStore()

// Check if in trial (placeholder - will connect to store)
const isInTrial = computed(() => {
  const trialData = JSON.parse(localStorage.getItem('daart-trial') || '{}')
  return trialData.isInTrial !== false // Default to true for prototype
})

const showSuccessView = ref(false)

onMounted(() => {
  loadAgents()
  generateActivity()

  // Check if we should show the success view (just completed onboarding for FIRST agent only)
  const justCompletedOnboarding = localStorage.getItem('daart-just-completed-onboarding') === 'true'
  const wasCreatingNewAgent = localStorage.getItem('daart-was-creating-new-agent') === 'true'

  // Only show success view for first agent (not when creating additional agents)
  if (justCompletedOnboarding && agents.value.length === 1 && !wasCreatingNewAgent) {
    showSuccessView.value = true
  }

  // Clear the flags
  localStorage.removeItem('daart-just-completed-onboarding')
  localStorage.removeItem('daart-was-creating-new-agent')

  updateBodyClass()
})

onBeforeUnmount(() => {
  // Clean up body class when leaving this view
  document.body.classList.remove('empty-state-mode')
  document.body.classList.remove('single-agent-mode')
})

function loadAgents() {
  const savedAgents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  agents.value = savedAgents
  updateBodyClass()
}

function updateBodyClass() {
  if (agents.value.length === 0) {
    document.body.classList.add('empty-state-mode')
    document.body.classList.remove('single-agent-mode')
  } else if (agents.value.length === 1 && showSuccessView.value) {
    document.body.classList.add('single-agent-mode')
    document.body.classList.remove('empty-state-mode')
  } else {
    document.body.classList.remove('empty-state-mode')
    document.body.classList.remove('single-agent-mode')
  }
}

function generateActivity() {
  // Generate mock activity and recommendations based on agents
  activityStore.generateMockActivities(agents.value)
  activityStore.generateRecommendations(agents.value)
}

function goToOnboarding(scenario) {
  // If scenario is provided (from empty state), store it and go to method selection
  if (scenario) {
    localStorage.setItem('daart-building-agent', JSON.stringify({
      intent: scenario.intent,
      scenarioId: scenario.id,
      timestamp: Date.now()
    }))
    router.push('/build-agent')
  } else {
    // No scenario - user clicked "Create Agent" from hub with existing agents
    // Back up current agents and show empty state for new agent creation
    const currentAgents = localStorage.getItem('daart-agents')
    if (currentAgents) {
      localStorage.setItem('daart-agents-backup', currentAgents)
    }

    // Clear current agents to show empty state
    localStorage.setItem('daart-agents', '[]')

    // Set flags to show "Back to My Agents" option and track that this is not first agent
    localStorage.setItem('daart-creating-new-agent', 'true')
    localStorage.setItem('daart-was-creating-new-agent', 'true')

    // Clear any previous onboarding data
    localStorage.removeItem('daart-building-agent')
    localStorage.removeItem('daart-just-completed-onboarding')

    // Reload to show empty state
    // Preserve base path for GitHub Pages deployment
    const basePath = window.location.pathname.split('#')[0]
    window.location.href = window.location.origin + basePath + '#/home'
  }
}

function getAgentPurpose(agent) {
  // Get the purpose/intent from the agent data
  return agent.description || agent.intent || 'Your AI assistant is configured and ready to help customers'
}

function getKnowledgeSummary(agent) {
  const knowledgeCount = agent.knowledge?.length || 0
  if (knowledgeCount === 0) {
    return 'Ready to add knowledge sources'
  } else if (knowledgeCount === 1) {
    return '1 knowledge source connected'
  } else {
    return `${knowledgeCount} knowledge sources connected`
  }
}

function getConfigSummary(agent) {
  const config = []
  if (agent.agentType === 'voice') {
    config.push('Voice agent')
  } else {
    config.push('Chat agent')
  }
  if (agent.language) {
    config.push(agent.language)
  }
  return config.join(' • ') || 'Basic configuration complete'
}

function getChannelsSummary(agent) {
  const channels = []
  if (agent.agentType === 'chat') {
    channels.push('Website chat')
    if (agent.chatConfig?.smsEnabled) {
      channels.push('SMS')
    }
  } else {
    channels.push('Phone')
  }
  return channels.length > 0 ? channels.join(' & ') + ' configured' : 'Ready to configure'
}

function continueToBuild() {
  router.push(`/agents-v2/${agents.value[0].id}/build`)
}

function continueToTest() {
  router.push(`/agents-v2/${agents.value[0].id}/test`)
}
</script>

<style scoped>
.agent-hub {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Empty state: full screen, centered */
.agent-hub.empty-hub {
  padding: 0;
  max-width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* First Agent Success View */
.first-agent-success {
  max-width: 700px;
  margin: 0 auto;
}

.success-header {
  text-align: center;
  margin-bottom: 32px;
}

.success-title {
  font-size: 36px;
  font-weight: 600;
  color: #000;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.success-subtitle {
  font-size: 18px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

/* Agent Summary Card */
.agent-summary-card {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
}

.summary-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.agent-name {
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.draft {
  background: #e0e0e0;
  color: #666;
}

.agent-purpose {
  font-size: 15px;
  color: #666;
  margin: 0;
  line-height: 1.6;
}

/* Setup Summary */
.setup-summary {
  margin-bottom: 32px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin: 0 0 16px 0;
}

.setup-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setup-item {
  padding: 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.item-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* Next Steps */
.next-steps {
  margin-top: 40px;
}

.steps-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-card {
  padding: 20px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.step-card:hover:not(.disabled) {
  border-color: #000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.step-card.primary {
  background: #000;
  color: #fff;
  border-color: #000;
}

.step-card.primary .step-title,
.step-card.primary .step-description {
  color: #fff;
}

.step-card.primary .step-description {
  opacity: 0.9;
}

.step-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.step-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* Create Another Agent Link */
.create-another-link {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.create-another-link a {
  font-size: 14px;
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.create-another-link a:hover {
  color: #000;
}

/* Main Header */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 24px;
}

.main-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.btn-create-agent {
  padding: 12px 24px;
  background: #000;
  color: #fff;
  border: 1px solid #000;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-create-agent:hover {
  background: #333;
}

/* Single column layout for first agent */
.hub-layout.single-column {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 40px;
}

.hub-layout.single-column .agents-section {
  max-width: 500px;
  width: 100%;
}

/* Two column layout for multiple agents */
.hub-layout.two-column {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
}

.agents-section {
  min-width: 0; /* Prevent grid overflow */
}

.activity-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Responsive */
@media (max-width: 1024px) {
  .hub-layout.two-column {
    grid-template-columns: 1fr;
  }

  .activity-section {
    display: none; /* Hide on smaller screens for now */
  }
}

@media (max-width: 768px) {
  .agent-hub {
    padding: 20px;
  }

  .success-title {
    font-size: 28px;
  }

  .success-subtitle {
    font-size: 16px;
  }
}
</style>
