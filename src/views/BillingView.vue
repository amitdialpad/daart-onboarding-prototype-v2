<template>
  <div class="billing-container">
    <!-- Main Navigation -->
    <div class="top-nav">
      <div class="nav-left">
        <div class="app-title">Dialpad Agents</div>
      </div>
      <div class="nav-tabs">
        <button class="nav-tab" @click="goTo('/agents-workspace')">AGENTS</button>
        <button class="nav-tab" @click="goTo('/insights')">ANALYTICS</button>
        <button class="nav-tab active">BILLING</button>
      </div>
      <div class="nav-right">
        <div class="profile-dropdown" @click="toggleProfileMenu">
          <span class="profile-email">admin@company.com</span>
          <span class="dropdown-arrow">{{ showProfileMenu ? '▲' : '▼' }}</span>
          <div v-if="showProfileMenu" class="dropdown-menu" @click.stop>
            <button class="dropdown-item" @click="goTo('/settings')">Settings</button>
            <button class="dropdown-item" @click="signOut">Sign Out</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area with Sidebar -->
    <div class="billing-main">
      <!-- Side Navigation -->
      <div class="side-nav">
        <div class="side-nav-section">
          <button
            class="side-nav-item"
            :class="{ active: activeSection === 'overview' }"
            @click="scrollToSection('overview')">
            Overview
          </button>
          <button
            class="side-nav-item"
            :class="{ active: activeSection === 'usage' }"
            @click="scrollToSection('usage')">
            Usage & Reports
          </button>
          <button
            class="side-nav-item"
            :class="{ active: activeSection === 'payment' }"
            @click="scrollToSection('payment')">
            Payment Methods
          </button>
          <button
            class="side-nav-item"
            :class="{ active: activeSection === 'alerts' }"
            @click="scrollToSection('alerts')">
            Alerts & Notifications
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="billing-content" ref="contentArea">
        <!-- Overview Section -->
        <div id="overview" class="section-anchor">
          <!-- Trial Status Banner -->
      <div v-if="isInTrial" class="trial-banner">
        <div class="banner-left">
          <div class="banner-title">Free Trial Active</div>
          <div class="banner-text">
            {{ trialConversationsRemaining.toLocaleString() }} conversations remaining OR {{ trialDaysRemaining }} days left (whichever comes first)
          </div>
        </div>
        <div class="banner-right">
          <button class="btn-primary" @click="showAddCredits = true">Add Credits Now</button>
        </div>
      </div>

      <!-- Low Balance Alert -->
      <div v-if="showLowBalanceAlert" class="alert-banner" :class="alertSeverity">
        <div class="alert-content">
          <div class="alert-title">{{ alertTitle }}</div>
          <div class="alert-text">{{ alertMessage }}</div>
        </div>
        <button class="btn-secondary-small" @click="showAddCredits = true">Add Credits</button>
      </div>

      <!-- Credit Balance Section -->
      <div class="billing-section">
        <div class="section-header-row">
          <div>
            <h2>Credit Balance</h2>
            <p class="section-desc">Prepaid conversation credits at $0.50 per conversation</p>
          </div>
          <button class="btn-primary" @click="showAddCredits = true">Add Credits</button>
        </div>

        <div class="balance-grid">
          <div class="balance-card">
            <div class="balance-label">Current Balance</div>
            <div class="balance-value">${{ currentBalance.toFixed(2) }}</div>
            <div class="balance-sublabel">≈ {{ Math.floor(currentBalance / 0.50).toLocaleString() }} conversations</div>
          </div>
          <div class="balance-card">
            <div class="balance-label">Auto-Recharge</div>
            <div class="balance-value">{{ autoRechargeEnabled ? 'On' : 'Off' }}</div>
            <div class="balance-sublabel">
              <span v-if="autoRechargeEnabled">+${{ autoRechargeAmount }} at ${{ autoRechargeThreshold }}</span>
              <button class="btn-link-small" @click="showAutoRecharge = !showAutoRecharge">Configure</button>
            </div>
          </div>
          <div class="balance-card">
            <div class="balance-label">This Month</div>
            <div class="balance-value">{{ currentMonthConversations.toLocaleString() }}</div>
            <div class="balance-sublabel">${{ (currentMonthConversations * 0.50).toFixed(2) }} spent</div>
          </div>
        </div>

        <!-- What Happens When Credits Run Out -->
        <div class="info-panel">
          <h3>What happens when my credits run out?</h3>
          <ul class="info-list">
            <li><strong>Your agents will pause</strong> - they won't be deleted, just temporarily stopped</li>
            <li><strong>No automatic charges</strong> - we never charge your card without your permission</li>
            <li><strong>You control when to add credits</strong> - add credits anytime to resume your agents</li>
            <li><strong>Payment method required only when buying credits</strong> - not required to start your free trial</li>
            <li><strong>Optional auto-recharge</strong> - set it up below to automatically add credits when balance gets low</li>
          </ul>
        </div>

        <!-- Auto-Recharge Configuration -->
        <div v-if="showAutoRecharge" class="config-panel">
          <h3>Auto-Recharge Settings</h3>
          <p class="config-desc">Automatically add credits when your balance gets low</p>

          <div class="form-row">
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="autoRechargeEnabled">
                Enable Auto-Recharge
              </label>
            </div>
          </div>

          <div v-if="autoRechargeEnabled" class="form-row">
            <div class="form-group">
              <label>Recharge Amount</label>
              <select v-model="autoRechargeAmount" class="input-field">
                <option :value="100">$100 (≈ 112 conversations)</option>
                <option :value="250">$250 (≈ 280 conversations)</option>
                <option :value="500">$500 (≈ 561 conversations)</option>
                <option :value="1000">$1,000 (≈ 1,123 conversations)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Trigger When Balance Falls Below</label>
              <select v-model="autoRechargeThreshold" class="input-field">
                <option :value="25">$25</option>
                <option :value="50">$50</option>
                <option :value="100">$100</option>
                <option :value="200">$200</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn-secondary" @click="showAutoRecharge = false">Cancel</button>
            <button class="btn-primary" @click="saveAutoRecharge">Save Settings</button>
          </div>
        </div>
      </div>

        </div>

        <!-- Usage & Reports Section -->
        <div id="usage" class="section-anchor">
      <!-- Usage Overview -->
      <div class="billing-section">
        <h2>Usage Overview</h2>
        <p class="section-desc">Conversation usage across all agents and channels</p>

        <div class="usage-tabs">
          <button
            class="usage-tab"
            :class="{ active: usageView === 'agents' }"
            @click="usageView = 'agents'">
            By Agent
          </button>
          <button
            class="usage-tab"
            :class="{ active: usageView === 'channels' }"
            @click="usageView = 'channels'">
            By Channel
          </button>
          <button
            class="usage-tab"
            :class="{ active: usageView === 'history' }"
            @click="usageView = 'history'">
            Transaction History
          </button>
        </div>

        <!-- By Agent View -->
        <div v-if="usageView === 'agents'" class="usage-content">
          <div class="usage-table">
            <div class="table-header">
              <div>Agent Name</div>
              <div>Conversations</div>
              <div>Cost</div>
              <div>Channels</div>
            </div>
            <div v-for="agent in agentUsage" :key="agent.id" class="table-row">
              <div class="agent-name">{{ agent.name }}</div>
              <div>{{ agent.conversations.toLocaleString() }}</div>
              <div>${{ (agent.conversations * 0.50).toFixed(2) }}</div>
              <div class="channels-list">
                <span v-for="channel in agent.activeChannels" :key="channel" class="channel-tag">
                  {{ channel }}
                </span>
              </div>
            </div>
            <div class="table-row total-row">
              <div><strong>Total</strong></div>
              <div><strong>{{ totalConversations.toLocaleString() }}</strong></div>
              <div><strong>${{ (totalConversations * 0.50).toFixed(2) }}</strong></div>
              <div></div>
            </div>
          </div>
        </div>

        <!-- By Channel View -->
        <div v-if="usageView === 'channels'" class="usage-content">
          <div class="usage-table">
            <div class="table-header">
              <div>Channel</div>
              <div>Conversations</div>
              <div>Cost</div>
              <div>Percentage</div>
            </div>
            <div v-for="channel in channelUsage" :key="channel.name" class="table-row">
              <div>{{ channel.name }}</div>
              <div>{{ channel.conversations.toLocaleString() }}</div>
              <div>${{ (channel.conversations * 0.50).toFixed(2) }}</div>
              <div>
                <div class="percentage-bar-container">
                  <div class="percentage-bar" :style="{ width: channel.percentage + '%' }"></div>
                  <span class="percentage-text">{{ channel.percentage }}%</span>
                </div>
              </div>
            </div>
            <div class="table-row total-row">
              <div><strong>Total</strong></div>
              <div><strong>{{ totalConversations.toLocaleString() }}</strong></div>
              <div><strong>${{ (totalConversations * 0.50).toFixed(2) }}</strong></div>
              <div><strong>100%</strong></div>
            </div>
          </div>
        </div>

        <!-- Transaction History -->
        <div v-if="usageView === 'history'" class="usage-content">
          <div class="usage-table">
            <div class="table-header">
              <div>Date</div>
              <div>Type</div>
              <div>Amount</div>
              <div>Balance After</div>
              <div>Status</div>
            </div>
            <div v-for="transaction in transactionHistory" :key="transaction.id" class="table-row">
              <div>{{ transaction.date }}</div>
              <div>{{ transaction.type }}</div>
              <div :class="transaction.amount > 0 ? 'amount-positive' : 'amount-negative'">
                {{ transaction.amount > 0 ? '+' : '' }}${{ Math.abs(transaction.amount).toFixed(2) }}
              </div>
              <div>${{ transaction.balanceAfter.toFixed(2) }}</div>
              <div>
                <span class="status-badge" :class="transaction.status">{{ transaction.status }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>

        <!-- Payment Methods Section -->
        <div id="payment" class="section-anchor">
      <!-- Payment Information -->
      <div class="billing-section">
        <h2>Payment Method</h2>
        <p class="section-desc">Manage your payment methods for credit purchases</p>

        <div v-if="hasPaymentMethod" class="payment-method-card">
          <div class="payment-left">
            <div class="payment-type">Visa ending in 4242</div>
            <div class="payment-expires">Expires 12/2027</div>
          </div>
          <div class="payment-right">
            <button class="btn-link">Update</button>
            <button class="btn-link">Remove</button>
          </div>
        </div>

        <div v-else class="empty-payment">
          <p>No payment method on file</p>
          <button class="btn-secondary" @click="addPaymentMethod">Add Payment Method</button>
        </div>
      </div>
        </div>

        <!-- Alerts & Notifications Section -->
        <div id="alerts" class="section-anchor">
      <!-- Alert Configuration -->
      <div class="billing-section">
        <h2>Usage Alerts</h2>
        <p class="section-desc">Get notified when you reach spending thresholds</p>

        <div class="alerts-list">
          <div v-for="alert in alertThresholds" :key="alert.threshold" class="alert-item">
            <label class="checkbox-label">
              <input type="checkbox" v-model="alert.enabled">
              <div class="alert-item-content">
                <div class="alert-item-title">{{ alert.threshold }}% of initial balance spent</div>
                <div class="alert-item-desc">{{ alert.description }}</div>
              </div>
            </label>
          </div>
        </div>
      </div>
        </div>
      </div>
    </div>

    <!-- Add Credits Modal -->
    <div v-if="showAddCredits" class="modal-overlay" @click="showAddCredits = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Add Credits</h2>
          <button class="modal-close" @click="showAddCredits = false">×</button>
        </div>

        <div class="modal-body">
          <p class="modal-desc">Select an amount to add to your credit balance</p>

          <div class="credit-options">
            <button
              v-for="option in creditOptions"
              :key="option.amount"
              class="credit-option"
              :class="{ selected: selectedCreditAmount === option.amount }"
              @click="selectedCreditAmount = option.amount">
              <div class="credit-amount">${{ option.amount }}</div>
              <div class="credit-conversations">≈ {{ option.conversations }} conversations</div>
              <div v-if="option.popular" class="popular-badge">Popular</div>
            </button>
          </div>

          <div class="custom-amount">
            <label>Custom Amount</label>
            <div class="custom-input-group">
              <span class="input-prefix">$</span>
              <input
                type="number"
                v-model.number="customAmount"
                class="input-field"
                placeholder="Enter amount"
                min="10"
                @input="selectedCreditAmount = null">
            </div>
            <div v-if="customAmount >= 10" class="custom-conversions">
              ≈ {{ Math.floor(customAmount / 0.50).toLocaleString() }} conversations
            </div>
          </div>

          <div class="payment-summary">
            <div class="summary-row">
              <span>Amount</span>
              <span>${{ purchaseAmount.toFixed(2) }}</span>
            </div>
            <div class="summary-row total">
              <span>Total</span>
              <span>${{ purchaseAmount.toFixed(2) }}</span>
            </div>
          </div>

          <div v-if="!hasPaymentMethod" class="payment-notice">
            You'll be prompted to add a payment method to complete this purchase.
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddCredits = false">Cancel</button>
          <button
            class="btn-primary"
            :disabled="purchaseAmount === 0"
            @click="processPurchase">
            {{ hasPaymentMethod ? 'Purchase Credits' : 'Add Payment & Purchase' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Navigation
const showProfileMenu = ref(false)
const activeSection = ref('overview')
const contentArea = ref(null)

function goTo(path) {
  router.push(path)
}

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value
}

function signOut() {
  localStorage.removeItem('daart-agents')
  localStorage.removeItem('daart-conversations')
  localStorage.removeItem('daart-onboarding-complete')
  router.push('/signup')
}

// Scroll to section
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section && contentArea.value) {
    const offsetTop = section.offsetTop - contentArea.value.offsetTop
    contentArea.value.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
    activeSection.value = sectionId
  }
}

// Trial Status
const isInTrial = ref(true)
const trialConversationsRemaining = ref(847)
const trialDaysRemaining = ref(23)

// Credit Balance
const currentBalance = ref(445.00)
const currentMonthConversations = ref(278)
const autoRechargeEnabled = ref(false)
const autoRechargeAmount = ref(250)
const autoRechargeThreshold = ref(50)
const showAutoRecharge = ref(false)

// Alert Configuration
const alertThresholds = ref([
  { threshold: 80, enabled: true, description: 'Warning - consider adding more credits' },
  { threshold: 100, enabled: true, description: 'All trial credits used - using paid credits' },
  { threshold: 120, enabled: true, description: 'Approaching low balance' },
  { threshold: 150, enabled: false, description: 'High usage alert' },
  { threshold: 200, enabled: false, description: 'Very high usage alert' }
])

// Low Balance Alert
const showLowBalanceAlert = computed(() => {
  const conversationsLeft = Math.floor(currentBalance.value / 0.50)
  return conversationsLeft < 100
})

const alertSeverity = computed(() => {
  const conversationsLeft = Math.floor(currentBalance.value / 0.50)
  if (conversationsLeft === 0) return 'critical'
  if (conversationsLeft < 50) return 'warning'
  return 'info'
})

const alertTitle = computed(() => {
  const conversationsLeft = Math.floor(currentBalance.value / 0.50)
  if (conversationsLeft === 0) return 'No Credits Remaining - Agents Paused'
  if (conversationsLeft < 50) return 'Low Credit Balance'
  return 'Credit Balance Getting Low'
})

const alertMessage = computed(() => {
  const conversationsLeft = Math.floor(currentBalance.value / 0.50)
  if (conversationsLeft === 0) return 'Add credits now to resume your agents'
  return `Only ${conversationsLeft} conversations remaining. Add credits to avoid service interruption.`
})

// Usage Views
const usageView = ref('agents')

// Agent Usage Data
const agentUsage = ref([
  { id: 1, name: 'Sales Agent', conversations: 142, activeChannels: ['Web Chat', 'Phone'] },
  { id: 2, name: 'Support Agent', conversations: 89, activeChannels: ['Web Chat', 'SMS'] },
  { id: 3, name: 'Onboarding Agent', conversations: 47, activeChannels: ['Phone'] }
])

const totalConversations = computed(() => {
  return agentUsage.value.reduce((sum, agent) => sum + agent.conversations, 0)
})

// Channel Usage Data
const channelUsage = computed(() => {
  const channels = [
    { name: 'Web Chat', conversations: 156 },
    { name: 'Phone', conversations: 89 },
    { name: 'SMS', conversations: 33 }
  ]

  const total = channels.reduce((sum, ch) => sum + ch.conversations, 0)

  return channels.map(ch => ({
    ...ch,
    percentage: Math.round((ch.conversations / total) * 100)
  }))
})

// Transaction History
const transactionHistory = ref([
  { id: 1, date: 'Nov 1, 2025', type: 'Credit Purchase', amount: 250.00, balanceAfter: 445.00, status: 'completed' },
  { id: 2, date: 'Oct 28, 2025', type: 'Usage', amount: -42.48, balanceAfter: 195.00, status: 'completed' },
  { id: 3, date: 'Oct 15, 2025', type: 'Credit Purchase', amount: 100.00, balanceAfter: 237.48, status: 'completed' },
  { id: 4, date: 'Oct 12, 2025', type: 'Usage', amount: -28.16, balanceAfter: 137.48, status: 'completed' },
  { id: 5, date: 'Oct 1, 2025', type: 'Trial Credits', amount: 890.00, balanceAfter: 165.64, status: 'completed' }
])

// Payment Method
const hasPaymentMethod = ref(true)

function addPaymentMethod() {
  alert('Add payment method flow would open here')
}

// Add Credits Modal
const showAddCredits = ref(false)
const selectedCreditAmount = ref(null)
const customAmount = ref(null)

const creditOptions = ref([
  { amount: 100, conversations: 112, popular: false },
  { amount: 250, conversations: 280, popular: true },
  { amount: 500, conversations: 561, popular: false },
  { amount: 1000, conversations: 1123, popular: false }
])

const purchaseAmount = computed(() => {
  if (customAmount.value && customAmount.value >= 10) {
    return customAmount.value
  }
  return selectedCreditAmount.value || 0
})

function processPurchase() {
  if (purchaseAmount.value === 0) return

  // Simulate purchase
  currentBalance.value += purchaseAmount.value

  // Add to transaction history
  transactionHistory.value.unshift({
    id: transactionHistory.value.length + 1,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    type: 'Credit Purchase',
    amount: purchaseAmount.value,
    balanceAfter: currentBalance.value,
    status: 'completed'
  })

  // Reset and close
  selectedCreditAmount.value = null
  customAmount.value = null
  showAddCredits.value = false

  alert(`Successfully added $${purchaseAmount.value.toFixed(2)} to your account!`)
}

function saveAutoRecharge() {
  showAutoRecharge.value = false
  alert('Auto-recharge settings saved!')
}

// Load billing data
onMounted(() => {
  // In a real app, load from localStorage or API
  const billingData = localStorage.getItem('daart-billing')
  if (billingData) {
    const data = JSON.parse(billingData)
    // Load saved billing data
  }
})
</script>

<style scoped>
.billing-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  font-family: apple-system, BlinkMacSystemFont, "SF Pro", "Segoe UI Adjusted", "Segoe UI", SFMono, "Helvetica Neue", Cantarell, Ubuntu, Roboto, Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

/* Top Navigation */
.top-nav {
  height: 50px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #fafafa;
}

.nav-left {
  flex: 1;
}

.app-title {
  font-weight: 600;
  font-size: 16px;
}

.nav-tabs {
  display: flex;
  gap: 4px;
}

.nav-tab {
  padding: 0 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent;
  height: 50px;
  display: flex;
  align-items: center;
  margin-bottom: -1px;
}

.nav-tab:hover {
  color: #000;
  background: #f0f0f0;
}

.nav-tab.active {
  color: #000;
  border-bottom-color: #000;
  font-weight: 600;
}

.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

/* Profile Dropdown */
.profile-dropdown {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}

.profile-dropdown:hover {
  background: #f5f5f5;
}

.profile-email {
  font-size: 12px;
  color: #666;
}

.dropdown-arrow {
  font-size: 10px;
  color: #999;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 180px;
  z-index: 1000;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: background 0.2s;
}

.dropdown-item:first-child {
  border-radius: 4px 4px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 4px 4px;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

/* Main Layout with Sidebar */
.billing-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Side Navigation */
.side-nav {
  width: 220px;
  background: #fafafa;
  border-right: 1px solid #ddd;
  overflow-y: auto;
  padding: 24px 0;
}

.side-nav-section {
  display: flex;
  flex-direction: column;
}

.side-nav-item {
  padding: 10px 24px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  transition: all 0.15s;
  position: relative;
}

.side-nav-item:hover {
  background: #f0f0f0;
  color: #000;
}

.side-nav-item.active {
  color: #000;
  background: #e8e8e8;
  font-weight: 600;
}

.side-nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #000;
}

/* Content */
.billing-content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  scroll-behavior: smooth;
}

/* Section Anchors */
.section-anchor {
  scroll-margin-top: 20px;
}

/* Trial Banner */
.trial-banner {
  background: #fff9e6;
  border: 1px solid #ffe066;
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.banner-left {
  flex: 1;
}

.banner-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.banner-text {
  font-size: 14px;
  color: #666;
}

.banner-right {
  margin-left: 20px;
}

/* Alert Banner */
.alert-banner {
  border-radius: 8px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.alert-banner.info {
  background: #e3f2fd;
  border: 1px solid #90caf9;
}

.alert-banner.warning {
  background: #fff3e0;
  border: 1px solid #ffb74d;
}

.alert-banner.critical {
  background: #ffebee;
  border: 1px solid #e57373;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.alert-text {
  font-size: 14px;
  color: #666;
}

/* Billing Sections */
.billing-section {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.billing-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.section-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

/* Balance Grid */
.balance-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.balance-card {
  padding: 20px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.balance-label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.balance-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 4px;
}

.balance-sublabel {
  font-size: 13px;
  color: #666;
}

/* Info Panel */
.info-panel {
  background: #f0f7ff;
  border: 1px solid #d0e7ff;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.info-panel h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #000;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-list li {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  padding-left: 20px;
  position: relative;
}

.info-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #000;
  font-weight: bold;
}

.info-list li strong {
  color: #000;
}

/* Config Panel */
.config-panel {
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
  margin-top: 20px;
}

.config-panel h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.config-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 16px;
}

.form-row:has(.checkbox-label) {
  grid-template-columns: 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.input-field {
  padding: 10px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.input-field:focus {
  outline: none;
  border-color: #000;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Alerts List */
.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  padding: 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.alert-item .checkbox-label {
  align-items: flex-start;
}

.alert-item-content {
  flex: 1;
}

.alert-item-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
}

.alert-item-desc {
  font-size: 13px;
  color: #666;
}

/* Usage Tabs */
.usage-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.usage-tab {
  padding: 10px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.usage-tab:hover {
  color: #000;
}

.usage-tab.active {
  color: #000;
  border-bottom-color: #000;
  font-weight: 600;
}

/* Usage Table */
.usage-content {
  margin-top: 20px;
}

.usage-table {
  display: flex;
  flex-direction: column;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr;
  gap: 16px;
  padding: 12px 16px;
  align-items: center;
}

.table-header {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e0e0e0;
}

.table-row {
  font-size: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row.total-row {
  background: #fafafa;
  font-weight: 600;
  border-top: 2px solid #e0e0e0;
}

.agent-name {
  font-weight: 500;
}

.channels-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.channel-tag {
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.percentage-bar-container {
  position: relative;
  height: 24px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.percentage-bar {
  height: 100%;
  background: #000;
  transition: width 0.3s;
}

.percentage-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: 600;
  color: #000;
  z-index: 1;
}

.amount-positive {
  color: #4caf50;
  font-weight: 600;
}

.amount-negative {
  color: #666;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-badge.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.pending {
  background: #fff3e0;
  color: #f57c00;
}

/* Payment Method */
.payment-method-card {
  padding: 20px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.payment-left {
  flex: 1;
}

.payment-type {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.payment-expires {
  font-size: 13px;
  color: #666;
}

.payment-right {
  display: flex;
  gap: 16px;
}

.empty-payment {
  text-align: center;
  padding: 40px;
}

.empty-payment p {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

/* Buttons */
.btn-primary {
  padding: 10px 20px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #333;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 20px;
  background: #fff;
  color: #000;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #000;
}

.btn-secondary-small {
  padding: 8px 16px;
  background: #fff;
  color: #000;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary-small:hover {
  border-color: #000;
}

.btn-link {
  padding: 0;
  background: none;
  color: #000;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

.btn-link:hover {
  color: #333;
}

.btn-link-small {
  padding: 0;
  background: none;
  color: #000;
  border: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 8px;
}

.btn-link-small:hover {
  color: #333;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f0f0f0;
  border-radius: 50%;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: #e0e0e0;
}

.modal-body {
  padding: 24px;
}

.modal-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

.credit-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.credit-option {
  position: relative;
  padding: 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.credit-option:hover {
  border-color: #000;
}

.credit-option.selected {
  border-color: #000;
  background: #fafafa;
}

.credit-amount {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.credit-conversations {
  font-size: 13px;
  color: #666;
}

.popular-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: #000;
  color: #fff;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.custom-amount {
  margin-bottom: 24px;
}

.custom-amount label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
}

.custom-input-group {
  position: relative;
}

.input-prefix {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.custom-input-group .input-field {
  padding-left: 28px;
}

.custom-conversions {
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}

.payment-summary {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.summary-row.total {
  font-size: 18px;
  font-weight: 600;
  border-top: 1px solid #e0e0e0;
  margin-top: 8px;
  padding-top: 16px;
}

.payment-notice {
  padding: 12px;
  background: #f0f7ff;
  border: 1px solid #d0e7ff;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
}

.modal-footer {
  padding: 0 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
