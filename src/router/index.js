import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: () => {
      // Check if onboarding is complete
      const onboardingComplete = localStorage.getItem('daart-onboarding-complete')
      return onboardingComplete ? '/agents-workspace' : '/onboarding-wizard'
    }
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/SignupView.vue')
  },
  {
    path: '/onboarding-wizard',
    name: 'OnboardingWizard',
    component: () => import('../views/OnboardingWizardView.vue')
  },
  {
    path: '/agents-workspace',
    name: 'AgentsWorkspace',
    component: () => import('../views/AgentsWorkspaceView.vue')
  },
  {
    path: '/insights',
    name: 'Insights',
    component: () => import('../views/InsightsView.vue')
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/SettingsView.vue')
  },
  {
    path: '/billing',
    name: 'Billing',
    component: () => import('../views/BillingView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
