<template>
  <div class="agent-test-view">
    <!-- Header -->
    <div class="test-header">
      <div class="header-content">
        <div class="header-left">
          <button class="back-btn" @click="goBack">← Back to Edit</button>
          <div class="intent-info">
            <p class="intent-label">Testing agent for:</p>
            <p class="intent-text">{{ userIntent }}</p>
          </div>
        </div>
        <div class="header-right">
          <button class="continue-btn" @click="continueConfiguration">Set up my agent →</button>
        </div>
      </div>
    </div>

    <!-- Main Content: Split View -->
    <div class="test-content">
      <!-- Left Panel: Configuration Summary -->
      <div class="config-panel">
        <div class="panel-header">
          <h2>Configuration</h2>
          <button class="edit-config-btn" @click="goBack">Edit</button>
        </div>

        <div class="config-scroll">
          <!-- Questions Method Summary -->
          <div v-if="buildMethod === 'questions'" class="config-section">
            <h3>Your Answers</h3>
            <div v-if="configData.questions" class="config-items">
              <div v-for="(value, key) in configData.questions" :key="key" class="config-item">
                <span class="config-label">{{ formatKey(key) }}:</span>
                <span class="config-value">{{ value }}</span>
              </div>
            </div>
            <p v-else class="empty-state">No questions answered yet</p>
          </div>

          <!-- Knowledge Method Summary -->
          <div v-if="buildMethod === 'knowledge'" class="config-section">
            <h3>Knowledge Sources</h3>
            <div v-if="configData.knowledge && configData.knowledge.length > 0" class="knowledge-list">
              <div v-for="source in configData.knowledge" :key="source.id" class="knowledge-item">
                <div class="knowledge-info">
                  <p class="knowledge-name">{{ source.name }}</p>
                  <p class="knowledge-type">{{ source.type }}</p>
                </div>
              </div>
            </div>
            <p v-else class="empty-state">No knowledge sources added yet</p>
          </div>

          <!-- Workflow Method Summary -->
          <div v-if="buildMethod === 'workflow'" class="config-section">
            <h3>Conversation Flow</h3>
            <div v-if="configData.workflow && configData.workflow.nodes && configData.workflow.nodes.length > 0" class="workflow-summary">
              <div v-for="node in configData.workflow.nodes" :key="node.id" class="workflow-node">
                <div class="workflow-node-header">
                  <span class="node-icon">{{ getNodeIcon(node.type) }}</span>
                  <span class="node-title">{{ node.title }}</span>
                </div>
                <p class="node-content">{{ node.content }}</p>
                <div v-if="node.branches && node.branches.length > 0" class="node-branches">
                  <span v-for="branch in node.branches" :key="branch.id" class="branch-tag">
                    {{ branch.label }}
                  </span>
                </div>
              </div>
            </div>
            <p v-else class="empty-state">No workflow nodes created yet</p>
          </div>

          <!-- Integrations (Common to all methods) -->
          <div v-if="configData.integrations && configData.integrations.length > 0" class="config-section">
            <h3>Integrations</h3>
            <div class="integrations-list">
              <div v-for="integration in configData.integrations" :key="integration.type" class="integration-item">
                <span class="integration-icon">🔗</span>
                <span class="integration-name">{{ formatIntegration(integration) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Test Chat -->
      <div class="chat-panel">
        <div class="panel-header">
          <h2>Test Your Agent</h2>
          <button class="reset-btn" @click="resetChat">Reset Chat</button>
        </div>

        <!-- Agent Intro Card -->
        <div class="agent-intro">
          <div class="agent-avatar">👋</div>
          <div class="agent-info">
            <h3>Hi, I'm AI Assistant</h3>
            <p>{{ userIntent }}</p>
          </div>
        </div>

        <!-- Suggested Questions - Always visible -->
        <div class="suggested-questions">
          <p class="suggestions-label">Suggested questions:</p>
          <button
            v-for="(question, index) in suggestedQuestions"
            :key="index"
            class="suggestion-btn"
            @click="sendSuggestion(question)"
          >
            {{ question }}
          </button>
        </div>

        <!-- Chat Messages -->
        <div ref="chatContainer" class="chat-messages">
          <div v-for="msg in testMessages" :key="msg.id" class="chat-message" :class="msg.role">
            <div class="message-content">
              {{ msg.content }}
            </div>

            <!-- Smart Suggestions for capabilities needed -->
            <div v-if="msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0" class="message-suggestions">
              <p class="suggestion-prompt">{{ msg.suggestionPrompt }}</p>
              <button
                v-for="(suggestion, index) in msg.suggestions"
                :key="index"
                class="action-suggestion-btn"
                @click="handleSuggestion(suggestion)"
              >
                {{ suggestion.label }}
              </button>
            </div>
          </div>

          <div v-if="isTyping" class="chat-message assistant">
            <div class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="chat-input-area">
          <textarea
            v-model="userMessage"
            placeholder="Ask your agent anything..."
            rows="2"
            @keydown.enter.prevent="sendMessage"
          ></textarea>
          <button
            class="send-btn"
            :disabled="!userMessage.trim()"
            @click="sendMessage"
          >
            Send
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Add Knowledge -->
    <div v-if="showAddKnowledgeModal" class="modal-overlay" @click="showAddKnowledgeModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add Knowledge</h3>
          <button class="modal-close" @click="showAddKnowledgeModal = false">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-description">{{ addKnowledgeContext }}</p>

          <div class="knowledge-options">
            <div class="knowledge-option">
              <label class="option-label">Upload Document</label>
              <input type="file" @change="handleFileUpload" accept=".pdf,.doc,.docx,.txt" />
            </div>

            <div class="knowledge-option">
              <label class="option-label">Add Text</label>
              <textarea v-model="newKnowledgeText" placeholder="Paste text content here..." rows="4"></textarea>
              <button class="add-btn" @click="addTextKnowledge" :disabled="!newKnowledgeText.trim()">Add Text</button>
            </div>

            <div class="knowledge-option">
              <label class="option-label">Add Website URL</label>
              <input v-model="newKnowledgeUrl" type="url" placeholder="https://example.com" />
              <button class="add-btn" @click="addWebsiteKnowledge" :disabled="!newKnowledgeUrl.trim()">Add Website</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Add Integration -->
    <div v-if="showAddIntegrationModal" class="modal-overlay" @click="showAddIntegrationModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add Integration</h3>
          <button class="modal-close" @click="showAddIntegrationModal = false">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-description">{{ addIntegrationContext }}</p>

          <div class="integration-grid">
            <div
              v-for="integration in availableIntegrations"
              :key="integration.type"
              class="integration-card"
              @click="connectIntegration(integration)"
            >
              <p class="integration-name">{{ integration.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Open Visual Builder -->
    <div v-if="showVisualBuilderModal" class="modal-overlay" @click="showVisualBuilderModal = false">
      <div class="modal-content small" @click.stop>
        <div class="modal-header">
          <h3>Open Visual Builder</h3>
          <button class="modal-close" @click="showVisualBuilderModal = false">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-description">{{ visualBuilderContext }}</p>
          <p>You can create custom conversation flows in the Visual Workflow Builder.</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showVisualBuilderModal = false">Cancel</button>
            <button class="btn-primary" @click="openVisualBuilder">Open Visual Builder</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userIntent = ref('')
const buildMethod = ref('')
const configData = ref({})
const testMessages = ref([])
const userMessage = ref('')
const isTyping = ref(false)
const chatContainer = ref(null)

// Modal states
const showAddKnowledgeModal = ref(false)
const showAddIntegrationModal = ref(false)
const showVisualBuilderModal = ref(false)

// Modal contexts
const addKnowledgeContext = ref('')
const addIntegrationContext = ref('')
const visualBuilderContext = ref('')

// Knowledge modal inputs
const newKnowledgeText = ref('')
const newKnowledgeUrl = ref('')

// Available integrations
const availableIntegrations = ref([
  { type: 'google-calendar', name: 'Google Calendar', icon: '📅' },
  { type: 'gmail', name: 'Gmail', icon: '📧' },
  { type: 'slack', name: 'Slack', icon: '💬' },
  { type: 'stripe', name: 'Stripe', icon: '💳' },
  { type: 'salesforce', name: 'Salesforce', icon: '☁️' },
  { type: 'hubspot', name: 'HubSpot', icon: '🎯' }
])

onMounted(() => {
  loadBuildData()
  generateSuggestedQuestions()
})

function loadBuildData() {
  const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')

  if (!buildData.intent) {
    router.push('/home')
    return
  }

  userIntent.value = buildData.intent
  buildMethod.value = buildData.selectedMethod || 'questions'

  // Load method-specific config
  if (buildMethod.value === 'questions') {
    configData.value = {
      questions: buildData.questions || {},
      integrations: buildData.integrations || []
    }
  } else if (buildMethod.value === 'knowledge') {
    configData.value = {
      knowledge: buildData.knowledge || [],
      integrations: buildData.integrations || []
    }
  } else if (buildMethod.value === 'workflow') {
    configData.value = {
      workflow: buildData.workflow || { nodes: [], connections: [] },
      integrations: buildData.integrations || []
    }
  }
}

const suggestedQuestions = ref([])

function generateSuggestedQuestions() {
  // Generate contextual suggestions based on intent
  const intent = userIntent.value.toLowerCase()

  if (intent.includes('appointment') || intent.includes('booking')) {
    suggestedQuestions.value = [
      'How can you help me?',
      'What are your hours?',
      'Can I schedule an appointment?'
    ]
  } else if (intent.includes('reminder')) {
    suggestedQuestions.value = [
      'What can you do?',
      'How do reminders work?',
      'Set a reminder for tomorrow'
    ]
  } else if (intent.includes('support') || intent.includes('customer')) {
    suggestedQuestions.value = [
      'What information do you have?',
      'How can you help me?',
      'What are your hours?'
    ]
  } else {
    suggestedQuestions.value = [
      'Tell me about your company',
      'How can you help me?',
      'What information do you have?'
    ]
  }
}

function sendSuggestion(question) {
  userMessage.value = question
  sendMessage()
}

async function sendMessage() {
  if (!userMessage.value.trim()) return

  const message = userMessage.value.trim()
  testMessages.value.push({
    id: Date.now(),
    role: 'user',
    content: message
  })

  userMessage.value = ''
  scrollToBottom()

  // Simulate AI response
  isTyping.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  isTyping.value = false

  // Generate smart contextual response with suggestions
  const responseData = generateSmartResponse(message)
  testMessages.value.push({
    id: Date.now() + 1,
    role: 'assistant',
    content: responseData.content,
    suggestions: responseData.suggestions || [],
    suggestionPrompt: responseData.suggestionPrompt || ''
  })

  scrollToBottom()
}

function generateSmartResponse(message) {
  const lowerMessage = message.toLowerCase()

  // Check for calendar/scheduling queries
  if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('schedule') || lowerMessage.includes('calendar')) {
    const hasCalendarIntegration = configData.value.integrations?.some(i => i.type === 'google-calendar')

    if (hasCalendarIntegration) {
      return {
        content: "I can help you schedule an appointment! What date and time works best for you?",
        suggestions: [],
        suggestionPrompt: ''
      }
    } else {
      return {
        content: "I'd love to help you schedule appointments, but I need access to a calendar system to check availability and book time slots.",
        suggestions: [
          { type: 'integration', label: '+ Add Calendar Integration', data: 'calendar' }
        ],
        suggestionPrompt: 'To enable booking:'
      }
    }
  }

  // Check for pricing queries
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    const hasKnowledge = configData.value.knowledge?.length > 0

    if (hasKnowledge) {
      return {
        content: "Based on my knowledge, I can help with pricing. What specific service or product are you interested in?",
        suggestions: [],
        suggestionPrompt: ''
      }
    } else {
      return {
        content: "I don't have pricing information available yet. To provide accurate pricing details, I need access to your pricing documentation or product catalog.",
        suggestions: [
          { type: 'knowledge', label: '+ Add Pricing Document', data: 'pricing' },
          { type: 'knowledge', label: '+ Add Product Catalog', data: 'catalog' }
        ],
        suggestionPrompt: 'Add information:'
      }
    }
  }

  // Check for email/communication queries
  if (lowerMessage.includes('email') || lowerMessage.includes('send') || lowerMessage.includes('contact')) {
    const hasEmailIntegration = configData.value.integrations?.some(i => i.type === 'gmail' || i.type === 'email')

    if (!hasEmailIntegration) {
      return {
        content: "I can help coordinate communications, but I'll need email integration to send messages on your behalf.",
        suggestions: [
          { type: 'integration', label: '+ Connect Email', data: 'email' }
        ],
        suggestionPrompt: 'To enable email features:'
      }
    }
  }

  // Check for payment queries
  if (lowerMessage.includes('pay') || lowerMessage.includes('payment') || lowerMessage.includes('charge') || lowerMessage.includes('invoice')) {
    const hasPaymentIntegration = configData.value.integrations?.some(i => i.type === 'stripe' || i.type === 'payment')

    if (!hasPaymentIntegration) {
      return {
        content: "I can help process payments, but I'll need integration with a payment system like Stripe.",
        suggestions: [
          { type: 'integration', label: '+ Add Payment Integration', data: 'payment' }
        ],
        suggestionPrompt: 'To enable payments:'
      }
    }
  }

  // Check for specific/detailed questions that might need knowledge
  if (lowerMessage.includes('what is') || lowerMessage.includes('tell me about') || lowerMessage.includes('explain')) {
    const hasKnowledge = configData.value.knowledge?.length > 0

    if (!hasKnowledge && lowerMessage.length > 30) {
      return {
        content: "I don't have specific information about that yet. To answer detailed questions like this, I need access to your documentation or knowledge base.",
        suggestions: [
          { type: 'knowledge', label: '+ Upload Documentation', data: 'docs' },
          { type: 'knowledge', label: '+ Add FAQ Content', data: 'faq' }
        ],
        suggestionPrompt: 'Add knowledge:'
      }
    }
  }

  // Check for complex workflow needs
  if (lowerMessage.includes('if') && lowerMessage.includes('then') || lowerMessage.includes('when') || lowerMessage.includes('multi-step')) {
    return {
      content: "This sounds like it might need a custom conversation flow. You can create specific paths for different scenarios using the visual workflow builder.",
      suggestions: [
        { type: 'workflow', label: 'Open Visual Builder', data: 'complex-flow' }
      ],
      suggestionPrompt: 'Create custom flow:'
    }
  }

  // General queries
  if (lowerMessage.includes('help') || lowerMessage.includes('can you')) {
    return {
      content: `I can help you with: ${userIntent.value}\n\nFeel free to ask me specific questions, and I'll let you know if I need additional capabilities!`,
      suggestions: [],
      suggestionPrompt: ''
    }
  }

  if (lowerMessage.includes('hours') || lowerMessage.includes('open')) {
    if (buildMethod.value === 'questions' && configData.value.questions?.hours) {
      return {
        content: `We're open ${configData.value.questions.hours}`,
        suggestions: [],
        suggestionPrompt: ''
      }
    }
    return {
      content: "I'd be happy to share our hours! You can add this information to help me answer better.",
      suggestions: [
        { type: 'knowledge', label: '+ Add Business Hours', data: 'hours' }
      ],
      suggestionPrompt: 'Add information:'
    }
  }

  // Default response
  return {
    content: "That's a great question! I'm still learning. You can make me smarter by adding knowledge, integrations, or custom workflows.",
    suggestions: [
      { type: 'knowledge', label: '+ Add Knowledge', data: 'general' },
      { type: 'integration', label: '+ Add Integration', data: 'general' }
    ],
    suggestionPrompt: 'Enhance my capabilities:'
  }
}

function resetChat() {
  testMessages.value = []
  userMessage.value = ''
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

function goBack() {
  // Route back to appropriate builder based on method
  if (buildMethod.value === 'workflow') {
    router.push('/visual-workflow')
  } else {
    router.push('/onboarding-v2')
  }
}

function continueConfiguration() {
  // Save current configuration data before showing animation
  const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')

  // Update build data with current config
  buildData.finalConfig = {
    questions: configData.value.questions,
    knowledge: configData.value.knowledge,
    workflow: configData.value.workflow,
    integrations: configData.value.integrations,
    method: buildMethod.value
  }

  localStorage.setItem('daart-building-agent', JSON.stringify(buildData))

  // Navigate to animation screen which will create the agent and redirect to home
  router.push('/agent-setup-animation')
}

// Handle suggestion button clicks
function handleSuggestion(suggestion) {
  if (suggestion.type === 'knowledge') {
    addKnowledgeContext.value = `Adding ${suggestion.data} information will help me answer questions better.`
    showAddKnowledgeModal.value = true
  } else if (suggestion.type === 'integration') {
    addIntegrationContext.value = `Connect an integration to enable ${suggestion.data} capabilities.`
    showAddIntegrationModal.value = true
  } else if (suggestion.type === 'workflow') {
    visualBuilderContext.value = `This requires a custom conversation flow.`
    showVisualBuilderModal.value = true
  }
}

// Knowledge modal handlers
function handleFileUpload(event) {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    const newKnowledge = {
      id: Date.now() + Math.random(),
      name: file.name,
      type: 'Document',
      size: file.size,
      status: 'ready'
    }

    if (!configData.value.knowledge) {
      configData.value.knowledge = []
    }
    configData.value.knowledge.push(newKnowledge)
  })

  // Update localStorage
  updateBuildData()
  showAddKnowledgeModal.value = false

  // Reload config
  loadBuildData()
}

function addTextKnowledge() {
  if (!newKnowledgeText.value.trim()) return

  const newKnowledge = {
    id: Date.now(),
    name: `Text snippet ${(configData.value.knowledge?.length || 0) + 1}`,
    type: 'Text Content',
    content: newKnowledgeText.value.trim()
  }

  if (!configData.value.knowledge) {
    configData.value.knowledge = []
  }
  configData.value.knowledge.push(newKnowledge)

  newKnowledgeText.value = ''
  updateBuildData()
  showAddKnowledgeModal.value = false
  loadBuildData()
}

function addWebsiteKnowledge() {
  if (!newKnowledgeUrl.value.trim()) return

  const newKnowledge = {
    id: Date.now(),
    name: newKnowledgeUrl.value.trim(),
    type: 'Website',
    url: newKnowledgeUrl.value.trim()
  }

  if (!configData.value.knowledge) {
    configData.value.knowledge = []
  }
  configData.value.knowledge.push(newKnowledge)

  newKnowledgeUrl.value = ''
  updateBuildData()
  showAddKnowledgeModal.value = false
  loadBuildData()
}

// Integration modal handlers
function connectIntegration(integration) {
  const newIntegration = {
    type: integration.type,
    name: integration.name,
    provider: integration.name,
    status: 'connected'
  }

  if (!configData.value.integrations) {
    configData.value.integrations = []
  }
  configData.value.integrations.push(newIntegration)

  updateBuildData()
  showAddIntegrationModal.value = false
  loadBuildData()
}

// Visual builder handler
function openVisualBuilder() {
  updateBuildData()
  router.push('/visual-workflow')
}

// Update localStorage with current config
function updateBuildData() {
  const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')

  if (buildMethod.value === 'questions') {
    buildData.questions = configData.value.questions
  } else if (buildMethod.value === 'knowledge') {
    buildData.knowledge = configData.value.knowledge
  } else if (buildMethod.value === 'workflow') {
    buildData.workflow = configData.value.workflow
  }

  buildData.integrations = configData.value.integrations

  localStorage.setItem('daart-building-agent', JSON.stringify(buildData))
}

function formatKey(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

function formatIntegration(integration) {
  return `${integration.provider || ''} ${integration.type}`.trim()
}

function getNodeIcon(type) {
  const icons = {
    start: '▶',
    question: '❓',
    branch: '🔀',
    action: '⚡',
    end: '🏁'
  }
  return icons[type] || '●'
}
</script>

<style scoped>
.agent-test-view {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  overflow: hidden;
}

/* Header */
.test-header {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 32px;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-btn {
  padding: 8px 16px;
  background: transparent;
  color: #666;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f8f8f8;
  color: #000;
  border-color: #000;
}

.intent-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.intent-label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.intent-text {
  font-size: 14px;
  color: #000;
  font-weight: 500;
  margin: 0;
}

.continue-btn {
  padding: 10px 20px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.continue-btn:hover {
  background: #333;
}

/* Main Content */
.test-content {
  flex: 1;
  display: grid;
  grid-template-columns: 400px 1fr;
  overflow: hidden;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

/* Config Panel */
.config-panel {
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.edit-config-btn,
.reset-btn {
  padding: 6px 12px;
  background: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-config-btn:hover,
.reset-btn:hover {
  background: #f8f8f8;
  border-color: #000;
  color: #000;
}

.config-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.config-section {
  margin-bottom: 32px;
}

.config-section h3 {
  font-size: 15px;
  font-weight: 600;
  color: #000;
  margin: 0 0 16px 0;
}

.config-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.config-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
}

.config-value {
  font-size: 14px;
  color: #000;
}

.knowledge-list,
.integrations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.knowledge-item,
.integration-item {
  padding: 12px;
  background: #f8f8f8;
  border-radius: 6px;
}

.knowledge-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.knowledge-name,
.integration-name {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin: 0 0 4px 0;
}

.knowledge-type {
  font-size: 12px;
  color: #666;
  margin: 0;
}

.workflow-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.workflow-node {
  padding: 12px;
  background: #f8f8f8;
  border-radius: 6px;
}

.workflow-node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.node-icon {
  font-size: 16px;
}

.node-title {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.node-content {
  font-size: 13px;
  color: #666;
  margin: 0 0 8px 0;
}

.node-branches {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.branch-tag {
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
}

.empty-state {
  font-size: 14px;
  color: #999;
  font-style: italic;
  margin: 0;
}

/* Chat Panel */
.chat-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

.agent-intro {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.agent-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.agent-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.agent-info p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.suggested-questions {
  padding: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.suggestions-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin: 0 0 12px 0;
}

.suggestion-btn {
  display: block;
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #f8f8f8;
  color: #000;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-btn:hover {
  background: #000;
  color: #fff;
  border-color: #000;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-message {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.chat-message.user {
  background: #000;
  color: #fff;
  align-self: flex-end;
}

.chat-message.assistant {
  background: #f0f0f0;
  color: #000;
  align-self: flex-start;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-6px);
  }
}

.chat-input-area {
  padding: 20px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: #fff;
}

.chat-input-area textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  transition: border-color 0.2s;
}

.chat-input-area textarea:focus {
  outline: none;
  border-color: #000;
}

.send-btn {
  padding: 12px 24px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #333;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Message Suggestions */
.message-suggestions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.suggestion-prompt {
  font-size: 12px;
  color: #666;
  margin: 0 0 8px 0;
  font-weight: 500;
}

.action-suggestion-btn {
  display: inline-block;
  padding: 8px 14px;
  margin: 0 8px 8px 0;
  background: #fff;
  color: #000;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-suggestion-btn:hover {
  background: #000;
  color: #fff;
  border-color: #000;
}

/* Modal Styles */
.modal-overlay {
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
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content.small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 28px;
  color: #666;
  cursor: pointer;
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

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.modal-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #000;
  color: #fff;
}

.btn-primary:hover {
  background: #333;
}

.btn-secondary {
  background: #f8f8f8;
  color: #000;
  border: 1px solid #e0e0e0;
}

.btn-secondary:hover {
  background: #e8e8e8;
}

/* Knowledge Options */
.knowledge-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.knowledge-option {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-label {
  font-size: 13px;
  font-weight: 600;
  color: #000;
}

.knowledge-option input[type="file"],
.knowledge-option input[type="url"] {
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.knowledge-option textarea {
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
}

.add-btn {
  align-self: flex-start;
  padding: 8px 16px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover:not(:disabled) {
  background: #333;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Integration Grid */
.integration-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.integration-card {
  padding: 16px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.integration-card:hover {
  border-color: #000;
  background: #fafafa;
}

.integration-card .integration-name {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin: 0;
}

@media (max-width: 1024px) {
  .test-content {
    grid-template-columns: 1fr;
  }

  .config-panel {
    display: none;
  }

  .integration-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .integration-grid {
    grid-template-columns: 1fr;
  }
}
</style>
