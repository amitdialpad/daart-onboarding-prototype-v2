<template>
  <div class="method-selector">
    <h2>How would you like to build your agent?</h2>
    <p class="subtitle">Choose the approach that works best for you</p>

    <div class="method-cards">
      <div
        v-for="method in methods"
        :key="method.id"
        class="method-card"
        @click="$emit('select', method.id)"
      >
        <div class="method-number">{{ method.number }}</div>
        <h3>{{ method.title }}</h3>
        <div class="method-meta">
          <span class="best-for">{{ method.bestFor }}</span>
          <span class="time">{{ method.time }}</span>
        </div>
        <p class="method-description">{{ method.description }}</p>
        <button class="method-btn">Select this approach →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineEmits(['select'])

const methods = ref([
  {
    id: 'questions',
    number: '1',
    title: 'Answer a few questions',
    bestFor: 'Best for: Beginners, first-time users',
    time: 'Time: ~5 minutes',
    description: "We'll ask you about your business and use case. Based on your answers, we'll configure everything for you."
  },
  {
    id: 'knowledge',
    number: '2',
    title: 'Connect your knowledge sources',
    bestFor: 'Best for: Businesses with existing content',
    time: 'Time: ~3 minutes',
    description: 'Upload documents, connect your website, or add FAQs. Your agent will learn from your existing content.'
  },
  {
    id: 'workflow',
    number: '3',
    title: 'Build with Agent Studio',
    bestFor: 'Best for: Technical users who want full control',
    time: 'Time: Varies',
    description: 'Use Agent Studio to design exactly how your agent should behave with workflows and integrations.'
  }
])
</script>

<style scoped>
.method-selector {
  max-width: 700px;
  margin: 0 auto;
}

h2 {
  font-size: 28px;
  font-weight: 600;
  color: #000;
  margin: 0 0 12px 0;
  line-height: 1.3;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
}

.method-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.method-card {
  padding: 24px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.method-card:hover {
  border-color: #000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.method-number {
  display: inline-block;
  width: 32px;
  height: 32px;
  background: #f0f0f0;
  border-radius: 50%;
  text-align: center;
  line-height: 32px;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 12px;
}

.method-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #000;
  margin: 0 0 8px 0;
}

.method-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.best-for,
.time {
  font-size: 13px;
  color: #666;
}

.method-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.method-btn {
  padding: 10px 20px;
  background: #f8f8f8;
  color: #000;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.method-card:hover .method-btn {
  background: #000;
  color: #fff;
  border-color: #000;
}

@media (max-width: 768px) {
  h2 {
    font-size: 24px;
  }

  .method-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
