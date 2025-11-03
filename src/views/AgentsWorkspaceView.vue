<template>
  <div class="workspace-container">
    <!-- Top Navigation -->
    <div class="top-nav">
      <div class="nav-left">
        <div class="app-title">Dialpad Agents</div>
      </div>
      <div class="nav-tabs">
        <button class="nav-tab active">AGENTS</button>
        <button class="nav-tab" @click="goTo('/insights')">ANALYTICS</button>
        <button class="nav-tab" @click="goTo('/billing')">BILLING</button>
      </div>
      <div class="nav-right">
        <div class="profile-dropdown" @click="toggleProfileMenu">
          <span class="profile-email">admin@company.com</span>
          <span class="dropdown-arrow">{{ showProfileMenu ? '▲' : '▼' }}</span>
          <div v-if="showProfileMenu" class="dropdown-menu" @click.stop>
            <button class="dropdown-item" @click="goTo('/settings')">Settings</button>
            <button class="dropdown-item" @click="signOut">Sign Out</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Layout: Content Only -->
    <div class="main-layout">
      <!-- Agent Workspace -->
      <div class="content-area">
        <div v-if="agents.length === 0" class="no-selection">
          <div class="no-selection-content">
            <h2>No Agents Yet</h2>
            <p>Create your first agent to get started</p>
            <button class="btn-primary" @click="createNewAgent">+ Create First Agent</button>
          </div>
        </div>

        <div v-else class="agent-workspace">
          <!-- Agent Header with Selector -->
          <div class="workspace-header">
            <div class="workspace-header-left">
              <!-- Agent Selector Dropdown -->
              <div class="agent-selector-wrapper">
                <label class="agent-selector-label">Agent:</label>
                <div class="agent-selector" @click="toggleAgentDropdown">
                  <div class="agent-selector-current">
                    <div class="agent-status-dot" :class="selectedAgent?.status"></div>
                    <span class="agent-selector-name">{{ selectedAgent?.name || 'Select Agent' }}</span>
                    <span class="agent-selector-arrow">▼</span>
                  </div>

                  <!-- Dropdown Menu -->
                  <div v-if="showAgentDropdown" class="agent-dropdown" @click.stop>
                    <div v-for="agent in agents"
                         :key="agent.id"
                         class="agent-dropdown-item"
                         :class="{ active: selectedAgentId === agent.id }"
                         @click="selectAgentFromDropdown(agent.id)">
                      <div class="agent-status-dot" :class="agent.status"></div>
                      <div class="agent-dropdown-info">
                        <div class="agent-dropdown-name">{{ agent.name }}</div>
                        <div class="agent-dropdown-meta">
                          {{ channelLabel(agent.channel) }}
                          <span v-if="agent.channel === 'web-chat' && agent.smsEnabled" class="multi-channel-badge">+SMS</span>
                        </div>
                      </div>
                    </div>
                    <div class="agent-dropdown-divider"></div>
                    <div class="agent-dropdown-item new-agent" @click="createNewAgentFromDropdown">
                      <span class="new-agent-icon">+</span>
                      <span>Create New Agent</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="selectedAgent" class="agent-meta">
                <span class="meta-status" :class="selectedAgent.status">
                  {{ selectedAgent.statusText }}
                </span>
                <span class="meta-separator">·</span>
                <span>
                  {{ channelLabel(selectedAgent.channel) }}
                  <span v-if="selectedAgent.channel === 'web-chat' && selectedAgent.smsEnabled" class="multi-channel-badge">+SMS</span>
                </span>
                <span class="meta-separator">·</span>
                <span v-if="autoSaveStatus" class="auto-save-status" :class="autoSaveStatus">
                  {{ autoSaveStatus === 'saving' ? 'Saving...' : 'Saved' }}
                </span>
                <span v-else>Updated {{ selectedAgent.lastUpdated }}</span>
              </div>
            </div>
            <div class="workspace-header-right">
              <!-- Agent Actions Menu -->
              <div v-if="selectedAgent" class="agent-actions-menu" ref="actionsMenu">
                <button class="btn-icon-only" @click="toggleActionsMenu" title="Agent actions">
                  <span class="three-dots">⋮</span>
                </button>
                <div v-if="showActionsMenu" class="actions-dropdown">
                  <button class="dropdown-action" @click="duplicateAgent">
                    Duplicate Agent
                  </button>
                  <button class="dropdown-action delete" @click="confirmDeleteAgent">
                    Delete Agent
                  </button>
                </div>
              </div>

              <button v-if="selectedAgent && selectedAgent.status === 'draft'"
                      class="btn-primary"
                      @click="openDeployCheckout">
                {{ selectedAgent.hasBeenPublished ? 'Republish Agent' : 'Deploy Agent' }}
              </button>
              <button v-else-if="selectedAgent && selectedAgent.status === 'published'"
                      class="btn-secondary"
                      @click="unpublishAgent">
                Unpublish
              </button>
            </div>
          </div>

          <!-- Success Notification -->
          <div v-if="notification" class="notification" :class="notification.type">
            {{ notification.message }}
          </div>

          <!-- Workspace Tabs (only show for draft agents) -->
          <div v-if="selectedAgent && selectedAgent.status === 'draft'" class="workspace-tabs">
            <button v-for="tab in tabs"
                    :key="tab.id"
                    class="workspace-tab"
                    :class="{ active: activeTab === tab.id }"
                    @click="handleTabClick(tab.id)">
              {{ tab.label }}
              <span v-if="tab.id === 'monitor' && unreadConversationCount > 0" class="tab-badge">
                {{ unreadConversationCount }}
              </span>
            </button>
          </div>

          <!-- Published Agent Dashboard (no tabs) -->
          <div v-if="selectedAgent && selectedAgent.status === 'published'" class="published-dashboard">
            <div class="dashboard-layout">
              <!-- Main Dashboard Content -->
              <div class="dashboard-main">
                <!-- Status & Metrics -->
                <div class="dashboard-header">
                  <div class="dashboard-status">
                    <div class="status-indicator live"></div>
                    <div class="status-text">
                      <h2>Agent is Live</h2>
                      <p>Handling conversations across all configured channels</p>
                    </div>
                  </div>
                </div>

                <!-- Key Metrics -->
                <div class="metrics-grid">
                  <div class="metric-card">
                    <div class="metric-label">Total Conversations</div>
                    <div class="metric-value">{{ conversationHistory.length }}</div>
                    <div class="metric-change">+12 today</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">This Month Cost</div>
                    <div class="metric-value">${{ (conversationHistory.length * 0.50).toFixed(2) }}</div>
                    <div class="metric-sublabel">{{ conversationHistory.length }} conversations at $0.50 each</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">Deflection Rate</div>
                    <div class="metric-value">{{ selectedAgent.deflectionRate || 0 }}%</div>
                    <div class="metric-change">+5% vs last month</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">Customer Satisfaction</div>
                    <div class="metric-value">{{ selectedAgent.satisfaction || '4.8' }}</div>
                    <div class="metric-sublabel">Based on user ratings</div>
                  </div>
                </div>

                <!-- Analytics & Performance -->
                <div class="analytics-summary-section">
                  <div class="section-header">
                    <h3>Performance & Analytics</h3>
                    <button class="btn-link" @click="goTo('/insights')">View Detailed Analytics</button>
                  </div>
                  <div class="analytics-quick-stats">
                    <div class="quick-stat">
                      <span class="stat-label">Avg. Response Time</span>
                      <span class="stat-value">1.2s</span>
                    </div>
                    <div class="quick-stat">
                      <span class="stat-label">Resolution Rate</span>
                      <span class="stat-value">{{ selectedAgent.deflectionRate || 0 }}%</span>
                    </div>
                    <div class="quick-stat">
                      <span class="stat-label">Active Channels</span>
                      <span class="stat-value">{{ selectedAgent.channels?.length || 1 }}</span>
                    </div>
                  </div>
                </div>

                <!-- Cost Summary with Link to Billing -->
                <div class="cost-summary-section">
                  <div class="section-header">
                    <h3>Cost Summary</h3>
                    <button class="btn-link" @click="goTo('/billing')">View Full Billing</button>
                  </div>
                  <div class="cost-details">
                    <div class="cost-row">
                      <span>Current Credit Balance</span>
                      <span class="cost-value">$445.00</span>
                    </div>
                    <div class="cost-row">
                      <span>Spent This Month</span>
                      <span class="cost-value">${{ (conversationHistory.length * 0.50).toFixed(2) }}</span>
                    </div>
                    <div class="cost-row">
                      <span>Estimated Remaining Conversations</span>
                      <span class="cost-value">{{ Math.floor(445 / 0.50) }}</span>
                    </div>
                  </div>
                  <div class="cost-note">
                    Your agents will pause when credits run out. No automatic charges.
                  </div>
                </div>

                <!-- Recent Conversations -->
                <div class="recent-conversations-section">
                  <h3>Recent Conversations</h3>
                  <div v-if="conversationHistory.length > 0" class="conversations-list">
                    <div v-for="conv in conversationHistory.slice(0, 5)"
                         :key="conv.id"
                         class="conversation-card">
                      <div class="conversation-header">
                        <div class="conversation-meta">
                          <span class="conversation-channel">{{ conv.type === 'quick-test' ? '📱 Web Chat' : '📞 Phone' }}</span>
                          <span v-if="conv.scenario" class="conversation-scenario">{{ conv.scenario }}</span>
                        </div>
                        <div class="conversation-time">{{ formatTimestamp(conv.timestamp) }}</div>
                      </div>
                      <div class="conversation-preview">
                        <div class="preview-message user">
                          <strong>User:</strong> {{ conv.messages[0]?.text }}
                        </div>
                        <div class="preview-message agent">
                          <strong>Agent:</strong> {{ conv.messages[1]?.text }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="no-conversations">
                    <p>No conversations yet. Your agent is live and ready to handle requests.</p>
                  </div>
                </div>
              </div>

              <!-- Live Agent Panel (right side) -->
              <div class="live-agent-panel">
                <div class="live-agent-header">
                  <h4>Live Agent</h4>
                  <span class="live-badge">LIVE</span>
                </div>

                <!-- Digital Agent (Chat/SMS) -->
                <div v-if="primaryChannel !== 'phone'" class="live-agent-content">
                  <div class="test-chat">
                    <div class="test-messages">
                      <div v-for="msg in testMessages"
                           :key="msg.id"
                           class="test-message"
                           :class="msg.sender">
                        {{ msg.text }}
                      </div>
                      <div v-if="quickTestLoading" class="test-message agent typing">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                      </div>
                      <div v-if="testMessages.length === 0 && !quickTestLoading" class="test-suggestions">
                        <div class="suggestions-label">Test your live agent:</div>
                        <div class="suggestions-chips">
                          <button v-for="suggestion in quickTestSuggestions"
                                  :key="suggestion"
                                  class="suggestion-chip"
                                  @click="sendSuggestion(suggestion)">
                            {{ suggestion }}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="test-input">
                      <input v-model="quickTestMsg"
                             type="text"
                             placeholder="Test the live agent..."
                             @keyup.enter="sendQuickTest"
                             :disabled="quickTestLoading"
                             class="input-field">
                      <button @click="sendQuickTest" :disabled="quickTestLoading" class="btn-send">
                        {{ quickTestLoading ? 'Sending...' : 'Send' }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Voice Agent -->
                <div v-else class="live-agent-content">
                  <div class="voice-test-panel">
                    <div class="voice-test-status">
                      <div class="voice-status-indicator" :class="voiceCallStatus">
                        <div class="status-dot"></div>
                        <span>{{ voiceCallStatusText }}</span>
                      </div>
                      <div class="voice-test-info">
                        <div class="info-row">
                          <span class="info-label">Live Number:</span>
                          <span class="info-value">+1 (555) 0100</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Duration:</span>
                          <span class="info-value">{{ voiceCallDuration }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="voice-test-actions">
                      <button v-if="voiceCallStatus === 'idle'"
                              class="btn-voice-call"
                              @click="startVoiceTest">
                        Test Live Agent
                      </button>
                      <button v-else-if="voiceCallStatus === 'connected'"
                              class="btn-voice-end"
                              @click="endVoiceTest">
                        End Call
                      </button>
                      <div v-else-if="voiceCallStatus === 'connecting'" class="voice-connecting">
                        <div class="loading-dots">
                          <span class="dot"></span>
                          <span class="dot"></span>
                          <span class="dot"></span>
                        </div>
                        Connecting...
                      </div>
                    </div>

                    <div class="voice-test-transcript">
                      <div class="transcript-header">Live Transcript</div>
                      <div class="transcript-messages">
                        <div v-for="msg in voiceTranscript"
                             :key="msg.id"
                             class="transcript-message"
                             :class="msg.speaker">
                          <div class="transcript-speaker">{{ msg.speaker === 'user' ? 'You' : 'Agent' }}</div>
                          <div class="transcript-text">{{ msg.text }}</div>
                          <div class="transcript-time">{{ msg.timestamp }}</div>
                        </div>
                        <div v-if="voiceTranscript.length === 0" class="transcript-empty">
                          Start a test call to see the transcript
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Content (only for draft agents) -->
          <div v-if="selectedAgent && selectedAgent.status === 'draft'" class="tab-content-area">
            <!-- BUILD Tab -->
            <div v-if="activeTab === 'build'" class="tab-panel">
              <div class="build-layout">
                <!-- Section Navigator -->
                <div class="build-sections-nav">
                  <div v-for="section in buildSections"
                       :key="section.id"
                       class="section-nav-item"
                       :class="{ active: activeBuildSection === section.id }"
                       @click="scrollToBuildSection(section.id)">
                    {{ section.label }}
                  </div>
                </div>

                <!-- Main Content Area -->
                <div class="build-main" ref="buildMainContent">
                  <!-- COMPASS Validation Panel (shows on all sections) -->
                  <div v-if="validationMessages.length > 0" class="validation-panel">
                    <div class="validation-header" @click="validationExpanded = !validationExpanded">
                      <div class="validation-title">
                        <span class="validation-icon">⚠️</span>
                        <span>COMPASS Validation ({{ validationMessages.length }} {{ validationMessages.length === 1 ? 'issue' : 'issues' }})</span>
                      </div>
                      <button class="validation-toggle">{{ validationExpanded ? '−' : '+' }}</button>
                    </div>
                    <div v-if="validationExpanded" class="validation-content">
                      <div v-for="msg in validationMessages"
                           :key="msg.id"
                           class="validation-message"
                           :class="msg.severity">
                        <div class="validation-msg-header">
                          <span class="validation-severity">{{ msg.severity.toUpperCase() }}</span>
                          <span class="validation-field">{{ msg.field }}</span>
                        </div>
                        <div class="validation-msg-text">{{ msg.message }}</div>
                      </div>
                    </div>
                  </div>

                  <!-- Configuration Section -->
                  <div v-if="selectedAgent" id="configuration" class="config-section build-section-anchor">
                    <h3>Configuration</h3>

                    <div class="form-group">
                      <label>Agent Name</label>
                      <input v-model="selectedAgent.name" type="text" class="input-field">
                    </div>

                    <div class="form-group">
                      <label>Description</label>
                      <textarea v-model="selectedAgent.description" rows="2" class="input-field"></textarea>
                    </div>

                    <div class="form-group">
                      <label>Behavior Instructions</label>
                      <textarea v-model="selectedAgent.instructions" rows="6" class="input-field"></textarea>
                      <div class="hint">Guide how your agent should respond to customers</div>
                    </div>
                  </div>

                  <!-- Chat Configuration Section (only for web-chat agents) -->
                  <div v-if="primaryChannel === 'web-chat'" id="chat-configuration" class="config-section build-section-anchor">
                    <h3>Chat Configuration</h3>

                    <!-- Widget Appearance -->
                      <div class="collapsible-section">
                        <div class="collapsible-header" @click="toggleConfigSection('chatAppearance')">
                          <span class="section-title">Widget Appearance</span>
                          <span class="chevron" :class="{ expanded: configSections.chatAppearance }">›</span>
                        </div>
                        <div v-if="configSections.chatAppearance" class="collapsible-content">
                          <div class="form-group">
                            <label>Primary Color</label>
                            <div class="color-picker-group">
                              <input v-model="selectedAgent.chatConfig.primaryColor"
                                     type="color"
                                     class="color-input">
                              <input v-model="selectedAgent.chatConfig.primaryColor"
                                     type="text"
                                     class="input-field color-text"
                                     placeholder="#000000">
                            </div>
                            <div class="hint">Main color for the chat widget</div>
                          </div>

                          <div class="form-group">
                            <label>Widget Position</label>
                            <select v-model="selectedAgent.chatConfig.widgetPosition" class="input-field">
                              <option value="bottom-right">Bottom Right</option>
                              <option value="bottom-left">Bottom Left</option>
                              <option value="top-right">Top Right</option>
                              <option value="top-left">Top Left</option>
                            </select>
                          </div>

                          <div class="form-group">
                            <label>Agent Display Name</label>
                            <input v-model="selectedAgent.chatConfig.displayName"
                                   type="text"
                                   class="input-field"
                                   placeholder="Support Assistant">
                            <div class="hint">Name shown to customers in the chat widget</div>
                          </div>

                          <div class="form-group">
                            <label>Widget Size</label>
                            <select v-model="selectedAgent.chatConfig.widgetSize" class="input-field">
                              <option value="compact">Compact</option>
                              <option value="standard">Standard</option>
                              <option value="large">Large</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <!-- Messages & Greetings -->
                      <div class="collapsible-section">
                        <div class="collapsible-header" @click="toggleConfigSection('chatMessages')">
                          <span class="section-title">Messages & Greetings</span>
                          <span class="chevron" :class="{ expanded: configSections.chatMessages }">›</span>
                        </div>
                        <div v-if="configSections.chatMessages" class="collapsible-content">
                          <div class="form-group">
                            <label>Welcome Message</label>
                            <textarea v-model="selectedAgent.chatConfig.welcomeMessage"
                                      rows="2"
                                      class="input-field"
                                      placeholder="Hi! How can I help you today?"></textarea>
                            <div class="hint">First message when the chat widget opens</div>
                          </div>

                          <div class="form-group">
                            <label>
                              <input type="checkbox" v-model="selectedAgent.chatConfig.enableProactive">
                              Enable Proactive Greeting
                            </label>
                            <textarea v-if="selectedAgent.chatConfig.enableProactive"
                                      v-model="selectedAgent.chatConfig.proactiveMessage"
                                      rows="2"
                                      class="input-field"
                                      placeholder="👋 Need help? I'm here to assist!"></textarea>
                            <div class="hint">Auto-popup message to engage visitors</div>
                          </div>

                          <div class="form-group">
                            <label>Expected Response Time</label>
                            <input v-model="selectedAgent.chatConfig.responseTime"
                                   type="text"
                                   class="input-field"
                                   placeholder="Usually replies in 2 minutes">
                            <div class="hint">Set customer expectations</div>
                          </div>

                          <div class="form-group">
                            <label>
                              <input type="checkbox" v-model="selectedAgent.chatConfig.showTypingIndicator">
                              Show Typing Indicator
                            </label>
                            <div class="hint">Show "..." when agent is typing</div>
                          </div>

                          <div class="form-group">
                            <label>Away Message</label>
                            <textarea v-model="selectedAgent.chatConfig.awayMessage"
                                      rows="2"
                                      class="input-field"
                                      placeholder="Let me look that up for you..."></textarea>
                            <div class="hint">Message shown when agent is processing</div>
                          </div>
                        </div>
                      </div>

                      <!-- Availability & Hours -->
                      <div class="collapsible-section">
                        <div class="collapsible-header" @click="toggleConfigSection('chatAvailability')">
                          <span class="section-title">Availability & Hours</span>
                          <span class="chevron" :class="{ expanded: configSections.chatAvailability }">›</span>
                        </div>
                        <div v-if="configSections.chatAvailability" class="collapsible-content">
                          <div class="form-group">
                            <label>Business Hours</label>
                            <input v-model="selectedAgent.chatConfig.businessHours"
                                   type="text"
                                   class="input-field"
                                   placeholder="Monday-Friday, 9 AM - 5 PM EST">
                            <div class="hint">When is the agent available?</div>
                          </div>

                          <div class="form-group">
                            <label>Offline Behavior</label>
                            <select v-model="selectedAgent.chatConfig.offlineBehavior" class="input-field">
                              <option value="show-message">Show offline message</option>
                              <option value="collect-email">Collect email for follow-up</option>
                              <option value="always-on">Always available (24/7)</option>
                            </select>
                          </div>

                          <div v-if="selectedAgent.chatConfig.offlineBehavior !== 'always-on'" class="form-group">
                            <label>Offline Message</label>
                            <textarea v-model="selectedAgent.chatConfig.offlineMessage"
                                      rows="2"
                                      class="input-field"
                                      placeholder="We're currently offline. Leave your email and we'll get back to you!"></textarea>
                          </div>

                          <div class="form-group">
                            <label>Auto-away Timeout (minutes)</label>
                            <input v-model="selectedAgent.chatConfig.autoAwayTimeout"
                                   type="number"
                                   class="input-field"
                                   placeholder="5">
                            <div class="hint">Mark as away after inactivity</div>
                          </div>
                        </div>
                      </div>

                      <!-- Escalation & Handoff -->
                      <div class="collapsible-section">
                        <div class="collapsible-header" @click="toggleConfigSection('chatEscalation')">
                          <span class="section-title">Escalation & Handoff</span>
                          <span class="chevron" :class="{ expanded: configSections.chatEscalation }">›</span>
                        </div>
                        <div v-if="configSections.chatEscalation" class="collapsible-content">
                          <div class="form-group">
                            <label>Transfer Conditions</label>
                            <textarea v-model="selectedAgent.chatConfig.transferConditions"
                                      rows="3"
                                      class="input-field"
                                      placeholder="e.g., Transfer if customer asks for human agent, mentions refund, or expresses frustration"></textarea>
                            <div class="hint">When should the agent transfer to a human?</div>
                          </div>

                          <div class="form-group">
                            <label>Transfer Destination</label>
                            <select v-model="selectedAgent.chatConfig.transferDestination" class="input-field">
                              <option value="">Select destination</option>
                              <option value="support-queue">Support Queue</option>
                              <option value="sales-queue">Sales Queue</option>
                              <option value="technical-queue">Technical Queue</option>
                              <option value="manager-queue">Manager Queue</option>
                            </select>
                          </div>

                          <div class="form-group">
                            <label>Handoff Message</label>
                            <textarea v-model="selectedAgent.chatConfig.handoffMessage"
                                      rows="2"
                                      class="input-field"
                                      placeholder="Let me connect you with a team member who can help..."></textarea>
                            <div class="hint">What the user sees during transfer</div>
                          </div>

                          <div class="form-group">
                            <label>Context to Transfer</label>
                            <textarea v-model="selectedAgent.chatConfig.contextToTransfer"
                                      rows="2"
                                      class="input-field"
                                      placeholder="Full conversation history, user info, detected intent"></textarea>
                            <div class="hint">What information to pass to the human agent</div>
                          </div>

                          <div class="form-group">
                            <label>
                              <input type="checkbox" v-model="selectedAgent.chatConfig.enableTranscript">
                              Enable Email Transcript
                            </label>
                            <div class="hint">Send chat history to customer via email</div>
                          </div>
                        </div>
                      </div>
                  </div>

                  <!-- Voice Configuration Section (only for phone agents) -->
                  <div v-if="primaryChannel === 'phone'" id="voice-configuration" class="config-section build-section-anchor">
                    <h3>Voice Configuration</h3>

                    <!-- Phone Settings -->
                      <div class="collapsible-section">
                        <div class="collapsible-header" @click="toggleConfigSection('voicePhone')">
                          <span class="section-title">Phone Settings</span>
                          <span class="chevron" :class="{ expanded: configSections.voicePhone }">›</span>
                        </div>
                        <div v-if="configSections.voicePhone" class="collapsible-content">
                          <div class="form-group">
                            <label>Phone Number</label>
                            <select v-model="selectedAgent.voiceConfig.phoneNumber" class="input-field">
                              <option value="">Select a phone number</option>
                              <option value="+1-555-0100">+1 (555) 010-0100</option>
                              <option value="+1-555-0200">+1 (555) 010-0200</option>
                              <option value="+1-555-0300">+1 (555) 010-0300</option>
                              <option value="new">+ Get a new number</option>
                            </select>
                            <div class="hint">Select or purchase a phone number for this agent</div>
                          </div>

                          <div class="form-group">
                            <label>Voice Type</label>
                            <select v-model="selectedAgent.voiceConfig.voiceType" class="input-field">
                              <option value="nova">Nova (Female, Conversational)</option>
                              <option value="alloy">Alloy (Neutral, Professional)</option>
                              <option value="echo">Echo (Male, Warm)</option>
                              <option value="fable">Fable (Male, Expressive)</option>
                              <option value="onyx">Onyx (Male, Deep)</option>
                              <option value="shimmer">Shimmer (Female, Bright)</option>
                            </select>
                          </div>

                          <div class="form-group">
                            <label>Speech Speed</label>
                            <div class="slider-with-value">
                              <input type="range"
                                     v-model="selectedAgent.voiceConfig.speechSpeed"
                                     min="0.5"
                                     max="2.0"
                                     step="0.1"
                                     class="slider">
                              <span class="slider-value">{{ selectedAgent.voiceConfig.speechSpeed }}x</span>
                            </div>
                            <div class="hint">Adjust speaking speed (0.5x slow to 2.0x fast)</div>
                          </div>

                          <div class="form-group">
                            <label>Language</label>
                            <select v-model="selectedAgent.voiceConfig.language" class="input-field">
                              <option value="en-US">English (US)</option>
                              <option value="en-GB">English (UK)</option>
                              <option value="es-ES">Spanish</option>
                              <option value="fr-FR">French</option>
                              <option value="de-DE">German</option>
                              <option value="it-IT">Italian</option>
                              <option value="pt-BR">Portuguese (Brazil)</option>
                              <option value="ja-JP">Japanese</option>
                              <option value="zh-CN">Chinese (Simplified)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <!-- Greetings & Prompts -->
                      <div class="collapsible-section">
                        <div class="collapsible-header" @click="toggleConfigSection('voiceGreetings')">
                          <span class="section-title">Greetings & Prompts</span>
                          <span class="chevron" :class="{ expanded: configSections.voiceGreetings }">›</span>
                        </div>
                        <div v-if="configSections.voiceGreetings" class="collapsible-content">
                          <div class="form-group">
                            <label>Initial Greeting</label>
                            <textarea v-model="selectedAgent.voiceConfig.initialGreeting"
                                      rows="2"
                                      class="input-field"
                                      placeholder="e.g., Hello! Thanks for calling. How can I help you today?"></textarea>
                            <div class="hint">What the agent says when answering the call</div>
                          </div>

                          <div class="form-group">
                            <label>Hold Message</label>
                            <textarea v-model="selectedAgent.voiceConfig.holdMessage"
                                      rows="2"
                                      class="input-field"
                                      placeholder="e.g., Please hold for a moment while I look that up for you."></textarea>
                            <div class="hint">What the agent says when processing information</div>
                          </div>

                          <div class="form-group">
                            <label>Voicemail Greeting</label>
                            <textarea v-model="selectedAgent.voiceConfig.voicemailGreeting"
                                      rows="2"
                                      class="input-field"
                                      placeholder="e.g., I'm unable to take your call right now. Please leave a message."></textarea>
                            <div class="hint">Greeting when the agent is unavailable</div>
                          </div>
                        </div>
                      </div>

                      <!-- Transfer & Escalation -->
                      <div class="collapsible-section">
                        <div class="collapsible-header" @click="toggleConfigSection('voiceEscalation')">
                          <span class="section-title">Transfer & Escalation</span>
                          <span class="chevron" :class="{ expanded: configSections.voiceEscalation }">›</span>
                        </div>
                        <div v-if="configSections.voiceEscalation" class="collapsible-content">
                          <div class="form-group">
                            <label>Transfer Conditions</label>
                            <textarea v-model="selectedAgent.voiceConfig.transferConditions"
                                      rows="3"
                                      class="input-field"
                                      placeholder="e.g., Transfer to human agent if customer requests supervisor, has billing issues over $500, or expresses strong dissatisfaction."></textarea>
                            <div class="hint">When should the agent transfer to a human?</div>
                          </div>

                          <div class="form-group">
                            <label>Transfer Destination</label>
                            <select v-model="selectedAgent.voiceConfig.transferDestination" class="input-field">
                              <option value="">Select transfer destination</option>
                              <option value="support-queue">Support Queue</option>
                              <option value="sales-queue">Sales Queue</option>
                              <option value="manager-queue">Manager Queue</option>
                              <option value="custom">Custom Number</option>
                            </select>
                          </div>

                          <div v-if="selectedAgent.voiceConfig.transferDestination === 'custom'" class="form-group">
                            <label>Custom Transfer Number</label>
                            <input v-model="selectedAgent.voiceConfig.customTransferNumber"
                                   type="tel"
                                   class="input-field"
                                   placeholder="+1 (555) 000-0000">
                          </div>

                          <div class="form-group">
                            <label>Transfer Message</label>
                            <textarea v-model="selectedAgent.voiceConfig.transferMessage"
                                      rows="2"
                                      class="input-field"
                                      placeholder="e.g., Let me transfer you to someone who can better assist you with this."></textarea>
                            <div class="hint">What the agent says before transferring</div>
                          </div>
                        </div>
                      </div>
                  </div>

                  <!-- Channels Section (only for digital agents) -->
                  <div v-if="primaryChannel === 'web-chat'" id="channels" class="config-section build-section-anchor">
                    <h3>Channels</h3>
                    <p class="section-desc">Deploy your agent across multiple channels. Each channel shares the same knowledge base, skills, and instructions.</p>

                    <div class="channels-list">
                      <!-- Website Chat Channel (always enabled for web-chat agents) -->
                      <div class="channel-card enabled">
                        <div class="channel-card-header">
                          <div class="channel-info">
                            <div class="channel-name">Website Chat</div>
                            <div class="channel-desc">Deploy on your website as a chat widget</div>
                          </div>
                          <div class="channel-status enabled-badge">Enabled</div>
                        </div>
                        <div class="channel-note">Configure appearance and behavior in "Chat Configuration" section above</div>
                      </div>

                      <!-- SMS Channel -->
                      <div class="channel-card" :class="{ enabled: smsChannelEnabled }">
                        <div class="channel-card-header">
                          <div class="channel-info">
                            <div class="channel-name">SMS / Text</div>
                            <div class="channel-desc">Respond to text messages automatically</div>
                          </div>
                          <label class="channel-toggle">
                            <input type="checkbox" v-model="smsChannelEnabled">
                            <span class="toggle-slider"></span>
                          </label>
                        </div>

                        <!-- SMS Configuration (when enabled) -->
                        <div v-if="smsChannelEnabled" class="channel-config">
                          <div class="form-group">
                            <label>SMS Phone Number</label>
                            <select v-model="selectedAgent.smsConfig.phoneNumber" class="input-field">
                              <option value="+1-555-0123">+1 (555) 0123</option>
                              <option value="+1-555-0124">+1 (555) 0124</option>
                              <option value="provision-new">+ Provision New Number</option>
                            </select>
                          </div>

                          <div class="form-group">
                            <label>Auto-Reply Message</label>
                            <textarea v-model="selectedAgent.smsConfig.autoReply"
                                      rows="2"
                                      class="input-field"
                                      placeholder="Thanks for reaching out! I'll respond shortly."></textarea>
                            <div class="hint">Sent when agent is processing or unavailable</div>
                          </div>

                          <div class="form-group">
                            <label>Max Message Length</label>
                            <select v-model="selectedAgent.smsConfig.maxLength" class="input-field">
                              <option value="160">160 characters (1 SMS)</option>
                              <option value="320">320 characters (2 SMS)</option>
                              <option value="480">480 characters (3 SMS)</option>
                            </select>
                            <div class="hint">Longer messages may be split into multiple texts</div>
                          </div>
                        </div>
                      </div>

                      <!-- WhatsApp Channel -->
                      <div class="channel-card disabled">
                        <div class="channel-card-header">
                          <div class="channel-info">
                            <div class="channel-name">WhatsApp Business</div>
                            <div class="channel-desc">Connect with customers on WhatsApp</div>
                          </div>
                          <div class="coming-soon-badge">Coming Soon</div>
                        </div>
                      </div>

                      <!-- Instagram Channel -->
                      <div class="channel-card disabled">
                        <div class="channel-card-header">
                          <div class="channel-info">
                            <div class="channel-name">Instagram DMs</div>
                            <div class="channel-desc">Respond to Instagram direct messages</div>
                          </div>
                          <div class="coming-soon-badge">Coming Soon</div>
                        </div>
                      </div>

                      <!-- Twitter Channel -->
                      <div class="channel-card disabled">
                        <div class="channel-card-header">
                          <div class="channel-info">
                            <div class="channel-name">Twitter DMs</div>
                            <div class="channel-desc">Handle Twitter direct messages</div>
                          </div>
                          <div class="coming-soon-badge">Coming Soon</div>
                        </div>
                      </div>

                      <!-- Facebook Messenger Channel -->
                      <div class="channel-card disabled">
                        <div class="channel-card-header">
                          <div class="channel-info">
                            <div class="channel-name">Facebook Messenger</div>
                            <div class="channel-desc">Connect with Facebook Messenger users</div>
                          </div>
                          <div class="coming-soon-badge">Coming Soon</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Knowledge Base Section -->
                  <div id="knowledge" class="config-section build-section-anchor">
                    <h3>Knowledge Base</h3>

                    <div class="knowledge-upload">
                      <div class="upload-area">
                        <p>Drag & drop files here or click to browse</p>
                        <button class="btn-secondary">Upload Documents</button>
                      </div>

                      <div class="knowledge-list">
                        <div v-if="selectedAgent.knowledge && selectedAgent.knowledge.length > 0">
                          <div v-for="doc in selectedAgent.knowledge"
                               :key="doc.id"
                               class="knowledge-item">
                            <div class="knowledge-info">
                              <div class="knowledge-name">{{ doc.name }}</div>
                              <div class="knowledge-details">{{ doc.size }} · {{ doc.topics }} topics</div>
                            </div>
                            <div class="knowledge-status">✓ {{ doc.status }}</div>
                          </div>
                        </div>
                        <div v-else class="knowledge-empty">
                          No documents uploaded yet
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Skills Section -->
                  <div id="skills" class="config-section build-section-anchor">
                    <h3>Skills</h3>

                    <div class="skills-list">
                      <div v-if="selectedAgent.skills && selectedAgent.skills.length > 0">
                        <div v-for="skill in selectedAgent.skills"
                             :key="skill.id"
                             class="skill-item">
                          <div class="skill-info">
                            <div class="skill-name">{{ skill.name }}</div>
                            <div class="skill-desc">{{ skill.description }}</div>
                          </div>
                          <div class="skill-actions">
                            <button class="btn-skill-test" @click="openSkillTest(skill)">
                              Test
                            </button>
                            <label class="toggle">
                              <input type="checkbox" v-model="skill.enabled">
                              <span class="toggle-slider"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                      <div v-else class="skills-empty">
                        No skills configured
                      </div>

                      <button class="btn-add" @click="openSkillsBuilder">+ Add Skill</button>
                    </div>
                  </div>

                  <!-- Conversation Flow Section -->
                  <div id="flow" class="config-section build-section-anchor">
                    <h3>Voice Conversation Flow</h3>
                    <p class="section-desc">Create custom call flows with branching logic, menus, and prompts for phone interactions</p>

                    <div class="flow-intro-card">
                      <div class="flow-intro-content">
                        <div class="flow-intro-badge">VOICE CHANNELS</div>
                        <div class="flow-intro-title">Advanced Workflow Builder</div>
                        <div class="flow-intro-text">
                          Design sophisticated voice agent flows with a visual node-based editor. Build IVR-like experiences with branching menus, collect customer input, play custom audio prompts, and create decision trees that guide callers to the right outcome.
                        </div>
                        <div class="flow-intro-features">
                          <div class="flow-feature-item">
                            <div class="flow-feature-dot"></div>
                            <span>Drag-and-drop node editor</span>
                          </div>
                          <div class="flow-feature-item">
                            <div class="flow-feature-dot"></div>
                            <span>Play, Collect, Menu, and API nodes</span>
                          </div>
                          <div class="flow-feature-item">
                            <div class="flow-feature-dot"></div>
                            <span>Record audio prompts in-browser</span>
                          </div>
                          <div class="flow-feature-item">
                            <div class="flow-feature-dot"></div>
                            <span>Pre-built templates for common scenarios</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="flow-current-status">
                      <div class="flow-status-row">
                        <div class="flow-status-left">
                          <div class="flow-status-label">Current Flow</div>
                          <div class="flow-status-name">Default Conversational Pattern</div>
                        </div>
                        <button class="btn-secondary" disabled>
                          Open Workflow Builder
                        </button>
                      </div>
                    </div>

                    <div class="flow-visual-preview">
                      <div class="flow-preview-label">Default Flow Structure</div>
                      <div class="flow-canvas">
                        <div class="flow-node flow-node-start">
                          <div class="flow-node-label">Start Call</div>
                          <div class="flow-node-desc">Incoming call received</div>
                        </div>
                        <div class="flow-connector"></div>
                        <div class="flow-node flow-node-play">
                          <div class="flow-node-label">Play Greeting</div>
                          <div class="flow-node-desc">Welcome message</div>
                        </div>
                        <div class="flow-connector"></div>
                        <div class="flow-node flow-node-collect">
                          <div class="flow-node-label">Collect Input</div>
                          <div class="flow-node-desc">Listen to customer</div>
                        </div>
                        <div class="flow-connector"></div>
                        <div class="flow-node flow-node-agent">
                          <div class="flow-node-label">Agent Processing</div>
                          <div class="flow-node-desc">AI responds with answer</div>
                        </div>
                        <div class="flow-connector"></div>
                        <div class="flow-node flow-node-end">
                          <div class="flow-node-label">End Call</div>
                          <div class="flow-node-desc">Complete</div>
                        </div>
                      </div>
                      <div class="flow-preview-note">
                        The Workflow Builder opens in a dedicated editor where you can create complex branching flows, add menus with multiple options, connect to external APIs, and build sophisticated call handling logic.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Testing Panel -->
                <div class="test-panel">
                  <!-- Digital Testing (Chat/SMS) -->
                  <div v-if="currentTestChannel === 'digital'" class="test-content">
                    <div class="test-content-header">
                      <span>Digital Agent Testing</span>
                      <button class="btn-icon" @click="clearTestMessages">Clear</button>
                    </div>

                    <!-- Active Channels Indicator -->
                    <div class="active-channels-bar">
                      <span class="channels-label">Active Channels:</span>
                      <div class="channels-badges">
                        <span class="channel-badge active">Website Chat</span>
                        <span v-if="smsChannelEnabled" class="channel-badge active">SMS</span>
                      </div>
                    </div>

                    <div class="test-chat">
                      <div class="test-messages">
                        <div v-for="msg in testMessages"
                             :key="msg.id"
                             class="test-message"
                             :class="msg.sender">
                          {{ msg.text }}
                        </div>
                        <div v-if="quickTestLoading" class="test-message agent typing">
                          <span class="dot"></span>
                          <span class="dot"></span>
                          <span class="dot"></span>
                        </div>

                        <!-- Suggested Prompts (show when no messages) -->
                        <div v-if="testMessages.length === 0 && !quickTestLoading" class="test-suggestions">
                          <div class="suggestions-label">Try asking:</div>
                          <div class="suggestions-chips">
                            <button v-for="suggestion in quickTestSuggestions"
                                    :key="suggestion"
                                    class="suggestion-chip"
                                    @click="sendSuggestion(suggestion)">
                              {{ suggestion }}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="test-input">
                        <input v-model="quickTestMsg"
                               type="text"
                               placeholder="Type a message to test..."
                               @keyup.enter="sendQuickTest"
                               :disabled="quickTestLoading"
                               class="input-field">
                        <button @click="sendQuickTest" :disabled="quickTestLoading" class="btn-send">
                          {{ quickTestLoading ? 'Sending...' : 'Send' }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Voice Testing -->
                  <div v-if="currentTestChannel === 'voice'" class="test-content">
                    <div class="voice-test-panel">
                      <div class="voice-test-status">
                        <div class="voice-status-indicator" :class="voiceCallStatus">
                          <div class="status-dot"></div>
                          <span>{{ voiceCallStatusText }}</span>
                        </div>
                        <div class="voice-test-info">
                          <div class="info-row">
                            <span class="info-label">Test Number:</span>
                            <span class="info-value">+1 (555) 0000</span>
                          </div>
                          <div class="info-row">
                            <span class="info-label">Duration:</span>
                            <span class="info-value">{{ voiceCallDuration }}</span>
                          </div>
                        </div>

                        <button v-if="voiceCallStatus === 'idle'"
                                class="btn-voice-call"
                                @click="startVoiceTest">
                          Start Test Call
                        </button>
                        <button v-else-if="voiceCallStatus === 'connected'"
                                class="btn-voice-end"
                                @click="endVoiceTest">
                          End Call
                        </button>
                        <div v-else-if="voiceCallStatus === 'connecting'" class="voice-connecting">
                          <div class="loading-dots">
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                          </div>
                          Connecting...
                        </div>
                      </div>

                      <div class="voice-test-transcript">
                        <div class="transcript-header">Live Transcript</div>
                        <div class="transcript-messages">
                          <div v-for="msg in voiceTranscript"
                               :key="msg.id"
                               class="transcript-message"
                               :class="msg.speaker">
                            <div class="transcript-speaker">{{ msg.speaker === 'user' ? 'You' : 'Agent' }}</div>
                            <div class="transcript-text">{{ msg.text }}</div>
                            <div class="transcript-time">{{ msg.timestamp }}</div>
                          </div>
                          <div v-if="voiceTranscript.length === 0" class="transcript-empty">
                            Start a test call to see the transcript
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <!-- TEST Tab -->
            <div v-if="activeTab === 'test'" class="tab-panel">
              <div class="test-layout">
                <div class="test-scenarios-section">
                  <div class="section-header">
                    <h3>Test Scenarios {{ selectedAgent.agentType === 'phone' ? '(Voice Agent)' : '(Chat Agent)' }}</h3>
                    <div class="header-actions">
                      <button class="btn-secondary" @click="openTestBuilder">+ Create Test</button>
                      <button class="btn-primary" @click="runAllTests" :disabled="runningAllTests">
                        {{ runningAllTests ? 'Running Tests...' : 'Run All Tests' }}
                      </button>
                    </div>
                  </div>

                  <div v-if="selectedAgent.testScenarios && selectedAgent.testScenarios.length > 0"
                       class="scenarios-list">
                    <div v-for="scenario in selectedAgent.testScenarios"
                         :key="scenario.id"
                         class="scenario-card"
                         :class="{ running: runningTests[scenario.id] }">
                      <div class="scenario-header">
                        <div class="scenario-name">{{ scenario.name }}</div>
                        <button class="btn-run"
                                @click="runScenario(scenario)"
                                :disabled="runningTests[scenario.id]">
                          {{ runningTests[scenario.id] ? 'Running...' : (scenarioResults[scenario.id] ? '✓ Passed' : 'Run Test') }}
                        </button>
                      </div>
                      <div class="scenario-prompt">Prompt: "{{ scenario.prompt }}"</div>
                      <div v-if="scenarioResults[scenario.id]" class="scenario-result">
                        <div class="result-label">Response:</div>
                        <div class="result-text">{{ scenarioResults[scenario.id] }}</div>
                      </div>
                      <div v-if="runningTests[scenario.id] && !scenarioResults[scenario.id]" class="scenario-loading">
                        <div class="loading-dots">
                          <span class="dot"></span>
                          <span class="dot"></span>
                          <span class="dot"></span>
                        </div>
                        Testing...
                      </div>
                    </div>
                  </div>

                  <div v-else class="scenarios-empty">
                    <p>No test scenarios configured</p>
                    <button class="btn-secondary">+ Add Scenario</button>
                  </div>
                </div>

                <!-- Testing Panel -->
                <div class="test-panel">
                  <!-- Digital Testing (Chat/SMS) -->
                  <div v-if="currentTestChannel === 'digital'" class="test-content">
                    <div class="test-content-header">
                      <span>Digital Agent Testing</span>
                      <button class="btn-icon" @click="clearTestMessages">Clear</button>
                    </div>

                    <!-- Active Channels Indicator -->
                    <div class="active-channels-bar">
                      <span class="channels-label">Active Channels:</span>
                      <div class="channels-badges">
                        <span class="channel-badge active">Website Chat</span>
                        <span v-if="smsChannelEnabled" class="channel-badge active">SMS</span>
                      </div>
                    </div>

                    <div class="test-chat">
                      <div class="test-messages">
                        <div v-for="msg in testMessages"
                             :key="msg.id"
                             class="test-message"
                             :class="msg.sender">
                          {{ msg.text }}
                        </div>
                        <div v-if="quickTestLoading" class="test-message agent typing">
                          <span class="dot"></span>
                          <span class="dot"></span>
                          <span class="dot"></span>
                        </div>

                        <!-- Suggested Prompts (show when no messages) -->
                        <div v-if="testMessages.length === 0 && !quickTestLoading" class="test-suggestions">
                          <div class="suggestions-label">Try asking:</div>
                          <div class="suggestions-chips">
                            <button v-for="suggestion in quickTestSuggestions"
                                    :key="suggestion"
                                    class="suggestion-chip"
                                    @click="sendSuggestion(suggestion)">
                              {{ suggestion }}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="test-input">
                        <input v-model="quickTestMsg"
                               type="text"
                               placeholder="Type a message to test..."
                               @keyup.enter="sendQuickTest"
                               :disabled="quickTestLoading"
                               class="input-field">
                        <button @click="sendQuickTest" :disabled="quickTestLoading" class="btn-send">
                          {{ quickTestLoading ? 'Sending...' : 'Send' }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Voice Testing -->
                  <div v-if="currentTestChannel === 'voice'" class="test-content">
                    <div class="voice-test-panel">
                      <div class="voice-test-status">
                        <div class="voice-status-indicator" :class="voiceCallStatus">
                          <div class="status-dot"></div>
                          <span>{{ voiceCallStatusText }}</span>
                        </div>
                        <div class="voice-test-info">
                          <div class="info-row">
                            <span class="info-label">Test Number:</span>
                            <span class="info-value">+1 (555) 0000</span>
                          </div>
                          <div class="info-row">
                            <span class="info-label">Duration:</span>
                            <span class="info-value">{{ voiceCallDuration }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="voice-test-actions">
                        <button v-if="voiceCallStatus === 'idle'"
                                class="btn-voice-call"
                                @click="startVoiceTest">
                          Start Test Call
                        </button>
                        <button v-else-if="voiceCallStatus === 'connected'"
                                class="btn-voice-end"
                                @click="endVoiceTest">
                          End Call
                        </button>
                        <div v-else class="voice-connecting">
                          Connecting...
                        </div>
                      </div>

                      <div class="voice-test-transcript">
                        <div class="transcript-header">Live Transcript</div>
                        <div class="transcript-messages">
                          <div v-for="msg in voiceTranscript"
                               :key="msg.id"
                               class="transcript-message"
                               :class="msg.speaker">
                            <div class="transcript-speaker">{{ msg.speaker === 'user' ? 'You' : 'Agent' }}</div>
                            <div class="transcript-text">{{ msg.text }}</div>
                            <div class="transcript-time">{{ msg.timestamp }}</div>
                          </div>
                          <div v-if="voiceTranscript.length === 0" class="transcript-empty">
                            Start a test call to see the transcript
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- (DEPLOY tab removed - now shown as full-screen overlay) -->

            <!-- MONITOR Tab -->
            <div v-if="activeTab === 'monitor'" class="tab-panel">
              <!-- Historical Data Banner (for unpublished agents with history) -->
              <div v-if="selectedAgent.status === 'draft' && selectedAgent.hasBeenPublished" class="historical-data-banner">
                <div class="banner-content">
                  <div class="banner-title">Historical Data View</div>
                  <div class="banner-text">
                    You're viewing historical data from when this agent was last published.
                    <span v-if="selectedAgent.lastUnpublishedDate">
                      Last unpublished: {{ formatDate(selectedAgent.lastUnpublishedDate) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="analyze-layout">
                <!-- Monitor Main Content -->
                <div class="monitor-main">
                  <div class="metrics-row">
                  <div class="metric-card">
                    <div class="metric-label">Total Conversations</div>
                    <div class="metric-value">{{ conversationHistory.length }}</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">Deflection Rate</div>
                    <div class="metric-value">{{ selectedAgent.deflectionRate || 0 }}%</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">Avg Response Time</div>
                    <div class="metric-value">1.2s</div>
                  </div>
                  <div class="metric-card">
                    <div class="metric-label">Customer Satisfaction</div>
                    <div class="metric-value">{{ selectedAgent.satisfaction || '-' }}</div>
                  </div>
                </div>

                  <!-- Conversation History Section -->
                  <div v-if="conversationHistory.length > 0" class="conversation-history-section">
                    <h3>Conversation History</h3>
                    <p class="section-desc">Recent test conversations and interactions</p>

                    <div class="conversations-list">
                      <div v-for="conv in conversationHistory.slice(0, 10)"
                           :key="conv.id"
                           class="conversation-card">
                        <div class="conversation-header">
                          <div class="conversation-meta">
                            <span class="conversation-type">{{ conv.type === 'quick-test' ? '⚡ Quick Test' : '📋 Scenario Test' }}</span>
                            <span v-if="conv.scenario" class="conversation-scenario">{{ conv.scenario }}</span>
                          </div>
                          <div class="conversation-time">{{ formatTimestamp(conv.timestamp) }}</div>
                        </div>
                        <div class="conversation-preview">
                          <div class="preview-message user">
                            <strong>User:</strong> {{ conv.messages[0]?.text }}
                          </div>
                          <div class="preview-message agent">
                            <strong>Agent:</strong> {{ conv.messages[1]?.text }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="no-data">
                    <h3>No Test Data Yet</h3>
                    <p>Run Quick Tests or Test Scenarios to see conversation history</p>
                    <button class="btn-primary" @click="activeTab = 'build'">Go to BUILD</button>
                  </div>
                </div>

                <!-- Testing Panel -->
                <div class="test-panel">
                  <!-- Digital Testing (Chat/SMS) -->
                  <div v-if="currentTestChannel === 'digital'" class="test-content">
                    <div class="test-content-header">
                      <span>Digital Agent Testing</span>
                      <button class="btn-icon" @click="clearTestMessages">Clear</button>
                    </div>

                    <!-- Active Channels Indicator -->
                    <div class="active-channels-bar">
                      <span class="channels-label">Active Channels:</span>
                      <div class="channels-badges">
                        <span class="channel-badge active">Website Chat</span>
                        <span v-if="smsChannelEnabled" class="channel-badge active">SMS</span>
                      </div>
                    </div>

                    <div class="test-chat">
                      <div class="test-messages">
                        <div v-for="msg in testMessages"
                             :key="msg.id"
                             class="test-message"
                             :class="msg.sender">
                          {{ msg.text }}
                        </div>
                        <div v-if="quickTestLoading" class="test-message agent typing">
                          <span class="dot"></span>
                          <span class="dot"></span>
                          <span class="dot"></span>
                        </div>

                        <!-- Suggested Prompts (show when no messages) -->
                        <div v-if="testMessages.length === 0 && !quickTestLoading" class="test-suggestions">
                          <div class="suggestions-label">Try asking:</div>
                          <div class="suggestions-chips">
                            <button v-for="suggestion in quickTestSuggestions"
                                    :key="suggestion"
                                    class="suggestion-chip"
                                    @click="sendSuggestion(suggestion)">
                              {{ suggestion }}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="test-input">
                        <input v-model="quickTestMsg"
                               type="text"
                               placeholder="Type a message to test..."
                               @keyup.enter="sendQuickTest"
                               :disabled="quickTestLoading"
                               class="input-field">
                        <button @click="sendQuickTest" :disabled="quickTestLoading" class="btn-send">
                          {{ quickTestLoading ? 'Sending...' : 'Send' }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Voice Testing -->
                  <div v-if="currentTestChannel === 'voice'" class="test-content">
                    <div class="voice-test-panel">
                      <div class="voice-test-status">
                        <div class="voice-status-indicator" :class="voiceCallStatus">
                          <div class="status-dot"></div>
                          <span>{{ voiceCallStatusText }}</span>
                        </div>
                        <div class="voice-test-info">
                          <div class="info-row">
                            <span class="info-label">Test Number:</span>
                            <span class="info-value">+1 (555) 0000</span>
                          </div>
                          <div class="info-row">
                            <span class="info-label">Duration:</span>
                            <span class="info-value">{{ voiceCallDuration }}</span>
                          </div>
                        </div>

                        <button v-if="voiceCallStatus === 'idle'"
                                class="btn-voice-call"
                                @click="startVoiceTest">
                          Start Test Call
                        </button>
                        <button v-else-if="voiceCallStatus === 'connected'"
                                class="btn-voice-end"
                                @click="endVoiceTest">
                          End Call
                        </button>
                        <div v-else-if="voiceCallStatus === 'connecting'" class="voice-connecting">
                          <div class="loading-dots">
                            <span class="dot"></span>
                            <span class="dot"></span>
                            <span class="dot"></span>
                          </div>
                          Connecting...
                        </div>
                      </div>

                      <div class="voice-test-transcript">
                        <div class="transcript-header">Live Transcript</div>
                        <div class="transcript-messages">
                          <div v-for="msg in voiceTranscript"
                               :key="msg.id"
                               class="transcript-message"
                               :class="msg.speaker">
                            <div class="transcript-speaker">{{ msg.speaker === 'user' ? 'You' : 'Agent' }}</div>
                            <div class="transcript-text">{{ msg.text }}</div>
                            <div class="transcript-time">{{ msg.timestamp }}</div>
                          </div>
                          <div v-if="voiceTranscript.length === 0" class="transcript-empty">
                            Start a test call to see the transcript
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Full-Screen Deploy Checkout Overlay -->
        <div v-if="deployCheckoutOpen" class="deploy-overlay">
          <div class="deploy-overlay-content">
            <div class="deploy-overlay-header">
              <h2>Review & Deploy</h2>
              <button class="btn-text" @click="closeDeployCheckout">✕ Close</button>
            </div>

            <div v-if="selectedAgent" class="deploy-checkout-layout">
              <!-- Left Column: Deployment Checklist -->
              <div class="deploy-checkout-left">
                <div class="review-card">
                  <h4>Deployment Checklist</h4>
                  <div class="checklist-items">
                    <div class="checklist-item" :class="{ complete: selectedAgent.name }">
                      <span class="checklist-icon">{{ selectedAgent.name ? '✓' : '○' }}</span>
                      <span>Agent Name & Description</span>
                    </div>
                    <div class="checklist-item" :class="{ complete: selectedAgent.instructions }">
                      <span class="checklist-icon">{{ selectedAgent.instructions ? '✓' : '○' }}</span>
                      <span>Agent Instructions</span>
                    </div>
                    <div v-if="primaryChannel === 'phone'" class="checklist-item" :class="{ complete: selectedAgent.voiceConfig?.phoneNumber }">
                      <span class="checklist-icon">{{ selectedAgent.voiceConfig?.phoneNumber ? '✓' : '○' }}</span>
                      <span>Phone Number Configured</span>
                    </div>
                    <div v-if="primaryChannel === 'phone'" class="checklist-item" :class="{ complete: selectedAgent.voiceConfig?.voiceType }">
                      <span class="checklist-icon">{{ selectedAgent.voiceConfig?.voiceType ? '✓' : '○' }}</span>
                      <span>Voice Settings</span>
                    </div>
                    <div v-if="primaryChannel === 'web-chat'" class="checklist-item" :class="{ complete: selectedAgent.chatConfig?.primaryColor }">
                      <span class="checklist-icon">{{ selectedAgent.chatConfig?.primaryColor ? '✓' : '○' }}</span>
                      <span>Chat Widget Configured</span>
                    </div>
                    <div class="checklist-item" :class="{ complete: selectedAgent.knowledge && selectedAgent.knowledge.length > 0 }">
                      <span class="checklist-icon">{{ selectedAgent.knowledge && selectedAgent.knowledge.length > 0 ? '✓' : '○' }}</span>
                      <span>Knowledge Base</span>
                    </div>
                    <div class="checklist-item" :class="{ complete: selectedAgent.skills && selectedAgent.skills.length > 0 }">
                      <span class="checklist-icon">{{ selectedAgent.skills && selectedAgent.skills.length > 0 ? '✓' : '○' }}</span>
                      <span>Skills Configured</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Middle Column: Review Content -->
              <div class="deploy-checkout-main">
                <!-- Agent Configuration -->
                <div class="review-section">
                  <div class="review-section-header">
                    <h3>Agent Configuration</h3>
                  </div>
                  <div class="review-card">
                    <div class="review-row">
                      <span class="review-label">Name</span>
                      <span class="review-value">{{ selectedAgent.name }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Description</span>
                      <span class="review-value">{{ selectedAgent.description || 'No description provided' }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Primary Channel</span>
                      <span class="review-value">{{ channelLabel(primaryChannel) }}</span>
                    </div>
                    <div v-if="primaryChannel === 'web-chat' && selectedAgent.smsEnabled" class="review-row">
                      <span class="review-label">Active Channels</span>
                      <span class="review-value">
                        <span class="deploy-channel-badge">Website Chat</span>
                        <span class="deploy-channel-badge">SMS</span>
                      </span>
                    </div>
                  </div>
                </div>

                <!-- SMS Configuration (if enabled) -->
                <div v-if="primaryChannel === 'web-chat' && selectedAgent.smsEnabled" class="review-section">
                  <div class="review-section-header">
                    <h3>SMS Configuration</h3>
                  </div>
                  <div class="review-card">
                    <div class="review-row">
                      <span class="review-label">SMS Phone Number</span>
                      <span class="review-value">{{ selectedAgent.smsConfig?.phoneNumber || 'Not configured' }}</span>
                    </div>
                    <div v-if="selectedAgent.smsConfig?.autoReply" class="review-row">
                      <span class="review-label">Auto-Reply Message</span>
                      <span class="review-value">{{ selectedAgent.smsConfig.autoReply }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Max Message Length</span>
                      <span class="review-value">{{ selectedAgent.smsConfig?.maxLength || '160' }} characters</span>
                    </div>
                  </div>
                </div>

                <!-- Voice Configuration (Voice agents only) -->
                <div v-if="primaryChannel === 'phone'" class="review-section">
                  <div class="review-section-header">
                    <h3>Voice Configuration</h3>
                  </div>
                  <div class="review-card">
                    <div class="review-row">
                      <span class="review-label">Phone Number</span>
                      <span class="review-value">{{ selectedAgent.voiceConfig?.phoneNumber || 'Not configured' }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Voice Type</span>
                      <span class="review-value">{{ selectedAgent.voiceConfig?.voiceType || 'Not set' }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Language</span>
                      <span class="review-value">{{ selectedAgent.voiceConfig?.language || 'en-US' }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Speech Speed</span>
                      <span class="review-value">{{ selectedAgent.voiceConfig?.speechSpeed || 1.0 }}x</span>
                    </div>
                    <div v-if="selectedAgent.voiceConfig?.initialGreeting" class="review-row">
                      <span class="review-label">Initial Greeting</span>
                      <span class="review-value">{{ selectedAgent.voiceConfig.initialGreeting }}</span>
                    </div>
                  </div>
                </div>

                <!-- Chat Configuration (Web Chat agents only) -->
                <div v-if="primaryChannel === 'web-chat'" class="review-section">
                  <div class="review-section-header">
                    <h3>Chat Widget Configuration</h3>
                  </div>
                  <div class="review-card">
                    <div class="review-row">
                      <span class="review-label">Widget Position</span>
                      <span class="review-value">{{ selectedAgent.chatConfig?.widgetPosition || 'bottom-right' }}</span>
                    </div>
                    <div class="review-row">
                      <span class="review-label">Primary Color</span>
                      <span class="review-value">
                        <span class="color-preview" :style="{ background: selectedAgent.chatConfig?.primaryColor || '#000000' }"></span>
                        {{ selectedAgent.chatConfig?.primaryColor || '#000000' }}
                      </span>
                    </div>
                    <div v-if="selectedAgent.chatConfig?.displayName" class="review-row">
                      <span class="review-label">Display Name</span>
                      <span class="review-value">{{ selectedAgent.chatConfig.displayName }}</span>
                    </div>
                    <div v-if="selectedAgent.chatConfig?.welcomeMessage" class="review-row">
                      <span class="review-label">Welcome Message</span>
                      <span class="review-value">{{ selectedAgent.chatConfig.welcomeMessage }}</span>
                    </div>
                  </div>
                </div>

                <!-- Instructions -->
                <div class="review-section">
                  <div class="review-section-header">
                    <h3>Agent Instructions</h3>
                  </div>
                  <div class="review-card">
                    <div class="review-instructions">{{ selectedAgent.instructions || 'No instructions provided' }}</div>
                  </div>
                </div>

                <!-- Knowledge Base -->
                <div class="review-section">
                  <div class="review-section-header">
                    <h3>Knowledge Base</h3>
                  </div>
                  <div class="review-card">
                    <div v-if="selectedAgent.knowledge && selectedAgent.knowledge.length > 0" class="knowledge-list-review">
                      <div v-for="doc in selectedAgent.knowledge" :key="doc.id" class="knowledge-item-review">
                        <div class="knowledge-item-name">{{ doc.name }}</div>
                        <div class="knowledge-item-meta">{{ doc.size }} · {{ doc.topics }} topics · {{ doc.status }}</div>
                      </div>
                    </div>
                    <div v-else class="review-empty">No knowledge sources configured</div>
                  </div>
                </div>

                <!-- Skills -->
                <div class="review-section">
                  <div class="review-section-header">
                    <h3>Skills</h3>
                  </div>
                  <div class="review-card">
                    <div v-if="selectedAgent.skills && selectedAgent.skills.length > 0" class="skills-list-review">
                      <div v-for="skill in selectedAgent.skills" :key="skill.id" class="skill-item-review">
                        <div class="skill-item-content">
                          <div class="skill-item-name">{{ skill.name }}</div>
                          <div class="skill-item-desc">{{ skill.description }}</div>
                        </div>
                        <div class="skill-item-status">
                          <span class="status-badge" :class="skill.enabled ? 'enabled' : 'disabled'">
                            {{ skill.enabled ? 'Enabled' : 'Disabled' }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div v-else class="review-empty">No skills configured</div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Plan & Cost -->
              <div class="deploy-checkout-sidebar">
                <div class="deploy-cost-card">
                  <h4>Billing & Credits</h4>

                  <!-- Trial Status -->
                  <div class="trial-status-box">
                    <div class="status-header">
                      <span class="status-badge trial">Free Trial Active</span>
                    </div>
                    <div class="trial-remaining">
                      <span class="remaining-count">847</span> conversations remaining OR <span class="remaining-count">23</span> days left
                    </div>
                    <div class="trial-note">Whichever comes first</div>
                  </div>

                  <!-- Credit Balance -->
                  <div class="credit-balance-box">
                    <div class="balance-header">
                      <span class="balance-label">Current Credit Balance</span>
                      <span class="balance-amount">$445.00</span>
                    </div>
                    <div class="balance-conversations">≈ 890 conversations at $0.50 each</div>
                  </div>

                  <!-- Pricing Model -->
                  <div class="pricing-model">
                    <h5>How Billing Works</h5>
                    <div class="pricing-info">
                      <div class="pricing-item">
                        <div class="pricing-details">
                          <div class="pricing-title">Prepaid Credits</div>
                          <div class="pricing-desc">Add credits in advance, pay as you go</div>
                        </div>
                      </div>
                      <div class="pricing-item">
                        <div class="pricing-details">
                          <div class="pricing-title">$0.50 per conversation</div>
                          <div class="pricing-desc">Charged across all channels (phone, web chat, SMS)</div>
                        </div>
                      </div>
                      <div class="pricing-item">
                        <div class="pricing-details">
                          <div class="pricing-title">Auto-Recharge Available</div>
                          <div class="pricing-desc">Configure in Billing settings</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- What Happens When Credits Run Out -->
                  <div class="what-happens-box">
                    <h5>What happens when credits run out?</h5>
                    <ul class="what-happens-list">
                      <li>Agents pause (not deleted)</li>
                      <li>No automatic charges</li>
                      <li>You control when to add credits</li>
                      <li>Optional auto-recharge available in Billing</li>
                    </ul>
                  </div>

                  <!-- SMS Configuration Warning -->
                  <div v-if="selectedAgent.smsEnabled && (!selectedAgent.smsConfig?.phoneNumber || selectedAgent.smsConfig?.phoneNumber === 'provision-new')"
                       class="deploy-warning-box">
                    <strong>⚠️ SMS Configuration Required</strong>
                    <p>You've enabled SMS but haven't configured a phone number. Please configure SMS in the BUILD tab before publishing.</p>
                  </div>

                  <div class="deploy-buttons" style="margin-top: 24px;">
                    <button class="btn-primary deploy-btn full-width" @click="publishAgent">
                      Publish Agent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Skills Builder Modal -->
        <div v-if="showSkillsBuilder" class="modal-overlay" @click="closeSkillsBuilder">
          <div class="modal-dialog" @click.stop>
            <div class="modal-header">
              <h2>Create New Skill</h2>
              <button class="modal-close" @click="closeSkillsBuilder">×</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Skill Name</label>
                <input v-model="newSkill.name" type="text" class="input-field" placeholder="e.g., Check Order Status">
              </div>

              <div class="form-group">
                <label>Description</label>
                <textarea v-model="newSkill.description" rows="2" class="input-field" placeholder="What does this skill do?"></textarea>
              </div>

              <div class="form-group">
                <label>MCP Server</label>
                <select v-model="newSkill.mcpServer" class="input-field">
                  <option value="">No MCP connection</option>
                  <option value="postgres">PostgreSQL Database</option>
                  <option value="shopify">Shopify API</option>
                  <option value="stripe">Stripe Payments</option>
                  <option value="sendgrid">SendGrid Email</option>
                  <option value="twilio">Twilio SMS</option>
                </select>
                <div class="hint">Connect to an MCP server to extend this skill's capabilities</div>
              </div>

              <div v-if="newSkill.mcpServer" class="form-group">
                <label>Parameters</label>
                <textarea v-model="newSkill.parameters" rows="3" class="input-field" placeholder='{"api_key": "...", "endpoint": "..."}'></textarea>
                <div class="hint">JSON configuration for the MCP server connection</div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="closeSkillsBuilder">Cancel</button>
              <button class="btn-primary" @click="createSkill">Create Skill</button>
            </div>
          </div>
        </div>

        <!-- Test Builder Modal -->
        <div v-if="showTestBuilder" class="modal-overlay" @click="closeTestBuilder">
          <div class="modal-dialog" @click.stop>
            <div class="modal-header">
              <h2>Create Test Scenario</h2>
              <button class="modal-close" @click="closeTestBuilder">×</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Test Name</label>
                <input v-model="newTest.name" type="text" class="input-field" placeholder="e.g., Check Business Hours">
              </div>

              <div class="form-group">
                <label>Test Prompt</label>
                <textarea v-model="newTest.prompt" rows="2" class="input-field" placeholder="What should the user ask?"></textarea>
                <div class="hint">This is the question or message that will be sent to the agent</div>
              </div>

              <div class="form-group">
                <label>Expected Keywords</label>
                <input v-model="newTest.keywords" type="text" class="input-field" placeholder="e.g., hours, open, Monday">
                <div class="hint">Comma-separated keywords that should appear in the response</div>
              </div>

              <div class="form-group">
                <label>Pass Criteria</label>
                <select v-model="newTest.passCriteria" class="input-field">
                  <option value="contains-all">Contains all keywords</option>
                  <option value="contains-any">Contains any keyword</option>
                  <option value="response-time">Response time &lt; 2s</option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="closeTestBuilder">Cancel</button>
              <button class="btn-primary" @click="createTest">Create Test</button>
            </div>
          </div>
        </div>

        <!-- Delete Agent Confirmation Modal -->
        <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
          <div class="modal-dialog modal-sm" @click.stop>
            <div class="modal-header">
              <h2>Delete Agent?</h2>
              <button class="modal-close" @click="closeDeleteModal">×</button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete <strong>{{ selectedAgent?.name }}</strong>?</p>
              <p class="warning-text">This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="closeDeleteModal">Cancel</button>
              <button class="btn-primary btn-danger" @click="deleteAgent">Delete Agent</button>
            </div>
          </div>
        </div>

        <!-- Duplicate Agent Options Modal -->
        <div v-if="showDuplicateModal" class="modal-overlay" @click="closeDuplicateModal">
          <div class="modal-dialog modal-md" @click.stop>
            <div class="modal-header">
              <h2>Duplicate Agent</h2>
              <button class="modal-close" @click="closeDuplicateModal">×</button>
            </div>
            <div class="modal-body">
              <p class="modal-intro">Choose how you want to duplicate <strong>{{ selectedAgent?.name }}</strong>:</p>

              <div class="duplicate-options">
                <div class="duplicate-option" @click="duplicateToSameChannel">
                  <div class="option-content">
                    <div class="option-title">Duplicate (Same Channel)</div>
                    <div class="option-desc">Creates an exact copy with the same channel type ({{ channelLabel(selectedAgent?.channel) }}). All knowledge, skills, and configuration will be copied.</div>
                  </div>
                </div>

                <div v-if="selectedAgent?.channel !== 'phone'" class="duplicate-option" @click="duplicateToVoice">
                  <div class="option-content">
                    <div class="option-title">Duplicate to Voice</div>
                    <div class="option-desc">Creates a Voice agent with the same knowledge and skills. You'll configure voice-specific settings like greetings and phone number.</div>
                  </div>
                </div>

                <div v-if="selectedAgent?.channel !== 'web-chat'" class="duplicate-option" @click="duplicateToChat">
                  <div class="option-content">
                    <div class="option-title">Duplicate to Web Chat</div>
                    <div class="option-desc">Creates a Web Chat agent with the same knowledge and skills. You'll configure chat widget appearance and behavior.</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="closeDuplicateModal">Cancel</button>
            </div>
          </div>
        </div>

        <!-- Unpublish Agent Confirmation Modal -->
        <div v-if="showUnpublishModal" class="modal-overlay" @click="closeUnpublishModal">
          <div class="modal-dialog modal-md" @click.stop>
            <div class="modal-header">
              <h2>Unpublish Agent?</h2>
              <button class="modal-close" @click="closeUnpublishModal">×</button>
            </div>
            <div class="modal-body">
              <p class="modal-intro">Are you sure you want to unpublish <strong>{{ selectedAgent?.name }}</strong>?</p>

              <!-- Activity Warning -->
              <div v-if="hasOngoingActivity" class="activity-warning">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <div class="warning-title">Active Sessions Detected</div>
                  <div class="warning-details">
                    <div v-if="ongoingChatSessions > 0" class="activity-item">
                      <span class="activity-count">{{ ongoingChatSessions }}</span> active chat session{{ ongoingChatSessions > 1 ? 's' : '' }}
                    </div>
                    <div v-if="ongoingVoiceCalls > 0" class="activity-item">
                      <span class="activity-count">{{ ongoingVoiceCalls }}</span> active voice call{{ ongoingVoiceCalls > 1 ? 's' : '' }}
                    </div>
                  </div>
                  <p class="warning-note">These sessions will be immediately terminated if you unpublish.</p>
                </div>
              </div>

              <!-- No Activity -->
              <div v-else class="no-activity-info">
                <p>No active sessions detected. The agent can be safely unpublished.</p>
              </div>

              <div class="unpublish-info">
                <h4>What happens when you unpublish:</h4>
                <ul>
                  <li>Agent will stop accepting new conversations</li>
                  <li>You'll be able to edit configuration and settings</li>
                  <li>You can republish anytime after making changes</li>
                </ul>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="closeUnpublishModal">Cancel</button>
              <button class="btn-primary" @click="confirmUnpublish">
                {{ hasOngoingActivity ? 'Unpublish Anyway' : 'Unpublish Agent' }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Skill Test Modal -->
  <div v-if="skillTestModalOpen" class="modal-overlay" @click="closeSkillTestModal">
    <div class="modal-content skill-test-modal" @click.stop>
      <div class="modal-header">
        <h3>Test Skill: {{ skillBeingTested?.name }}</h3>
        <button class="modal-close" @click="closeSkillTestModal">×</button>
      </div>

      <div class="modal-body">
        <div class="playground-input-section">
          <label>Test Input / Mock Data</label>
          <textarea v-model="skillTestInput"
                    class="input-field"
                    placeholder='Enter test data (e.g., {"orderId": "12345"})'
                    rows="6"></textarea>
        </div>

        <button class="btn-primary"
                @click="runSkillTest"
                :disabled="runningSkillTest">
          {{ runningSkillTest ? 'Testing Skill...' : 'Run Test' }}
        </button>

        <div v-if="skillTestResult" class="playground-result-section">
          <div class="result-header">
            <span>Result</span>
            <span class="result-status" :class="skillTestResult.status">
              {{ skillTestResult.status }}
            </span>
          </div>
          <div class="result-content">
            {{ skillTestResult.output }}
          </div>
          <div v-if="skillTestResult.logs" class="result-logs">
            <div class="logs-header">Execution Logs</div>
            <div class="logs-content">
              <div v-for="(log, idx) in skillTestResult.logs" :key="idx" class="log-entry">
                {{ log }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Collapsible Configuration Sections State
const configSections = ref({
  // Chat config sections
  chatAppearance: true, // Start with first section expanded
  chatMessages: false,
  chatAvailability: false,
  chatEscalation: false,
  // Voice config sections
  voicePhone: true, // Start with first section expanded
  voiceGreetings: false,
  voiceEscalation: false
})

function toggleConfigSection(sectionKey) {
  configSections.value[sectionKey] = !configSections.value[sectionKey]
}

// Load agents from localStorage
const agents = ref([])

// Selected agent
const selectedAgentId = ref(null)
const showAgentDropdown = ref(false)

const selectedAgent = computed(() => {
  return agents.value.find(a => a.id === selectedAgentId.value)
})

function selectAgent(agentId) {
  selectedAgentId.value = agentId

  // Initialize deployment channels from agent data
  const agent = agents.value.find(a => a.id === agentId)
  if (agent && agent.channels) {
    deploymentChannels.value = [...agent.channels]
  } else if (agent && agent.channel) {
    deploymentChannels.value = [agent.channel]
  }

  // Set the appropriate tab based on agent status
  if (agent) {
    if (agent.status === 'draft') {
      // For draft agents, show BUILD tab
      activeTab.value = 'build'
    }
    // For published agents, no tab is needed (dashboard view)
  }

  // Initialize voiceConfig if it doesn't exist (for phone agents)
  if (agent && !agent.voiceConfig) {
    agent.voiceConfig = {
      phoneNumber: '',
      voiceType: 'nova',
      speechSpeed: 1.0,
      language: 'en-US',
      initialGreeting: '',
      holdMessage: '',
      voicemailGreeting: '',
      transferConditions: '',
      customTransferNumber: '',
      transferMessage: ''
    }
  }

  // Initialize chatConfig if it doesn't exist (for web-chat agents)
  if (agent && !agent.chatConfig) {
    agent.chatConfig = {
      // Widget Appearance
      primaryColor: '#000000',
      widgetPosition: 'bottom-right',
      displayName: '',
      widgetSize: 'standard',
      // Messages & Greetings
      welcomeMessage: '',
      enableProactive: false,
      proactiveMessage: '',
      responseTime: 'Usually replies in 2 minutes',
      showTypingIndicator: true,
      awayMessage: '',
      // Availability & Hours
      businessHours: 'Monday-Friday, 9 AM - 5 PM EST',
      offlineBehavior: 'always-on',
      offlineMessage: '',
      autoAwayTimeout: 5,
      // Escalation & Handoff
      transferConditions: '',
      transferDestination: '',
      handoffMessage: '',
      contextToTransfer: 'Full conversation history, user info, detected intent',
      enableTranscript: true
    }
  }

  // Initialize smsConfig if it doesn't exist (for web-chat agents that can enable SMS)
  if (agent && !agent.smsConfig) {
    agent.smsConfig = {
      phoneNumber: '+1-555-0123',
      autoReply: 'Thanks for reaching out! I\'ll respond shortly.',
      maxLength: '160'
    }
  }

  // Initialize smsEnabled if it doesn't exist
  if (agent && agent.smsEnabled === undefined) {
    agent.smsEnabled = false
  }

  // Reset test messages when switching agents
  testMessages.value = []
  scenarioResults.value = {}
}

function toggleAgentDropdown() {
  showAgentDropdown.value = !showAgentDropdown.value
}

function selectAgentFromDropdown(agentId) {
  selectAgent(agentId)
  showAgentDropdown.value = false
}

function createNewAgentFromDropdown() {
  showAgentDropdown.value = false
  createNewAgent()
}

// Close dropdown when clicking outside
function handleClickOutside(event) {
  if (showAgentDropdown.value) {
    const dropdown = document.querySelector('.agent-selector')
    if (dropdown && !dropdown.contains(event.target)) {
      showAgentDropdown.value = false
    }
  }

  // Close actions menu when clicking outside
  if (showActionsMenu.value && actionsMenu.value) {
    if (!actionsMenu.value.contains(event.target)) {
      showActionsMenu.value = false
    }
  }
}

onMounted(() => {
  const saved = localStorage.getItem('daart-agents')
  if (saved) {
    agents.value = JSON.parse(saved)

    // Check if we should select a newly created agent
    const newAgentId = localStorage.getItem('daart-new-agent-id')
    let agentSelected = false

    if (newAgentId) {
      // Agent IDs can be strings (e.g., 'agent-1234567890') or numbers
      const foundAgent = agents.value.find(a => String(a.id) === newAgentId)
      if (foundAgent) {
        // Select the newly created agent
        selectAgent(foundAgent.id)
        agentSelected = true
      }
      // Clean up the flag regardless
      localStorage.removeItem('daart-new-agent-id')
    }

    // If no new agent was selected, select first agent by default
    if (!agentSelected && agents.value.length > 0) {
      selectAgent(agents.value[0].id)
    }
  }

  // Load last viewed timestamps for monitor
  const viewedSaved = localStorage.getItem('daart-monitor-viewed')
  if (viewedSaved) {
    lastViewedTimestamps.value = JSON.parse(viewedSaved)
  }

  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

// Clean up listener
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  // Clear auto-save timeout on unmount
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }
})

// Auto-save functionality
watch(
  () => selectedAgent.value,
  (newAgent, oldAgent) => {
    // Only auto-save if agent actually changed and we're not just switching agents
    if (newAgent && oldAgent && newAgent.id === oldAgent.id) {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }

      // Show "Saving..." status
      autoSaveStatus.value = 'saving'

      // Debounce the save
      autoSaveTimeout = setTimeout(() => {
        saveAgents()
        autoSaveStatus.value = 'saved'

        // Clear "Saved" status after 2 seconds
        setTimeout(() => {
          autoSaveStatus.value = null
        }, 2000)
      }, 1000) // 1 second debounce
    }
  },
  { deep: true }
)

function channelLabel(channel) {
  const labels = {
    'web-chat': 'Web Chat',
    'phone': 'Voice',
    'sms': 'SMS'
  }
  return labels[channel] || channel
}

// Tabs
const allTabs = [
  { id: 'build', label: 'BUILD' },
  { id: 'test', label: 'TEST' },
  { id: 'monitor', label: 'MONITOR' }
]

// Filter tabs based on agent published state
const tabs = computed(() => {
  if (!selectedAgent.value) return allTabs

  // Hide BUILD and TEST tabs when agent is published
  if (selectedAgent.value.status === 'published') {
    return allTabs.filter(tab => tab.id !== 'build' && tab.id !== 'test')
  }

  // For draft agents that have been published before, show all tabs including MONITOR
  // This allows access to historical data
  return allTabs
})

const activeTab = ref('build')

// Deploy Checkout View (Full Screen)
const deployCheckoutOpen = ref(false)

function openDeployCheckout() {
  deployCheckoutOpen.value = true
}

function closeDeployCheckout() {
  deployCheckoutOpen.value = false
}

function handleTabClick(tabId) {
  activeTab.value = tabId

  // Mark monitor as viewed when clicking on monitor tab
  if (tabId === 'monitor') {
    markMonitorAsViewed()
  }
}

// BUILD tab section navigation - computed to conditionally show Chat/Voice Configuration
const buildSections = computed(() => {
  const sections = [
    { id: 'configuration', label: 'Configuration' }
  ]

  // Add Chat Configuration or Voice Configuration based on primary channel
  if (primaryChannel.value === 'web-chat') {
    sections.push({ id: 'chat-configuration', label: 'Chat Configuration' })
    sections.push({ id: 'channels', label: 'Channels' })
  } else if (primaryChannel.value === 'phone') {
    sections.push({ id: 'voice-configuration', label: 'Voice Configuration' })
  }

  sections.push(
    { id: 'knowledge', label: 'Knowledge Base' },
    { id: 'skills', label: 'Skills' },
    { id: 'flow', label: 'Conversation Flow' }
  )

  return sections
})

const activeBuildSection = ref('configuration')
const buildMainContent = ref(null)

// Scroll to build section
function scrollToBuildSection(sectionId) {
  const section = document.getElementById(sectionId)
  if (section && buildMainContent.value) {
    const offsetTop = section.offsetTop - buildMainContent.value.offsetTop
    buildMainContent.value.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
    activeBuildSection.value = sectionId
  }
}

// Notification system
const notification = ref(null)
const saving = ref(false)
const validating = ref(false)

function showNotification(message, type = 'success') {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 3000)
}

// COMPASS Validation
const validationExpanded = ref(true)

const validationMessages = computed(() => {
  if (!selectedAgent.value) return []

  const messages = []
  const agent = selectedAgent.value

  // Validate Agent Name
  if (!agent.name || agent.name.trim().length === 0) {
    messages.push({
      id: 'name-empty',
      severity: 'error',
      field: 'Agent Name',
      message: 'Agent name is required'
    })
  } else if (agent.name.length < 3) {
    messages.push({
      id: 'name-short',
      severity: 'warning',
      field: 'Agent Name',
      message: 'Agent name should be at least 3 characters long'
    })
  }

  // Validate Description
  if (!agent.description || agent.description.trim().length === 0) {
    messages.push({
      id: 'desc-empty',
      severity: 'warning',
      field: 'Description',
      message: 'Adding a description helps you remember what this agent does'
    })
  }

  // Validate Instructions
  if (!agent.instructions || agent.instructions.trim().length === 0) {
    messages.push({
      id: 'instructions-empty',
      severity: 'error',
      field: 'Behavior Instructions',
      message: 'Instructions are required to guide agent behavior'
    })
  } else if (agent.instructions.length < 50) {
    messages.push({
      id: 'instructions-short',
      severity: 'warning',
      field: 'Behavior Instructions',
      message: 'More detailed instructions (50+ characters) lead to better agent performance'
    })
  }

  // Validate Knowledge Base
  if (!agent.knowledge || agent.knowledge.length === 0) {
    messages.push({
      id: 'knowledge-empty',
      severity: 'warning',
      field: 'Knowledge Base',
      message: 'No knowledge sources configured. Agent may not have enough context to answer questions.'
    })
  }

  // Validate Skills
  if (!agent.skills || agent.skills.length === 0) {
    messages.push({
      id: 'skills-empty',
      severity: 'info',
      field: 'Skills',
      message: 'No skills configured. Consider adding skills to extend agent capabilities.'
    })
  } else {
    const enabledSkills = agent.skills.filter(s => s.enabled)
    if (enabledSkills.length === 0) {
      messages.push({
        id: 'skills-disabled',
        severity: 'warning',
        field: 'Skills',
        message: 'All skills are disabled. Enable at least one skill for the agent to use them.'
      })
    }
  }

  // Validate Channels
  if (!agent.channels || agent.channels.length === 0) {
    messages.push({
      id: 'channels-empty',
      severity: 'info',
      field: 'Channels',
      message: 'No channels configured. Visit Channels section in BUILD to make your agent available.'
    })
  }

  return messages
})

// Testing Panel - Smart Contextual Channel based on agent type
const currentTestChannel = computed(() => {
  if (!selectedAgent.value) return 'digital'

  // Use agent type as primary determinant
  const agentType = selectedAgent.value.agentType
  if (agentType === 'phone') return 'voice'
  if (agentType === 'chat') return 'digital'

  // Fallback for legacy agents without agentType - check channels
  const channels = deploymentChannels.value || []
  if (channels.includes('phone') && !channels.includes('web-chat')) {
    return 'voice'
  }

  return 'digital'
})

// Channel Detection (for UI indicators)
const hasDigitalChannels = computed(() => {
  if (!selectedAgent.value) return true
  const channels = deploymentChannels.value || []
  return channels.includes('web-chat') || channels.includes('sms') || channels.length === 0
})

const hasVoiceChannels = computed(() => {
  if (!selectedAgent.value) return false
  const channels = deploymentChannels.value || []
  return channels.includes('phone')
})

// Note: Toggle button removed since test channel now auto-determined by agent type
// Button only shows for legacy agents with both channel types enabled

// Try-Now Digital (Chat Testing)
const testMessages = ref([])
const quickTestMsg = ref('')
const quickTestLoading = ref(false)

// Context-aware test suggestions
const quickTestSuggestions = computed(() => {
  if (!selectedAgent.value) return []

  const agent = selectedAgent.value
  const suggestions = []

  // Always include: What can you help with?
  suggestions.push("What can you help with?")

  // Add based on knowledge base
  if (agent.knowledge && agent.knowledge.length > 0) {
    suggestions.push("Tell me about your services")
  }

  // Add based on skills
  if (agent.skills && agent.skills.filter(s => s.enabled).length > 0) {
    const firstSkill = agent.skills.find(s => s.enabled)
    if (firstSkill && firstSkill.name.toLowerCase().includes('order')) {
      suggestions.push("Check my order status")
    } else {
      suggestions.push("What actions can you perform?")
    }
  }

  // Add channel-specific suggestions
  if (agent.channels && agent.channels.includes('phone')) {
    suggestions.push("What are your hours?")
  }

  // Always include: How does this work?
  if (suggestions.length < 5) {
    suggestions.push("How does this work?")
  }

  // Fallback suggestions if nothing is configured
  if (suggestions.length < 3) {
    suggestions.push("Hello!")
    suggestions.push("Can you help me?")
  }

  return suggestions.slice(0, 5)
})

function clearTestMessages() {
  testMessages.value = []
}

// Try-Now Voice (Call Simulation)
const voiceCallStatus = ref('idle') // idle, connecting, connected, ended
const voiceCallDuration = ref('00:00')
const voiceTranscript = ref([])
let voiceCallTimer = null
let voiceCallSeconds = 0

const voiceCallStatusText = computed(() => {
  switch (voiceCallStatus.value) {
    case 'idle': return 'Ready to Test'
    case 'connecting': return 'Connecting...'
    case 'connected': return 'Call Active'
    case 'ended': return 'Call Ended'
    default: return 'Ready'
  }
})

function startVoiceTest() {
  voiceCallStatus.value = 'connecting'
  voiceCallSeconds = 0
  voiceCallDuration.value = '00:00'
  voiceTranscript.value = []

  // Simulate connection
  setTimeout(() => {
    voiceCallStatus.value = 'connected'
    startVoiceTimer()
    simulateVoiceConversation()
  }, 2000)
}

function endVoiceTest() {
  voiceCallStatus.value = 'ended'
  if (voiceCallTimer) {
    clearInterval(voiceCallTimer)
    voiceCallTimer = null
  }

  // Save conversation to Monitor if there are messages
  if (voiceTranscript.value.length > 0) {
    const messages = voiceTranscript.value.map(t => ({
      id: t.id,
      sender: t.speaker, // Convert 'speaker' to 'sender'
      text: t.text
    }))
    saveConversation('voice-test', messages)
  }

  // Reset to idle after 2 seconds
  setTimeout(() => {
    voiceCallStatus.value = 'idle'
  }, 2000)
}

function startVoiceTimer() {
  voiceCallTimer = setInterval(() => {
    voiceCallSeconds++
    const mins = Math.floor(voiceCallSeconds / 60)
    const secs = voiceCallSeconds % 60
    voiceCallDuration.value = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, 1000)
}

function simulateVoiceConversation() {
  // Simulate initial greeting
  setTimeout(() => {
    voiceTranscript.value.push({
      id: Date.now(),
      speaker: 'agent',
      text: `Hello! I'm ${selectedAgent.value?.name || 'your AI agent'}. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString()
    })
  }, 500)

  // Simulate user speaking
  setTimeout(() => {
    voiceTranscript.value.push({
      id: Date.now(),
      speaker: 'user',
      text: "What are your business hours?",
      timestamp: new Date().toLocaleTimeString()
    })
  }, 3000)

  // Simulate agent response
  setTimeout(() => {
    voiceTranscript.value.push({
      id: Date.now(),
      speaker: 'agent',
      text: "We're open Monday through Friday, 9 AM to 5 PM Eastern Time. Is there anything else I can help you with?",
      timestamp: new Date().toLocaleTimeString()
    })
  }, 5000)
}

// Skills Testing (Contextual Modal)
const skillTestModalOpen = ref(false)
const skillBeingTested = ref(null)
const skillTestInput = ref('')
const skillTestResult = ref(null)
const runningSkillTest = ref(false)

function openSkillTest(skill) {
  skillBeingTested.value = skill
  skillTestInput.value = ''
  skillTestResult.value = null
  skillTestModalOpen.value = true
}

function closeSkillTestModal() {
  skillTestModalOpen.value = false
  skillBeingTested.value = null
  skillTestInput.value = ''
  skillTestResult.value = null
}

function runSkillTest() {
  if (!skillBeingTested.value) return

  runningSkillTest.value = true
  skillTestResult.value = null

  // Simulate skill execution
  setTimeout(() => {
    skillTestResult.value = {
      status: 'success',
      output: `Skill "${skillBeingTested.value.name}" executed successfully with test input.`,
      logs: [
        '[00:00.123] Skill execution started',
        '[00:00.245] Validating input parameters',
        '[00:00.367] Connecting to external service',
        '[00:00.489] Processing request',
        '[00:00.612] Response received',
        '[00:00.734] Skill execution completed'
      ]
    }

    runningSkillTest.value = false
  }, 2000)
}

function sendSuggestion(suggestion) {
  quickTestMsg.value = suggestion
  sendQuickTest()
}

function sendQuickTest() {
  if (!quickTestMsg.value.trim()) return

  quickTestLoading.value = true

  const userMessage = {
    id: Date.now(),
    sender: 'user',
    text: quickTestMsg.value
  }

  testMessages.value.push(userMessage)

  const msg = quickTestMsg.value
  quickTestMsg.value = ''

  setTimeout(() => {
    const agentMessage = {
      id: Date.now() + 1,
      sender: 'agent',
      text: `I can help with that. Based on my knowledge base, ${msg.toLowerCase()}.`
    }
    testMessages.value.push(agentMessage)
    quickTestLoading.value = false

    // Save conversation to history
    saveConversation('quick-test', [userMessage, agentMessage])
  }, 1000)
}

// Conversation History
const conversationUpdateTrigger = ref(0) // Reactive trigger for localStorage changes

function saveConversation(type, messages, scenarioName = null) {
  if (!selectedAgent.value) return

  const conversation = {
    id: `conv-${Date.now()}`,
    agentId: selectedAgent.value.id,
    agentName: selectedAgent.value.name,
    timestamp: new Date().toISOString(),
    type: type, // 'quick-test' or 'scenario-test'
    messages: messages,
    scenario: scenarioName
  }

  // Load existing conversations
  const saved = localStorage.getItem('daart-conversations')
  const conversations = saved ? JSON.parse(saved) : []

  // Add new conversation
  conversations.push(conversation)

  // Keep only last 100 conversations
  if (conversations.length > 100) {
    conversations.splice(0, conversations.length - 100)
  }

  // Save back to localStorage
  localStorage.setItem('daart-conversations', JSON.stringify(conversations))

  // Trigger reactive update
  conversationUpdateTrigger.value++
}

const conversationHistory = computed(() => {
  // Add dependency on trigger so computed re-runs when conversations change
  conversationUpdateTrigger.value
  const saved = localStorage.getItem('daart-conversations')
  if (!saved) return []

  const conversations = JSON.parse(saved)

  // Filter by selected agent
  if (selectedAgent.value) {
    return conversations.filter(c => c.agentId === selectedAgent.value.id).reverse()
  }

  return conversations.reverse()
})

// Unread conversation tracking
const lastViewedTimestamps = ref({}) // Track last viewed time per agent

// Count unread conversations for current agent
const unreadConversationCount = computed(() => {
  conversationUpdateTrigger.value // Re-run when conversations change

  if (!selectedAgent.value) return 0

  const agentId = selectedAgent.value.id
  const lastViewed = lastViewedTimestamps.value[agentId] || 0

  // Count conversations newer than last viewed time
  const conversations = conversationHistory.value
  return conversations.filter(c => {
    const conversationTime = new Date(c.timestamp).getTime()
    return conversationTime > lastViewed
  }).length
})

// Mark Monitor as viewed
function markMonitorAsViewed() {
  if (!selectedAgent.value) return

  const agentId = selectedAgent.value.id
  lastViewedTimestamps.value[agentId] = Date.now()
  localStorage.setItem('daart-monitor-viewed', JSON.stringify(lastViewedTimestamps.value))
  conversationUpdateTrigger.value++ // Force re-computation of unread count
}

// Test Scenarios
const scenarioResults = ref({})
const runningTests = ref({})
const runningAllTests = ref(false)

function runScenario(scenario) {
  runningTests.value[scenario.id] = true
  setTimeout(() => {
    const response = `Great question! ${scenario.expectedKeywords.join(' and ')}.`
    scenarioResults.value[scenario.id] = response
    runningTests.value[scenario.id] = false

    // Save scenario test to conversation history
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: scenario.prompt
    }
    const agentMessage = {
      id: Date.now() + 1,
      sender: 'agent',
      text: response
    }
    saveConversation('scenario-test', [userMessage, agentMessage], scenario.name)
  }, 1000)
}

function runAllTests() {
  if (!selectedAgent.value.testScenarios) return

  runningAllTests.value = true
  selectedAgent.value.testScenarios.forEach((scenario, index) => {
    runningTests.value[scenario.id] = true
    setTimeout(() => {
      scenarioResults.value[scenario.id] = `Great question! ${scenario.expectedKeywords.join(' and ')}.`
      runningTests.value[scenario.id] = false

      // Check if all tests are complete
      const allComplete = selectedAgent.value.testScenarios.every(s => scenarioResults.value[s.id])
      if (allComplete) {
        runningAllTests.value = false
        showNotification('All tests completed successfully!')
      }
    }, 1000 + (index * 500))
  })
}

// Deployment
const deploymentChannels = ref([])

// Determine primary channel based on agent type
const primaryChannel = computed(() => {
  if (!selectedAgent.value) return 'web-chat'

  const agentType = selectedAgent.value.agentType
  if (agentType === 'phone') return 'phone'
  if (agentType === 'chat') return 'web-chat'

  // Fallback to channel if agentType not set (legacy agents)
  return selectedAgent.value.channel || 'web-chat'
})

// SMS Channel enabled state (getter/setter)
const smsChannelEnabled = computed({
  get() {
    return selectedAgent.value?.smsEnabled || false
  },
  set(value) {
    if (selectedAgent.value) {
      selectedAgent.value.smsEnabled = value
    }
  }
})

// Get additional channels (all except primary)
const additionalChannels = computed(() => {
  const primary = primaryChannel.value
  const allChannels = ['web-chat', 'phone', 'sms']
  return allChannels.filter(ch => ch !== primary)
})

function toggleChannel(channel) {
  const index = deploymentChannels.value.indexOf(channel)
  if (index > -1) {
    deploymentChannels.value.splice(index, 1)
  } else {
    deploymentChannels.value.push(channel)
  }

  // Update agent's channels
  if (selectedAgent.value) {
    selectedAgent.value.channels = [...deploymentChannels.value]
    saveAgents()
  }
}

function goLive() {
  if (!selectedAgent.value) return
  selectedAgent.value.status = 'live'
  selectedAgent.value.statusText = 'Live'
  selectedAgent.value.lastUpdated = 'Just now'
  saveAgents()
  showNotification('Agent is now live! 🎉')
}

function pause() {
  if (!selectedAgent.value) return
  selectedAgent.value.status = 'paused'
  selectedAgent.value.statusText = 'Paused'
  selectedAgent.value.lastUpdated = 'Just now'
  saveAgents()
  showNotification('Agent has been paused')
}

// Actions
function createNewAgent() {
  router.push('/onboarding-wizard')
}

function saveAgent() {
  saving.value = true
  setTimeout(() => {
    if (selectedAgent.value) {
      selectedAgent.value.lastUpdated = 'Just now'
    }
    saveAgents()
    saving.value = false
    showNotification('Agent saved successfully!')
  }, 500)
}

function validateAgent() {
  validating.value = true
  setTimeout(() => {
    validating.value = false
    showNotification('Validation passed! Your agent is ready to deploy.')
  }, 1000)
}

function deployAgent() {
  if (selectedAgent.value) {
    // Update agent status to published/live
    selectedAgent.value.status = 'published'
    selectedAgent.value.statusText = 'Live'
    selectedAgent.value.lastUpdated = 'Just now'
    saveAgents()
    showNotification('Agent published successfully! Your agent is now live.')

    // Stay on deploy tab to show published state
    activeTab.value = 'deploy'
  }
}

function unpublishAgent() {
  if (!selectedAgent.value) return

  // Simulate checking for ongoing activity (in real app, would check via API)
  // For demo: randomly set some activity for testing
  ongoingChatSessions.value = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0
  ongoingVoiceCalls.value = Math.random() > 0.8 ? Math.floor(Math.random() * 2) + 1 : 0

  // Show confirmation modal
  showUnpublishModal.value = true
}

function closeUnpublishModal() {
  showUnpublishModal.value = false
}

function confirmUnpublish() {
  if (selectedAgent.value) {
    // Update agent status back to draft
    selectedAgent.value.status = 'draft'
    selectedAgent.value.statusText = 'Draft'
    selectedAgent.value.lastUpdated = 'Just now'

    // Track that this agent has been published before
    selectedAgent.value.hasBeenPublished = true
    selectedAgent.value.lastUnpublishedDate = new Date().toISOString()

    saveAgents()

    const hadActivity = hasOngoingActivity.value
    showUnpublishModal.value = false

    if (hadActivity) {
      showNotification('Agent unpublished. Active sessions were terminated.')
    } else {
      showNotification('Agent unpublished. You can now edit and make changes.')
    }

    // Keep user on MONITOR tab to see historical data instead of switching to BUILD
    activeTab.value = 'monitor'

    // Reset activity counters
    ongoingChatSessions.value = 0
    ongoingVoiceCalls.value = 0
  }
}

function publishAgent() {
  if (selectedAgent.value) {
    // Validate SMS configuration if enabled
    if (selectedAgent.value.smsEnabled) {
      const smsConfig = selectedAgent.value.smsConfig
      if (!smsConfig || !smsConfig.phoneNumber || smsConfig.phoneNumber === 'provision-new') {
        showNotification('Please configure a phone number for SMS before publishing.', 'error')
        return
      }
    }

    // Update agent status to published/live
    selectedAgent.value.status = 'published'
    selectedAgent.value.statusText = 'Live'
    selectedAgent.value.lastUpdated = 'Just now'

    // Track publishing dates
    const now = new Date().toISOString()
    if (!selectedAgent.value.firstPublishedDate) {
      selectedAgent.value.firstPublishedDate = now
    }
    selectedAgent.value.lastPublishedDate = now
    selectedAgent.value.hasBeenPublished = true

    saveAgents()
    showNotification('Agent published successfully! Your agent is now live.')

    // Close the deploy checkout overlay
    closeDeployCheckout()

    // Published agents show dashboard view (no tabs needed)
    // The view will automatically switch to the published dashboard
  }
}

function saveAgents() {
  localStorage.setItem('daart-agents', JSON.stringify(agents.value))
}

function goTo(path) {
  router.push(path)
}

// Profile Dropdown
const showProfileMenu = ref(false)

function toggleProfileMenu() {
  showProfileMenu.value = !showProfileMenu.value
}

function signOut() {
  // Clear localStorage
  localStorage.removeItem('daart-agents')
  localStorage.removeItem('daart-conversations')
  localStorage.removeItem('daart-onboarding-complete')
  // Redirect to signup
  router.push('/signup')
}

// Skills Builder Modal
const showSkillsBuilder = ref(false)
const newSkill = ref({
  name: '',
  description: '',
  mcpServer: '',
  parameters: ''
})

function openSkillsBuilder() {
  showSkillsBuilder.value = true
  newSkill.value = {
    name: '',
    description: '',
    mcpServer: '',
    parameters: ''
  }
}

function closeSkillsBuilder() {
  showSkillsBuilder.value = false
}

function createSkill() {
  if (!selectedAgent.value) return
  if (!newSkill.value.name.trim()) {
    showNotification('Skill name is required', 'error')
    return
  }

  const skill = {
    id: `skill-${Date.now()}`,
    name: newSkill.value.name,
    description: newSkill.value.description,
    enabled: true,
    mcpServer: newSkill.value.mcpServer || null,
    parameters: newSkill.value.parameters || null
  }

  if (!selectedAgent.value.skills) {
    selectedAgent.value.skills = []
  }

  selectedAgent.value.skills.push(skill)
  saveAgents()
  closeSkillsBuilder()
  showNotification(`Skill "${skill.name}" created successfully!`)
}

// Test Builder Modal
const showTestBuilder = ref(false)
const newTest = ref({
  name: '',
  prompt: '',
  keywords: '',
  passCriteria: 'contains-all'
})

// Agent Actions Menu
const showActionsMenu = ref(false)
const actionsMenu = ref(null)

// Delete Modal
const showDeleteModal = ref(false)

// Duplicate Modal
const showDuplicateModal = ref(false)

// Unpublish Modal
const showUnpublishModal = ref(false)

// Simulated ongoing activity (in a real app, this would come from API)
const ongoingChatSessions = ref(0)
const ongoingVoiceCalls = ref(0)

const hasOngoingActivity = computed(() => {
  return ongoingChatSessions.value > 0 || ongoingVoiceCalls.value > 0
})

// Auto-save status
const autoSaveStatus = ref(null) // null, 'saving', or 'saved'
let autoSaveTimeout = null

function openTestBuilder() {
  showTestBuilder.value = true
  newTest.value = {
    name: '',
    prompt: '',
    keywords: '',
    passCriteria: 'contains-all'
  }
}

function closeTestBuilder() {
  showTestBuilder.value = false
}

function createTest() {
  if (!selectedAgent.value) return
  if (!newTest.value.name.trim()) {
    showNotification('Test name is required', 'error')
    return
  }
  if (!newTest.value.prompt.trim()) {
    showNotification('Test prompt is required', 'error')
    return
  }

  const keywordsArray = newTest.value.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)

  const test = {
    id: `test-${Date.now()}`,
    name: newTest.value.name,
    prompt: newTest.value.prompt,
    expectedKeywords: keywordsArray,
    passCriteria: newTest.value.passCriteria
  }

  if (!selectedAgent.value.testScenarios) {
    selectedAgent.value.testScenarios = []
  }

  selectedAgent.value.testScenarios.push(test)
  saveAgents()
  closeTestBuilder()
  showNotification(`Test "${test.name}" created successfully!`)
}

// Agent Actions Menu Functions
function toggleActionsMenu() {
  showActionsMenu.value = !showActionsMenu.value
}

function duplicateAgent() {
  if (!selectedAgent.value) return
  showActionsMenu.value = false
  showDuplicateModal.value = true
}

function closeDuplicateModal() {
  showDuplicateModal.value = false
}

function duplicateToSameChannel() {
  if (!selectedAgent.value) return

  const duplicatedAgent = {
    ...selectedAgent.value,
    id: Date.now(),
    name: `${selectedAgent.value.name} (Copy)`,
    status: 'draft',
    statusText: 'Draft',
    conversations: 0,
    deflectionRate: 0,
    satisfaction: '-',
    createdAt: new Date().toISOString(),
    lastUpdated: 'Just now'
  }

  agents.value.push(duplicatedAgent)
  saveAgents()
  selectedAgentId.value = duplicatedAgent.id
  showDuplicateModal.value = false
  showNotification(`Agent "${duplicatedAgent.name}" created successfully!`)

  // Set active tab to BUILD
  activeTab.value = 'build'
}

function duplicateToVoice() {
  if (!selectedAgent.value) return

  const duplicatedAgent = {
    ...selectedAgent.value,
    id: Date.now(),
    name: `${selectedAgent.value.name} (Voice)`,
    channel: 'phone',
    channels: ['phone'],
    agentType: 'phone',
    status: 'draft',
    statusText: 'Draft',
    conversations: 0,
    deflectionRate: 0,
    satisfaction: '-',
    createdAt: new Date().toISOString(),
    lastUpdated: 'Just now',
    // Initialize voice config
    voiceConfig: {
      phoneNumber: '',
      voiceType: 'nova',
      speechSpeed: 1.0,
      language: 'en-US',
      initialGreeting: '',
      holdMessage: '',
      voicemailGreeting: '',
      transferConditions: '',
      customTransferNumber: '',
      transferMessage: ''
    }
  }

  agents.value.push(duplicatedAgent)
  saveAgents()
  selectedAgentId.value = duplicatedAgent.id
  showDuplicateModal.value = false
  showNotification(`Voice agent "${duplicatedAgent.name}" created successfully!`)

  // Set active tab to BUILD so they can configure voice settings
  activeTab.value = 'build'
}

function duplicateToChat() {
  if (!selectedAgent.value) return

  const duplicatedAgent = {
    ...selectedAgent.value,
    id: Date.now(),
    name: `${selectedAgent.value.name} (Chat)`,
    channel: 'web-chat',
    channels: ['web-chat'],
    agentType: 'chat',
    status: 'draft',
    statusText: 'Draft',
    conversations: 0,
    deflectionRate: 0,
    satisfaction: '-',
    createdAt: new Date().toISOString(),
    lastUpdated: 'Just now',
    // Initialize chat config
    chatConfig: {
      primaryColor: '#000000',
      widgetPosition: 'bottom-right',
      displayName: '',
      widgetSize: 'standard',
      welcomeMessage: '',
      enableProactive: false,
      proactiveMessage: '',
      proactiveDelay: 10,
      businessHours: '',
      availabilityMessage: '',
      offlineMessage: '',
      transferEnabled: false,
      transferMessage: ''
    }
  }

  agents.value.push(duplicatedAgent)
  saveAgents()
  selectedAgentId.value = duplicatedAgent.id
  showDuplicateModal.value = false
  showNotification(`Web Chat agent "${duplicatedAgent.name}" created successfully!`)

  // Set active tab to BUILD so they can configure chat settings
  activeTab.value = 'build'
}

function confirmDeleteAgent() {
  if (!selectedAgent.value) return

  showActionsMenu.value = false
  showDeleteModal.value = true
}

function deleteAgent() {
  if (!selectedAgent.value) return

  const agentIndex = agents.value.findIndex(a => a.id === selectedAgent.value.id)
  if (agentIndex === -1) return

  const deletedAgentName = selectedAgent.value.name
  agents.value.splice(agentIndex, 1)

  // Select another agent
  if (agents.value.length > 0) {
    selectedAgentId.value = agents.value[0].id
  } else {
    selectedAgentId.value = null
  }

  saveAgents()
  showDeleteModal.value = false
  showNotification(`Agent "${deletedAgentName}" deleted successfully!`)
}

function closeDeleteModal() {
  showDeleteModal.value = false
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now'
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`
  }

  // More than 24 hours
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(isoString) {
  if (!isoString) return 'Unknown'
  const date = new Date(isoString)
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  return date.toLocaleDateString('en-US', options)
}
</script>

<style scoped>
.workspace-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fff;
  font-family: apple-system, BlinkMacSystemFont, "SF Pro", "Segoe UI Adjusted", "Segoe UI", SFMono, "Helvetica Neue", Cantarell, Ubuntu, Roboto, Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

/* Top Navigation */
.top-nav {
  height: 50px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: #fafafa;
}

.nav-left {
  flex: 1;
}

.app-title {
  font-weight: 600;
  font-size: 16px;
}

.nav-tabs {
  display: flex;
  gap: 4px;
}

.nav-tab {
  padding: 0 20px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent;
  height: 50px;
  display: flex;
  align-items: center;
  margin-bottom: -1px;
}

.nav-tab:hover {
  color: #000;
  background: #f0f0f0;
}

.nav-tab.active {
  color: #000;
  border-bottom-color: #000;
  font-weight: 600;
}

.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}

/* Profile Dropdown */
.profile-dropdown {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background 0.2s;
}

.profile-dropdown:hover {
  background: #f5f5f5;
}

.profile-email {
  font-size: 12px;
  color: #666;
}

.dropdown-arrow {
  font-size: 10px;
  color: #999;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  min-width: 180px;
  z-index: 1000;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  transition: background 0.2s;
}

.dropdown-item:first-child {
  border-radius: 4px 4px 0 0;
}

.dropdown-item:last-child {
  border-radius: 0 0 4px 4px;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

/* Main Layout */
.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Content Area */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.no-selection {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-selection-content {
  text-align: center;
}

.no-selection-content h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.no-selection-content p {
  color: #666;
  margin-bottom: 24px;
}

/* Agent Workspace */
.agent-workspace {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.workspace-header {
  padding: 20px 24px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.workspace-header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* Agent Selector Dropdown */
.agent-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.agent-selector-label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.agent-selector {
  position: relative;
  cursor: pointer;
}

.agent-selector-current {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: #fff;
  border-radius: 6px;
  min-width: 200px;
  transition: all 0.15s;
}

.agent-selector-current:hover {
  border-color: #999;
  background: #fafafa;
}

.agent-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ccc;
}

.agent-status-dot.live {
  background: #00aa00;
}

.agent-status-dot.draft {
  background: #666;
}

.agent-status-dot.paused {
  background: #ff8800;
}

.agent-selector-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #000;
}

.agent-selector-arrow {
  font-size: 10px;
  color: #999;
}

/* Dropdown Menu */
.agent-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 280px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  max-height: 400px;
  overflow-y: auto;
}

.agent-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s;
}

.agent-dropdown-item:hover {
  background: #f5f5f5;
}

.agent-dropdown-item.active {
  background: #f0f0f0;
}

.agent-dropdown-info {
  flex: 1;
}

.agent-dropdown-name {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-bottom: 2px;
}

.agent-dropdown-meta {
  font-size: 12px;
  color: #666;
}

.multi-channel-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 6px;
  background: #000;
  color: #fff;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  vertical-align: middle;
}

.agent-dropdown-divider {
  height: 1px;
  background: #eee;
  margin: 4px 0;
}

.agent-dropdown-item.new-agent {
  color: #000;
  font-weight: 500;
}

.new-agent-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #000;
}

.agent-meta {
  font-size: 13px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-status {
  font-weight: 600;
}

.meta-status.live {
  color: #00aa00;
}

.meta-status.draft {
  color: #666;
}

.meta-status.paused {
  color: #ff8800;
}

.meta-separator {
  color: #ccc;
}

.workspace-header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Agent Actions Menu */
.agent-actions-menu {
  position: relative;
}

.btn-icon-only {
  background: none;
  border: 1px solid #ddd;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon-only:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.three-dots {
  font-size: 18px;
  line-height: 1;
  color: #666;
}

.actions-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 1000;
}

.dropdown-action {
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  transition: background 0.2s;
}

.dropdown-action:hover {
  background: #f5f5f5;
}

.dropdown-action.delete {
  color: #d32f2f;
}

.dropdown-action.delete:hover {
  background: #ffebee;
}

/* Auto-save Status */
.auto-save-status {
  font-size: 13px;
  font-weight: 500;
}

.auto-save-status.saving {
  color: #ff9800;
}

.auto-save-status.saved {
  color: #4caf50;
}

/* Delete Modal */
.modal-sm {
  max-width: 400px;
}

.modal-md {
  max-width: 580px;
}

.warning-text {
  color: #d32f2f;
  font-size: 13px;
  margin-top: 8px;
}

.btn-danger {
  background: #d32f2f !important;
  border-color: #d32f2f !important;
}

.btn-danger:hover {
  background: #b71c1c !important;
}

/* Duplicate Modal */
.modal-intro {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}

.duplicate-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.duplicate-option {
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.duplicate-option:hover {
  border-color: #000;
  background: #fafafa;
}

.option-content {
  width: 100%;
}

.option-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #000;
}

.option-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

/* Unpublish Modal */
.activity-warning {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff8e1;
  border: 1px solid #ffc107;
  border-radius: 6px;
  margin-bottom: 20px;
}

.warning-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-size: 15px;
  font-weight: 600;
  color: #000;
  margin-bottom: 8px;
}

.warning-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.activity-item {
  font-size: 14px;
  color: #666;
}

.activity-count {
  font-weight: 600;
  color: #000;
}

.warning-note {
  font-size: 13px;
  color: #f57c00;
  margin: 0;
  font-weight: 500;
}

.no-activity-info {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-bottom: 20px;
}

.no-activity-info p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.unpublish-info {
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  margin-top: 20px;
}

.unpublish-info h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #000;
}

.unpublish-info ul {
  margin: 0;
  padding-left: 20px;
}

.unpublish-info li {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 4px;
}

.btn-primary,
.btn-secondary {
  padding: 8px 20px;
  border: 1px solid #000;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}

.btn-primary {
  background: #000;
  color: #fff;
}

.btn-primary:hover {
  background: #333;
}

.btn-secondary {
  background: #fff;
  color: #000;
}

.btn-secondary:hover {
  background: #f5f5f5;
}

.btn-link {
  background: none;
  border: none;
  color: #000;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.btn-link:hover {
  color: #333;
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Notification Toast */
.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  animation: slideDown 0.3s ease forwards;
}

.notification.success {
  background: #e6f4ea;
  border: 1px solid #34a853;
  color: #137333;
}

.notification.error {
  background: #fce8e6;
  border: 1px solid #ea4335;
  color: #c5221f;
}

@keyframes slideDown {
  from {
    opacity: 0;
    top: 0;
  }
  to {
    opacity: 1;
    top: 20px;
  }
}

/* Workspace Tabs */
.workspace-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  background: #fafafa;
}

.workspace-tab {
  padding: 12px 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  border-bottom: 2px solid transparent;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.workspace-tab:hover {
  color: #000;
  background: #f0f0f0;
}

.workspace-tab.active {
  color: #000;
  background: #fff;
  border-bottom-color: #000;
  font-weight: 600;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #000;
  color: white;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

/* Published Agent Dashboard */
.published-dashboard {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dashboard-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  padding: 24px;
  overflow: auto;
}

.dashboard-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dashboard-header {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
}

.dashboard-status {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.live {
  background: #4caf50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(76, 175, 80, 0.1);
  }
}

.status-text h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #000;
}

.status-text p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-change {
  font-size: 12px;
  color: #4caf50;
  font-weight: 500;
  margin-top: 4px;
}

.metric-sublabel {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.analytics-summary-section,
.cost-summary-section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
}

.analytics-quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.quick-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: #666;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #000;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.cost-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.cost-value {
  font-weight: 600;
  color: #000;
}

.cost-note {
  background: #f0f7ff;
  border: 1px solid #d0e7ff;
  border-radius: 6px;
  padding: 12px;
  font-size: 13px;
  color: #666;
}

.recent-conversations-section {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
}

.recent-conversations-section h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #000;
}

.no-conversations {
  padding: 40px 20px;
  text-align: center;
  color: #666;
}

.conversation-channel {
  font-size: 13px;
  font-weight: 500;
  color: #000;
}

.live-agent-panel {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: fit-content;
  position: sticky;
  top: 0;
  max-height: calc(100vh - 48px);
}

.live-agent-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.live-agent-header h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.live-badge {
  background: #4caf50;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.live-agent-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Tab Content */
.tab-content-area {
  flex: 1;
  overflow-y: auto;
}

.tab-panel {
  padding: 24px;
  height: 100%;
}

/* Historical Data Banner */
.historical-data-banner {
  padding: 16px;
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 6px;
  margin-bottom: 20px;
}

.banner-content {
  width: 100%;
}

.banner-title {
  font-size: 15px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.banner-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.banner-text span {
  display: block;
  font-size: 13px;
  color: #1976d2;
  margin-top: 4px;
}

/* BUILD Tab */
.build-layout {
  display: grid;
  grid-template-columns: 200px 1fr 350px;
  gap: 20px;
  height: 100%;
}

/* DEPLOY Tab - Checkout Style */
/* Live Status View (Published Agents) */
.live-status-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
}

.live-status-header {
  text-align: center;
  margin-bottom: 48px;
}

.live-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #f5f5f5;
  padding: 8px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #666;
}

.status-indicator.live {
  background: #000;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.live-status-header h2 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 8px;
}

.live-status-desc {
  font-size: 16px;
  color: #666;
}

.live-status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.live-status-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
}

.live-status-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 12px;
}

.config-item,
.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.config-item:last-child,
.stat-item:last-child {
  border-bottom: none;
}

.config-label,
.stat-label {
  font-size: 14px;
  color: #666;
}

.config-value,
.stat-value {
  font-size: 14px;
  font-weight: 500;
  color: #000;
}

.action-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.deploy-checkout-layout {
  display: grid;
  grid-template-columns: 300px 1fr 350px;
  gap: 24px;
  height: 100%;
}

.deploy-info-sidebar {
  overflow-y: auto;
  padding-right: 8px;
}

.deploy-checkout-main {
  overflow-y: auto;
  padding-right: 8px;
}

.deploy-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.deploy-header-text h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.deploy-header-text .section-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.deploy-header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

/* Review Sections */
.review-section {
  margin-bottom: 32px;
}

.review-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.review-section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #000;
}

.btn-text {
  background: none;
  border: none;
  color: #0066cc;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
}

.btn-text:hover {
  text-decoration: underline;
}

.review-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.review-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-row:last-child {
  border-bottom: none;
}

.review-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.review-value {
  font-size: 14px;
  color: #000;
  text-align: right;
  max-width: 60%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.color-preview {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.deploy-channel-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #000;
  color: #fff;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 4px;
}

.review-subsection-title {
  font-size: 15px;
  font-weight: 600;
  color: #000;
  margin: 20px 0 8px 0;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.review-subsection-title:first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.review-instructions {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  white-space: pre-wrap;
}

.review-empty {
  font-size: 14px;
  color: #999;
  text-align: center;
  padding: 24px;
}

/* Knowledge and Skills Review */
.knowledge-list-review,
.skills-list-review {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.knowledge-item-review {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.knowledge-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-bottom: 4px;
}

.knowledge-item-meta {
  font-size: 12px;
  color: #666;
}

.skill-item-review {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.skill-item-content {
  flex: 1;
}

.skill-item-name {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  margin-bottom: 4px;
}

.skill-item-desc {
  font-size: 12px;
  color: #666;
}

.skill-item-status {
  margin-left: 12px;
}

/* Status Badges */
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.draft {
  background: #fff3cd;
  color: #856404;
}

.status-badge.enabled {
  background: #d4edda;
  color: #155724;
}

.status-badge.disabled {
  background: #f8d7da;
  color: #721c24;
}

/* Deployment Sidebar */
.deploy-checkout-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.deploy-cost-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  position: sticky;
  top: 0;
}

.deploy-cost-card h4 {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin-bottom: 16px;
}

.deploy-cost-card h5 {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  margin-bottom: 12px;
  margin-top: 20px;
}

.plan-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 6px;
  margin-bottom: 8px;
}

.plan-name {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.plan-price {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.plan-includes {
  padding-top: 8px;
}

.include-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.include-label {
  color: #666;
}

.include-value {
  color: #000;
  font-weight: 500;
}

.usage-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin-top: 12px;
  overflow: hidden;
}

.usage-bar-fill {
  height: 100%;
  background: #666;
  border-radius: 3px;
}

.usage-text {
  font-size: 12px;
  color: #666;
  margin-top: 6px;
}

.additional-costs {
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
  margin-top: 12px;
}

.cost-estimate {
  border-top: 1px solid #e0e0e0;
  margin-top: 20px;
  padding-top: 16px;
}

.estimate-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
}

.estimate-row.total {
  font-weight: 600;
  color: #000;
}

.estimate-value {
  font-size: 18px;
  font-weight: 600;
  color: #000;
}

.estimate-note {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

/* Trial Status Box */
.trial-status-box {
  background: #fff9e6;
  border: 1px solid #ffe066;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.status-header {
  margin-bottom: 8px;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.trial {
  background: #ffd700;
  color: #000;
}

.trial-remaining {
  font-size: 14px;
  color: #000;
  font-weight: 500;
  margin-bottom: 4px;
}

.remaining-count {
  font-weight: 600;
  color: #000;
}

.trial-note {
  font-size: 12px;
  color: #666;
  font-style: italic;
}

/* Credit Balance Box */
.credit-balance-box {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.balance-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.balance-amount {
  font-size: 24px;
  font-weight: 600;
  color: #000;
}

.balance-conversations {
  font-size: 13px;
  color: #666;
}

/* Pricing Model */
.pricing-model {
  margin-bottom: 16px;
}

.pricing-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pricing-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pricing-details {
  flex: 1;
}

.pricing-title {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin-bottom: 2px;
}

.pricing-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* Add Credits Note */
.add-credits-note {
  background: #f0f7ff;
  border: 1px solid #d0e7ff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.note-text {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

/* What Happens When Credits Run Out */
.what-happens-box {
  background: #f0f7ff;
  border: 1px solid #d0e7ff;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.what-happens-box h5 {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  margin-bottom: 12px;
}

.what-happens-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.what-happens-list li {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  padding-left: 16px;
  position: relative;
}

.what-happens-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #000;
  font-weight: bold;
}

/* Deploy Warning Box */
.deploy-warning-box {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
}

.deploy-warning-box strong {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #000;
  margin-bottom: 8px;
}

.deploy-warning-box p {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

.checklist-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checklist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #666;
}

.checklist-item.complete {
  color: #000;
}

.checklist-icon {
  font-size: 16px;
  color: #666;
}

.checklist-item.complete .checklist-icon {
  color: #28a745;
}

.deploy-info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.deploy-info-list li {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 8px;
  padding-left: 16px;
  position: relative;
}

.deploy-info-list li:before {
  content: '•';
  position: absolute;
  left: 0;
  color: #0066cc;
}

.cost-breakdown {
  margin-bottom: 12px;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #333;
}

.cost-note {
  font-size: 12px;
  color: #999;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  margin-top: 12px;
}

.deploy-buttons .btn-primary,
.deploy-buttons .btn-secondary {
  width: 100%;
}

.deploy-btn {
  background: #000;
  border-color: #000;
}

.deploy-btn:hover {
  background: #333;
  border-color: #333;
}

.full-width {
  width: 100%;
}

/* MONITOR Tab */
.analyze-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  height: 100%;
}

.monitor-main {
  overflow-y: auto;
}

.info-box {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  font-size: 13px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 16px;
}

/* Build Section Navigator */
.build-sections-nav {
  background: #fafafa;
  padding: 16px 0;
}

.section-nav-item {
  padding: 10px 16px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: background 0.15s;
  border-left: 3px solid transparent;
}

.section-nav-item:hover {
  background: #f0f0f0;
}

.section-nav-item.active {
  background: #e8e8e8;
  color: #000;
  font-weight: 600;
  border-left-color: #000;
}

.build-main {
  overflow-y: auto;
  scroll-behavior: smooth;
}

/* Build Section Anchors */
.build-section-anchor {
  scroll-margin-top: 20px;
}

.config-section {
  margin-bottom: 32px;
}

.config-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 13px;
}

.input-field {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  font-size: 14px;
  font-family: inherit;
}

.input-field:focus {
  outline: none;
  border-color: #000;
}

textarea.input-field {
  resize: vertical;
}

.hint {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

/* Channels Section */
.section-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.channel-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
}

.channel-card.enabled {
  border-color: #000;
  background: #f9f9f9;
}

.channel-card.disabled {
  opacity: 0.6;
}

.channel-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.channel-info {
  flex: 1;
}

.channel-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #000;
}

.channel-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.channel-note {
  margin-top: 12px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.enabled-badge {
  padding: 4px 12px;
  background: #000;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.coming-soon-badge {
  padding: 4px 12px;
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

/* Channel Toggle Switch */
.channel-toggle {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  cursor: pointer;
}

.channel-toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 26px;
  transition: 0.3s;
}

.toggle-slider:before {
  content: "";
  position: absolute;
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: 0.3s;
}

.channel-toggle input:checked + .toggle-slider {
  background-color: #000;
}

.channel-toggle input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

/* Channel Config (shown when channel is enabled) */
.channel-config {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

/* Channel Configuration Styles */
.config-divider {
  height: 1px;
  background: #ddd;
  margin: 32px 0 24px;
}

.channel-config-section {
  margin-top: 24px;
}

.channel-config-section h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #000;
}

/* Collapsible Section Styles (Apple-inspired) */
.collapsible-section {
  margin-bottom: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: #fafafa;
  overflow: hidden;
  transition: all 0.2s ease;
}

.collapsible-section:hover {
  border-color: #d0d0d0;
}

.collapsible-header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  background: #fafafa;
  transition: background 0.15s ease;
}

.collapsible-header:hover {
  background: #f0f0f0;
}

.collapsible-header:active {
  background: #e8e8e8;
}

.section-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.chevron {
  font-size: 18px;
  color: #666;
  transition: transform 0.2s ease;
  font-weight: 300;
}

.chevron.expanded {
  transform: rotate(90deg);
}

.collapsible-content {
  padding: 20px 16px;
  background: #fff;
  border-top: 1px solid #e5e5e5;
  animation: expandSection 0.2s ease;
}

@keyframes expandSection {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Color Picker Styles */
.color-picker-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.color-text {
  flex: 1;
}

.slider-with-value {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #e0e0e0;
  outline: none;
  border-radius: 3px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #000;
  cursor: pointer;
  border-radius: 50%;
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #000;
  cursor: pointer;
  border-radius: 50%;
  border: none;
}

.slider-value {
  min-width: 45px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  text-align: right;
}

.section-desc-small {
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.5;
}

.deployment-subsection {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ddd;
}

.deployment-subsection h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
}

.knowledge-upload {
  border: 1px solid #ddd;
  background: #fafafa;
}

.upload-area {
  padding: 32px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

.upload-area p {
  color: #666;
  margin-bottom: 16px;
}

.knowledge-list {
  padding: 16px;
}

.knowledge-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #ddd;
  background: #fff;
  margin-bottom: 8px;
}

.knowledge-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.knowledge-details {
  font-size: 12px;
  color: #666;
}

.knowledge-status {
  font-size: 12px;
  color: #00aa00;
}

.knowledge-empty {
  text-align: center;
  padding: 24px;
  color: #666;
}

.skills-list {
  border: 1px solid #ddd;
  background: #fafafa;
  padding: 16px;
}

.skill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #ddd;
  background: #fff;
  margin-bottom: 8px;
}

.skill-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.skill-desc {
  font-size: 12px;
  color: #666;
}

.skill-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-skill-test {
  padding: 6px 16px;
  border: 1px solid #000;
  background: #fff;
  color: #000;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-skill-test:hover {
  background: #000;
  color: #fff;
}

.toggle {
  position: relative;
  width: 40px;
  height: 20px;
  cursor: pointer;
}

.toggle input {
  display: none;
}

.toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ccc;
  transition: 0.3s;
}

.toggle-slider::before {
  content: "";
  position: absolute;
  height: 14px;
  width: 14px;
  left: 3px;
  top: 3px;
  background: white;
  transition: 0.3s;
}

.toggle input:checked + .toggle-slider {
  background: #000;
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.skills-empty {
  text-align: center;
  padding: 24px;
  color: #666;
}

.btn-add {
  width: 100%;
  padding: 8px;
  border: 1px dashed #999;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  margin-top: 12px;
}

/* Conversation Flow Builder */
.flow-intro-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #ddd;
  padding: 24px;
  margin-bottom: 24px;
}

.flow-intro-content {
  max-width: 800px;
}

.flow-intro-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #000;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.flow-intro-title {
  font-size: 20px;
  font-weight: 600;
  color: #000;
  margin-bottom: 12px;
}

.flow-intro-text {
  font-size: 14px;
  color: #666;
  line-height: 1.7;
  margin-bottom: 20px;
}

.flow-intro-features {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.flow-feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
}

.flow-feature-dot {
  width: 6px;
  height: 6px;
  background: #000;
  border-radius: 50%;
  flex-shrink: 0;
}

.flow-current-status {
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 16px 20px;
  margin-bottom: 24px;
}

.flow-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.flow-status-left {
  flex: 1;
}

.flow-status-label {
  font-size: 11px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.flow-status-name {
  font-size: 15px;
  font-weight: 500;
  color: #000;
}

.flow-visual-preview {
  border: 1px solid #ddd;
  background: #fff;
}

.flow-preview-label {
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #ddd;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.flow-canvas {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0;
  padding: 32px;
  background: #fff;
  overflow-x: auto;
}

.flow-node {
  padding: 14px 18px;
  border: 2px solid #ddd;
  background: #fff;
  min-width: 140px;
  text-align: center;
  flex-shrink: 0;
}

.flow-node-start {
  border-color: #00aa00;
  background: #f0fdf4;
}

.flow-node-play {
  border-color: #0066cc;
  background: #f0f7ff;
}

.flow-node-collect {
  border-color: #cc6600;
  background: #fff8f0;
}

.flow-node-agent {
  border-color: #000;
  background: #fafafa;
}

.flow-node-end {
  border-color: #666;
  background: #f5f5f5;
}

.flow-node-label {
  font-size: 13px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.flow-node-desc {
  font-size: 11px;
  color: #666;
  line-height: 1.3;
}

.flow-connector {
  width: 32px;
  height: 2px;
  background: #ddd;
  position: relative;
  flex-shrink: 0;
}

.flow-connector::after {
  content: '';
  position: absolute;
  right: -6px;
  top: -3px;
  width: 0;
  height: 0;
  border-left: 6px solid #ddd;
  border-top: 4px solid transparent;
  border-bottom: 4px solid transparent;
}

.flow-preview-note {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #ddd;
  font-size: 13px;
  color: #666;
  line-height: 1.6;
}

/* Test Panel */
.test-panel {
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  height: 600px;
}

.channel-toggle-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border-radius: 4px;
}

.channel-toggle-btn:hover {
  background: #f5f5f5;
  border-color: #000;
}

.test-chat {
  height: 600px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.test-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.test-message {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
}

.test-message.user {
  background: #000;
  color: #fff;
  align-self: flex-end;
}

.test-message.agent {
  background: #f0f0f0;
  align-self: flex-start;
}

.test-message.typing {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
}

.test-message.typing .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #666;
  animation: typingDot 1.4s infinite;
}

.test-message.typing .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.test-message.typing .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingDot {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

.test-suggestions {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestions-label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggestions-chips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestion-chip {
  padding: 12px 16px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  color: #000;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  white-space: normal;
  line-height: 1.4;
}

.suggestion-chip:hover {
  background: #e8e8e8;
  border-color: #ccc;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.suggestion-chip:active {
  transform: translateY(0);
  box-shadow: none;
}

.test-input {
  padding: 12px;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 8px;
  background: #fff;
  flex-shrink: 0;
}

.test-input .input-field {
  flex: 1;
  margin: 0;
}

.btn-send {
  padding: 8px 20px;
  border: 1px solid #000;
  background: #000;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

/* Skill Test Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  padding: 4px 12px;
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  line-height: 1;
}

.modal-close:hover {
  color: #000;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Deploy Checkout Modal */
.deploy-checkout-modal {
  max-width: 1400px;
  width: 95%;
  max-height: 90vh;
}

.deploy-checkout-body {
  padding: 0;
  max-height: calc(90vh - 80px);
  overflow-y: auto;
}

.deploy-checkout-modal .deploy-checkout-layout {
  padding: 24px;
}

.deploy-buttons-modal {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.test-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.test-content-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ddd;
  background: #fafafa;
  font-weight: 600;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.btn-icon {
  padding: 4px 12px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 11px;
  cursor: pointer;
}

.btn-icon:hover {
  background: #f5f5f5;
}

/* Active Channels Bar */
.active-channels-bar {
  padding: 8px 16px;
  background: #f9f9f9;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
}

.channels-label {
  color: #666;
  font-weight: 500;
}

.channels-badges {
  display: flex;
  gap: 8px;
}

.channel-badge {
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.channel-badge.active {
  background: #000;
  color: #fff;
}

/* Try-Now Voice */
.voice-test-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  overflow-y: auto;
}

.voice-test-status {
  background: #f8f9fa;
  border: 1px solid #ddd;
  padding: 16px;
}

.voice-status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ccc;
}

.voice-status-indicator.idle .status-dot {
  background: #666;
}

.voice-status-indicator.connecting .status-dot {
  background: #ff8800;
  animation: pulse 1.5s infinite;
}

.voice-status-indicator.connected .status-dot {
  background: #00aa00;
  animation: pulse 1.5s infinite;
}

.voice-status-indicator.ended .status-dot {
  background: #cc0000;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.voice-test-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.info-label {
  color: #666;
  font-weight: 500;
}

.info-value {
  color: #000;
  font-weight: 600;
}

.btn-voice-call {
  width: 100%;
  padding: 8px 16px;
  border: 1px solid #000;
  background: #000;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 12px;
}

.btn-voice-call:hover {
  background: #333;
  border-color: #333;
}

.btn-voice-end {
  width: 100%;
  padding: 8px 16px;
  border: 1px solid #cc0000;
  background: #cc0000;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 12px;
}

.btn-voice-end:hover {
  background: #bb0000;
  border-color: #bb0000;
}

.voice-connecting {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 13px;
  color: #666;
  margin-top: 12px;
  padding: 8px 16px;
}

.voice-test-transcript {
  flex: 1;
  border: 1px solid #ddd;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.transcript-header {
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #ddd;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
}

.transcript-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transcript-message {
  padding: 12px;
  border: 1px solid #ddd;
  background: #fafafa;
}

.transcript-message.user {
  background: #f0f7ff;
  border-color: #0066cc;
}

.transcript-message.agent {
  background: #f0fdf4;
  border-color: #00aa00;
}

.transcript-speaker {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 4px;
}

.transcript-text {
  font-size: 13px;
  line-height: 1.5;
  color: #000;
  margin-bottom: 4px;
}

.transcript-time {
  font-size: 11px;
  color: #999;
}

.transcript-empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 13px;
}

/* Skills Playground */
.skills-playground {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.playground-skill-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playground-skill-selector label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.playground-test-area {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.playground-input-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playground-input-section label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.playground-result-section {
  border: 1px solid #ddd;
  background: #fafafa;
}

.result-header {
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
}

.result-status {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-status.success {
  background: #d4f4dd;
  color: #00aa00;
}

.result-status.error {
  background: #ffd4d4;
  color: #cc0000;
}

.result-content {
  padding: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
  background: #fff;
  border-bottom: 1px solid #ddd;
}

.result-logs {
  background: #f5f5f5;
}

.logs-header {
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #666;
  letter-spacing: 0.5px;
}

.logs-content {
  padding: 0 16px 16px 16px;
}

.log-entry {
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 11px;
  line-height: 1.8;
  color: #333;
}

.playground-empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.playground-empty p {
  margin-bottom: 16px;
  font-size: 13px;
}

/* TEST Tab */
.test-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  height: 100%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 20px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.scenarios-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scenario-card {
  padding: 20px;
  border: 1px solid #ddd;
  background: #fafafa;
  transition: all 0.3s;
}

.scenario-card.running {
  border-color: #4285f4;
  background: #f0f7ff;
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.scenario-name {
  font-weight: 600;
  font-size: 16px;
}

.btn-run {
  padding: 6px 16px;
  border: 1px solid #000;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
}

.btn-run:hover {
  background: #000;
  color: #fff;
}

.scenario-prompt {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.scenario-result {
  padding: 12px;
  background: #fff;
  border: 1px solid #ddd;
}

.result-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}

.result-text {
  font-size: 13px;
}

.scenario-loading {
  padding: 12px;
  background: #f0f7ff;
  border: 1px solid #4285f4;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #666;
  margin-top: 12px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4285f4;
  animation: loadingDot 1.4s infinite;
}

.loading-dots .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes loadingDot {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  30% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.btn-run:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.scenarios-empty {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

/* DEPLOY Tab */
.deploy-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  height: 100%;
}

.deploy-section {
  margin-bottom: 40px;
}

.deploy-section h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.section-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

/* Channel Deployment Container */
.channels-deployment-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.channel-section-header {
  padding: 16px 20px;
  background: #f5f5f5;
  border-left: 4px solid #000;
  margin-bottom: 16px;
}

.channel-section-header.additional-channels-header {
  border-left-color: #666;
  background: #fafafa;
  margin-top: 32px;
}

.section-header-title {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.section-header-desc {
  font-size: 13px;
  color: #666;
}

.channels-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.channels-grid-single {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 50%;
  gap: 20px;
}

.channel-card {
  padding: 20px;
  border: 2px solid #ddd;
  background: #fafafa;
  transition: all 0.3s;
}

.channel-card.enabled {
  border-color: #000;
  background: #fff;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.channel-header-content {
  flex: 1;
}

.channel-name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
  color: #000;
}

.channel-card:not(.enabled) .channel-name {
  color: #999;
}

.channel-desc {
  font-size: 13px;
  color: #666;
}

.channel-card:not(.enabled) .channel-desc {
  color: #aaa;
}

/* iOS-Style Toggle Switch */
.channel-toggle {
  position: relative;
  width: 44px;
  height: 24px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
}

.channel-toggle input {
  display: none;
}

.channel-toggle-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #e0e0e0;
  border-radius: 24px;
  transition: all 0.25s;
}

.channel-toggle-slider::before {
  content: "";
  position: absolute;
  height: 20px;
  width: 20px;
  left: 2px;
  top: 2px;
  background: white;
  border-radius: 50%;
  transition: all 0.25s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.channel-toggle input:checked + .channel-toggle-slider {
  background: #34c759;
}

.channel-toggle input:checked + .channel-toggle-slider::before {
  transform: translateX(20px);
}

.channel-toggle:hover .channel-toggle-slider {
  background: #d0d0d0;
}

.channel-toggle input:checked:hover + .channel-toggle-slider {
  background: #2fb350;
}

.channel-config {
  padding-top: 16px;
  margin-top: 16px;
  border-top: 1px solid #ddd;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.config-item {
  margin-bottom: 12px;
}

.config-item label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}

.input-field-small {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ccc;
  font-size: 13px;
  font-family: inherit;
}

textarea.input-field-small {
  resize: vertical;
}

.code-block {
  padding: 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.6;
  margin-bottom: 12px;
  overflow-x: auto;
}

.status-card {
  padding: 20px;
  border: 1px solid #ddd;
  background: #fafafa;
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ccc;
}

.status-indicator.live {
  background: #00aa00;
}

.status-indicator.draft {
  background: #666;
}

.status-indicator.paused {
  background: #ff8800;
}

.status-info {
  flex: 1;
}

.status-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
}

.status-value {
  font-size: 18px;
  font-weight: 600;
}

/* ANALYZE Tab */
.analyze-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
  height: 100%;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.metric-card {
  padding: 20px;
  border: 1px solid #ddd;
  background: #fafafa;
}

.metric-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.metric-value {
  font-size: 32px;
  font-weight: 600;
}

.no-data {
  text-align: center;
  padding: 60px 20px;
}

.no-data h3 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.no-data p {
  color: #666;
  margin-bottom: 24px;
}

.chart-section h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.chart-placeholder {
  height: 300px;
  border: 1px solid #ddd;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

/* COMPASS Validation Panel */
.validation-panel {
  margin-bottom: 24px;
  border: 2px solid #ff8800;
  background: #fff9f0;
}

.validation-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  background: #fff4e5;
  border-bottom: 1px solid #ffcc80;
}

.validation-header:hover {
  background: #ffe8cc;
}

.validation-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
}

.validation-icon {
  font-size: 16px;
}

.validation-toggle {
  width: 24px;
  height: 24px;
  border: 1px solid #ff8800;
  background: #fff;
  color: #ff8800;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
}

.validation-content {
  padding: 16px;
}

.validation-message {
  padding: 12px;
  margin-bottom: 8px;
  border-left: 4px solid;
  background: #fff;
}

.validation-message.error {
  border-left-color: #ea4335;
  background: #fce8e6;
}

.validation-message.warning {
  border-left-color: #ff8800;
  background: #fff4e5;
}

.validation-message.info {
  border-left-color: #4285f4;
  background: #f0f7ff;
}

.validation-msg-header {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
  align-items: center;
}

.validation-severity {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 2px;
}

.validation-message.error .validation-severity {
  background: #ea4335;
  color: #fff;
}

.validation-message.warning .validation-severity {
  background: #ff8800;
  color: #fff;
}

.validation-message.info .validation-severity {
  background: #4285f4;
  color: #fff;
}

.validation-field {
  font-weight: 600;
  font-size: 12px;
  color: #333;
}

.validation-msg-text {
  font-size: 13px;
  line-height: 1.5;
  color: #333;
}

/* Conversation History */
.conversation-history-section {
  margin-top: 40px;
}

.conversation-history-section h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.conversations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.conversation-card {
  padding: 16px;
  border: 1px solid #ddd;
  background: #fafafa;
  transition: all 0.2s;
}

.conversation-card:hover {
  border-color: #999;
  background: #f5f5f5;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ddd;
}

.conversation-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.conversation-type {
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.conversation-scenario {
  font-size: 12px;
  padding: 2px 8px;
  background: #e0e0e0;
  color: #333;
  border-radius: 2px;
}

.conversation-time {
  font-size: 12px;
  color: #999;
}

.conversation-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-message {
  font-size: 13px;
  line-height: 1.5;
}

.preview-message.user {
  color: #333;
}

.preview-message.agent {
  color: #666;
}

.preview-message strong {
  font-weight: 600;
}

/* Skills Builder Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s;
}

.modal-dialog {
  background: #fff;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

.modal-dialog-large {
  max-width: 900px;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.modal-close:hover {
  color: #000;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Deploy Overlay Styles */
.deploy-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.deploy-overlay-content {
  background: #fff;
  width: 95vw;
  height: 95vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.deploy-overlay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
  flex-shrink: 0;
}

.deploy-overlay-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #000;
  margin: 0;
}

.deploy-overlay-header .btn-text {
  font-size: 16px;
  padding: 8px 16px;
}

.deploy-checkout-layout {
  display: grid;
  grid-template-columns: 300px 1fr 350px;
  gap: 24px;
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

.deploy-checkout-left {
  overflow-y: auto;
  padding-right: 8px;
}

.deploy-checkout-main {
  overflow-y: auto;
  padding-right: 8px;
}

.deploy-checkout-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
