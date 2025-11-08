import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useActivityFeedStore = defineStore('activityFeed', () => {
  const activities = ref([])
  const recommendations = ref([])

  // Generate mock activities based on agents
  function generateMockActivities(agents) {
    const now = Date.now()
    const mockActivities = []

    agents.forEach((agent, index) => {
      // Recent conversation (live agents only)
      if (agent.status === 'live') {
        mockActivities.push({
          id: `conv-${agent.id}-${now}`,
          type: 'conversation',
          agentId: agent.id,
          agentName: agent.name,
          timestamp: now - (index * 15 * 60 * 1000), // 15 min apart
          title: 'New conversation',
          description: agent.name,
          icon: null
        })
      }

      // Test passed (draft agents)
      if (agent.status === 'draft') {
        mockActivities.push({
          id: `test-${agent.id}-${now}`,
          type: 'test',
          agentId: agent.id,
          agentName: agent.name,
          timestamp: now - (index * 60 * 60 * 1000), // 1 hour apart
          title: 'Test passed',
          description: `${agent.name} (3/3 scenarios)`,
          icon: null
        })
      }

      // Draft ready alert (draft agents with passing tests)
      if (agent.status === 'draft' && !agent.hasBeenPublished) {
        mockActivities.push({
          id: `alert-${agent.id}-${now}`,
          type: 'alert',
          agentId: agent.id,
          agentName: agent.name,
          timestamp: now - (2 * 60 * 60 * 1000), // 2 hours ago
          title: 'Draft ready',
          description: agent.name,
          cta: {
            text: 'Review & Deploy',
            route: `/agents-v2/${agent.id}/deploy`
          },
          icon: null
        })
      }
    })

    // Knowledge updated (organization-level)
    if (agents.length > 0) {
      mockActivities.push({
        id: `knowledge-update-${now}`,
        type: 'knowledge',
        timestamp: now - (3 * 60 * 60 * 1000), // 3 hours ago
        title: 'Knowledge updated',
        description: 'Added 3 new documents',
        icon: null
      })
    }

    // Sort by timestamp (newest first) and limit to 8 items
    activities.value = mockActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8)
  }

  // Generate recommendations based on agent state
  function generateRecommendations(agents) {
    const recs = []

    agents.forEach(agent => {
      // Recommend enabling SMS for chat agents
      if (
        agent.agentType === 'chat' &&
        !agent.chatConfig?.smsEnabled &&
        agent.status === 'live'
      ) {
        recs.push({
          id: `sms-${agent.id}`,
          type: 'feature',
          title: 'Enable SMS',
          description: `${agent.name} can reach more users via text messaging`,
          cta: {
            text: 'Enable',
            route: `/agents-v2/${agent.id}/build`
          }
        })
      }

      // Recommend publishing drafts with passing tests
      if (agent.status === 'draft' && !agent.hasBeenPublished) {
        recs.push({
          id: `publish-${agent.id}`,
          type: 'action',
          title: 'Ready to publish',
          description: `${agent.name} is ready to go live`,
          cta: {
            text: 'Deploy',
            route: `/agents-v2/${agent.id}/deploy`
          }
        })
      }

      // Mock deflection drop alert for live agents (random)
      if (agent.status === 'live' && Math.random() > 0.7) {
        recs.push({
          id: `deflection-${agent.id}`,
          type: 'alert',
          title: 'Review conversations',
          description: `Deflection dropped 5% on ${agent.name}`,
          cta: {
            text: 'View Analytics',
            route: `/agents-v2/${agent.id}/monitor`
          }
        })
      }
    })

    // Limit to 3 recommendations
    recommendations.value = recs.slice(0, 3)
  }

  // Format timestamp as relative time
  function formatTimestamp(timestamp) {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // Get activities with formatted timestamps
  const formattedActivities = computed(() => {
    return activities.value.map(activity => ({
      ...activity,
      formattedTime: formatTimestamp(activity.timestamp)
    }))
  })

  return {
    activities,
    recommendations,
    formattedActivities,
    generateMockActivities,
    generateRecommendations,
    formatTimestamp
  }
})
