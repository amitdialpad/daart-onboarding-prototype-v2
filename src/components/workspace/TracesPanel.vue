<template>
  <div class="traces-panel">
    <div class="traces-header">
      <div>
        <h2>Conversation History</h2>
        <p class="subtitle">View and analyze past conversations</p>
      </div>
      <div class="header-actions">
        <input type="text" v-model="searchQuery" placeholder="Search conversations..." class="search-input" />
        <select v-model="filterChannel" class="filter-select">
          <option value="all">All Channels</option>
          <option value="chat">Chat</option>
          <option value="voice">Voice</option>
        </select>
        <select v-model="filterOutcome" class="filter-select">
          <option value="all">All Outcomes</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
          <option value="abandoned">Abandoned</option>
        </select>
      </div>
    </div>

    <div class="traces-content">
      <!-- Conversation List -->
      <div class="conversation-list">
        <div class="list-header">
          <span class="col-time">Time</span>
          <span class="col-channel">Channel</span>
          <span class="col-outcome">Outcome</span>
          <span class="col-csat">AI CSAT</span>
        </div>
        <div
          v-for="conv in filteredConversations"
          :key="conv.id"
          class="conversation-item"
          :class="{ selected: selectedConversation?.id === conv.id }"
          @click="selectConversation(conv)"
        >
          <span class="col-time">{{ conv.timestamp }}</span>
          <span class="col-channel">{{ conv.channel }}</span>
          <span class="col-outcome">{{ conv.outcome }}</span>
          <span class="col-csat">{{ conv.aiCsat }}/5</span>
        </div>
      </div>

      <!-- Conversation Details -->
      <div class="conversation-details">
        <div v-if="selectedConversation">
          <div class="details-header">
            <h3>Conversation {{ selectedConversation.id }}</h3>
            <div class="details-meta">
              <span>{{ selectedConversation.timestamp }}</span>
              <span>{{ selectedConversation.channel }}</span>
              <span>Duration: {{ selectedConversation.duration }}</span>
              <span>AI CSAT: {{ selectedConversation.aiCsat }}/5</span>
            </div>
          </div>

          <!-- Transcript -->
          <div class="transcript-section">
            <h4>Transcript</h4>
            <div class="transcript">
              <div v-for="(message, idx) in selectedConversation.messages" :key="idx" class="message">
                <div class="message-header">
                  <span class="speaker">{{ message.speaker }}</span>
                  <span class="time">{{ message.time }}</span>
                </div>
                <div class="message-text">{{ message.text }}</div>
              </div>
            </div>
          </div>

          <!-- Skills & Actions Used -->
          <div class="skills-section">
            <h4>Skills & Actions Used</h4>
            <div class="skills-list">
              <div v-for="skill in selectedConversation.skillsUsed" :key="skill" class="skill-tag">
                {{ skill }}
              </div>
            </div>
          </div>

          <!-- Action Outputs -->
          <div class="actions-section">
            <h4>Action Outputs</h4>
            <div v-for="action in selectedConversation.actions" :key="action.id" class="action-item">
              <div class="action-header">
                <span class="action-name">{{ action.name }}</span>
                <span class="action-status">{{ action.status }}</span>
              </div>
              <pre class="action-output">{{ action.output }}</pre>
            </div>
          </div>
        </div>

        <div v-else class="no-selection">
          <p>Select a conversation to view details</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const filterChannel = ref('all')
const filterOutcome = ref('all')
const selectedConversation = ref(null)

// Mock conversation data
const conversations = ref([
  {
    id: 'CONV-001',
    timestamp: 'Jan 10, 2025 2:45 PM',
    channel: 'Chat',
    outcome: 'Resolved',
    aiCsat: 4.5,
    duration: '3m 24s',
    skillsUsed: ['Appointment Scheduling', 'Customer Lookup', 'Calendar Integration'],
    messages: [
      { speaker: 'Customer', time: '2:45 PM', text: 'I need to schedule an appointment' },
      { speaker: 'Agent', time: '2:45 PM', text: 'I can help you with that. What date works best for you?' },
      { speaker: 'Customer', time: '2:46 PM', text: 'Next Tuesday at 2pm' },
      { speaker: 'Agent', time: '2:46 PM', text: 'Let me check availability for Tuesday, January 14th at 2:00 PM.' },
      { speaker: 'Agent', time: '2:47 PM', text: 'Great news! That time is available. I have booked your appointment for Tuesday, January 14th at 2:00 PM. You will receive a confirmation email shortly.' }
    ],
    actions: [
      {
        id: 'ACT-1',
        name: 'check_calendar_availability',
        status: 'Success',
        output: JSON.stringify({ available: true, slots: ['2:00 PM', '3:00 PM', '4:00 PM'] }, null, 2)
      },
      {
        id: 'ACT-2',
        name: 'create_appointment',
        status: 'Success',
        output: JSON.stringify({ appointmentId: 'APT-12345', date: '2025-01-14', time: '14:00' }, null, 2)
      }
    ]
  },
  {
    id: 'CONV-002',
    timestamp: 'Jan 10, 2025 1:30 PM',
    channel: 'Voice',
    outcome: 'Escalated',
    aiCsat: 3.2,
    duration: '5m 12s',
    skillsUsed: ['Billing Inquiry', 'Account Lookup'],
    messages: [
      { speaker: 'Customer', time: '1:30 PM', text: 'I have a question about my bill' },
      { speaker: 'Agent', time: '1:31 PM', text: 'I can help with billing questions. Can you provide your account number?' },
      { speaker: 'Customer', time: '1:32 PM', text: 'Its ACC-789456' },
      { speaker: 'Agent', time: '1:33 PM', text: 'Thank you. I see your account. Your current balance is $156.78. However, for detailed billing adjustments, let me connect you with a specialist.' }
    ],
    actions: [
      {
        id: 'ACT-3',
        name: 'lookup_account',
        status: 'Success',
        output: JSON.stringify({ accountId: 'ACC-789456', balance: 156.78, status: 'active' }, null, 2)
      }
    ]
  },
  {
    id: 'CONV-003',
    timestamp: 'Jan 10, 2025 12:15 PM',
    channel: 'Chat',
    outcome: 'Resolved',
    aiCsat: 4.8,
    duration: '2m 05s',
    skillsUsed: ['Order Status', 'Tracking Lookup'],
    messages: [
      { speaker: 'Customer', time: '12:15 PM', text: 'Where is my order?' },
      { speaker: 'Agent', time: '12:15 PM', text: 'I can help you track your order. Please provide your order number.' },
      { speaker: 'Customer', time: '12:16 PM', text: 'ORD-55123' },
      { speaker: 'Agent', time: '12:16 PM', text: 'Your order ORD-55123 is out for delivery and should arrive today by 6 PM.' }
    ],
    actions: [
      {
        id: 'ACT-4',
        name: 'track_order',
        status: 'Success',
        output: JSON.stringify({ orderId: 'ORD-55123', status: 'Out for delivery', eta: '6:00 PM' }, null, 2)
      }
    ]
  }
])

const filteredConversations = computed(() => {
  return conversations.value.filter(conv => {
    if (filterChannel.value !== 'all' && conv.channel.toLowerCase() !== filterChannel.value) {
      return false
    }
    if (filterOutcome.value !== 'all' && conv.outcome.toLowerCase() !== filterOutcome.value) {
      return false
    }
    if (searchQuery.value && !conv.id.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false
    }
    return true
  })
})

function selectConversation(conv) {
  selectedConversation.value = conv
}
</script>

<style scoped>
.traces-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.traces-header {
  padding: 24px 32px;
  border-bottom: 1px solid #e0e0e0;
}

.traces-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
}

.traces-content {
  flex: 1;
  display: grid;
  grid-template-columns: 500px 1fr;
  overflow: hidden;
}

/* Conversation List */
.conversation-list {
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  background: #fafafa;
}

.list-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
}

.conversation-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}

.conversation-item:hover {
  background: #f5f5f5;
}

.conversation-item.selected {
  background: #e8e8e8;
  font-weight: 500;
}

/* Conversation Details */
.conversation-details {
  padding: 24px;
  overflow-y: auto;
}

.details-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.details-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
  margin-bottom: 24px;
}

.transcript-section,
.skills-section,
.actions-section {
  margin-bottom: 32px;
}

.transcript-section h4,
.skills-section h4,
.actions-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.transcript {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  background: #fafafa;
}

.message {
  margin-bottom: 16px;
}

.message:last-child {
  margin-bottom: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.speaker {
  font-weight: 600;
  font-size: 13px;
}

.time {
  font-size: 12px;
  color: #999;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  padding: 6px 12px;
  background: #f0f0f0;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 13px;
}

.action-item {
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
}

.action-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.action-name {
  font-weight: 600;
  font-size: 14px;
}

.action-status {
  font-size: 12px;
  color: #666;
}

.action-output {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #fff;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}
</style>
