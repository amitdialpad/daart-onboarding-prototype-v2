import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/home',
    component: () => import('../components/layout/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'AgentHub',
        component: () => import('../views/AgentHubView.vue')
      }
    ]
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
  },
  // V2 Routes (New Problem-First Experience)
  {
    path: '/onboarding-v2',
    name: 'OnboardingV2',
    component: () => import('../views/OnboardingV2View.vue'),
    beforeEnter: (to, from, next) => {
      // Only allow access if user has selected an intent and method
      const buildData = JSON.parse(localStorage.getItem('daart-building-agent') || '{}')
      if (!buildData.intent || !buildData.selectedMethod) {
        next('/home')
      } else {
        next()
      }
    }
  },
  {
    path: '/agent-setup-animation',
    name: 'AgentSetupAnimation',
    component: () => import('../views/AgentSetupAnimation.vue')
  },
  {
    path: '/build-agent',
    name: 'BuildAgent',
    component: () => import('../views/BuildAgentView.vue')
  },
  {
    path: '/visual-workflow',
    name: 'VisualWorkflow',
    component: () => import('../views/VisualWorkflowView.vue')
  },
  {
    path: '/test-agent',
    name: 'TestAgent',
    component: () => import('../views/AgentTestView.vue')
  },
  {
    path: '/agents-v2',
    component: () => import('../components/layout/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'AgentsListV2',
        component: () => import('../views/AgentsListV2View.vue')
      },
      {
        path: ':id',
        redirect: to => `/agents-v2/${to.params.id}/build`
      },
      {
        path: ':id/build',
        name: 'AgentBuildV2',
        component: () => import('../views/AgentsWorkspaceV2View.vue'),
        props: { activeTab: 'build' }
      },
      {
        path: ':id/test',
        name: 'AgentTestV2',
        component: () => import('../views/AgentsWorkspaceV2View.vue'),
        props: { activeTab: 'test' }
      },
      {
        path: ':id/evaluate',
        name: 'AgentEvaluateV2',
        component: () => import('../views/AgentsWorkspaceV2View.vue'),
        props: { activeTab: 'evaluate' }
      },
      {
        path: ':id/monitor',
        name: 'AgentMonitorV2',
        component: () => import('../views/AgentsWorkspaceV2View.vue'),
        props: { activeTab: 'monitor' }
      },
      {
        path: ':id/deploy',
        name: 'AgentDeployV2',
        component: () => import('../views/DeployView.vue')
      }
    ]
  },
  {
    path: '/knowledge-v2',
    component: () => import('../components/layout/AppLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/knowledge-v2/all-sources'
      },
      {
        path: 'all-sources',
        name: 'AllSources',
        component: () => import('../views/knowledge/AllSourcesView.vue')
      },
      {
        path: 'documents',
        name: 'Documents',
        component: () => import('../views/knowledge/DocumentsView.vue')
      },
      {
        path: 'text-content',
        name: 'TextContent',
        component: () => import('../views/knowledge/TextContentView.vue')
      },
      {
        path: 'website',
        name: 'Website',
        component: () => import('../views/knowledge/WebsiteView.vue')
      },
      {
        path: 'conversations',
        name: 'Conversations',
        component: () => import('../views/knowledge/ConversationsView.vue')
      }
    ]
  },
  {
    path: '/analytics-v2',
    component: () => import('../components/layout/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'AnalyticsV2',
        component: () => import('../views/AnalyticsV2View.vue')
      }
    ]
  },
  {
    path: '/billing-v2',
    component: () => import('../components/layout/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'BillingV2',
        component: () => import('../views/BillingV2View.vue')
      }
    ]
  },
  {
    path: '/settings-v2',
    component: () => import('../components/layout/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'SettingsV2',
        component: () => import('../views/SettingsV2View.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
