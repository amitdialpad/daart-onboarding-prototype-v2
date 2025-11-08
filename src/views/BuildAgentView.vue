<template>
  <div class="build-agent-view">
    <!-- Comparison table layout -->
    <div class="method-selection-container">
      <div class="method-selection-content">
        <!-- Show user's intent with change link -->
        <div v-if="userIntent" class="intent-context">
          <div class="intent-header">
            <p class="intent-label">Building agent for:</p>
            <button class="change-btn" @click="goBack">Change</button>
          </div>
          <p class="intent-text">{{ userIntent }}</p>
        </div>

        <h1>How would you like to build your agent?</h1>
        <p class="subtitle">Choose the approach that works best for you</p>

        <div class="method-cards-grid">
          <div class="method-card" @click="selectMethod('questions')">
            <div class="card-header">
              <h3>Answer a few questions</h3>
              <p class="time-estimate">~5 minutes</p>
            </div>

            <div class="card-body">
              <div class="best-for-tag">Best for: Beginners</div>

              <p class="method-description">
                We'll ask you about your business and use case. Based on your answers,
                we'll configure everything for you.
              </p>

              <div class="features-preview">
                <!-- Space for future examples/videos -->
                <div class="feature-placeholder">
                  <span class="placeholder-text">Examples coming soon</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <button class="method-btn">Get Started →</button>
            </div>
          </div>

          <div class="method-card featured" @click="selectMethod('knowledge')">
            <div class="card-header">
              <h3>Connect your knowledge</h3>
              <p class="time-estimate">~3 minutes</p>
            </div>

            <div class="card-body">
              <div class="best-for-tag">Best for: Existing content</div>

              <p class="method-description">
                Upload documents, connect your website, or add FAQs. Your agent will
                learn from your existing content.
              </p>

              <div class="features-preview">
                <!-- Space for future examples/videos -->
                <div class="feature-placeholder">
                  <span class="placeholder-text">Examples coming soon</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <button class="method-btn">Get Started →</button>
            </div>
          </div>

          <div class="method-card" @click="selectMethod('workflow')">
            <div class="card-header">
              <h3>Visual workflow</h3>
              <p class="time-estimate">Varies</p>
            </div>

            <div class="card-body">
              <div class="best-for-tag">Best for: Full control</div>

              <p class="method-description">
                Use our visual builder to design exactly how your agent should behave
                with workflows and integrations.
              </p>

              <div class="features-preview">
                <!-- Space for future examples/videos -->
                <div class="feature-placeholder">
                  <span class="placeholder-text">Examples coming soon</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <button class="method-btn">Get Started →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userIntent = ref('')

onMounted(() => {
  // Load intent data from previous screen
  const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')
  if (!buildData.intent) {
    // No intent stored, redirect back to homepage
    router.push('/home')
  } else {
    userIntent.value = buildData.intent
  }
})

function goBack() {
  router.push('/home')
}

function selectMethod(method) {
  // Store selected method for next screen to use
  const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')
  buildData.selectedMethod = method
  localStorage.setItem('daart-building-agent', JSON.stringify(buildData))

  // Navigate to appropriate screen
  if (method === 'questions') {
    router.push('/onboarding-v2')
  } else if (method === 'knowledge') {
    router.push('/onboarding-v2')
  } else if (method === 'workflow') {
    router.push('/visual-workflow')
  }
}
</script>

<style scoped>
.build-agent-view {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 20px;
}

.method-selection-container {
  width: 100%;
  max-width: 1200px;
}

.method-selection-content {
  text-align: center;
}

/* Intent Context */
.intent-context {
  max-width: 700px;
  margin: 0 auto 32px;
  padding: 16px 24px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: left;
}

.intent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.intent-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.change-btn {
  padding: 4px 12px;
  background: transparent;
  color: #666;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.change-btn:hover {
  background: #fff;
  color: #000;
  border-color: #000;
}

.intent-text {
  font-size: 15px;
  color: #000;
  line-height: 1.5;
  margin: 0;
}

h1 {
  font-size: 32px;
  font-weight: 600;
  color: #000;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin: 0 0 32px 0;
}

/* Pricing table grid layout */
.method-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  align-items: stretch;
}

.method-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  overflow: hidden;
  min-height: 380px;
}

.method-card:hover {
  border-color: #000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

/* Featured card styling */
.method-card.featured {
  border-color: #000;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Card sections */
.card-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin: 0 0 8px 0;
}

.time-estimate {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.card-body {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.best-for-tag {
  display: inline-block;
  padding: 6px 12px;
  background: #f8f8f8;
  color: #666;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  margin: 0 auto;
}

.method-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  flex: 0;
}

.features-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}

.feature-placeholder {
  width: 100%;
  padding: 20px;
  background: #fafafa;
  border: 1px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 12px;
  color: #999;
  font-style: italic;
}

.card-footer {
  padding: 0 24px 24px;
}

.method-btn {
  width: 100%;
  padding: 12px 24px;
  background: #f8f8f8;
  color: #000;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
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

/* Responsive */
@media (max-width: 1024px) {
  .method-cards-grid {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin: 0 auto;
  }

  .method-card {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .intent-context {
    margin: 0 auto 24px;
    padding: 12px 16px;
  }

  .change-btn {
    font-size: 12px;
    padding: 3px 10px;
  }

  h1 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .card-header h3 {
    font-size: 18px;
  }
}
</style>
