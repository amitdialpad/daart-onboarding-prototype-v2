# Skill: Vue 3 Development (DAART Prototype)

**Activate when:** Building or modifying Vue 3 components in the DAART prototype

---

## Tech Stack Rules

### Vue 3 Composition API
- Always use `<script setup>` syntax
- Use `ref()` for reactive primitives
- Use `computed()` for derived state
- Use `watch()` for side effects
- Destructure with `.value` when accessing refs

### Component Structure
```vue
<template>
  <!-- HTML here -->
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Props (if needed)
const props = defineProps({
  agent: Object
})

// State
const someState = ref(null)

// Computed
const derivedValue = computed(() => {
  return someState.value?.property
})

// Methods
function handleAction() {
  // logic
}

// Lifecycle
onMounted(() => {
  // initialization
})
</script>

<style scoped>
/* Component-specific styles */
</style>
```

---

## Coding Checklist

### Before Editing
- [ ] Read the entire file first (use Read tool)
- [ ] Check for existing patterns (reactive refs, computed properties)
- [ ] Identify line numbers for precise edits
- [ ] Note the indentation style (spaces vs tabs)

### During Editing
- [ ] Preserve existing indentation exactly
- [ ] Match naming conventions (camelCase for JS, kebab-case for CSS classes)
- [ ] Keep template, script, style sections organized
- [ ] Add comments for complex logic

### After Editing
- [ ] Check dev server for errors (BashOutput tool)
- [ ] Test in browser (localhost:3000)
- [ ] Verify HMR updated correctly
- [ ] Check console for warnings

---

## Common Patterns in This Codebase

### LocalStorage Persistence
```javascript
// Load from localStorage
const agents = ref(JSON.parse(localStorage.getItem('daart_agents_v2') || '[]'))

// Save to localStorage (with auto-save)
const autoSaving = ref(false)
function saveAgent() {
  autoSaving.value = true
  localStorage.setItem('daart_agents_v2', JSON.stringify(agents.value))
  setTimeout(() => autoSaving.value = false, 1000)
}
```

### Router Navigation
```javascript
import { useRouter } from 'vue-router'
const router = useRouter()

// Navigate to workspace
router.push(`/agents-v2/${agent.id}`)

// Navigate with state
router.push({
  path: `/agents-v2/${agent.id}/deploy`,
  query: { from: 'wizard' }
})
```

### Modal Patterns
```javascript
const showModal = ref(false)

function openModal() {
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}
```

### Input Change Tracking
```javascript
function handleInputChange() {
  // Mark as having changes
  hasUnpublishedChanges.value = true

  // Auto-save after delay
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    saveAgent()
  }, 1000)
}
```

---

## CSS Conventions

### Class Naming
- Use kebab-case: `.agent-workspace`, `.btn-primary`
- Follow BEM-ish patterns: `.modal-content`, `.modal-header`, `.modal-close`
- Utility classes: `.btn-*`, `.input-field`, `.hint`

### Layout
- Flexbox for most layouts
- Grid for complex 2D layouts
- Absolute positioning for modals/overlays

### Colors
- Primary action: `#000` (black buttons)
- Secondary: `#666` (gray text)
- Success: `#28a745`
- Warning: `#ff8800`
- Error: `#ea4335`
- Info: `#4285f4`

### Spacing
- Small gap: `8px` or `12px`
- Medium gap: `16px` or `20px`
- Large gap: `24px` or `32px`
- Section margin: `40px`

---

## Edge Cases & Warnings

### LocalStorage Limits
- Max ~5MB per domain
- Always wrap in try/catch
- Handle quota exceeded errors

### Router Edge Cases
- Hash-based routing: URLs use `#/path`
- Refreshing preserves route
- Deep links work correctly

### Reactive Gotchas
- Arrays/objects: Assign new value, don't mutate
  ```javascript
  // ❌ Bad
  agent.value.name = 'new name'

  // ✅ Good
  agent.value = { ...agent.value, name: 'new name' }
  ```

### V-model Two-Way Binding
- Works with ref() automatically
- For nested objects, use computed with getter/setter

---

## Testing Strategy

### Manual Testing Checklist
- [ ] Create new agent (onboarding flow)
- [ ] Edit agent (workspace)
- [ ] Publish agent (deploy flow)
- [ ] Duplicate agent
- [ ] Delete agent
- [ ] Browser refresh (state persists)
- [ ] Console has no errors

### Browser DevTools
- Vue DevTools extension (if installed)
- Check localStorage in Application tab
- Monitor Network tab for API calls (none yet in prototype)
- Console for errors/warnings

---

## File Organization

### Views
- `src/views/` - Full-page components
- Route-level components
- Contain business logic

### Components
- `src/components/` - Reusable UI pieces
- Keep focused (single responsibility)
- Accept props, emit events

### Router
- `src/router/index.js` - Route definitions
- Hash-based (`createWebHashHistory`)

---

## Performance Notes

### When to Use `computed()` vs `ref()`
- `computed()` for derived values (auto-updates when dependencies change)
- `ref()` for direct state

### When to Use `watch()`
- Side effects (API calls, localStorage saves)
- Complex reactions to state changes
- Avoid over-using (prefer computed when possible)

---

## Quick Reference Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check for syntax errors
# (No linter configured yet - visual inspection only)
```

---

## Rollback Procedure

### Before Major Changes
1. Create backup: `cp file.vue file.vue.backup`
2. Git commit current state
3. Note line numbers being changed

### To Rollback
1. `git diff file.vue` - See what changed
2. `git checkout file.vue` - Revert file
3. Or restore from `.backup` file
