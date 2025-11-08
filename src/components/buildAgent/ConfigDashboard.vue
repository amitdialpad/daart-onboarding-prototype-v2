<template>
  <div class="config-dashboard">
    <!-- Method Header -->
    <div class="method-header">
      <div class="method-title">
        <span class="checkmark">✓</span>
        {{ methodName }}
      </div>
      <button class="change-btn" @click="$emit('change-method')">Change</button>
    </div>

    <!-- Configuration Progress -->
    <div class="config-section">
      <h3>Configuration Progress</h3>

      <!-- Basic Info -->
      <div class="config-category">
        <div class="category-header">
          <span :class="['status-icon', basicInfoStatus]">
            {{ basicInfoStatus === 'complete' ? '✅' : '⚠️' }}
          </span>
          <span class="category-name">Basic Info</span>
          <span class="category-count">({{ completedBasicInfo }}/{{ totalBasicInfo }})</span>
        </div>
        <ul v-if="agentConfig.questions" class="config-items">
          <li v-for="(value, key) in agentConfig.questions" :key="key">
            {{ formatKey(key) }}
          </li>
        </ul>
      </div>

      <!-- Integrations -->
      <div class="config-category">
        <div class="category-header">
          <span :class="['status-icon', integrationsStatus]">
            {{ integrationsStatus === 'complete' ? '✅' : '⚠️' }}
          </span>
          <span class="category-name">Integrations</span>
          <span class="category-count">({{ agentConfig.integrations?.length || 0 }})</span>
        </div>
        <ul v-if="agentConfig.integrations?.length" class="config-items">
          <li v-for="integration in agentConfig.integrations" :key="integration.type">
            ✅ {{ formatIntegration(integration) }}
          </li>
        </ul>
        <p v-else class="empty-state">No integrations added yet</p>
      </div>

      <!-- Knowledge Sources -->
      <div class="config-category">
        <div class="category-header">
          <span :class="['status-icon', knowledgeStatus]">
            {{ knowledgeStatus === 'complete' ? '✅' : '⚠️' }}
          </span>
          <span class="category-name">Knowledge Sources</span>
          <span class="category-count">({{ agentConfig.knowledge?.length || 0 }})</span>
        </div>
        <ul v-if="agentConfig.knowledge?.length" class="config-items">
          <li v-for="source in agentConfig.knowledge" :key="source.id">
            {{ source.name }}
          </li>
        </ul>
        <p v-else class="empty-state">No knowledge sources added</p>
      </div>

      <!-- Workflows (for workflow method) -->
      <div v-if="selectedMethod === 'workflow'" class="config-category">
        <div class="category-header">
          <span :class="['status-icon', workflowsStatus]">
            {{ workflowsStatus === 'complete' ? '✅' : '⚠️' }}
          </span>
          <span class="category-name">Workflows</span>
          <span class="category-count">({{ agentConfig.workflows?.length || 0 }})</span>
        </div>
        <ul v-if="agentConfig.workflows?.length" class="config-items">
          <li v-for="workflow in agentConfig.workflows" :key="workflow.id">
            {{ workflow.name }}
          </li>
        </ul>
        <p v-else class="empty-state">No workflows created yet</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="action-link" @click="addConfiguration">
        + Add more configuration
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedMethod: String,
  agentConfig: Object
})

defineEmits(['change-method'])

const methodName = computed(() => {
  const names = {
    questions: 'Answer questions',
    knowledge: 'Connect knowledge',
    workflow: 'Visual workflow'
  }
  return names[props.selectedMethod] || 'Building agent'
})

const completedBasicInfo = computed(() => {
  return Object.keys(props.agentConfig.questions || {}).length
})

const totalBasicInfo = computed(() => {
  return props.selectedMethod === 'questions' ? 5 : 3
})

const basicInfoStatus = computed(() => {
  return completedBasicInfo.value >= totalBasicInfo.value ? 'complete' : 'pending'
})

const integrationsStatus = computed(() => {
  return props.agentConfig.integrations?.length > 0 ? 'complete' : 'pending'
})

const knowledgeStatus = computed(() => {
  return props.agentConfig.knowledge?.length > 0 ? 'complete' : 'pending'
})

const workflowsStatus = computed(() => {
  return props.agentConfig.workflows?.length > 0 ? 'complete' : 'pending'
})

function formatKey(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
}

function formatIntegration(integration) {
  return `${integration.provider || ''} ${integration.type}`.trim()
}

function addConfiguration() {
  // Could emit event to show additional config options
}
</script>

<style scoped>
.config-dashboard {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Method Header */
.method-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f8f8;
  border-radius: 8px;
  margin-bottom: 24px;
}

.method-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.checkmark {
  color: #4caf50;
}

.change-btn {
  padding: 6px 12px;
  background: #fff;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.change-btn:hover {
  border-color: #000;
  color: #000;
}

/* Configuration Section */
.config-section {
  flex: 1;
  overflow-y: auto;
}

.config-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #000;
  margin: 0 0 20px 0;
}

.config-category {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.config-category:last-child {
  border-bottom: none;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.status-icon {
  font-size: 16px;
}

.status-icon.complete {
  color: #4caf50;
}

.status-icon.pending {
  color: #ff9800;
}

.category-name {
  font-size: 15px;
  font-weight: 600;
  color: #000;
}

.category-count {
  font-size: 13px;
  color: #666;
}

.config-items {
  list-style: none;
  padding: 0 0 0 32px;
  margin: 0;
}

.config-items li {
  font-size: 14px;
  color: #666;
  padding: 4px 0;
  line-height: 1.6;
}

.empty-state {
  font-size: 14px;
  color: #999;
  font-style: italic;
  padding-left: 32px;
  margin: 0;
}

/* Quick Actions */
.quick-actions {
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.action-link {
  padding: 10px 16px;
  background: transparent;
  color: #000;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
}

.action-link:hover {
  background: #f8f8f8;
  border-color: #000;
}

@media (max-width: 768px) {
  .method-header {
    padding: 12px 16px;
  }

  .config-section h3 {
    font-size: 16px;
  }
}
</style>
