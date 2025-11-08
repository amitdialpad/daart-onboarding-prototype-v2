<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <div class="app-title">Dialpad Agents</div>
      <a href="#" class="reset-demo-link" @click.prevent="resetDemo">Reset Demo</a>
    </div>

    <nav class="sidebar-nav">
      <!-- Home Section -->
      <div class="nav-section">
        <router-link to="/home" class="section-header-link" :class="{ active: currentRoute === '/home' }">
          <span class="section-title">Home</span>
        </router-link>
      </div>

      <!-- Agents Section -->
      <div class="nav-section">
        <div class="section-header" @click="toggleSection('agents')">
          <span class="expand-icon">{{ sectionsExpanded.agents ? '▼' : '▶' }}</span>
          <span class="section-title">Agents</span>
        </div>

        <!-- Agents Content -->
        <div v-if="sectionsExpanded.agents" class="section-content">
          <div v-if="allAgents.length === 0" class="empty-message">
            <a href="#" class="create-agent-link" @click.prevent="createNewAgent">+ Create First Agent</a>
          </div>

          <div v-for="agent in allAgents" :key="agent.id" class="agent-item">
            <div
              class="agent-link"
              :class="{ selected: selectedAgent?.id === agent.id }"
              @click="goToAgent(agent)">
              {{ agent.name }}
              <span class="agent-status-badge">{{ agent.status === 'live' ? 'Live' : 'Draft' }}</span>
            </div>

            <!-- Show tabs for selected agent based on status -->
            <div v-if="selectedAgent?.id === agent.id" class="agent-tabs">
              <!-- Live agents: Monitor first -->
              <template v-if="agent.status === 'live'">
                <router-link
                  :to="`/agents-v2/${agent.id}/monitor`"
                  class="tab-link"
                  :class="{ active: currentRoute.includes('/monitor') }">
                  Monitor
                </router-link>
                <router-link
                  :to="`/agents-v2/${agent.id}/build`"
                  class="tab-link"
                  :class="{ active: currentRoute.includes('/build') }">
                  Build
                </router-link>
                <router-link
                  :to="`/agents-v2/${agent.id}/test`"
                  class="tab-link"
                  :class="{ active: currentRoute.includes('/test') }">
                  Test
                </router-link>
                <router-link
                  :to="`/agents-v2/${agent.id}/deploy`"
                  class="tab-link"
                  :class="{ active: currentRoute.includes('/deploy') }">
                  Deploy
                </router-link>
              </template>

              <!-- Draft agents: Show Monitor if has been published before, otherwise no Monitor -->
              <template v-else>
                <router-link
                  v-if="agent.hasBeenPublished"
                  :to="`/agents-v2/${agent.id}/monitor`"
                  class="tab-link"
                  :class="{ active: currentRoute.includes('/monitor') }">
                  Monitor
                </router-link>
                <router-link
                  :to="`/agents-v2/${agent.id}/build`"
                  class="tab-link"
                  :class="{ active: currentRoute.includes('/build') }">
                  Build
                </router-link>
                <router-link
                  :to="`/agents-v2/${agent.id}/test`"
                  class="tab-link"
                  :class="{ active: currentRoute.includes('/test') }">
                  Test
                </router-link>
                <router-link
                  :to="`/agents-v2/${agent.id}/deploy`"
                  class="tab-link"
                  :class="{ active: currentRoute.includes('/deploy') }">
                  Deploy
                </router-link>
              </template>
            </div>
          </div>

          <a href="#" class="create-agent-link" v-if="allAgents.length > 0" @click.prevent="createNewAgent">+ Create Agent</a>
        </div>
      </div>

      <!-- Knowledge Section - Only show if agents exist -->
      <div v-if="allAgents.length > 0" class="nav-section">
        <div class="section-header">
          <span class="expand-icon" @click.stop="toggleSection('knowledge')">{{ sectionsExpanded.knowledge ? '▼' : '▶' }}</span>
          <span class="section-title" @click="navigateToSection('knowledge', '/knowledge-v2/all-sources', 'all-sources')">Knowledge</span>
        </div>

        <div v-if="sectionsExpanded.knowledge" class="section-content">
          <router-link to="/knowledge-v2/all-sources" class="subsection-link" :class="{ active: currentRoute.includes('/all-sources') }">
            All Sources
          </router-link>
          <router-link to="/knowledge-v2/documents" class="subsection-link" :class="{ active: currentRoute.includes('/documents') }">
            Documents
          </router-link>
          <router-link to="/knowledge-v2/text-content" class="subsection-link" :class="{ active: currentRoute.includes('/text-content') }">
            Text Content
          </router-link>
          <router-link to="/knowledge-v2/website" class="subsection-link" :class="{ active: currentRoute.includes('/website') }">
            Website
          </router-link>
          <router-link to="/knowledge-v2/conversations" class="subsection-link" :class="{ active: currentRoute.includes('/conversations') }">
            Conversations
          </router-link>
        </div>
      </div>

      <!-- Analytics Section - Only show if agents exist -->
      <div v-if="allAgents.length > 0" class="nav-section">
        <div class="section-header">
          <span class="expand-icon" @click.stop="toggleSection('analytics')">{{ sectionsExpanded.analytics ? '▼' : '▶' }}</span>
          <span class="section-title" @click="navigateToSection('analytics', '/analytics-v2', 'live')">Analytics</span>
        </div>

        <div v-if="sectionsExpanded.analytics" class="section-content">
          <a href="#live" @click.prevent="scrollToSection('/analytics-v2', 'live')" class="subsection-link" :class="{ active: currentHash === 'live' }">
            Live
          </a>
          <a href="#performance" @click.prevent="scrollToSection('/analytics-v2', 'performance')" class="subsection-link" :class="{ active: currentHash === 'performance' }">
            Performance
          </a>
          <a href="#conversations" @click.prevent="scrollToSection('/analytics-v2', 'conversations')" class="subsection-link" :class="{ active: currentHash === 'conversations' }">
            Conversations
          </a>
          <a href="#feedback" @click.prevent="scrollToSection('/analytics-v2', 'feedback')" class="subsection-link" :class="{ active: currentHash === 'feedback' }">
            Feedback
          </a>
        </div>
      </div>

      <!-- Billing Section - Only show if agents exist -->
      <div v-if="allAgents.length > 0" class="nav-section">
        <div class="section-header">
          <span class="expand-icon" @click.stop="toggleSection('billing')">{{ sectionsExpanded.billing ? '▼' : '▶' }}</span>
          <span class="section-title" @click="navigateToSection('billing', '/billing-v2', 'overview')">Billing</span>
        </div>

        <div v-if="sectionsExpanded.billing" class="section-content">
          <a href="#overview" @click.prevent="scrollToSection('/billing-v2', 'overview')" class="subsection-link" :class="{ active: currentHash === 'overview' }">
            Overview
          </a>
          <a href="#usage" @click.prevent="scrollToSection('/billing-v2', 'usage')" class="subsection-link" :class="{ active: currentHash === 'usage' }">
            Usage & Reports
          </a>
          <a href="#payment" @click.prevent="scrollToSection('/billing-v2', 'payment')" class="subsection-link" :class="{ active: currentHash === 'payment' }">
            Payment Methods
          </a>
          <a href="#alerts" @click.prevent="scrollToSection('/billing-v2', 'alerts')" class="subsection-link" :class="{ active: currentHash === 'alerts' }">
            Alerts & Notifications
          </a>
        </div>
      </div>

      <!-- Settings Section - Only show if agents exist -->
      <div v-if="allAgents.length > 0" class="nav-section">
        <div class="section-header">
          <span class="expand-icon" @click.stop="toggleSection('settings')">{{ sectionsExpanded.settings ? '▼' : '▶' }}</span>
          <span class="section-title" @click="navigateToSection('settings', '/settings-v2', 'account')">Settings</span>
        </div>

        <div v-if="sectionsExpanded.settings" class="section-content">
          <a href="#account" @click.prevent="scrollToSection('/settings-v2', 'account')" class="subsection-link" :class="{ active: currentHash === 'account' }">
            Account
          </a>
          <a href="#team" @click.prevent="scrollToSection('/settings-v2', 'team')" class="subsection-link" :class="{ active: currentHash === 'team' }">
            Team
          </a>
          <a href="#integrations" @click.prevent="scrollToSection('/settings-v2', 'integrations')" class="subsection-link" :class="{ active: currentHash === 'integrations' }">
            Integrations
          </a>
          <a href="#api-keys" @click.prevent="scrollToSection('/settings-v2', 'api-keys')" class="subsection-link" :class="{ active: currentHash === 'api-keys' }">
            API Keys
          </a>
          <a href="#audit-log" @click.prevent="scrollToSection('/settings-v2', 'audit-log')" class="subsection-link" :class="{ active: currentHash === 'audit-log' }">
            Audit Log
          </a>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const allAgents = ref([])

// Section expansion state
const sectionsExpanded = ref({
  agents: true,
  knowledge: false,
  analytics: false,
  billing: false,
  settings: false
})

const currentRoute = computed(() => route.path)

// Track current hash for active link highlighting
const currentHash = ref('')

// Get selected agent from route
const selectedAgent = computed(() => {
  const agentId = route.params.id
  return allAgents.value.find(a => a.id === agentId)
})

onMounted(() => {
  loadAgents()
  autoExpandActiveSection()
})

// Reload agents when route changes (in case new agent created)
watch(() => route.path, () => {
  loadAgents()
  autoExpandActiveSection()
  // Clear hash when navigating to different route
  currentHash.value = ''
})

function loadAgents() {
  allAgents.value = JSON.parse(localStorage.getItem('daart-agents') || '[]')
}

function goToAgent(agent) {
  // If agent is live, go to MONITOR tab
  // If agent is draft but has been published before, go to MONITOR tab (historical data)
  // If agent is draft and never published, go to BUILD tab
  let defaultTab = 'build'
  if (agent.status === 'live') {
    defaultTab = 'monitor'
  } else if (agent.status === 'draft' && agent.hasBeenPublished) {
    defaultTab = 'monitor'
  }
  router.push(`/agents-v2/${agent.id}/${defaultTab}`)
}

function createNewAgent() {
  // Clear any existing build data to start fresh
  localStorage.removeItem('daart-building-agent')
  localStorage.removeItem('daart-selected-scenario')

  // Navigate to home - empty state will show intent capture
  router.push('/home')
}

function toggleSection(section) {
  sectionsExpanded.value[section] = !sectionsExpanded.value[section]
}

function autoExpandActiveSection() {
  // Auto-expand section based on current route
  if (currentRoute.value.includes('/agents-v2')) {
    sectionsExpanded.value.agents = true
  } else if (currentRoute.value.includes('/knowledge-v2')) {
    sectionsExpanded.value.knowledge = true
  } else if (currentRoute.value.includes('/analytics-v2')) {
    sectionsExpanded.value.analytics = true
  } else if (currentRoute.value.includes('/billing-v2')) {
    sectionsExpanded.value.billing = true
  } else if (currentRoute.value.includes('/settings-v2')) {
    sectionsExpanded.value.settings = true
  }
}

function navigateToSection(section, routePath, defaultSectionId) {
  // Expand the section
  sectionsExpanded.value[section] = true

  // Navigate to the page and scroll to the first section
  scrollToSection(routePath, defaultSectionId)
}

function scrollToSection(routePath, sectionId) {
  // Navigate to route if not already there
  if (route.path !== routePath) {
    router.push(routePath).then(() => {
      // Wait for route to load, then scroll
      setTimeout(() => {
        scrollToElement(sectionId)
      }, 100)
    })
  } else {
    // Already on the route, just scroll
    scrollToElement(sectionId)
  }

  // Update current hash for active link highlighting (but don't change URL)
  currentHash.value = sectionId
}

function scrollToElement(sectionId) {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function resetDemo() {
  if (confirm('This will clear all demo data and reload the page. Continue?')) {
    localStorage.clear()
    window.location.href = window.location.origin + window.location.pathname + '#/onboarding-v2'
  }
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #fafafa;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.app-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
}

.reset-demo-link {
  font-size: 12px;
  color: #333;
  text-decoration: none;
}

.reset-demo-link:hover {
  text-decoration: underline;
  color: #000;
}

.sidebar-nav {
  flex: 1;
  padding: 8px 0;
}

.nav-section {
  margin-bottom: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  user-select: none;
}

.expand-icon {
  width: 16px;
  font-size: 10px;
  color: #999;
  margin-right: 10px;
  cursor: pointer;
  padding: 4px;
  margin: -4px;
  transition: color 0.15s;
}

.expand-icon:hover {
  color: #000;
}

.section-title {
  font-size: 14px;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.01em;
  flex: 1;
  cursor: pointer;
  padding: 4px 0;
  transition: color 0.15s;
}

.section-title:hover {
  color: #0066cc;
}

.section-content {
  margin-left: 24px;
  padding-bottom: 8px;
  border-left: 1px solid #e0e0e0;
}

.empty-message {
  padding: 8px 16px;
}

.agent-item {
  margin-bottom: 2px;
}

.agent-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  font-size: 13px;
  color: #000;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.agent-link:hover {
  background: #f0f0f0;
}

.agent-link.selected {
  background: #e8e8e8;
  font-weight: 600;
  color: #000;
}

.agent-status-badge {
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
}

.agent-tabs {
  margin-left: 16px;
  border-left: 1px solid #e0e0e0;
  margin-top: 2px;
  margin-bottom: 4px;
}

.tab-link {
  display: block;
  padding: 6px 16px;
  font-size: 12px;
  color: #999;
  text-decoration: none;
  transition: all 0.15s;
}

.tab-link:hover {
  background: #f5f5f5;
  color: #333;
}

.tab-link.active {
  background: #e8e8e8;
  color: #000;
  font-weight: 500;
}

.subsection-link {
  display: block;
  padding: 8px 16px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  transition: all 0.15s;
  font-weight: 400;
}

.subsection-link:hover {
  background: #f5f5f5;
  color: #000;
}

.subsection-link.active {
  background: #e8e8e8;
  color: #000;
  font-weight: 500;
}

.create-agent-link {
  display: block;
  padding: 8px 16px;
  font-size: 13px;
  color: #666;
  text-decoration: none;
  transition: background 0.15s;
}

.create-agent-link:hover {
  background: #f0f0f0;
  color: #000;
}

.section-header-link {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  transition: background 0.15s;
}

.section-header-link:hover {
  background: #f0f0f0;
}

.section-header-link.active {
  background: #e8e8e8;
}

.section-title-single {
  font-size: 14px;
  font-weight: 700;
  color: #000;
  letter-spacing: -0.01em;
}
</style>
