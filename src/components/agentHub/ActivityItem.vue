<template>
  <div class="activity-item" :class="[`type-${activity.type}`]">
    <div class="activity-content">
      <div class="activity-header">
        <span class="activity-time">{{ activity.formattedTime }}</span>
        <span v-if="activity.type === 'alert'" class="activity-badge">Alert</span>
      </div>

      <div class="activity-title">{{ activity.title }}</div>
      <div class="activity-description">{{ activity.description }}</div>

      <button
        v-if="activity.cta"
        class="activity-cta"
        @click.stop="handleCta"
      >
        {{ activity.cta.text }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
})

const router = useRouter()

function handleCta() {
  if (props.activity.cta?.route) {
    router.push(props.activity.cta.route)
  }
}
</script>

<style scoped>
.activity-item {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
  transition: background 0.15s;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background: #f9f9f9;
}

.activity-item.type-alert {
  background: #fffbf0;
}

.activity-item.type-alert:hover {
  background: #fff8e6;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-time {
  font-size: 12px;
  color: #999;
}

.activity-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  background: #ff9800;
  color: #fff;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-title {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.activity-description {
  font-size: 13px;
  color: #666;
}

.activity-cta {
  margin-top: 6px;
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

.activity-cta:hover {
  background: #333;
}
</style>
