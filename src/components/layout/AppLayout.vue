<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue'
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  background: #fff;
  font-family: apple-system, BlinkMacSystemFont, "SF Pro", "Segoe UI Adjusted", "Segoe UI", SFMono, "Helvetica Neue", Cantarell, Ubuntu, Roboto, Arial, "Noto Sans", sans-serif;
}

.main-content {
  flex: 1;
  overflow: auto;
}
</style>

<style>
/* Global style to hide sidebar when wizard mode is active */
body.wizard-mode-active .sidebar {
  display: none !important;
}

body.wizard-mode-active .app-layout {
  display: block;
}

body.wizard-mode-active .main-content {
  width: 100%;
  max-width: 100%;
}

/* Global style to hide sidebar when empty state mode is active */
body.empty-state-mode .sidebar {
  display: none !important;
}

body.empty-state-mode .app-layout {
  display: block;
}

body.empty-state-mode .main-content {
  width: 100%;
  max-width: 100%;
  padding: 0;
}

/* Global style to hide sidebar when single agent mode is active */
body.single-agent-mode .sidebar {
  display: none !important;
}

body.single-agent-mode .app-layout {
  display: block;
}

body.single-agent-mode .main-content {
  width: 100%;
  max-width: 100%;
}
</style>
