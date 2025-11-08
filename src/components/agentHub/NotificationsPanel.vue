<template>
  <div class="notifications-panel">
    <div class="panel-header">
      <h3 class="panel-title">Notifications</h3>
      <button class="clear-all-btn">Clear all</button>
    </div>

    <div class="notifications-list">
      <!-- Error Notifications -->
      <div
        v-for="notification in errorNotifications"
        :key="notification.id"
        class="notification-item error"
      >
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-description">{{ notification.description }}</div>
          <div class="notification-time">{{ notification.time }}</div>
        </div>
      </div>

      <!-- Warning Notifications -->
      <div
        v-for="notification in warningNotifications"
        :key="notification.id"
        class="notification-item warning"
      >
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-description">{{ notification.description }}</div>
          <div class="notification-time">{{ notification.time }}</div>
        </div>
      </div>

      <!-- Info Notifications -->
      <div
        v-for="notification in infoNotifications"
        :key="notification.id"
        class="notification-item info"
      >
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-description">{{ notification.description }}</div>
          <div class="notification-time">{{ notification.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Mock notifications data
const notifications = ref([
  {
    id: 1,
    type: 'error',
    title: 'Connection failed',
    description: 'Zendesk integration is disconnected',
    time: '2 min ago'
  },
  {
    id: 2,
    type: 'error',
    title: 'Connection failed',
    description: 'Aerolabs Digital Channel is disconnected',
    time: '5 min ago'
  },
  {
    id: 3,
    type: 'warning',
    title: 'Feedback alert',
    description: 'Thumbs down increased by 71% this week',
    time: '1 hour ago'
  },
  {
    id: 4,
    type: 'warning',
    title: 'Delivery delays',
    description: '12 messages delayed by more than 5 seconds',
    time: '2 hours ago'
  },
  {
    id: 5,
    type: 'info',
    title: 'Unanswered questions',
    description: '8 questions grouped as unanswered',
    time: '3 hours ago'
  },
  {
    id: 6,
    type: 'warning',
    title: 'Broken content',
    description: '3 knowledge sources have broken links',
    time: '4 hours ago'
  },
  {
    id: 7,
    type: 'info',
    title: 'New feedback',
    description: '5 new thumbs up received today',
    time: '5 hours ago'
  }
])

const errorNotifications = computed(() => {
  return notifications.value.filter(n => n.type === 'error')
})

const warningNotifications = computed(() => {
  return notifications.value.filter(n => n.type === 'warning')
})

const infoNotifications = computed(() => {
  return notifications.value.filter(n => n.type === 'info')
})
</script>

<style scoped>
.notifications-panel {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.clear-all-btn {
  padding: 6px 12px;
  background: #fff;
  color: #666;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  border-color: #999;
  background: #fafafa;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  padding: 14px;
  border-radius: 6px;
  background: #f8f8f8;
  transition: all 0.2s;
  cursor: pointer;
}

.notification-item:hover {
  background: #f0f0f0;
}

.notification-item.error {
  border-left: 3px solid #ff4444;
}

.notification-item.warning {
  border-left: 3px solid #ffaa00;
}

.notification-item.info {
  border-left: 3px solid #4488ff;
}

.notification-content {
  width: 100%;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.notification-description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 6px;
}

.notification-time {
  font-size: 11px;
  color: #999;
}
</style>
