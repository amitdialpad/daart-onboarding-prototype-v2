<template>
  <div class="dashboard">
    <nav class="sidebar">
      <div class="logo">DAART Standalone</div>
      <div class="nav-items">
        <router-link to="/dashboard" class="nav-item">
          <span class="icon">📊</span> Dashboard
        </router-link>
        <router-link to="/workflow-builder" class="nav-item active">
          <span class="icon">🔀</span> Workflow Builder
        </router-link>
        <router-link to="/skill-builder" class="nav-item">
          <span class="icon">⚡</span> Skill Builder
        </router-link>
        <router-link to="/credits" class="nav-item">
          <span class="icon">💳</span> Credits & Usage
        </router-link>
        <router-link to="/billing" class="nav-item">
          <span class="icon">💰</span> Billing
        </router-link>
      </div>
    </nav>

    <div class="main-content">
      <!-- Trial Banner -->
      <div v-if="agenticStore.isInTrial" class="premium-trial-banner">
        <div class="banner-content">
          <span class="icon">✨</span>
          <div>
            <strong>Premium Tools Included in Trial!</strong>
            <span>Build unlimited workflows and skills during your 14-day trial. No credit card required.</span>
          </div>
        </div>
      </div>

      <header class="page-header">
        <div>
          <h1>Workflow Builder</h1>
          <p>Design voice agent conversation flows with our visual editor</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="showTemplates = true">
            <span>📋</span> Use Template
          </button>
          <button class="btn-primary" @click="publishWorkflow">
            <span>🚀</span> Publish Workflow
          </button>
        </div>
      </header>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="tool-group">
          <div class="workflow-name">
            <input v-model="workflowName" placeholder="My Voice Workflow" />
          </div>
        </div>
        <div class="tool-group">
          <button class="tool-btn" @click="addNode('play')">
            <span>▶️</span> Play
          </button>
          <button class="tool-btn" @click="addNode('collect')">
            <span>🎤</span> Collect
          </button>
          <button class="tool-btn" @click="addNode('menu')">
            <span>📞</span> Menu
          </button>
          <button class="tool-btn" @click="addNode('api')">
            <span>🔌</span> API Call
          </button>
        </div>
      </div>

      <!-- Canvas Area -->
      <div class="canvas-container">
        <div class="canvas" ref="canvas">
          <!-- Start Node -->
          <div class="node start-node" :style="{ left: '50px', top: '100px' }">
            <div class="node-header start">
              <span class="node-icon">📞</span>
              <span>Incoming Call</span>
            </div>
          </div>

          <!-- Example Workflow Nodes -->
          <div
            v-for="node in workflowNodes"
            :key="node.id"
            class="node"
            :class="{ selected: selectedNode?.id === node.id }"
            :style="{ left: node.x + 'px', top: node.y + 'px' }"
            @click="selectNode(node)"
          >
            <div class="node-header" :class="node.type">
              <span class="node-icon">{{ getNodeIcon(node.type) }}</span>
              <span>{{ node.name }}</span>
            </div>
            <div class="node-body">
              <div class="node-detail" v-if="node.content">{{ node.content }}</div>
            </div>
            <button class="node-delete" @click.stop="deleteNode(node.id)">×</button>
          </div>

          <!-- Connection Lines (SVG) -->
          <svg class="connections">
            <line x1="150" y1="125" x2="250" y2="225" stroke="#667eea" stroke-width="2" />
            <line x1="350" y1="250" x2="450" y2="350" stroke="#667eea" stroke-width="2" />
            <line x1="350" y1="250" x2="450" y2="500" stroke="#667eea" stroke-width="2" />
          </svg>
        </div>

        <!-- Right Panel -->
        <div class="right-panel" v-if="selectedNode">
          <div class="panel-header">
            <h3>{{ selectedNode.name }}</h3>
            <button @click="selectedNode = null" class="close-btn">×</button>
          </div>
          <div class="panel-content">
            <div class="form-group">
              <label>Node Name</label>
              <input v-model="selectedNode.name" placeholder="Enter node name" />
            </div>

            <div class="form-group" v-if="selectedNode.type === 'play'">
              <label>Message to Play</label>
              <textarea
                v-model="selectedNode.content"
                placeholder="Welcome to our service..."
                rows="3"
              ></textarea>
              <button class="btn-secondary btn-small" style="margin-top: 8px">
                🎙️ Record Audio
              </button>
            </div>

            <div class="form-group" v-if="selectedNode.type === 'collect'">
              <label>Prompt</label>
              <textarea
                v-model="selectedNode.content"
                placeholder="Please enter your account number..."
                rows="3"
              ></textarea>
              <label style="margin-top: 12px">Input Type</label>
              <select v-model="selectedNode.inputType">
                <option value="digits">Digits</option>
                <option value="speech">Speech</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div class="form-group" v-if="selectedNode.type === 'menu'">
              <label>Menu Options</label>
              <div class="menu-options">
                <div v-for="(option, idx) in selectedNode.options" :key="idx" class="option-row">
                  <input v-model="option.key" placeholder="1" style="width: 50px" />
                  <input v-model="option.text" placeholder="Press 1 for sales" />
                </div>
              </div>
              <button class="btn-secondary btn-small" @click="addMenuOption">+ Add Option</button>
            </div>

            <div class="form-group" v-if="selectedNode.type === 'api'">
              <label>API Endpoint</label>
              <input v-model="selectedNode.endpoint" placeholder="https://api.example.com/..." />
              <label style="margin-top: 12px">Method</label>
              <select v-model="selectedNode.method">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Templates Modal -->
      <div v-if="showTemplates" class="modal-overlay" @click="showTemplates = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Workflow Templates</h2>
            <button @click="showTemplates = false" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <div class="template-grid">
              <div
                v-for="template in templates"
                :key="template.id"
                class="template-card"
                @click="loadTemplate(template)"
              >
                <div class="template-icon">{{ template.icon }}</div>
                <h3>{{ template.name }}</h3>
                <p>{{ template.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAgenticStandaloneStore } from '../stores/agenticStandalone'

const agenticStore = useAgenticStandaloneStore()

const workflowName = ref('Customer Service Workflow')
const selectedNode = ref(null)
const showTemplates = ref(false)

const workflowNodes = ref([
  {
    id: 1,
    type: 'play',
    name: 'Welcome Message',
    content: 'Thank you for calling. How can I help you today?',
    x: 250,
    y: 200
  },
  {
    id: 2,
    type: 'menu',
    name: 'Main Menu',
    content: 'Press 1 for sales, 2 for support',
    x: 450,
    y: 325,
    options: [
      { key: '1', text: 'Sales' },
      { key: '2', text: 'Support' }
    ]
  },
  {
    id: 3,
    type: 'api',
    name: 'Check Account',
    endpoint: 'https://api.example.com/account',
    method: 'GET',
    x: 450,
    y: 475
  }
])

const templates = [
  {
    id: 1,
    icon: '📞',
    name: 'Customer Support',
    description: 'Route callers to the right department with intelligent menu'
  },
  {
    id: 2,
    icon: '🏢',
    name: 'Office Hours',
    description: 'Handle calls differently based on business hours'
  },
  {
    id: 3,
    icon: '📦',
    name: 'Order Status',
    description: 'Let customers check order status via phone'
  },
  {
    id: 4,
    icon: '💳',
    name: 'Payment Collection',
    description: 'Securely collect payment information'
  }
]

function getNodeIcon(type) {
  const icons = {
    play: '▶️',
    collect: '🎤',
    menu: '📞',
    api: '🔌'
  }
  return icons[type] || '⚙️'
}

function selectNode(node) {
  selectedNode.value = node
}

function addNode(type) {
  const newNode = {
    id: Date.now(),
    type,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
    content: '',
    x: 300,
    y: 300,
    options: type === 'menu' ? [{ key: '1', text: 'Option 1' }] : undefined
  }
  workflowNodes.value.push(newNode)
  selectedNode.value = newNode
}

function deleteNode(id) {
  workflowNodes.value = workflowNodes.value.filter((n) => n.id !== id)
  if (selectedNode.value?.id === id) {
    selectedNode.value = null
  }
}

function addMenuOption() {
  if (selectedNode.value?.options) {
    selectedNode.value.options.push({ key: '', text: '' })
  }
}

function loadTemplate(template) {
  alert(`Loading template: ${template.name}`)
  showTemplates.value = false
}

function publishWorkflow() {
  alert('Workflow published successfully! 🚀\n\nYour voice agent is now live and ready to handle calls.')
}
</script>

<style scoped>
.dashboard {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background: #f8f9fa;
}

.sidebar {
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 24px;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 32px;
  padding: 12px;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f8f9fa;
}

.nav-item.active {
  background: #f0f3ff;
  color: #667eea;
  font-weight: 600;
}

.nav-item .icon {
  font-size: 20px;
}

.main-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.premium-trial-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 40px;
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1400px;
}

.banner-content .icon {
  font-size: 24px;
}

.banner-content strong {
  display: block;
  font-size: 16px;
  margin-bottom: 4px;
}

.banner-content span {
  font-size: 14px;
  opacity: 0.9;
}

.page-header {
  padding: 32px 40px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.page-header p {
  font-size: 15px;
  color: #666;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.toolbar {
  padding: 16px 40px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tool-group {
  display: flex;
  gap: 8px;
}

.workflow-name input {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  width: 300px;
}

.tool-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
}

.canvas-container {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 360px;
  overflow: hidden;
  background: #fafbfc;
}

.canvas {
  position: relative;
  overflow: auto;
  padding: 40px;
  min-height: 800px;
}

.connections {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.node {
  position: absolute;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  width: 200px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.node:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.node.selected {
  border-color: #667eea;
  border-width: 3px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.node.start-node {
  border-color: #4caf50;
}

.node-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  border-radius: 10px 10px 0 0;
}

.node-header.start {
  background: #e8f5e9;
  color: #2e7d32;
}

.node-header.play {
  background: #e3f2fd;
  color: #1565c0;
}

.node-header.collect {
  background: #fff3e0;
  color: #e65100;
}

.node-header.menu {
  background: #f3e5f5;
  color: #6a1b9a;
}

.node-header.api {
  background: #fce4ec;
  color: #c2185b;
}

.node-icon {
  font-size: 16px;
}

.node-body {
  padding: 12px 16px;
  font-size: 13px;
  color: #666;
}

.node-detail {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-delete {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  border: 2px solid white;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  display: none;
}

.node:hover .node-delete {
  display: block;
}

.right-panel {
  background: white;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
}

.panel-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  line-height: 1;
}

.close-btn:hover {
  color: #333;
}

.panel-content {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
}

.menu-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.option-row {
  display: flex;
  gap: 8px;
}

.btn-primary {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-secondary {
  padding: 10px 20px;
  background: white;
  color: #667eea;
  border: 1px solid #667eea;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f0f3ff;
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
}

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
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.template-card {
  padding: 24px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.template-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.template-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.template-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.template-card p {
  font-size: 14px;
  color: #666;
}
</style>
