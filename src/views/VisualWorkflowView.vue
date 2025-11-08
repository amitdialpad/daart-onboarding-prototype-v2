<template>
  <div class="visual-workflow-view">
    <div class="workflow-container">
      <!-- Left Panel: Conversation Flow Canvas -->
      <div class="flow-canvas-panel">
        <!-- Intent Context -->
        <div v-if="userIntent" class="intent-context">
          <div class="intent-header">
            <button class="back-btn" @click="goBack">← Back</button>
            <p class="intent-label">Building agent for:</p>
          </div>
          <p class="intent-text">{{ userIntent }}</p>
        </div>

        <div class="canvas-header">
          <h2>Conversation Flow</h2>
          <div class="canvas-controls">
            <button class="control-btn" @click="zoomOut">-</button>
            <span class="zoom-level">{{ Math.round(zoom * 100) }}%</span>
            <button class="control-btn" @click="zoomIn">+</button>
            <button class="control-btn" @click="resetView">Reset</button>
            <button class="continue-btn" @click="continueToTest">Continue to Test →</button>
          </div>
        </div>

        <!-- Canvas Area -->
        <div class="canvas-area" ref="canvasArea">
          <div class="canvas-content" :style="{ transform: `scale(${zoom})` }">
            <!-- Flow Nodes -->
            <div
              v-for="node in flowNodes"
              :key="node.id"
              class="flow-node"
              :class="[node.type, { selected: selectedNode?.id === node.id }]"
              :style="{ left: node.x + 'px', top: node.y + 'px' }"
              @click="selectNode(node)"
            >
              <div class="node-header">
                <span class="node-icon">{{ getNodeIcon(node.type) }}</span>
                <span class="node-title">{{ node.title }}</span>
              </div>
              <div class="node-body">
                <p class="node-content">{{ node.content }}</p>
              </div>
              <div v-if="node.branches && node.branches.length > 0" class="node-branches">
                <div
                  v-for="branch in node.branches"
                  :key="branch.id"
                  class="branch-item"
                >
                  {{ branch.label }}
                </div>
              </div>
            </div>

            <!-- Connections -->
            <svg class="connections-svg">
              <path
                v-for="conn in connections"
                :key="conn.id"
                :d="conn.path"
                class="connection-path"
                stroke="#999"
                stroke-width="2"
                fill="none"
              />
            </svg>
          </div>

          <!-- Empty State -->
          <div v-if="flowNodes.length === 0" class="canvas-empty-state">
            <p>No conversation flow yet</p>
            <p class="empty-hint">Start building with AI on the right →</p>
          </div>
        </div>
      </div>

      <!-- Right Panel: AI Builder + Node Editor -->
      <div class="builder-panel">
        <div class="builder-tabs">
          <button
            :class="{ active: activeTab === 'ai' }"
            @click="activeTab = 'ai'"
          >
            Build with AI
          </button>
          <button
            :class="{ active: activeTab === 'edit' }"
            @click="activeTab = 'edit'"
            :disabled="!selectedNode"
          >
            Edit Node
          </button>
        </div>

        <!-- AI Builder Tab -->
        <div v-if="activeTab === 'ai'" class="ai-builder-tab">
          <div class="ai-messages" ref="aiMessagesContainer">
            <div v-for="msg in aiMessages" :key="msg.id" class="ai-message" :class="msg.role">
              <div class="message-content">{{ msg.content }}</div>
            </div>
            <div v-if="isAiTyping" class="ai-message assistant">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>

          <div class="ai-input-area">
            <textarea
              v-model="aiInput"
              placeholder="Describe the conversation flow you want to build..."
              rows="3"
              @keydown.enter.prevent="sendAiMessage"
            ></textarea>
            <button
              class="send-btn"
              :disabled="!aiInput.trim()"
              @click="sendAiMessage"
            >
              Send
            </button>
          </div>
        </div>

        <!-- Edit Node Tab -->
        <div v-if="activeTab === 'edit' && selectedNode" class="edit-node-tab">
          <h3>Edit Node</h3>

          <div class="form-group">
            <label>Node Type</label>
            <select v-model="selectedNode.type" @change="updateFlow">
              <option value="start">Start</option>
              <option value="question">Ask Question</option>
              <option value="branch">Branch</option>
              <option value="action">Action</option>
              <option value="end">End</option>
            </select>
          </div>

          <div class="form-group">
            <label>Title</label>
            <input v-model="selectedNode.title" @input="updateFlow" />
          </div>

          <div class="form-group">
            <label>Content</label>
            <textarea
              v-model="selectedNode.content"
              rows="4"
              @input="updateFlow"
            ></textarea>
          </div>

          <div v-if="selectedNode.type === 'branch' || selectedNode.type === 'question'" class="form-group">
            <label>Response Branches</label>
            <div class="branches-list">
              <div
                v-for="(branch, index) in selectedNode.branches"
                :key="branch.id"
                class="branch-edit-item"
              >
                <input v-model="branch.label" placeholder="Branch label" @input="updateFlow" />
                <button class="remove-btn" @click="removeBranch(index)">×</button>
              </div>
              <button class="add-branch-btn" @click="addBranch">+ Add Branch</button>
            </div>
          </div>

          <div class="form-actions">
            <button class="delete-btn" @click="deleteNode">Delete Node</button>
            <button class="add-node-btn" @click="addNodeAfter">Add Node After</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userIntent = ref('')
const zoom = ref(1)
const canvasArea = ref(null)
const flowNodes = ref([])
const connections = ref([])
const selectedNode = ref(null)
const activeTab = ref('ai')
const aiMessages = ref([])
const aiInput = ref('')
const isAiTyping = ref(false)
const aiMessagesContainer = ref(null)

onMounted(() => {
  // Load intent data
  const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')
  if (!buildData.intent) {
    router.push('/home')
    return
  }
  userIntent.value = buildData.intent

  // Initial AI greeting
  addAiMessage('assistant', `Hi! I'll help you build a conversation flow for: "${userIntent.value}"\n\nTell me how your agent should handle conversations. For example:\n• "Start by asking for their name"\n• "Ask if they want to book or reschedule"\n• "Handle payment confirmation"`)

  // Load saved flow if exists
  loadFlow()
})

function goBack() {
  // Save current flow before leaving
  saveFlow()
  router.push('/build-agent')
}

function continueToTest() {
  // Save flow and navigate to test/preview
  saveFlow()
  router.push('/test-agent')
}

function zoomIn() {
  zoom.value = Math.min(zoom.value + 0.1, 2)
}

function zoomOut() {
  zoom.value = Math.max(zoom.value - 0.1, 0.5)
}

function resetView() {
  zoom.value = 1
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

function selectNode(node) {
  selectedNode.value = node
  activeTab.value = 'edit'
}

function addAiMessage(role, content) {
  aiMessages.value.push({
    id: Date.now() + Math.random(),
    role,
    content,
    timestamp: new Date()
  })

  nextTick(() => {
    if (aiMessagesContainer.value) {
      aiMessagesContainer.value.scrollTop = aiMessagesContainer.value.scrollHeight
    }
  })
}

async function sendAiMessage() {
  if (!aiInput.value.trim()) return

  const userMessage = aiInput.value.trim()
  addAiMessage('user', userMessage)
  aiInput.value = ''

  isAiTyping.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  isAiTyping.value = false

  // Generate flow based on message
  generateFlowFromPrompt(userMessage)
}

function generateFlowFromPrompt(prompt) {
  const lowerPrompt = prompt.toLowerCase()

  if (flowNodes.value.length === 0) {
    // First interaction - create basic flow
    if (lowerPrompt.includes('name') || lowerPrompt.includes('start')) {
      flowNodes.value = [
        {
          id: 'start-1',
          type: 'start',
          title: 'Start Conversation',
          content: 'User initiates conversation',
          x: 100,
          y: 50,
          branches: []
        },
        {
          id: 'question-1',
          type: 'question',
          title: 'Ask for Name',
          content: 'What is your name?',
          x: 100,
          y: 200,
          branches: [
            { id: 'b1', label: 'Name provided' }
          ]
        }
      ]

      connections.value = [
        {
          id: 'c1',
          from: 'start-1',
          to: 'question-1',
          path: 'M 200 110 L 200 200'
        }
      ]

      addAiMessage('assistant', 'I\'ve created a basic flow that asks for the user\'s name. What should happen next?')
    } else if (lowerPrompt.includes('book') || lowerPrompt.includes('appointment')) {
      flowNodes.value = [
        {
          id: 'start-1',
          type: 'start',
          title: 'Start Conversation',
          content: 'User wants to book',
          x: 100,
          y: 50,
          branches: []
        },
        {
          id: 'question-1',
          type: 'question',
          title: 'New or Reschedule',
          content: 'Would you like to book a new appointment or reschedule?',
          x: 100,
          y: 200,
          branches: [
            { id: 'b1', label: 'New booking' },
            { id: 'b2', label: 'Reschedule' }
          ]
        }
      ]

      connections.value = [
        {
          id: 'c1',
          from: 'start-1',
          to: 'question-1',
          path: 'M 200 110 L 200 200'
        }
      ]

      addAiMessage('assistant', 'I\'ve created a booking flow with options for new bookings or rescheduling. Would you like to expand either branch?')
    } else {
      // Generic start
      flowNodes.value = [
        {
          id: 'start-1',
          type: 'start',
          title: 'Start Conversation',
          content: 'Conversation begins',
          x: 100,
          y: 50,
          branches: []
        }
      ]

      addAiMessage('assistant', 'I\'ve created a start node. What should the agent ask or do first?')
    }
  } else {
    // Expanding existing flow
    if (lowerPrompt.includes('add') || lowerPrompt.includes('next')) {
      const lastNode = flowNodes.value[flowNodes.value.length - 1]
      const newNode = {
        id: `question-${flowNodes.value.length + 1}`,
        type: 'question',
        title: 'New Question',
        content: 'What would you like to know?',
        x: lastNode.x,
        y: lastNode.y + 180,
        branches: [{ id: `b${Date.now()}`, label: 'User responds' }]
      }

      flowNodes.value.push(newNode)
      connections.value.push({
        id: `c${connections.value.length + 1}`,
        from: lastNode.id,
        to: newNode.id,
        path: `M ${lastNode.x + 100} ${lastNode.y + 70} L ${newNode.x + 100} ${newNode.y}`
      })

      addAiMessage('assistant', 'I\'ve added a new question node. Edit it on the right to customize the question.')
    } else {
      addAiMessage('assistant', 'I can help you:\n• "Add a question about X"\n• "Create a branch for Y"\n• "Add an action to Z"\n\nWhat would you like to do?')
    }
  }

  saveFlow()
}

function updateFlow() {
  // Trigger reactivity and save
  flowNodes.value = [...flowNodes.value]
  saveFlow()
}

function addBranch() {
  if (!selectedNode.value.branches) {
    selectedNode.value.branches = []
  }
  selectedNode.value.branches.push({
    id: `b${Date.now()}`,
    label: 'New branch'
  })
  updateFlow()
}

function removeBranch(index) {
  selectedNode.value.branches.splice(index, 1)
  updateFlow()
}

function deleteNode() {
  if (!selectedNode.value) return

  const nodeId = selectedNode.value.id
  flowNodes.value = flowNodes.value.filter(n => n.id !== nodeId)
  connections.value = connections.value.filter(c => c.from !== nodeId && c.to !== nodeId)
  selectedNode.value = null
  activeTab.value = 'ai'
  saveFlow()
}

function addNodeAfter() {
  if (!selectedNode.value) return

  const newNode = {
    id: `node-${Date.now()}`,
    type: 'question',
    title: 'New Node',
    content: 'New content',
    x: selectedNode.value.x + 250,
    y: selectedNode.value.y,
    branches: []
  }

  flowNodes.value.push(newNode)
  connections.value.push({
    id: `c${Date.now()}`,
    from: selectedNode.value.id,
    to: newNode.id,
    path: `M ${selectedNode.value.x + 200} ${selectedNode.value.y + 50} L ${newNode.x} ${newNode.y + 50}`
  })

  updateFlow()
}

function saveFlow() {
  const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')
  buildData.workflow = {
    nodes: flowNodes.value,
    connections: connections.value,
    timestamp: Date.now()
  }
  localStorage.setItem('daart-building-agent', JSON.stringify(buildData))
}

function loadFlow() {
  const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')
  if (buildData.workflow) {
    flowNodes.value = buildData.workflow.nodes || []
    connections.value = buildData.workflow.connections || []
  }
}
</script>

<style scoped>
.visual-workflow-view {
  width: 100%;
  height: 100vh;
  background: #fafafa;
  overflow: hidden;
}

.workflow-container {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 400px;
  overflow: hidden;
}

/* Left Panel: Canvas */
.flow-canvas-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  overflow: hidden;
  min-width: 0;
}

.intent-context {
  padding: 16px 24px;
  background: #f8f8f8;
  border-bottom: 1px solid #e0e0e0;
}

.intent-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.back-btn {
  padding: 6px 12px;
  background: transparent;
  color: #666;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #fff;
  color: #000;
  border-color: #000;
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
  line-height: 1.4;
  margin: 0;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.canvas-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.canvas-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-btn {
  padding: 6px 12px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #000;
  color: #fff;
  border-color: #000;
}

.zoom-level {
  font-size: 13px;
  color: #666;
  min-width: 50px;
  text-align: center;
}

.continue-btn {
  padding: 8px 16px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: 8px;
}

.continue-btn:hover {
  background: #333;
}

.canvas-area {
  flex: 1;
  position: relative;
  overflow: auto;
  background: #fafafa;
}

.canvas-content {
  position: relative;
  width: 100%;
  min-width: 800px;
  height: 100%;
  min-height: 600px;
  transform-origin: top left;
  transition: transform 0.2s;
}

.canvas-empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
}

.canvas-empty-state p {
  margin: 8px 0;
}

.empty-hint {
  font-size: 13px;
  font-style: italic;
}

/* Flow Nodes */
.flow-node {
  position: absolute;
  width: 200px;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.flow-node:hover {
  border-color: #999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.flow-node.selected {
  border-color: #000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.flow-node.start {
  border-color: #4caf50;
}

.flow-node.end {
  border-color: #f44336;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #f8f8f8;
  border-radius: 6px 6px 0 0;
}

.node-icon {
  font-size: 16px;
}

.node-title {
  font-size: 13px;
  font-weight: 600;
  color: #000;
}

.node-body {
  padding: 12px;
}

.node-content {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

.node-branches {
  padding: 8px 12px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.branch-item {
  font-size: 12px;
  color: #666;
  padding: 4px 0;
}

.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.flow-node {
  z-index: 2;
}

/* Right Panel: Builder */
.builder-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  height: 100vh;
  overflow: hidden;
}

.builder-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.builder-tabs button {
  flex: 1;
  padding: 14px 8px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.builder-tabs button.active {
  color: #000;
  border-bottom-color: #000;
}

.builder-tabs button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* AI Builder Tab */
.ai-builder-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.ai-message {
  max-width: 85%;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.ai-message.user {
  background: #000;
  color: #fff;
  align-self: flex-end;
}

.ai-message.assistant {
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
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #666;
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

.ai-input-area {
  flex-shrink: 0;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
  align-items: flex-end;
  background: #fff;
}

.ai-input-area textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
}

.ai-input-area textarea:focus {
  outline: none;
  border-color: #000;
}

.send-btn {
  padding: 10px 20px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
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

/* Edit Node Tab */
.edit-node-tab {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 0;
}

.edit-node-tab h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  margin-bottom: 6px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #000;
}

.branches-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.branch-edit-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.branch-edit-item input {
  flex: 1;
}

.remove-btn {
  width: 28px;
  height: 28px;
  background: #f44336;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-branch-btn {
  padding: 8px 12px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-branch-btn:hover {
  background: #000;
  color: #fff;
  border-color: #000;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.delete-btn,
.add-node-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.delete-btn {
  background: #fff;
  color: #f44336;
  border-color: #f44336;
}

.delete-btn:hover {
  background: #f44336;
  color: #fff;
}

.add-node-btn {
  background: #000;
  color: #fff;
  border-color: #000;
}

.add-node-btn:hover {
  background: #333;
}

@media (max-width: 1024px) {
  .workflow-container {
    grid-template-columns: 1fr;
  }

  .builder-panel {
    display: none;
  }
}
</style>
