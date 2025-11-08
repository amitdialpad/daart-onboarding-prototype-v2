# Design Tools by Josh - Repository Summary

**Repository:** `amitdialpad/design-tools-by-josh`
**Type:** Private monorepo
**Description:** Command line extension and development tools
**URL:** https://github.com/amitdialpad/design-tools-by-josh

---

## Purpose

Central collection of development tools for Dialpad/DAART teams. Each tool is self-contained in its own directory for independent development and deployment.

---

## Available Tools

### 1. **Houston CLI** (`./houston-cli/`)
CLI tool to scaffold Vue projects and components for the UXE Studio

**Key Features:**
- Vue component scaffolding with templates
- Interactive prototype creation
- Dialtone component integration
- Git workflow automation
- Figma Code Connect generation

**Full Documentation:** `/docs/houston_cli.md`

### 2. **CSS Converter** (`./css-converter/`)
Web-based tool for converting between CSS, Tailwind, and Dialtone design tokens

**Key Features:**
- Multi-format conversion (CSS ↔ Tailwind ↔ Dialtone)
- Intelligent format detection
- Color matching with Dialtone tokens
- Typography and spacing conversion
- Copy-to-clipboard functionality

**Full Documentation:** `/docs/css_converter.md`

### 3. **Auto Update Plugin** (`./Auto Update/`)
Figma plugin for automated team deck management and slide generation

**Key Features:**
- Template-based slide generation
- Team assignment management
- Version control for presentations
- Weekly presentation automation

---

## Sparse Checkout Workflow

Since this is a monorepo, use sparse checkout to work on specific tools without cloning everything:

### One-Time Setup for a Tool

```bash
# 1. Clone without checking out files
git clone --filter=blob:none --no-checkout git@github.com:amitdialpad/design-tools-by-josh.git
cd design-tools-by-josh

# 2. Enable sparse checkout for a specific tool
git sparse-checkout set houston-cli
# or: git sparse-checkout set css-converter

# 3. Checkout the main branch
git checkout main
```

Now you have only the tool you need!

### Working with Multiple Tools

```bash
# Add another tool to your sparse checkout
git sparse-checkout add css-converter

# View current sparse checkout config
git sparse-checkout list
```

---

## Integration with DAART Onboarding

### Houston CLI
Use for scaffolding new Vue components in the onboarding flow:
- Create consistent component structure
- Follow UXE Studio patterns
- Include Dialtone components from the start

### CSS Converter
Use for converting onboarding styles to Dialtone tokens:
- Convert existing CSS to Dialtone design tokens
- Map Tailwind classes to Dialtone utilities
- Ensure design system consistency

---

## Quick Reference

| Tool | Purpose | Install | Run |
|------|---------|---------|-----|
| Houston CLI | Component scaffolding | `npm install -g .` | `houston launch` |
| CSS Converter | Style conversion | `npm run dev` | Open in browser |
| Auto Update | Figma automation | Install as Figma plugin | Run from Figma |

---

## Repository Structure

```
design-tools-by-josh/
├── houston-cli/          # CLI tool for Vue scaffolding
│   ├── bin/             # Executable scripts
│   ├── src/             # Source code
│   │   └── templates/   # Component templates
│   ├── README.md
│   └── package.json
├── css-converter/        # Web tool for CSS conversion
│   ├── src/             # Vue application source
│   ├── dist/            # Built files
│   ├── README.md
│   └── package.json
└── Auto Update/          # Figma plugin
    ├── code.js
    ├── README.md
    └── manifest.json
```

---

## Access & Installation

**Repository Access:**
- Repository is private
- Requires Dialpad GitHub organization membership
- Use SSH: `git@github.com:amitdialpad/design-tools-by-josh.git`

**Global Installation (Houston CLI):**
```bash
cd houston-cli
npm install
chmod +x bin/houston.js
npm install -g .
```

**Local Development (CSS Converter):**
```bash
cd css-converter
npm install
npm run dev
```

---

## Related Documentation

- `/docs/houston_cli.md` - Detailed Houston CLI guide
- `/docs/css_converter.md` - CSS Converter usage and features
- `/skills/frontend_dev.md` - How to use these tools in development

---

**Last Updated:** 2025-01-07
**Status:** ✅ Complete with actual repository content
