<template>
  <div class="proving-ground-panel">
    <!-- Header -->
    <div class="pg-header">
      <div>
        <h2>Proving Ground</h2>
        <p class="pg-subtitle">Run comprehensive performance tests to validate your agent before deployment</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="!hasRuns" class="pg-empty-state">
      <div class="empty-icon">🎯</div>
      <h3>Ready to test your agent's performance?</h3>
      <p>Proving Ground will automatically generate realistic scenarios based on your agent's configuration and measure key performance metrics.</p>

      <div class="metrics-preview">
        <div class="metric-badge">✓ Task Completion Rate</div>
        <div class="metric-badge">😊 AI CSAT Score</div>
        <div class="metric-badge">📊 Channel Performance</div>
        <div class="metric-badge">🔍 Failure Analysis</div>
      </div>

      <button class="btn-primary btn-large" @click="showSetupModal = true">
        Run Your First Evaluation
      </button>
    </div>

    <!-- Test Runs History -->
    <div v-else class="pg-content">
      <div class="content-header">
        <h3>Test Runs</h3>
        <button class="btn-primary" @click="showSetupModal = true">+ New Evaluation</button>
      </div>

      <div class="runs-list">
        <div v-for="run in testRuns" :key="run.id" class="run-card" @click="selectedRun = run">
          <div class="run-header">
            <div>
              <div class="run-title">Run #{{ run.number }}</div>
              <div class="run-meta">{{ run.date }} • {{ run.scenarioCount }} scenarios • {{ run.channel }}</div>
            </div>
            <div class="run-status" :class="run.status">{{ run.statusLabel }}</div>
          </div>
          <div class="run-metrics">
            <div class="metric">
              <span class="metric-label">Task Completion</span>
              <span class="metric-value">{{ run.metrics.taskCompletion }}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">AI CSAT</span>
              <span class="metric-value">{{ run.metrics.aiCsat }}/5</span>
            </div>
            <div class="metric">
              <span class="metric-label">Avg Response Time</span>
              <span class="metric-value">{{ run.metrics.responseTime }}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Setup Modal -->
    <div v-if="showSetupModal" class="modal-overlay" @click.self="showSetupModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Configure Evaluation</h3>
          <button class="modal-close" @click="showSetupModal = false">×</button>
        </div>

        <div class="modal-body">
          <div class="form-section">
            <label>Test Channels</label>
            <div class="channel-selector">
              <label class="checkbox-label">
                <input type="checkbox" v-model="setupConfig.channels.chat" />
                <span>Chat</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="setupConfig.channels.voice" />
                <span>Voice</span>
              </label>
            </div>
          </div>

          <div class="form-section">
            <label>Number of Scenarios</label>
            <select v-model="setupConfig.scenarioCount" class="select-field">
              <option value="10">10 scenarios (Quick test - 5 min)</option>
              <option value="25">25 scenarios (Standard - 15 min)</option>
              <option value="50">50 scenarios (Comprehensive - 30 min)</option>
            </select>
            <p class="hint">Scenarios will be auto-generated based on your agent's skills and configuration</p>
          </div>

          <div class="form-section">
            <label>Customer Personas (Optional)</label>
            <div class="persona-tags">
              <label v-for="persona in availablePersonas" :key="persona" class="tag-checkbox">
                <input type="checkbox" v-model="setupConfig.personas" :value="persona" />
                <span>{{ persona }}</span>
              </label>
            </div>
            <p class="hint">Select persona types to stress-test different customer behaviors</p>
          </div>

          <div class="info-box">
            <div class="info-icon">ℹ️</div>
            <div>
              <strong>What happens next?</strong>
              <p>Your evaluation will run in the background. You'll receive a notification when the results are ready (typically 5-30 minutes depending on scenario count).</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="showSetupModal = false">Cancel</button>
          <button class="btn-primary" @click="startEvaluation">Start Evaluation</button>
        </div>
      </div>
    </div>

    <!-- Run Details Modal -->
    <div v-if="selectedRun" class="modal-overlay" @click.self="selectedRun = null">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <div>
            <h3>Run #{{ selectedRun.number }} Results</h3>
            <p class="modal-subtitle">{{ selectedRun.date }} • {{ selectedRun.scenarioCount }} scenarios</p>
          </div>
          <button class="modal-close" @click="selectedRun = null">×</button>
        </div>

        <div class="modal-body">
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-card-value">{{ selectedRun.metrics.taskCompletion }}%</div>
              <div class="metric-card-label">Task Completion Rate</div>
            </div>
            <div class="metric-card">
              <div class="metric-card-value">{{ selectedRun.metrics.aiCsat }}/5</div>
              <div class="metric-card-label">AI CSAT Score</div>
            </div>
            <div class="metric-card">
              <div class="metric-card-value">{{ selectedRun.metrics.responseTime }}s</div>
              <div class="metric-card-label">Avg Response Time</div>
            </div>
          </div>

          <div class="failure-analysis">
            <h4>Failure Analysis</h4>
            <div class="failure-list">
              <div v-for="(failure, index) in selectedRun.failures" :key="index" class="failure-item">
                <div class="failure-header">
                  <span class="failure-category">{{ failure.category }}</span>
                  <span class="failure-count">{{ failure.count }} occurrences</span>
                </div>
                <p class="failure-description">{{ failure.description }}</p>
              </div>
            </div>
          </div>

          <p class="coming-soon">📊 Detailed trace analysis and conversation playback coming soon</p>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="selectedRun = null">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const showSetupModal = ref(false)
const selectedRun = ref(null)

const setupConfig = ref({
  channels: {
    chat: true,
    voice: false
  },
  scenarioCount: '25',
  personas: []
})

const availablePersonas = [
  'Frustrated',
  'Impatient',
  'Confused',
  'Detail-oriented',
  'Casual'
]

// Mock test runs data
const testRuns = ref([
  {
    id: '1',
    number: 1,
    date: 'Jan 10, 2025 2:30 PM',
    scenarioCount: 25,
    channel: 'Chat',
    status: 'completed',
    statusLabel: 'Completed',
    metrics: {
      taskCompletion: 87,
      aiCsat: 4.2,
      responseTime: 1.8
    },
    failures: [
      {
        category: 'Intent Mismatch',
        count: 3,
        description: 'Agent misunderstood user intent in complex multi-step requests'
      },
      {
        category: 'Escalation',
        count: 2,
        description: 'Premature escalation to human agent'
      }
    ]
  }
])

const hasRuns = computed(() => testRuns.value.length > 0)

function startEvaluation() {
  // Mock creating a new run
  const newRun = {
    id: Date.now().toString(),
    number: testRuns.value.length + 1,
    date: new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }),
    scenarioCount: parseInt(setupConfig.value.scenarioCount),
    channel: setupConfig.value.channels.chat && setupConfig.value.channels.voice ? 'Chat & Voice' :
             setupConfig.value.channels.chat ? 'Chat' : 'Voice',
    status: 'running',
    statusLabel: 'Running...',
    metrics: {
      taskCompletion: 0,
      aiCsat: 0,
      responseTime: 0
    },
    failures: []
  }

  testRuns.value.unshift(newRun)
  showSetupModal.value = false

  // Simulate completion after 3 seconds
  setTimeout(() => {
    newRun.status = 'completed'
    newRun.statusLabel = 'Completed'
    newRun.metrics = {
      taskCompletion: Math.floor(Math.random() * 15) + 80,
      aiCsat: (Math.random() * 1 + 3.8).toFixed(1),
      responseTime: (Math.random() * 1 + 1.5).toFixed(1)
    }
    newRun.failures = [
      {
        category: 'Response Quality',
        count: Math.floor(Math.random() * 5) + 1,
        description: 'Responses lacked specific details in some scenarios'
      }
    ]
  }, 3000)
}
</script>

<style scoped>
.proving-ground-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

.pg-header {
  padding: 32px 40px;
  border-bottom: 1px solid #e0e0e0;
}

.pg-header h2 {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.pg-subtitle {
  font-size: 15px;
  color: #666;
  margin: 0;
}

/* Empty State */
.pg-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  text-align: center;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.pg-empty-state h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #000;
}

.pg-empty-state p {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
  max-width: 600px;
  line-height: 1.6;
}

.metrics-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-bottom: 32px;
}

.metric-badge {
  padding: 8px 16px;
  background: #f0f0f0;
  border-radius: 20px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.btn-primary {
  padding: 14px 32px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #333;
}

.btn-large {
  padding: 16px 40px;
  font-size: 16px;
}

/* Content Area */
.pg-content {
  flex: 1;
  padding: 32px 40px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.content-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

/* Runs List */
.runs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.run-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.run-card:hover {
  border-color: #999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.run-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.run-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.run-meta {
  font-size: 13px;
  color: #666;
}

.run-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.run-status.completed {
  background: #d4f4dd;
  color: #1e7e34;
}

.run-status.running {
  background: #fff3cd;
  color: #856404;
}

.run-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metric-label {
  font-size: 12px;
  color: #666;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: #000;
}

/* Modal Styles */
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
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.modal-subtitle {
  font-size: 14px;
  color: #666;
  margin: 4px 0 0 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #000;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-section {
  margin-bottom: 24px;
}

.form-section label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
}

.select-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
}

.hint {
  font-size: 13px;
  color: #666;
  margin: 8px 0 0 0;
}

.channel-selector {
  display: flex;
  gap: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.persona-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-checkbox {
  padding: 8px 16px;
  border: 1px solid #d0d0d0;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-checkbox:has(input:checked) {
  background: #000;
  color: #fff;
  border-color: #000;
}

.tag-checkbox input {
  display: none;
}

.info-box {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f0f7ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  font-size: 14px;
}

.info-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.info-box strong {
  display: block;
  margin-bottom: 4px;
}

.info-box p {
  margin: 0;
  color: #333;
  line-height: 1.5;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 10px 20px;
  background: #fff;
  color: #000;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

/* Results Details */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.metric-card {
  padding: 20px;
  background: #f8f8f8;
  border-radius: 8px;
  text-align: center;
}

.metric-card-value {
  font-size: 32px;
  font-weight: 600;
  color: #000;
  margin-bottom: 8px;
}

.metric-card-label {
  font-size: 13px;
  color: #666;
}

.failure-analysis {
  margin-bottom: 24px;
}

.failure-analysis h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.failure-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.failure-item {
  padding: 16px;
  background: #fef5e7;
  border: 1px solid #f9e79f;
  border-radius: 6px;
}

.failure-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.failure-category {
  font-size: 14px;
  font-weight: 600;
  color: #856404;
}

.failure-count {
  font-size: 13px;
  color: #856404;
}

.failure-description {
  font-size: 14px;
  color: #333;
  margin: 0;
  line-height: 1.5;
}

.coming-soon {
  text-align: center;
  padding: 24px;
  color: #666;
  font-size: 14px;
  margin: 0;
}
</style>
