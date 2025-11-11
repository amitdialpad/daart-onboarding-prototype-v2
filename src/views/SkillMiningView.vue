<template>
  <div class="skill-mining-view">
    <!-- Agent Header -->
    <div v-if="agent" class="workspace-header">
      <div class="header-left">
        <h1 class="agent-name">{{ agent.name }}</h1>
        <div class="agent-meta">
          <span class="meta-badge" :class="agent.status">
            {{ agent.status === 'live' ? 'Live' : 'Draft' }}
          </span>
          <span class="meta-divider">·</span>
          <span class="meta-type">{{ agentTypeLabel }}</span>
          <span v-if="activeChannelLabels.length > 0" class="meta-divider">·</span>
          <span v-for="(channel, index) in activeChannelLabels" :key="index" class="channel-badge">
            {{ channel }}
          </span>
        </div>
      </div>
    </div>

    <div class="skill-mining-header">
      <h2>Suggested Skills</h2>
      <p class="subtitle">Discover new skills from conversation patterns and user behavior</p>
    </div>

    <div class="skill-mining-content">
      <!-- Suggested Skills -->
      <div class="suggested-skills-section">
        <p class="section-subtitle-small">Discovered from analyzing {{ totalConversations }} conversations</p>

        <div class="suggested-skills-list">
          <div class="suggested-skill-card">
            <div class="skill-card-main">
              <div class="skill-card-left">
                <div class="skill-card-name">Order Status Lookup</div>
                <div class="skill-card-frequency">47 conversations</div>
                <div class="skill-card-description">Users frequently ask about order status and tracking information</div>
              </div>
              <div class="skill-card-right">
                <div class="confidence-badge high">High Confidence: 92%</div>
                <button class="btn-primary-sm" @click="addSkill('Order Status Lookup')">Add Skill</button>
              </div>
            </div>
          </div>

          <div class="suggested-skill-card">
            <div class="skill-card-main">
              <div class="skill-card-left">
                <div class="skill-card-name">Refund Processing</div>
                <div class="skill-card-frequency">31 conversations</div>
                <div class="skill-card-description">Common requests for refunds and return processing</div>
              </div>
              <div class="skill-card-right">
                <div class="confidence-badge high">High Confidence: 85%</div>
                <button class="btn-primary-sm" @click="addSkill('Refund Processing')">Add Skill</button>
              </div>
            </div>
          </div>

          <div class="suggested-skill-card">
            <div class="skill-card-main">
              <div class="skill-card-left">
                <div class="skill-card-name">Account Password Reset</div>
                <div class="skill-card-frequency">23 conversations</div>
                <div class="skill-card-description">Users need help resetting passwords and account access</div>
              </div>
              <div class="skill-card-right">
                <div class="confidence-badge medium">Medium Confidence: 78%</div>
                <button class="btn-primary-sm" @click="addSkill('Account Password Reset')">Add Skill</button>
              </div>
            </div>
          </div>

          <div class="suggested-skill-card">
            <div class="skill-card-main">
              <div class="skill-card-left">
                <div class="skill-card-name">Shipping Delay Inquiry</div>
                <div class="skill-card-frequency">18 conversations</div>
                <div class="skill-card-description">Questions about delayed shipments and delivery estimates</div>
              </div>
              <div class="skill-card-right">
                <div class="confidence-badge medium">Medium Confidence: 72%</div>
                <button class="btn-primary-sm" @click="addSkill('Shipping Delay Inquiry')">Add Skill</button>
              </div>
            </div>
          </div>

          <div class="suggested-skill-card">
            <div class="skill-card-main">
              <div class="skill-card-left">
                <div class="skill-card-name">Product Recommendations</div>
                <div class="skill-card-frequency">15 conversations</div>
                <div class="skill-card-description">Users asking for product suggestions and comparisons</div>
              </div>
              <div class="skill-card-right">
                <div class="confidence-badge low">Low Confidence: 64%</div>
                <button class="btn-secondary-sm" @click="addSkill('Product Recommendations')">Add Skill</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- How It Works -->
      <div class="info-section">
        <h4 class="section-heading">How It Works</h4>
        <div class="info-cards">
          <div class="info-card">
            <div class="info-content">
              <h5>Pattern Detection</h5>
              <p>We analyze your conversations to identify common user intents and questions</p>
            </div>
          </div>
          <div class="info-card">
            <div class="info-content">
              <h5>Confidence Scoring</h5>
              <p>Each suggestion is scored based on frequency, consistency, and clarity</p>
            </div>
          </div>
          <div class="info-card">
            <div class="info-content">
              <h5>One-Click Addition</h5>
              <p>Add discovered skills to your agent with a single click</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const agent = ref(null)
const totalConversations = ref(134)

const agentTypeLabel = computed(() => {
  return agent.value?.agentType === 'phone' ? 'Voice Agent' : 'Digital Agent'
})

const activeChannelLabels = computed(() => {
  if (!agent.value) return []
  const labels = []

  if (agent.value.agentType === 'phone') {
    labels.push('Voice')
  } else if (agent.value.agentType === 'chat') {
    labels.push('Web Chat')
    if (agent.value.smsEnabled) {
      labels.push('SMS')
    }
  }

  return labels
})

onMounted(() => {
  const agentId = route.params.id
  if (agentId) {
    const agentsData = localStorage.getItem('daart-agents')
    if (agentsData) {
      const agents = JSON.parse(agentsData)
      agent.value = agents.find(a => a.id === agentId)
    }
  }
})

function addSkill(skillName) {
  // Navigate to Build > Skills with the skill name
  router.push({
    path: `/agents-v2/${route.params.id}/build`,
    query: { section: 'skills', addSkill: skillName }
  })
}
</script>

<style scoped>
.skill-mining-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow-y: auto;
}

/* Workspace Header */
.workspace-header {
  padding: 24px 40px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agent-name {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.agent-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #666;
}

.meta-badge {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.meta-badge.draft {
  background: #f0f0f0;
  color: #666;
}

.meta-badge.live {
  background: #e8f5e9;
  color: #2e7d32;
}

.meta-divider {
  color: #999;
}

.meta-type {
  font-weight: 500;
}

.channel-badge {
  padding: 2px 8px;
  background: #e0e0e0;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}

.skill-mining-header {
  padding: 40px 40px 24px 40px;
  border-bottom: 1px solid #e0e0e0;
}

.skill-mining-header h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.skill-mining-content {
  padding: 40px;
}

/* Suggested Skills Section */
.suggested-skills-section {
  margin-bottom: 48px;
}

.section-heading {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.section-subtitle-small {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
}

.suggested-skills-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.suggested-skill-card {
  padding: 20px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s;
}

.suggested-skill-card:hover {
  border-color: #999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.skill-card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.skill-card-left {
  flex: 1;
  min-width: 0;
}

.skill-card-name {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.skill-card-frequency {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.skill-card-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.skill-card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;
}

.confidence-badge {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.confidence-badge.high {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.confidence-badge.medium {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffcc80;
}

.confidence-badge.low {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
}

.btn-primary-sm {
  padding: 8px 16px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary-sm:hover {
  background: #333;
}

.btn-secondary-sm {
  padding: 8px 16px;
  background: #fff;
  color: #000;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary-sm:hover {
  background: #f5f5f5;
  border-color: #000;
}

/* Info Section */
.info-section {
  padding-top: 40px;
  border-top: 1px solid #e0e0e0;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 24px;
}

.info-card {
  padding: 24px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.info-content h5 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.info-content p {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}
</style>
