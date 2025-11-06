<template>
  <div class="all-sources-view">
    <div class="page-header">
      <div class="header-content">
        <h1>All Sources</h1>
        <p class="header-description">Manage all knowledge sources that power your agents</p>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ integrationCount }}</div>
          <div class="stat-label">Integrations</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ documentCount }}</div>
          <div class="stat-label">Documents</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ conversationCount }}</div>
          <div class="stat-label">Conversations</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ textSnippetCount }}</div>
          <div class="stat-label">Snippets</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-content">
          <div class="stat-value">{{ websiteCount }}</div>
          <div class="stat-label">Website Pages</div>
        </div>
      </div>
    </div>

    <!-- Info Banner -->
    <div class="info-banner">
      <div class="info-content">
        <div class="info-text">
          <strong>Shared across all agents:</strong> All knowledge sources are automatically available to every agent. Changes you make here will update the knowledge for all {{ agentCount }} agents.
        </div>
      </div>
    </div>

    <!-- Source Sections -->
    <div class="sources-container">
      <!-- Integrations Section -->
      <div class="source-section">
        <div class="section-header">
          <div class="section-title">
            <h2>Integrations</h2>
            <span class="section-count">{{ integrationCount }} {{ integrationCount === 1 ? 'integration' : 'integrations' }}</span>
          </div>
          <router-link to="/knowledge-v2/integrations" class="btn-secondary">Manage Integrations →</router-link>
        </div>
        <p class="section-description">Connected platforms like Notion, Confluence, Google Drive, Slack, etc.</p>

        <div v-if="integrations.length === 0" class="empty-state">
          <p>No integrations connected yet</p>
          <router-link to="/knowledge-v2/integrations" class="link">Connect your first integration →</router-link>
        </div>

        <div v-else class="source-list">
          <div v-for="integration in integrations.slice(0, 3)" :key="integration.id" class="source-item">
            <div class="item-info">
              <div class="item-name">{{ integration.name }}</div>
              <div class="item-meta">{{ integration.itemCount }} items • Connected {{ integration.connectedAt || 'recently' }}</div>
            </div>
            <div class="item-status synced">Connected</div>
          </div>
          <div v-if="integrations.length > 3" class="show-more">
            <router-link to="/knowledge-v2/integrations">View all {{ integrations.length }} integrations →</router-link>
          </div>
        </div>
      </div>

      <!-- Documents Section -->
      <div class="source-section">
        <div class="section-header">
          <div class="section-title">
            <h2>Documents</h2>
            <span class="section-count">{{ documentCount }} {{ documentCount === 1 ? 'file' : 'files' }}</span>
          </div>
          <router-link to="/knowledge-v2/documents" class="btn-secondary">Manage Documents →</router-link>
        </div>
        <p class="section-description">PDFs, Word documents, spreadsheets, and text files</p>

        <div v-if="documents.length === 0" class="empty-state">
          <p>No documents uploaded yet</p>
          <router-link to="/knowledge-v2/documents" class="link">Upload your first document →</router-link>
        </div>

        <div v-else class="source-list">
          <div v-for="doc in documents.slice(0, 3)" :key="doc.id" class="source-item">
            <div class="item-info">
              <div class="item-name">{{ doc.name }}</div>
              <div class="item-meta">{{ doc.size }} • Uploaded {{ doc.uploadedAt }}</div>
            </div>
            <div class="item-status" :class="doc.status">{{ doc.status }}</div>
          </div>
          <div v-if="documents.length > 3" class="show-more">
            <router-link to="/knowledge-v2/documents">View all {{ documents.length }} documents →</router-link>
          </div>
        </div>
      </div>

      <!-- Snippets Section -->
      <div class="source-section">
        <div class="section-header">
          <div class="section-title">
            <h2>Snippets</h2>
            <span class="section-count">{{ textSnippetCount }} {{ textSnippetCount === 1 ? 'snippet' : 'snippets' }}</span>
          </div>
          <router-link to="/knowledge-v2/text-content" class="btn-secondary">Manage Snippets →</router-link>
        </div>
        <p class="section-description">Manually entered policies, FAQs, and product information</p>

        <div v-if="textSnippets.length === 0" class="empty-state">
          <p>No text snippets added yet</p>
          <router-link to="/knowledge-v2/text-content" class="link">Add text snippet →</router-link>
        </div>

        <div v-else class="source-list">
          <div v-for="snippet in textSnippets.slice(0, 3)" :key="snippet.id" class="source-item">
            <div class="item-info">
              <div class="item-name">{{ snippet.title || 'Text snippet' }}</div>
              <div class="item-meta">{{ snippet.content.substring(0, 60) }}{{ snippet.content.length > 60 ? '...' : '' }}</div>
            </div>
            <div class="item-status ready">Ready</div>
          </div>
          <div v-if="textSnippets.length > 3" class="show-more">
            <router-link to="/knowledge-v2/text-content">View all {{ textSnippets.length }} snippets →</router-link>
          </div>
        </div>
      </div>

      <!-- Website Section -->
      <div class="source-section">
        <div class="section-header">
          <div class="section-title">
            <h2>Website</h2>
            <span class="section-count">{{ websiteCount }} {{ websiteCount === 1 ? 'page' : 'pages' }}</span>
          </div>
          <router-link to="/knowledge-v2/website" class="btn-secondary">Manage URLs →</router-link>
        </div>
        <p class="section-description">Content automatically synced from your website</p>

        <div v-if="websites.length === 0" class="empty-state">
          <p>No website URLs added yet</p>
          <router-link to="/knowledge-v2/website" class="link">Add a URL →</router-link>
        </div>

        <div v-else class="source-list">
          <div v-for="site in websites.slice(0, 3)" :key="site.id" class="source-item">
            <div class="item-info">
              <div class="item-name">{{ site.url }}</div>
              <div class="item-meta">{{ site.pages }} pages • Last synced {{ site.lastSynced }}</div>
            </div>
            <div class="item-status" :class="site.status">{{ site.status }}</div>
          </div>
          <div v-if="websites.length > 3" class="show-more">
            <router-link to="/knowledge-v2/website">View all {{ websites.length }} websites →</router-link>
          </div>
        </div>
      </div>

      <!-- Conversations Section -->
      <div class="source-section">
        <div class="section-header">
          <div class="section-title">
            <h2>Conversations</h2>
            <span class="section-count">{{ conversationCount }} conversations</span>
          </div>
          <router-link to="/knowledge-v2/conversations" class="btn-secondary">View Settings →</router-link>
        </div>
        <p class="section-description">Historical conversations used to improve agent responses</p>

        <div class="conversation-info">
          <div class="info-row">
            <span class="info-label">Auto-learn from conversations:</span>
            <span class="info-value">{{ conversationsEnabled ? 'Enabled' : 'Disabled' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Total conversations:</span>
            <span class="info-value">{{ conversationCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const integrations = ref([])
const documents = ref([])
const conversationFiles = ref([])
const textSnippets = ref([])
const websites = ref([])
const conversationsEnabled = ref(true)

const agentCount = computed(() => {
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  return agents.length
})

const integrationCount = computed(() => integrations.value.length)

const documentCount = computed(() => documents.value.length)

const conversationCount = computed(() => conversationFiles.value.length)

const textSnippetCount = computed(() => textSnippets.value.length)

const websiteCount = computed(() => {
  return websites.value.reduce((total, site) => total + (site.pageCount || site.pages || 0), 0)
})

onMounted(() => {
  loadKnowledgeSources()
})

function loadKnowledgeSources() {
  // Load from localStorage - check all agents for their knowledge sources
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')

  // Aggregate knowledge from all agents
  const allIntegrations = []
  const allDocuments = []
  const allConversations = []
  const allSnippets = []
  const allWebsites = []

  agents.forEach(agent => {
    if (agent.knowledgeSources) {
      if (agent.knowledgeSources.integrations) {
        allIntegrations.push(...agent.knowledgeSources.integrations)
      }
      if (agent.knowledgeSources.documents) {
        allDocuments.push(...agent.knowledgeSources.documents)
      }
      if (agent.knowledgeSources.conversations) {
        allConversations.push(...agent.knowledgeSources.conversations)
      }
      if (agent.knowledgeSources.textSnippets) {
        allSnippets.push(...agent.knowledgeSources.textSnippets)
      }
      if (agent.knowledgeSources.websites) {
        allWebsites.push(...agent.knowledgeSources.websites)
      }
    }
  })

  // Deduplicate by id
  integrations.value = Array.from(new Map(allIntegrations.map(item => [item.id, item])).values())
  documents.value = Array.from(new Map(allDocuments.map(item => [item.id, item])).values())
  conversationFiles.value = Array.from(new Map(allConversations.map(item => [item.id, item])).values())
  textSnippets.value = Array.from(new Map(allSnippets.map(item => [item.id, item])).values())
  websites.value = Array.from(new Map(allWebsites.map(item => [item.id, item])).values())
}
</script>

<style scoped>
.all-sources-view {
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

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #000;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

/* Info Banner */
.info-banner {
  padding: 16px 20px;
  background: #f0f7ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  margin-bottom: 40px;
}

.info-content {
  flex: 1;
}

.info-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

/* Sources Container */
.sources-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.source-section {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.section-count {
  font-size: 13px;
  color: #666;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
}

.btn-secondary {
  padding: 8px 16px;
  background: #fff;
  color: #000;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #000;
  background: #f5f5f5;
}

.section-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px 0;
}

/* Empty State */
.empty-state {
  padding: 40px;
  text-align: center;
  background: #fafafa;
  border: 1px dashed #ddd;
  border-radius: 6px;
}

.empty-state p {
  margin: 0 0 8px 0;
  color: #666;
}

.empty-state .link {
  color: #0066cc;
  text-decoration: none;
  font-size: 14px;
}

.empty-state .link:hover {
  text-decoration: underline;
}

/* Source List */
.source-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.source-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.item-icon {
  font-size: 24px;
  line-height: 1;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.item-meta {
  font-size: 12px;
  color: #666;
}

.item-status {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 3px;
}

.item-status.ready {
  background: #d4f4dd;
  color: #1e7e34;
}

.item-status.synced {
  background: #d4f4dd;
  color: #1e7e34;
}

.item-status.processing {
  background: #fff3cd;
  color: #856404;
}

.show-more {
  padding: 12px;
  text-align: center;
}

.show-more a {
  color: #0066cc;
  text-decoration: none;
  font-size: 14px;
}

.show-more a:hover {
  text-decoration: underline;
}

/* Text Preview */
.text-preview {
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
}

.text-preview pre {
  margin: 0 0 12px 0;
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.preview-link {
  color: #0066cc;
  text-decoration: none;
  font-size: 14px;
}

.preview-link:hover {
  text-decoration: underline;
}

/* Conversation Info */
.conversation-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.info-label {
  color: #666;
}

.info-value {
  font-weight: 600;
  color: #000;
}

.link {
  color: #0066cc;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>
