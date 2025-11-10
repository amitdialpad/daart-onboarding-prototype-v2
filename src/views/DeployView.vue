<template>
  <div class="deploy-view">
    <!-- Integration Info (Live Agents) -->
    <div v-if="agent.status === 'live' && !showReviewBeforeRepublish" class="integration-state">
      <div class="integration-header">
        <h1>Integration & Setup</h1>
        <p class="integration-description">Your agent is live. Use the information below to integrate with your systems.</p>
      </div>

      <div class="integration-content">
        <!-- Setup Instructions -->
        <div class="integration-section">
          <h2>Setup Instructions</h2>

          <div v-if="agent.agentType === 'phone'" class="setup-instructions">
            <div class="instruction-box">
              <h3>1. Your Phone Number</h3>
              <p class="phone-number-display">{{ agent.phoneNumber || '+1 (555) 123-4567' }}</p>
              <p>Customers can now call this number to reach your agent.</p>
            </div>

            <div class="instruction-box">
              <h3>2. Test Your Agent</h3>
              <p>Call the number above to test the live experience. All calls will be recorded and appear in your Monitor tab.</p>
            </div>

            <div class="instruction-box">
              <h3>3. Share With Your Team</h3>
              <p>Update your website, marketing materials, and customer communications with the new phone number.</p>
            </div>
          </div>

          <div v-else class="setup-instructions">
            <div class="instruction-box">
              <h3>1. Add Chat Widget to Your Website</h3>
              <pre class="code-snippet">&lt;script src="https://cdn.dialpad.com/agents/widget.js"&gt;&lt;/script&gt;
&lt;script&gt;
  DialpadAgents.init({
    agentId: '{{ agent.id }}',
    position: '{{ agent.chatPosition || 'bottom-right' }}'
  });
&lt;/script&gt;</pre>
              <button class="copy-button">Copy Code</button>
            </div>

            <div class="instruction-box" v-if="agent.smsEnabled">
              <h3>2. SMS Number</h3>
              <p class="phone-number-display">{{ agent.smsNumber || '+1 (555) 987-6543' }}</p>
              <p>Customers can text this number to reach your agent. Auto-replies are {{ agent.smsAutoReply ? 'enabled' : 'disabled' }}.</p>
            </div>

            <div class="instruction-box">
              <h3>{{ agent.smsEnabled ? '3' : '2' }}. Monitor Performance</h3>
              <p>Track conversations, response times, and customer satisfaction in the Monitor tab.</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="integration-actions">
          <button class="btn-primary" @click="goToMonitor">
            Start Monitoring
          </button>
        </div>
      </div>
    </div>

    <!-- Deploy Review State (Draft Agents) -->
    <div v-else class="deploy-content">
      <div class="deploy-header">
        <div class="header-left">
          <button class="back-button" @click="goBack">← Back</button>
          <h1>Review & Publish</h1>
          <p class="deploy-description">Confirm your agent configuration before publishing it live.</p>
        </div>
        <div class="header-right">
          <button
            class="btn-publish-header"
            @click="publishAgent"
            :disabled="!canPublish">
            {{ canPublish ? 'Publish Agent' : 'Complete Configuration' }}
          </button>
          <button class="btn-cancel-header" @click="goBack">
            Cancel
          </button>
        </div>
      </div>

      <div class="deploy-layout">
        <!-- Main Content - Right Column (Primary Focus) -->
        <div class="deploy-primary">
          <!-- What will this cost? -->
          <div class="primary-box cost-box">
            <h2>What will this cost?</h2>

            <div class="cost-section">
              <div class="cost-item-large">
                <span class="cost-label">During free trial</span>
                <span class="cost-value">$0</span>
                <span class="cost-detail">847 conversations remaining</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="cost-section">
              <div class="cost-item-large">
                <span class="cost-label">After trial ends</span>
                <span class="cost-value">${{ agent.agentType === 'phone' ? '0.10' : '0.05' }}</span>
                <span class="cost-detail">per conversation</span>
              </div>
            </div>

            <div class="cost-details-list">
              <div class="cost-detail-item">
                <span class="detail-icon">✓</span>
                <span v-if="agent.agentType === 'phone'">Charged per minute of voice interaction</span>
                <span v-else>Charged per chat session started</span>
              </div>
              <div class="cost-detail-item">
                <span class="detail-icon">✓</span>
                <span>No setup fees or monthly minimums</span>
              </div>
              <div class="cost-detail-item">
                <span class="detail-icon">✓</span>
                <span>Pay only for actual conversations</span>
              </div>
            </div>

            <p class="cost-note">Based on typical usage, most customers spend $150-$300/month</p>
          </div>

          <!-- When will you be charged? -->
          <div class="primary-box billing-box">
            <h2>When will you be charged?</h2>

            <div class="billing-timeline">
              <div class="timeline-item current">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <h3>Right now</h3>
                  <p><strong>No charge.</strong> You're in your free trial period.</p>
                </div>
              </div>

              <div class="timeline-item future">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <h3>In 23 days</h3>
                  <p>We'll notify you 7 days before your trial ends. You can add credits or pause your agent.</p>
                </div>
              </div>

              <div class="timeline-item future">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <h3>After trial</h3>
                  <p>Charges apply only when your agent handles conversations. You control when to add credits.</p>
                </div>
              </div>
            </div>

            <div class="trial-balance-banner">
              <div class="balance-info">
                <span class="balance-label">Current trial balance:</span>
                <span class="balance-amount">$445.00</span>
              </div>
              <span class="balance-note">Covers ~4,450 conversations</span>
            </div>
          </div>
        </div>

        <!-- Secondary Content - Left Column (Configuration Summary) -->
        <div class="deploy-secondary">
          <!-- Agent Summary -->
          <div class="config-section-compact">
            <h3>Agent Overview</h3>
            <div class="summary-list">
              <div class="summary-item-compact">
                <span class="summary-label">Name</span>
                <span class="summary-value">{{ agent.name }}</span>
              </div>
              <div class="summary-item-compact">
                <span class="summary-label">Type</span>
                <span class="summary-value">{{ agent.agentType === 'phone' ? 'Voice Agent' : 'Digital Agent' }}</span>
              </div>
              <div class="summary-item-compact">
                <span class="summary-label">Channels</span>
                <span class="summary-value">{{ getChannelsSummary() }}</span>
              </div>
            </div>
          </div>

          <!-- Configuration Completeness -->
          <div class="config-section-compact">
            <h3>Configuration</h3>
            <div class="checklist-compact">
              <div class="checklist-item-compact" :class="{ complete: agent.instructions }">
                <span class="checkbox-compact">{{ agent.instructions ? '✓' : '○' }}</span>
                <span>Instructions configured</span>
              </div>
              <div class="checklist-item-compact" :class="{ complete: agent.knowledgeBase }">
                <span class="checkbox-compact">{{ agent.knowledgeBase ? '✓' : '○' }}</span>
                <span>Knowledge base added</span>
              </div>
              <div class="checklist-item-compact" :class="{ complete: hasSkills }">
                <span class="checkbox-compact">{{ hasSkills ? '✓' : '○' }}</span>
                <span>Skills configured</span>
              </div>
              <div v-if="agent.agentType === 'phone'" class="checklist-item-compact" :class="{ complete: agent.phoneNumber }">
                <span class="checkbox-compact">{{ agent.phoneNumber ? '✓' : '○' }}</span>
                <span>Phone number assigned</span>
              </div>
              <div v-if="agent.agentType === 'chat' && agent.smsEnabled" class="checklist-item-compact" :class="{ complete: agent.smsNumber }">
                <span class="checkbox-compact">{{ agent.smsNumber ? '✓' : '○' }}</span>
                <span>SMS number configured</span>
              </div>
            </div>

            <!-- Warning if SMS enabled but not configured -->
            <div v-if="agent.agentType === 'chat' && agent.smsEnabled && !agent.smsNumber" class="warning-box-compact">
              ⚠️ SMS is enabled but no phone number is configured.
            </div>
          </div>

          <!-- What Happens When You Publish -->
          <div class="config-section-compact collapsible">
            <h3>What happens when you publish?</h3>
            <ul class="publish-info-list-compact">
              <li v-if="agent.agentType === 'phone'">Starts answering calls on {{ agent.phoneNumber || 'assigned number' }}</li>
              <li v-else>Chat widget goes live on your website</li>
              <li v-if="agent.agentType === 'chat' && agent.smsEnabled">SMS messaging enabled</li>
              <li>Conversations recorded in Monitor tab</li>
              <li>Can unpublish anytime to make changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const agent = ref({})
const showReviewBeforeRepublish = ref(false)

onMounted(() => {
  loadAgent()
})

function loadAgent() {
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  const found = agents.find(a => a.id === route.params.id)
  if (found) {
    agent.value = found
  } else {
    // Agent not found, redirect back
    router.push('/agents-v2')
  }
}

const hasSkills = computed(() => {
  return agent.value.skills && agent.value.skills.length > 0
})

const canPublish = computed(() => {
  // Must have instructions at minimum
  if (!agent.value.instructions) return false

  // If SMS is enabled for chat agents, must have SMS number
  if (agent.value.agentType === 'chat' && agent.value.smsEnabled && !agent.value.smsNumber) {
    return false
  }

  return true
})

function getChannelsSummary() {
  const channels = []

  if (agent.value.agentType === 'phone') {
    channels.push('Phone')
  } else {
    channels.push('Web Chat')
    if (agent.value.smsEnabled) {
      channels.push('SMS')
    }
  }

  return channels.join(', ')
}

function publishAgent() {
  if (!canPublish.value) return

  // Update agent status
  agent.value.status = 'live'
  if (!agent.value.hasBeenPublished) {
    agent.value.firstPublishedDate = new Date().toISOString()
    agent.value.hasBeenPublished = true
  }
  agent.value.lastPublishedDate = new Date().toISOString()

  // Save to localStorage
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  const index = agents.findIndex(a => a.id === agent.value.id)
  if (index !== -1) {
    agents[index] = agent.value
    localStorage.setItem('daart-agents', JSON.stringify(agents))
  }

  // Reload agent to trigger integration info display
  loadAgent()
}

function goToMonitor() {
  router.push(`/agents-v2/${agent.value.id}/analyze`)
}

function goBack() {
  router.push(`/agents-v2/${agent.value.id}/build`)
}
</script>

<style scoped>
.deploy-view {
  background: #fff;
  min-height: 100vh;
}

/* Deploy Review State */
.deploy-content {
  padding: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.deploy-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e0e0e0;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex-shrink: 0;
  padding-top: 8px;
}

.back-button {
  background: none;
  border: none;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 8px 0;
  transition: color 0.2s;
}

.back-button:hover {
  color: #000;
}

.deploy-header h1 {
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.deploy-description {
  font-size: 16px;
  color: #666;
  margin: 0;
}

/* Header Buttons */
.btn-publish-header {
  padding: 16px 32px;
  background: #000;
  color: #fff;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-publish-header:hover:not(:disabled) {
  background: #333;
}

.btn-publish-header:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-cancel-header {
  padding: 16px 24px;
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-cancel-header:hover {
  border-color: #000;
  color: #000;
}

.deploy-layout {
  display: grid;
  grid-template-columns: 500px 1fr;
  gap: 48px;
  align-items: start;
}

/* Primary Column (Right - Billing/Cost Focus) */
.deploy-primary {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.primary-box {
  padding: 40px;
  border: 2px solid #000;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.primary-box h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 32px 0;
  color: #000;
}

.cost-section {
  margin-bottom: 24px;
}

.cost-item-large {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cost-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cost-value {
  font-size: 48px;
  font-weight: 700;
  color: #000;
  line-height: 1;
}

.cost-detail {
  font-size: 16px;
  color: #666;
}

.divider {
  height: 1px;
  background: #ddd;
  margin: 24px 0;
}

.cost-details-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.cost-detail-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

.detail-icon {
  font-size: 16px;
  color: #4caf50;
  font-weight: 600;
  flex-shrink: 0;
}

.cost-note {
  margin-top: 24px;
  padding: 16px;
  background: #f0f9ff;
  border-left: 3px solid #0066cc;
  font-size: 14px;
  color: #004080;
  line-height: 1.6;
}

/* Billing Timeline */
.billing-timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
}

.timeline-item:not(:last-child):before {
  content: '';
  position: absolute;
  left: 8px;
  top: 24px;
  bottom: -24px;
  width: 2px;
  background: #ddd;
}

.timeline-marker {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 3px solid #ddd;
  background: #fff;
  flex-shrink: 0;
  margin-top: 4px;
  position: relative;
  z-index: 1;
}

.timeline-item.current .timeline-marker {
  border-color: #4caf50;
  background: #4caf50;
}

.timeline-content h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.timeline-content p {
  font-size: 14px;
  line-height: 1.6;
  color: #666;
  margin: 0;
}

.trial-balance-banner {
  padding: 20px;
  background: #f0f9ff;
  border: 1px solid #0066cc;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-label {
  font-size: 14px;
  color: #004080;
  font-weight: 500;
}

.balance-amount {
  font-size: 24px;
  font-weight: 700;
  color: #004080;
}

.balance-note {
  font-size: 13px;
  color: #004080;
}

/* Primary Buttons */
.btn-publish-primary {
  width: 100%;
  padding: 20px 32px;
  background: #000;
  color: #fff;
  border: none;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.btn-publish-primary:hover:not(:disabled) {
  background: #333;
}

.btn-publish-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-cancel-primary {
  width: 100%;
  padding: 14px 32px;
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel-primary:hover {
  border-color: #000;
  color: #000;
}

/* Secondary Column (Left - Configuration Summary) */
.deploy-secondary {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-section-compact {
  padding: 24px;
  border: 1px solid #ddd;
  background: #fafafa;
}

.config-section-compact h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #000;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-item-compact {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.checklist-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checklist-item-compact {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #fff;
  border: 1px solid #ddd;
  color: #666;
  font-size: 13px;
}

.checklist-item-compact.complete {
  border-color: #4caf50;
  background: #f1f8f4;
  color: #000;
}

.checkbox-compact {
  font-size: 14px;
  font-weight: 600;
  color: #4caf50;
}

.checklist-item-compact:not(.complete) .checkbox-compact {
  color: #ccc;
}

.warning-box-compact {
  margin-top: 12px;
  padding: 12px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
  font-size: 12px;
  line-height: 1.5;
}

.publish-info-list-compact {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.publish-info-list-compact li {
  padding-left: 20px;
  position: relative;
  font-size: 13px;
  line-height: 1.5;
  color: #333;
}

.publish-info-list-compact li:before {
  content: '•';
  position: absolute;
  left: 8px;
  color: #666;
  font-size: 12px;
}

/* Review Content */
.review-content {
  background: #fff;
  padding: 20px;
  border: 1px solid #ddd;
}

.review-text {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  margin: 0;
  white-space: pre-wrap;
}

/* Skills List */
.skills-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #ddd;
}

.skill-icon {
  font-size: 16px;
}

.skill-name {
  font-size: 14px;
  font-weight: 500;
  color: #000;
}

/* Settings Grid */
.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: #fff;
  border: 1px solid #ddd;
}

.setting-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.setting-value {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
  display: inline-block;
}

/* Test Scenarios */
.scenarios-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.scenario-item {
  padding: 16px;
  background: #fff;
  border: 1px solid #ddd;
}

.scenario-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.scenario-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #000;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  border-radius: 50%;
}

.scenario-name {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.scenario-description {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  padding-left: 36px;
}

/* Sidebar */
.deploy-sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 24px;
  align-self: flex-start;
}

.sidebar-box {
  padding: 24px;
  border: 1px solid #ddd;
  background: #fafafa;
}

.sidebar-box h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.sidebar-box p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.trial-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.trial-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #000;
}

.trial-note {
  font-size: 12px !important;
  color: #999 !important;
  margin-top: 16px !important;
}

.billing-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.billing-list li {
  font-size: 13px;
  color: #666;
  padding-left: 16px;
  position: relative;
}

.billing-list li:before {
  content: '•';
  position: absolute;
  left: 0;
}

.btn-publish {
  width: 100%;
  padding: 16px 24px;
  background: #000;
  color: #fff;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-publish:hover:not(:disabled) {
  background: #333;
}

.btn-publish:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-cancel {
  width: 100%;
  padding: 12px 24px;
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  border-color: #000;
  color: #000;
}

/* Integration State (Live Agents) */
.integration-state {
  padding: 60px 40px;
  max-width: 900px;
  margin: 0 auto;
}

.integration-header {
  margin-bottom: 48px;
}

.integration-header h1 {
  font-size: 36px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.integration-description {
  font-size: 18px;
  color: #666;
  margin: 0;
}

.integration-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.integration-section h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px 0;
}

.setup-instructions {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.instruction-box {
  padding: 24px;
  border: 1px solid #ddd;
  background: #fafafa;
}

.instruction-box h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.instruction-box p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.phone-number-display {
  font-size: 24px !important;
  font-weight: 600 !important;
  color: #000 !important;
  margin: 12px 0 !important;
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
}

.code-snippet {
  background: #f5f5f5;
  border: 1px solid #ddd;
  padding: 16px;
  font-family: 'SF Mono', Monaco, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  overflow-x: auto;
  margin: 12px 0;
  white-space: pre;
}

.copy-button {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #ddd;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-button:hover {
  border-color: #000;
}

.integration-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.btn-primary,
.btn-secondary {
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #000;
  color: #fff;
  border: 2px solid #000;
}

.btn-primary:hover {
  background: #333;
  border-color: #333;
}

.btn-secondary {
  background: #fff;
  color: #000;
  border: 2px solid #ddd;
}

.btn-secondary:hover {
  border-color: #000;
}
</style>
