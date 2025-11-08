<template>
  <div class="trial-banner">
    <div class="trial-info">
      <span class="trial-text">
        Trial expires in <strong>{{ daysRemaining }} days</strong> •
        <strong>{{ conversationsUsed }}/{{ conversationsLimit }}</strong> conversations used
      </span>
    </div>
    <div class="trial-actions">
      <button class="btn-secondary" @click="viewUsage">View Usage</button>
      <button class="btn-primary" @click="upgrade">Upgrade</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const daysRemaining = ref(12)
const conversationsUsed = ref(847)
const conversationsLimit = ref(1000)

onMounted(() => {
  loadTrialData()
})

function loadTrialData() {
  const trialData = JSON.parse(localStorage.getItem('daart-trial') || '{}')

  if (trialData.startDate) {
    const start = new Date(trialData.startDate)
    const now = new Date()
    const elapsed = Math.floor((now - start) / (1000 * 60 * 60 * 24))
    daysRemaining.value = Math.max(0, 14 - elapsed)
  }

  if (trialData.conversationsUsed !== undefined) {
    conversationsUsed.value = trialData.conversationsUsed
  }

  if (trialData.conversationsLimit !== undefined) {
    conversationsLimit.value = trialData.conversationsLimit
  }
}

function viewUsage() {
  router.push('/billing-v2')
}

function upgrade() {
  router.push('/billing-v2')
}
</script>

<style scoped>
.trial-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 32px;
}

.trial-info {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
}

.trial-text strong {
  font-weight: 600;
}

.trial-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  padding: 8px 16px;
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  border-color: #999;
  background: #fafafa;
}

.btn-primary {
  padding: 8px 16px;
  background: #000;
  color: #fff;
  border: 1px solid #000;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #333;
}

/* Responsive */
@media (max-width: 768px) {
  .trial-banner {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .trial-info {
    justify-content: center;
  }

  .trial-actions {
    width: 100%;
  }

  .trial-actions button {
    flex: 1;
  }
}
</style>
