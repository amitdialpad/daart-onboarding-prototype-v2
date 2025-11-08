<template>
  <div class="agent-card" :class="{ 'simplified-card': simplified }" @click="simplified ? continueBuildingAgent : openAgent">
    <!-- Simplified View: First agent experience -->
    <template v-if="simplified">
      <div class="card-header">
        <div class="header-left">
          <h3 class="agent-name">{{ agent.name }}</h3>
          <div class="agent-meta">
            <span class="status-badge" :class="agent.status">{{ statusText }}</span>
          </div>
        </div>
      </div>

      <!-- Single Clear CTA -->
      <button class="continue-btn" @click.stop="continueBuildingAgent">
        Continue Building Your Agent →
      </button>
    </template>

    <!-- Normal View: Full card with metrics -->
    <template v-else>
      <!-- Header: Name, Status, Menu -->
      <div class="card-header">
        <div class="header-left">
          <h3 class="agent-name">{{ agent.name }}</h3>
          <div class="agent-meta">
            <span class="status-badge" :class="agent.status">{{ statusText }}</span>
            <span class="meta-separator">•</span>
            <span class="meta-text">{{ statusLabel }}</span>
            <span class="meta-separator">•</span>
            <span class="meta-text">{{ channelsText }}</span>
          </div>
        </div>
        <button class="btn-menu" @click.stop="toggleMenu">⋯</button>
      </div>

      <!-- Compact Metrics Row -->
      <div class="metrics-row">
        <div class="metric">
          <span class="metric-value">{{ conversationCount }}</span>
          <span class="metric-label">convos</span>
        </div>
        <div v-if="showDeflectionRate" class="metric">
          <span class="metric-value">{{ deflectionRate }}%</span>
          <span class="metric-label">deflection</span>
        </div>
        <div class="metric">
          <span class="metric-value">{{ knowledgeCount }}</span>
          <span class="metric-label">knowledge</span>
        </div>
        <div class="metric">
          <span class="metric-value">{{ skillsCount }}</span>
          <span class="metric-label">skills</span>
        </div>
      </div>

      <!-- Actions Row -->
      <div class="actions-row" @click.stop>
        <a :href="`#/agents-v2/${agent.id}/build`" class="action-link" @click.stop>
          Build →
        </a>
        <button class="action-btn" @click="primaryAction.handler">
          {{ primaryAction.label }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  agent: {
    type: Object,
    required: true
  },
  simplified: {
    type: Boolean,
    default: false
  }
})

const router = useRouter()

const statusText = computed(() => {
  return props.agent.status === 'live' ? 'Live' : 'Draft'
})

const conversationCount = computed(() => {
  return props.agent.conversations || 0
})

const showDeflectionRate = computed(() => {
  return props.agent.status === 'live' && conversationCount.value > 0
})

const deflectionRate = computed(() => {
  return props.agent.deflectionRate || Math.floor(Math.random() * 20 + 75)
})

const statusLabel = computed(() => {
  return props.agent.lastUpdated || 'Just now'
})

const channels = computed(() => {
  const channelList = []
  if (props.agent.agentType === 'chat') {
    channelList.push('Website')
    if (props.agent.chatConfig?.smsEnabled) {
      channelList.push('SMS')
    }
  } else {
    channelList.push('Phone')
  }
  return channelList
})

const channelsText = computed(() => {
  return channels.value.join(', ')
})

const knowledgeCount = computed(() => {
  return props.agent.knowledge?.length || 0
})

const skillsCount = computed(() => {
  return props.agent.skills?.length || 0
})

const primaryAction = computed(() => {
  if (props.agent.status === 'live') {
    return {
      label: 'Monitor',
      handler: () => router.push(`/agents-v2/${props.agent.id}/monitor`)
    }
  } else if (props.agent.hasPassedTests) {
    return {
      label: 'Deploy',
      handler: () => router.push(`/agents-v2/${props.agent.id}/deploy`)
    }
  } else {
    return {
      label: 'Test',
      handler: () => router.push(`/agents-v2/${props.agent.id}/test`)
    }
  }
})

function openAgent() {
  primaryAction.value.handler()
}

function continueBuildingAgent() {
  router.push(`/agents-v2/${props.agent.id}/build`)
}

function toggleMenu() {
  console.log('Menu toggled for agent:', props.agent.id)
}
</script>

<style scoped>
.agent-card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.agent-card:hover {
  border-color: #000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.agent-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: #000;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  flex-wrap: wrap;
}

.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.status-badge.live {
  background: #000;
  color: #fff;
}

.status-badge.draft {
  background: #f0f0f0;
  color: #666;
}

.meta-separator {
  color: #ddd;
}

.meta-text {
  color: #999;
  font-size: 12px;
}

.btn-menu {
  padding: 6px 10px;
  background: #fff;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
  flex-shrink: 0;
}

.btn-menu:hover {
  border-color: #999;
  background: #fafafa;
}

/* Metrics Row */
.metrics-row {
  display: flex;
  gap: 20px;
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.metric-value {
  font-size: 20px;
  font-weight: 600;
  color: #000;
  line-height: 1;
}

.metric-label {
  font-size: 11px;
  color: #999;
  text-transform: lowercase;
}

/* Actions Row */
.actions-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.action-link {
  font-size: 13px;
  font-weight: 500;
  color: #666;
  text-decoration: none;
  transition: color 0.2s;
}

.action-link:hover {
  color: #000;
}

.action-btn {
  padding: 8px 20px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #333;
}

/* Simplified Card Styles */
.agent-card.simplified-card {
  padding: 32px;
  text-align: center;
  gap: 24px;
}

.agent-card.simplified-card .card-header {
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.agent-card.simplified-card .agent-name {
  font-size: 24px;
  white-space: normal;
}

.agent-card.simplified-card .agent-meta {
  justify-content: center;
}

.continue-btn {
  width: 100%;
  padding: 16px 32px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.continue-btn:hover {
  background: #333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
