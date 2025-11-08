<template>
  <div class="conversational-builder">
    <!-- Mode Toggle -->
    <div class="builder-header">
      <div class="mode-toggle">
        <button
          :class="{ active: mode === 'build' }"
          @click="mode = 'build'"
        >
          Build with AI
        </button>
        <button
          :class="{ active: mode === 'test' }"
          @click="mode = 'test'"
        >
          Test Agent
        </button>
      </div>
    </div>

    <!-- Chat Messages -->
    <div ref="messagesContainer" class="chat-messages">
      <div v-for="msg in messages" :key="msg.id" class="message" :class="msg.role">
        <div class="message-avatar">
          {{ msg.role === 'user' ? 'You' : 'AI' }}
        </div>
        <div class="message-bubble">
          <div class="message-content">{{ msg.content }}</div>

          <!-- Action Buttons -->
          <div v-if="msg.actions && msg.actions.length > 0" class="message-actions">
            <button
              v-for="action in msg.actions"
              :key="action.id"
              class="action-btn"
              @click="handleAction(action)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Typing Indicator -->
      <div v-if="isTyping" class="message assistant">
        <div class="message-avatar">AI</div>
        <div class="message-bubble">
          <div class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="chat-input-area">
      <textarea
        v-model="userInput"
        :placeholder="mode === 'build' ? 'Describe what you want to build...' : 'Test your agent...'"
        rows="2"
        @keydown.enter.prevent="sendMessage"
      ></textarea>
      <button
        class="send-btn"
        :disabled="!userInput.trim()"
        @click="sendMessage"
      >
        Send
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  agentConfig: Object,
  selectedMethod: String,
  userIntent: String
})

const emit = defineEmits(['update-config', 'add-integration'])

const mode = ref('build')
const userInput = ref('')
const isTyping = ref(false)
const messages = ref([])
const messagesContainer = ref(null)

onMounted(() => {
  // Initial welcome message
  if (!props.selectedMethod) {
    addMessage('assistant', 'Hi! I\'m here to help you build your agent. Choose how you\'d like to get started on the left, and I\'ll guide you through the process.')
  }
})

watch(() => props.selectedMethod, (newMethod) => {
  if (newMethod) {
    handleMethodSelected(newMethod)
  }
})

watch(() => props.userIntent, (newIntent) => {
  if (newIntent && messages.value.length === 1) {
    addMessage('assistant', `Great! I see you want to: "${newIntent}". Let's build this together!`)
  }
})

function handleMethodSelected(method) {
  messages.value = [] // Clear previous messages

  const methodMessages = {
    questions: `Perfect! I'll help you build your agent by asking a few questions about your business. Let's start:\n\nWhat's your business name?`,
    knowledge: `Great choice! I'll help you connect knowledge sources to your agent. You can:\n\n• Upload documents (PDF, DOCX, TXT)\n• Connect your website\n• Add text content manually\n\nWhat would you like to start with?`,
    workflow: `Awesome! Let's build your agent's workflow together. Based on your intent, I can help you create:\n\n• Conversation flows\n• Integration points\n• Response logic\n\nTell me what specific behavior you want to build, and I'll help structure it.`
  }

  addMessage('assistant', methodMessages[method] || 'How can I help you build your agent?')
}

function addMessage(role, content, actions = null) {
  messages.value.push({
    id: Date.now() + Math.random(),
    role,
    content,
    actions,
    timestamp: new Date()
  })

  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

async function sendMessage() {
  if (!userInput.value.trim()) return

  const userMessage = userInput.value.trim()
  addMessage('user', userMessage)
  userInput.value = ''

  // Simulate AI thinking
  isTyping.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  isTyping.value = false

  // Generate response based on context
  generateResponse(userMessage)
}

function generateResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase()

  // Contextual responses based on selected method and message content
  if (props.selectedMethod === 'questions') {
    handleQuestionsResponse(lowerMessage)
  } else if (props.selectedMethod === 'knowledge') {
    handleKnowledgeResponse(lowerMessage)
  } else if (props.selectedMethod === 'workflow') {
    handleWorkflowResponse(lowerMessage)
  } else {
    // Generic responses for testing mode
    handleTestResponse(lowerMessage)
  }
}

function handleQuestionsResponse(message) {
  // Simple question flow simulation
  if (messages.value.length === 2) {
    addMessage('assistant', 'Great! What hours is your business open?')
  } else if (messages.value.length === 4) {
    addMessage('assistant', 'Perfect! Do you need calendar integration for bookings?', [
      { id: 'yes-calendar', type: 'connect-calendar', label: 'Yes, connect calendar' },
      { id: 'no-calendar', type: 'skip', label: 'Not right now' }
    ])
  } else {
    addMessage('assistant', `Got it! Let's test your agent. Try asking: "When are you open?"`)
    mode.value = 'test'
  }
}

function handleKnowledgeResponse(message) {
  if (message.includes('upload') || message.includes('document')) {
    addMessage('assistant', 'Great! I can help you upload documents. What type of content do you have?', [
      { id: 'upload-docs', type: 'upload-files', label: 'Upload PDF/DOCX' },
      { id: 'add-website', type: 'add-website', label: 'Connect website' }
    ])
  } else if (message.includes('website')) {
    addMessage('assistant', 'Perfect! What\'s your website URL? I\'ll crawl it to learn about your business.')
  } else {
    addMessage('assistant', 'I can help with that! Would you like to upload files or connect a website?')
  }
}

function handleWorkflowResponse(message) {
  if (message.includes('appointment') || message.includes('booking')) {
    addMessage('assistant', `I'll create a booking workflow for you. This will include:

• Verify customer identity
• Check calendar availability
• Confirm booking

Should I also add cancellation and rescheduling flows?`, [
      { id: 'add-full-workflow', type: 'create-workflow', label: 'Yes, add all flows' },
      { id: 'basic-only', type: 'create-workflow', label: 'Just booking for now' }
    ])
  } else {
    addMessage('assistant', 'I can help you build custom workflows. What specific actions should your agent handle?')
  }
}

function handleTestResponse(message) {
  // Testing mode responses
  if (message.includes('when') && message.includes('open')) {
    addMessage('assistant', 'Based on your configuration, I\'d respond: "We\'re open Monday through Friday, 9am to 5pm."')
  } else if (message.includes('book') || message.includes('appointment')) {
    addMessage('assistant', 'I need access to your calendar to check availability. Should I connect Google Calendar?', [
      { id: 'connect-gcal', type: 'connect-calendar', label: 'Connect Google Calendar' },
      { id: 'manual-availability', type: 'manual-setup', label: 'Set availability manually' }
    ])
  } else if (message.includes('price') || message.includes('cost')) {
    addMessage('assistant', 'I don\'t have pricing information yet. Would you like to add that to my knowledge base?', [
      { id: 'add-pricing', type: 'upload-knowledge', label: 'Add pricing info' }
    ])
  } else {
    addMessage('assistant', `I understand you're asking about: "${message}". I'm still learning! Try adding more information or ask something specific about your business.`)
  }
}

function handleAction(action) {
  addMessage('user', `[Selected: ${action.label}]`)

  switch (action.type) {
    case 'connect-calendar':
      setTimeout(() => {
        addMessage('assistant', '✓ Calendar connected! I can now check your availability. Try asking "When is my next appointment?"')
        emit('add-integration', { type: 'calendar', provider: 'google' })
      }, 500)
      break

    case 'upload-files':
      addMessage('assistant', 'You can upload files from the left panel. I\'ll let you know once I\'ve processed them!')
      emit('update-config', { showUpload: true })
      break

    case 'add-website':
      addMessage('assistant', 'What\'s your website URL? I\'ll crawl it to learn about your business.')
      break

    case 'create-workflow':
      addMessage('assistant', '✓ Workflow created! You can see the structure in the left panel. Let\'s test it - try saying "I want to book an appointment"')
      emit('update-config', { workflowCreated: true })
      break

    case 'upload-knowledge':
      addMessage('assistant', 'Let\'s add that information. You can upload a document or type it directly. What works better for you?')
      break
  }
}
</script>

<style scoped>
.conversational-builder {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f8f8;
}

/* Header with Mode Toggle */
.builder-header {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.mode-toggle {
  display: flex;
  gap: 8px;
}

.mode-toggle button {
  padding: 8px 16px;
  background: transparent;
  color: #666;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-toggle button.active {
  background: #f0f0f0;
  color: #000;
}

.mode-toggle button:hover {
  background: #f8f8f8;
}

/* Chat Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

.message.user .message-avatar {
  background: #000;
  color: #fff;
}

.message-bubble {
  max-width: 70%;
  background: #fff;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message.user .message-bubble {
  background: #000;
  color: #fff;
}

.message-content {
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.message-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.action-btn {
  padding: 10px 16px;
  background: #f0f0f0;
  color: #000;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.action-btn:hover {
  background: #000;
  color: #fff;
  border-color: #000;
}

/* Typing Indicator */
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
    transform: translateY(-8px);
  }
}

/* Input Area */
.chat-input-area {
  padding: 16px 24px;
  background: #fff;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  align-items: flex-end;
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

@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }

  .chat-messages {
    padding: 16px;
  }
}
</style>
