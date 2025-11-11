# Changelog

All notable changes to the DAART Onboarding Prototype.

## [Latest] - 2025-01-11

### Added - Navigation Restructure (MAJOR UPDATE)
- **Flat Navigation**: Completely restructured sidebar navigation from nested to flat hierarchy
- **Agent Dropdown**: Added agent selector dropdown in header for switching between agents
- **New Routes**: Created dedicated routes for Configuration, Knowledge Sources, and Skills
- **Overview Tab**: Redesigned with Intercom-style getting started checklist for draft agents
- **Notifications Sidebar**: Added right sidebar for notifications on live agent Overview page
- **Reset Demo**: Added Reset Demo option to agent actions menu
- **Last Viewed Agent**: Implemented persistence for last viewed agent across workspace pages

### Changed - Navigation Structure
- **Sidebar Layout**: Changed from nested (expandable sections) to flat (all items visible)
- **Agent Switching**: Moved from sidebar expansion to header dropdown
- **Build Section**: Split into three separate pages (Configuration, Knowledge Sources, Skills)
- **Page Names**: Renamed "Insights" to "Overview", "Proving Ground" to "Evaluate"
- **Default Landing**: Changed default page after onboarding to Overview

### Changed - Overview Page
- **Removed Sub-tabs**: Eliminated Performance, Skill Mining, Security sub-tabs
- **Getting Started**: Added 6-step checklist for draft agents
- **Two-Column Layout**: Metrics on left, notifications on right (for live agents)
- **Simplified Metrics**: Removed time filter, focused on key metrics

### Fixed - Navigation State
- **Prop Watchers**: Added watchers to fix stale data when clicking navigation items
- **State Updates**: Fixed activeBuildSection and insightsSubTab reactive updates
- **Route Redirects**: Ensured all redirects point to correct destinations

### Improved - User Experience
- **Faster Navigation**: No clicking to expand/collapse sections
- **Better Scannability**: All options visible at once
- **Clearer Hierarchy**: Visual divider separates agent-specific from workspace-wide items
- **Industry Standard**: Matches Intercom/Sierra navigation patterns

---

## [Previous] - 2025-01-09

### Added - Sources Page Restructure
- **Two-Section Layout**: Split Sources page into "Connected sources" and "Available sources"
- **Type Grouping**: Connected sources grouped by type (Integrations, Documents, Snippets, Websites, Conversations)
- **Type Labels**: Added uppercase labels for each source type group
- **Empty State**: Clean message when no sources are connected
- **Computed Property**: Added `hasAnyConnectedSources` to check if any sources exist

### Changed - Sources Page
- **Accordion Simplification**: Removed "Connected" subsections from accordions
- **Focus Shift**: Accordions now only show "Add" functionality
- **Visual Hierarchy**: Improved section separation and spacing

### Fixed - Skills UI
- **Horizontal Filters**: Fixed filter dropdowns to display in single horizontal row
- **CSS Improvements**:
  - Added `flex-direction: row` to filter group
  - Added `flex-shrink: 0` to prevent wrapping
  - Set `min-width: 120px` for filter selects

### Fixed - Visual Builder
- **Full-Width Layout**: Visual Builder now uses full available width
- **CSS Selector**: Used `:has()` to detect Visual Builder presence
- **Grid Template**: Changes from `1fr 350px` to `1fr` when Visual Builder active
- **Panel Width**: Increased right panel from 400px to 450px

### Improved - Testing Panel
- **Conditional Display**: Testing panel auto-hides when Visual Builder is active
- **Space Optimization**: Removed empty white space on right side

### Documentation
- **PROJECT_STATUS.md**: Created comprehensive project overview
- **README.md**: Updated with current features and recent changes
- **docs/README.md**: Reorganized as documentation index
- **CHANGELOG.md**: Created this changelog

---

## [Previous] - 2025-01-08

### Added - Inline Custom Input
- **Seamless Input**: "Or describe what you want your agent to do" expands inline
- **No Navigation**: Input appears within empty state, no separate page
- **Continue Button**: Validates and proceeds to method selection
- **Cancel Functionality**: Returns to scenario selection

### Changed - Empty State Flow
- **Single Page**: Scenarios and custom input on same page
- **Progressive Disclosure**: Custom input reveals without navigation
- **Simplified UX**: Reduced clicks and cognitive load

---

## [Previous] - 2025-01-08

### Added - Scenario-Based Onboarding
- **6 Scenarios**: Support, Sales, Scheduling, Orders, HR, Lead Qualification
- **Visual Cards**: Clear scenario cards with descriptions
- **Scenario Storage**: Selected scenario stored in localStorage
- **Quick Start**: One-click scenario selection

### Changed - Empty State
- **Scenario Focus**: Scenarios front and center
- **Secondary Custom**: "Or describe" as secondary option
- **Visual Design**: Cleaner, more focused layout

---

## [Previous] - 2025-01-08

### Added - First Agent Success View
- **Celebration Page**: "Your agent is ready!" success state
- **Summary Sections**: Knowledge base, configuration, channels
- **Next Steps**: Three clear actions (Refine, Test, Deploy)
- **Single-Column Layout**: Centered, focused experience
- **Sidebar Hidden**: Full-screen focus for first agent

### Added - Empty State Redesign
- **Full-Screen**: Empty state takes full viewport
- **Intent Capture**: Large text input for "What do you want your agent to do?"
- **Reset Demo**: Link to clear all data
- **Sidebar Hidden**: Minimalist experience

### Changed - Agent Hub
- **Three States**: Empty, First Agent Success, Multi-Agent
- **State Detection**: Logic to show appropriate view
- **Body Classes**: `empty-state-mode` and `single-agent-mode` for global styling

---

## [Previous] - 2025-01-07

### Added - Multi-Agent Hub
- **Activity Feed**: Recent activities across all agents
- **Recommendation Panel**: Contextual suggestions
- **Trial Banner**: Shows when 2+ agents exist
- **Agent Cards Grid**: Displays all agents

### Changed - Home Page
- **Two-Column Layout**: Agents on left, activity/recommendations on right
- **Conditional Display**: Activity section only shows with multiple agents

---

## [Previous] - 2025-01-07

### Added - Knowledge Base Accordion
- **5 Source Types**: Integrations, Documents, Conversations, Snippets, Websites
- **Connected/Available**: Each type shows connected and available sources
- **File Uploads**: Support for documents and conversations
- **Website Crawling**: URL input with subpage crawling option
- **Text Snippets**: Direct text input with optional titles

### Changed - Sources Section
- **Accordion Interface**: Replaced tabs with accordions
- **Better Organization**: Grouped by source type
- **Visual Indicators**: Count badges for connected sources

---

## [Previous] - 2025-01-06

### Added - Icon Removal
- **Text-Only Design**: Removed all icons from interface
- **Cleaner Look**: Simplified visual design
- **Consistency**: Uniform text-based interface throughout

### Documentation
- **icons_removed_summary.md**: Documented icon removal rationale

---

## [Previous] - 2025-01-05

### Added - Homepage Concepts
- **Design Iterations**: Multiple homepage layout concepts
- **Empty State Ideas**: Various approaches to empty state

### Documentation
- **homepage_concepts.md**: Detailed homepage design exploration
- **design_decisions.md**: Updated with new decisions

---

## [Initial] - 2025-01-05

### Added - Project Foundation
- **Vue 3 Setup**: Composition API, Vue Router, Pinia
- **Basic Structure**: Layout, sidebar, routing
- **Agent Workspace**: Initial workspace implementation
- **Testing Panel**: Side-by-side testing interface
- **LocalStorage**: Prototype persistence
- **GitHub Pages**: Deployment setup

### Documentation
- **README.md**: Initial project documentation
- **DEMO_GUIDE.md**: Demo instructions
- **DEPLOY.md**: Deployment guide
- **docs/**: Initial documentation structure

---

## Legend

- **Added**: New features
- **Changed**: Changes to existing features
- **Fixed**: Bug fixes
- **Removed**: Removed features
- **Improved**: Performance or UX improvements
- **Documentation**: Documentation changes

---

**Format**: Based on [Keep a Changelog](https://keepachangelog.com/)
