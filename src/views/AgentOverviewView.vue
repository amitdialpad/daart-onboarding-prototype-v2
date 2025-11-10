<template>
  <div class="agent-overview">
    <div class="overview-header">
      <h1 class="overview-title">{{ agent?.name || 'Agent Overview' }}</h1>
      <div class="agent-status-badge" :class="agent?.status">
        {{ agent?.status === 'live' ? 'Live' : 'Draft' }}
      </div>
    </div>

    <div class="overview-content">
      <!-- Agent Summary Card -->
      <div class="summary-card">
        <h3 class="card-title">Agent Summary</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <span class="summary-label">Status</span>
            <span class="summary-value">{{ agent?.status === 'live' ? 'Live' : 'Draft' }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Last Modified</span>
            <span class="summary-value">{{ formatDate(agent?.lastModified) }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Channels</span>
            <span class="summary-value">{{ channelCount }} active</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Skills</span>
            <span class="summary-value">{{ skillsCount }} configured</span>
          </div>
        </div>
      </div>

      <!-- Quick Metrics (for Live agents only) -->
      <div v-if="agent?.status === 'live'" class="metrics-section">
        <h3 class="card-title">Quick Metrics (Last 24h)</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">{{ metrics.totalSessions }}</div>
            <div class="metric-label">Total Sessions</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ metrics.deflectionRate }}%</div>
            <div class="metric-label">Deflection Rate</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ metrics.aiCsat }}/5</div>
            <div class="metric-label">AI CSAT Score</div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Feed -->
      <div class="activity-section">
        <h3 class="card-title">Recent Activity</h3>
        <div class="activity-list">
          <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="activity.type"></div>
            <div class="activity-content">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
          </div>
          <div v-if="recentActivity.length === 0" class="empty-activity">
            No recent activity
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h3 class="card-title">Quick Actions</h3>
        <div class="actions-grid">
          <router-link :to="`/agents-v2/${$route.params.id}/test`" class="action-button">
            <span class="action-label">Test Agent</span>
            <span class="action-arrow">→</span>
          </router-link>
          <router-link :to="`/agents-v2/${$route.params.id}/conversations`" class="action-button">
            <span class="action-label">View Conversations</span>
            <span class="action-arrow">→</span>
          </router-link>
          <router-link v-if="agent?.status === 'draft'" :to="`/agents-v2/${$route.params.id}/deploy`" class="action-button">
            <span class="action-label">Deploy Agent</span>
            <span class="action-arrow">→</span>
          </router-link>
          <router-link v-else :to="`/agents-v2/${$route.params.id}/analyze`" class="action-button">
            <span class="action-label">View Analytics</span>
            <span class="action-arrow">→</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const agent = ref(null)

const channelCount = computed(() => {
  if (!agent.value) return 0
  let count = 0
  if (agent.value.channels?.chat) count++
  if (agent.value.channels?.voice) count++
  if (agent.value.channels?.sms) count++
  return count
})

const skillsCount = computed(() => {
  return agent.value?.skills?.length || 0
})

const metrics = ref({
  totalSessions: 234,
  deflectionRate: 78,
  aiCsat: 4.2
})

const recentActivity = ref([
  {
    id: 1,
    type: 'conversation',
    title: 'New conversation completed',
    time: '5 minutes ago'
  },
  {
    id: 2,
    type: 'skill',
    title: 'Skill "Order Lookup" used 3 times',
    time: '1 hour ago'
  },
  {
    id: 3,
    type: 'config',
    title: 'Configuration updated',
    time: '3 hours ago'
  },
  {
    id: 4,
    type: 'alert',
    title: 'New skill suggestion discovered',
    time: '5 hours ago'
  }
])

function formatDate(date) {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(() => {
  // Load agent from localStorage
  const agentsData = localStorage.getItem('daart-agents-v2')
  if (agentsData) {
    const agents = JSON.parse(agentsData)
    agent.value = agents.find(a => a.id === route.params.id)
  }
})
</script>

<style scoped>
.agent-overview {
  height: 100%;
  overflow-y: auto;
  background: #fafafa;
}

.overview-header {
  padding: 40px 40px 24px 40px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.overview-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.agent-status-badge {
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.agent-status-badge.live {
  background: #e8f5e9;
  color: #2e7d32;
}

.agent-status-badge.draft {
  background: #fff3e0;
  color: #e65100;
}

.overview-content {
  padding: 24px 40px 40px 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.summary-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 24px;
  grid-column: 1 / -1;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #000;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
}

.summary-value {
  font-size: 16px;
  color: #000;
  font-weight: 500;
}

.metrics-section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 24px;
  grid-column: 1 / -1;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.metric-card {
  text-align: center;
  padding: 20px;
  background: #fafafa;
  border-radius: 4px;
}

.metric-value {
  font-size: 32px;
  font-weight: 600;
  color: #000;
  margin-bottom: 8px;
}

.metric-label {
  font-size: 14px;
  color: #666;
}

.activity-section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 24px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #f5f5f5;
}

.activity-icon.conversation {
  background: #e3f2fd;
}

.activity-icon.skill {
  background: #f3e5f5;
}

.activity-icon.config {
  background: #fff3e0;
}

.activity-icon.alert {
  background: #ffebee;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  color: #000;
  margin-bottom: 4px;
}

.activity-time {
  font-size: 12px;
  color: #666;
}

.empty-activity {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 14px;
}

.quick-actions {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 24px;
}

.actions-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.2s;
}

.action-button:hover {
  background: #f5f5f5;
  border-color: #000;
}

.action-label {
  font-size: 14px;
  font-weight: 500;
  color: #000;
}

.action-arrow {
  font-size: 18px;
  color: #666;
}
</style>
