<template>
  <div class="integrations-view">
    <div class="page-header">
      <div class="header-content">
        <h1>Integrations</h1>
        <p class="header-description">Connect your workspace tools to automatically sync knowledge</p>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="info-banner">
      <div class="info-content">
        <div class="info-text">
          Connect integrations to automatically keep your agent's knowledge up to date. Supported: Slack, Google Drive, Notion, Confluence, and more.
        </div>
      </div>
    </div>

    <!-- Available Integrations -->
    <div class="available-integrations-section">
      <div class="section-header">
        <h2>Available Integrations</h2>
      </div>

      <div class="integrations-grid">
        <div v-for="integration in availableIntegrations" :key="integration.id" class="integration-card">
          <div class="integration-icon">{{ integration.icon }}</div>
          <div class="integration-info">
            <div class="integration-name">{{ integration.name }}</div>
            <div class="integration-description">{{ integration.description }}</div>
          </div>
          <button class="btn-connect" @click="connectIntegration(integration)">Connect</button>
        </div>
      </div>
    </div>

    <!-- Connected Integrations -->
    <div v-if="connectedIntegrations.length > 0" class="connected-section">
      <div class="section-header">
        <h2>Connected Integrations</h2>
        <span class="integration-count">{{ connectedIntegrations.length }} {{ connectedIntegrations.length === 1 ? 'integration' : 'integrations' }}</span>
      </div>

      <div class="integrations-list">
        <div v-for="integration in connectedIntegrations" :key="integration.id" class="integration-item">
          <div class="integration-icon-small">{{ integration.icon }}</div>
          <div class="integration-details">
            <div class="integration-name-connected">{{ integration.name }}</div>
            <div class="integration-meta">Connected {{ integration.connectedAt }} • {{ integration.itemCount }} items synced</div>
          </div>
          <div class="integration-status" :class="integration.status">
            {{ integration.status }}
          </div>
          <button class="btn-icon-delete" @click="disconnectIntegration(integration.id)" title="Disconnect">
            ×
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <h3>No integrations connected yet</h3>
      <p>Connect your first integration to automatically sync knowledge with your agents</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const connectedIntegrations = ref([])

const availableIntegrations = ref([
  {
    id: 'slack',
    name: 'Slack',
    icon: '💬',
    description: 'Sync conversations and channels'
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    icon: '📁',
    description: 'Access documents and files'
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: '📝',
    description: 'Sync pages and databases'
  },
  {
    id: 'confluence',
    name: 'Confluence',
    icon: '🔷',
    description: 'Connect wiki pages and spaces'
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    icon: '🎫',
    description: 'Import support tickets and articles'
  },
  {
    id: 'intercom',
    name: 'Intercom',
    icon: '💡',
    description: 'Sync help center and conversations'
  }
])

onMounted(() => {
  loadIntegrations()
})

function loadIntegrations() {
  const sources = JSON.parse(localStorage.getItem('daart-knowledge-sources') || '{}')
  connectedIntegrations.value = sources.integrations || []
}

function connectIntegration(integration) {
  // Simulate connection
  const newIntegration = {
    id: Date.now().toString(),
    name: integration.name,
    icon: integration.icon,
    platform: integration.id,
    connectedAt: 'Just now',
    itemCount: Math.floor(Math.random() * 500) + 50, // Random for demo
    status: 'syncing'
  }

  connectedIntegrations.value.push(newIntegration)
  saveIntegrations()

  // Simulate status update after 2 seconds
  setTimeout(() => {
    const index = connectedIntegrations.value.findIndex(i => i.id === newIntegration.id)
    if (index !== -1) {
      connectedIntegrations.value[index].status = 'active'
      saveIntegrations()
    }
  }, 2000)
}

function disconnectIntegration(id) {
  if (confirm('Are you sure you want to disconnect this integration?')) {
    connectedIntegrations.value = connectedIntegrations.value.filter(int => int.id !== id)
    saveIntegrations()
  }
}

function saveIntegrations() {
  const sources = JSON.parse(localStorage.getItem('daart-knowledge-sources') || '{}')
  sources.integrations = connectedIntegrations.value
  localStorage.setItem('daart-knowledge-sources', JSON.stringify(sources))
}
</script>

<style scoped>
.integrations-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
}

.page-header {
  margin-bottom: 32px;
}

.header-content h1 {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.header-description {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* Info Banner */
.info-banner {
  padding: 16px 20px;
  background: #f0f7ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  margin-bottom: 32px;
}

.info-content {
  flex: 1;
}

.info-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

/* Available Integrations Section */
.available-integrations-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.integration-count {
  font-size: 13px;
  color: #666;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.integration-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.integration-card:hover {
  border-color: #999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.integration-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  border-radius: 8px;
  flex-shrink: 0;
}

.integration-info {
  flex: 1;
}

.integration-name {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.integration-description {
  font-size: 13px;
  color: #666;
}

.btn-connect {
  padding: 8px 16px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-connect:hover {
  background: #333;
}

/* Connected Integrations Section */
.connected-section {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 24px;
}

.integrations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.integration-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s;
}

.integration-item:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.integration-icon-small {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  flex-shrink: 0;
}

.integration-details {
  flex: 1;
}

.integration-name-connected {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #000;
}

.integration-meta {
  font-size: 13px;
  color: #666;
}

.integration-status {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 3px;
}

.integration-status.active {
  background: #d4f4dd;
  color: #1e7e34;
}

.integration-status.syncing {
  background: #fff3cd;
  color: #856404;
}

.integration-status.error {
  background: #f8d7da;
  color: #721c24;
}

.btn-icon-delete {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 20px;
  line-height: 1;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-delete:hover {
  background: #ff4444;
  border-color: #ff4444;
  color: #fff;
}

/* Empty State */
.empty-state {
  padding: 80px 40px;
  text-align: center;
  background: #fafafa;
  border: 1px dashed #ddd;
  border-radius: 8px;
  margin-top: 32px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .integrations-view {
    padding: 20px;
  }

  .integrations-grid {
    grid-template-columns: 1fr;
  }
}
</style>
