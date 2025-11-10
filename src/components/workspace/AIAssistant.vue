<template>
  <div class="ai-assistant" :class="{ collapsed: isCollapsed }">
    <div class="assistant-header" @click="toggleCollapse">
      <span class="assistant-title">AI Assistant</span>
      <button class="toggle-btn">{{ isCollapsed ? '+' : '-' }}</button>
    </div>

    <div v-if="!isCollapsed" class="assistant-content">
      <div class="suggestions-section">
        <p class="section-label">Suggestions for this section:</p>
        <div class="suggestion-list">
          <div v-for="suggestion in currentSuggestions" :key="suggestion.id" class="suggestion-item">
            <p class="suggestion-text">{{ suggestion.text }}</p>
            <button class="apply-btn" @click="applySuggestion(suggestion)">Apply</button>
          </div>
        </div>
      </div>

      <div class="help-section">
        <p class="section-label">Quick Help:</p>
        <ul class="help-list">
          <li v-for="tip in helpTips" :key="tip">{{ tip }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  context: {
    type: String,
    default: 'configuration'
  }
})

const isCollapsed = ref(false)

const suggestionsByContext = {
  configuration: [
    {
      id: 'sug-1',
      text: 'Add greeting message to make conversations more friendly',
      action: 'add_greeting'
    },
    {
      id: 'sug-2',
      text: 'Enable fallback responses for unrecognized questions',
      action: 'add_fallback'
    }
  ],
  knowledge: [
    {
      id: 'sug-3',
      text: 'Connect your help center documentation for better answers',
      action: 'connect_docs'
    },
    {
      id: 'sug-4',
      text: 'Add FAQs to improve common question handling',
      action: 'add_faqs'
    }
  ],
  skills: [
    {
      id: 'sug-5',
      text: 'Add appointment scheduling skill based on your agent intent',
      action: 'add_scheduling'
    },
    {
      id: 'sug-6',
      text: 'Consider adding customer lookup for personalized responses',
      action: 'add_lookup'
    }
  ]
}

const helpTipsByContext = {
  configuration: [
    'Use clear, specific instructions for best results',
    'Test your agent after making changes',
    'Enable multiple channels to reach more users'
  ],
  knowledge: [
    'More knowledge sources improve answer quality',
    'Keep documents up-to-date for accuracy',
    'Use text snippets for quick reference info'
  ],
  skills: [
    'Skills enable your agent to take actions',
    'Test each skill individually before deployment',
    'Skills can be reused across multiple agents'
  ]
}

const currentSuggestions = computed(() => {
  return suggestionsByContext[props.context] || []
})

const helpTips = computed(() => {
  return helpTipsByContext[props.context] || []
})

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function applySuggestion(suggestion) {
  // Static - just show it's clickable
  alert(`Applying suggestion: ${suggestion.text}`)
}
</script>

<style scoped>
.ai-assistant {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
  margin-bottom: 24px;
}

.ai-assistant.collapsed {
  background: #fff;
}

.assistant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;
}

.ai-assistant.collapsed .assistant-header {
  border-bottom: none;
}

.assistant-title {
  font-size: 14px;
  font-weight: 600;
}

.toggle-btn {
  background: none;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.assistant-content {
  padding: 16px;
}

.suggestions-section,
.help-section {
  margin-bottom: 20px;
}

.help-section {
  margin-bottom: 0;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #333;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.suggestion-text {
  flex: 1;
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}

.apply-btn {
  padding: 6px 12px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.apply-btn:hover {
  background: #333;
}

.help-list {
  margin: 0;
  padding-left: 20px;
}

.help-list li {
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 8px;
  color: #666;
}

.help-list li:last-child {
  margin-bottom: 0;
}
</style>
