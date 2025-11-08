# Agent Hub Testing Guide

## Implementation Complete

All Agent Hub components have been successfully implemented. The implementation includes:

### ✅ Files Created
1. `/src/views/AgentHubView.vue` - Main Agent Hub view
2. `/src/components/agentHub/TrialBanner.vue` - Trial status banner
3. `/src/components/agentHub/AgentHubHeader.vue` - Header with search and create button
4. `/src/components/agentHub/AgentCardGrid.vue` - Grid layout for agent cards
5. `/src/components/agentHub/AgentCard.vue` - Individual agent card with rich info
6. `/src/components/agentHub/AgentHubEmptyState.vue` - Empty state for no agents

### ✅ Files Modified
1. `/src/router/index.js` - Added `/home` route, updated root redirect
2. `/src/components/layout/AppSidebar.vue` - Added Home link with icon

## Testing Instructions

### Test 1: Fresh User (No Agents)
1. Clear localStorage: `localStorage.clear()` in browser console
2. Navigate to `http://localhost:3000`
3. **Expected:** Should redirect to `/onboarding-v2`
4. **Verify:** Onboarding flow starts normally

### Test 2: User with Agents (Existing Flow)
1. Go through onboarding and create at least one agent
2. Once in agent workspace, reload the page or navigate to root `/`
3. **Expected:** Should now redirect to `/home` (Agent Hub) instead of directly to agent workspace
4. **Verify:**
   - Agent Hub displays with trial banner
   - Agent cards show with correct status, icon, stats
   - "Create Agent" button visible in header
   - Sidebar shows "Home" link at top

### Test 3: Empty State
1. Clear agents from localStorage: `localStorage.removeItem('daart-agents')`
2. Manually navigate to `/home`
3. **Expected:** Shows empty state with large emoji and "Create Your First Agent" button
4. **Verify:** Clicking button navigates to `/onboarding-v2`

### Test 4: Single Agent Layout
1. Create 1 agent through onboarding
2. Navigate to `/home`
3. **Expected:**
   - Single column layout (no activity section)
   - No search bar in header
   - Agent card displays correctly
   - Trial banner shows at top

### Test 5: Multiple Agents Layout (3+)
1. Create 3 or more agents
2. Navigate to `/home`
3. **Expected:**
   - Two-column layout appears
   - Agent cards on left (60%)
   - Activity/Recommendations placeholders on right (40%)
   - Search bar appears in header
   - "Your Agents (3)" shows correct count

### Test 6: Agent Card Interactions
1. On Agent Hub with agents, test each card:
   - **Hover:** Card should elevate with shadow and black border
   - **Click card:** Should navigate to appropriate tab based on agent status
   - **Live agent:** Primary button = "Monitor", secondary = "Test"
   - **Draft agent:** Primary button = "Test" or "Deploy" (if tests passed), secondary = "Build"
   - **Three-dot menu:** Click should log to console (not fully implemented yet)

### Test 7: Navigation Flow
1. **From Home to Agent:**
   - Click an agent card → Should go to appropriate workspace tab
   - Sidebar should highlight selected agent
   - Tabs should appear for selected agent
2. **From Agent to Home:**
   - Click "Home" in sidebar → Should return to Agent Hub
   - Previous agent selection should clear
3. **Create Agent from Home:**
   - Click "+ Create Agent" button → Should go to `/onboarding-v2`
   - Complete onboarding → Should go to new agent's workspace
   - Navigate back to Home → New agent should appear in grid

### Test 8: Trial Banner
1. On Agent Hub, verify trial banner shows:
   - Days remaining (default: 12 days)
   - Conversations used/limit (default: 847/1000)
   - "View Usage" button → Should go to `/billing-v2`
   - "Upgrade" button → Should go to `/billing-v2`

### Test 9: Sidebar Home Link
1. **Visual:**
   - Home icon (🏠) appears first in sidebar
   - "Home" text next to icon
   - Agents section appears below Home
2. **Active state:**
   - On `/home` route, Home link should have active background
   - On agent workspace, Home link should not be active
3. **Click behavior:**
   - Click Home from agent workspace → Returns to Agent Hub
   - Click Home when already on home → No change

### Test 10: Responsive Behavior
1. Resize browser window to tablet size (~768px)
   - Two-column layout should collapse to single column
   - Activity section should hide
   - Agent cards should stack vertically
2. Resize to mobile size (~375px)
   - Header should stack vertically
   - Search input should be full width
   - Create button should be full width
   - Trial banner should stack buttons below info

### Test 11: Agent Status Display
Test with different agent states:
1. **Live agent:**
   - Black "Live" badge
   - Shows conversation count and deflection rate
   - Channels displayed (Website, SMS, etc.)
   - Primary action = Monitor
2. **Draft agent (never published):**
   - Gray "Draft" badge
   - Shows "Ready to test" label
   - 0 conversations
   - Primary action = Test
3. **Draft agent (previously published):**
   - Gray "Draft" badge
   - Shows historical conversation data
   - Primary action based on test status

### Test 12: Breaking Nothing (Regression Tests)
1. **Onboarding flow:** Complete onboarding → Should work exactly as before
2. **Agent workspace:** All tabs (Build, Test, Monitor, Deploy) → Should work as before
3. **Sidebar navigation:** All sections (Knowledge, Analytics, Billing, Settings) → Should work as before
4. **Direct URLs:**
   - `/agents-v2/{id}/build` → Should still work
   - `/agents-v2/{id}/test` → Should still work
   - `/agents-v2/{id}/monitor` → Should still work
   - `/agents-v2/{id}/deploy` → Should still work
5. **Agent creation:** Onboarding → Create agent → Save → Should land in workspace as before

## Known Limitations (Phase 1)

1. **Activity Feed:** Placeholder only (shows "Activity feed coming soon")
2. **Recommendations:** Placeholder only (shows "Smart recommendations coming soon")
3. **Search:** Input renders but no filtering logic yet
4. **Three-dot menu:** Logs to console, no dropdown yet
5. **Agent duplication/deletion:** Not yet implemented from Agent Hub
6. **Filters/sorting:** Not yet implemented (planned for Phase 4)

## Success Criteria

✅ All routes work without errors
✅ Users with agents land on Agent Hub instead of first agent workspace
✅ Sidebar Home link appears and navigates correctly
✅ Empty state shows for 0 agents
✅ Agent cards display rich information (status, stats, channels)
✅ Trial banner shows and links to billing
✅ Create Agent button works from Agent Hub
✅ Layout adapts based on agent count (1-2 vs 3+)
✅ All existing functionality continues to work
✅ No console errors
✅ Responsive design works on mobile/tablet

## Next Steps (Phase 2)

After Phase 1 is validated:
1. Implement activity feed with mock data
2. Implement recommendations panel
3. Add search/filter functionality
4. Complete three-dot menu with dropdown
5. Add keyboard shortcuts
6. Performance optimizations

---

**Status:** Phase 1 Complete - Ready for Testing
**Date:** 2025-11-07
**Dev Server:** http://localhost:3000
**Test Route:** http://localhost:3000/#/home
