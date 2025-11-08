# CSS Converter - Dialtone Token Converter

**Source:** `design-tools-by-josh/css-converter`
**Purpose:** Web tool for converting between CSS, Tailwind, and Dialtone design tokens
**Status:** ✅ Complete documentation from repository

---

## Overview

CSS Converter is a web-based tool built with Vue.js that streamlines the process of migrating styles to the Dialtone design system. It intelligently detects input format and provides accurate conversions with copy-to-clipboard functionality.

---

## Features

### 🔄 Multi-Format Conversion
- **CSS → Dialtone**: Convert standard CSS properties to Dialtone tokens
- **Tailwind → Dialtone**: Convert Tailwind utilities to Dialtone equivalents
- **Dialtone → CSS**: Convert Dialtone classes back to standard CSS

### 🎯 Intelligent Processing
- **Smart Format Detection**: Auto-detects CSS vs Tailwind vs Dialtone
- **Color Matching**: Finds closest Dialtone colors via RGB distance
- **Typography Conversion**: Maps font-size, weight, line-height, family
- **Spacing & Layout**: Converts margin, padding, width, height properties

### 🛠️ Developer Features
- **Copy-to-Clipboard**: One-click copying of converted code
- **Documentation Links**: Direct links to Dialtone docs for unsupported properties
- **Visual Feedback**: Clear indication of supported vs unsupported conversions
- **Configurable Base Font**: Adjustable for rem unit calculations

---

## Installation

### Prerequisites
- Node.js (latest LTS)
- npm (included with Node.js)

### Local Development

```bash
# Clone with sparse checkout
git clone --filter=blob:none --no-checkout git@github.com:amitdialpad/design-tools-by-josh.git
cd design-tools-by-josh
git sparse-checkout set css-converter
git checkout main

# Install and run
cd css-converter
npm install
npm run dev  # Opens in browser
```

### Production Build

```bash
npm run build
# Output in ./dist/
```

---

## Usage

### Basic Conversion

1. Open CSS Converter in browser
2. Paste CSS, Tailwind, or Dialtone code into input
3. Tool auto-detects format and shows conversions
4. Click any result to copy to clipboard

### Input Examples

**CSS Input:**
```css
color: #1c1c1c;
font-size: 16px;
font-weight: 600;
margin: 8px 16px;
padding: 12px;
border-radius: 8px;
background: #6B46E5;
```

**Tailwind Input:**
```
text-gray-900 text-base font-semibold m-2 mx-4 p-3 rounded-lg bg-purple-600
```

**Dialtone Input:**
```
d-fc-primary d-fs-300 d-fw-semibold d-m-200 d-mx-400 d-p-300 d-br-300 d-bgc-purple-400
```

### Advanced Options

- **Base Font Size**: Adjust for rem calculations (default: 16px)
- **Include rem Units**: Toggle rem output alongside Dialtone tokens

---

## Dialtone Design Tokens Reference

### Color Tokens

#### Foreground Colors (`d-fc-*`)
```css
d-fc-primary      → var(--dt-color-foreground-primary)    /* #1c1c1c */
d-fc-secondary    → var(--dt-color-foreground-secondary)  /* #666666 */
d-fc-tertiary     → var(--dt-color-foreground-tertiary)   /* #999999 */
d-fc-disabled     → var(--dt-color-foreground-disabled)   /* #c2c2c2 */
```

#### Background Colors (`d-bgc-*`)
```css
d-bgc-primary     → var(--dt-color-surface-primary)      /* #ffffff */
d-bgc-secondary   → var(--dt-color-surface-secondary)    /* #fafafa */
d-bgc-tertiary    → var(--dt-color-surface-tertiary)     /* #f5f5f5 */
```

#### Brand Colors
```css
d-bgc-purple-400  → var(--dt-color-purple-400)  /* #7C52FF */
d-bgc-purple-500  → var(--dt-color-purple-500)  /* #6B46E5 */
d-bgc-purple-600  → var(--dt-color-purple-600)  /* #5A3BC4 */
```

#### Semantic Colors
```css
d-fc-success      → var(--dt-color-foreground-success)   /* Green */
d-fc-critical     → var(--dt-color-foreground-critical)  /* Red */
d-fc-warning      → var(--dt-color-foreground-warning)   /* Orange */
d-fc-info         → var(--dt-color-foreground-info)      /* Blue */
```

### Typography Tokens

#### Font Sizes (`d-fs-*`)
```css
d-fs-100    → var(--dt-font-size-100)  /* 11px */
d-fs-200    → var(--dt-font-size-200)  /* 13px */
d-fs-300    → var(--dt-font-size-300)  /* 16px (base) */
d-fs-400    → var(--dt-font-size-400)  /* 18px */
d-fs-500    → var(--dt-font-size-500)  /* 20px */
d-fs-600    → var(--dt-font-size-600)  /* 24px */
d-fs-700    → var(--dt-font-size-700)  /* 32px */
```

#### Font Weights (`d-fw-*`)
```css
d-fw-normal      → var(--dt-font-weight-normal)      /* 400 */
d-fw-medium      → var(--dt-font-weight-medium)      /* 500 */
d-fw-semibold    → var(--dt-font-weight-semibold)    /* 600 */
d-fw-bold        → var(--dt-font-weight-bold)        /* 700 */
```

#### Line Heights (`d-lh-*`)
```css
d-lh-100    → var(--dt-line-height-100)  /* 1.0 (tight) */
d-lh-200    → var(--dt-line-height-200)  /* 1.2 */
d-lh-300    → var(--dt-line-height-300)  /* 1.4 */
d-lh-400    → var(--dt-line-height-400)  /* 1.5 (normal) */
d-lh-500    → var(--dt-line-height-500)  /* 1.6 */
```

#### Font Families (`d-ff-*`)
```css
d-ff-sans       → var(--dt-font-family-sans)       /* Inter, system-ui */
d-ff-mono       → var(--dt-font-family-mono)       /* 'Roboto Mono' */
```

### Spacing Tokens (`d-m-*`, `d-p-*`)

```css
d-m-100     → var(--dt-space-100)     /* 2px */
d-m-200     → var(--dt-space-200)     /* 4px */
d-m-300     → var(--dt-space-300)     /* 8px */
d-m-400     → var(--dt-space-400)     /* 12px */
d-m-500     → var(--dt-space-500)     /* 16px */
d-m-600     → var(--dt-space-600)     /* 24px */
d-m-700     → var(--dt-space-700)     /* 32px */
d-m-800     → var(--dt-space-800)     /* 48px */

/* Directional spacing */
d-mt-400    → margin-top: var(--dt-space-400)
d-mr-400    → margin-right: var(--dt-space-400)
d-mb-400    → margin-bottom: var(--dt-space-400)
d-ml-400    → margin-left: var(--dt-space-400)
d-mx-400    → margin-left/right: var(--dt-space-400)
d-my-400    → margin-top/bottom: var(--dt-space-400)

/* Same pattern for padding (d-p-*) */
```

### Border & Radius Tokens

```css
/* Border Radius */
d-br-100    → var(--dt-size-radius-100)  /* 2px */
d-br-200    → var(--dt-size-radius-200)  /* 4px */
d-br-300    → var(--dt-size-radius-300)  /* 6px */
d-br-400    → var(--dt-size-radius-400)  /* 8px */
d-br-circle → border-radius: 50%

/* Border Colors */
d-bc-default   → var(--dt-color-border-default)
d-bc-subtle    → var(--dt-color-border-subtle)
```

---

## Conversion Examples

### Example 1: Button Styles

**Before (CSS):**
```css
.button {
  background: #6B46E5;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
}
```

**After (Dialtone):**
```css
.button {
  background: var(--dt-color-purple-500);
  color: var(--dt-color-surface-primary);
  padding: var(--dt-space-400) var(--dt-space-600);
  border-radius: var(--dt-size-radius-400);
  font-size: var(--dt-font-size-300);
  font-weight: var(--dt-font-weight-semibold);
  border: none;
}
```

**Or with Utility Classes:**
```html
<button class="d-bgc-purple-500 d-fc-primary d-p-400 d-px-600 d-br-400 d-fs-300 d-fw-semibold">
  Click me
</button>
```

### Example 2: Card Component

**Before (Tailwind):**
```
bg-white p-6 rounded-lg shadow-md border border-gray-200
```

**After (Dialtone):**
```
d-bgc-primary d-p-600 d-br-400 d-shadow-300 d-bc-default d-b-100
```

### Example 3: Typography

**Before (CSS):**
```css
.heading {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: #1c1c1c;
}
```

**After (Dialtone):**
```css
.heading {
  font-size: var(--dt-font-size-700);
  font-weight: var(--dt-font-weight-bold);
  line-height: var(--dt-line-height-200);
  color: var(--dt-color-foreground-primary);
}
```

---

## Integration with DAART Onboarding

### Workflow for Converting Existing Styles

1. **Extract CSS from current components**
   ```bash
   # Open OnboardingV2View.vue
   # Copy <style> section
   ```

2. **Paste into CSS Converter**
   - Tool detects CSS format
   - Shows Dialtone token conversions
   - Highlights unsupported properties

3. **Copy converted tokens**
   - Click to copy individual properties
   - Or copy entire converted block

4. **Update component styles**
   ```vue
   <style scoped>
   /* Replace with Dialtone tokens */
   .button {
     background: var(--dt-color-purple-500);
     padding: var(--dt-space-400) var(--dt-space-600);
   }
   </style>
   ```

### Using with Houston CLI

```bash
# 1. Generate component with Houston
houston launch
# Name: MyComponent

# 2. Write initial styles in standard CSS
# 3. Convert to Dialtone tokens with CSS Converter
# 4. Update component with converted tokens
```

---

## Keyboard Accessibility Integration

When using Dialtone components, follow these accessibility patterns:

### Focus States
```css
/* Focus indicators with Dialtone */
.button:focus-visible {
  outline: 2px solid var(--dt-color-purple-500);
  outline-offset: 2px;
}
```

### Interactive Elements
```vue
<button
  class="d-bgc-purple-500 d-fc-primary d-p-400 d-br-400"
  :aria-label="label"
  @click="handleClick"
  @keydown.enter="handleClick"
  @keydown.space.prevent="handleClick"
>
  {{ text }}
</button>
```

### Form Inputs
```vue
<input
  class="d-bc-default d-br-300 d-p-300 d-fs-300"
  :aria-describedby="errorId"
  :aria-invalid="hasError"
  @focus="handleFocus"
/>
```

---

## Deployment

### GitHub Pages Deployment

The CSS Converter is deployed to GitHub Pages from the monorepo:

```bash
# 1. Build the application
cd css-converter
npm run build

# 2. Copy build artifacts
cp -r dist/* .

# 3. Commit changes
git add .
git commit -m "Update CSS converter"
git push origin main

# 4. Deploy to GitHub Pages (from repo root)
cd ..
git subtree push --prefix css-converter origin gh-pages
```

The converter is then accessible at the GitHub Pages URL.

---

## Technical Details

### Architecture
- **Vue 3 Composition API**: Modern reactive framework
- **TypeScript**: Type safety
- **Dialtone Design System**: Official Dialpad tokens

### Conversion Engine
- **Static Mapping System**: Comprehensive property-to-token maps
- **Color Distance Algorithm**: RGB-based closest match calculation
- **Typography Scaling**: Pixel-to-token conversion with fallbacks
- **Pattern Recognition**: Smart CSS vs Tailwind vs Dialtone detection

### Key Files
- **CssConverter.vue**: Main conversion interface
- **staticMappings.js**: Token mappings and conversion logic
- **Color Processing**: Hex normalization and matching
- **Typography Processing**: Font property conversion

---

## Related Documentation

- `/docs/repo_design_tools.md` - Full repository overview
- `/docs/houston_cli.md` - Component scaffolding tool
- `/skills/frontend_dev.md` - Frontend development patterns with Dialtone
- [Dialtone Docs](https://dialtone.dialpad.com/) - Official design system documentation

---

**Last Updated:** 2025-01-07
**Status:** ✅ Complete with actual repository content
