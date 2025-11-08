# Skill: Frontend Development for DAART

**Purpose:** Build Vue 3 components following Dialpad design system and accessibility standards

---

## Core Directives

### Component Scaffolding
**Use Houston CLI to scaffold Vue components for onboarding**
- Generate components with consistent structure
- Follow established patterns from the start
- Include accessibility attributes by default
- Reference: `/docs/houston_cli.md`

### Styling & Design Tokens
**Use CSS Converter for Dialtone tokens**
- Convert CSS to Dialtone design tokens
- Use semantic token names
- Follow Dialtone utility classes
- Reference: `/docs/css_converter.md`

### Accessibility
**Follow keyboard accessibility rules**
- All interactive elements keyboard accessible
- Proper focus management
- ARIA attributes where needed
- Tab order logical and intuitive

---

## Vue 3 Patterns

### Composition API Structure
```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  // ...
})

// Emits
const emit = defineEmits(['update', 'submit'])

// State
const localState = ref(null)

// Computed
const derivedValue = computed(() => {
  // ...
})

// Watchers
watch(() => props.value, (newVal) => {
  // ...
})

// Lifecycle
onMounted(() => {
  // ...
})

// Methods
function handleAction() {
  // ...
}
</script>
```

### Reactivity Best Practices
- Use `ref()` for primitive values
- Use `reactive()` for objects (sparingly)
- Use `computed()` for derived state
- Avoid mutating props directly
- Use `watch()` for side effects

### Component Communication
- **Props down:** Parent → Child data flow
- **Events up:** Child → Parent with `emit()`
- **Provide/Inject:** Deep component trees
- **Pinia stores:** Global state management

---

## Dialtone Design System

### Token Usage
```css
/* Colors */
background: var(--dt-color-purple-500);
color: var(--dt-color-neutral-900);

/* Spacing */
padding: var(--dt-space-400) var(--dt-space-600);
margin: var(--dt-space-300);
gap: var(--dt-space-400);

/* Typography */
font-size: var(--dt-font-size-300);
font-weight: var(--dt-font-weight-medium);
line-height: var(--dt-line-height-tight);

/* Borders & Radius */
border: 1px solid var(--dt-color-border-subtle);
border-radius: var(--dt-size-radius-300);
```

### Utility Classes
```html
<!-- Spacing -->
<div class="dt-p-400 dt-m-600 dt-gap-300">

<!-- Layout -->
<div class="dt-flex dt-flex-col dt-items-center">

<!-- Colors -->
<div class="dt-bg-surface-primary dt-text-primary">

<!-- Typography -->
<p class="dt-text-300 dt-font-medium">
```

---

## Accessibility Standards

### Keyboard Navigation
```vue
<template>
  <button
    class="dt-button"
    :aria-label="label"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
  >
    {{ text }}
  </button>
</template>
```

### Focus Management
- Use `:focus-visible` for focus styles
- Maintain logical tab order
- Trap focus in modals
- Restore focus after dialogs close

### ARIA Patterns
```html
<!-- Form validation -->
<input
  :aria-describedby="errorId"
  :aria-invalid="hasError"
>
<span :id="errorId" role="alert">{{ errorMessage }}</span>

<!-- Loading states -->
<div role="status" aria-live="polite">
  Loading...
</div>

<!-- Announcements -->
<div role="alert" aria-live="assertive">
  Form submitted successfully!
</div>
```

### Semantic HTML
- Use `<button>` for actions
- Use `<a>` for navigation
- Use `<label>` for form fields
- Use headings in order (h1 → h2 → h3)
- Use lists for grouped items

---

## Component Structure

### File Organization
```
src/
├── components/
│   ├── onboarding/
│   │   ├── WelcomeScreen.vue
│   │   ├── KnowledgeUploader.vue
│   │   └── TestPanel.vue
│   ├── workspace/
│   │   └── TestingPanel.vue
│   └── shared/
│       └── Button.vue
├── views/
│   ├── OnboardingV2View.vue
│   └── AgentsWorkspaceV2View.vue
└── stores/
    └── agents.js
```

### Component Template
```vue
<template>
  <div class="component-name">
    <!-- Component content -->
  </div>
</template>

<script setup>
// Imports, props, state, logic
</script>

<style scoped>
/* Component-specific styles */
/* Use Dialtone tokens */
</style>
```

---

## Testing Considerations

### Manual Testing Checklist
- [ ] Keyboard navigation works
- [ ] Screen reader announcements correct
- [ ] Focus indicators visible
- [ ] All interactive elements reachable
- [ ] Tab order logical
- [ ] ARIA attributes present
- [ ] Color contrast meets WCAG AA
- [ ] Works at 200% zoom

### Browser Testing
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)

---

## Performance

### Best Practices
- Use `v-show` for frequently toggled elements
- Use `v-if` for conditionally rendered content
- Lazy load heavy components
- Debounce search/filter inputs
- Memoize expensive computations

### Code Splitting
```javascript
// Lazy load views
const OnboardingView = () => import('./views/OnboardingV2View.vue')

// Lazy load heavy components
const HeavyChart = defineAsyncComponent(() =>
  import('./components/HeavyChart.vue')
)
```

---

## References

- `/docs/houston_cli.md` - Component scaffolding
- `/docs/css_converter.md` - Design tokens & utilities
- `/docs/project_context.md` - Project architecture
- `README.md` - Setup and development

---

**Last Updated:** 2025-01-07
