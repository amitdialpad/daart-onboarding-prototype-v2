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
      <!-- Live Agent Card: Enhanced Monitoring View -->
      <template v-if="agent.status === 'live'">
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

        <!-- Overview Metrics -->
        <div class="overview-section">
          <div class="overview-metrics">
            <div class="overview-metric">
              <span class="overview-value">{{ conversationCount }}</span>
              <span class="overview-label">Conversations</span>
            </div>
            <div class="overview-metric">
              <span class="overview-value">{{ deflectionRate }}%</span>
              <span class="overview-label">Deflection Rate</span>
            </div>
            <div class="overview-metric">
              <span class="overview-value">{{ avgResponseTime }}</span>
              <span class="overview-label">Avg Response</span>
            </div>
          </div>
        </div>

        <!-- Time Period Toggle -->
        <div class="time-toggle">
          <button
            v-for="period in timePeriods"
            :key="period"
            class="time-btn"
            :class="{ active: selectedPeriod === period }"
            @click.stop="selectedPeriod = period"
          >
            {{ period }}
          </button>
        </div>

        <!-- Deflection Rate Chart -->
        <div class="chart-section">
          <div class="chart-header">
            <span class="chart-title">Deflection Rate</span>
            <span class="chart-value">{{ deflectionRate }}%</span>
          </div>
          <div class="mini-chart">
            <svg viewBox="0 0 200 50" class="line-chart">
              <polyline
                :points="deflectionChartPoints"
                fill="none"
                stroke="#000"
                stroke-width="2"
              />
            </svg>
          </div>
        </div>

        <!-- Feedback Charts -->
        <div class="feedback-section">
          <div class="feedback-chart">
            <div class="chart-header">
              <span class="chart-title">👍 Positive</span>
              <span class="chart-value">{{ thumbsUpCount }}</span>
            </div>
            <div class="bar-chart">
              <div
                v-for="(value, index) in thumbsUpData"
                :key="'up-' + index"
                class="bar"
                :style="{ height: value + '%' }"
              ></div>
            </div>
          </div>
          <div class="feedback-chart">
            <div class="chart-header">
              <span class="chart-title">👎 Negative</span>
              <span class="chart-value">{{ thumbsDownCount }}</span>
            </div>
            <div class="bar-chart">
              <div
                v-for="(value, index) in thumbsDownData"
                :key="'down-' + index"
                class="bar negative"
                :style="{ height: value + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Actions Row -->
        <div class="actions-row" @click.stop>
          <button class="action-btn action-btn-secondary" @click="() => router.push(`/agents-v2/${agent.id}/build`)">
            Build
          </button>
          <button class="action-btn" @click="primaryAction.handler">
            {{ primaryAction.label }}
          </button>
        </div>
      </template>

      <!-- Draft Agent Card: Simple View (unchanged) -->
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
          <button class="action-btn action-btn-secondary" @click="() => router.push(`/agents-v2/${agent.id}/build`)">
            Build
          </button>
          <button class="action-btn" @click="primaryAction.handler">
            {{ primaryAction.label }}
          </button>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
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

// Time period selection for live agents
const timePeriods = ['1D', '1W', '1M']
const selectedPeriod = ref('1D')

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

// Mock data and computeds for live agent monitoring
const avgResponseTime = computed(() => {
  return props.agent.avgResponseTime || '2.3s'
})

const thumbsUpCount = computed(() => {
  return props.agent.thumbsUpCount || Math.floor(Math.random() * 50 + 100)
})

const thumbsDownCount = computed(() => {
  return props.agent.thumbsDownCount || Math.floor(Math.random() * 20 + 10)
})

// Mock chart data - generates simple datasets
const deflectionChartPoints = computed(() => {
  // Generate mock line chart points for deflection rate
  const dataPoints = [85, 82, 88, 86, 90, 87, 92, 89]
  return dataPoints.map((value, index) => {
    const x = (index / (dataPoints.length - 1)) * 200
    const y = 50 - ((value - 75) / 25) * 50
    return `${x},${y}`
  }).join(' ')
})

const thumbsUpData = computed(() => {
  // Generate mock bar chart data for thumbs up
  return [60, 75, 85, 70, 90, 80, 95, 88]
})

const thumbsDownData = computed(() => {
  // Generate mock bar chart data for thumbs down
  return [30, 25, 20, 35, 15, 22, 18, 25]
})
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

.action-btn {
  flex: 1;
  padding: 10px 20px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #333;
}

.action-btn-secondary {
  background: #fff;
  color: #000;
  border: 1px solid #ddd;
}

.action-btn-secondary:hover {
  background: #fafafa;
  border-color: #000;
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

/* Live Agent Monitoring Styles */
.overview-section {
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.overview-metrics {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.overview-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.overview-value {
  font-size: 24px;
  font-weight: 600;
  color: #000;
  line-height: 1;
}

.overview-label {
  font-size: 12px;
  color: #999;
  text-align: center;
}

/* Time Period Toggle */
.time-toggle {
  display: flex;
  gap: 8px;
  justify-content: center;
  padding: 12px 0;
}

.time-btn {
  padding: 6px 16px;
  background: #fff;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn:hover {
  border-color: #999;
  background: #fafafa;
}

.time-btn.active {
  background: #000;
  color: #fff;
  border-color: #000;
}

/* Chart Sections */
.chart-section {
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chart-title {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.chart-value {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.mini-chart {
  height: 60px;
  background: #f8f8f8;
  border-radius: 4px;
  padding: 8px;
}

.line-chart {
  width: 100%;
  height: 100%;
}

/* Feedback Section */
.feedback-section {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
}

.feedback-chart {
  flex: 1;
}

.bar-chart {
  height: 60px;
  display: flex;
  align-items: flex-end;
  gap: 4px;
  background: #f8f8f8;
  border-radius: 4px;
  padding: 8px;
}

.bar {
  flex: 1;
  background: #000;
  border-radius: 2px;
  min-height: 4px;
  transition: all 0.3s;
}

.bar.negative {
  background: #e0e0e0;
}
</style>
