<template>
  <div class="conversation-detail">
    <div class="detail-header">
      <button class="back-btn" @click="goBack">Back to all conversations</button>
      <h2>Conversation {{ conversationId }}</h2>
    </div>

    <div v-if="conversation" class="detail-content">
      <!-- Metadata -->
      <div class="metadata-section">
        <div class="metadata-item">
          <span class="metadata-label">Time</span>
          <span class="metadata-value">{{ conversation.timestamp }}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Channel</span>
          <span class="metadata-value">{{ conversation.channel }}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Duration</span>
          <span class="metadata-value">{{ conversation.duration }}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">Outcome</span>
          <span class="metadata-value">{{ conversation.outcome }}</span>
        </div>
        <div class="metadata-item">
          <span class="metadata-label">AI CSAT</span>
          <span class="metadata-value">{{ conversation.aiCsat }}/5</span>
        </div>
      </div>

      <!-- Transcript -->
      <div class="section">
        <h3>Transcript</h3>
        <div class="transcript">
          <div v-for="(message, idx) in conversation.messages" :key="idx" class="message">
            <div class="message-header">
              <span class="speaker">{{ message.speaker }}</span>
              <span class="time">{{ message.time }}</span>
            </div>
            <div class="message-text">{{ message.text }}</div>
          </div>
        </div>
      </div>

      <!-- Skills & Actions Used -->
      <div class="section">
        <h3>Skills & Actions Used</h3>
        <div class="skills-list">
          <div v-for="skill in conversation.skillsUsed" :key="skill" class="skill-tag">
            {{ skill }}
          </div>
        </div>
      </div>

      <!-- Action Outputs -->
      <div class="section">
        <h3>Action Outputs</h3>
        <div v-for="action in conversation.actions" :key="action.id" class="action-item">
          <div class="action-header">
            <span class="action-name">{{ action.name }}</span>
            <span class="action-status">{{ action.status }}</span>
          </div>
          <pre class="action-output">{{ action.output }}</pre>
        </div>
      </div>
    </div>

    <div v-else class="not-found">
      <p>Conversation not found</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const conversationId = route.params.conversationId
const conversation = ref(null)

// Mock conversation data - same as TracesPanel
const conversations = [
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
]

onMounted(() => {
  conversation.value = conversations.find(c => c.id === conversationId)
})

function goBack() {
  router.go(-1)
}
</script>

<style scoped>
.conversation-detail {
  height: 100%;
  overflow-y: auto;
  background: #fff;
}

.detail-header {
  padding: 40px;
  border-bottom: 1px solid #e0e0e0;
}

.back-btn {
  padding: 8px 16px;
  background: #fff;
  color: #000;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 16px;
}

.back-btn:hover {
  background: #f5f5f5;
}

.detail-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.detail-content {
  padding: 40px;
}

.metadata-section {
  display: flex;
  gap: 32px;
  padding: 24px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 32px;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metadata-label {
  font-size: 12px;
  text-transform: uppercase;
  color: #666;
  font-weight: 600;
}

.metadata-value {
  font-size: 14px;
  color: #000;
}

.section {
  margin-bottom: 32px;
}

.section h3 {
  font-size: 18px;
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

.action-item:last-child {
  margin-bottom: 0;
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

.not-found {
  padding: 40px;
  text-align: center;
  color: #666;
}
</style>
