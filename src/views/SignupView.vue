<template>
  <div class="signup-container">
    <div class="signup-card">
      <div class="header">
        <h1>Start Your Free Trial</h1>
        <p class="subtitle">Get started with Dialpad Agentic AI in minutes</p>
      </div>

      <div class="benefits">
        <div class="benefit">
          <span class="icon">✓</span>
          <span>1,000 free conversations</span>
        </div>
        <div class="benefit">
          <span class="icon">✓</span>
          <span>14-day trial period</span>
        </div>
        <div class="benefit">
          <span class="icon">✓</span>
          <span>No credit card required</span>
        </div>
      </div>

      <form @submit.prevent="handleSignup" class="signup-form">
        <div class="form-group">
          <label for="email">Work Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="you@company.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="name">Full Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="John Doe"
            required
          />
        </div>

        <div class="form-group">
          <label for="company">Company Name</label>
          <input
            id="company"
            v-model="form.company"
            type="text"
            placeholder="Acme Inc"
            required
          />
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          {{ isLoading ? 'Creating your account...' : 'Start Free Trial' }}
        </button>

        <p class="terms">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>

      <div class="login-link">
        Already have an account? <a href="/login">Sign in</a>
      </div>
    </div>

    <div class="features-showcase">
      <h2>What you'll get:</h2>
      <div class="feature-list">
        <div class="feature">
          <div class="feature-icon">🤖</div>
          <h3>AI Agent Setup</h3>
          <p>Create your first agentic AI assistant in 5 minutes</p>
        </div>
        <div class="feature">
          <div class="feature-icon">⚡</div>
          <h3>No-Code Skills</h3>
          <p>Build powerful skills without writing code</p>
        </div>
        <div class="feature">
          <div class="feature-icon">📊</div>
          <h3>Real-Time Analytics</h3>
          <p>Track deflection, containment, and CSAT</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAgenticStandaloneStore } from '../stores/agenticStandalone'

const router = useRouter()
const agenticStore = useAgenticStandaloneStore()

const isLoading = ref(false)
const form = ref({
  email: '',
  name: '',
  company: ''
})

async function handleSignup() {
  isLoading.value = true

  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Set trial state
  agenticStore.accountState = 'trial'
  agenticStore.agentName = form.value.company + ' Agent'

  isLoading.value = false

  // Navigate to onboarding
  router.push('/onboarding')
}
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  padding: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.signup-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  justify-self: end;
}

.header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: #666;
  margin-bottom: 32px;
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9ff;
  border-radius: 8px;
}

.benefit {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: #333;
}

.benefit .icon {
  color: #4CAF50;
  font-weight: bold;
  font-size: 18px;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-primary {
  padding: 14px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.terms {
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 4px;
}

.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.features-showcase {
  color: white;
  padding: 40px 0;
  align-self: center;
}

.features-showcase h2 {
  font-size: 36px;
  margin-bottom: 40px;
  font-weight: 700;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.feature {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.feature h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.feature p {
  font-size: 16px;
  opacity: 0.9;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .signup-container {
    grid-template-columns: 1fr;
    padding: 40px 20px;
  }

  .signup-card {
    justify-self: center;
  }

  .features-showcase {
    display: none;
  }
}
</style>
