<template>
  <div class="recommendations-panel">
    <div class="panel-header">
      <h3>Recommendations</h3>
    </div>

    <div v-if="recommendations.length === 0" class="empty-recommendations">
      <p>No recommendations at this time</p>
    </div>

    <div v-else class="recommendations-list">
      <RecommendationCard
        v-for="recommendation in recommendations"
        :key="recommendation.id"
        :recommendation="recommendation"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import RecommendationCard from './RecommendationCard.vue'
import { useActivityFeedStore } from '../../stores/activityFeed'

const activityStore = useActivityFeedStore()

const recommendations = computed(() => activityStore.recommendations)
</script>

<style scoped>
.recommendations-panel {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
  overflow: hidden;
}

.panel-header {
  padding: 20px 20px 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.empty-recommendations {
  padding: 40px 20px;
  text-align: center;
}

.empty-recommendations p {
  color: #999;
  font-size: 14px;
  margin: 0;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
}
</style>
