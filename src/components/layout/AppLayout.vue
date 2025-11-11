<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <!-- Agent Selector Header (only show when on agent pages) -->
      <div v-if="selectedAgent" class="agent-header">
        <div class="header-content">
          <div class="agent-selector-wrapper">
            <div class="agent-selector" @click="toggleAgentDropdown" ref="dropdownTrigger">
              <span class="agent-name">{{ selectedAgent.name }}</span>
              <span class="dropdown-arrow">▼</span>
            </div>

            <!-- Agent Dropdown -->
            <div v-if="showAgentDropdown" class="agent-dropdown" ref="dropdownMenu">
              <div class="dropdown-section">
                <div class="dropdown-label">Switch Agent</div>
                <div
                  v-for="agent in allAgents"
                  :key="agent.id"
                  class="dropdown-item"
                  :class="{ active: agent.id === selectedAgent.id }"
                  @click="switchAgent(agent)">
                  <span class="dropdown-agent-name">{{ agent.name }}</span>
                  <span class="dropdown-agent-status" :class="agent.status">{{ agent.status }}</span>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item create-new" @click="createNewAgent">
                <span class="plus-icon">+</span>
                <span>Create New Agent</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from './AppSidebar.vue'

const route = useRoute()
const router = useRouter()

const allAgents = ref([])
const showAgentDropdown = ref(false)
const dropdownTrigger = ref(null)
const dropdownMenu = ref(null)

// Get selected agent from route
const selectedAgent = computed(() => {
  const agentId = route.params.id
  if (!agentId) return null
  return allAgents.value.find(a => a.id === agentId) || null
})

function loadAgents() {
  allAgents.value = JSON.parse(localStorage.getItem('daart-agents') || '[]')
}

function toggleAgentDropdown() {
  showAgentDropdown.value = !showAgentDropdown.value
}

function switchAgent(agent) {
  showAgentDropdown.value = false
  // Always navigate to overview (shows getting started for draft, metrics for live)
  router.push(`/agents-v2/${agent.id}/overview`)
}

function createNewAgent() {
  showAgentDropdown.value = false
  // Back up current agents
  const currentAgents = localStorage.getItem('daart-agents')
  if (currentAgents) {
    localStorage.setItem('daart-agents-backup', currentAgents)
  }
  // Clear and navigate to home
  localStorage.setItem('daart-agents', '[]')
  router.push('/home')
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  if (
    dropdownTrigger.value &&
    dropdownMenu.value &&
    !dropdownTrigger.value.contains(event.target) &&
    !dropdownMenu.value.contains(event.target)
  ) {
    showAgentDropdown.value = false
  }
}

onMounted(() => {
  loadAgents()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Reload agents when route changes
watch(() => route.path, () => {
  loadAgents()
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background: #fff;
  font-family: apple-system, BlinkMacSystemFont, "SF Pro", "Segoe UI Adjusted", "Segoe UI", SFMono, "Helvetica Neue", Cantarell, Ubuntu, Roboto, Arial, "Noto Sans", sans-serif;
}

.main-content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

/* Agent Header */
.agent-header {
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
  z-index: 100;
}

.header-content {
  padding: 16px 40px;
  display: flex;
  align-items: center;
}

.agent-selector-wrapper {
  position: relative;
}

.agent-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fafafa;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.agent-selector:hover {
  background: #f0f0f0;
  border-color: #999;
}

.agent-name {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.dropdown-arrow {
  font-size: 10px;
  color: #666;
  transition: transform 0.2s;
}

.agent-selector:hover .dropdown-arrow {
  color: #000;
}

/* Agent Dropdown */
.agent-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 280px;
  background: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-section {
  padding: 8px 0;
}

.dropdown-label {
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.5px;
}

.dropdown-item {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.active {
  background: #e8e8e8;
}

.dropdown-item.active .dropdown-agent-name {
  font-weight: 600;
}

.dropdown-agent-name {
  font-size: 14px;
  color: #000;
}

.dropdown-agent-status {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 3px;
  font-weight: 600;
  text-transform: uppercase;
}

.dropdown-agent-status.draft {
  background: #f0f0f0;
  color: #666;
}

.dropdown-agent-status.live {
  background: #e8f5e9;
  color: #2e7d32;
}

.dropdown-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}

.dropdown-item.create-new {
  gap: 8px;
  justify-content: flex-start;
  font-weight: 500;
  color: #000;
}

.plus-icon {
  font-size: 18px;
  line-height: 1;
  color: #666;
}

.dropdown-item.create-new:hover .plus-icon {
  color: #000;
}
</style>

<style>
/* Global style to hide sidebar when wizard mode is active */
body.wizard-mode-active .sidebar {
  display: none !important;
}

body.wizard-mode-active .app-layout {
  display: block;
}

body.wizard-mode-active .main-content {
  width: 100%;
  max-width: 100%;
}

/* Global style to hide sidebar when empty state mode is active */
body.empty-state-mode .sidebar {
  display: none !important;
}

body.empty-state-mode .app-layout {
  display: block;
}

body.empty-state-mode .main-content {
  width: 100%;
  max-width: 100%;
  padding: 0;
}

/* Global style to hide sidebar when single agent mode is active */
body.single-agent-mode .sidebar {
  display: none !important;
}

body.single-agent-mode .app-layout {
  display: block;
}

body.single-agent-mode .main-content {
  width: 100%;
  max-width: 100%;
}
</style>
