<template>
  <div class="channel-selection-container">
    <div class="progress-bar">
      <div class="progress-fill" style="width: 25%"></div>
    </div>

    <div class="channel-content">
      <h1>Choose Your Channel</h1>
      <p class="step-description">
        Select how your customers will interact with your AI agent. You can add more channels later.
      </p>

      <div class="channels-grid">
        <div class="channel-card recommended" @click="selectChannel('chat')">
          <div class="card-header">
            <div class="channel-icon">💬</div>
            <span class="badge-recommended">Recommended</span>
          </div>
          <h2>Web Chatbot</h2>
          <p class="channel-description">
            Add an AI chat widget to your website. Perfect for customer support, lead capture, and FAQs.
          </p>
          <ul class="channel-features">
            <li>✓ 2-minute setup</li>
            <li>✓ Works on any website</li>
            <li>✓ Mobile-friendly</li>
            <li>✓ Test instantly</li>
          </ul>
          <button class="btn-select">Select Web Chat</button>
        </div>

        <div class="channel-card disabled">
          <div class="card-header">
            <div class="channel-icon">📞</div>
            <span class="badge-coming-soon">Coming Soon</span>
          </div>
          <h2>Phone Agent</h2>
          <p class="channel-description">
            Handle phone calls with an AI voice agent. Route calls, collect information, and transfer to humans.
          </p>
          <ul class="channel-features">
            <li>✓ Natural conversation</li>
            <li>✓ Call routing</li>
            <li>✓ Custom workflows</li>
            <li>✓ Enterprise feature</li>
          </ul>
          <button class="btn-select" disabled>Not Available in Trial</button>
        </div>
      </div>

      <div class="info-banner">
        <span class="info-icon">💡</span>
        <p>Start with web chat to test quickly. You can unlock phone agents after upgrading to a paid plan.</p>
      </div>

      <div class="button-group">
        <button @click="goBack" class="btn-secondary">Back</button>
      </div>
    </div>

    <div class="step-indicator">
      <div class="step-dot completed"></div>
      <div class="step-dot active"></div>
      <div class="step-dot"></div>
      <div class="step-dot"></div>
      <div class="step-dot"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAgenticStandaloneStore } from '../stores/agenticStandalone'

const router = useRouter()
const agenticStore = useAgenticStandaloneStore()

function selectChannel(channel) {
  // Save selected channel to store
  agenticStore.selectedChannel = channel

  // Navigate to next onboarding step (name your agent)
  router.push('/onboarding?step=3')
}

function goBack() {
  router.push('/onboarding?step=1')
}
</script>

<style scoped>
.channel-selection-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
}

.progress-bar {
  height: 4px;
  background: #e0e0e0;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.channel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  text-align: center;
}

.step-description {
  font-size: 18px;
  color: #666;
  margin-bottom: 48px;
  line-height: 1.6;
  text-align: center;
  max-width: 600px;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  width: 100%;
  margin-bottom: 32px;
}

.channel-card {
  background: white;
  border: 3px solid #e0e0e0;
  border-radius: 16px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.channel-card.recommended:hover {
  border-color: #667eea;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.channel-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f8f9fa;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.channel-icon {
  font-size: 56px;
}

.badge-recommended {
  padding: 6px 12px;
  background: #4CAF50;
  color: white;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-coming-soon {
  padding: 6px 12px;
  background: #ffc107;
  color: #1a1a1a;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.channel-card h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.channel-description {
  font-size: 15px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

.channel-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  flex: 1;
}

.channel-features li {
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.btn-select {
  width: 100%;
  padding: 14px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-select:hover:not(:disabled) {
  background: #5568d3;
}

.btn-select:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.channel-card.disabled .btn-select {
  background: #999;
}

.info-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #f0f7ff;
  border: 2px solid #d0e7ff;
  border-radius: 10px;
  margin-bottom: 32px;
  width: 100%;
}

.info-icon {
  font-size: 24px;
}

.info-banner p {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.button-group {
  display: flex;
  gap: 12px;
  width: 100%;
}

.btn-secondary {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8f9ff;
}

.step-indicator {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 24px;
}

.step-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #e0e0e0;
  transition: all 0.3s;
}

.step-dot.active {
  background: #667eea;
  transform: scale(1.2);
}

.step-dot.completed {
  background: #4CAF50;
}

@media (max-width: 768px) {
  .channels-grid {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 28px;
  }

  .step-description {
    font-size: 16px;
  }
}
</style>
