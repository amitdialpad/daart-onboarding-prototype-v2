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
      <table class="conversations-table">
        <thead>
          <tr>
            <th>Conversation ID</th>
            <th>Time</th>
            <th>Channel</th>
            <th>Duration</th>
            <th>Outcome</th>
            <th>AI CSAT</th>
            <th>Skills Used</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="conv in filteredConversations"
            :key="conv.id"
            class="conversation-row"
            @click="viewConversation(conv.id)"
          >
            <td class="conv-id">{{ conv.id }}</td>
            <td>{{ conv.timestamp }}</td>
            <td>{{ conv.channel }}</td>
            <td>{{ conv.duration }}</td>
            <td>{{ conv.outcome }}</td>
            <td>{{ conv.aiCsat }}/5</td>
            <td class="skills-cell">{{ conv.skillsUsed.length }} skills</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const filterChannel = ref('all')
const filterOutcome = ref('all')

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

function viewConversation(convId) {
  const agentId = route.params.id
  router.push(`/agents-v2/${agentId}/traces/${convId}`)
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
  padding: 40px 40px 24px 40px;
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
  overflow-y: auto;
  padding: 0 40px 40px 40px;
}

.conversations-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.conversations-table thead {
  position: sticky;
  top: 0;
  background: #fafafa;
  z-index: 1;
}

.conversations-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #666;
  border-bottom: 1px solid #e0e0e0;
}

.conversation-row {
  cursor: pointer;
  transition: background 0.2s;
}

.conversation-row:hover {
  background: #f5f5f5;
}

.conversations-table td {
  padding: 16px;
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
}

.conv-id {
  font-weight: 500;
  color: #000;
}

.skills-cell {
  color: #666;
}
</style>
