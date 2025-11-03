<template>
  <div class="dashboard">
    <nav class="sidebar">
      <div class="logo">DAART Standalone</div>
      <div class="nav-items">
        <router-link to="/dashboard" class="nav-item">
          <span class="icon">📊</span> Dashboard
        </router-link>
        <router-link to="/workflow-builder" class="nav-item">
          <span class="icon">🔀</span> Workflow Builder
        </router-link>
        <router-link to="/skill-builder" class="nav-item active">
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
            <span
              >Connect to external services and build powerful AI skills. All premium connectors
              free during trial.</span
            >
          </div>
        </div>
      </div>

      <header class="page-header">
        <div>
          <h1>Skill Builder</h1>
          <p>Configure your AI agent's skills and connect to external services</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="showConnections = true">
            <span>🔌</span> Manage Connections
          </button>
          <button class="btn-primary" @click="saveSkill">
            <span>💾</span> Save Skill
          </button>
        </div>
      </header>

      <!-- Skill Configuration -->
      <div class="content-grid">
        <!-- Left: Skill Details -->
        <div class="skill-config">
          <div class="card">
            <h2>Skill Details</h2>
            <div class="form-group">
              <label>Skill Name</label>
              <input v-model="skillName" placeholder="e.g., Customer Support Assistant" />
            </div>
            <div class="form-group">
              <label>Description</label>
              <textarea
                v-model="skillDescription"
                placeholder="Describe what this skill does..."
                rows="3"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Instructions for AI</label>
              <textarea
                v-model="skillInstructions"
                placeholder="You are a helpful customer support assistant. Be friendly and professional..."
                rows="5"
              ></textarea>
            </div>
          </div>

          <!-- Selected Actions -->
          <div class="card">
            <div class="card-header">
              <h2>Actions ({{ selectedActions.length }}/15)</h2>
              <button class="btn-secondary btn-small" @click="showActionPicker = true">
                + Add Action
              </button>
            </div>
            <div class="actions-list">
              <div
                v-for="action in selectedActions"
                :key="action.id"
                class="action-item"
                @click="selectedAction = action"
              >
                <div class="action-icon">{{ action.icon }}</div>
                <div class="action-info">
                  <div class="action-name">{{ action.name }}</div>
                  <div class="action-source">{{ action.source }}</div>
                </div>
                <button class="action-remove" @click.stop="removeAction(action.id)">×</button>
              </div>
              <div v-if="selectedActions.length === 0" class="empty-state">
                <span class="empty-icon">⚡</span>
                <p>No actions added yet</p>
                <button class="btn-primary btn-small" @click="showActionPicker = true">
                  Add Your First Action
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Action Configuration -->
        <div class="action-config">
          <div class="card" v-if="selectedAction">
            <div class="card-header">
              <h2>{{ selectedAction.name }}</h2>
              <span class="badge">{{ selectedAction.source }}</span>
            </div>
            <div class="action-details">
              <p>{{ selectedAction.description }}</p>

              <div class="form-group" v-if="selectedAction.requiresConnection">
                <label>Connection</label>
                <select v-model="selectedAction.connectionId">
                  <option value="">Select connection...</option>
                  <option
                    v-for="conn in getConnectionsForAction(selectedAction)"
                    :key="conn.id"
                    :value="conn.id"
                  >
                    {{ conn.name }}
                  </option>
                </select>
                <button
                  class="btn-link"
                  @click="showConnections = true"
                  style="margin-top: 8px"
                >
                  + Create new connection
                </button>
              </div>

              <div class="form-group">
                <label>Parameters</label>
                <div v-for="param in selectedAction.parameters" :key="param.name" class="param-row">
                  <label class="param-label">{{ param.name }}</label>
                  <input v-model="param.value" :placeholder="param.placeholder" />
                </div>
              </div>
            </div>
          </div>
          <div class="card empty-state" v-else>
            <span class="empty-icon">⚙️</span>
            <p>Select an action to configure</p>
          </div>
        </div>
      </div>

      <!-- Action Picker Modal -->
      <div v-if="showActionPicker" class="modal-overlay" @click="showActionPicker = false">
        <div class="modal-content large" @click.stop>
          <div class="modal-header">
            <h2>Add Action</h2>
            <button @click="showActionPicker = false" class="close-btn">×</button>
          </div>
          <div class="modal-search">
            <input
              v-model="searchQuery"
              placeholder="Search actions..."
              class="search-input"
            />
            <div class="filter-tabs">
              <button
                :class="{ active: actionFilter === 'all' }"
                @click="actionFilter = 'all'"
              >
                All Actions
              </button>
              <button
                :class="{ active: actionFilter === 'connected' }"
                @click="actionFilter = 'connected'"
              >
                Connected Only
              </button>
            </div>
          </div>
          <div class="modal-body">
            <div class="action-grid">
              <div
                v-for="action in filteredActions"
                :key="action.id"
                class="action-card"
                :class="{ disabled: !action.connected && actionFilter === 'connected' }"
                @click="addAction(action)"
              >
                <div class="action-card-icon">{{ action.icon }}</div>
                <div class="action-card-content">
                  <div class="action-card-name">{{ action.name }}</div>
                  <div class="action-card-source">{{ action.source }}</div>
                  <div class="action-card-description">{{ action.description }}</div>
                </div>
                <div v-if="!action.connected" class="action-card-badge">Not Connected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Connections Modal -->
      <div v-if="showConnections" class="modal-overlay" @click="showConnections = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>Manage Connections</h2>
            <button @click="showConnections = false" class="close-btn">×</button>
          </div>
          <div class="modal-body">
            <div class="connections-list">
              <div v-for="conn in connections" :key="conn.id" class="connection-item">
                <div class="connection-icon">{{ conn.icon }}</div>
                <div class="connection-info">
                  <div class="connection-name">{{ conn.name }}</div>
                  <div class="connection-service">{{ conn.service }}</div>
                </div>
                <div class="connection-status">
                  <span class="status-badge connected">Connected</span>
                </div>
                <button class="btn-secondary btn-small">Test</button>
              </div>
            </div>
            <button class="btn-primary" style="margin-top: 20px" @click="addConnection">
              + Add New Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAgenticStandaloneStore } from '../stores/agenticStandalone'

const agenticStore = useAgenticStandaloneStore()

const skillName = ref('Customer Support Assistant')
const skillDescription = ref('Helps customers with common inquiries and tasks')
const skillInstructions = ref(
  'You are a helpful customer support assistant. Be friendly, professional, and provide accurate information. Always verify customer identity before sharing sensitive information.'
)

const selectedActions = ref([
  {
    id: 1,
    name: 'Create Calendar Event',
    source: 'Google Calendar',
    icon: '📅',
    description: 'Schedule appointments and meetings',
    requiresConnection: true,
    connectionId: 'google-cal-1',
    parameters: [
      { name: 'title', value: '', placeholder: 'Event title' },
      { name: 'duration', value: '30', placeholder: 'Duration in minutes' }
    ]
  },
  {
    id: 2,
    name: 'Send SMS',
    source: 'Dialpad',
    icon: '💬',
    description: 'Send text messages to customers',
    requiresConnection: false,
    parameters: [{ name: 'template', value: '', placeholder: 'Message template' }]
  }
])

const selectedAction = ref(selectedActions.value[0])
const showActionPicker = ref(false)
const showConnections = ref(false)
const searchQuery = ref('')
const actionFilter = ref('all')

const availableActions = [
  {
    id: 101,
    name: 'Create Calendar Event',
    source: 'Google Calendar',
    icon: '📅',
    description: 'Schedule appointments and meetings in Google Calendar',
    connected: true,
    requiresConnection: true,
    parameters: [
      { name: 'title', value: '', placeholder: 'Event title' },
      { name: 'duration', value: '30', placeholder: 'Duration in minutes' }
    ]
  },
  {
    id: 102,
    name: 'Search Contacts',
    source: 'Salesforce',
    icon: '👤',
    description: 'Find customer information in Salesforce CRM',
    connected: true,
    requiresConnection: true,
    parameters: [{ name: 'query', value: '', placeholder: 'Search query' }]
  },
  {
    id: 103,
    name: 'Create Support Ticket',
    source: 'Zendesk',
    icon: '🎫',
    description: 'Open support tickets automatically',
    connected: false,
    requiresConnection: true,
    parameters: [
      { name: 'priority', value: 'normal', placeholder: 'Priority level' },
      { name: 'category', value: '', placeholder: 'Ticket category' }
    ]
  },
  {
    id: 104,
    name: 'Send SMS',
    source: 'Dialpad',
    icon: '💬',
    description: 'Send text messages to customers',
    connected: true,
    requiresConnection: false,
    parameters: [{ name: 'template', value: '', placeholder: 'Message template' }]
  },
  {
    id: 105,
    name: 'Search Knowledge Base',
    source: 'Confluence',
    icon: '📚',
    description: 'Find answers in your knowledge base',
    connected: false,
    requiresConnection: true,
    parameters: [{ name: 'query', value: '', placeholder: 'Search terms' }]
  },
  {
    id: 106,
    name: 'Get Order Status',
    source: 'Shopify',
    icon: '📦',
    description: 'Check order status and tracking information',
    connected: false,
    requiresConnection: true,
    parameters: [{ name: 'order_id', value: '', placeholder: 'Order number' }]
  },
  {
    id: 107,
    name: 'Send Email',
    source: 'Gmail',
    icon: '📧',
    description: 'Send automated email responses',
    connected: true,
    requiresConnection: true,
    parameters: [
      { name: 'template', value: '', placeholder: 'Email template' },
      { name: 'subject', value: '', placeholder: 'Email subject' }
    ]
  },
  {
    id: 108,
    name: 'Log Activity',
    source: 'Dialpad',
    icon: '📝',
    description: 'Record conversation details and notes',
    connected: true,
    requiresConnection: false,
    parameters: [{ name: 'category', value: '', placeholder: 'Activity type' }]
  }
]

const connections = ref([
  { id: 'google-cal-1', name: 'My Google Calendar', service: 'Google Calendar', icon: '📅' },
  { id: 'salesforce-1', name: 'Production CRM', service: 'Salesforce', icon: '☁️' },
  { id: 'gmail-1', name: 'Support Email', service: 'Gmail', icon: '📧' }
])

const filteredActions = computed(() => {
  let actions = availableActions.filter((a) => !selectedActions.value.find((sa) => sa.id === a.id))

  if (actionFilter.value === 'connected') {
    actions = actions.filter((a) => a.connected)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    actions = actions.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.source.toLowerCase().includes(query) ||
        a.description.toLowerCase().includes(query)
    )
  }

  return actions
})

function addAction(action) {
  if (selectedActions.value.length >= 15) {
    alert('Maximum 15 actions per skill')
    return
  }
  if (!action.connected) {
    const confirm = window.confirm(
      `${action.source} is not connected. Would you like to request a connection?`
    )
    if (confirm) {
      alert(`Connection request sent! Your admin will be notified.`)
    }
    return
  }
  selectedActions.value.push({ ...action })
  showActionPicker.value = false
}

function removeAction(id) {
  selectedActions.value = selectedActions.value.filter((a) => a.id !== id)
  if (selectedAction.value?.id === id) {
    selectedAction.value = selectedActions.value[0] || null
  }
}

function getConnectionsForAction(action) {
  return connections.value.filter((c) => c.service === action.source)
}

function addConnection() {
  alert('OAuth flow would open here to connect to a new service.')
  showConnections.value = false
}

function saveSkill() {
  alert(
    `Skill "${skillName.value}" saved successfully! 🎉\n\nYour AI agent now has ${selectedActions.value.length} actions configured.`
  )
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

.content-grid {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 0;
  overflow: hidden;
}

.skill-config,
.action-config {
  padding: 32px;
  overflow-y: auto;
}

.action-config {
  background: #fafbfc;
  border-left: 1px solid #e0e0e0;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card h2 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h2 {
  margin: 0;
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

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.action-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f3ff;
  border-radius: 8px;
}

.action-info {
  flex: 1;
}

.action-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.action-source {
  font-size: 12px;
  color: #999;
}

.action-remove {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #f44336;
  color: white;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.empty-state {
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-state p {
  color: #999;
  margin-bottom: 16px;
}

.action-details {
  padding-top: 12px;
}

.action-details p {
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.param-row {
  margin-bottom: 12px;
}

.param-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.badge {
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1565c0;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
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

.btn-link {
  background: none;
  border: none;
  color: #667eea;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
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
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-content.large {
  max-width: 1000px;
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

.modal-search {
  padding: 20px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  margin-bottom: 16px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tabs button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tabs button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-card {
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.action-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.action-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-card-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.action-card-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.action-card-source {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}

.action-card-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.action-card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  background: #fff3cd;
  color: #856404;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.connections-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.connection-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.connection-icon {
  font-size: 32px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f3ff;
  border-radius: 8px;
}

.connection-info {
  flex: 1;
}

.connection-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
}

.connection-service {
  font-size: 13px;
  color: #999;
}

.connection-status {
  margin-right: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.connected {
  background: #e8f5e9;
  color: #2e7d32;
}
</style>
