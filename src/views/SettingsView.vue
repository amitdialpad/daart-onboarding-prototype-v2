<template>
  <div class="settings-container">
    <!-- Top Navigation -->
    <div class="top-nav">
      <div class="nav-left">
        <div class="app-title">Dialpad Agents</div>
      </div>
      <div class="nav-tabs">
        <button class="nav-tab" @click="goTo('/agents-workspace')">AGENTS</button>
        <button class="nav-tab" @click="goTo('/insights')">ANALYTICS</button>
        <button class="nav-tab" @click="goTo('/billing')">BILLING</button>
      </div>
      <div class="nav-right">
        <div class="profile-dropdown" @click="toggleProfileMenu">
          <span class="profile-email">admin@company.com</span>
          <span class="dropdown-arrow">{{ showProfileMenu ? '▲' : '▼' }}</span>
          <div v-if="showProfileMenu" class="dropdown-menu" @click.stop>
            <button class="dropdown-item" @click="goTo('/settings')">Settings</button>
            <button class="dropdown-item" @click="signOut">Sign Out</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="settings-content">
      <!-- Header -->
      <div class="settings-header">
        <h1>Settings</h1>
        <p class="settings-subtitle">Manage your account, team, and integrations</p>
      </div>

      <!-- Sub Navigation -->
      <div class="sub-nav">
        <button v-for="tab in tabs"
                :key="tab.id"
                class="sub-nav-tab"
                :class="{ active: activeTab === tab.id }"
                @click="activeTab = tab.id">
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content-area">
        <!-- Account Tab -->
        <div v-if="activeTab === 'account'" class="tab-content">
          <div class="settings-section">
            <h3>Profile Information</h3>

            <div class="form-group">
              <label>Full Name</label>
              <input v-model="profile.name" type="text" class="input-field">
            </div>

            <div class="form-group">
              <label>Email</label>
              <input v-model="profile.email" type="email" class="input-field">
            </div>

            <div class="form-group">
              <label>Company</label>
              <input v-model="profile.company" type="text" class="input-field">
            </div>

            <button class="btn-primary">Save Changes</button>
          </div>

          <div class="settings-section">
            <h3>Change Password</h3>

            <div class="form-group">
              <label>Current Password</label>
              <input type="password" class="input-field">
            </div>

            <div class="form-group">
              <label>New Password</label>
              <input type="password" class="input-field">
            </div>

            <div class="form-group">
              <label>Confirm New Password</label>
              <input type="password" class="input-field">
            </div>

            <button class="btn-primary">Update Password</button>
          </div>
        </div>

        <!-- Team Tab -->
        <div v-if="activeTab === 'team'" class="tab-content">
          <div class="settings-section">
            <div class="section-header">
              <h3>Team Members</h3>
              <button class="btn-primary" @click="showInviteModal = true">+ Invite Member</button>
            </div>

            <table class="team-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in teamMembers" :key="member.id">
                  <td>{{ member.name }}</td>
                  <td>{{ member.email }}</td>
                  <td>
                    <select v-model="member.role" class="role-select">
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td>
                    <span class="status-badge" :class="member.status">{{ member.status }}</span>
                  </td>
                  <td>
                    <button class="btn-text">Remove</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="settings-section">
            <h3>Roles & Permissions</h3>
            <div class="roles-info">
              <div class="role-item">
                <div class="role-name">Admin</div>
                <div class="role-desc">Full access to all features and settings</div>
              </div>
              <div class="role-item">
                <div class="role-name">Editor</div>
                <div class="role-desc">Can create and edit agents, but cannot manage team or billing</div>
              </div>
              <div class="role-item">
                <div class="role-name">Viewer</div>
                <div class="role-desc">Read-only access to agents and analytics</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Integrations Tab -->
        <div v-if="activeTab === 'integrations'" class="tab-content">
          <div class="settings-section">
            <h3>Available Integrations</h3>

            <div class="integrations-grid">
              <div v-for="integration in integrations"
                   :key="integration.id"
                   class="integration-card">
                <div class="integration-header">
                  <div class="integration-name">{{ integration.name }}</div>
                  <div v-if="integration.connected" class="connected-badge">Connected</div>
                </div>
                <div class="integration-desc">{{ integration.description }}</div>
                <button v-if="!integration.connected"
                        class="btn-secondary"
                        @click="connectIntegration(integration)">
                  Connect
                </button>
                <button v-else class="btn-text" @click="disconnectIntegration(integration)">
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>Webhooks</h3>
            <p class="section-desc">Send real-time events to your systems</p>

            <div class="webhooks-list">
              <div class="webhook-item">
                <div class="webhook-info">
                  <div class="webhook-url">https://api.yourcompany.com/webhooks</div>
                  <div class="webhook-events">Events: conversation.started, conversation.ended</div>
                </div>
                <button class="btn-text">Edit</button>
              </div>
            </div>

            <button class="btn-secondary">+ Add Webhook</button>
          </div>
        </div>

        <!-- API Keys Tab -->
        <div v-if="activeTab === 'api-keys'" class="tab-content">
          <div class="settings-section">
            <div class="section-header">
              <h3>API Keys</h3>
              <button class="btn-primary" @click="generateApiKey">+ Generate New Key</button>
            </div>

            <p class="section-desc">Use these keys to access the DAART API programmatically</p>

            <div class="api-keys-list">
              <div v-for="key in apiKeys"
                   :key="key.id"
                   class="api-key-item">
                <div class="api-key-info">
                  <div class="api-key-name">{{ key.name }}</div>
                  <div class="api-key-value">{{ key.key }}</div>
                  <div class="api-key-meta">Created {{ key.created }} · Last used {{ key.lastUsed }}</div>
                </div>
                <button class="btn-text-danger" @click="revokeApiKey(key)">Revoke</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>API Documentation</h3>
            <p>Learn how to integrate with DAART's API</p>
            <a href="#" class="btn-secondary">View API Docs →</a>
          </div>
        </div>

        <!-- Audit Log Tab -->
        <div v-if="activeTab === 'audit-log'" class="tab-content">
          <div class="settings-section">
            <h3>Activity Log</h3>
            <p class="section-desc">Track all actions performed in your account</p>

            <div class="audit-filters">
              <select class="filter-select">
                <option>All Actions</option>
                <option>Agent Changes</option>
                <option>Team Changes</option>
                <option>Deployments</option>
              </select>

              <select class="filter-select">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>

            <div class="audit-list">
              <div v-for="entry in auditLog"
                   :key="entry.id"
                   class="audit-entry">
                <div class="audit-timestamp">{{ entry.timestamp }}</div>
                <div class="audit-content">
                  <div class="audit-action">{{ entry.action }}</div>
                  <div class="audit-user">by {{ entry.user }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Usage Tracking
const usageData = ref({
  callsUsed: 0,
  callsLimit: 100,
  resetDate: null
})

onMounted(() => {
  const saved = localStorage.getItem('daart-usage')
  if (saved) {
    usageData.value = JSON.parse(saved)
  }
})

const usagePercentage = computed(() => {
  return Math.round((usageData.value.callsUsed / usageData.value.callsLimit) * 100)
})

const usageColor = computed(() => {
  const pct = usagePercentage.value
  if (pct < 70) return 'green'
  if (pct < 90) return 'yellow'
  return 'red'
})

// Tabs
const tabs = [
  { id: 'account', label: 'Account' },
  { id: 'team', label: 'Team' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'api-keys', label: 'API Keys' },
  { id: 'audit-log', label: 'Audit Log' }
]

const activeTab = ref('account')

// Profile
const profile = ref({
  name: 'Admin User',
  email: 'admin@company.com',
  company: 'Acme Corp'
})

// Team
const showInviteModal = ref(false)

const teamMembers = ref([
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin',
    status: 'active'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@company.com',
    role: 'editor',
    status: 'active'
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@company.com',
    role: 'viewer',
    status: 'pending'
  }
])

// Integrations
const integrations = ref([
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Sync knowledge base articles and tickets',
    connected: true
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Connect to your CRM for lead capture',
    connected: false
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications to Slack channels',
    connected: false
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Import documents from Google Drive',
    connected: false
  }
])

function connectIntegration(integration) {
  integration.connected = true
  alert(`Connected to ${integration.name}`)
}

function disconnectIntegration(integration) {
  integration.connected = false
  alert(`Disconnected from ${integration.name}`)
}

// API Keys
const apiKeys = ref([
  {
    id: 1,
    name: 'Production Key',
    key: 'daart_sk_live_abc123...',
    created: '2 weeks ago',
    lastUsed: '5 minutes ago'
  },
  {
    id: 2,
    name: 'Development Key',
    key: 'daart_sk_test_xyz789...',
    created: '1 month ago',
    lastUsed: '3 days ago'
  }
])

function generateApiKey() {
  const name = prompt('Enter a name for this API key:')
  if (name) {
    apiKeys.value.push({
      id: Date.now(),
      name: name,
      key: 'daart_sk_live_' + Math.random().toString(36).substr(2, 9) + '...',
      created: 'Just now',
      lastUsed: 'Never'
    })
  }
}

function revokeApiKey(key) {
  if (confirm(`Are you sure you want to revoke "${key.name}"? This action cannot be undone.`)) {
    const index = apiKeys.value.indexOf(key)
    if (index > -1) {
      apiKeys.value.splice(index, 1)
    }
  }
}

// Audit Log
const auditLog = ref([
  {
    id: 1,
    timestamp: '2 hours ago',
    action: 'Deployed agent "Support Assistant" to production',
    user: 'admin@company.com'
  },
  {
    id: 2,
    timestamp: '5 hours ago',
    action: 'Updated knowledge base for "Sales Bot"',
    user: 'jane@company.com'
  },
  {
    id: 3,
    timestamp: '1 day ago',
    action: 'Invited team member bob@company.com',
    user: 'admin@company.com'
  },
  {
    id: 4,
    timestamp: '2 days ago',
    action: 'Created new agent "Order Tracker"',
    user: 'admin@company.com'
  }
])

// Navigation
function goTo(path) {
  router.push(path)
}

// Profile Dropdown
const showProfileMenu = ref(false)

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value
}

function signOut() {
  // Clear localStorage
  localStorage.removeItem('daart-agents')
  localStorage.removeItem('daart-conversations')
  localStorage.removeItem('daart-onboarding-complete')
  // Redirect to signup
  router.push('/signup')
}
</script>

<style scoped>
.settings-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  font-family: apple-system, BlinkMacSystemFont, "SF Pro", "Segoe UI Adjusted", "Segoe UI", SFMono, "Helvetica Neue", Cantarell, Ubuntu, Roboto, Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

/* Top Navigation */
.top-nav {
  height: 50px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #fafafa;
}

.nav-left {
  flex: 1;
}

.app-title {
  font-weight: 600;
  font-size: 16px;
}

.nav-tabs {
  display: flex;
  gap: 4px;
}

.nav-tab {
  padding: 0 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent;
  height: 50px;
  display: flex;
  align-items: center;
  margin-bottom: -1px;
}

.nav-tab:hover {
  color: #000;
  background: #f0f0f0;
}

.nav-tab.active {
  color: #000;
  border-bottom-color: #000;
  font-weight: 600;
}

.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}

.usage-meter {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.usage-text {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

.usage-bar {
  width: 120px;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 3px;
}

.usage-fill.green {
  background: #34a853;
}

.usage-fill.yellow {
  background: #ff8800;
}

.usage-fill.red {
  background: #ea4335;
}

/* Profile Dropdown */
.profile-dropdown {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}

.profile-dropdown:hover {
  background: #f5f5f5;
}

.profile-email {
  font-size: 12px;
  color: #666;
}

.dropdown-arrow {
  font-size: 10px;
  color: #999;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 180px;
  z-index: 1000;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: background 0.2s;
}

.dropdown-item:first-child {
  border-radius: 4px 4px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 4px 4px;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

/* Content */
.settings-content {
  flex: 1;
  overflow-y: auto;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.settings-header {
  padding: 40px 40px 20px;
  border-bottom: 1px solid #ddd;
}

.settings-header h1 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.settings-subtitle {
  font-size: 14px;
  color: #666;
}

/* Sub Navigation */
.sub-nav {
  display: flex;
  border-bottom: 1px solid #ddd;
  background: #fafafa;
  padding: 0 40px;
}

.sub-nav-tab {
  padding: 12px 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent;
}

.sub-nav-tab:hover {
  color: #000;
  background: #f0f0f0;
}

.sub-nav-tab.active {
  color: #000;
  background: #fff;
  border-bottom-color: #000;
  font-weight: 600;
}

/* Tab Content */
.tab-content-area {
  padding: 40px;
}

.tab-content {
  max-width: 800px;
}

.settings-section {
  margin-bottom: 48px;
}

.settings-section h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.section-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 13px;
}

.input-field {
  width: 100%;
  max-width: 400px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.input-field:focus {
  outline: none;
  border-color: #000;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: 1px solid #000;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}

.btn-primary {
  background: #000;
  color: #fff;
}

.btn-primary:hover {
  background: #333;
}

.btn-secondary {
  background: #fff;
  color: #000;
  text-decoration: none;
  display: inline-block;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.btn-text {
  background: none;
  border: none;
  color: #0066cc;
  text-decoration: underline;
  cursor: pointer;
  font-size: 13px;
}

.btn-text-danger {
  background: none;
  border: none;
  color: #cc0000;
  text-decoration: underline;
  cursor: pointer;
  font-size: 13px;
}

/* Team Table */
.team-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ddd;
}

.team-table th,
.team-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.team-table th {
  background: #fafafa;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
}

.team-table td {
  font-size: 14px;
}

.role-select {
  padding: 4px 8px;
  border: 1px solid #ccc;
  font-size: 13px;
}

.status-badge {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: #e6f7e6;
  color: #00aa00;
}

.status-badge.pending {
  background: #fff5e6;
  color: #ff8800;
}

.roles-info {
  border: 1px solid #ddd;
  background: #fafafa;
  padding: 20px;
}

.role-item {
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.role-item:last-child {
  border-bottom: none;
}

.role-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.role-desc {
  font-size: 13px;
  color: #666;
}

/* Integrations Grid */
.integrations-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.integration-card {
  padding: 20px;
  border: 1px solid #ddd;
  background: #fafafa;
}

.integration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.integration-name {
  font-weight: 600;
  font-size: 16px;
}

.connected-badge {
  font-size: 11px;
  padding: 4px 8px;
  background: #00aa00;
  color: #fff;
  font-weight: 600;
}

.integration-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 16px;
}

/* Webhooks */
.webhooks-list {
  margin-bottom: 16px;
}

.webhook-item {
  padding: 16px;
  border: 1px solid #ddd;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.webhook-url {
  font-family: monospace;
  font-size: 13px;
  margin-bottom: 4px;
}

.webhook-events {
  font-size: 12px;
  color: #666;
}

/* API Keys */
.api-keys-list {
  margin-bottom: 24px;
}

.api-key-item {
  padding: 16px;
  border: 1px solid #ddd;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.api-key-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.api-key-value {
  font-family: monospace;
  font-size: 13px;
  margin-bottom: 4px;
}

.api-key-meta {
  font-size: 12px;
  color: #666;
}

/* Audit Log */
.audit-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  font-size: 13px;
}

.audit-list {
  border: 1px solid #ddd;
}

.audit-entry {
  padding: 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  gap: 16px;
}

.audit-entry:last-child {
  border-bottom: none;
}

.audit-timestamp {
  flex-shrink: 0;
  width: 120px;
  font-size: 12px;
  color: #666;
}

.audit-action {
  font-size: 14px;
  margin-bottom: 2px;
}

.audit-user {
  font-size: 12px;
  color: #666;
}
</style>
