<template>
  <div class="upgrade-container">
    <div class="upgrade-content">
      <header class="upgrade-header">
        <button @click="goBack" class="btn-back">← Back to Dashboard</button>
        <h1>Upgrade to Pay-as-you-Go</h1>
        <p>Continue using Dialpad Agentic AI without limits</p>
      </header>

      <div class="upgrade-grid">
        <!-- Left: Pricing & Benefits -->
        <div class="pricing-section">
          <div class="pricing-card">
            <div class="pricing-header">
              <h2>Pay-as-you-Go</h2>
              <div class="price">
                <span class="price-amount">${{ agenticStore.pricePerConversation.toFixed(2) }}</span>
                <span class="price-unit">per conversation</span>
              </div>
            </div>

            <div class="pricing-features">
              <div class="feature">
                <span class="feature-icon">✓</span>
                <span>Unlimited conversations</span>
              </div>
              <div class="feature">
                <span class="feature-icon">✓</span>
                <span>Full analytics access</span>
              </div>
              <div class="feature">
                <span class="feature-icon">✓</span>
                <span>Unlimited skills & workflows</span>
              </div>
              <div class="feature">
                <span class="feature-icon">✓</span>
                <span>Priority support</span>
              </div>
              <div class="feature">
                <span class="feature-icon">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>

            <div class="pricing-example">
              <h3>Cost Estimate</h3>
              <div class="estimate-row">
                <span>Your current usage ({{ agenticStore.conversationsUsed }} conversations)</span>
                <span class="estimate-value">${{ estimatedMonthlyCost }}</span>
              </div>
              <p class="estimate-note">Based on your trial usage, your estimated monthly cost would be around ${{ estimatedMonthlyCost }}.</p>
            </div>
          </div>

          <div class="trust-signals">
            <div class="trust-item">
              <span class="trust-icon">🔒</span>
              <span>Secure payment processing</span>
            </div>
            <div class="trust-item">
              <span class="trust-icon">💳</span>
              <span>No long-term contracts</span>
            </div>
            <div class="trust-item">
              <span class="trust-icon">📊</span>
              <span>Transparent pricing</span>
            </div>
          </div>
        </div>

        <!-- Right: Payment Form -->
        <div class="payment-section">
          <div class="payment-card">
            <h2>Add Payment Method</h2>
            <p class="payment-subtitle">Enter your payment details to upgrade</p>

            <form @submit.prevent="handleUpgrade" class="payment-form">
              <div class="form-group">
                <label>Card Number</label>
                <input
                  v-model="paymentForm.cardNumber"
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  maxlength="19"
                  @input="formatCardNumber"
                  required
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Expiry Date</label>
                  <input
                    v-model="paymentForm.expiry"
                    type="text"
                    placeholder="MM/YY"
                    maxlength="5"
                    @input="formatExpiry"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>CVC</label>
                  <input
                    v-model="paymentForm.cvc"
                    type="text"
                    placeholder="123"
                    maxlength="3"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Cardholder Name</label>
                <input
                  v-model="paymentForm.name"
                  type="text"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div class="form-group">
                <label>Billing Email</label>
                <input
                  v-model="paymentForm.email"
                  type="email"
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div class="form-group">
                <label>
                  <input type="checkbox" v-model="agreedToTerms" required />
                  I agree to the Terms of Service and understand I'll be charged ${{ agenticStore.pricePerConversation.toFixed(2) }} per conversation
                </label>
              </div>

              <button type="submit" class="btn-upgrade" :disabled="isProcessing || !agreedToTerms">
                {{ isProcessing ? 'Processing...' : 'Upgrade to Pay-as-you-Go' }}
              </button>

              <p class="payment-note">
                You won't be charged until your trial ends or you exceed your trial limit.
                You can cancel anytime.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay" @click="closeSuccessModal">
      <div class="modal-content" @click.stop>
        <div class="success-icon-large">🎉</div>
        <h2>Welcome to Pay-as-you-Go!</h2>
        <p>Your payment method has been added successfully. You can now use Dialpad Agentic AI without limits.</p>
        <div class="success-details">
          <div class="success-detail">
            <span class="detail-label">Plan</span>
            <span class="detail-value">Pay-as-you-Go</span>
          </div>
          <div class="success-detail">
            <span class="detail-label">Rate</span>
            <span class="detail-value">${{ agenticStore.pricePerConversation.toFixed(2) }} per conversation</span>
          </div>
        </div>
        <button @click="closeSuccessModal" class="btn-primary btn-large">Go to Dashboard</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAgenticStandaloneStore } from '../stores/agenticStandalone'

const router = useRouter()
const agenticStore = useAgenticStandaloneStore()

const paymentForm = ref({
  cardNumber: '',
  expiry: '',
  cvc: '',
  name: '',
  email: ''
})

const agreedToTerms = ref(false)
const isProcessing = ref(false)
const showSuccessModal = ref(false)

const estimatedMonthlyCost = computed(() => {
  // Extrapolate from trial usage to full month
  const daysUsed = 14 - agenticStore.trialDaysRemaining
  if (daysUsed === 0) return '0.00'

  const dailyAverage = agenticStore.conversationsUsed / daysUsed
  const monthlyEstimate = dailyAverage * 30 * agenticStore.pricePerConversation
  return monthlyEstimate.toFixed(2)
})

function formatCardNumber(event) {
  let value = event.target.value.replace(/\s/g, '')
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value
  paymentForm.value.cardNumber = formattedValue
}

function formatExpiry(event) {
  let value = event.target.value.replace(/\//g, '')
  if (value.length >= 2) {
    paymentForm.value.expiry = value.slice(0, 2) + '/' + value.slice(2, 4)
  } else {
    paymentForm.value.expiry = value
  }
}

async function handleUpgrade() {
  if (!agreedToTerms.value) return

  isProcessing.value = true

  // Simulate API call
  const result = await agenticStore.upgradeToPaid(paymentForm.value)

  isProcessing.value = false

  if (result.success) {
    showSuccessModal.value = true
  } else {
    alert('Payment failed: ' + result.error)
  }
}

function closeSuccessModal() {
  showSuccessModal.value = false
  router.push('/dashboard')
}

function goBack() {
  router.push('/dashboard')
}
</script>

<style scoped>
.upgrade-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 40px 20px;
}

.upgrade-content {
  max-width: 1200px;
  margin: 0 auto;
}

.upgrade-header {
  text-align: center;
  margin-bottom: 48px;
}

.btn-back {
  padding: 8px 16px;
  background: white;
  color: #667eea;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 24px;
}

.btn-back:hover {
  border-color: #667eea;
  background: #f0f3ff;
}

.upgrade-header h1 {
  font-size: 40px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.upgrade-header p {
  font-size: 18px;
  color: #666;
}

.upgrade-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.pricing-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.pricing-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
}

.pricing-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.price {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-amount {
  font-size: 48px;
  font-weight: 700;
  color: #667eea;
}

.price-unit {
  font-size: 16px;
  color: #666;
}

.pricing-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: #333;
}

.feature-icon {
  color: #4CAF50;
  font-weight: bold;
  font-size: 20px;
}

.pricing-example {
  padding: 20px;
  background: #f8f9ff;
  border-radius: 8px;
}

.pricing-example h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.estimate-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 15px;
}

.estimate-value {
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
}

.estimate-note {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.trust-signals {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.trust-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.trust-icon {
  font-size: 24px;
}

.payment-card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 40px;
}

.payment-card h2 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.payment-subtitle {
  font-size: 15px;
  color: #666;
  margin-bottom: 24px;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="email"] {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}

.form-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.form-group label:has(input[type="checkbox"]) {
  flex-direction: row;
  align-items: center;
  font-weight: normal;
  font-size: 13px;
  color: #666;
}

.btn-upgrade {
  padding: 16px 24px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.btn-upgrade:hover:not(:disabled) {
  background: #45a049;
}

.btn-upgrade:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.payment-note {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin: 0;
}

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
  background: white;
  border-radius: 16px;
  padding: 48px;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.success-icon-large {
  font-size: 80px;
  margin-bottom: 24px;
}

.modal-content h2 {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.modal-content p {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 32px;
}

.success-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 32px;
}

.success-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 14px;
  color: #666;
}

.detail-value {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.btn-primary {
  padding: 14px 32px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:hover {
  background: #5568d3;
}

.btn-large {
  width: 100%;
}

@media (max-width: 1024px) {
  .upgrade-grid {
    grid-template-columns: 1fr;
  }

  .payment-card {
    position: static;
  }
}
</style>
