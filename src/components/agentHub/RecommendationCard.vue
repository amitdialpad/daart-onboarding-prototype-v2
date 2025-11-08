<template>
  <div class="recommendation-card" :class="[`type-${recommendation.type}`]">
    <div class="card-content">
      <div class="card-title">{{ recommendation.title }}</div>
      <div class="card-description">{{ recommendation.description }}</div>

      <button
        v-if="recommendation.cta"
        class="card-cta"
        @click="handleCta"
      >
        {{ recommendation.cta.text }} →
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  recommendation: {
    type: Object,
    required: true
  }
})

const router = useRouter()

function handleCta() {
  if (props.recommendation.cta?.route) {
    router.push(props.recommendation.cta.route)
  }
}
</script>

<style scoped>
.recommendation-card {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
  transition: background 0.15s;
}

.recommendation-card:last-child {
  border-bottom: none;
}

.recommendation-card:hover {
  background: #f9f9f9;
}

.recommendation-card.type-alert {
  background: #fff5f5;
}

.recommendation-card.type-alert:hover {
  background: #ffebeb;
}

.recommendation-card.type-feature {
  background: #f0f7ff;
}

.recommendation-card.type-feature:hover {
  background: #e6f2ff;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.card-description {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.card-cta {
  margin-top: 4px;
  padding: 8px 16px;
  background: #000;
  color: #fff;
  border: 1px solid #000;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  align-self: flex-start;
}

.card-cta:hover {
  background: #333;
}
</style>
