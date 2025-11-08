<template>
  <div class="agent-card-grid" :class="{ 'simplified-grid': simplified }">
    <AgentCard
      v-for="agent in agents"
      :key="agent.id"
      :agent="agent"
      :simplified="simplified"
    />
  </div>
</template>

<script setup>
import AgentCard from './AgentCard.vue'

defineProps({
  agents: {
    type: Array,
    required: true
  },
  simplified: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.agent-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* Simplified grid for single agent */
.agent-card-grid.simplified-grid {
  grid-template-columns: 1fr;
  max-width: 500px;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 768px) {
  .agent-card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
