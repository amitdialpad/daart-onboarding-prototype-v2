<template>
  <div class="setup-animation">
    <div class="animation-content">
      <h1>Setting up your agent</h1>
      <p class="subtitle">This will only take a moment...</p>

      <!-- Phase Progress -->
      <div class="phases-container">
        <div
          v-for="(phase, index) in phases"
          :key="index"
          class="phase-item"
          :class="{
            'active': currentPhase === index,
            'completed': currentPhase > index
          }"
        >
          <div class="phase-indicator">
            <div class="phase-number" v-if="currentPhase <= index">{{ index + 1 }}</div>
            <div class="phase-checkmark" v-else>✓</div>
          </div>
          <div class="phase-text">
            <div class="phase-title">{{ phase.title }}</div>
            <div class="phase-desc">{{ phase.description }}</div>
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentPhase = ref(0)

// Phases (Phase 4 removed as per user request)
const phases = ref([
  {
    title: 'Phase 1',
    description: 'Initializing agent workspace'
  },
  {
    title: 'Phase 2',
    description: 'Configuring AI capabilities'
  },
  {
    title: 'Phase 3',
    description: 'Preparing your dashboard'
  }
])

const progressPercent = computed(() => {
  return ((currentPhase.value + 1) / phases.value.length) * 100
})

// Generate smart agent name based on intent
const generateAgentName = (intent, scenarioId) => {
  // If there's a scenario ID, use predefined names
  if (scenarioId) {
    const scenarioNames = {
      'appointments': 'Appointment Agent',
      'reminders': 'Reminder Agent',
      'support': 'Support Agent',
      'sales': 'Sales Agent',
      'orders': 'Order Tracking Agent',
      'reservations': 'Reservation Agent'
    }
    if (scenarioNames[scenarioId]) {
      return scenarioNames[scenarioId]
    }
  }

  // For custom intents, extract key terms to generate a smart name
  if (intent && intent.trim()) {
    const lowerIntent = intent.toLowerCase()

    // Check for common keywords and generate appropriate names
    if (lowerIntent.includes('appointment') || lowerIntent.includes('book') || lowerIntent.includes('schedule')) {
      return 'Appointment Agent'
    }
    if (lowerIntent.includes('reminder') || lowerIntent.includes('remind')) {
      return 'Reminder Agent'
    }
    if (lowerIntent.includes('support') || lowerIntent.includes('help') || lowerIntent.includes('customer')) {
      return 'Support Agent'
    }
    if (lowerIntent.includes('sales') || lowerIntent.includes('lead') || lowerIntent.includes('qualify')) {
      return 'Sales Agent'
    }
    if (lowerIntent.includes('order') || lowerIntent.includes('track') || lowerIntent.includes('delivery')) {
      return 'Order Tracking Agent'
    }
    if (lowerIntent.includes('reservation') || lowerIntent.includes('restaurant') || lowerIntent.includes('table')) {
      return 'Reservation Agent'
    }
    if (lowerIntent.includes('payment') || lowerIntent.includes('invoice') || lowerIntent.includes('billing')) {
      return 'Billing Agent'
    }

    // Default to "Custom Agent" for other intents
    return 'Custom Agent'
  }

  return 'New Agent'
}

onMounted(() => {
  // Animate through phases
  animatePhases()
})

function animatePhases() {
  const phaseInterval = setInterval(() => {
    if (currentPhase.value < phases.value.length - 1) {
      currentPhase.value++
    } else {
      clearInterval(phaseInterval)
      // Wait a moment on the last phase, then complete setup
      setTimeout(() => {
        completeSetup()
      }, 800)
    }
  }, 1200) // Each phase takes 1.2 seconds
}

function convertKnowledgeToSources(knowledgeArray) {
  // Convert the knowledge array from onboarding to the knowledgeSources structure
  const sources = {
    integrations: [],
    documents: [],
    conversations: [],
    textSnippets: [],
    websites: []
  }

  if (!knowledgeArray || knowledgeArray.length === 0) {
    return sources
  }

  knowledgeArray.forEach(item => {
    if (item.type === 'integration' || item.type === 'workspace') {
      sources.integrations.push({
        id: item.id || 'int-' + Date.now() + Math.random(),
        name: item.name || item.platform || 'Integration',
        platform: item.platform || item.name,
        itemCount: item.itemCount || item.items || 0,
        connectedAt: item.connectedAt || new Date().toISOString()
      })
    } else if (item.type === 'document' || item.type === 'file') {
      sources.documents.push({
        id: item.id || 'doc-' + Date.now() + Math.random(),
        name: item.name || item.fileName || 'Document',
        size: item.size || 0,
        uploadedAt: item.uploadedAt || new Date().toISOString()
      })
    } else if (item.type === 'conversation') {
      sources.conversations.push({
        id: item.id || 'conv-' + Date.now() + Math.random(),
        name: item.name || 'Conversations',
        conversationCount: item.conversationCount || item.count || 0,
        uploadedAt: item.uploadedAt || new Date().toISOString()
      })
    } else if (item.type === 'text' || item.type === 'snippet') {
      sources.textSnippets.push({
        id: item.id || 'snip-' + Date.now() + Math.random(),
        title: item.title || item.name || 'Text snippet',
        content: item.content || item.text || '',
        addedAt: item.addedAt || new Date().toISOString()
      })
    } else if (item.type === 'website' || item.type === 'url') {
      sources.websites.push({
        id: item.id || 'web-' + Date.now() + Math.random(),
        url: item.url || item.website || '',
        pageCount: item.pageCount || item.pages || 1,
        crawlSubpages: item.crawlSubpages !== false,
        addedAt: item.addedAt || new Date().toISOString()
      })
    }
  })

  return sources
}

function completeSetup() {
  // Get the intent data
  const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')

  // Generate a smart agent name based on the intent
  const agentName = generateAgentName(buildData.intent, buildData.scenarioId)

  // Create a draft agent with all required fields for workspace
  const newAgent = {
    id: 'agent-' + Date.now(),
    name: agentName,
    intent: buildData.intent || '',
    status: 'draft',
    statusText: 'Draft',
    createdAt: new Date().toISOString(),
    lastUpdated: 'Just now',
    conversations: 0,
    deflectionRate: 0,
    satisfaction: '-',
    // Add workspace-required fields
    instructions: buildData.intent || '',
    agentType: 'chat',
    // Channels structure expected by workspace
    channels: {
      webChat: {
        enabled: true,
        welcomeMessage: 'Hi! How can I help you today?',
        enableProactive: false,
        proactiveMessage: '',
        responseTime: 'Usually replies in 2 minutes',
        showTypingIndicator: true,
        awayMessage: '',
        businessHours: 'Monday-Friday, 9 AM - 5 PM EST',
        offlineBehavior: 'always-on',
        offlineMessage: '',
        autoAwayTimeout: 5,
        transferConditions: '',
        transferDestination: 'support',
        handoffMessage: 'Let me connect you with a team member...',
        contextToTransfer: '',
        enableTranscript: true
      },
      voice: {
        enabled: false
      },
      sms: {
        enabled: false,
        smsNumber: '',
        autoReply: false
      }
    },
    knowledge: buildData.knowledge || [],
    integrations: buildData.integrations || [],
    selectedMethod: buildData.selectedMethod || 'knowledge',
    // Convert knowledge array to knowledgeSources structure for Build view
    knowledgeSources: convertKnowledgeToSources(buildData.knowledge || [])
  }

  // Save agent to localStorage
  // If we were creating a new agent (backup exists), restore the backup first
  let existingAgents = []
  const backup = localStorage.getItem('daart-agents-backup')
  if (backup) {
    existingAgents = JSON.parse(backup)
    localStorage.removeItem('daart-agents-backup')
    localStorage.removeItem('daart-creating-new-agent')
  } else {
    existingAgents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  }

  existingAgents.push(newAgent)
  localStorage.setItem('daart-agents', JSON.stringify(existingAgents))

  // Clear building agent data
  localStorage.removeItem('daart-building-agent')

  // Set flag to show success view on the home page
  localStorage.setItem('daart-just-completed-onboarding', 'true')

  // Redirect to home
  router.push('/home')
}
</script>

<style scoped>
.setup-animation {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 40px 20px;
}

.animation-content {
  width: 100%;
  max-width: 600px;
  text-align: center;
}

h1 {
  font-size: 36px;
  font-weight: 600;
  color: #000;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 18px;
  color: #666;
  margin: 0 0 64px 0;
  line-height: 1.6;
}

/* Phases */
.phases-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 48px;
  text-align: left;
}

.phase-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s ease;
  opacity: 0.4;
}

.phase-item.active {
  border-color: #999;
  background: #fff;
  opacity: 1;
}

.phase-item.completed {
  border-color: #ccc;
  background: #fff;
  opacity: 1;
}

.phase-indicator {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border: 1px solid #ddd;
  transition: all 0.3s ease;
}

.phase-item.active .phase-indicator {
  background: #fff;
  border-color: #999;
  animation: pulse 1.5s ease-in-out infinite;
}

.phase-item.completed .phase-indicator {
  background: #f8f8f8;
  border-color: #ccc;
}

.phase-number {
  font-size: 20px;
  font-weight: 600;
  color: #999;
}

.phase-item.active .phase-number {
  color: #333;
}

.phase-checkmark {
  font-size: 24px;
  color: #666;
  font-weight: 600;
}

.phase-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.phase-title {
  font-size: 18px;
  font-weight: 600;
  color: #000;
}

.phase-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

/* Progress Bar */
.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #999;
  transition: width 0.3s ease;
  border-radius: 3px;
}

/* Pulse Animation */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.1);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  h1 {
    font-size: 28px;
  }

  .subtitle {
    font-size: 16px;
    margin-bottom: 48px;
  }

  .phases-container {
    gap: 16px;
    margin-bottom: 32px;
  }

  .phase-item {
    padding: 16px;
    gap: 16px;
  }

  .phase-indicator {
    width: 40px;
    height: 40px;
  }

  .phase-number {
    font-size: 18px;
  }

  .phase-checkmark {
    font-size: 20px;
  }

  .phase-title {
    font-size: 16px;
  }

  .phase-desc {
    font-size: 13px;
  }
}
</style>
