<template>
  <div class="conversations-view">
    <div class="conversations-header">
      <h2>Conversations</h2>
      <p class="subtitle">View and analyze all agent conversations</p>
    </div>

    <div class="conversations-filters">
      <div class="search-container">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search by conversation ID..."
        />
      </div>
      <div class="filter-group">
        <select v-model="filterChannel" class="filter-select">
          <option value="all">All Channels</option>
          <option value="chat">Chat</option>
          <option value="voice">Voice</option>
          <option value="sms">SMS</option>
        </select>
        <select v-model="filterOutcome" class="filter-select">
          <option value="all">All Outcomes</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
          <option value="abandoned">Abandoned</option>
        </select>
      </div>
    </div>

    <div class="conversations-content">
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
    duration: '4m 32s',
    aiCsat: 4.5,
    skillsUsed: ['Order Lookup', 'Refund Processing']
  },
  {
    id: 'CONV-002',
    timestamp: 'Jan 10, 2025 2:12 PM',
    channel: 'Voice',
    outcome: 'Escalated',
    duration: '7m 18s',
    aiCsat: 3.2,
    skillsUsed: ['Account Management']
  },
  {
    id: 'CONV-003',
    timestamp: 'Jan 10, 2025 1:58 PM',
    channel: 'Chat',
    outcome: 'Resolved',
    duration: '3m 45s',
    aiCsat: 4.8,
    skillsUsed: ['Knowledge Base Search', 'Product Recommendations']
  },
  {
    id: 'CONV-004',
    timestamp: 'Jan 10, 2025 1:32 PM',
    channel: 'SMS',
    outcome: 'Abandoned',
    duration: '1m 12s',
    aiCsat: 2.1,
    skillsUsed: []
  },
  {
    id: 'CONV-005',
    timestamp: 'Jan 10, 2025 1:15 PM',
    channel: 'Chat',
    outcome: 'Resolved',
    duration: '5m 23s',
    aiCsat: 4.3,
    skillsUsed: ['Shipping Tracking', 'Delivery Updates']
  },
  {
    id: 'CONV-006',
    timestamp: 'Jan 10, 2025 12:58 PM',
    channel: 'Voice',
    outcome: 'Resolved',
    duration: '6m 10s',
    aiCsat: 4.7,
    skillsUsed: ['Calendar Booking', 'Appointment Confirmation']
  },
  {
    id: 'CONV-007',
    timestamp: 'Jan 10, 2025 12:42 PM',
    channel: 'Chat',
    outcome: 'Resolved',
    duration: '2m 58s',
    aiCsat: 4.6,
    skillsUsed: ['FAQ Lookup']
  },
  {
    id: 'CONV-008',
    timestamp: 'Jan 10, 2025 12:20 PM',
    channel: 'Chat',
    outcome: 'Escalated',
    duration: '8m 35s',
    aiCsat: 3.5,
    skillsUsed: ['Account Management', 'Billing Inquiry']
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
  router.push(`/agents-v2/${agentId}/conversations/${convId}`)
}
</script>

<style scoped>
.conversations-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.conversations-header {
  padding: 40px 40px 24px 40px;
}

.conversations-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.conversations-filters {
  padding: 0 40px 24px 40px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-container {
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 10px 14px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
  background: #fff;
}

.conversations-content {
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
