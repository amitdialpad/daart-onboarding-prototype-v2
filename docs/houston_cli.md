# Houston CLI - Component Scaffolding Tool

**Source:** `design-tools-by-josh/houston-cli`
**Purpose:** CLI tool to scaffold and maintain Vue component prototypes for UXE Studio
**Status:** ✅ Complete documentation from repository

---

## Overview

Houston CLI streamlines the process of creating and managing Vue component prototypes in a structured way. It provides interactive commands for scaffolding components, managing Git workflows, and integrating with Figma.

---

## Installation

### Global Installation

```bash
# Clone the design-tools repo with sparse checkout
git clone --filter=blob:none --no-checkout git@github.com:amitdialpad/design-tools-by-josh.git
cd design-tools-by-josh
git sparse-checkout set houston-cli
git checkout main

# Install Houston globally
cd houston-cli
npm install
chmod +x bin/houston.js
npm install -g .
```

You'll now have a global `houston` command available.

### Environment Setup (for Figma integration)

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Get your Figma token:**
   - Go to [Figma Settings > Personal Access Tokens](https://www.figma.com/developers/api#access-tokens)
   - Generate a new token
   - Copy the token

3. **Add your token to `.env`:**
   ```bash
   FIGMA_TOKEN=your_actual_figma_token_here
   ```

⚠️ **Never commit `.env` with real tokens!**

---

## Quick Start

### Create a New Prototype

```bash
# Start interactive prototype creator
houston launch

# Follow prompts:
# 1. Enter component name in PascalCase (e.g., "MyButton")
# 2. Add project details (name, status, description)
# 3. Choose template (empty, web, meetings, reference)

# Generated files:
# - prototypes/MyButton.vue
# - prototypes/MyButton.meta.js
```

### Add Components to Prototype

```bash
# Add Dialtone components to existing prototype
houston add

# Follow prompts:
# 1. Select target prototype
# 2. Choose components from Dialtone library
# 3. Components added with proper imports and examples
```

### Example Workflow

```bash
# 1. Create new prototype
houston launch
# > Enter: MyAwesomeFeature
# > Template: web

# 2. Add to version control
houston github
# Follow prompts to create branch and push

# 3. Add Dialtone components
houston add
# Select: Button, Input, etc.
```

---

## Commands

### `houston launch`

Creates a new Vue component prototype interactively.

**Process:**
1. Asks for component name (PascalCase, e.g., `MyComponent`)
2. Requests project details (name, status, description)
3. Generates:
   - `.vue` component in prototypes directory
   - `.meta.js` file with metadata
   - Updates component registry

**Example:**
```bash
$ houston launch
🚀 Creating new prototype...

Component name (PascalCase): KnowledgeUploader
Project name: DAART Onboarding
Status: In Progress
Description: Component for uploading knowledge sources

✓ Created prototypes/KnowledgeUploader.vue
✓ Created prototypes/KnowledgeUploader.meta.js
✓ Updated component registry
```

---

### `houston github`

Automates Git workflow setup.

**Process:**
1. Checks current branch
2. Creates new branch if on `master`
3. Commits uncommitted changes
4. Pushes to remote

**Example:**
```bash
$ houston github
🚀 Setting up Git workflow

✓ Currently on: master

Create new branch? (Y/n) › Y
Branch name: feature/new-button
✓ Switched to: feature/new-button
✓ Created initial commit
✓ Pushed to origin/feature/new-button

Steps completed:
1. Created new branch
2. Switched from master
3. Created initial commit
4. Pushed to GitHub

Ready to code!
```

---

### `houston testing-mode`

Enable/disable sandbox mode for safe testing.

**Enable:**
```bash
houston testing-mode on
# All commands now operate in ./testing/src/
```

**Disable:**
```bash
houston testing-mode off
# Removes testing/ directory and logs
```

All generate/read/write commands operate under `testing/src/` when enabled.

---

### `houston find`

Search and open existing prototype files.

**Usage:**
```bash
houston find <searchTerm>
```

**Process:**
1. Scans prototypes folder for matching filenames (case-insensitive)
2. Shows interactive list
3. Opens selected file in IDE

**Example:**
```bash
$ houston find knowledge
Found 3 prototypes:
1. KnowledgeUploader.vue
2. KnowledgePanel.vue
3. KnowledgeBase.vue

Select file to open: 1
✓ Opening KnowledgeUploader.vue
```

---

### `houston webify`

Fetch Figma component properties and generate Code Connect files.

**Usage:**
```bash
houston webify <componentName> --figma <figmaUrl>
```

**Requires:** `FIGMA_TOKEN` environment variable

**Process:**
1. Fetches component data from Figma API
2. Generates `.json` with metadata
3. Creates `.js` with Code Connect config

**Example:**
```bash
$ houston webify Button --figma "https://www.figma.com/design/abc123/Component?node-id=1-23"

✓ Fetched component from Figma
✓ Generated Button.json
✓ Generated Button.js (Code Connect)
```

---

### `houston clean`

Reverts all Houston-created changes.

**Usage:**
```bash
houston clean
```

**Reverts:**
- Created prototype files (.vue, .meta.js)
- Component registry updates
- Generated thumbnails
- Testing mode files

⚠️ **Cannot be undone** - backup important changes first!

---

## Folder Structure

### Templates (source)
```
src/
  templates/
    prototypes/
      EmptyTemplate.vue
      WebTemplate.vue
      MeetingsTemplate.vue
      ReferenceTemplate.vue
```

### Generated Output (real mode)
```
[PROJECT_ROOT]/
  src/
    prototypes/           # .vue + .meta.js + state.js
    data/
      components.js       # Updated by addElement
      dialtone-components.json
  public/
    components/          # Generated thumbnails
      light/
      dark/
```

### Generated Output (testing mode)
```
testing/
  prototypes/           # Test prototypes
  data/
  public/
.houston-log           # Tracking file
```

---

## Integration with DAART Onboarding

### Use Cases

**1. Scaffold Onboarding Components**
```bash
# Create knowledge upload component
houston launch
# Name: KnowledgeUploader
# Template: web

# Result: Clean Vue 3 component with:
# - Composition API setup
# - Proper imports
# - Template structure
# - Dialtone styling
```

**2. Add Dialtone Components**
```bash
# Add Button, Input, FileUpload to prototype
houston add

# Automatically adds:
# - Import statements
# - Usage examples
# - Props configuration
# - Event handlers
```

**3. Maintain Git Workflow**
```bash
# Create feature branch for new onboarding step
houston github

# Handles:
# - Branch creation
# - Initial commit
# - Push to remote
```

### Best Practices

**Component Naming:**
- Use PascalCase: `KnowledgeUploader`, `TestingPanel`
- Be descriptive: `OnboardingWelcomeScreen` vs `Welcome`
- Follow Vue conventions

**Template Selection:**
- **empty**: Minimal boilerplate
- **web**: Standard web app component
- **meetings**: Meeting-specific features
- **reference**: Example with patterns

**Workflow:**
1. Use Houston for initial scaffold
2. Customize in your IDE
3. Add Dialtone components as needed
4. Use `houston github` for version control

---

## Testing

### Manual Testing Workflow

```bash
# 1. Enable sandbox
houston testing-mode on

# 2. Test commands
houston launch
# ... create test prototype

houston find TestProto
# ... verify file opens

houston clean
# ... verify cleanup works

# 3. Disable sandbox
houston testing-mode off
```

All files (components, metadata, images, logs) created in `testing/` and removed on disable.

---

## Troubleshooting

### Command Not Found
```bash
# Reinstall globally
cd houston-cli
npm install -g .
```

### Figma Integration Not Working
```bash
# Verify token in .env
cat .env
# Should show: FIGMA_TOKEN=figd_...

# Test token:
curl -H "X-Figma-Token: YOUR_TOKEN" \
  "https://api.figma.com/v1/me"
```

### Testing Mode Stuck
```bash
# Force disable
rm -rf testing/
rm .houston-log
```

---

## Uninstallation

```bash
npm uninstall -g houston-cli
```

---

## Related Documentation

- `/docs/repo_design_tools.md` - Full repository overview
- `/docs/css_converter.md` - Style conversion tool
- `/skills/frontend_dev.md` - Frontend development patterns
- `/skills/plan_execution.md` - Phased implementation guide

---

**Last Updated:** 2025-01-07
**Status:** ✅ Complete with actual repository content
