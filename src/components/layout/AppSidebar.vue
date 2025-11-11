<template>
  <div class="sidebar">
    <div class="sidebar-content">
      <!-- Logo -->
      <div class="logo-section">
        <h1 class="logo">DAART</h1>
      </div>

      <!-- Agent-Specific Navigation (only show when on agent pages) -->
      <div v-if="selectedAgent" class="nav-section">
        <router-link
          :to="`/agents-v2/${selectedAgent.id}/overview`"
          class="nav-link"
          :class="{ active: isPageActive('overview') }">
          Overview
        </router-link>

        <router-link
          :to="`/agents-v2/${selectedAgent.id}/configuration`"
          class="nav-link"
          :class="{ active: isPageActive('configuration') }">
          Configuration
        </router-link>

        <router-link
          :to="`/agents-v2/${selectedAgent.id}/knowledge-sources`"
          class="nav-link"
          :class="{ active: isPageActive('knowledge-sources') }">
          Knowledge Sources
        </router-link>

        <router-link
          :to="`/agents-v2/${selectedAgent.id}/skills`"
          class="nav-link"
          :class="{ active: isPageActive('skills') }">
          Skills
        </router-link>

        <router-link
          :to="`/agents-v2/${selectedAgent.id}/agent-studio`"
          class="nav-link"
          :class="{ active: isPageActive('agent-studio') }">
          Agent Studio
        </router-link>

        <router-link
          :to="`/agents-v2/${selectedAgent.id}/test`"
          class="nav-link"
          :class="{ active: isPageActive('test') }">
          Test
        </router-link>

        <router-link
          :to="`/agents-v2/${selectedAgent.id}/conversations`"
          class="nav-link"
          :class="{ active: isPageActive('conversations') }">
          Conversations
        </router-link>

        <router-link
          :to="`/agents-v2/${selectedAgent.id}/evaluate`"
          class="nav-link"
          :class="{ active: isPageActive('evaluate') }">
          Evaluate
        </router-link>

        <router-link
          v-if="selectedAgent.hasBeenPublished || selectedAgent.status === 'live'"
          :to="`/agents-v2/${selectedAgent.id}/skill-mining`"
          class="nav-link"
          :class="{ active: isPageActive('skill-mining') }">
          Suggested Skills
        </router-link>

        <router-link
          :to="`/agents-v2/${selectedAgent.id}/security`"
          class="nav-link"
          :class="{ active: isPageActive('security') }">
          Security
        </router-link>

        <router-link
          :to="`/agents-v2/${selectedAgent.id}/deploy`"
          class="nav-link"
          :class="{ active: isPageActive('deploy') }">
          Deploy
        </router-link>

        <!-- Divider -->
        <div class="nav-divider"></div>
      </div>

      <!-- Workspace-Wide Navigation -->
      <div class="nav-section">
        <router-link
          to="/knowledge-v2/all-sources"
          class="nav-link"
          :class="{ active: currentRoute.includes('/knowledge-v2') }">
          Knowledge
        </router-link>

        <router-link
          to="/analytics-v2"
          class="nav-link"
          :class="{ active: currentRoute.includes('/analytics-v2') }">
          Analytics
        </router-link>

        <router-link
          to="/billing-v2"
          class="nav-link"
          :class="{ active: currentRoute.includes('/billing-v2') }">
          Billing
        </router-link>

        <router-link
          to="/settings-v2"
          class="nav-link"
          :class="{ active: currentRoute.includes('/settings-v2') }">
          Settings
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const allAgents = ref([])
const lastViewedAgentId = ref(null)

const currentRoute = computed(() => route.path)

// Get selected agent from route, or use last viewed agent
const selectedAgent = computed(() => {
  const agentId = route.params.id

  // If we have an agent ID in the route, use it and remember it
  if (agentId) {
    lastViewedAgentId.value = agentId
    localStorage.setItem('daart-last-viewed-agent', agentId)
    return allAgents.value.find(a => a.id === agentId) || null
  }

  // If no agent ID in route, use the last viewed agent (for workspace pages)
  if (lastViewedAgentId.value) {
    return allAgents.value.find(a => a.id === lastViewedAgentId.value) || null
  }

  return null
})

function loadAgents() {
  allAgents.value = JSON.parse(localStorage.getItem('daart-agents') || '[]')

  // Load last viewed agent ID from localStorage
  if (!lastViewedAgentId.value) {
    lastViewedAgentId.value = localStorage.getItem('daart-last-viewed-agent')
  }
}

function isPageActive(page) {
  // Special handling for conversation details - highlight conversations
  if (page === 'conversations' && route.path.includes('/conversations')) {
    return true
  }

  // Check for exact page match
  return route.path.includes(`/${page}`)
}

onMounted(() => {
  loadAgents()
})

// Reload agents when route changes
watch(() => route.path, () => {
  loadAgents()
})
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #fafafa;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
}

/* Logo */
.logo-section {
  padding: 0 20px 24px 20px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
  margin: 0;
  color: #000;
}

/* Navigation Section */
.nav-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 12px;
}

.nav-link {
  padding: 10px 12px;
  font-size: 14px;
  color: #333;
  text-decoration: none;
  border-radius: 6px;
  transition: all 0.2s;
  font-weight: 500;
}

.nav-link:hover {
  background: #f0f0f0;
  color: #000;
}

.nav-link.active {
  background: #e8e8e8;
  color: #000;
  font-weight: 600;
}

/* Divider */
.nav-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 16px 0;
}
</style>
