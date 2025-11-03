<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAgenticStandaloneStore } from './stores/agenticStandalone'

const agenticStore = useAgenticStandaloneStore()

onMounted(() => {
  // Initialize store data
  agenticStore.fetchAccountData()
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
