<template>
  <div class="activity-feed">
    <div class="feed-header">
      <h3>Activity & Alerts</h3>
    </div>

    <div v-if="activities.length === 0" class="empty-feed">
      <p>No recent activity</p>
    </div>

    <div v-else class="activity-list">
      <ActivityItem
        v-for="activity in activities"
        :key="activity.id"
        :activity="activity"
      />
    </div>

    <router-link v-if="activities.length > 0" to="/analytics-v2" class="view-all-link">
      View All Activity →
    </router-link>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ActivityItem from './ActivityItem.vue'
import { useActivityFeedStore } from '../../stores/activityFeed'

const activityStore = useActivityFeedStore()

const activities = computed(() => activityStore.formattedActivities)
</script>

<style scoped>
.activity-feed {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
  overflow: hidden;
}

.feed-header {
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.feed-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.empty-feed {
  padding: 40px 20px;
  text-align: center;
}

.empty-feed p {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.view-all-link {
  display: block;
  padding: 16px 20px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  text-decoration: none;
  border-top: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.view-all-link:hover {
  background: #f5f5f5;
  color: #000;
}

/* Scrollbar styling */
.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.activity-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>
