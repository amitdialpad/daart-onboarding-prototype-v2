<template>
  <div class="hub-header">
    <div class="header-left">
      <h1>Your Agents ({{ agentCount }})</h1>
      <input
        v-if="showSearch"
        type="text"
        class="search-input"
        placeholder="Search agents..."
        v-model="searchQuery"
        @input="onSearch"
      />
    </div>
    <button class="btn-primary" @click="emit('create-agent')">
      + Create Agent
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  agentCount: {
    type: Number,
    required: true
  },
  showSearch: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['create-agent', 'search'])

const searchQuery = ref('')

function onSearch() {
  emit('search', searchQuery.value)
}
</script>

<style scoped>
.hub-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 20px;
}

.header-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

h1 {
  font-size: 32px;
  font-weight: 600;
  margin: 0;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 10px 16px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #999;
}

.btn-primary {
  padding: 12px 24px;
  background: #000;
  color: #fff;
  border: 1px solid #000;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary:hover {
  background: #333;
}

/* Responsive */
@media (max-width: 768px) {
  .hub-header {
    flex-direction: column;
  }

  .header-left {
    width: 100%;
  }

  .search-input {
    max-width: 100%;
  }

  .btn-primary {
    width: 100%;
  }
}
</style>
