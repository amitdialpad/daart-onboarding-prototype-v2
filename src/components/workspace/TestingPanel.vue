<template>
  <div class="testing-panel">
    <!-- Channel Tabs (for omnichannel agents with multiple channels) -->
    <div v-if="hasMultipleChannels" class="channel-tabs">
      <button
        class="channel-tab"
        :class="{ active: activeTestingTab === 'chat' }"
        @click="activeTestingTab = 'chat'">
        Web Chat
      </button>
      <button
        class="channel-tab"
        :class="{ active: activeTestingTab === 'voice' }"
        @click="activeTestingTab = 'voice'">
        Voice Call
      </button>
    </div>

    <!-- Digital Agent Testing (Chat/SMS) -->
    <div v-if="showChatTesting" class="test-content">
      <div class="test-content-header">
        <span>{{ props.agent.status === 'live' ? 'Live Conversation Monitor' : 'Digital Agent Testing' }}</span>
        <button class="btn-icon" @click="clearMessages">Clear</button>
      </div>

      <!-- Active Channels Bar -->
      <div v-if="activeChannels.length > 0" class="active-channels-bar">
        <span class="channels-label">Active Channels:</span>
        <span v-for="channel in activeChannels" :key="channel" class="channel-badge">
          {{ channel }}
        </span>
      </div>

      <!-- Test Messages -->
      <div class="test-messages" ref="messagesContainer">
        <div v-for="(msg, index) in testMessages" :key="index" class="test-message" :class="msg.type">
          <div class="message-content">{{ msg.text }}</div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="test-message agent typing-indicator">
          <div class="message-content">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>

      <!-- Test Suggestions -->
      <div v-if="testSuggestions.length > 0" class="test-suggestions">
        <button v-for="(suggestion, index) in testSuggestions.slice(0, 5)"
                :key="index"
                class="suggestion-chip"
                @click="sendTestMessage(suggestion)">
          {{ suggestion }}
        </button>
      </div>

      <!-- Test Input -->
      <div class="test-input-area">
        <input
          v-model="testInput"
          @keyup.enter="sendTest"
          type="text"
          class="test-input"
          placeholder="Type a test message...">
        <button class="btn-send" @click="sendTest" :disabled="!testInput.trim() || isSending">
          {{ isSending ? '...' : 'Send' }}
        </button>
      </div>
    </div>

    <!-- Voice Agent Testing -->
    <div v-if="showVoiceTesting" class="test-content">
      <div class="voice-test-panel">
        <!-- Voice Call Status -->
        <div class="voice-test-status">
          <div class="voice-status-indicator" :class="voiceStatus">
            <div class="status-dot"></div>
            <span>{{ voiceStatusText }}</span>
          </div>
        </div>

        <!-- Test Info -->
        <div class="voice-test-info">
          <div class="info-row">
            <span class="info-label">Test Number:</span>
            <span class="info-value">{{ testPhoneNumber }}</span>
          </div>
          <div v-if="callDuration > 0" class="info-row">
            <span class="info-label">Duration:</span>
            <span class="info-value">{{ formattedCallDuration }}</span>
          </div>
        </div>

        <!-- Call Actions -->
        <div class="voice-test-actions">
          <button
            v-if="voiceStatus === 'idle'"
            class="btn-primary btn-full"
            @click="startTestCall">
            Start Test Call
          </button>
          <button
            v-else-if="voiceStatus === 'connecting'"
            class="btn-secondary btn-full"
            disabled>
            Connecting<span class="dots">...</span>
          </button>
          <button
            v-else-if="voiceStatus === 'connected'"
            class="btn-danger btn-full"
            @click="endTestCall">
            End Call
          </button>
        </div>

        <!-- Live Transcript -->
        <div class="voice-transcript">
          <div class="transcript-header">Live Transcript</div>
          <div class="transcript-messages" ref="transcriptContainer">
            <div v-if="transcriptMessages.length === 0" class="no-transcript">
              Start a test call to see the transcript
            </div>
            <div v-for="(msg, index) in transcriptMessages" :key="index" class="transcript-message">
              <div class="transcript-speaker">{{ msg.speaker }}</div>
              <div class="transcript-text">{{ msg.text }}</div>
              <div class="transcript-time">{{ msg.time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  agent: {
    type: Object,
    required: true
  }
})

// Active testing tab (for omnichannel agents)
const activeTestingTab = ref('chat')

// Determine agent type - support both old and new data models
const agentType = computed(() => {
  // Old model: agentType property
  if (props.agent.agentType) return props.agent.agentType

  // New omnichannel model: check channels object
  if (props.agent.channels) {
    // If voice is enabled, show voice interface
    if (props.agent.channels.voice?.enabled) return 'phone'
    // Otherwise default to chat (webChat is enabled by default)
    return 'chat'
  }

  // Fallback to chat
  return 'chat'
})

// Check if agent has multiple testing channels
const hasMultipleChannels = computed(() => {
  if (!props.agent.channels) return false
  const webChatEnabled = props.agent.channels.webChat?.enabled !== false // enabled by default
  const voiceEnabled = props.agent.channels.voice?.enabled === true
  return webChatEnabled && voiceEnabled
})

// Determine which testing interfaces to show
const showChatTesting = computed(() => {
  // Old model
  if (props.agent.agentType === 'chat') return true

  // New omnichannel model
  if (props.agent.channels) {
    if (hasMultipleChannels.value) {
      return activeTestingTab.value === 'chat'
    }
    return props.agent.channels.webChat?.enabled !== false
  }

  return false
})

const showVoiceTesting = computed(() => {
  // Old model
  if (props.agent.agentType === 'phone') return true

  // New omnichannel model
  if (props.agent.channels) {
    if (hasMultipleChannels.value) {
      return activeTestingTab.value === 'voice'
    }
    return props.agent.channels.voice?.enabled === true
  }

  return false
})

// Active channels
const activeChannels = computed(() => {
  if (agentType.value !== 'chat') return []
  const channels = ['Web Chat']

  // Check both old and new data models for SMS
  const smsEnabled = props.agent.smsEnabled || props.agent.channels?.sms?.enabled
  if (smsEnabled) channels.push('SMS')

  return channels
})

// Digital testing state
const testMessages = ref([])
const testInput = ref('')
const isTyping = ref(false)
const isSending = ref(false)
const messagesContainer = ref(null)

// Test suggestions based on agent config
const testSuggestions = computed(() => {
  const suggestions = []

  // Add suggestions based on knowledge base
  if (props.agent.knowledgeBase && props.agent.knowledgeBase.length > 50) {
    suggestions.push('Tell me about your services')
    suggestions.push('What are your hours?')
  }

  // Add suggestions based on skills
  if (props.agent.skills && props.agent.skills.length > 0) {
    suggestions.push('Can you help me with my order?')
    suggestions.push('I need technical support')
  }

  // Default suggestions
  if (suggestions.length === 0) {
    suggestions.push('Hello', 'How can you help me?', 'What can you do?')
  }

  return suggestions
})

// Voice testing state
const voiceStatus = ref('idle') // idle, connecting, connected, ended
const testPhoneNumber = ref('+1 (555) 000-0000')
const callDuration = ref(0)
const transcriptMessages = ref([])
const transcriptContainer = ref(null)
let callTimer = null

const voiceStatusText = computed(() => {
  switch (voiceStatus.value) {
    case 'idle': return 'Ready to Test'
    case 'connecting': return 'Connecting...'
    case 'connected': return 'Call Active'
    case 'ended': return 'Call Ended'
    default: return 'Ready to Test'
  }
})

const formattedCallDuration = computed(() => {
  const minutes = Math.floor(callDuration.value / 60)
  const seconds = callDuration.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

// Methods
function sendTest() {
  if (!testInput.value.trim() || isSending.value) return
  sendTestMessage(testInput.value)
  testInput.value = ''
}

function sendTestMessage(message) {
  // Add user message
  testMessages.value.push({
    type: 'user',
    text: message
  })

  // Scroll to bottom
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })

  // Show typing indicator
  isTyping.value = true
  isSending.value = true

  // Simulate agent response
  setTimeout(() => {
    isTyping.value = false

    // Generate response based on agent instructions
    let response = getSimulatedResponse(message)

    testMessages.value.push({
      type: 'agent',
      text: response
    })

    isSending.value = false

    // Scroll to bottom
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })
  }, 1500)
}

function getSimulatedResponse(userMessage) {
  const lowerMsg = userMessage.toLowerCase()

  // Check instructions for custom responses
  const instructions = props.agent.instructions || ''

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
    return props.agent.welcomeMessage || 'Hello! How can I help you today?'
  }

  if (lowerMsg.includes('hours') || lowerMsg.includes('open')) {
    return "We're open Monday through Friday, 9 AM to 5 PM. How can I assist you?"
  }

  if (lowerMsg.includes('help') || lowerMsg.includes('support')) {
    return "I'm here to help! I can answer questions about our products and services. What would you like to know?"
  }

  // Default response
  return "Thanks for your message. Based on my configuration, I can assist you with various inquiries. What would you like to know more about?"
}

function clearMessages() {
  testMessages.value = []
}

// Voice testing methods
function startTestCall() {
  voiceStatus.value = 'connecting'

  // Simulate connection
  setTimeout(() => {
    voiceStatus.value = 'connected'
    callDuration.value = 0

    // Start call timer
    callTimer = setInterval(() => {
      callDuration.value++
    }, 1000)

    // Add initial greeting
    const greeting = props.agent.greetingMessage || 'Hello! How can I help you today?'
    transcriptMessages.value.push({
      speaker: 'Agent',
      text: greeting,
      time: '00:00'
    })

    // Simulate conversation
    simulateVoiceConversation()
  }, 2000)
}

function endTestCall() {
  voiceStatus.value = 'ended'
  if (callTimer) {
    clearInterval(callTimer)
    callTimer = null
  }

  // Reset after 2 seconds
  setTimeout(() => {
    voiceStatus.value = 'idle'
  }, 2000)
}

function simulateVoiceConversation() {
  // Add user message after 3 seconds
  setTimeout(() => {
    if (voiceStatus.value === 'connected') {
      transcriptMessages.value.push({
        speaker: 'You',
        text: 'Hi, I need help with my account.',
        time: formatTime(callDuration.value)
      })

      nextTick(() => {
        if (transcriptContainer.value) {
          transcriptContainer.value.scrollTop = transcriptContainer.value.scrollHeight
        }
      })
    }
  }, 3000)

  // Add agent response after 5 seconds
  setTimeout(() => {
    if (voiceStatus.value === 'connected') {
      transcriptMessages.value.push({
        speaker: 'Agent',
        text: 'I\'d be happy to help you with your account. What specific issue are you experiencing?',
        time: formatTime(callDuration.value)
      })

      nextTick(() => {
        if (transcriptContainer.value) {
          transcriptContainer.value.scrollTop = transcriptContainer.value.scrollHeight
        }
      })
    }
  }, 5000)
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Watch for agent changes to update test phone number
watch(() => props.agent.phoneNumber, (newVal) => {
  if (newVal) {
    testPhoneNumber.value = newVal
  }
}, { immediate: true })
</script>

<style scoped>
.testing-panel {
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  height: 600px;
  background: #fff;
}

.test-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.test-content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
  font-weight: 600;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
}

.btn-icon:hover {
  color: #000;
}

/* Active Channels */
.active-channels-bar {
  padding: 8px 16px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.channels-label {
  color: #666;
}

.channel-badge {
  background: #e0e0e0;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}

/* Test Messages */
.test-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.test-message {
  max-width: 75%;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
}

.test-message.user {
  align-self: flex-end;
  background: #000;
  color: #fff;
}

.test-message.agent {
  align-self: flex-start;
  background: #f0f0f0;
  color: #000;
}

/* Typing Indicator */
.typing-indicator .message-content {
  display: flex;
  gap: 4px;
  align-items: center;
}

.dot {
  width: 6px;
  height: 6px;
  background: #666;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}

/* Test Suggestions */
.test-suggestions {
  padding: 8px 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-top: 1px solid #ddd;
  background: #fafafa;
}

.suggestion-chip {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  border-color: #000;
  background: #f5f5f5;
}

/* Test Input */
.test-input-area {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #ddd;
  background: #fff;
}

.test-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  font-size: 13px;
}

.test-input:focus {
  outline: none;
  border-color: #000;
}

.btn-send {
  padding: 8px 20px;
  background: #000;
  color: #fff;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-send:hover:not(:disabled) {
  background: #333;
}

.btn-send:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Voice Testing */
.voice-test-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.voice-test-status {
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fafafa;
}

.voice-status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #999;
}

.voice-status-indicator.idle .status-dot {
  background: #999;
}

.voice-status-indicator.connecting .status-dot {
  background: #ff9800;
  animation: pulse 1s infinite;
}

.voice-status-indicator.connected .status-dot {
  background: #4caf50;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.voice-test-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.info-label {
  color: #666;
}

.info-value {
  font-weight: 500;
}

.voice-test-actions {
  display: flex;
  flex-direction: column;
}

.btn-full {
  width: 100%;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #000;
  color: #fff;
}

.btn-primary:hover {
  background: #333;
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.btn-danger {
  background: #f44336;
  color: #fff;
}

.btn-danger:hover {
  background: #d32f2f;
}

/* Voice Transcript */
.voice-transcript {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.transcript-header {
  padding: 10px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  font-size: 13px;
  font-weight: 600;
}

.transcript-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.no-transcript {
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 20px;
}

.transcript-message {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.transcript-message:last-child {
  border-bottom: none;
}

.transcript-speaker {
  font-size: 12px;
  font-weight: 600;
  color: #333;
}

.transcript-text {
  font-size: 13px;
  line-height: 1.5;
  color: #000;
}

.transcript-time {
  font-size: 11px;
  color: #999;
}

.dots {
  display: inline-block;
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%, 20% {
    content: '.';
  }
  40% {
    content: '..';
  }
  60%, 100% {
    content: '...';
  }
}

/* Channel Tabs */
.channel-tabs {
  display: flex;
  gap: 8px;
  padding: 16px 20px 0 20px;
  border-bottom: 2px solid #e0e0e0;
  background: #fafafa;
}

.channel-tab {
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.channel-tab:hover {
  color: #000;
  background: #f0f0f0;
  border-radius: 6px 6px 0 0;
}

.channel-tab.active {
  color: #000;
  border-bottom-color: #000;
  font-weight: 600;
  background: #fff;
  border-radius: 6px 6px 0 0;
}
</style>
