/**
 * Agentic Standalone Store
 * Manages trial, billing, and usage state for standalone customers
 * Based on DP-162290 (Giselle's work) and PRD requirements
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAgenticStandaloneStore = defineStore('agenticStandalone', () => {
  // State
  const accountState = ref('trial') // 'trial' | 'pay_as_you_go' | 'cancelled' | 'expired'
  const conversationsUsed = ref(0)
  const conversationsLimit = ref(1000) // Trial limit
  const trialDaysRemaining = ref(14)
  const trialStartDate = ref(new Date().toISOString())
  const trialEndDate = ref(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())

  // Billing info
  const billingCycle = ref('monthly') // 'monthly' | 'annual'
  const pricePerConversation = ref(0.50) // $0.50 per conversation for pay-as-you-go
  const currentMonthCost = ref(0)
  const paymentMethodAdded = ref(false)

  // Agent info
  const agentId = ref(null)
  const agentName = ref('')
  const skillsCount = ref(0)
  const selectedChannel = ref(null) // 'chat' | 'voice' | null
  const hasTestedAgent = ref(false)
  const agentDeploymentStatus = ref('test') // 'test' | 'live' | 'not_deployed'

  // Loading states
  const isLoading = ref(false)
  const error = ref(null)

  // Computed
  const isInTrial = computed(() => accountState.value === 'trial')
  const isPayAsYouGo = computed(() => accountState.value === 'pay_as_you_go')
  const isCancelled = computed(() => accountState.value === 'cancelled')
  const isExpired = computed(() => accountState.value === 'expired')

  const conversationsRemaining = computed(() => {
    if (isInTrial.value) {
      return Math.max(0, conversationsLimit.value - conversationsUsed.value)
    }
    return Infinity // Unlimited for paid
  })

  const usagePercentage = computed(() => {
    if (isInTrial.value) {
      return Math.min(100, (conversationsUsed.value / conversationsLimit.value) * 100)
    }
    return 0
  })

  const isNearLimit = computed(() => usagePercentage.value >= 80)
  const isAtLimit = computed(() => conversationsUsed.value >= conversationsLimit.value)

  const trialDaysProgress = computed(() => {
    const totalDays = 14
    const remaining = trialDaysRemaining.value
    return ((totalDays - remaining) / totalDays) * 100
  })

  // Actions
  async function fetchAccountData() {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/agentic/standalone/account')
      // const data = await response.json()

      // Mock data for prototype
      await new Promise(resolve => setTimeout(resolve, 500))

      // This would come from the API
      return {
        success: true
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  function updateConversationCount(count) {
    conversationsUsed.value = count

    // Update cost for pay-as-you-go
    if (isPayAsYouGo.value) {
      currentMonthCost.value = count * pricePerConversation.value
    }

    // Check if trial should auto-convert to pay-as-you-go
    if (isInTrial.value && conversationsUsed.value >= conversationsLimit.value) {
      // In PRD: DP-161474 mentions keeping it at limit if still in trial
      // Don't auto-convert - user must explicitly upgrade
    }
  }

  async function upgradeToPaid(paymentMethod) {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/agentic/standalone/upgrade', {
      //   method: 'POST',
      //   body: JSON.stringify({ paymentMethod })
      // })

      await new Promise(resolve => setTimeout(resolve, 1000))

      accountState.value = 'pay_as_you_go'
      paymentMethodAdded.value = true

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function cancelTrial() {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))

      accountState.value = 'cancelled'

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    accountState.value = 'trial'
    conversationsUsed.value = 0
    conversationsLimit.value = 1000
    trialDaysRemaining.value = 14
    currentMonthCost.value = 0
    paymentMethodAdded.value = false
    agentId.value = null
    agentName.value = ''
    skillsCount.value = 0
    selectedChannel.value = null
    hasTestedAgent.value = false
    agentDeploymentStatus.value = 'test'
    error.value = null
  }

  return {
    // State
    accountState,
    conversationsUsed,
    conversationsLimit,
    trialDaysRemaining,
    trialStartDate,
    trialEndDate,
    billingCycle,
    pricePerConversation,
    currentMonthCost,
    paymentMethodAdded,
    agentId,
    agentName,
    skillsCount,
    selectedChannel,
    hasTestedAgent,
    agentDeploymentStatus,
    isLoading,
    error,

    // Computed
    isInTrial,
    isPayAsYouGo,
    isCancelled,
    isExpired,
    conversationsRemaining,
    usagePercentage,
    isNearLimit,
    isAtLimit,
    trialDaysProgress,

    // Actions
    fetchAccountData,
    updateConversationCount,
    upgradeToPaid,
    cancelTrial,
    reset
  }
})
