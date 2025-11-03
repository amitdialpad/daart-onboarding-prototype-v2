<template>
  <div class="dashboard">
    <nav class="sidebar">
      <div class="logo">DAART Standalone</div>
      <div class="nav-items">
        <router-link to="/dashboard" class="nav-item">
          <span class="icon">📊</span> Dashboard
        </router-link>
        <router-link to="/workflow-builder" class="nav-item">
          <span class="icon">🔀</span> Workflow Builder
        </router-link>
        <router-link to="/skill-builder" class="nav-item">
          <span class="icon">⚡</span> Skill Builder
        </router-link>
        <router-link to="/credits" class="nav-item active">
          <span class="icon">💳</span> Credits & Usage
        </router-link>
        <router-link to="/billing" class="nav-item">
          <span class="icon">💰</span> Billing
        </router-link>
      </div>
    </nav>

    <div class="main-content">
      <header class="page-header">
        <h1>Credits & Usage</h1>
        <p>Track your conversation usage and costs</p>
      </header>

      <!-- Current Usage Card -->
      <div class="usage-card">
        <div class="usage-header">
          <h2>Current Usage</h2>
          <span v-if="agenticStore.isInTrial" class="status-badge trial">Trial</span>
          <span v-else class="status-badge paid">Pay-as-you-Go</span>
        </div>

        <div class="usage-visual">
          <div class="usage-circle">
            <svg viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="#e0e0e0"
                stroke-width="12"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                :stroke="usageColor"
                stroke-width="12"
                stroke-linecap="round"
                :stroke-dasharray="`${circumference}`"
                :stroke-dashoffset="dashOffset"
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div class="usage-text">
              <div class="usage-number">{{ agenticStore.conversationsUsed }}</div>
              <div class="usage-label">conversations</div>
            </div>
          </div>

          <div class="usage-details">
            <div class="detail-row">
              <span class="detail-label">Conversations Used</span>
              <span class="detail-value">{{ agenticStore.conversationsUsed }}</span>
            </div>
            <div v-if="agenticStore.isInTrial" class="detail-row">
              <span class="detail-label">Trial Limit</span>
              <span class="detail-value">{{ agenticStore.conversationsLimit }}</span>
            </div>
            <div v-if="agenticStore.isInTrial" class="detail-row">
              <span class="detail-label">Remaining</span>
              <span class="detail-value highlight">{{ agenticStore.conversationsRemaining }}</span>
            </div>
            <div v-if="agenticStore.isPayAsYouGo" class="detail-row">
              <span class="detail-label">Cost per Conversation</span>
              <span class="detail-value">${{ agenticStore.pricePerConversation.toFixed(2) }}</span>
            </div>
            <div v-if="agenticStore.isPayAsYouGo" class="detail-row total">
              <span class="detail-label">Current Month Cost</span>
              <span class="detail-value">${{ agenticStore.currentMonthCost.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div v-if="agenticStore.isInTrial && agenticStore.isNearLimit" class="upgrade-prompt">
          <p>You're approaching your trial limit. Upgrade to pay-as-you-go to continue without interruption.</p>
          <button @click="goToUpgrade" class="btn-upgrade">Upgrade Now</button>
        </div>
      </div>

      <!-- Usage History -->
      <div class="usage-history">
        <h2>Usage History</h2>
        <div class="history-table">
          <div class="table-header">
            <div>Date</div>
            <div>Conversations</div>
            <div>Cost</div>
          </div>
          <div class="table-row" v-for="row in mockUsageHistory" :key="row.date">
            <div>{{ row.date }}</div>
            <div>{{ row.conversations }}</div>
            <div>{{ row.cost }}</div>
          </div>
        </div>
      </div>

      <!-- Pricing Info -->
      <div v-if="agenticStore.isInTrial" class="pricing-info">
        <h2>Pay-as-you-Go Pricing</h2>
        <div class="pricing-grid">
          <div class="pricing-item">
            <div class="pricing-icon">💬</div>
            <div class="pricing-content">
              <div class="pricing-value">${{ agenticStore.pricePerConversation.toFixed(2) }}</div>
              <div class="pricing-label">per conversation</div>
            </div>
          </div>
          <div class="pricing-item">
            <div class="pricing-icon">∞</div>
            <div class="pricing-content">
              <div class="pricing-value">Unlimited</div>
              <div class="pricing-label">conversations</div>
            </div>
          </div>
          <div class="pricing-item">
            <div class="pricing-icon">📊</div>
            <div class="pricing-content">
              <div class="pricing-value">Full</div>
              <div class="pricing-label">analytics access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAgenticStandaloneStore } from '../stores/agenticStandalone'

const router = useRouter()
const agenticStore = useAgenticStandaloneStore()

const circumference = 2 * Math.PI * 90

const dashOffset = computed(() => {
  const percent = agenticStore.isInTrial ? agenticStore.usagePercentage : 0
  return circumference - (percent / 100) * circumference
})

const usageColor = computed(() => {
  if (agenticStore.isInTrial) {
    if (agenticStore.usagePercentage >= 90) return '#f44336'
    if (agenticStore.usagePercentage >= 80) return '#ffc107'
    return '#667eea'
  }
  return '#4CAF50'
})

const mockUsageHistory = [
  { date: 'Oct 29, 2025', conversations: 127, cost: agenticStore.isPayAsYouGo ? '$63.50' : 'Trial' },
  { date: 'Oct 28, 2025', conversations: 143, cost: agenticStore.isPayAsYouGo ? '$71.50' : 'Trial' },
  { date: 'Oct 27, 2025', conversations: 98, cost: agenticStore.isPayAsYouGo ? '$49.00' : 'Trial' },
  { date: 'Oct 26, 2025', conversations: 156, cost: agenticStore.isPayAsYouGo ? '$78.00' : 'Trial' },
  { date: 'Oct 25, 2025', conversations: 112, cost: agenticStore.isPayAsYouGo ? '$56.00' : 'Trial' }
]

function goToUpgrade() {
  router.push('/upgrade')
}
</script>

<style scoped>
/* Reuse dashboard styles */
.dashboard {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background: #f8f9fa;
}

.sidebar {
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 24px;
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 32px;
  padding: 12px;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f8f9fa;
}

.nav-item.active {
  background: #f0f3ff;
  color: #667eea;
  font-weight: 600;
}

.nav-item .icon {
  font-size: 20px;
}

.main-content {
  padding: 40px;
  max-width: 1200px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.page-header p {
  font-size: 16px;
  color: #666;
}

.usage-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.usage-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.trial {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.paid {
  background: #e8f5e9;
  color: #388e3c;
}

.usage-visual {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 48px;
  align-items: center;
}

.usage-circle {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.usage-circle svg {
  width: 100%;
  height: 100%;
}

.usage-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.usage-number {
  font-size: 48px;
  font-weight: 700;
  color: #1a1a1a;
}

.usage-label {
  font-size: 14px;
  color: #999;
}

.usage-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row.total {
  border-bottom: none;
  padding-top: 20px;
  margin-top: 8px;
  border-top: 2px solid #e0e0e0;
}

.detail-label {
  font-size: 16px;
  color: #666;
}

.detail-value {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
}

.detail-value.highlight {
  color: #667eea;
}

.detail-row.total .detail-value {
  font-size: 24px;
  color: #4CAF50;
}

.upgrade-prompt {
  margin-top: 24px;
  padding: 20px;
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.upgrade-prompt p {
  margin: 0;
  color: #1a1a1a;
  font-size: 14px;
}

.btn-upgrade {
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.btn-upgrade:hover {
  background: #45a049;
}

.usage-history {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.usage-history h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
}

.history-table {
  display: flex;
  flex-direction: column;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  padding: 16px 0;
}

.table-header {
  font-size: 12px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
}

.table-row {
  font-size: 15px;
  color: #1a1a1a;
  border-bottom: 1px solid #f0f0f0;
}

.table-row:last-child {
  border-bottom: none;
}

.pricing-info {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pricing-info h2 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.pricing-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.pricing-icon {
  font-size: 32px;
}

.pricing-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.pricing-label {
  font-size: 14px;
  color: #666;
}

@media (max-width: 1024px) {
  .usage-visual {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .table-header,
  .table-row {
    grid-template-columns: 1.5fr 1fr 1fr;
    font-size: 13px;
  }
}
</style>
