<template>
  <div class="onboarding-dynamic">
    <!-- Step 1: Intent Capture -->
    <div v-if="currentStep === 'intent'" class="intent-screen">
      <div class="intent-container">
        <h1>Choose your agent's purpose</h1>
        <p class="subtitle">Describe what you need</p>

        <textarea
          v-model="userIntent"
          placeholder="Describe what you want your agent to do. For example: 'Answer calls for my dental office, check appointment availability, and book patients into our calendar system'"
          rows="8"
          class="intent-input"
          @input="intentError = ''"
        ></textarea>

        <p v-if="intentError" class="error-message">{{ intentError }}</p>

        <div class="intent-footer">
          <button class="btn-primary" @click="analyzeIntent" :disabled="!userIntent.trim()">
            Continue
          </button>
        </div>

        <div class="examples">
          <p class="examples-label">Examples:</p>
          <ul>
            <li>"Answer customer questions about our software products and pricing"</li>
            <li>"Book appointments for my dental practice and send reminders"</li>
            <li>"Help customers track orders and process returns"</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Step 2: Choice (Questions or Knowledge) -->
    <div v-if="currentStep === 'choice'" class="choice-screen">
      <div class="choice-container">
        <h2>Great! Let's get some details</h2>
        <p class="subtitle">How would you like to proceed?</p>

        <div class="choice-cards">
          <div class="choice-card" @click="chooseQuestionsPath">
            <h3>Answer a few questions</h3>
            <p>We'll ask 5-6 targeted questions to configure your agent properly.</p>
            <p class="choice-time">Takes 2-3 minutes</p>
            <button class="btn-choice">Answer Questions</button>
          </div>

          <div class="choice-card" @click="chooseKnowledgePath">
            <h3>Upload your knowledge</h3>
            <p>Upload docs, links, or text. We'll extract the details we need automatically.</p>
            <p class="choice-time">Takes 1 minute</p>
            <button class="btn-choice">Upload Knowledge</button>
          </div>
        </div>

        <div class="choice-footer">
          <button class="btn-secondary" @click="goBackToIntent">Back</button>
        </div>
      </div>
    </div>

    <!-- Step 3a: Questions Path -->
    <div v-if="currentStep === 'questions'" class="questions-screen">
      <div class="questions-container">
        <!-- Show user's intent -->
        <div v-if="userIntent" class="intent-context">
          <p class="intent-label">Building agent for:</p>
          <p class="intent-text">{{ userIntent }}</p>
        </div>

        <h2>Answer a few questions</h2>
        <p class="subtitle">{{ questionsIntro }}</p>

        <div class="questions-list">
          <div v-for="(question, index) in clarifyingQuestions" :key="index" class="question-item">
            <label :for="'q' + index">{{ question.question }}</label>
            <p v-if="question.hint" class="question-hint">{{ question.hint }}</p>

            <!-- Text input -->
            <input
              v-if="question.type === 'text'"
              :id="'q' + index"
              v-model="answers[question.id]"
              type="text"
              :placeholder="question.placeholder"
              class="question-input"
            />

            <!-- Textarea -->
            <textarea
              v-if="question.type === 'textarea'"
              :id="'q' + index"
              v-model="answers[question.id]"
              :placeholder="question.placeholder"
              rows="4"
              class="question-textarea"
            ></textarea>

            <!-- Select dropdown -->
            <select
              v-if="question.type === 'select'"
              :id="'q' + index"
              v-model="answers[question.id]"
              class="question-select"
            >
              <option value="">Select an option</option>
              <option v-for="opt in question.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
          </div>
        </div>

        <div class="questions-footer">
          <button class="btn-secondary" @click="goBackToChoice">Back</button>
          <button class="btn-primary" @click="proceedToTest">
            Continue to Test
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3b: Knowledge Upload Path -->
    <div v-if="currentStep === 'knowledge'" class="knowledge-screen">
      <div class="knowledge-container">
        <!-- Show user's intent -->
        <div v-if="userIntent" class="intent-context">
          <p class="intent-label">Building agent for:</p>
          <p class="intent-text">{{ userIntent }}</p>
        </div>

        <h2>Connect your knowledge sources</h2>
        <p class="subtitle">Add your company knowledge from files, platforms, or websites</p>

        <!-- Upload Tabs -->
        <div class="upload-tabs">
          <button
            :class="{ active: activeTab === 'integrations' }"
            @click="activeTab = 'integrations'">
            Connect Platforms
          </button>
          <button
            :class="{ active: activeTab === 'upload' }"
            @click="activeTab = 'upload'">
            Upload Files
          </button>
          <button
            :class="{ active: activeTab === 'url' }"
            @click="activeTab = 'url'">
            Add Website
          </button>
          <button
            :class="{ active: activeTab === 'paste' }"
            @click="activeTab = 'paste'">
            Paste Text
          </button>
          <button
            :class="{ active: activeTab === 'conversations' }"
            @click="activeTab = 'conversations'">
            Import Conversations
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Connect Platforms Tab -->
          <div v-if="activeTab === 'integrations'" class="integrations-tab">
            <p class="tab-description">Connect to your existing knowledge platforms (OAuth sync)</p>

            <div class="integrations-grid">
              <button
                v-for="integration in availableIntegrations"
                :key="integration.id"
                class="integration-card"
                @click="connectIntegration(integration.id)">
                <span class="integration-name">{{ integration.name }}</span>
                <span class="integration-status">{{ integration.status }}</span>
              </button>
            </div>

            <!-- Connected Integrations List -->
            <div v-if="connectedIntegrations.length > 0" class="connected-section">
              <h4>Connected Sources</h4>
              <div class="connected-list">
                <div v-for="conn in connectedIntegrations" :key="conn.id" class="connected-item">
                  <div class="connected-info">
                    <div class="connected-name">{{ conn.name }}</div>
                    <div class="connected-meta">{{ conn.itemCount }} items synced</div>
                  </div>
                  <button class="btn-remove" @click="disconnectIntegration(conn.id)">Disconnect</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Upload Files Tab -->
          <div v-if="activeTab === 'upload'" class="upload-tab">
            <p class="tab-description">Upload PDFs, Word docs, spreadsheets, and more</p>

            <input
              ref="fileInput"
              type="file"
              @change="handleFileUpload"
              accept=".pdf,.docx,.txt,.csv,.xlsx,.pptx"
              multiple
              style="display: none">
            <button class="btn-upload" @click="$refs.fileInput.click()">
              Choose Files
            </button>
            <p class="hint">PDF, Word, Excel, PowerPoint, Text, CSV - Max 10MB per file</p>

            <!-- File List -->
            <div v-if="uploadedFiles.length > 0" class="file-list">
              <div v-for="file in uploadedFiles" :key="file.id" class="file-item">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-status">{{ file.status }}</span>
                <button class="btn-remove" @click="removeFile(file.id)">Remove</button>
              </div>
            </div>
          </div>

          <!-- Add Website Tab -->
          <div v-if="activeTab === 'url'" class="url-tab">
            <p class="tab-description">Add public websites to crawl and extract content from</p>

            <div class="url-input-group">
              <input
                v-model="websiteUrl"
                type="url"
                placeholder="https://yourcompany.com"
                @keyup.enter="addWebsite">
              <div class="crawl-options">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="crawlSubpages">
                  Auto-crawl subpages (up to 50 pages)
                </label>
              </div>
            </div>
            <button class="btn-add" @click="addWebsite" :disabled="!websiteUrl.trim()">
              Add Website
            </button>
            <p class="hint">We'll extract text from public pages. Supports sitemaps.</p>

            <!-- Websites List -->
            <div v-if="websites.length > 0" class="websites-list">
              <div v-for="site in websites" :key="site.id" class="website-item">
                <span class="website-url">{{ site.url }}</span>
                <span class="website-pages">{{ site.pageCount || 0 }} pages</span>
                <span class="website-status">{{ site.status }}</span>
                <button class="btn-remove" @click="removeWebsite(site.id)">Remove</button>
              </div>
            </div>
          </div>

          <!-- Paste Text Tab -->
          <div v-if="activeTab === 'paste'" class="paste-tab">
            <p class="tab-description">Quickly add text snippets, FAQs, or policies</p>

            <textarea
              v-model="pasteText"
              rows="10"
              placeholder="Paste your FAQ, policies, product information, or any text your agent should know..."
            ></textarea>
            <p class="char-count">{{ pasteText.length }} characters</p>
            <button
              class="btn-add"
              @click="addTextSnippet"
              :disabled="!pasteText.trim()">
              Add to Knowledge
            </button>

            <!-- Text Snippets List -->
            <div v-if="textSnippets.length > 0" class="snippets-list">
              <div v-for="snippet in textSnippets" :key="snippet.id" class="snippet-item">
                <span class="snippet-title">{{ snippet.title }}</span>
                <button class="btn-remove" @click="removeSnippet(snippet.id)">Remove</button>
              </div>
            </div>
          </div>

          <!-- Import Conversations Tab -->
          <div v-if="activeTab === 'conversations'" class="conversations-tab">
            <p class="tab-description">Import past conversations to train your agent</p>

            <div class="conv-upload-section">
              <input
                ref="conversationInput"
                type="file"
                @change="handleConversationUpload"
                accept=".csv,.json"
                style="display: none">
              <button class="btn-upload" @click="$refs.conversationInput.click()">
                Upload Conversation File
              </button>
              <p class="hint">CSV or JSON format - conversation history, chat logs, support tickets</p>
            </div>

            <div class="format-info">
              <h4>Expected CSV format:</h4>
              <pre class="format-example">timestamp,user_message,agent_response
2024-01-01,What are your hours?,We're open 9-5 Mon-Fri
2024-01-02,How do I reset password?,Click forgot password...</pre>
            </div>

            <!-- Conversation Files List -->
            <div v-if="conversationFiles.length > 0" class="conversation-list">
              <div v-for="conv in conversationFiles" :key="conv.id" class="conversation-item">
                <div class="conversation-info">
                  <div class="conversation-name">{{ conv.name }}</div>
                  <div class="conversation-meta">{{ conv.conversationCount }} conversations</div>
                </div>
                <button class="btn-remove" @click="removeConversationFile(conv.id)">Remove</button>
              </div>
            </div>
          </div>
        </div>

        <div class="knowledge-footer">
          <button class="btn-secondary" @click="goBackToChoice">Back</button>
          <button
            class="btn-primary"
            @click="proceedToTest">
            Continue to Test
          </button>
        </div>
      </div>
    </div>

    <!-- Step 4: Chat Test (Hello World) -->
    <div v-if="currentStep === 'test'" class="test-screen">
      <div class="test-container">
        <h2>Your agent is ready to test!</h2>
        <p class="subtitle">Test your agent and tweak the configuration below</p>

        <div class="test-layout">
          <!-- Configuration Panel (Left - Wider) -->
          <div class="config-panel">
            <h3>Configuration</h3>
            <p class="config-subtitle">Edit and save to update your agent</p>

            <!-- Agent Name -->
            <div class="config-section">
              <label class="config-label">Agent Name</label>
              <input
                v-model="editableAgentName"
                type="text"
                class="config-input"
                placeholder="Enter agent name">
            </div>

            <!-- Purpose -->
            <div class="config-section">
              <label class="config-label">Purpose</label>
              <textarea
                v-model="editableIntent"
                rows="3"
                class="config-textarea"
                placeholder="What does your agent do?"></textarea>
            </div>

            <!-- Questions Path: Show Editable Answers -->
            <div v-if="pathTaken === 'questions'" class="config-section">
              <label class="config-label">Your Answers</label>
              <div class="editable-answers">
                <div v-for="question in clarifyingQuestions" :key="question.id" class="answer-item">
                  <label class="answer-label">{{ question.question }}</label>

                  <input
                    v-if="question.type === 'text'"
                    v-model="answers[question.id]"
                    type="text"
                    class="answer-input"
                    :placeholder="question.placeholder">

                  <textarea
                    v-if="question.type === 'textarea'"
                    v-model="answers[question.id]"
                    rows="3"
                    class="answer-textarea"
                    :placeholder="question.placeholder"></textarea>

                  <select
                    v-if="question.type === 'select'"
                    v-model="answers[question.id]"
                    class="answer-select">
                    <option value="">Select an option</option>
                    <option v-for="opt in question.options" :key="opt" :value="opt">{{ opt }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Knowledge Path: Show Knowledge Items -->
            <div v-if="pathTaken === 'knowledge'" class="config-section">
              <label class="config-label">Knowledge Sources</label>
              <div class="knowledge-list">
                <!-- Files -->
                <div v-if="uploadedFiles.length > 0" class="knowledge-group">
                  <p class="knowledge-group-label">Files</p>
                  <div v-for="file in uploadedFiles" :key="file.id" class="knowledge-item">
                    <span class="knowledge-name">{{ file.name }}</span>
                    <button class="btn-remove-small" @click="removeFile(file.id)">Remove</button>
                  </div>
                </div>

                <!-- Snippets -->
                <div v-if="textSnippets.length > 0" class="knowledge-group">
                  <p class="knowledge-group-label">Snippets</p>
                  <div v-for="snippet in textSnippets" :key="snippet.id" class="knowledge-item">
                    <span class="knowledge-name">{{ snippet.title }}</span>
                    <button class="btn-remove-small" @click="removeSnippet(snippet.id)">Remove</button>
                  </div>
                </div>

                <!-- Websites -->
                <div v-if="websites.length > 0" class="knowledge-group">
                  <p class="knowledge-group-label">Websites</p>
                  <div v-for="site in websites" :key="site.id" class="knowledge-item">
                    <span class="knowledge-name">{{ site.url }}</span>
                    <button class="btn-remove-small" @click="removeWebsite(site.id)">Remove</button>
                  </div>
                </div>

                <button class="btn-add-knowledge" @click="addMoreKnowledge">+ Add More Knowledge</button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="config-actions">
              <button
                v-if="hasConfigChanges"
                class="btn-save-changes"
                @click="saveConfigChanges">
                Save Changes & Refresh Agent
              </button>
              <button class="btn-primary" @click="continueConfiguration">
                Set up my agent
              </button>
            </div>
          </div>

          <!-- Chat Interface (Right - Narrower) -->
          <div class="chat-panel">
            <!-- Scrollable Content Area -->
            <div class="chat-content-area" ref="chatContainer">
              <!-- Empty State with Agent Introduction -->
              <div v-if="chatMessages.length === 0" class="agent-introduction">
                <div class="agent-greeting">
                  <span class="greeting-emoji">👋</span>
                  <h3>Hi, I'm {{ generatedPlan.agentName }}</h3>
                  <p class="agent-intro-purpose">{{ userIntent }}</p>
                </div>

                <div class="agent-capabilities">
                  <h4>I can help you with:</h4>
                  <ul>
                    <li v-for="capability in agentCapabilities" :key="capability">{{ capability }}</li>
                  </ul>
                </div>
              </div>

              <!-- Active Chat Messages -->
              <div v-else class="chat-messages">
                <div v-for="msg in chatMessages" :key="msg.id" :class="['chat-message', msg.role]">
                  <div class="message-content">{{ msg.content }}</div>
                </div>
              </div>

              <!-- Suggested Prompts (Always visible) -->
              <div class="suggested-prompts">
                <p class="prompts-label">{{ chatMessages.length === 0 ? 'Try asking:' : 'You can also ask:' }}</p>
                <button
                  v-for="q in dynamicSuggestedQuestions"
                  :key="q"
                  @click="askQuestion(q)"
                  class="prompt-btn">
                  {{ q }}
                </button>
              </div>
            </div>

            <!-- Chat Input (Fixed at bottom) -->
            <div class="chat-input-container">
              <input
                v-model="chatInput"
                type="text"
                placeholder="Ask me anything..."
                @keyup.enter="sendMessage">
              <button @click="sendMessage" :disabled="!chatInput.trim()">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 5: Execution -->
    <div v-if="currentStep === 'execution'" class="execution-screen">
      <div class="execution-container">
        <h2>Setting up your agent...</h2>

        <div class="execution-progress">
          <div v-for="(phase, index) in generatedPlan.phases" :key="index" class="execution-phase">
            <div class="phase-status">
              <span v-if="currentPhaseIndex > index">✓</span>
              <span v-else-if="currentPhaseIndex === index">⋯</span>
              <span v-else>○</span>
            </div>
            <div class="phase-info">
              <h4>{{ phase.name }}</h4>
              <p v-if="currentPhaseIndex === index" class="phase-current">{{ currentPhaseStatus }}</p>
            </div>
          </div>
        </div>

        <div v-if="executionComplete" class="execution-complete">
          <h3>Your agent is configured!</h3>
          <p>You can now add more details and deploy it to your channels.</p>
          <button class="btn-primary" @click="goToWorkspace">Open Workspace</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Current step in the flow
const currentStep = ref('intent') // 'intent' | 'choice' | 'questions' | 'knowledge' | 'test' | 'execution'

// Step 1: Intent
const userIntent = ref('')
const intentError = ref('')
const selectedScenario = ref(null)

// Step 2: Path tracking
const pathTaken = ref('') // 'questions' | 'knowledge'

// Step 3a: Questions
const detectedDomain = ref('')
const clarifyingQuestions = ref([])
const answers = ref({})
const questionsIntro = ref('')

// Step 3b: Knowledge
const activeTab = ref('integrations')
const uploadedFiles = ref([])
const textSnippets = ref([])
const websites = ref([])
const pasteText = ref('')
const websiteUrl = ref('')
const crawlSubpages = ref(true)
const fileInput = ref(null)
const conversationInput = ref(null)

// Integrations
const availableIntegrations = ref([
  { id: 'notion', name: 'Notion', status: 'Available' },
  { id: 'confluence', name: 'Confluence', status: 'Available' },
  { id: 'google-drive', name: 'Google Drive', status: 'Available' },
  { id: 'slack', name: 'Slack', status: 'Available' },
  { id: 'zendesk', name: 'Zendesk', status: 'Available' },
  { id: 'salesforce', name: 'Salesforce', status: 'Available' },
  { id: 'sharepoint', name: 'SharePoint', status: 'Available' },
  { id: 'dropbox', name: 'Dropbox', status: 'Available' },
  { id: 'github', name: 'GitHub', status: 'Available' },
  { id: 'intercom', name: 'Intercom', status: 'Available' },
  { id: 'freshdesk', name: 'Freshdesk', status: 'Available' },
  { id: 'jira', name: 'Jira', status: 'Available' }
])
const connectedIntegrations = ref([])

// Conversation files
const conversationFiles = ref([])

// Step 4: Testing
const chatMessages = ref([])
const chatInput = ref('')
const chatContainer = ref(null)

// Editable configuration in test screen
const editableAgentName = ref('')
const editableIntent = ref('')
const originalConfig = ref({})

// Generated plan (for both paths)
const generatedPlan = ref({
  agentName: '',
  purpose: '',
  phases: [],
  settings: {},
  instructions: ''
})

// Step 5: Execution
const currentPhaseIndex = ref(0)
const currentPhaseStatus = ref('')
const executionComplete = ref(false)

// Computed
const allQuestionsAnswered = computed(() => {
  return clarifyingQuestions.value.every(q => {
    const answer = answers.value[q.id]
    return answer && answer.trim().length > 0
  })
})

const knowledgeItems = computed(() => {
  return [
    ...uploadedFiles.value,
    ...textSnippets.value,
    ...websites.value,
    ...connectedIntegrations.value,
    ...conversationFiles.value
  ]
})

const agentCapabilities = computed(() => {
  const capabilities = []

  if (pathTaken.value === 'questions') {
    if (detectedDomain.value === 'scheduling') {
      capabilities.push('Check appointment availability')
      capabilities.push('Book and manage appointments')
      capabilities.push('Answer scheduling questions')
    } else if (detectedDomain.value === 'support') {
      const topics = answers.value.support_topics ? answers.value.support_topics.split(',').map(t => t.trim()).slice(0, 3) : []
      if (topics.length > 0) {
        topics.forEach(topic => capabilities.push(topic))
      } else {
        capabilities.push('Answer customer questions')
        capabilities.push('Provide product information')
        capabilities.push('Escalate complex issues')
      }
    } else if (detectedDomain.value === 'sales') {
      capabilities.push('Answer product questions')
      capabilities.push('Discuss pricing and plans')
      capabilities.push('Schedule demos and trials')
    } else if (detectedDomain.value === 'orders') {
      capabilities.push('Track order status')
      capabilities.push('Explain return and refund policies')
      capabilities.push('Answer shipping questions')
    } else {
      capabilities.push('Answer questions')
      capabilities.push('Provide information')
      capabilities.push('Help with common tasks')
    }
  } else if (pathTaken.value === 'knowledge') {
    const allText = knowledgeItems.value
      .map(item => (item.name || item.title || item.url || '').toLowerCase())
      .join(' ')

    if (allText.includes('pricing') || allText.includes('price')) {
      capabilities.push('Pricing & plans')
    }
    if (allText.includes('faq') || allText.includes('help')) {
      capabilities.push('Frequently asked questions')
    }
    if (allText.includes('support') || allText.includes('customer')) {
      capabilities.push('Customer support')
    }
    if (allText.includes('product')) {
      capabilities.push('Product information')
    }

    if (capabilities.length === 0) {
      capabilities.push('Answer questions based on your knowledge')
      capabilities.push('Provide helpful information')
    }
  }

  return capabilities.slice(0, 4)
})

const suggestedQuestions = computed(() => {
  const questions = []

  if (pathTaken.value === 'questions') {
    // Generate questions based on domain
    if (detectedDomain.value === 'scheduling') {
      questions.push("What are your business hours?")
      questions.push("How do I book an appointment?")
      questions.push("Can I reschedule an existing appointment?")
    } else if (detectedDomain.value === 'support') {
      questions.push("What are your support hours?")
      questions.push("How do I get help with my account?")
      questions.push("What topics can you help with?")
    } else if (detectedDomain.value === 'sales') {
      questions.push("What are your pricing plans?")
      questions.push("Can I schedule a demo?")
      questions.push("What products do you offer?")
    } else if (detectedDomain.value === 'orders') {
      questions.push("How do I track my order?")
      questions.push("What is your return policy?")
      questions.push("How long does shipping take?")
    } else {
      questions.push("What can you help me with?")
      questions.push("How does this work?")
    }
  } else if (pathTaken.value === 'knowledge') {
    // Generate questions based on uploaded knowledge
    const allText = knowledgeItems.value
      .map(item => (item.name || item.title || item.url || '').toLowerCase())
      .join(' ')

    if (allText.includes('pricing') || allText.includes('price')) {
      questions.push("What are your pricing plans?")
    }
    if (allText.includes('return') || allText.includes('refund')) {
      questions.push("How do I return an item?")
    }
    if (allText.includes('faq') || allText.includes('help')) {
      questions.push("What are your business hours?")
    }

    if (questions.length === 0) {
      questions.push("Tell me about your company")
      questions.push("How can you help me?")
    }
  }

  return questions.slice(0, 3)
})

const dynamicSuggestedQuestions = computed(() => {
  // Get all available questions based on domain/knowledge
  const allQuestions = []

  if (pathTaken.value === 'questions') {
    if (detectedDomain.value === 'scheduling') {
      allQuestions.push("What are your business hours?")
      allQuestions.push("How do I book an appointment?")
      allQuestions.push("Can I reschedule an existing appointment?")
      allQuestions.push("How long does an appointment take?")
      allQuestions.push("Do you have weekend availability?")
      allQuestions.push("Can I cancel an appointment?")
    } else if (detectedDomain.value === 'support') {
      allQuestions.push("What are your support hours?")
      allQuestions.push("How do I get help with my account?")
      allQuestions.push("What topics can you help with?")
      allQuestions.push("How do I contact support?")
      allQuestions.push("What is your response time?")
    } else if (detectedDomain.value === 'sales') {
      allQuestions.push("What are your pricing plans?")
      allQuestions.push("Can I schedule a demo?")
      allQuestions.push("What products do you offer?")
      allQuestions.push("Is there a free trial?")
      allQuestions.push("What are your payment terms?")
      allQuestions.push("Do you offer discounts?")
    } else if (detectedDomain.value === 'orders') {
      allQuestions.push("How do I track my order?")
      allQuestions.push("What is your return policy?")
      allQuestions.push("How long does shipping take?")
      allQuestions.push("Do you ship internationally?")
      allQuestions.push("What if my order is damaged?")
    } else {
      allQuestions.push("What can you help me with?")
      allQuestions.push("How does this work?")
      allQuestions.push("Tell me about your company")
      allQuestions.push("What are your hours?")
    }
  } else if (pathTaken.value === 'knowledge') {
    const allText = knowledgeItems.value
      .map(item => (item.name || item.title || item.url || '').toLowerCase())
      .join(' ')

    if (allText.includes('pricing') || allText.includes('price')) {
      allQuestions.push("What are your pricing plans?")
      allQuestions.push("How much does it cost?")
    }
    if (allText.includes('return') || allText.includes('refund')) {
      allQuestions.push("How do I return an item?")
      allQuestions.push("What is your refund policy?")
    }
    if (allText.includes('faq') || allText.includes('help')) {
      allQuestions.push("What are your business hours?")
      allQuestions.push("How do I contact support?")
    }
    if (allText.includes('product')) {
      allQuestions.push("Tell me about your products")
      allQuestions.push("What features do you offer?")
    }

    if (allQuestions.length === 0) {
      allQuestions.push("Tell me about your company")
      allQuestions.push("How can you help me?")
      allQuestions.push("What information do you have?")
    }
  }

  // Filter out questions that have already been asked
  const askedQuestions = chatMessages.value
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content.toLowerCase().trim())

  const unaskedQuestions = allQuestions.filter(q => {
    const qLower = q.toLowerCase()
    // Check if this question or a very similar one has been asked
    return !askedQuestions.some(asked => {
      // Simple similarity check - if they share key words
      const qWords = qLower.split(' ').filter(w => w.length > 3)
      const askedWords = asked.split(' ').filter(w => w.length > 3)
      const overlap = qWords.filter(w => askedWords.includes(w)).length
      return overlap >= 2 // If 2+ words match, consider it asked
    })
  })

  // Return up to 3 unasked questions
  return unaskedQuestions.slice(0, 3)
})

const hasConfigChanges = computed(() => {
  if (editableAgentName.value !== originalConfig.value.agentName) return true
  if (editableIntent.value !== originalConfig.value.intent) return true

  // Check if answers changed for questions path
  if (pathTaken.value === 'questions') {
    for (const question of clarifyingQuestions.value) {
      if (answers.value[question.id] !== originalConfig.value.answers?.[question.id]) {
        return true
      }
    }
  }

  return false
})

// Methods

onMounted(() => {
  // Check if coming from build-agent screen (new flow)
  const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')
  if (buildData.intent && buildData.selectedMethod) {
    // Skip intent step, go directly to selected method
    userIntent.value = buildData.intent
    selectedScenario.value = buildData.scenarioId ? { id: buildData.scenarioId } : null

    if (buildData.selectedMethod === 'questions') {
      // Analyze intent and generate questions
      analyzeIntent()
      // Move to questions step
      chooseQuestionsPath()
      return
    } else if (buildData.selectedMethod === 'knowledge') {
      // Analyze intent for context
      analyzeIntent()
      // Move to knowledge step
      chooseKnowledgePath()
      return
    }
  }

  // Check if user selected a scenario from the empty state (old flow)
  const storedScenario = localStorage.getItem('daart-selected-scenario')
  if (storedScenario) {
    selectedScenario.value = JSON.parse(storedScenario)
    userIntent.value = selectedScenario.value.intent
    // Clear it after loading
    localStorage.removeItem('daart-selected-scenario')
  }
})

function analyzeIntent() {
  if (!userIntent.value.trim()) {
    intentError.value = 'Please describe what you want your agent to do'
    return
  }

  // Detect domain from intent (or use scenario ID if available)
  if (selectedScenario.value) {
    detectedDomain.value = selectedScenario.value.id
  } else {
    const intent = userIntent.value.toLowerCase()

    if (intent.includes('appointment') || intent.includes('booking') || intent.includes('schedule') || intent.includes('calendar')) {
      detectedDomain.value = 'appointments'
    } else if (intent.includes('reminder')) {
      detectedDomain.value = 'reminders'
    } else if (intent.includes('support') || intent.includes('help') || intent.includes('customer service') || intent.includes('answer questions')) {
      detectedDomain.value = 'support'
    } else if (intent.includes('sales') || intent.includes('pricing') || intent.includes('demo') || intent.includes('qualify leads')) {
      detectedDomain.value = 'sales'
    } else if (intent.includes('order') || intent.includes('shipping') || intent.includes('track') || intent.includes('return')) {
      detectedDomain.value = 'orders'
    } else if (intent.includes('reservation') || intent.includes('restaurant') || intent.includes('table') || intent.includes('waitlist')) {
      detectedDomain.value = 'reservations'
    } else {
      detectedDomain.value = 'general'
    }
  }

  currentStep.value = 'choice'
}

function goBackToIntent() {
  currentStep.value = 'intent'
  answers.value = {}
  uploadedFiles.value = []
  textSnippets.value = []
  websites.value = []
}

function goBackToChoice() {
  // Check if we came from build-agent screen
  const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')
  if (buildData.intent && buildData.selectedMethod) {
    // Go back to build-agent screen for any method (questions or knowledge)
    router.push('/build-agent')
    return
  }

  // Otherwise go back to choice step (old flow)
  currentStep.value = 'choice'
}

function chooseQuestionsPath() {
  pathTaken.value = 'questions'

  // Generate questions based on domain
  if (detectedDomain.value === 'appointments') {
    questionsIntro.value = 'I see you need appointment scheduling. Let me ask a few questions to set this up properly.'
    clarifyingQuestions.value = [
      {
        id: 'business_type',
        type: 'text',
        question: 'What type of business is this for?',
        placeholder: 'e.g., Dental office, Hair salon, Consulting firm',
        hint: 'This helps me understand your context'
      },
      {
        id: 'appointment_duration',
        type: 'text',
        question: 'What\'s the typical appointment duration?',
        placeholder: 'e.g., 30 minutes, 1 hour',
        hint: ''
      },
      {
        id: 'buffer_time',
        type: 'text',
        question: 'Any buffer time needed between appointments?',
        placeholder: 'e.g., 10 minutes, 15 minutes, None',
        hint: ''
      },
      {
        id: 'business_hours',
        type: 'text',
        question: 'What are your business hours?',
        placeholder: 'e.g., Mon-Fri 9am-5pm',
        hint: 'When should the agent accept bookings?'
      },
      {
        id: 'calendar_system',
        type: 'select',
        question: 'Which calendar system do you use?',
        options: ['Google Calendar', 'Outlook Calendar', 'Apple Calendar', 'None yet'],
        hint: 'We can integrate with your existing calendar'
      },
      {
        id: 'special_rules',
        type: 'textarea',
        question: 'Any special scheduling rules or requirements?',
        placeholder: 'e.g., No same-day bookings, Require 24hr cancellation notice, etc.',
        hint: 'Optional - any specific policies we should know about'
      }
    ]
  } else if (detectedDomain.value === 'reminders') {
    questionsIntro.value = 'I see you need to send reminders. Let me ask a few questions to set this up properly.'
    clarifyingQuestions.value = [
      {
        id: 'reminder_type',
        type: 'select',
        question: 'What type of reminders will you send?',
        options: ['Appointments', 'Payments', 'Renewals', 'Deadlines', 'Multiple types'],
        hint: ''
      },
      {
        id: 'reminder_timing',
        type: 'textarea',
        question: 'When should reminders be sent?',
        placeholder: 'e.g., 24 hours before appointment, 3 days before payment due',
        hint: 'Describe your reminder schedule'
      },
      {
        id: 'reminder_channels',
        type: 'select',
        question: 'How should reminders be delivered?',
        options: ['SMS only', 'Voice call only', 'SMS then voice if no response', 'Both SMS and voice'],
        hint: ''
      },
      {
        id: 'data_source',
        type: 'text',
        question: 'Where will the reminder data come from?',
        placeholder: 'e.g., Google Calendar, Stripe, QuickBooks, Spreadsheet',
        hint: 'We can integrate with your existing system'
      },
      {
        id: 'confirmation_needed',
        type: 'select',
        question: 'Do customers need to confirm receipt?',
        options: ['Yes - require confirmation', 'No - just notify', 'Yes - and allow rescheduling'],
        hint: ''
      }
    ]
  } else if (detectedDomain.value === 'support') {
    questionsIntro.value = 'I see you need customer support. Let me ask a few questions to set this up properly.'
    clarifyingQuestions.value = [
      {
        id: 'business_name',
        type: 'text',
        question: 'What\'s your business or product name?',
        placeholder: 'e.g., Acme Software, My Store',
        hint: ''
      },
      {
        id: 'support_topics',
        type: 'textarea',
        question: 'What topics should your agent help with?',
        placeholder: 'e.g., Product setup, Billing questions, Troubleshooting, Returns',
        hint: 'List the main areas your agent will cover'
      },
      {
        id: 'business_hours',
        type: 'text',
        question: 'What are your support hours?',
        placeholder: 'e.g., 24/7, Mon-Fri 9am-6pm',
        hint: 'When should customers expect responses?'
      },
      {
        id: 'escalation',
        type: 'text',
        question: 'How should the agent escalate complex issues?',
        placeholder: 'e.g., Transfer to support@company.com, Create a ticket',
        hint: 'What happens when the agent can\'t help?'
      },
      {
        id: 'knowledge_sources',
        type: 'textarea',
        question: 'What knowledge sources will you provide?',
        placeholder: 'e.g., Help docs, FAQ page, Product manuals, Pricing sheet',
        hint: 'We\'ll help you add these in the next step'
      }
    ]
  } else if (detectedDomain.value === 'sales') {
    questionsIntro.value = 'I see you need a sales agent. Let me ask a few questions to set this up properly.'
    clarifyingQuestions.value = [
      {
        id: 'business_name',
        type: 'text',
        question: 'What\'s your business or product name?',
        placeholder: 'e.g., Acme Software',
        hint: ''
      },
      {
        id: 'products_services',
        type: 'textarea',
        question: 'What products or services do you sell?',
        placeholder: 'List your main offerings',
        hint: 'Be specific about what customers can buy'
      },
      {
        id: 'pricing_model',
        type: 'text',
        question: 'What\'s your pricing model?',
        placeholder: 'e.g., Subscription plans, One-time purchase, Custom quotes',
        hint: ''
      },
      {
        id: 'qualification_criteria',
        type: 'textarea',
        question: 'What makes a qualified lead for you?',
        placeholder: 'e.g., Budget over $1000, Company size 50+, Specific industry',
        hint: 'How should the agent qualify prospects?'
      },
      {
        id: 'call_to_action',
        type: 'text',
        question: 'What should the agent ask prospects to do?',
        placeholder: 'e.g., Book a demo, Start free trial, Request a quote',
        hint: 'The main conversion goal'
      }
    ]
  } else if (detectedDomain.value === 'orders') {
    questionsIntro.value = 'I see you need order management. Let me ask a few questions to set this up properly.'
    clarifyingQuestions.value = [
      {
        id: 'business_name',
        type: 'text',
        question: 'What\'s your business name?',
        placeholder: 'e.g., My Store',
        hint: ''
      },
      {
        id: 'order_system',
        type: 'select',
        question: 'What system do you use for orders?',
        options: ['Shopify', 'WooCommerce', 'Custom system', 'Manual/Spreadsheet', 'Other'],
        hint: 'We may be able to integrate with it'
      },
      {
        id: 'common_questions',
        type: 'textarea',
        question: 'What do customers usually ask about?',
        placeholder: 'e.g., Order status, Shipping times, Return process, Refund policy',
        hint: 'List the most common order-related questions'
      },
      {
        id: 'return_policy',
        type: 'textarea',
        question: 'What\'s your return/refund policy?',
        placeholder: 'e.g., 30-day returns, No questions asked refunds',
        hint: 'The agent will need to communicate this clearly'
      },
      {
        id: 'escalation',
        type: 'text',
        question: 'How should complex order issues be handled?',
        placeholder: 'e.g., Email to orders@company.com, Open support ticket',
        hint: ''
      }
    ]
  } else if (detectedDomain.value === 'reservations') {
    questionsIntro.value = 'I see you need restaurant reservations. Let me ask a few questions to set this up properly.'
    clarifyingQuestions.value = [
      {
        id: 'restaurant_name',
        type: 'text',
        question: 'What\'s your restaurant name?',
        placeholder: 'e.g., Mario\'s Italian Kitchen',
        hint: ''
      },
      {
        id: 'seating_capacity',
        type: 'text',
        question: 'What\'s your seating capacity?',
        placeholder: 'e.g., 50 seats, 20 tables',
        hint: 'This helps manage availability'
      },
      {
        id: 'reservation_system',
        type: 'select',
        question: 'Do you use a reservation system?',
        options: ['OpenTable', 'Resy', 'Yelp Reservations', 'Spreadsheet', 'None yet'],
        hint: 'We can integrate with your existing system'
      },
      {
        id: 'business_hours',
        type: 'text',
        question: 'What are your operating hours?',
        placeholder: 'e.g., Tue-Sun 5pm-10pm',
        hint: 'When do you accept reservations?'
      },
      {
        id: 'party_size_limits',
        type: 'text',
        question: 'Any party size limits or special rules?',
        placeholder: 'e.g., Max 8 people per table, Groups of 6+ need to call',
        hint: ''
      },
      {
        id: 'additional_features',
        type: 'textarea',
        question: 'What else should the agent help with?',
        placeholder: 'e.g., Take takeout orders, Answer menu questions, Manage waitlist',
        hint: 'Optional - any additional capabilities needed'
      }
    ]
  } else {
    // General purpose
    questionsIntro.value = 'Let me ask a few questions to set up your agent properly.'
    clarifyingQuestions.value = [
      {
        id: 'business_name',
        type: 'text',
        question: 'What\'s your business or agent name?',
        placeholder: 'e.g., My Business Assistant',
        hint: ''
      },
      {
        id: 'main_tasks',
        type: 'textarea',
        question: 'What are the main tasks this agent should handle?',
        placeholder: 'List 3-5 key responsibilities',
        hint: 'Be as specific as possible'
      },
      {
        id: 'target_audience',
        type: 'text',
        question: 'Who will interact with this agent?',
        placeholder: 'e.g., Customers, Employees, Partners',
        hint: ''
      },
      {
        id: 'knowledge_sources',
        type: 'textarea',
        question: 'What information should the agent have access to?',
        placeholder: 'e.g., Company policies, Product documentation, FAQs',
        hint: 'We\'ll help you add these in the next step'
      },
      {
        id: 'special_requirements',
        type: 'textarea',
        question: 'Any special requirements or constraints?',
        placeholder: 'e.g., Must speak formally, Can only provide info not book appointments',
        hint: 'Optional - any specific rules or guidelines'
      }
    ]
  }

  currentStep.value = 'questions'
}

function chooseKnowledgePath() {
  pathTaken.value = 'knowledge'
  currentStep.value = 'knowledge'
}

function handleFileUpload(event) {
  const files = Array.from(event.target.files)

  files.forEach(file => {
    // Validate size
    if (file.size > 10 * 1024 * 1024) {
      alert(`File ${file.name} is too large (max 10MB)`)
      return
    }

    const newFile = {
      id: Date.now() + Math.random(),
      name: file.name,
      type: 'Document',
      size: file.size,
      status: 'ready',
      content: ''
    }

    uploadedFiles.value.push(newFile)
  })

  // Reset input
  event.target.value = ''
}

function removeFile(id) {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.id !== id)
}

function addTextSnippet() {
  if (!pasteText.value.trim()) return

  const snippet = {
    id: Date.now(),
    name: `Text snippet ${textSnippets.value.length + 1}`,
    type: 'Text Content',
    title: `Text snippet ${textSnippets.value.length + 1}`,
    content: pasteText.value.trim()
  }

  textSnippets.value.push(snippet)
  pasteText.value = ''
}

function removeSnippet(id) {
  textSnippets.value = textSnippets.value.filter(s => s.id !== id)
}

function addWebsite() {
  if (!websiteUrl.value.trim()) return

  const site = {
    id: Date.now(),
    name: websiteUrl.value.trim(),
    type: 'Website',
    url: websiteUrl.value.trim(),
    status: 'ready',
    pageCount: crawlSubpages.value ? Math.floor(Math.random() * 40) + 10 : 1
  }

  websites.value.push(site)
  websiteUrl.value = ''
  crawlSubpages.value = true // Reset to default
}

function removeWebsite(id) {
  websites.value = websites.value.filter(w => w.id !== id)
}

// Integration handlers
function connectIntegration(integrationId) {
  const integration = availableIntegrations.value.find(i => i.id === integrationId)
  if (!integration) return

  // Simulate OAuth connection (in production, this would trigger OAuth flow)
  alert(`Connecting to ${integration.name}... (OAuth flow would happen here)`)

  // Move to connected list
  const connected = {
    id: Date.now(),
    integrationId: integration.id,
    name: integration.name,
    status: 'Connected',
    itemCount: Math.floor(Math.random() * 50) + 10 // Simulated item count
  }

  connectedIntegrations.value.push(connected)
}

function disconnectIntegration(connId) {
  connectedIntegrations.value = connectedIntegrations.value.filter(c => c.id !== connId)
}

// Conversation upload handlers
function handleConversationUpload(event) {
  const files = Array.from(event.target.files)

  files.forEach(file => {
    // Validate file type
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      alert(`File ${file.name} must be CSV or JSON format`)
      return
    }

    // Validate size
    if (file.size > 5 * 1024 * 1024) {
      alert(`File ${file.name} is too large (max 5MB)`)
      return
    }

    const newConversation = {
      id: Date.now() + Math.random(),
      name: file.name,
      type: 'Conversations',
      size: file.size,
      status: 'ready',
      conversationCount: Math.floor(Math.random() * 200) + 50 // Simulated count
    }

    conversationFiles.value.push(newConversation)
  })

  // Reset input
  event.target.value = ''
}

function removeConversationFile(id) {
  conversationFiles.value = conversationFiles.value.filter(f => f.id !== id)
}

function proceedToTest() {
  // Save configuration data to localStorage for test view
  const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')

  // Add questions or knowledge data
  if (pathTaken.value === 'questions') {
    buildData.questions = answers.value
  } else {
    buildData.knowledge = knowledgeItems.value
  }

  // Save integrations if any
  buildData.integrations = connectedIntegrations.value || []

  localStorage.setItem('daart-building-agent', JSON.stringify(buildData))

  // Navigate to unified test view
  router.push('/test-agent')
}

function generatePlanFromQuestions() {
  const businessName = answers.value.business_name || answers.value.business_type || 'AI Agent'
  const agentName = `${businessName} Assistant`

  const plan = {
    agentName: agentName,
    purpose: userIntent.value,
    phases: [],
    settings: {},
    instructions: ''
  }

  if (detectedDomain.value === 'scheduling') {
    plan.phases = [
      { name: 'Phase 1: Basic Setup', tasks: [`Create agent named "${agentName}"`, `Set business hours: ${answers.value.business_hours}`, `Configure appointment duration: ${answers.value.appointment_duration}`] },
      { name: 'Phase 2: Knowledge & Policies', tasks: ['Add service types and offerings', 'Add pricing information'] },
      { name: 'Phase 3: Testing', tasks: ['Test appointment booking', 'Test availability checks', 'Test edge cases'] },
      { name: 'Phase 4: Integration & Deploy', tasks: [`Connect to ${answers.value.calendar_system}`, 'Configure notifications', 'Deploy to channels'] }
    ]

    plan.settings = {
      'Business Hours': answers.value.business_hours,
      'Appointment Duration': answers.value.appointment_duration,
      'Buffer Time': answers.value.buffer_time || 'None',
      'Calendar System': answers.value.calendar_system
    }

    plan.instructions = `You are ${agentName}, an appointment scheduling assistant for ${answers.value.business_type}.

Your responsibilities:
- Help customers check availability and book appointments
- Provide information about services and scheduling
- Follow business hours: ${answers.value.business_hours}
- Standard appointment duration: ${answers.value.appointment_duration}
${answers.value.buffer_time !== 'None' ? `- Maintain ${answers.value.buffer_time} buffer between appointments` : ''}
${answers.value.special_rules ? `\nSpecial Rules:\n${answers.value.special_rules}` : ''}

Always be professional, efficient, and customer-focused.`

  } else if (detectedDomain.value === 'support') {
    plan.phases = [
      { name: 'Phase 1: Basic Setup', tasks: [`Create agent named "${agentName}"`, `Set support hours: ${answers.value.business_hours}`] },
      { name: 'Phase 2: Knowledge Base', tasks: ['Add knowledge sources', 'Configure topic categories'] },
      { name: 'Phase 3: Testing', tasks: ['Test common questions', 'Test escalation flow'] },
      { name: 'Phase 4: Deploy', tasks: ['Configure channels', 'Set up escalation contacts', 'Deploy'] }
    ]

    plan.settings = {
      'Business Name': answers.value.business_name,
      'Support Hours': answers.value.business_hours,
      'Escalation Method': answers.value.escalation
    }

    plan.instructions = `You are ${agentName}, a customer support assistant.

Your responsibilities:
- Answer customer questions about: ${answers.value.support_topics}
- Provide helpful, accurate information based on your knowledge base
- Maintain a friendly, professional tone
- Escalate complex issues to: ${answers.value.escalation}

Support hours: ${answers.value.business_hours}

If you don't know something, be honest and offer to escalate to a human agent.`

  } else if (detectedDomain.value === 'sales') {
    plan.phases = [
      { name: 'Phase 1: Basic Setup', tasks: [`Create agent named "${agentName}"`, 'Configure sales workflow'] },
      { name: 'Phase 2: Knowledge Base', tasks: ['Add product information', 'Add pricing details'] },
      { name: 'Phase 3: Testing', tasks: ['Test product questions', 'Test qualification flow'] },
      { name: 'Phase 4: Deploy', tasks: ['Configure CRM integration', 'Set up tracking', 'Deploy'] }
    ]

    plan.settings = {
      'Business Name': answers.value.business_name,
      'Pricing Model': answers.value.pricing_model,
      'Call to Action': answers.value.call_to_action
    }

    plan.instructions = `You are ${agentName}, a sales assistant.

Your responsibilities:
- Help prospects learn about: ${answers.value.products_services}
- Answer pricing questions (${answers.value.pricing_model})
- Qualify leads based on: ${answers.value.qualification_criteria}
- Guide qualified prospects to: ${answers.value.call_to_action}

Be helpful, enthusiastic, and consultative. Focus on understanding customer needs before pitching.`

  } else if (detectedDomain.value === 'orders') {
    plan.phases = [
      { name: 'Phase 1: Basic Setup', tasks: [`Create agent named "${agentName}"`, 'Configure order workflow'] },
      { name: 'Phase 2: Knowledge Base', tasks: ['Add order information', 'Add return policy'] },
      { name: 'Phase 3: Integration', tasks: [`Connect to ${answers.value.order_system}`, 'Configure escalation'] },
      { name: 'Phase 4: Testing & Deploy', tasks: ['Test order inquiries', 'Test return requests', 'Deploy'] }
    ]

    plan.settings = {
      'Business Name': answers.value.business_name,
      'Order System': answers.value.order_system,
      'Escalation Method': answers.value.escalation
    }

    plan.instructions = `You are ${agentName}, an order management assistant.

Your responsibilities:
- Help customers with: ${answers.value.common_questions}
- Provide order status updates
- Explain return/refund policy: ${answers.value.return_policy}
- Escalate complex issues to: ${answers.value.escalation}

Be patient, empathetic, and solution-focused when handling order issues.`

  } else {
    plan.phases = [
      { name: 'Phase 1: Basic Setup', tasks: [`Create agent named "${agentName}"`, 'Configure behavior'] },
      { name: 'Phase 2: Knowledge Base', tasks: ['Add knowledge sources', 'Configure workflows'] },
      { name: 'Phase 3: Testing', tasks: ['Test main use cases', 'Validate responses'] },
      { name: 'Phase 4: Deploy', tasks: ['Configure channels', 'Deploy'] }
    ]

    plan.settings = {
      'Agent Name': agentName,
      'Target Audience': answers.value.target_audience
    }

    plan.instructions = `You are ${agentName}, an AI assistant.

Your responsibilities:
${answers.value.main_tasks}

Target audience: ${answers.value.target_audience}

Knowledge sources: ${answers.value.knowledge_sources}

${answers.value.special_requirements ? `Special requirements:\n${answers.value.special_requirements}` : ''}

Be helpful, professional, and stay within the scope of your knowledge.`
  }

  generatedPlan.value = plan
}

function generatePlanFromKnowledge() {
  // Infer agent name from first knowledge item
  let agentName = 'AI Assistant'
  if (uploadedFiles.value.length > 0) {
    const fileName = uploadedFiles.value[0].name
    const name = fileName.split(/[_.-]/)[0].replace(/\.(pdf|docx|txt|csv)$/i, '')
    agentName = name ? `${name} Assistant` : 'AI Assistant'
  } else if (websites.value.length > 0) {
    try {
      const url = new URL(websites.value[0].url)
      const domain = url.hostname.replace('www.', '').split('.')[0]
      agentName = `${domain.charAt(0).toUpperCase() + domain.slice(1)} Assistant`
    } catch {
      // Invalid URL
    }
  }

  // Detect purpose from knowledge content
  const allText = knowledgeItems.value
    .map(item => (item.name || item.title || item.url || item.content || '').toLowerCase())
    .join(' ')

  let detectedPurpose = 'general'
  if (allText.includes('appointment') || allText.includes('schedule')) detectedPurpose = 'scheduling'
  else if (allText.includes('support') || allText.includes('help')) detectedPurpose = 'support'
  else if (allText.includes('pricing') || allText.includes('sales')) detectedPurpose = 'sales'
  else if (allText.includes('order') || allText.includes('shipping')) detectedPurpose = 'orders'

  generatedPlan.value = {
    agentName: agentName,
    purpose: userIntent.value,
    phases: [
      { name: 'Phase 1: Basic Setup', tasks: [`Create agent named "${agentName}"`, 'Configure basic behavior'] },
      { name: 'Phase 2: Knowledge Loading', tasks: ['Process uploaded documents', 'Extract key information', 'Build knowledge base'] },
      { name: 'Phase 3: Testing', tasks: ['Test with sample questions', 'Validate knowledge retrieval'] },
      { name: 'Phase 4: Deploy', tasks: ['Configure channels', 'Deploy to production'] }
    ],
    settings: {},
    instructions: `You are ${agentName}, an AI assistant.

Your purpose: ${userIntent.value}

You have been trained on ${knowledgeItems.value.length} knowledge sources including documents, text, and websites. Use this information to answer questions accurately and helpfully.

Always be professional, concise, and stay within the scope of your knowledge. If you don't know something, be honest about it.`
  }
}

function askQuestion(question) {
  chatInput.value = question
  sendMessage()
}

function sendMessage() {
  if (!chatInput.value.trim()) return

  // Add user message
  chatMessages.value.push({
    id: Date.now(),
    role: 'user',
    content: chatInput.value
  })

  const userMessage = chatInput.value
  chatInput.value = ''

  // Simulate AI response
  setTimeout(() => {
    const response = generateAIResponse(userMessage)
    chatMessages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: response
    })

    // Scroll to bottom
    setTimeout(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    }, 50)
  }, 500)
}

function generateAIResponse(message) {
  const msg = message.toLowerCase()

  if (pathTaken.value === 'questions') {
    // Generate responses based on answers
    if (detectedDomain.value === 'scheduling') {
      if (msg.includes('hours') || msg.includes('when')) {
        return `Our business hours are ${answers.value.business_hours}. You can book appointments during these times.`
      }
      if (msg.includes('book') || msg.includes('appointment') || msg.includes('schedule')) {
        return `I can help you book an appointment! Our typical appointments are ${answers.value.appointment_duration}. What day works best for you?`
      }
      if (msg.includes('reschedule') || msg.includes('cancel')) {
        return `I can help you reschedule. ${answers.value.special_rules || 'Please let me know your current appointment time and preferred new time.'}`
      }
    } else if (detectedDomain.value === 'support') {
      if (msg.includes('hours')) {
        return `Our support hours are ${answers.value.business_hours}. We're here to help!`
      }
      if (msg.includes('help') || msg.includes('support')) {
        return `I can help you with: ${answers.value.support_topics}. What specific question do you have?`
      }
    } else if (detectedDomain.value === 'sales') {
      if (msg.includes('pricing') || msg.includes('price') || msg.includes('cost')) {
        return `We offer ${answers.value.pricing_model}. I'd be happy to explain our options in detail. What's most important to you?`
      }
      if (msg.includes('demo') || msg.includes('trial')) {
        return `Great! ${answers.value.call_to_action}. I can get you set up right away. What's your email address?`
      }
      if (msg.includes('product') || msg.includes('service')) {
        return `We offer: ${answers.value.products_services}. Which area interests you most?`
      }
    } else if (detectedDomain.value === 'orders') {
      if (msg.includes('track') || msg.includes('order') || msg.includes('status')) {
        return `I can help you track your order. Our system is ${answers.value.order_system}. What's your order number?`
      }
      if (msg.includes('return') || msg.includes('refund')) {
        return `Our return policy: ${answers.value.return_policy}. Would you like to start a return?`
      }
    }
  } else if (pathTaken.value === 'knowledge') {
    // Generate responses based on knowledge
    const topics = []
    const allText = knowledgeItems.value
      .map(item => (item.name || item.title || item.url || '').toLowerCase())
      .join(' ')

    if (allText.includes('pricing')) topics.push('pricing')
    if (allText.includes('return')) topics.push('returns')
    if (allText.includes('faq')) topics.push('FAQs')

    if (topics.length > 0) {
      return `Based on the ${knowledgeItems.value.length} knowledge sources you uploaded, I can help with ${topics.join(', ')}. Let me search for the answer to "${message}"... [In production, I would retrieve the relevant information from your documents.]`
    }
  }

  // Generic response
  return `I understand your question about "${message}". Based on the configuration you've provided, I'm ready to help with this type of inquiry. In production, I would provide a detailed, accurate response using the knowledge and instructions you've set up.`
}

function saveConfigChanges() {
  // Update user intent and agent name
  userIntent.value = editableIntent.value
  generatedPlan.value.agentName = editableAgentName.value

  // Regenerate plan with updated data
  if (pathTaken.value === 'questions') {
    generatePlanFromQuestions()
  } else {
    generatePlanFromKnowledge()
  }

  // Update original config
  originalConfig.value = {
    agentName: editableAgentName.value,
    intent: editableIntent.value,
    answers: pathTaken.value === 'questions' ? { ...answers.value } : {}
  }

  // Reset chat to reflect changes
  chatMessages.value = []
  chatInput.value = ''
}

function addMoreKnowledge() {
  // Go back to knowledge step to add more items
  currentStep.value = 'knowledge'
}

function continueConfiguration() {
  currentStep.value = 'execution'
  currentPhaseIndex.value = 0
  executionComplete.value = false

  // Simulate executing each phase
  executeNextPhase()
}

function executeNextPhase() {
  if (currentPhaseIndex.value >= generatedPlan.value.phases.length) {
    // All phases complete
    executionComplete.value = true
    currentPhaseStatus.value = 'Complete!'

    // Create the agent
    createAgentFromPlan()
    return
  }

  const phase = generatedPlan.value.phases[currentPhaseIndex.value]
  currentPhaseStatus.value = `Executing ${phase.name}...`

  // Simulate phase execution (2 seconds per phase)
  setTimeout(() => {
    currentPhaseIndex.value++
    executeNextPhase()
  }, 2000)
}

function createAgentFromPlan() {
  // Structure knowledge sources properly for workspace
  const knowledgeSources = {
    textContent: '',
    textSnippets: pathTaken.value === 'knowledge' ? textSnippets.value : [],
    documents: pathTaken.value === 'knowledge' ? uploadedFiles.value : [],
    websites: pathTaken.value === 'knowledge' ? websites.value : [],
    integrations: pathTaken.value === 'knowledge' ? connectedIntegrations.value : [],
    conversations: pathTaken.value === 'knowledge' ? conversationFiles.value : []
  }

  const newAgent = {
    id: Date.now().toString(),
    name: generatedPlan.value.agentName,
    problemType: detectedDomain.value,
    status: 'draft',
    statusText: 'Draft',
    lastUpdated: 'Just now',
    conversations: 0,
    instructions: generatedPlan.value.instructions,
    knowledgeBase: pathTaken.value === 'knowledge' ? `${knowledgeItems.value.length} sources added` : 'Ready to add knowledge sources',
    skills: [],
    knowledge: pathTaken.value === 'knowledge' ? knowledgeItems.value : [],
    knowledgeSources: knowledgeSources,
    settings: generatedPlan.value.settings,
    onboardingPlan: {
      userIntent: userIntent.value,
      domain: detectedDomain.value,
      pathTaken: pathTaken.value,
      answers: pathTaken.value === 'questions' ? answers.value : {},
      knowledgeItems: pathTaken.value === 'knowledge' ? knowledgeItems.value : [],
      phases: generatedPlan.value.phases,
      createdAt: new Date().toISOString()
    },
    channels: {
      webChat: {
        enabled: true,
        widgetPosition: 'bottom-right',
        primaryColor: '#000',
        welcomeMessage: 'Hi! How can I help you today?',
        displayName: generatedPlan.value.agentName
      },
      voice: { enabled: false },
      sms: { enabled: false }
    },
    needsWizard: false
  }

  // Save to localStorage
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  agents.push(newAgent)
  localStorage.setItem('daart-agents', JSON.stringify(agents))

  // Save plan to localStorage for reference
  localStorage.setItem(`daart-plan-${newAgent.id}`, JSON.stringify({
    agentId: newAgent.id,
    plan: generatedPlan.value,
    intent: userIntent.value,
    domain: detectedDomain.value,
    pathTaken: pathTaken.value,
    answers: pathTaken.value === 'questions' ? answers.value : {},
    knowledgeItems: pathTaken.value === 'knowledge' ? knowledgeItems.value : []
  }))

  // Mark onboarding complete
  localStorage.setItem('daart-onboarding-complete', 'true')
}

function goToWorkspace() {
  // Get the agent we just created
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  const latestAgent = agents[agents.length - 1]

  if (latestAgent) {
    router.push(`/agents-v2/${latestAgent.id}`)
  }
}
</script>

<style scoped>
/* LO-FI PROTOTYPE - Matching workspace styles */
.onboarding-dynamic {
  min-height: 100vh;
  background: #fff;
  padding: 40px 20px;
  font-family: system-ui, sans-serif;
}

/* Intent Screen */
.intent-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.intent-container {
  max-width: 700px;
  width: 100%;
}

.intent-screen h1 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
  color: #000;
}

.subtitle {
  font-size: 15px;
  color: #666;
  margin-bottom: 32px;
  text-align: center;
  line-height: 1.6;
}

.intent-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: system-ui, sans-serif;
  margin-bottom: 16px;
  resize: vertical;
  transition: border-color 0.2s;
}

.intent-input:focus {
  outline: none;
  border-color: #000;
}

.error-message {
  color: #f44336;
  font-size: 13px;
  margin-bottom: 16px;
}

.intent-footer {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 48px;
}

.examples {
  border-top: 1px solid #e0e0e0;
  padding-top: 24px;
  margin-top: 24px;
}

.examples-label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #666;
}

.examples ul {
  list-style: disc;
  padding-left: 24px;
}

.examples li {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

/* Choice Screen */
.choice-screen {
  max-width: 900px;
  margin: 0 auto;
}

.choice-container h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
  color: #000;
}

.choice-cards {
  display: flex;
  gap: 24px;
  margin: 48px 0;
}

.choice-card {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 32px;
  cursor: pointer;
  text-align: center;
  background: #fafafa;
  transition: all 0.2s;
}

.choice-card:hover {
  border-color: #000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.choice-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #000;
}

.choice-card p {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.choice-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 24px;
}

.btn-choice {
  padding: 10px 20px;
  background: #000;
  color: #fff;
  border: 1px solid #000;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-choice:hover {
  background: #333;
  border-color: #333;
}

.choice-footer {
  display: flex;
  justify-content: center;
}

/* Questions Screen */
.questions-screen {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
}

/* Intent Context in Questions */
.questions-container .intent-context {
  margin-bottom: 24px;
  padding: 12px 16px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: left;
}

.questions-container .intent-label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 6px 0;
}

.questions-container .intent-text {
  font-size: 14px;
  color: #000;
  line-height: 1.5;
  margin: 0;
}

.questions-container h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
}

.questions-list {
  margin: 32px 0;
}

.question-item {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e0e0e0;
}

.question-item:last-child {
  border-bottom: none;
}

.question-item label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
}

.question-hint {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.question-input,
.question-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: system-ui, sans-serif;
  transition: border-color 0.2s;
}

.question-input:focus,
.question-select:focus {
  outline: none;
  border-color: #000;
}

.question-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: system-ui, sans-serif;
  resize: vertical;
  transition: border-color 0.2s;
}

.question-textarea:focus {
  outline: none;
  border-color: #000;
}

.questions-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.questions-list {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 24px;
  padding-right: 8px;
}

.questions-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 24px 0;
  border-top: 1px solid #e0e0e0;
  background: #fff;
  position: sticky;
  bottom: 0;
  margin-top: auto;
  flex-shrink: 0;
}

/* Knowledge Upload Screen */
.knowledge-screen {
  max-width: 800px;
  margin: 0 auto;
}

/* Intent Context in Knowledge */
.knowledge-container .intent-context {
  margin-bottom: 24px;
  padding: 12px 16px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: left;
}

.knowledge-container .intent-label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 6px 0;
}

.knowledge-container .intent-text {
  font-size: 14px;
  color: #000;
  line-height: 1.5;
  margin: 0;
}

.knowledge-container h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
}

.knowledge-container .subtitle,
.questions-container .subtitle {
  text-align: left;
}

.upload-tabs {
  display: flex;
  gap: 8px;
  margin: 32px 0 16px;
}

.upload-tabs button {
  flex: 1;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.upload-tabs button:hover {
  border-color: #000;
  background: #f5f5f5;
}

.upload-tabs button.active {
  background: #000;
  color: #fff;
  border-color: #000;
}

.tab-content {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 24px;
  margin-bottom: 24px;
  min-height: 300px;
  background: #fafafa;
}

.btn-upload,
.btn-add {
  padding: 10px 20px;
  background: #000;
  color: #fff;
  border: 1px solid #000;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.btn-upload:hover,
.btn-add:hover:not(:disabled) {
  background: #333;
  border-color: #333;
}

.btn-add:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.hint {
  font-size: 12px;
  color: #666;
  margin-bottom: 16px;
  line-height: 1.4;
}

.file-list,
.snippets-list,
.websites-list {
  margin-top: 16px;
}

.file-item,
.snippet-item,
.website-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fff;
  transition: all 0.15s;
}

.file-item:hover,
.snippet-item:hover,
.website-item:hover {
  background: #fafafa;
}

.file-name,
.snippet-title,
.website-url {
  font-size: 13px;
  flex: 1;
  color: #000;
  font-weight: 500;
}

.file-status,
.website-status {
  font-size: 12px;
  color: #666;
  margin-right: 12px;
}

.btn-remove {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-remove:hover {
  border-color: #000;
  background: #f5f5f5;
}

.paste-tab textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  margin-bottom: 8px;
  transition: border-color 0.2s;
}

.paste-tab textarea:focus {
  outline: none;
  border-color: #000;
}

.char-count {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.url-tab input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 12px;
  transition: border-color 0.2s;
}

.url-tab input:focus {
  outline: none;
  border-color: #000;
}

/* Integrations Tab */
.integrations-tab {
  padding: 16px 0;
}

.tab-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.integration-card {
  padding: 20px 16px;
  background: #fff;
  border: 1px solid #ddd;
  cursor: pointer;
  font-size: 13px;
  text-align: center;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.integration-card:hover {
  border-color: #000;
  background: #f5f5f5;
}

.integration-name {
  font-weight: 600;
  color: #000;
}

.integration-status {
  font-size: 11px;
  color: #666;
}

.connected-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.connected-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #000;
}

.connected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.connected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
}

.connected-info {
  flex: 1;
}

.connected-name {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.connected-meta {
  font-size: 12px;
  color: #666;
}

/* Crawl Options */
.url-input-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.crawl-options {
  padding: 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.crawl-hint {
  font-size: 12px;
  color: #666;
  margin-top: 8px;
  line-height: 1.4;
}

/* Conversations Tab */
.conversations-tab {
  padding: 16px 0;
}

.format-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.format-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
}

.format-info p {
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.format-example {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  margin-top: 12px;
  overflow-x: auto;
  white-space: pre;
  color: #333;
}

.conversation-list {
  margin-top: 16px;
}

.conversation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  background: #fff;
}

.conversation-info {
  flex: 1;
}

.conversation-name {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.conversation-meta {
  font-size: 12px;
  color: #666;
}

.knowledge-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

/* Test Screen */
.test-screen {
  max-width: 1200px;
  margin: 0 auto;
}

.test-container h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
  color: #000;
}

.test-layout {
  display: flex;
  gap: 24px;
  margin: 32px 0;
}

.chat-panel {
  flex: 0 0 400px;
  height: 700px;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.chat-content-area {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
}

.config-panel {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 24px;
  background: #fafafa;
  overflow-y: auto;
  max-height: 700px;
}

.config-panel h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
}

.config-subtitle {
  font-size: 13px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

.config-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.config-section:last-of-type {
  border-bottom: none;
}

.config-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
}

.config-input,
.config-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: system-ui, sans-serif;
  transition: border-color 0.2s;
  background: #fff;
}

.config-input:focus,
.config-textarea:focus {
  outline: none;
  border-color: #000;
}

.config-textarea {
  resize: vertical;
}

.editable-answers {
  margin-top: 12px;
}

.answer-item {
  margin-bottom: 16px;
}

.answer-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 6px;
  color: #333;
}

.answer-input,
.answer-textarea,
.answer-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  font-family: system-ui, sans-serif;
  transition: border-color 0.2s;
  background: #fff;
}

.answer-input:focus,
.answer-textarea:focus,
.answer-select:focus {
  outline: none;
  border-color: #000;
}

.answer-textarea {
  resize: vertical;
}

.knowledge-list {
  margin-top: 12px;
}

.knowledge-group {
  margin-bottom: 16px;
}

.knowledge-group-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.knowledge-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 6px;
  transition: all 0.15s;
}

.knowledge-item:hover {
  border-color: #bbb;
}

.knowledge-name {
  font-size: 13px;
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-remove-small {
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-remove-small:hover {
  border-color: #000;
  background: #f5f5f5;
}

.btn-add-knowledge {
  width: 100%;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  margin-top: 8px;
  transition: all 0.2s;
  color: #000;
}

.btn-add-knowledge:hover {
  border-color: #000;
  background: #f5f5f5;
}

.config-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.btn-save-changes {
  width: 100%;
  padding: 12px 20px;
  background: #4CAF50;
  color: #fff;
  border: 1px solid #4CAF50;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-save-changes:hover {
  background: #45a049;
  border-color: #45a049;
}

.chat-panel h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #000;
}

/* Agent Introduction - SiteGPT-style */
.agent-introduction {
  padding: 16px;
}

.agent-greeting {
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.greeting-emoji {
  font-size: 28px;
  display: block;
  margin-bottom: 12px;
}

.agent-greeting h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #000;
}

.agent-intro-purpose {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 auto;
}

.agent-capabilities {
  margin-bottom: 24px;
}

.agent-capabilities h4 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #000;
}

.agent-capabilities ul {
  list-style: none;
  padding: 0;
}

.agent-capabilities li {
  font-size: 13px;
  color: #333;
  padding: 6px 0;
  padding-left: 20px;
  position: relative;
  line-height: 1.4;
}

.agent-capabilities li::before {
  content: "•";
  position: absolute;
  left: 6px;
  color: #666;
  font-weight: bold;
}

.suggested-prompts {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.prompts-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #666;
}

.prompt-btn {
  display: block;
  width: 100%;
  padding: 10px 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  margin-bottom: 6px;
  transition: all 0.2s;
  color: #333;
}

.prompt-btn:hover {
  border-color: #000;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.chat-messages {
  padding: 16px;
}

.chat-message {
  margin-bottom: 12px;
}

.chat-message.user .message-content {
  background: #000;
  color: #fff;
  padding: 10px 14px;
  border-radius: 6px;
  margin-left: 10%;
  font-size: 13px;
  line-height: 1.5;
}

.chat-message.assistant .message-content {
  background: #fff;
  border: 1px solid #e0e0e0;
  padding: 10px 14px;
  border-radius: 6px;
  margin-right: 10%;
  font-size: 13px;
  line-height: 1.5;
}

.chat-input-container {
  display: flex;
  gap: 8px;
}

.chat-input-container input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.chat-input-container input:focus {
  outline: none;
  border-color: #000;
}

.chat-input-container button {
  padding: 10px 20px;
  background: #000;
  color: #fff;
  border: 1px solid #000;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.chat-input-container button:hover:not(:disabled) {
  background: #333;
  border-color: #333;
}

.chat-input-container button:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Execution Screen */
.execution-screen {
  max-width: 700px;
  margin: 0 auto;
}

.execution-container h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 32px;
  text-align: center;
  color: #000;
}

.execution-progress {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 24px;
  margin-bottom: 32px;
  background: #fafafa;
}

.execution-phase {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.execution-phase:last-child {
  margin-bottom: 0;
}

.phase-status {
  font-size: 18px;
  min-width: 24px;
  line-height: 1;
}

.phase-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #000;
}

.phase-current {
  font-size: 13px;
  color: #666;
  font-style: italic;
}

.execution-complete {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 32px;
  text-align: center;
  background: #fafafa;
}

.execution-complete h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #000;
}

.execution-complete p {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* Buttons - Match workspace styles */
.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #000;
  color: #fff;
  border-color: #000;
}

.btn-primary:hover:not(:disabled) {
  background: #333;
  border-color: #333;
}

.btn-primary:disabled {
  background: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #fff;
  color: #000;
  border-color: #ddd;
}

.btn-secondary:hover {
  border-color: #000;
  background: #f5f5f5;
}
</style>
