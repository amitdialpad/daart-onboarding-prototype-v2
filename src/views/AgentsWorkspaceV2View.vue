<template>
  <div class="workspace-v2">
    <!-- No Agent Selected -->
    <div v-if="!agent" class="no-agent-state">
      <p>Agent not found</p>
      <router-link to="/onboarding-v2" class="btn-primary">Create New Agent</router-link>
    </div>

    <!-- Agent Workspace -->
    <div v-else class="agent-workspace">
      <!-- Workspace Header -->
      <div class="workspace-header">
        <div class="header-left">
          <h1 class="agent-name">{{ agent.name }}</h1>
          <div class="agent-meta">
            <span class="meta-badge" :class="agent.status">
              {{ agent.status === 'live' ? 'Live' : 'Draft' }}
            </span>
            <span class="meta-divider">·</span>
            <span class="meta-type">{{ agentTypeLabel }}</span>
            <span v-if="activeChannelLabels.length > 0" class="meta-divider">·</span>
            <span v-for="(channel, index) in activeChannelLabels" :key="index" class="channel-badge">
              {{ channel }}
            </span>
            <span v-if="autoSaving" class="meta-divider">·</span>
            <span v-if="autoSaving" class="auto-save-status saving">Saving...</span>
            <span v-else-if="lastSaved" class="meta-divider">·</span>
            <span v-else-if="lastSaved" class="auto-save-status saved">Saved</span>
          </div>
          <!-- Unpublished Changes Alert (below meta) -->
          <div v-if="agent.status === 'live' && hasUnpublishedChanges" class="unpublished-changes-alert">
            ⚠️ You have unpublished changes. Click "Publish Update" to deploy.
          </div>
        </div>
        <div class="header-right">
          <!-- Agent Actions Menu (3-dot menu) - Hide during wizard mode -->
          <div v-if="agent && !wizardMode" class="agent-actions-menu" ref="actionsMenu">
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

          <button
            v-if="(agent.status === 'draft' || hasUnpublishedChanges) && !wizardMode"
            class="btn-primary"
            @click="navigateToDeploy">
            {{ agent.status === 'live' ? 'Publish Update' : 'Review & Deploy' }}
          </button>
        </div>
      </div>

      <!-- Tab Content (NO duplicate tab navigation - it's in sidebar) -->
      <div class="workspace-main">
        <!-- BUILD Tab Content -->
        <div v-if="activeTab === 'build'" class="build-layout" :class="{ 'wizard-active': wizardMode }">
          <!-- WIZARD MODE: Full-width wizard steps -->
          <div v-if="wizardMode" class="wizard-container">
            <div class="wizard-header">
              <div class="wizard-progress">
                <div class="wizard-step-indicator">
                  Step {{ wizardStep }} of {{ totalWizardSteps }}
                </div>
                <div class="wizard-progress-bar">
                  <div class="wizard-progress-fill" :style="{ width: (wizardStep / totalWizardSteps * 100) + '%' }"></div>
                </div>
              </div>
              <button class="wizard-skip" @click="skipWizard">Skip Wizard</button>
            </div>

            <!-- Wizard Step Content -->
            <div class="wizard-step-content">
              <!-- Step 1: Test your agent live -->
              <div v-if="wizardStep === 1" class="wizard-step wizard-step-split">
                <!-- Left Side: Configuration -->
                <div class="wizard-left">
                  <h2>Test your agent</h2>
                  <p class="wizard-step-description">Try it now to see how it responds</p>

                  <div class="form-group">
                    <label>Agent Name</label>
                    <input
                      v-model="agent.name"
                      @input="handleInputChange"
                      type="text"
                      class="input-field"
                      placeholder="e.g., Customer Support Agent">
                  </div>

                  <div class="form-group">
                    <label>Primary Channel</label>
                    <div class="channel-toggle-group">
                      <div class="channel-toggle-item active">
                        <div class="channel-toggle-content">
                          <div class="channel-toggle-name">Website Chat</div>
                          <div class="channel-toggle-status">Enabled by default</div>
                        </div>
                      </div>
                      <div class="channel-toggle-item clickable" :class="{ active: agent.channels?.voice?.enabled }" @click="agent.channels.voice.enabled = !agent.channels.voice.enabled; handleInputChange()">
                        <div class="channel-toggle-content">
                          <div class="channel-toggle-name">Voice (Phone)</div>
                          <div class="channel-toggle-status">{{ agent.channels?.voice?.enabled ? 'Enabled' : 'Click to enable' }}</div>
                        </div>
                      </div>
                    </div>
                    <div class="hint">Additional channels like SMS can be enabled later in the BUILD tab</div>
                  </div>

                  <div class="form-group">
                    <div class="collapsible-header" @click="showInstructions = !showInstructions">
                      <label style="margin: 0; cursor: pointer;">Behavior Instructions</label>
                      <span class="collapse-icon">{{ showInstructions ? '−' : '+' }}</span>
                    </div>
                    <div v-if="showInstructions" class="collapsible-content">
                      <textarea
                        v-model="agent.instructions"
                        @input="handleInputChange; resetTestChat()"
                        rows="8"
                        class="input-field"
                        placeholder="Describe how your agent should respond..."></textarea>
                      <div class="hint">Pre-filled based on your template. Edit to customize behavior.</div>
                    </div>
                  </div>

                  <!-- Step 1 Navigation (embedded in left column) -->
                  <div class="wizard-step-navigation">
                    <button
                      class="btn-primary btn-block"
                      @click="nextWizardStep">
                      Next: Add Knowledge →
                    </button>
                  </div>
                </div>

                <!-- Right Side: Live Test -->
                <div class="wizard-right">
                  <div class="test-panel">
                    <div class="test-panel-header">
                      <h3>Try it now!</h3>
                      <button v-if="testMessages.length > 0" class="btn-reset-chat" @click="resetTestChat">Reset Chat</button>
                    </div>

                    <div class="test-info-notice">
                      <div class="notice-icon">ℹ️</div>
                      <div class="notice-text">
                        <strong>Using template data:</strong> Responses are based on placeholder info. Customize this data in the next step to match your business.
                      </div>
                    </div>

                    <!-- Scrollable Content Area -->
                    <div class="test-chat-container" ref="testChatContainer">
                      <div v-if="testMessages.length === 0" class="test-welcome">
                        <p>👋 Test your agent by sending a message</p>
                      </div>
                      <div v-else class="test-messages">
                        <div v-for="(msg, index) in testMessages" :key="index" class="test-message" :class="msg.role">
                          <div class="message-bubble">{{ msg.content }}</div>
                        </div>
                        <div v-if="testIsThinking" class="test-message assistant">
                          <div class="message-bubble thinking">
                            <span class="typing-dot"></span>
                            <span class="typing-dot"></span>
                            <span class="typing-dot"></span>
                          </div>
                        </div>
                      </div>

                      <!-- Suggested Prompts (Always visible) -->
                      <div class="test-suggestions">
                        <p class="suggestions-label">{{ testMessages.length === 0 ? 'Try asking:' : 'You can also ask:' }}</p>
                        <button
                          v-for="(suggestion, index) in dynamicTestSuggestions"
                          :key="index"
                          class="suggestion-button"
                          @click="askSuggestion(suggestion)"
                          :disabled="testIsThinking">
                          {{ suggestion }}
                        </button>
                      </div>
                    </div>

                    <!-- Input (Fixed at bottom) -->
                    <div class="test-input-container">
                      <input
                        v-model="testInput"
                        @keyup.enter="sendTestMessage"
                        type="text"
                        class="test-input"
                        placeholder="Ask me anything..."
                        :disabled="testIsThinking">
                      <button
                        @click="sendTestMessage"
                        class="btn-send"
                        :disabled="!testInput.trim() || testIsThinking">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 2: Add knowledge -->
              <div v-if="wizardStep === 2" class="wizard-step">
                <h2>Add knowledge <span class="optional-badge">(Optional)</span></h2>
                <p class="wizard-step-description">Add information your agent can reference when answering questions</p>

                <!-- Knowledge Source Tabs -->
                <div class="knowledge-tabs">
                  <button
                    class="knowledge-tab"
                    :class="{ active: wizardKnowledgeTab === 'documents' }"
                    @click="wizardKnowledgeTab = 'documents'">
                    Documents
                  </button>
                  <button
                    class="knowledge-tab"
                    :class="{ active: wizardKnowledgeTab === 'conversations' }"
                    @click="wizardKnowledgeTab = 'conversations'">
                    Conversations
                  </button>
                  <button
                    class="knowledge-tab"
                    :class="{ active: wizardKnowledgeTab === 'text' }"
                    @click="wizardKnowledgeTab = 'text'">
                    Snippets
                  </button>
                  <button
                    class="knowledge-tab"
                    :class="{ active: wizardKnowledgeTab === 'website' }"
                    @click="wizardKnowledgeTab = 'website'">
                    Websites
                  </button>
                </div>

                <!-- Documents Tab -->
                <div v-if="wizardKnowledgeTab === 'documents'" class="knowledge-tab-content">
                  <div class="upload-area">
                    <div class="upload-icon">📄</div>
                    <h3>Upload documents</h3>
                    <p>Add PDFs, Word docs, or text files for your agent to learn from</p>
                    <button class="btn-secondary">Choose Files</button>
                    <div class="upload-hint">Supported: PDF, DOCX, TXT, CSV (Max 10MB each)</div>
                  </div>
                  <div class="feature-note">
                    <p><strong>Note:</strong> Document upload will be functional after completing the wizard. For now, you can add text content or website URLs.</p>
                  </div>
                </div>

                <!-- Conversations Tab -->
                <div v-if="wizardKnowledgeTab === 'conversations'" class="knowledge-tab-content">
                  <div class="upload-area">
                    <div class="upload-icon">💬</div>
                    <h3>Import conversations</h3>
                    <p>Upload past conversations to train your agent (CSV or JSON format)</p>
                    <button class="btn-secondary">Upload Conversations</button>
                    <div class="upload-hint">CSV or JSON format (Max 5MB each)</div>
                  </div>
                  <div class="feature-note">
                    <p><strong>Note:</strong> Conversation import will be functional after completing the wizard.</p>
                  </div>
                </div>

                <!-- Snippets Tab -->
                <div v-if="wizardKnowledgeTab === 'text'" class="knowledge-tab-content">
                  <div class="form-group">
                    <label>Knowledge Base Content</label>
                    <textarea
                      v-model="wizardKnowledge"
                      @input="handleInputChange"
                      rows="10"
                      class="input-field knowledge-textarea"
                      placeholder="Add your company information, FAQs, policies, product details...

Example:
Company: Acme Inc.
Support Hours: Mon-Fri, 9 AM - 5 PM EST

Products:
- Widget Pro: Enterprise solution for businesses
- Widget Lite: Perfect for individual users

Policies:
- Returns: 30-day money-back guarantee
- Shipping: Free on orders over $50"></textarea>
                    <div class="hint">Pre-filled with template data. Edit to match your business.</div>
                  </div>
                </div>

                <!-- Websites Tab -->
                <div v-if="wizardKnowledgeTab === 'website'" class="knowledge-tab-content">
                  <div class="form-group">
                    <label>Website URL</label>
                    <input
                      v-model="wizardWebsiteUrl"
                      type="url"
                      class="input-field"
                      placeholder="https://yourcompany.com/help">
                    <div class="hint">We'll automatically sync content from this website</div>
                  </div>
                  <button class="btn-secondary" @click="addWebsiteUrl" :disabled="!wizardWebsiteUrl.trim()">
                    Add Website
                  </button>
                  <div v-if="wizardWebsites.length > 0" class="added-websites">
                    <h4>Added Websites</h4>
                    <div v-for="(site, index) in wizardWebsites" :key="index" class="website-item">
                      <span class="website-url">{{ site }}</span>
                      <button class="btn-remove" @click="removeWebsiteUrl(index)">×</button>
                    </div>
                  </div>
                </div>

                <div class="wizard-skip-note">
                  <p><strong>Skip for now?</strong> You can add more knowledge later from the Knowledge section.</p>
                </div>
              </div>

              <!-- Completion Step -->
              <div v-if="wizardStep > totalWizardSteps" class="wizard-step wizard-complete">
                <h2>You're all set!</h2>
                <p class="wizard-step-description">Your agent is ready to test. Let's make sure it works as expected.</p>

                <div class="wizard-next-steps">
                  <div class="next-step-card">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <h4>Test your agent</h4>
                      <p>Create test scenarios and validate responses</p>
                    </div>
                  </div>
                  <div class="next-step-card">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <h4>Deploy when ready</h4>
                      <p>Review configuration and publish to go live</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Wizard Navigation (hidden for Step 1 - has embedded nav) -->
            <div v-if="wizardStep !== 1" class="wizard-navigation">
              <button
                v-if="wizardStep > 1"
                class="btn-secondary"
                @click="prevWizardStep">
                ← Back
              </button>
              <button
                v-if="wizardStep <= totalWizardSteps"
                class="btn-primary"
                @click="nextWizardStep">
                {{ wizardStep === totalWizardSteps ? 'Complete Setup →' : 'Next →' }}
              </button>
              <button
                v-else
                class="btn-primary"
                @click="completeWizard">
                Go to Testing →
              </button>
            </div>
          </div>

          <!-- EXPERT MODE: Horizontal tabs layout -->
          <template v-else>
            <!-- Horizontal Build Tabs -->
            <div class="build-tabs-nav">
              <div
                v-for="section in buildSections"
                :key="section.id"
                class="build-tab-item"
                :class="{ active: activeBuildSection === section.id }"
                @click="activeBuildSection = section.id">
                {{ section.label }}
              </div>
            </div>

          <!-- Build Content Container (2 columns: main + test panel) -->
          <div class="build-content-wrapper">
          <!-- Main Content -->
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
            <div v-if="activeBuildSection === 'configuration'" id="configuration" class="config-section build-section-anchor">
              <h3>Configuration</h3>

              <AIAssistant context="configuration" />

              <div class="form-group">
                <label>Agent Name</label>
                <input
                  v-model="agent.name"
                  @input="handleInputChange"
                  type="text"
                  class="input-field">
              </div>

              <div class="form-group">
                <label>Behavior Instructions</label>
                <textarea
                  v-model="agent.instructions"
                  @input="handleInputChange"
                  rows="6"
                  class="input-field"></textarea>
                <div class="hint">Guide how your agent should respond to customers</div>
              </div>

              <!-- Channels & Integrations -->
              <div class="subsection">
                <h4>Channels & Integrations</h4>
                <p class="section-intro">Enable and configure where your agent is available</p>

                <!-- Web Chat Channel -->
                <div class="channel-block">
                  <div class="channel-header">
                    <div class="channel-info">
                      <h4>Web Chat</h4>
                      <p class="channel-description">Embedded chat widget on your website</p>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="agent.channels.webChat.enabled" @change="handleInputChange">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div v-if="agent.channels.webChat.enabled" class="channel-config">
                    <!-- Messages & Greetings -->
                    <div class="collapsible-section">
                      <div class="collapsible-header" @click="toggleConfigSection('chatMessages')">
                        <span class="section-title">Messages & Greetings</span>
                        <span class="chevron" :class="{ expanded: configSections.chatMessages }">›</span>
                      </div>
                      <div v-if="configSections.chatMessages" class="collapsible-content">
                        <div class="form-group">
                          <label>Welcome Message</label>
                          <textarea
                            v-model="agent.channels.webChat.welcomeMessage"
                            @input="handleInputChange"
                            rows="2"
                            class="input-field"
                            placeholder="Hi! How can I help you today?"></textarea>
                          <div class="hint">First message when the chat widget opens</div>
                        </div>

                        <div class="form-group">
                          <label>
                            <input type="checkbox" v-model="agent.channels.webChat.enableProactive" @change="handleInputChange">
                            Enable Proactive Greeting
                          </label>
                          <textarea
                            v-if="agent.channels.webChat.enableProactive"
                            v-model="agent.channels.webChat.proactiveMessage"
                            @input="handleInputChange"
                            rows="2"
                            class="input-field"
                            placeholder="👋 Need help? I'm here to assist!"></textarea>
                          <div class="hint">Auto-popup message to engage visitors</div>
                        </div>

                        <div class="form-group">
                          <label>Expected Response Time</label>
                          <input
                            v-model="agent.channels.webChat.responseTime"
                            @input="handleInputChange"
                            type="text"
                            class="input-field"
                            placeholder="Usually replies in 2 minutes">
                          <div class="hint">Set customer expectations</div>
                        </div>

                        <div class="form-group">
                          <label>
                            <input type="checkbox" v-model="agent.channels.webChat.showTypingIndicator" @change="handleInputChange">
                            Show Typing Indicator
                          </label>
                          <div class="hint">Show "..." when agent is typing</div>
                        </div>

                        <div class="form-group">
                          <label>Away Message</label>
                          <textarea
                            v-model="agent.channels.webChat.awayMessage"
                            @input="handleInputChange"
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
                          <input
                            v-model="agent.channels.webChat.businessHours"
                            @input="handleInputChange"
                            type="text"
                            class="input-field"
                            placeholder="Monday-Friday, 9 AM - 5 PM EST">
                          <div class="hint">When is the agent available?</div>
                        </div>

                        <div class="form-group">
                          <label>Offline Behavior</label>
                          <select v-model="agent.channels.webChat.offlineBehavior" @change="handleInputChange" class="input-field">
                            <option value="show-message">Show offline message</option>
                            <option value="collect-email">Collect email for follow-up</option>
                            <option value="always-on">Always available (24/7)</option>
                          </select>
                        </div>

                        <div v-if="agent.channels.webChat.offlineBehavior !== 'always-on'" class="form-group">
                          <label>Offline Message</label>
                          <textarea
                            v-model="agent.channels.webChat.offlineMessage"
                            @input="handleInputChange"
                            rows="2"
                            class="input-field"
                            placeholder="We're currently offline. Leave your email and we'll get back to you!"></textarea>
                        </div>

                        <div class="form-group">
                          <label>Auto-away Timeout (minutes)</label>
                          <input
                            v-model="agent.channels.webChat.autoAwayTimeout"
                            @input="handleInputChange"
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
                          <textarea
                            v-model="agent.channels.webChat.transferConditions"
                            @input="handleInputChange"
                            rows="3"
                            class="input-field"
                            placeholder="e.g., Transfer if customer asks for human agent, mentions refund, or expresses frustration"></textarea>
                          <div class="hint">When should the agent transfer to a human?</div>
                        </div>

                        <div class="form-group">
                          <label>Transfer Destination</label>
                          <select v-model="agent.channels.webChat.transferDestination" @change="handleInputChange" class="input-field">
                            <option value="">Select destination</option>
                            <option value="support-queue">Support Queue</option>
                            <option value="sales-queue">Sales Queue</option>
                            <option value="technical-queue">Technical Queue</option>
                            <option value="manager-queue">Manager Queue</option>
                          </select>
                        </div>

                        <div class="form-group">
                          <label>Handoff Message</label>
                          <textarea
                            v-model="agent.channels.webChat.handoffMessage"
                            @input="handleInputChange"
                            rows="2"
                            class="input-field"
                            placeholder="Let me connect you with a team member who can help..."></textarea>
                          <div class="hint">What the user sees during transfer</div>
                        </div>

                        <div class="form-group">
                          <label>Context to Transfer</label>
                          <textarea
                            v-model="agent.channels.webChat.contextToTransfer"
                            @input="handleInputChange"
                            rows="2"
                            class="input-field"
                            placeholder="Full conversation history, user info, detected intent"></textarea>
                          <div class="hint">What information to pass to the human agent</div>
                        </div>

                        <div class="form-group">
                          <label>
                            <input type="checkbox" v-model="agent.channels.webChat.enableTranscript" @change="handleInputChange">
                            Enable Email Transcript
                          </label>
                          <div class="hint">Send chat history to customer via email</div>
                        </div>
                      </div>
                    </div>

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
                            <input
                              v-model="agent.channels.webChat.primaryColor"
                              @input="handleInputChange"
                              type="color"
                              class="color-input">
                            <input
                              v-model="agent.channels.webChat.primaryColor"
                              @input="handleInputChange"
                              type="text"
                              class="input-field color-text"
                              placeholder="#6366f1">
                          </div>
                          <div class="hint">Main color for the chat widget</div>
                        </div>

                        <div class="form-group">
                          <label>Widget Position</label>
                          <select v-model="agent.channels.webChat.widgetPosition" @change="handleInputChange" class="input-field">
                            <option value="bottom-right">Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="top-left">Top Left</option>
                          </select>
                        </div>

                        <div class="form-group">
                          <label>Agent Display Name</label>
                          <input
                            v-model="agent.channels.webChat.displayName"
                            @input="handleInputChange"
                            type="text"
                            class="input-field"
                            placeholder="Support Assistant">
                          <div class="hint">Name shown to customers in the chat widget</div>
                        </div>

                        <div class="form-group">
                          <label>Widget Size</label>
                          <select v-model="agent.channels.webChat.widgetSize" @change="handleInputChange" class="input-field">
                            <option value="compact">Compact</option>
                            <option value="standard">Standard</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Voice/Phone Channel -->
                <div class="channel-block">
                  <div class="channel-header">
                    <div class="channel-info">
                      <h4>Voice (Phone Calls)</h4>
                      <p class="channel-description">Inbound and outbound phone conversations</p>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="agent.channels.voice.enabled" @change="handleInputChange">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div v-if="agent.channels.voice.enabled" class="channel-config">
                    <div class="form-group">
                      <label>Phone Number</label>
                      <input
                        v-model="agent.channels.voice.phoneNumber"
                        @input="handleInputChange"
                        type="text"
                        class="input-field"
                        placeholder="+1 (555) 000-0000">
                      <div class="hint">Get a phone number for your agent</div>
                    </div>

                    <div class="form-group">
                      <label>Voice Type</label>
                      <select v-model="agent.channels.voice.voiceType" @change="handleInputChange" class="input-field">
                        <option value="nova">Nova (Female, Conversational)</option>
                        <option value="alloy">Alloy (Neutral, Professional)</option>
                        <option value="echo">Echo (Male, Warm)</option>
                        <option value="fable">Fable (Male, Expressive)</option>
                        <option value="onyx">Onyx (Male, Deep)</option>
                        <option value="shimmer">Shimmer (Female, Bright)</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label>Greeting Message</label>
                      <textarea
                        v-model="agent.channels.voice.greeting"
                        @input="handleInputChange"
                        rows="2"
                        class="input-field"
                        placeholder="Hello! How can I assist you today?"></textarea>
                    </div>

                    <div class="form-group">
                      <label>Ending Message</label>
                      <textarea
                        v-model="agent.channels.voice.endingMessage"
                        @input="handleInputChange"
                        rows="2"
                        class="input-field"
                        placeholder="Thank you for calling. Have a great day!"></textarea>
                    </div>

                    <div class="form-group">
                      <label>Speech Speed</label>
                      <input
                        v-model="agent.channels.voice.speechSpeed"
                        @input="handleInputChange"
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        class="range-input">
                      <div class="range-value">{{ agent.channels.voice.speechSpeed }}x</div>
                    </div>

                    <div class="form-group">
                      <label>Language</label>
                      <select v-model="agent.channels.voice.language" @change="handleInputChange" class="input-field">
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Spanish</option>
                        <option value="fr-FR">French</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- SMS Channel -->
                <div class="channel-block">
                  <div class="channel-header">
                    <div class="channel-info">
                      <h4>SMS / Text Messages</h4>
                      <p class="channel-description">Two-way text messaging with customers</p>
                    </div>
                    <label class="toggle-switch">
                      <input type="checkbox" v-model="agent.channels.sms.enabled" @change="handleInputChange">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>

                  <div v-if="agent.channels.sms.enabled" class="channel-config">
                    <div class="form-group">
                      <label>SMS Number</label>
                      <input
                        v-model="agent.channels.sms.smsNumber"
                        @input="handleInputChange"
                        type="text"
                        class="input-field"
                        placeholder="+1 (555) 987-6543">
                      <div class="hint">Get an SMS-enabled number</div>
                    </div>

                    <div class="form-group checkbox-group">
                      <label>
                        <input type="checkbox" v-model="agent.channels.sms.autoReply" @change="handleInputChange">
                        Enable Auto-Reply
                      </label>
                      <div class="hint">Send automatic responses to incoming texts</div>
                    </div>

                    <div v-if="agent.channels.sms.autoReply" class="form-group">
                      <label>Auto-Reply Message</label>
                      <textarea
                        v-model="agent.channels.sms.autoReplyMessage"
                        @input="handleInputChange"
                        rows="2"
                        class="input-field"
                        placeholder="Thanks for texting! I'll respond shortly."></textarea>
                    </div>
                  </div>
                </div>

                <!-- Coming Soon Channels -->
                <div class="channel-block disabled">
                  <div class="channel-header">
                    <div class="channel-info">
                      <h4>WhatsApp Business</h4>
                      <span class="coming-soon-badge">Coming Soon</span>
                    </div>
                  </div>
                </div>

                <div class="channel-block disabled">
                  <div class="channel-header">
                    <div class="channel-info">
                      <h4>Instagram DMs</h4>
                      <span class="coming-soon-badge">Coming Soon</span>
                    </div>
                  </div>
                </div>

                <div class="channel-block disabled">
                  <div class="channel-header">
                    <div class="channel-info">
                      <h4>Facebook Messenger</h4>
                      <span class="coming-soon-badge">Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sources -->
            <div v-if="activeBuildSection === 'knowledge-base'" id="knowledge-base" class="config-section build-section-anchor">
              <h3>Sources</h3>
              <p class="section-intro">Manage knowledge sources for your agent to reference when answering questions</p>

              <AIAssistant context="knowledge" />

              <!-- Connected Sources Section -->
              <div class="sources-main-section">
                <h4 class="sources-section-title">Connected sources</h4>
                <div v-if="hasAnyConnectedSources" class="connected-sources-list">
                  <!-- Connected Integrations -->
                  <div v-if="agent.knowledgeSources.integrations && agent.knowledgeSources.integrations.length > 0">
                    <div class="source-type-label">Integrations</div>
                    <div v-for="integration in agent.knowledgeSources.integrations" :key="integration.id" class="connected-item">
                      <div class="connected-item-info">
                        <strong>{{ integration.name }}</strong>
                        <span class="connected-item-meta">{{ integration.itemCount }} items</span>
                      </div>
                      <button class="btn-remove-small" @click="disconnectIntegration(integration.id)">Remove</button>
                    </div>
                  </div>

                  <!-- Connected Documents -->
                  <div v-if="agent.knowledgeSources.documents && agent.knowledgeSources.documents.length > 0">
                    <div class="source-type-label">Documents</div>
                    <div v-for="file in agent.knowledgeSources.documents" :key="file.id" class="connected-item">
                      <div class="connected-item-info">
                        <strong>{{ file.name }}</strong>
                        <span class="connected-item-meta">{{ formatFileSize(file.size) }}</span>
                      </div>
                      <button class="btn-remove-small" @click="removeWorkspaceFile(file.id)">Remove</button>
                    </div>
                  </div>

                  <!-- Connected Text Snippets -->
                  <div v-if="agent.knowledgeSources.textSnippets && agent.knowledgeSources.textSnippets.length > 0">
                    <div class="source-type-label">Snippets</div>
                    <div v-for="snippet in agent.knowledgeSources.textSnippets" :key="snippet.id" class="connected-item">
                      <div class="connected-item-info">
                        <strong>{{ snippet.title || 'Text snippet' }}</strong>
                        <p class="snippet-preview">{{ snippet.content.substring(0, 100) }}{{ snippet.content.length > 100 ? '...' : '' }}</p>
                      </div>
                      <button class="btn-remove-small" @click="removeSnippetWorkspace(snippet.id)">Remove</button>
                    </div>
                  </div>

                  <!-- Connected Websites -->
                  <div v-if="agent.knowledgeSources.websites && agent.knowledgeSources.websites.length > 0">
                    <div class="source-type-label">Websites</div>
                    <div v-for="site in agent.knowledgeSources.websites" :key="site.id" class="connected-item">
                      <div class="connected-item-info">
                        <strong>{{ site.url }}</strong>
                        <span class="connected-item-meta">{{ site.pageCount }} {{ site.pageCount === 1 ? 'page' : 'pages' }}</span>
                      </div>
                      <button class="btn-remove-small" @click="removeWebsiteWorkspace(site.id)">Remove</button>
                    </div>
                  </div>

                  <!-- Connected Conversations -->
                  <div v-if="agent.knowledgeSources.conversations && agent.knowledgeSources.conversations.length > 0">
                    <div class="source-type-label">Conversations</div>
                    <div v-for="conv in agent.knowledgeSources.conversations" :key="conv.id" class="connected-item">
                      <div class="connected-item-info">
                        <strong>{{ conv.name }}</strong>
                        <span class="connected-item-meta">{{ conv.count }} conversations</span>
                      </div>
                      <button class="btn-remove-small" @click="removeConversationWorkspace(conv.id)">Remove</button>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state-simple">
                  <p>No sources connected yet. Add sources below to help your agent answer questions.</p>
                </div>
              </div>

              <!-- Available Sources Section -->
              <div class="sources-main-section">
                <h4 class="sources-section-title">Available sources</h4>

              <!-- Knowledge Accordion -->
              <div class="knowledge-accordion">

                <!-- Integrations Accordion Item -->
                <div class="accordion-item">
                  <div class="accordion-header" @click="knowledgeTab = knowledgeTab === 'integrations' ? '' : 'integrations'">
                    <div class="accordion-title">
                      <span>Integrations</span>
                    </div>
                    <span class="accordion-icon">{{ knowledgeTab === 'integrations' ? '−' : '+' }}</span>
                  </div>
                  <div v-if="knowledgeTab === 'integrations'" class="accordion-content">
                    <p class="section-description">Connect platforms like Notion, Confluence, Google Drive, Slack, etc.</p>
                    <div class="integrations-grid">
                      <button v-for="platform in availableIntegrationPlatforms" :key="platform.id"
                              class="integration-card" @click="connectIntegrationWorkspace(platform.id)">
                        <strong>{{ platform.name }}</strong>
                        <span class="integration-status">{{ platform.status }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Documents Accordion Item -->
                <div class="accordion-item">
                  <div class="accordion-header" @click="knowledgeTab = knowledgeTab === 'documents' ? '' : 'documents'">
                    <div class="accordion-title">
                      <span>Documents</span>
                    </div>
                    <span class="accordion-icon">{{ knowledgeTab === 'documents' ? '−' : '+' }}</span>
                  </div>
                  <div v-if="knowledgeTab === 'documents'" class="accordion-content">
                    <p class="section-description">Upload PDFs, Word docs, spreadsheets, or other document files</p>
                    <div class="file-upload-section">
                      <input
                        type="file"
                        ref="workspaceFileInput"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                        @change="handleWorkspaceFileUpload"
                        style="display: none"
                      />
                      <button class="btn-secondary" @click="$refs.workspaceFileInput.click()">
                        Choose Files
                      </button>
                      <span class="upload-hint">PDF, Word, Excel, TXT (max 10MB each)</span>
                    </div>
                  </div>
                </div>

                <!-- Conversations Accordion Item -->
                <div class="accordion-item">
                  <div class="accordion-header" @click="knowledgeTab = knowledgeTab === 'conversations' ? '' : 'conversations'">
                    <div class="accordion-title">
                      <span>Conversations</span>
                    </div>
                    <span class="accordion-icon">{{ knowledgeTab === 'conversations' ? '−' : '+' }}</span>
                  </div>
                  <div v-if="knowledgeTab === 'conversations'" class="accordion-content">
                    <p class="section-description">Import past conversations to train your agent (CSV or JSON format)</p>
                    <div class="file-upload-section">
                      <input
                        type="file"
                        ref="conversationInput"
                        multiple
                        accept=".csv,.json"
                        @change="handleConversationUploadWorkspace"
                        style="display: none"
                      />
                      <button class="btn-secondary" @click="$refs.conversationInput.click()">
                        Upload Conversations
                      </button>
                      <span class="upload-hint">CSV or JSON format (max 5MB each)</span>
                    </div>
                  </div>
                </div>

                <!-- Snippets Accordion Item -->
                <div class="accordion-item">
                  <div class="accordion-header" @click="knowledgeTab = knowledgeTab === 'text' ? '' : 'text'">
                    <div class="accordion-title">
                      <span>Snippets</span>
                    </div>
                    <span class="accordion-icon">{{ knowledgeTab === 'text' ? '−' : '+' }}</span>
                  </div>
                  <div v-if="knowledgeTab === 'text'" class="accordion-content">
                    <p class="section-description">Add text snippets, FAQs, policies, or any text-based information</p>
                    <div class="add-snippet-section">
                      <textarea
                        v-model="newSnippetText"
                        placeholder="Paste your text content here..."
                        rows="6"
                        class="input-field"
                      ></textarea>
                      <input
                        v-model="newSnippetTitle"
                        type="text"
                        placeholder="Title (optional)"
                        class="input-field"
                        style="margin-top: 12px"
                      />
                      <button class="btn-secondary" @click="addTextSnippetWorkspace" :disabled="!newSnippetText.trim()" style="margin-top: 12px">
                        Add Snippet
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Websites Accordion Item -->
                <div class="accordion-item">
                  <div class="accordion-header" @click="knowledgeTab = knowledgeTab === 'websites' ? '' : 'websites'">
                    <div class="accordion-title">
                      <span>Websites</span>
                    </div>
                    <span class="accordion-icon">{{ knowledgeTab === 'websites' ? '−' : '+' }}</span>
                  </div>
                  <div v-if="knowledgeTab === 'websites'" class="accordion-content">
                    <p class="section-description">Add website URLs to crawl and extract content from</p>
                    <div class="add-website-section">
                      <input
                        v-model="newWebsiteUrl"
                        type="url"
                        placeholder="https://example.com"
                        class="input-field"
                      />
                      <label class="checkbox-label" style="margin-top: 12px">
                        <input type="checkbox" v-model="crawlSubpagesWorkspace" />
                        <span>Crawl subpages</span>
                      </label>
                      <button class="btn-secondary" @click="addWebsiteWorkspace" :disabled="!newWebsiteUrl.trim()" style="margin-top: 12px">
                        Add Website
                      </button>
                    </div>
                  </div>
                </div>

              </div>
              </div>
            </div>

            <!-- Skills (Static UI from Production) -->
            <div v-if="activeBuildSection === 'skills'" id="skills" class="config-section build-section-anchor">
              <div class="skills-header">
                <div class="skills-header-left">
                  <h3>Skills</h3>
                  <p class="section-subtitle">What you want your agent to do</p>
                </div>
                <div class="skills-header-actions">
                  <button class="btn-secondary">Create New Skill</button>
                  <button class="btn-primary">+ Add Skills</button>
                </div>
              </div>

              <AIAssistant context="skills" />

              <!-- Discovered Skills Section -->
              <div class="discovered-skills-section">
                <div class="discovered-skills-header">
                  <div>
                    <h4 class="discovered-skills-title">Discovered from Conversations</h4>
                    <p class="discovered-skills-subtitle">Analyzed from 127 conversations</p>
                  </div>
                </div>

                <div class="discovered-skills-grid">
                  <div class="discovered-skill-card">
                    <div class="discovered-skill-header">
                      <div class="discovered-skill-title-row">
                        <div class="discovered-skill-name">Order Status Lookup</div>
                        <div class="confidence-badge high">92%</div>
                      </div>
                      <div class="discovered-skill-description">
                        Check real-time order status and delivery estimates
                      </div>
                    </div>
                    <div class="discovered-skill-meta">
                      <span class="meta-item">47 conversations</span>
                      <span class="meta-divider">·</span>
                      <span class="meta-item">Last seen 2h ago</span>
                    </div>
                    <div class="discovered-skill-example">
                      <span class="example-label">Example:</span> "Where is my order #12345?"
                    </div>
                    <button class="btn-primary-sm">Add to Agent</button>
                  </div>

                  <div class="discovered-skill-card">
                    <div class="discovered-skill-header">
                      <div class="discovered-skill-title-row">
                        <div class="discovered-skill-name">Refund Processing</div>
                        <div class="confidence-badge high">85%</div>
                      </div>
                      <div class="discovered-skill-description">
                        Process refund requests and check refund status
                      </div>
                    </div>
                    <div class="discovered-skill-meta">
                      <span class="meta-item">31 conversations</span>
                      <span class="meta-divider">·</span>
                      <span class="meta-item">Last seen 5h ago</span>
                    </div>
                    <div class="discovered-skill-example">
                      <span class="example-label">Example:</span> "I need a refund for my order"
                    </div>
                    <button class="btn-primary-sm">Add to Agent</button>
                  </div>

                  <div class="discovered-skill-card">
                    <div class="discovered-skill-header">
                      <div class="discovered-skill-title-row">
                        <div class="discovered-skill-name">Account Password Reset</div>
                        <div class="confidence-badge medium">78%</div>
                      </div>
                      <div class="discovered-skill-description">
                        Help customers reset their account passwords
                      </div>
                    </div>
                    <div class="discovered-skill-meta">
                      <span class="meta-item">23 conversations</span>
                      <span class="meta-divider">·</span>
                      <span class="meta-item">Last seen 1d ago</span>
                    </div>
                    <div class="discovered-skill-example">
                      <span class="example-label">Example:</span> "I forgot my password"
                    </div>
                    <button class="btn-primary-sm">Add to Agent</button>
                  </div>

                  <div class="discovered-skill-card">
                    <div class="discovered-skill-header">
                      <div class="discovered-skill-title-row">
                        <div class="discovered-skill-name">Product Availability Check</div>
                        <div class="confidence-badge medium">74%</div>
                      </div>
                      <div class="discovered-skill-description">
                        Check if products are in stock and when they'll be available
                      </div>
                    </div>
                    <div class="discovered-skill-meta">
                      <span class="meta-item">19 conversations</span>
                      <span class="meta-divider">·</span>
                      <span class="meta-item">Last seen 3h ago</span>
                    </div>
                    <div class="discovered-skill-example">
                      <span class="example-label">Example:</span> "Is the XYZ product in stock?"
                    </div>
                    <button class="btn-primary-sm">Add to Agent</button>
                  </div>

                  <div class="discovered-skill-card">
                    <div class="discovered-skill-header">
                      <div class="discovered-skill-title-row">
                        <div class="discovered-skill-name">Shipping Address Update</div>
                        <div class="confidence-badge medium">71%</div>
                      </div>
                      <div class="discovered-skill-description">
                        Update shipping address for pending orders
                      </div>
                    </div>
                    <div class="discovered-skill-meta">
                      <span class="meta-item">15 conversations</span>
                      <span class="meta-divider">·</span>
                      <span class="meta-item">Last seen 6h ago</span>
                    </div>
                    <div class="discovered-skill-example">
                      <span class="example-label">Example:</span> "Can I change my delivery address?"
                    </div>
                    <button class="btn-primary-sm">Add to Agent</button>
                  </div>
                </div>
              </div>

              <!-- Filters and Search -->
              <div class="skills-filters">
                <input type="text" class="search-input" placeholder="Search skills..." />
                <div class="filter-group">
                  <select class="filter-select">
                    <option>Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Archived</option>
                  </select>
                  <select class="filter-select">
                    <option>All sources</option>
                    <option>Custom</option>
                    <option>Marketplace</option>
                  </select>
                  <select class="filter-select">
                    <option>All labels</option>
                    <option>Calendar</option>
                    <option>Scheduling</option>
                    <option>Appointments</option>
                  </select>
                </div>
              </div>

              <!-- Skills Table -->
              <div class="skills-table-container">
                <table class="skills-table">
                  <thead>
                    <tr>
                      <th>Skill</th>
                      <th>Related Actions</th>
                      <th>Source</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div class="skill-name">Suggest new appointment time</div>
                        <div class="skill-labels">
                          <span class="skill-label">Calendar</span>
                          <span class="skill-label">Scheduling</span>
                          <span class="skill-label">Appointments</span>
                        </div>
                      </td>
                      <td>-</td>
                      <td>Custom</td>
                      <td><span class="status-badge active">Active</span></td>
                    </tr>
                    <tr>
                      <td>
                        <div class="skill-name">Schedule appointment</div>
                        <div class="skill-labels">
                          <span class="skill-label">Label A</span>
                          <span class="skill-label">Label B</span>
                          <span class="skill-label">Label C</span>
                        </div>
                      </td>
                      <td>-</td>
                      <td>
                        <div>Marketplace</div>
                        <div class="source-detail">Salesforce</div>
                      </td>
                      <td><span class="status-badge active">Active</span></td>
                    </tr>
                    <tr>
                      <td>
                        <div class="skill-name">Confirm via SMS</div>
                      </td>
                      <td>-</td>
                      <td>Custom</td>
                      <td><span class="status-badge inactive">Inactive</span></td>
                    </tr>
                    <tr>
                      <td>
                        <div class="skill-name">Confirm via Email</div>
                      </td>
                      <td>-</td>
                      <td>Custom</td>
                      <td><span class="status-badge archived">Archived</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>


            <!-- Agent Studio (Static - from Onboarding) -->
            <div v-if="activeBuildSection === 'visual-builder'" id="visual-builder" class="config-section build-section-anchor visual-builder-container">
              <div class="visual-builder-layout">
                <!-- Left Panel: Conversation Flow Canvas -->
                <div class="vb-canvas-panel">
                  <div class="vb-canvas-header">
                    <h3>Conversation Flow</h3>
                    <div class="vb-canvas-controls">
                      <button class="vb-control-btn">-</button>
                      <span class="vb-zoom-level">100%</span>
                      <button class="vb-control-btn">+</button>
                      <button class="vb-control-btn">Reset</button>
                    </div>
                  </div>

                  <!-- Canvas Area -->
                  <div class="vb-canvas-area">
                    <div class="vb-canvas-empty-state">
                      <p>No conversation flow yet</p>
                      <p class="vb-empty-hint">Start building with AI on the right →</p>
                    </div>
                  </div>
                </div>

                <!-- Right Panel: AI Builder -->
                <div class="vb-builder-panel">
                  <div class="vb-builder-tabs">
                    <button class="vb-tab-btn active">Build with AI</button>
                    <button class="vb-tab-btn" disabled>Edit Node</button>
                  </div>

                  <!-- AI Builder Tab -->
                  <div class="vb-ai-builder-tab">
                    <div class="vb-ai-messages">
                      <div class="vb-ai-message assistant">
                        <div class="vb-message-content">
                          Hi! I'll help you build a conversation flow for:<br/><br/>
                          "{{ agent.intent || agent.description }}"<br/><br/>
                          Tell me how your agent should handle conversations. For example:<br/>
                          • "Start by asking for their name"<br/>
                          • "Ask if they want to book or reschedule"<br/>
                          • "Handle payment confirmation"
                        </div>
                      </div>
                    </div>

                    <div class="vb-ai-input-area">
                      <textarea
                        placeholder="Describe the conversation flow you want to build..."
                        rows="3"
                      ></textarea>
                      <button class="vb-send-btn">Send</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

            <!-- Testing Panel (Right Column) - Hide for Agent Studio -->
            <div v-if="activeBuildSection !== 'visual-builder'" class="build-testing-panel">
              <TestingPanel v-if="agent" :agent="agent" />
            </div>
          </div>
          </template>
        </div>

        <!-- TEST Tab Content -->
        <div v-else-if="activeTab === 'test'" class="test-layout">
          <div class="test-scenarios-main">
            <!-- Header -->
            <div class="test-header">
              <div class="test-header-left">
                <h3>Test Scenarios</h3>
                <span class="test-meta">{{ agentTypeLabel }}</span>
              </div>
              <div class="test-header-right">
                <button
                  v-if="agent.testScenarios && agent.testScenarios.length > 0"
                  class="btn-secondary"
                  @click="runAllTests"
                  :disabled="runningAllTests">
                  {{ runningAllTests ? 'Running All Tests...' : 'Run All Tests' }}
                </button>
                <button class="btn-primary" @click="showTestBuilderModal = true">
                  + Create Test
                </button>
              </div>
            </div>
              <!-- Free Testing Notice -->
              <div class="test-info-banner">
                <div class="info-icon">ℹ️</div>
                <div class="info-text">
                  <strong>Testing is free:</strong> Test your agent as much as you want. Testing doesn't use any tokens or count toward your usage limits.
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="!agent.testScenarios || agent.testScenarios.length === 0" class="test-empty-state">
                <h4>No Test Scenarios</h4>
                <p>Create test scenarios to validate your agent's responses with keyword checking</p>
                <button class="btn-primary" @click="showTestBuilderModal = true">
                  + Create First Test
                </button>
              </div>

              <!-- Test Scenarios List -->
              <div v-else class="test-scenarios-list">
                <div v-for="scenario in agent.testScenarios" :key="scenario.id" class="scenario-card">
                  <div class="scenario-header">
                    <div class="scenario-name">{{ scenario.name }}</div>
                    <button
                      class="scenario-run-btn"
                      :class="{
                        'running': runningTests[scenario.id],
                        'passed': scenarioResults[scenario.id]?.passed === true,
                        'failed': scenarioResults[scenario.id]?.passed === false
                      }"
                      @click="runScenario(scenario)"
                      :disabled="runningTests[scenario.id]">
                      <span v-if="runningTests[scenario.id]">
                        Running<span class="loading-dots">...</span>
                      </span>
                      <span v-else-if="scenarioResults[scenario.id]?.passed === true">
                        ✓ Passed
                      </span>
                      <span v-else-if="scenarioResults[scenario.id]?.passed === false">
                        ✗ Failed
                      </span>
                      <span v-else>Run Test</span>
                    </button>
                  </div>

                  <div class="scenario-prompt">
                    <strong>Prompt:</strong> {{ scenario.prompt }}
                  </div>

                  <div class="scenario-keywords">
                    <strong>Expected Keywords:</strong>
                    <span class="keywords-list">{{ scenario.expectedKeywords.join(', ') }}</span>
                  </div>

                  <!-- Test Results -->
                  <div v-if="scenarioResults[scenario.id]" class="scenario-results">
                    <div class="result-response">
                      <strong>Agent Response:</strong>
                      <p>{{ scenarioResults[scenario.id].response }}</p>
                    </div>

                    <div v-if="scenarioResults[scenario.id].matchedKeywords.length > 0" class="result-matched">
                      <strong>✓ Matched Keywords:</strong>
                      <span class="matched-keywords">{{ scenarioResults[scenario.id].matchedKeywords.join(', ') }}</span>
                    </div>

                    <div v-if="scenarioResults[scenario.id].missingKeywords.length > 0" class="result-missing">
                      <strong>✗ Missing Keywords:</strong>
                      <span class="missing-keywords">{{ scenarioResults[scenario.id].missingKeywords.join(', ') }}</span>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          <div class="test-panel-wrapper">
            <TestingPanel v-if="agent" :agent="agent" />
          </div>
        </div>

        <!-- EVALUATE Tab Content (Proving Ground) -->
        <div v-else-if="activeTab === 'evaluate'" class="evaluate-tab-layout">
          <ProvingGroundPanel />
        </div>

        <!-- MONITOR Tab Content -->
        <div v-else-if="activeTab === 'monitor'" class="monitor-layout">
          <div class="monitor-main">
            <!-- Analyze Sub-Navigation -->
            <div class="monitor-subnav">
              <button
                class="monitor-subnav-btn"
                :class="{ active: monitorSubTab === 'performance' }"
                @click="monitorSubTab = 'performance'">
                Performance
              </button>
              <button
                class="monitor-subnav-btn"
                :class="{ active: monitorSubTab === 'insights' }"
                @click="monitorSubTab = 'insights'">
                Insights
              </button>
              <button
                class="monitor-subnav-btn"
                :class="{ active: monitorSubTab === 'security' }"
                @click="monitorSubTab = 'security'">
                Security
              </button>
            </div>

            <!-- Performance Sub-Tab -->
            <div v-if="monitorSubTab === 'performance'">
              <!-- Live Agent Dashboard -->
              <div v-if="agent.status === 'live'" class="live-dashboard">
                <div class="dashboard-header">
                  <h3>Overview</h3>
                  <div class="time-filter">
                    <button class="time-btn active">1D</button>
                    <button class="time-btn">1W</button>
                    <button class="time-btn">1M</button>
                  </div>
                </div>

                <!-- Key Metrics Section -->
                <div class="metrics-section">
                  <h4 class="section-heading">Key metrics</h4>
                  <div class="metrics-row">
                    <div class="metric-item">
                      <div class="metric-label">Deflection rate</div>
                      <div class="metric-value-large">78%</div>
                      <div class="metric-change positive">+5%</div>
                    </div>
                    <div class="metric-item">
                      <div class="metric-label">Total sessions</div>
                      <div class="metric-value-large">3,145</div>
                      <div class="metric-change neutral">+12</div>
                    </div>
                    <div class="metric-item">
                      <div class="metric-label">Automated sessions</div>
                      <div class="metric-value-large">2,372</div>
                      <div class="metric-change positive">+18</div>
                    </div>
                  </div>
                </div>

                <!-- Performance Metrics -->
                <div class="metrics-section">
                  <div class="metrics-row secondary">
                    <div class="metric-item-small">
                      <div class="metric-label">Avg Response Time</div>
                      <div class="metric-value-med">1.2s</div>
                      <div class="metric-subtext">0.3s improvement</div>
                    </div>
                    <div class="metric-item-small">
                      <div class="metric-label">Customer Satisfaction</div>
                      <div class="metric-value-med">4.6/5</div>
                      <div class="metric-subtext">Based on 89 ratings</div>
                    </div>
                    <div class="metric-item-small">
                      <div class="metric-label">AI CSAT</div>
                      <div class="metric-value-med">4.3/5</div>
                      <div class="metric-subtext">AI-assessed satisfaction</div>
                    </div>
                  </div>
                </div>

                <!-- Status Banner -->
                <div class="status-banner">
                  <div class="status-info">
                    <div class="status-title">Agent is Live</div>
                    <div class="status-text">Published {{ formatDate(agent.lastPublishedDate) }}</div>
                  </div>
                  <div class="active-channels">
                    <span class="channel-label">Active channels:</span>
                    <span v-for="(channel, index) in activeChannelLabels" :key="index" class="channel-badge">
                      {{ channel }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Draft Agent State -->
              <div v-else class="draft-dashboard">
                <div class="draft-state-card">
                  <h3>Agent Not Published</h3>
                  <p>This agent is currently in draft mode. Publish it to start accepting conversations and see performance metrics here.</p>
                  <button class="btn-primary" @click="navigateToDeploy">Review & Deploy</button>
                </div>

                <!-- Show historical data if agent was published before -->
                <div v-if="agent.hasBeenPublished" class="historical-data">
                  <h4>Historical Data</h4>
                  <p class="historical-note">Last published: {{ formatDate(agent.lastPublishedDate) }}</p>

                  <div class="metrics-grid">
                    <div class="metric-card historical">
                      <div class="metric-label">Total Conversations</div>
                      <div class="metric-value">247</div>
                      <div class="metric-change">While agent was live</div>
                    </div>
                    <div class="metric-card historical">
                      <div class="metric-label">Deflection Rate</div>
                      <div class="metric-value">78%</div>
                      <div class="metric-change">Historical average</div>
                    </div>
                    <div class="metric-card historical">
                      <div class="metric-label">Avg Response Time</div>
                      <div class="metric-value">1.2s</div>
                      <div class="metric-change">Historical average</div>
                    </div>
                    <div class="metric-card historical">
                      <div class="metric-label">Customer Satisfaction</div>
                      <div class="metric-value">4.6/5</div>
                      <div class="metric-change">Historical average</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Insights Sub-Tab -->
            <div v-if="monitorSubTab === 'insights'">
              <div class="insights-content">
                <h3>Insights</h3>
                <p class="subtitle">Discover patterns and improvement opportunities</p>

                <!-- Suggested Skills -->
                <div class="suggested-skills-section">
                  <h4 class="section-heading">Suggested Skills</h4>
                  <p class="section-subtitle-small">Discovered from conversation patterns</p>
                  <div class="suggested-skills-list">
                    <div class="suggested-skill-card">
                      <div class="skill-card-main">
                        <div class="skill-card-left">
                          <div class="skill-card-name">Order Status Lookup</div>
                          <div class="skill-card-frequency">47 conversations</div>
                        </div>
                        <div class="skill-card-right">
                          <div class="confidence-badge high">92%</div>
                          <button class="btn-secondary-sm">Add Skill</button>
                        </div>
                      </div>
                    </div>
                    <div class="suggested-skill-card">
                      <div class="skill-card-main">
                        <div class="skill-card-left">
                          <div class="skill-card-name">Refund Processing</div>
                          <div class="skill-card-frequency">31 conversations</div>
                        </div>
                        <div class="skill-card-right">
                          <div class="confidence-badge high">85%</div>
                          <button class="btn-secondary-sm">Add Skill</button>
                        </div>
                      </div>
                    </div>
                    <div class="suggested-skill-card">
                      <div class="skill-card-main">
                        <div class="skill-card-left">
                          <div class="skill-card-name">Account Password Reset</div>
                          <div class="skill-card-frequency">23 conversations</div>
                        </div>
                        <div class="skill-card-right">
                          <div class="confidence-badge medium">78%</div>
                          <button class="btn-secondary-sm">Add Skill</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <router-link :to="`/agents-v2/${agent.id}/build?section=skills`" class="view-all-link">
                    View All Suggestions →
                  </router-link>
                </div>
              </div>
            </div>

            <!-- Security Sub-Tab -->
            <div v-if="monitorSubTab === 'security'">
              <div class="security-content">
                <h3>Security</h3>
                <p class="subtitle">Monitor security alerts and vulnerabilities</p>

                <!-- Security Alerts -->
                <div class="security-alerts-section">
                  <h4 class="section-heading">Recent Security Alerts</h4>
                  <div class="notification-item alert security">
                    <div class="notification-header">
                      <span class="notification-title">Security vulnerability detected</span>
                      <span class="notification-meta">2 hours ago</span>
                    </div>
                    <div class="notification-text">High severity: Prompt injection detected in recent evaluation</div>
                  </div>
                  <div class="notification-item alert">
                    <div class="notification-header">
                      <span class="notification-title">PII leakage risk</span>
                      <span class="notification-meta">1 day ago</span>
                    </div>
                    <div class="notification-text">Medium severity: Agent exposed partial customer data in 2 conversations</div>
                  </div>
                  <div class="empty-state" style="margin-top: 24px; padding: 40px; text-align: center; color: #999;">
                    <p>Run security tests in Proving Ground to discover more vulnerabilities</p>
                    <router-link :to="`/agents-v2/${agent.id}/evaluate`" class="btn-primary" style="margin-top: 16px;">
                      Go to Proving Ground
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="monitor-panel-wrapper">
            <TestingPanel v-if="agent" :agent="agent" />
          </div>
        </div>
      </div>
    </div>

    <!-- Test Builder Modal -->
    <div v-if="showTestBuilderModal" class="modal-overlay" @click.self="closeTestBuilderModal">
      <div class="modal-dialog">
        <div class="modal-header">
          <h3>Create Test Scenario</h3>
          <button class="modal-close" @click="closeTestBuilderModal">×</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>Test Name <span class="required">*</span></label>
            <input
              v-model="newTest.name"
              type="text"
              class="input-field"
              placeholder="e.g., Check Business Hours">
          </div>

          <div class="form-group">
            <label>Test Prompt <span class="required">*</span></label>
            <textarea
              v-model="newTest.prompt"
              rows="3"
              class="input-field"
              placeholder="What message should be sent to the agent?"></textarea>
            <div class="hint">This is what gets sent to your agent</div>
          </div>

          <div class="form-group">
            <label>Expected Keywords (comma-separated)</label>
            <input
              v-model="newTest.keywords"
              type="text"
              class="input-field"
              placeholder="e.g., monday, friday, 9am, 5pm">
            <div class="hint">The agent's response should contain these keywords</div>
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
          <button class="btn-secondary" @click="closeTestBuilderModal">Cancel</button>
          <button
            class="btn-primary"
            @click="createTest"
            :disabled="!newTest.name || !newTest.prompt">
            Create Test
          </button>
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
          <p>Are you sure you want to delete <strong>{{ agent?.name }}</strong>?</p>
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
          <p class="modal-intro">Choose how you want to duplicate <strong>{{ agent?.name }}</strong>:</p>

          <div class="duplicate-options">
            <div class="duplicate-option" @click="duplicateToSameChannel">
              <div class="option-content">
                <div class="option-title">Duplicate (Same Channel)</div>
                <div class="option-desc">Creates an exact copy with the same channel type ({{ agentTypeLabel }}). All knowledge, skills, and configuration will be copied.</div>
              </div>
            </div>

            <div v-if="agent?.agentType !== 'phone'" class="duplicate-option" @click="duplicateToVoice">
              <div class="option-content">
                <div class="option-title">Duplicate to Voice</div>
                <div class="option-desc">Creates a Voice agent with the same knowledge and skills. You'll configure voice-specific settings like greetings and phone number.</div>
              </div>
            </div>

            <div v-if="agent?.agentType !== 'chat'" class="duplicate-option" @click="duplicateToChat">
              <div class="option-content">
                <div class="option-title">Duplicate to Chat</div>
                <div class="option-desc">Creates a Chat agent with the same knowledge and skills. You'll configure chat widget appearance and behavior.</div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeDuplicateModal">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Skill Test Modal -->
    <div v-if="skillTestModalOpen" class="modal-overlay" @click="closeSkillTestModal">
      <div class="modal-dialog modal-md skill-test-modal" @click.stop>
        <div class="modal-header">
          <h2>Test Skill: {{ skillBeingTested?.name }}</h2>
          <button class="modal-close" @click="closeSkillTestModal">×</button>
        </div>

        <div class="modal-body">
          <div class="skill-test-input-section">
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

          <div v-if="skillTestResult" class="skill-test-result-section">
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

    <!-- Skills Builder Modal -->
    <div v-if="showSkillsBuilder" class="modal-overlay" @click="closeSkillsBuilder">
      <div class="modal-dialog" @click.stop>
        <div class="modal-header">
          <h2>{{ newSkill.isEditing ? 'Configure Skill' : 'Create New Skill' }}</h2>
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
          <button class="btn-primary" @click="createSkill">{{ newSkill.isEditing ? 'Save Changes' : 'Create Skill' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TestingPanel from '../components/workspace/TestingPanel.vue'
import ProvingGroundPanel from '../components/workspace/ProvingGroundPanel.vue'
import TracesPanel from '../components/workspace/TracesPanel.vue'
import AIAssistant from '../components/workspace/AIAssistant.vue'

const route = useRoute()
const router = useRouter()

// State
const agent = ref(null)
const autoSaving = ref(false)
const lastSaved = ref(false)
const buildMainContent = ref(null)
const activeBuildSection = ref('configuration')
const monitorSubTab = ref('performance')
const hasUnpublishedChanges = ref(false) // Track if live agent has been edited
const lastPublishedSnapshot = ref(null) // Store snapshot of last published version

// Test scenarios state
const showTestBuilderModal = ref(false)
const newTest = ref({
  name: '',
  prompt: '',
  keywords: '',
  passCriteria: 'contains-all'
})
const runningTests = ref({})
const scenarioResults = ref({})
const runningAllTests = ref(false)

// Evaluate mode state
const testMode = ref('scenarios') // 'scenarios' | 'evaluate'
const selectedScenarioForEval = ref(null)
const evaluateFilters = ref({
  answerStatus: 'all', // 'all' | 'answered' | 'unanswered'
  rating: 'all' // 'all' | 'good' | 'acceptable' | 'poor' | 'unrated'
})


// Agent Actions Menu & Modals
const showActionsMenu = ref(false)
const showDeleteModal = ref(false)
const showDuplicateModal = ref(false)

// Skill Testing Modal
const skillTestModalOpen = ref(false)
const skillBeingTested = ref(null)
const skillTestInput = ref('')
const skillTestResult = ref(null)
const runningSkillTest = ref(false)

// Skills Builder Modal
const showSkillsBuilder = ref(false)
const newSkill = ref({
  name: '',
  description: '',
  mcpServer: '',
  parameters: ''
})

// Wizard Mode State
const wizardMode = ref(false)
const wizardStep = ref(1)
const wizardCompleted = ref(false)
const wizardKnowledge = ref('')
const wizardKnowledgeTab = ref('text')
const wizardWebsiteUrl = ref('')
const wizardWebsites = ref([])

// Workspace Knowledge Management State
const knowledgeTab = ref('integrations')
const newSnippetText = ref('')
const newSnippetTitle = ref('')
const newWebsiteUrl = ref('')
const crawlSubpagesWorkspace = ref(true)
const workspaceFileInput = ref(null)
const conversationInput = ref(null)

const availableIntegrationPlatforms = ref([
  { id: 'notion', name: 'Notion', status: 'Available' },
  { id: 'confluence', name: 'Confluence', status: 'Available' },
  { id: 'google-drive', name: 'Google Drive', status: 'Available' },
  { id: 'slack', name: 'Slack', status: 'Available' },
  { id: 'zendesk', name: 'Zendesk', status: 'Available' },
  { id: 'salesforce', name: 'Salesforce', status: 'Available' },
  { id: 'sharepoint', name: 'SharePoint', status: 'Available' },
  { id: 'dropbox', name: 'Dropbox', status: 'Available' },
  { id: 'github', name: 'GitHub', status: 'Available' },
  { id: 'intercom', name: 'Intercom', status: 'Available' },
  { id: 'freshdesk', name: 'Freshdesk', status: 'Available' },
  { id: 'jira', name: 'Jira', status: 'Available' }
])

// Wizard Testing State
const showInstructions = ref(false)
const testMessages = ref([])
const testInput = ref('')
const testIsThinking = ref(false)
const hasTested = ref(false)
const testChatContainer = ref(null)

// COMPASS Validation
const validationExpanded = ref(true)

const validationMessages = computed(() => {
  if (!agent.value) return []

  const messages = []
  const agentData = agent.value

  // Validate Agent Name
  if (!agentData.name || agentData.name.trim().length === 0) {
    messages.push({
      id: 'name-empty',
      severity: 'error',
      field: 'Agent Name',
      message: 'Agent name is required'
    })
  } else if (agentData.name.length < 3) {
    messages.push({
      id: 'name-short',
      severity: 'warning',
      field: 'Agent Name',
      message: 'Agent name should be at least 3 characters long'
    })
  }

  // Validate Instructions
  if (!agentData.instructions || agentData.instructions.trim().length === 0) {
    messages.push({
      id: 'instructions-empty',
      severity: 'error',
      field: 'Behavior Instructions',
      message: 'Instructions are required to guide agent behavior'
    })
  } else if (agentData.instructions.length < 50) {
    messages.push({
      id: 'instructions-short',
      severity: 'warning',
      field: 'Behavior Instructions',
      message: 'More detailed instructions (50+ characters) lead to better agent performance'
    })
  }

  // Validate Knowledge Base
  const hasKnowledge = agentData.knowledgeSources && (
    agentData.knowledgeSources.textContent ||
    agentData.knowledgeSources.documents ||
    agentData.knowledgeSources.websites
  )
  if (!hasKnowledge) {
    messages.push({
      id: 'knowledge-empty',
      severity: 'warning',
      field: 'Knowledge Base',
      message: 'No knowledge sources configured. Agent may not have enough context to answer questions.'
    })
  }

  // Skills validation removed per user request

  // Test scenarios validation removed per user request

  return messages
})

// Test suggestions based on problem type
const testSuggestions = computed(() => {
  const suggestions = {
    support: ["What are your hours?", "How do I return an item?", "I need help with my account"],
    sales: ["Tell me about your products", "What's your pricing?", "Can I schedule a demo?"],
    hr: ["How do I request time off?", "What are the benefits?", "Where's the employee handbook?"],
    orders: ["Where's my order?", "Track package #12345", "How do I return something?"],
    scheduling: ["Book an appointment", "What times are available?", "Cancel my booking"],
    general: ["What are your hours?", "Where are you located?", "How can I contact you?"]
  }
  return suggestions[agent.value?.problemType] || ["What can you help me with?", "Tell me about your services", "How do I get started?"]
})

// Check if any sources are connected
const hasAnyConnectedSources = computed(() => {
  if (!agent.value?.knowledgeSources) return false
  const ks = agent.value.knowledgeSources
  return (
    (ks.integrations && ks.integrations.length > 0) ||
    (ks.documents && ks.documents.length > 0) ||
    (ks.textSnippets && ks.textSnippets.length > 0) ||
    (ks.websites && ks.websites.length > 0) ||
    (ks.conversations && ks.conversations.length > 0)
  )
})

const dynamicTestSuggestions = computed(() => {
  // Get all available suggestions for this agent type
  const allSuggestions = {
    support: [
      "What are your hours?",
      "How do I return an item?",
      "I need help with my account",
      "How do I contact support?",
      "What's your refund policy?",
      "Can I speak to a human?"
    ],
    sales: [
      "Tell me about your products",
      "What's your pricing?",
      "Can I schedule a demo?",
      "Do you offer discounts?",
      "What's included in each plan?",
      "Is there a free trial?"
    ],
    hr: [
      "How do I request time off?",
      "What are the benefits?",
      "Where's the employee handbook?",
      "What's the dress code?",
      "Who do I contact for IT support?",
      "What are the holidays?"
    ],
    orders: [
      "Where's my order?",
      "Track package #12345",
      "How do I return something?",
      "When will my order arrive?",
      "Can I change my shipping address?",
      "What if my item is damaged?"
    ],
    scheduling: [
      "Book an appointment",
      "What times are available?",
      "Cancel my booking",
      "Reschedule my appointment",
      "How long is each appointment?",
      "Do you have weekend availability?"
    ],
    general: [
      "What are your hours?",
      "Where are you located?",
      "How can I contact you?",
      "What services do you offer?",
      "Tell me about your company",
      "How do I get started?"
    ]
  }

  const availableQuestions = allSuggestions[agent.value?.problemType] || allSuggestions.general

  // Filter out questions that have already been asked
  const askedQuestions = testMessages.value
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content.toLowerCase().trim())

  const unaskedQuestions = availableQuestions.filter(q => {
    const qLower = q.toLowerCase()
    return !askedQuestions.some(asked => {
      const qWords = qLower.split(' ').filter(w => w.length > 3)
      const askedWords = asked.split(' ').filter(w => w.length > 3)
      const overlap = qWords.filter(w => askedWords.includes(w)).length
      return overlap >= 2
    })
  })

  return unaskedQuestions.slice(0, 3)
})

// Available skills for wizard
const availableSkills = ref([
  {
    id: 'calendar',
    name: 'Calendar & Scheduling',
    description: 'Book, reschedule, and manage appointments with calendar integration'
  },
  {
    id: 'order-lookup',
    name: 'Order Lookup',
    description: 'Check order status, tracking information, and delivery estimates'
  },
  {
    id: 'knowledge-search',
    name: 'Knowledge Base Search',
    description: 'Search through documentation and knowledge articles for accurate answers'
  },
  {
    id: 'user-auth',
    name: 'User Authentication',
    description: 'Verify customer identity before accessing sensitive information'
  },
  {
    id: 'payment',
    name: 'Payment Processing',
    description: 'Handle payments, refunds, and billing inquiries securely'
  },
  {
    id: 'ticket-creation',
    name: 'Ticket Creation',
    description: 'Create support tickets and escalate complex issues to human agents'
  },
  {
    id: 'crm-integration',
    name: 'CRM Integration',
    description: 'Access customer data and update records in your CRM system'
  },
  {
    id: 'lead-qualification',
    name: 'Lead Qualification',
    description: 'Qualify sales leads and route them to the appropriate team'
  }
])

// Mock conversations for MONITOR tab
const mockConversations = ref([
  { id: 1, channel: 'web-chat', user: 'Sarah Johnson', summary: 'Asked about return policy and shipping times', time: '2 minutes ago', duration: '3m 24s', resolved: true },
  { id: 2, channel: 'sms', user: '+1 (555) 234-5678', summary: 'Inquired about order status for #12345', time: '15 minutes ago', duration: '1m 52s', resolved: true },
  { id: 3, channel: 'voice', user: '+1 (555) 876-5432', summary: 'Technical support for product setup', time: '1 hour ago', duration: '5m 18s', resolved: false },
  { id: 4, channel: 'web-chat', user: 'Mike Chen', summary: 'Question about product specifications', time: '2 hours ago', duration: '2m 45s', resolved: true },
  { id: 5, channel: 'sms', user: '+1 (555) 345-6789', summary: 'Appointment rescheduling request', time: '3 hours ago', duration: '1m 30s', resolved: true }
])

let saveTimeout = null

// Available knowledge sources
const availableKnowledge = computed(() => {
  const sources = JSON.parse(localStorage.getItem('daart-knowledge-sources') || '{}')
  const orgKnowledge = localStorage.getItem('daart-org-knowledge')

  let textContent = null
  if (orgKnowledge) {
    const parsed = JSON.parse(orgKnowledge)
    const length = (parsed.content || '').length
    if (length > 0) {
      let size = ''
      if (length < 1000) size = `${length} characters`
      else if (length < 1000000) size = `${(length / 1000).toFixed(1)}K characters`
      else size = `${(length / 1000000).toFixed(1)}M characters`
      textContent = { size }
    }
  }

  return {
    textContent,
    documents: sources.documents || [],
    websites: sources.websites || [],
    conversations: {
      enabled: sources.conversations?.enabled || false,
      count: sources.conversations?.count || 0
    }
  }
})

const hasAnyKnowledge = computed(() => {
  return availableKnowledge.value.textContent ||
         availableKnowledge.value.documents.length > 0 ||
         availableKnowledge.value.websites.length > 0 ||
         availableKnowledge.value.conversations.enabled
})

// Filtered scenarios for Evaluate mode
const filteredScenariosForEval = computed(() => {
  if (!agent.value?.testScenarios) return []

  return agent.value.testScenarios.filter(scenario => {
    // Filter by answer status
    if (evaluateFilters.value.answerStatus === 'answered' && !scenario.lastRun?.response) {
      return false
    }
    if (evaluateFilters.value.answerStatus === 'unanswered' && scenario.lastRun?.response) {
      return false
    }

    // Filter by rating
    if (evaluateFilters.value.rating !== 'all') {
      if (evaluateFilters.value.rating === 'unrated' && scenario.lastRun?.rating) {
        return false
      }
      if (evaluateFilters.value.rating !== 'unrated' && scenario.lastRun?.rating !== evaluateFilters.value.rating) {
        return false
      }
    }

    return true
  })
})

// Build sections navigation (dynamic based on agent type)
// Order prioritizes content over visual configuration
const buildSections = computed(() => {
  const sections = [
    { id: 'configuration', label: 'Configuration' },
    { id: 'knowledge-base', label: 'Sources' },
    { id: 'skills', label: 'Skills' }
  ]

  // Check if this is an omnichannel agent (new model with channels object)
  if (agent.value?.channels) {
    // Channels & Integrations is now part of Configuration tab
    // Add visual builder for all agents (supports both digital and voice)
    sections.push({ id: 'visual-builder', label: 'Agent Studio' })
  } else if (agent.value?.agentType === 'chat') {
    // Old chat agents
    sections.push({ id: 'chat-configuration', label: 'Chat Configuration' })
    sections.push({ id: 'channels', label: 'Channels' })
    sections.push({ id: 'visual-builder', label: 'Agent Studio' })
  } else if (agent.value?.agentType === 'phone') {
    // Old voice agents
    sections.push({ id: 'voice-configuration', label: 'Voice Configuration' })
    sections.push({ id: 'visual-builder', label: 'Agent Studio' })
  }

  return sections
})

// Collapsible sections state for chat/voice config
const configSections = ref({
  chatMessages: false,
  chatAvailability: false,
  chatEscalation: false,
  chatAppearance: false,
  voiceSettings: true,
  voiceGreetings: false,
  voiceTransfer: false
})

function toggleConfigSection(section) {
  configSections.value[section] = !configSections.value[section]
}

// Computed
const activeTab = computed(() => {
  if (route.path.includes('/build')) return 'build'
  if (route.path.includes('/test')) return 'test'
  if (route.path.includes('/evaluate')) return 'evaluate'
  if (route.path.includes('/analyze')) return 'monitor'  // /analyze route uses monitor tab internally
  if (route.path.includes('/monitor')) return 'monitor'  // Legacy fallback
  return 'build'
})

const agentTypeLabel = computed(() => {
  return agent.value?.agentType === 'phone' ? 'Voice Agent' : 'Digital Agent'
})

const activeChannelLabels = computed(() => {
  if (!agent.value) return []
  const labels = []

  if (agent.value.agentType === 'phone') {
    labels.push('Voice')
  } else if (agent.value.agentType === 'chat') {
    labels.push('Web Chat')
    if (agent.value.smsEnabled) {
      labels.push('SMS')
    }
  }

  return labels
})

// Wizard Mode Computed
const isNewAgent = computed(() => {
  if (!agent.value) return false
  // Agent is considered "new" if it has the needsWizard flag
  return agent.value.needsWizard === true
})

const totalWizardSteps = computed(() => {
  // Streamlined onboarding: 2 steps (Configure Agent, Add Knowledge)
  return 2
})

// Methods
function loadAgent() {
  const agentId = route.params.id
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  agent.value = agents.find(a => a.id === agentId)

  // Initialize default values if missing
  if (agent.value) {
    if (!agent.value.name) agent.value.name = 'Untitled Agent'
    if (!agent.value.instructions) agent.value.instructions = ''
    if (!agent.value.status) agent.value.status = 'draft'

    // Initialize knowledge sources with proper structure
    if (!agent.value.knowledgeSources) {
      agent.value.knowledgeSources = {
        textContent: '',
        textSnippets: [],
        documents: [],
        websites: [],
        integrations: [],
        conversations: []
      }
    } else {
      // Ensure all arrays exist even if knowledgeSources was partially set
      if (!agent.value.knowledgeSources.textSnippets) agent.value.knowledgeSources.textSnippets = []
      if (!agent.value.knowledgeSources.documents) agent.value.knowledgeSources.documents = []
      if (!agent.value.knowledgeSources.websites) agent.value.knowledgeSources.websites = []
      if (!agent.value.knowledgeSources.integrations) agent.value.knowledgeSources.integrations = []
      if (!agent.value.knowledgeSources.conversations) agent.value.knowledgeSources.conversations = []
    }

    // Enable wizard mode for new agents (only if not already completed)
    if (isNewAgent.value && activeTab.value === 'build' && !wizardCompleted.value) {
      wizardMode.value = true
      wizardStep.value = 1

      // Pre-fill knowledge base with template-specific content
      if (!wizardKnowledge.value) {
        wizardKnowledge.value = getTemplateKnowledge(agent.value.problemType)
      }
    } else if (!isNewAgent.value) {
      // If not a new agent, ensure wizard mode is off
      wizardMode.value = false
    }
    if (!agent.value.phoneNumber) agent.value.phoneNumber = '+1 (555) 000-0000'
    if (!agent.value.voiceType) agent.value.voiceType = 'nova'
    if (!agent.value.language) agent.value.language = 'en-US'
    if (!agent.value.greetingMessage) agent.value.greetingMessage = 'Hello! Thank you for calling. How can I help you today?'
    if (!agent.value.speechSpeed) agent.value.speechSpeed = 1.0
    if (!agent.value.smsEnabled) agent.value.smsEnabled = false
    if (!agent.value.skills) agent.value.skills = []
    if (!agent.value.knowledgeDocs) agent.value.knowledgeDocs = []
    if (!agent.value.testScenarios) agent.value.testScenarios = []

    // Initialize chatConfig for chat agents
    if (agent.value.agentType === 'chat') {
      if (!agent.value.chatConfig) agent.value.chatConfig = {}
      if (!agent.value.chatConfig.widgetPosition) agent.value.chatConfig.widgetPosition = 'bottom-right'
      if (!agent.value.chatConfig.primaryColor) agent.value.chatConfig.primaryColor = '#000000'
      if (!agent.value.chatConfig.displayName) agent.value.chatConfig.displayName = 'Support Assistant'
      if (!agent.value.chatConfig.widgetSize) agent.value.chatConfig.widgetSize = 'standard'
      if (!agent.value.chatConfig.welcomeMessage) agent.value.chatConfig.welcomeMessage = 'Hi! How can I help you today?'
      if (!agent.value.chatConfig.enableProactive) agent.value.chatConfig.enableProactive = false
      if (!agent.value.chatConfig.proactiveMessage) agent.value.chatConfig.proactiveMessage = ''
      if (!agent.value.chatConfig.responseTime) agent.value.chatConfig.responseTime = 'Usually replies in 2 minutes'
      if (!agent.value.chatConfig.showTypingIndicator) agent.value.chatConfig.showTypingIndicator = true
      if (!agent.value.chatConfig.businessHours) agent.value.chatConfig.businessHours = 'Monday-Friday, 9 AM - 5 PM EST'
      if (!agent.value.chatConfig.offlineBehavior) agent.value.chatConfig.offlineBehavior = 'always-on'
      if (!agent.value.chatConfig.offlineMessage) agent.value.chatConfig.offlineMessage = ''
      if (!agent.value.chatConfig.transferConditions) agent.value.chatConfig.transferConditions = ''
      if (!agent.value.chatConfig.transferDestination) agent.value.chatConfig.transferDestination = 'support'
      if (!agent.value.chatConfig.handoffMessage) agent.value.chatConfig.handoffMessage = 'Let me connect you with a team member...'
    }

    // Initialize voiceConfig for phone agents
    if (agent.value.agentType === 'phone') {
      if (!agent.value.voiceConfig) agent.value.voiceConfig = {}
      if (!agent.value.voiceConfig.holdMessage) agent.value.voiceConfig.holdMessage = 'Please hold while I look that up...'
      if (!agent.value.voiceConfig.voicemailGreeting) agent.value.voiceConfig.voicemailGreeting = 'Please leave a message...'
      if (!agent.value.voiceConfig.transferConditions) agent.value.voiceConfig.transferConditions = ''
      if (!agent.value.voiceConfig.transferDestination) agent.value.voiceConfig.transferDestination = 'support'
      if (!agent.value.voiceConfig.customTransferNumber) agent.value.voiceConfig.customTransferNumber = ''
      if (!agent.value.voiceConfig.transferMessage) agent.value.voiceConfig.transferMessage = 'Let me transfer you...'
    }
  }
}

function handleInputChange() {
  // Clear existing timeout
  if (saveTimeout) clearTimeout(saveTimeout)

  // Show saving indicator
  autoSaving.value = true
  lastSaved.value = false

  // Mark as having unpublished changes if agent is live
  if (agent.value && agent.value.status === 'live') {
    hasUnpublishedChanges.value = true
  }

  // Debounce save - wait 800ms after last input
  saveTimeout = setTimeout(() => {
    saveAgent()
  }, 800)
}

function saveAgent() {
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  const index = agents.findIndex(a => a.id === agent.value.id)

  if (index !== -1) {
    agents[index] = { ...agent.value }
    localStorage.setItem('daart-agents', JSON.stringify(agents))

    // Update UI
    autoSaving.value = false
    lastSaved.value = true

    // Hide "Saved" after 2 seconds
    setTimeout(() => {
      lastSaved.value = false
    }, 2000)
  }
}

// Tab-based navigation - no longer need scroll function

// Test Scenarios Functions
function closeTestBuilderModal() {
  showTestBuilderModal.value = false
  // Reset form
  newTest.value = {
    name: '',
    prompt: '',
    keywords: '',
    passCriteria: 'contains-all'
  }
}

function createTest() {
  if (!newTest.value.name || !newTest.value.prompt) return

  const scenario = {
    id: `test-${Date.now()}`,
    name: newTest.value.name,
    prompt: newTest.value.prompt,
    expectedKeywords: newTest.value.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0),
    passCriteria: newTest.value.passCriteria
  }

  if (!agent.value.testScenarios) {
    agent.value.testScenarios = []
  }

  agent.value.testScenarios.push(scenario)
  saveAgent()
  closeTestBuilderModal()
}

async function runScenario(scenario) {
  runningTests.value[scenario.id] = true

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Generate test response
  const response = generateTestResponse(scenario)

  // Validate keywords
  const result = validateKeywords(response, scenario.expectedKeywords)

  // Mock content/guidance used (in real implementation, this would come from the AI response)
  const contentUsed = agent.value.knowledge?.slice(0, 2).map(k => k.name || k.title) || []
  const guidanceUsed = ['Knowledge Base']
  if (agent.value.skills?.length > 0) {
    guidanceUsed.push('Skills')
  }

  scenarioResults.value[scenario.id] = {
    response,
    passed: result.missingKeywords.length === 0,
    matchedKeywords: result.matchedKeywords,
    missingKeywords: result.missingKeywords
  }

  // Store lastRun data for evaluation
  scenario.lastRun = {
    timestamp: new Date().toISOString(),
    response,
    contentUsed,
    guidanceUsed,
    rating: scenario.lastRun?.rating || null, // Preserve existing rating
    notes: scenario.lastRun?.notes || ''
  }

  saveAgent()
  runningTests.value[scenario.id] = false
}

async function runAllTests() {
  if (!agent.value.testScenarios || agent.value.testScenarios.length === 0) return

  runningAllTests.value = true

  for (const scenario of agent.value.testScenarios) {
    await runScenario(scenario)
    // Stagger tests by 500ms
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  runningAllTests.value = false
}

function validateKeywords(response, expectedKeywords) {
  const responseLower = response.toLowerCase()
  const matchedKeywords = []
  const missingKeywords = []

  for (const keyword of expectedKeywords) {
    if (responseLower.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword)
    } else {
      missingKeywords.push(keyword)
    }
  }

  return { matchedKeywords, missingKeywords }
}

function generateTestResponse(scenario) {
  // Weighted random: 60% all keywords, 20% some keywords, 20% no keywords
  const rand = Math.random()

  if (rand < 0.6) {
    // Include all keywords
    const keywords = scenario.expectedKeywords.join(', ')
    return `Based on your question about "${scenario.prompt}", here's what I can tell you: ${keywords}. Let me know if you need more details!`
  } else if (rand < 0.8) {
    // Include some keywords
    const someKeywords = scenario.expectedKeywords.slice(0, Math.ceil(scenario.expectedKeywords.length / 2))
    return `I can help with that. Here's some information: ${someKeywords.join(', ')}. Is there anything else?`
  } else {
    // Include no keywords
    return `Thank you for your question. I'd be happy to help you with that. Could you provide more details?`
  }
}

// Evaluate mode functions
function selectScenarioForEval(scenario) {
  selectedScenarioForEval.value = scenario
}

function rateScenario(scenarioId, rating) {
  const scenario = agent.value.testScenarios.find(s => s.id === scenarioId)
  if (!scenario) return

  if (!scenario.lastRun) {
    scenario.lastRun = {}
  }

  scenario.lastRun.rating = rating
  scenario.lastRun.ratedAt = new Date().toISOString()

  saveAgent()
}

function updateEvaluationNotes(scenarioId, notes) {
  const scenario = agent.value.testScenarios.find(s => s.id === scenarioId)
  if (!scenario) return

  if (!scenario.lastRun) {
    scenario.lastRun = {}
  }

  scenario.lastRun.notes = notes
  saveAgent()
}

// Keyboard shortcuts for rating (G/A/P)
function handleEvalKeyPress(event) {
  if (!selectedScenarioForEval.value || testMode.value !== 'evaluate') return

  const key = event.key.toLowerCase()
  if (key === 'g') {
    rateScenario(selectedScenarioForEval.value.id, 'good')
  } else if (key === 'a') {
    rateScenario(selectedScenarioForEval.value.id, 'acceptable')
  } else if (key === 'p') {
    rateScenario(selectedScenarioForEval.value.id, 'poor')
  }
}

// Publish/Unpublish Functions
function navigateToDeploy() {
  // Save agent before navigating to deploy
  saveAgent()
  // Navigate to deploy page
  router.push(`/agents-v2/${agent.value.id}/deploy`)
}


// Agent Actions Menu Functions
function toggleActionsMenu() {
  showActionsMenu.value = !showActionsMenu.value
}

function duplicateAgent() {
  if (!agent.value) return
  showActionsMenu.value = false
  showDuplicateModal.value = true
}

function closeDuplicateModal() {
  showDuplicateModal.value = false
}

function duplicateToSameChannel() {
  if (!agent.value) return

  const duplicatedAgent = {
    ...agent.value,
    id: Date.now().toString(),
    name: `${agent.value.name} (Copy)`,
    status: 'draft',
    conversations: 0,
    createdAt: new Date().toISOString(),
    lastUpdated: 'Just now',
    needsWizard: false  // Don't show wizard for duplicated agents
  }

  // Save to localStorage
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  agents.push(duplicatedAgent)
  localStorage.setItem('daart-agents', JSON.stringify(agents))

  showDuplicateModal.value = false

  // Navigate to the duplicated agent
  router.push(`/agents-v2/${duplicatedAgent.id}/build`)
}

function duplicateToVoice() {
  if (!agent.value) return

  const duplicatedAgent = {
    ...agent.value,
    id: Date.now().toString(),
    name: `${agent.value.name} (Voice)`,
    agentType: 'phone',
    channels: ['phone'],
    status: 'draft',
    conversations: 0,
    createdAt: new Date().toISOString(),
    lastUpdated: 'Just now',
    needsWizard: false,
    // Initialize voice config
    phoneNumber: '+1 (555) 000-0000',
    voiceType: 'nova',
    language: 'en-US',
    greetingMessage: '',
    speechSpeed: 1.0
  }

  // Save to localStorage
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  agents.push(duplicatedAgent)
  localStorage.setItem('daart-agents', JSON.stringify(agents))

  showDuplicateModal.value = false

  // Navigate to the duplicated agent
  router.push(`/agents-v2/${duplicatedAgent.id}/build`)
}

function duplicateToChat() {
  if (!agent.value) return

  const duplicatedAgent = {
    ...agent.value,
    id: Date.now().toString(),
    name: `${agent.value.name} (Chat)`,
    agentType: 'chat',
    channels: ['web-chat'],
    status: 'draft',
    conversations: 0,
    createdAt: new Date().toISOString(),
    lastUpdated: 'Just now',
    needsWizard: false,
    // Initialize chat config
    widgetPosition: 'bottom-right',
    primaryColor: '#000000',
    displayName: agent.value.name,
    widgetSize: 'standard',
    smsEnabled: false
  }

  // Save to localStorage
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  agents.push(duplicatedAgent)
  localStorage.setItem('daart-agents', JSON.stringify(agents))

  showDuplicateModal.value = false

  // Navigate to the duplicated agent
  router.push(`/agents-v2/${duplicatedAgent.id}/build`)
}

function confirmDeleteAgent() {
  if (!agent.value) return

  showActionsMenu.value = false
  showDeleteModal.value = true
}

function deleteAgent() {
  if (!agent.value) return

  // Get all agents from localStorage
  const agents = JSON.parse(localStorage.getItem('daart-agents') || '[]')
  const agentIndex = agents.findIndex(a => a.id === agent.value.id)

  if (agentIndex === -1) return

  // Remove the agent
  agents.splice(agentIndex, 1)
  localStorage.setItem('daart-agents', JSON.stringify(agents))

  showDeleteModal.value = false

  // Navigate to first agent or onboarding
  if (agents.length > 0) {
    const firstAgent = agents[0]
    const defaultTab = firstAgent.status === 'live' ? 'monitor' : 'build'
    router.push(`/agents-v2/${firstAgent.id}/${defaultTab}`)
  } else {
    router.push('/onboarding-v2')
  }
}

function closeDeleteModal() {
  showDeleteModal.value = false
}

// Skill Testing Functions
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
  }, 1500)
}

// Get template-specific knowledge
function getTemplateKnowledge(problemType) {
  const templates = {
    support: `Company Information:
- Company Name: [Your Company]
- Hours: Monday-Friday, 9 AM - 5 PM EST
- Support Email: support@yourcompany.com
- Support Phone: +1 (555) 123-4567

Policies:
- Returns: 30-day money-back guarantee on all products
- Shipping: Free shipping on orders over $50
- Response Time: We aim to respond within 24 hours

Common Questions:
- How do I track my order? Check your email for tracking info or contact support
- What's your return policy? 30 days, no questions asked
- Do you offer technical support? Yes, via email and phone during business hours`,

    sales: `Company Information:
- Company Name: [Your Company]
- Industry: [Your Industry]
- Website: www.yourcompany.com

Products/Services:
- Starter Plan: $29/month - Perfect for individuals
- Pro Plan: $99/month - For growing teams
- Enterprise: Custom pricing - For large organizations

Key Features:
- Feature 1: [Description]
- Feature 2: [Description]
- Feature 3: [Description]

Sales Process:
- Free trial available: 14 days, no credit card required
- Demo scheduling: Available Monday-Friday
- Custom quotes: Contact sales@yourcompany.com`,

    hr: `Company Policies:
- PTO Policy: 15 days per year, accrues monthly
- Sick Leave: 10 days per year
- Holidays: 10 paid holidays per year
- Work Hours: 9 AM - 5 PM, flexible remote options available

Benefits:
- Health Insurance: Full coverage, company pays 80%
- 401(k): Company matches up to 5%
- Professional Development: $1,000 annual budget

Resources:
- Employee Portal: portal.yourcompany.com
- HR Contact: hr@yourcompany.com
- IT Support: it@yourcompany.com`,

    orders: `Order Information:
- Processing Time: 1-2 business days
- Shipping Time: 3-5 business days (standard)
- Express Shipping: 1-2 business days (additional $15)
- International Shipping: 7-14 business days

Tracking:
- Tracking numbers sent via email when order ships
- Track at: www.yourcompany.com/track
- Questions: orders@yourcompany.com

Returns:
- Return Window: 30 days from delivery
- Return Process: Visit www.yourcompany.com/returns
- Refund Time: 5-7 business days after we receive the item
- Return Shipping: Free for defective items, $5 fee otherwise`,

    scheduling: `Appointment Information:
- Business Name: [Your Business]
- Location: [Your Address]
- Phone: +1 (555) 123-4567

Available Services:
- Service 1: 30 minutes - $50
- Service 2: 60 minutes - $100
- Service 3: 90 minutes - $150

Booking:
- Online booking: www.yourcompany.com/book
- Phone booking: Call during business hours
- Cancellation policy: 24 hours notice required
- Rescheduling: Free if done 24 hours in advance

Hours:
- Monday-Friday: 9 AM - 6 PM
- Saturday: 10 AM - 4 PM
- Sunday: Closed`,

    general: `Company Information:
- Business Name: [Your Business Name]
- Address: [Your Address]
- Phone: +1 (555) 123-4567
- Email: info@yourcompany.com
- Website: www.yourcompany.com

Hours:
- Monday-Friday: 9 AM - 5 PM
- Saturday: 10 AM - 2 PM
- Sunday: Closed

Services:
- Service 1: [Description]
- Service 2: [Description]
- Service 3: [Description]

FAQs:
- How can I contact you? Phone, email, or visit our website
- Where are you located? [Your Address]
- Do you offer consultations? Yes, free 15-minute consultations available`
  }

  return templates[problemType] || templates.general
}

// Wizard Testing Functions
function sendTestMessage() {
  if (!testInput.value.trim() || testIsThinking.value) return

  // Add user message
  testMessages.value.push({
    role: 'user',
    content: testInput.value
  })

  const userMessage = testInput.value
  testInput.value = ''
  testIsThinking.value = true
  hasTested.value = true

  // Scroll to bottom
  setTimeout(() => {
    if (testChatContainer.value) {
      testChatContainer.value.scrollTop = testChatContainer.value.scrollHeight
    }
  }, 50)

  // Simulate AI response after delay
  setTimeout(() => {
    const response = generateMockResponse(userMessage)
    testMessages.value.push({
      role: 'assistant',
      content: response
    })
    testIsThinking.value = false

    // Scroll to bottom again
    setTimeout(() => {
      if (testChatContainer.value) {
        testChatContainer.value.scrollTop = testChatContainer.value.scrollHeight
      }
    }, 50)
  }, 1500)
}

function askSuggestion(suggestion) {
  testInput.value = suggestion
  sendTestMessage()
}

function resetTestChat() {
  testMessages.value = []
  testInput.value = ''
  testIsThinking.value = false
  hasTested.value = false
}

// Wizard Knowledge Functions
function addWebsiteUrl() {
  if (!wizardWebsiteUrl.value.trim()) return

  // Validate URL
  try {
    new URL(wizardWebsiteUrl.value)
  } catch {
    alert('Please enter a valid URL')
    return
  }

  // Check for duplicates
  if (wizardWebsites.value.includes(wizardWebsiteUrl.value)) {
    alert('This URL has already been added')
    return
  }

  wizardWebsites.value.push(wizardWebsiteUrl.value)
  wizardWebsiteUrl.value = ''
  handleInputChange()
}

function removeWebsiteUrl(index) {
  wizardWebsites.value.splice(index, 1)
  handleInputChange()
}

function generateMockResponse(userMessage) {
  const message = userMessage.toLowerCase()
  const knowledge = wizardKnowledge.value || ''
  const problemType = agent.value?.problemType || 'general'

  // Helper function to extract info from knowledge base
  function extractInfo(keywords, context = 2) {
    const lines = knowledge.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase()
      if (keywords.some(keyword => line.includes(keyword))) {
        // Return the line and some context
        const start = Math.max(0, i - context)
        const end = Math.min(lines.length, i + context + 1)
        return lines.slice(start, end)
          .filter(l => l.trim() && !l.trim().startsWith('#'))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim()
      }
    }
    return null
  }

  // Check for hours/time
  if (message.includes('hour') || message.includes('open') || message.includes('time') || message.includes('when')) {
    const info = extractInfo(['hours:', 'open:', 'monday', 'time:'])
    if (info) {
      return `${info} Is there anything else I can help you with?`
    }
  }

  // Check for returns/refunds
  if (message.includes('return') || message.includes('refund')) {
    const info = extractInfo(['return', 'refund', 'money-back'])
    if (info) {
      return `${info} Would you like me to help you start a return?`
    }
  }

  // Check for pricing
  if (message.includes('pricing') || message.includes('cost') || message.includes('price') || message.includes('how much')) {
    const info = extractInfo(['pricing:', 'price:', 'cost:', '$', 'plans:'])
    if (info) {
      return `${info} Would you like more details about any specific option?`
    }
  }

  // Check for contact info
  if (message.includes('contact') || message.includes('email') || message.includes('phone') || message.includes('call')) {
    const info = extractInfo(['email:', 'phone:', 'contact:'])
    if (info) {
      return `${info} How else can I assist you?`
    }
  }

  // Check for shipping
  if (message.includes('ship') || message.includes('delivery')) {
    const info = extractInfo(['shipping:', 'delivery:', 'ship'])
    if (info) {
      return `${info} Do you have any other questions?`
    }
  }

  // Check for benefits (HR)
  if (message.includes('benefit') || message.includes('insurance') || message.includes('401k')) {
    const info = extractInfo(['benefits:', 'insurance:', '401k:', 'health'])
    if (info) {
      return `${info} Would you like more information about any specific benefit?`
    }
  }

  // Check for PTO/time off (HR)
  if (message.includes('pto') || message.includes('time off') || message.includes('vacation') || message.includes('leave')) {
    const info = extractInfo(['pto:', 'vacation:', 'time off:', 'leave:'])
    if (info) {
      return `${info} Is there anything else you'd like to know?`
    }
  }

  // Check for products/services
  if (message.includes('product') || message.includes('service') || message.includes('offer')) {
    const info = extractInfo(['products:', 'services:', 'offering:'])
    if (info) {
      return `${info} Would you like to learn more about any of these?`
    }
  }

  // Check for appointment/booking
  if (message.includes('book') || message.includes('appointment') || message.includes('schedule')) {
    const info = extractInfo(['booking:', 'appointment:', 'schedule:', 'available:'])
    if (info) {
      return `${info} What date and time work best for you?`
    }
    return "I can help you book an appointment. What date and time work best for you?"
  }

  // Check for tracking
  if (message.includes('track') || message.includes('order') || message.includes('package')) {
    const info = extractInfo(['tracking:', 'order:', 'package:'])
    if (info) {
      return `${info} Do you need help with anything else?`
    }
    return "I can help you track your order. Could you provide your order number or email address?"
  }

  // General help requests
  if (message.includes('help') || message.includes('support') || message.includes('problem')) {
    return "I'm here to help! Can you tell me more about what you need assistance with?"
  }

  // Default responses by problem type
  const defaults = {
    support: "I'd be happy to help you with that. Based on our policies and information, can you provide more details about your question?",
    sales: "That's a great question! Based on what we offer, I can provide more information. Would you like to schedule a call with our team?",
    hr: "I can help with that. Let me know if you need information about benefits, time off, or other HR topics.",
    orders: "I can help you with your order. Could you provide your order number or email address?",
    scheduling: "I can help you book an appointment. What date and time work best for you?",
    general: "Thanks for reaching out! How can I assist you today?"
  }

  return defaults[problemType] || "Thank you for your message. How can I help you further?"
}

// Wizard Mode Functions
function nextWizardStep() {
  if (wizardStep.value < totalWizardSteps.value) {
    wizardStep.value++
    saveAgent() // Auto-save when moving forward
  } else {
    // Complete wizard and go to TEST tab
    completeWizard()
  }
}

function prevWizardStep() {
  if (wizardStep.value > 1) {
    wizardStep.value--
  }
}

function completeWizard() {
  wizardCompleted.value = true
  wizardMode.value = false

  // Save knowledge to organization knowledge base if provided
  if (wizardKnowledge.value.trim()) {
    const orgKnowledge = {
      content: wizardKnowledge.value,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem('daart-org-knowledge', JSON.stringify(orgKnowledge))
  }

  // Clear the needsWizard flag
  if (agent.value) {
    agent.value.needsWizard = false
  }
  saveAgent()
  // Navigate to BUILD tab
  router.push(`/agents-v2/${agent.value.id}/build`)
}

function skipWizard() {
  wizardMode.value = false
  wizardCompleted.value = true
  // Clear the needsWizard flag
  if (agent.value) {
    agent.value.needsWizard = false
  }
  saveAgent()
}

function toggleWizardMode() {
  if (wizardMode.value) {
    // Switching to Expert Mode
    wizardMode.value = false
    wizardCompleted.value = true
    // Clear the needsWizard flag so it doesn't auto-activate again
    if (agent.value) {
      agent.value.needsWizard = false
    }
    saveAgent()
  } else {
    // Switching to Wizard Mode
    wizardMode.value = true
    wizardCompleted.value = false
    wizardStep.value = 1
  }
}

// Wizard Knowledge Functions
function connectIntegrationWizard(integrationId) {
  const platform = availableIntegrationPlatforms.value.find(p => p.id === integrationId)
  if (!platform) return
  alert(`${platform.name} integration will be available after completing the wizard. You can connect it from the Knowledge Base section.`)
}

// Workspace Knowledge Management Functions
function connectIntegrationWorkspace(integrationId) {
  const platform = availableIntegrationPlatforms.value.find(p => p.id === integrationId)
  if (!platform) return

  alert(`Connecting to ${platform.name}... (OAuth flow would happen here)`)

  if (!agent.value.knowledgeSources.integrations) {
    agent.value.knowledgeSources.integrations = []
  }

  const connected = {
    id: Date.now(),
    integrationId: platform.id,
    name: platform.name,
    status: 'Connected',
    itemCount: Math.floor(Math.random() * 50) + 10
  }

  agent.value.knowledgeSources.integrations.push(connected)
  handleInputChange()
}

function disconnectIntegration(integrationId) {
  if (!agent.value.knowledgeSources.integrations) return
  agent.value.knowledgeSources.integrations = agent.value.knowledgeSources.integrations.filter(i => i.id !== integrationId)
  handleInputChange()
}

function handleWorkspaceFileUpload(event) {
  const files = Array.from(event.target.files)

  if (!agent.value.knowledgeSources.documents) {
    agent.value.knowledgeSources.documents = []
  }

  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`File ${file.name} is too large (max 10MB)`)
      return
    }

    const newFile = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      status: 'ready'
    }

    agent.value.knowledgeSources.documents.push(newFile)
  })

  event.target.value = ''
  handleInputChange()
}

function removeWorkspaceFile(fileId) {
  if (!agent.value.knowledgeSources.documents) return
  agent.value.knowledgeSources.documents = agent.value.knowledgeSources.documents.filter(f => f.id !== fileId)
  handleInputChange()
}

function handleConversationUploadWorkspace(event) {
  const files = Array.from(event.target.files)

  if (!agent.value.knowledgeSources.conversations) {
    agent.value.knowledgeSources.conversations = []
  }

  files.forEach(file => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      alert(`File ${file.name} must be CSV or JSON format`)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(`File ${file.name} is too large (max 5MB)`)
      return
    }

    const newConv = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      status: 'ready',
      conversationCount: Math.floor(Math.random() * 200) + 50
    }

    agent.value.knowledgeSources.conversations.push(newConv)
  })

  event.target.value = ''
  handleInputChange()
}

function removeConversationWorkspace(convId) {
  if (!agent.value.knowledgeSources.conversations) return
  agent.value.knowledgeSources.conversations = agent.value.knowledgeSources.conversations.filter(c => c.id !== convId)
  handleInputChange()
}

function addTextSnippetWorkspace() {
  if (!newSnippetText.value.trim()) return

  if (!agent.value.knowledgeSources.textSnippets) {
    agent.value.knowledgeSources.textSnippets = []
  }

  const snippet = {
    id: Date.now(),
    title: newSnippetTitle.value.trim() || `Text snippet ${agent.value.knowledgeSources.textSnippets.length + 1}`,
    content: newSnippetText.value.trim()
  }

  agent.value.knowledgeSources.textSnippets.push(snippet)
  newSnippetText.value = ''
  newSnippetTitle.value = ''
  handleInputChange()
}

function removeSnippetWorkspace(snippetId) {
  if (!agent.value.knowledgeSources.textSnippets) return
  agent.value.knowledgeSources.textSnippets = agent.value.knowledgeSources.textSnippets.filter(s => s.id !== snippetId)
  handleInputChange()
}

function addWebsiteWorkspace() {
  if (!newWebsiteUrl.value.trim()) return

  if (!agent.value.knowledgeSources.websites) {
    agent.value.knowledgeSources.websites = []
  }

  const site = {
    id: Date.now(),
    url: newWebsiteUrl.value.trim(),
    status: 'ready',
    pageCount: crawlSubpagesWorkspace.value ? Math.floor(Math.random() * 40) + 10 : 1
  }

  agent.value.knowledgeSources.websites.push(site)
  newWebsiteUrl.value = ''
  crawlSubpagesWorkspace.value = true
  handleInputChange()
}

function removeWebsiteWorkspace(siteId) {
  if (!agent.value.knowledgeSources.websites) return
  agent.value.knowledgeSources.websites = agent.value.knowledgeSources.websites.filter(s => s.id !== siteId)
  handleInputChange()
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function toggleSkill(skillName) {
  if (!agent.value) return

  // Initialize skills array if it doesn't exist
  if (!agent.value.skills) {
    agent.value.skills = []
  }

  // Check if skill is already added
  const skillIndex = agent.value.skills.findIndex(s => s.name === skillName)

  if (skillIndex > -1) {
    // Remove skill
    agent.value.skills.splice(skillIndex, 1)
  } else {
    // Add skill - find the full skill object from availableSkills
    const skillToAdd = availableSkills.value.find(s => s.name === skillName)
    if (skillToAdd) {
      agent.value.skills.push({
        id: skillToAdd.id,
        name: skillToAdd.name,
        description: skillToAdd.description,
        enabled: true
      })
    }
  }

  // Auto-save when toggling skills in wizard
  handleInputChange()
}

function openSkillsBuilder() {
  showSkillsBuilder.value = true
  newSkill.value = {
    name: '',
    description: '',
    mcpServer: '',
    parameters: '',
    isEditing: false,
    editingId: null
  }
}

function editSkill(skill) {
  showSkillsBuilder.value = true
  newSkill.value = {
    name: skill.name,
    description: skill.description,
    mcpServer: skill.mcpServer || '',
    parameters: skill.parameters || '',
    isEditing: true,
    editingId: skill.id
  }
}

function closeSkillsBuilder() {
  showSkillsBuilder.value = false
}

function createSkill() {
  if (!agent.value) return
  if (!newSkill.value.name.trim()) {
    alert('Skill name is required')
    return
  }

  if (newSkill.value.isEditing) {
    // Update existing skill
    const skillIndex = agent.value.skills.findIndex(s => s.id === newSkill.value.editingId)
    if (skillIndex > -1) {
      agent.value.skills[skillIndex] = {
        ...agent.value.skills[skillIndex],
        name: newSkill.value.name,
        description: newSkill.value.description,
        mcpServer: newSkill.value.mcpServer || null,
        parameters: newSkill.value.parameters || null
      }
    }
  } else {
    // Create new skill
    const skill = {
      id: `skill-${Date.now()}`,
      name: newSkill.value.name,
      description: newSkill.value.description,
      enabled: true,
      mcpServer: newSkill.value.mcpServer || null,
      parameters: newSkill.value.parameters || null
    }

    if (!agent.value.skills) {
      agent.value.skills = []
    }

    agent.value.skills.push(skill)
  }

  saveAgent()
  closeSkillsBuilder()
}

// Helper Functions
function formatDate(isoString) {
  if (!isoString) return 'Never'

  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Lifecycle
onMounted(() => {
  loadAgent()
  // Add keyboard listener for evaluation shortcuts
  window.addEventListener('keydown', handleEvalKeyPress)
})

watch(() => route.params.id, () => {
  loadAgent()
})

// Watch wizard mode to add/remove body class
watch(wizardMode, (isActive) => {
  if (isActive) {
    document.body.classList.add('wizard-mode-active')
  } else {
    document.body.classList.remove('wizard-mode-active')
  }
}, { immediate: true })

// Cleanup on unmount
onUnmounted(() => {
  document.body.classList.remove('wizard-mode-active')
  // Remove keyboard listener
  window.removeEventListener('keydown', handleEvalKeyPress)
})

// Watch for scroll position to update active section
if (typeof window !== 'undefined') {
  watch(() => buildMainContent.value, (newVal) => {
    if (newVal) {
      newVal.addEventListener('scroll', () => {
        // Update active section based on scroll position
        const sections = buildSections.value
        for (const section of sections) {
          const element = document.getElementById(section.id)
          if (element) {
            const rect = element.getBoundingClientRect()
            if (rect.top >= 0 && rect.top < 200) {
              activeBuildSection.value = section.id
              break
            }
          }
        }
      })
    }
  })
}
</script>

<style scoped>
/* Main Container */
.workspace-v2 {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background: #fff;
}

/* No Agent State */
.no-agent-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px;
}

.no-agent-state p {
  font-size: 18px;
  color: #666;
}

/* Agent Workspace */
.agent-workspace {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Workspace Header */
.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 40px;
  border-bottom: 1px solid #ddd;
  background: #fff;
  flex-shrink: 0;
}

.header-left {
  flex: 1;
}

.agent-name {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.agent-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #666;
}

.meta-badge {
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-badge.draft {
  background: #f0f0f0;
  color: #666;
}

.meta-badge.live {
  background: #e8f5e9;
  color: #2e7d32;
}

.meta-divider {
  color: #ccc;
}

.meta-type {
  font-weight: 500;
}

.channel-badge {
  padding: 2px 8px;
  background: #e0e0e0;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}

.auto-save-status {
  font-size: 13px;
  color: #999;
}

.auto-save-status.saving {
  color: #ff9800;
}

.auto-save-status.saved {
  color: #4caf50;
}

.header-right {
  display: flex;
  gap: 12px;
}

/* Workspace Main (contains tab content) */
.workspace-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* BUILD Tab Layout - Horizontal tabs + 2 columns */
.build-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Horizontal Build Tabs */
.build-tabs-nav {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #ddd;
  background: #fff;
  padding: 0 40px;
  flex-shrink: 0;
}

.build-tab-item {
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.build-tab-item:hover {
  color: #000;
}

.build-tab-item.active {
  color: #000;
  border-bottom-color: #000;
}

/* Build Content Wrapper (2 columns: main + test panel) */
.build-content-wrapper {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 0;
  flex: 1;
  overflow: hidden;
}

/* Full width when Agent Studio is active */
.build-content-wrapper:has(.visual-builder-container) {
  grid-template-columns: 1fr;
}

/* Build Main Content */
.build-main {
  overflow-y: auto;
  padding: 40px;
  background: #fff;
}

.config-section {
  margin-bottom: 0;
  padding-bottom: 0;
}

.config-section h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #000;
}

/* Subsection within config (e.g., Channels within Configuration) */
.subsection {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #e0e0e0;
}

.subsection h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #000;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.input-field:focus {
  outline: none;
  border-color: #000;
}

textarea.input-field {
  resize: vertical;
  line-height: 1.5;
}

.hint {
  font-size: 13px;
  color: #999;
  margin-top: 6px;
}

/* Build Testing Panel (Right Column) */
.build-testing-panel {
  border-left: 1px solid #ddd;
  background: #fafafa;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* TEST Tab Layout - 2 columns */
.test-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 0;
  height: 100%;
  overflow: hidden;
}

/* EVALUATE Tab Layout - Full width */
.evaluate-tab-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.evaluate-main {
  padding: 40px;
  overflow-y: auto;
  background: #fff;
  flex: 1;
}

.test-scenarios-main {
  padding: 40px;
  overflow-y: auto;
  background: #fff;
}

.test-panel-wrapper {
  border-left: 1px solid #ddd;
  background: #fafafa;
  overflow: hidden;
}

/* MONITOR Tab Layout - 2 columns */
.monitor-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 0;
  height: 100%;
  overflow: hidden;
}

.monitor-main {
  padding: 0;
  overflow-y: auto;
  background: #fff;
}

.monitor-subnav {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
  padding: 0 40px;
}

.monitor-subnav-btn {
  padding: 16px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.monitor-subnav-btn:hover {
  color: #000;
}

.monitor-subnav-btn.active {
  color: #000;
  border-bottom-color: #000;
  font-weight: 600;
}

.live-dashboard,
.draft-dashboard {
  padding: 40px;
}

.monitor-panel-wrapper {
  border-left: 1px solid #ddd;
  background: #fafafa;
  overflow: hidden;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #000;
  color: #fff;
  border-color: #000;
}

.btn-primary:hover {
  background: #333;
  border-color: #333;
}

.btn-secondary {
  background: #fff;
  color: #000;
  border-color: #ddd;
}

.btn-secondary:hover {
  border-color: #000;
  background: #f5f5f5;
}

/* Build Section Anchor for scrolling */
.build-section-anchor {
  scroll-margin-top: 20px;
}

/* Section Intro Text */
.section-intro {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
}

/* Collapsible Sections */
.collapsible-section {
  margin-bottom: 16px;
  border: 1px solid #ddd;
  background: #fafafa;
}

.collapsible-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.collapsible-header:hover {
  background: #f0f0f0;
}

.collapsible-header .section-title {
  font-size: 15px;
  font-weight: 600;
  color: #000;
}

.chevron {
  font-size: 18px;
  color: #666;
  transition: transform 0.2s;
  display: inline-block;
}

.chevron.expanded {
  transform: rotate(90deg);
}

.collapsible-content {
  padding: 20px 16px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}

/* Color Picker */
.color-picker-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 1px solid #ddd;
  cursor: pointer;
  padding: 2px;
}

.color-input:hover {
  border-color: #999;
}

.color-text {
  flex: 1;
  font-family: monospace;
}

/* Checkbox Group */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Range Input */
.range-input {
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  appearance: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: #000;
  cursor: pointer;
  border-radius: 50%;
}

.range-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #000;
  cursor: pointer;
  border-radius: 50%;
  border: none;
}

.range-value {
  font-size: 13px;
  color: #666;
  margin-top: 6px;
  text-align: right;
  font-weight: 500;
}

/* Channel Cards */
.channel-card {
  border: 1px solid #ddd;
  background: #fff;
  margin-bottom: 16px;
  padding: 20px;
  transition: all 0.2s;
}

.channel-card.enabled {
  border-color: #000;
  background: #fafafa;
}

.channel-card.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.channel-name {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.channel-status {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.channel-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.channel-config {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #000;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

/* Coming Soon Badge */
.coming-soon-badge {
  font-size: 11px;
  color: #999;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 3px 8px;
  background: #f0f0f0;
  border-radius: 3px;
}

/* Knowledge Base */
.knowledge-upload-area {
  margin-bottom: 32px;
}

/* Knowledge Base Section - Connected Sources */
.connected-sources-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f8f8;
  border-radius: 8px;
}

.connected-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin: 0 0 16px 0;
}

.connected-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 8px;
}

.connected-item:last-child {
  margin-bottom: 0;
}

.connected-item-info {
  flex: 1;
  min-width: 0;
}

.connected-item-info strong {
  display: block;
  font-size: 14px;
  color: #000;
  margin-bottom: 4px;
}

.connected-item-meta {
  font-size: 13px;
  color: #666;
}

.snippet-preview {
  font-size: 13px;
  color: #666;
  margin: 4px 0 0 0;
  line-height: 1.4;
}

/* Available Sources Section */
.available-sources-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 13px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

/* Accordion count badge */
.accordion-count {
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-left: 8px;
}

.knowledge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: #f8f9ff;
  border: 1px solid #d0d7ff;
  border-radius: 6px;
}

.knowledge-intro {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin: 0;
  flex: 1;
  margin-right: 20px;
}

.knowledge-sources-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.knowledge-source-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s;
}

.knowledge-source-item:hover {
  background: #f5f5f5;
  border-color: #ccc;
}

.source-checkbox {
  flex: 1;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 12px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 15px;
  font-weight: 500;
  color: #000;
}

.source-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #666;
}

.source-size,
.source-count {
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 3px;
}

.knowledge-empty-state {
  padding: 40px 20px;
  text-align: center;
  background: #fafafa;
  border: 1px dashed #ddd;
  border-radius: 6px;
}

.knowledge-empty-state p {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.knowledge-empty-state .link {
  color: #0066cc;
  text-decoration: none;
  font-size: 14px;
}

.knowledge-empty-state .link:hover {
  text-decoration: underline;
}

.btn-manage-knowledge:hover {
  background: #333;
}

.upload-box {
  border: 2px dashed #ddd;
  padding: 40px;
  text-align: center;
  background: #fafafa;
  transition: all 0.2s;
}

.upload-box:hover {
  border-color: #999;
  background: #f5f5f5;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 12px;
}

.knowledge-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.knowledge-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #ddd;
  background: #fafafa;
  transition: all 0.2s;
}

.knowledge-item:hover {
  border-color: #999;
  background: #f5f5f5;
}

.doc-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.doc-info {
  flex: 1;
}

.doc-name {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.doc-meta {
  font-size: 12px;
  color: #999;
}

.doc-status {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  padding: 40px 20px;
  text-align: center;
  background: #fafafa;
  border: 1px dashed #ddd;
  margin-bottom: 20px;
}

.empty-state p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Skills (Static Table UI) */
.skills-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.skills-header-left h3 {
  margin: 0 0 4px 0;
}

.section-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.skills-header-actions {
  display: flex;
  gap: 12px;
}

/* Discovered Skills Section */
.discovered-skills-section {
  margin: 24px 0;
  padding: 24px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.discovered-skills-header {
  margin-bottom: 20px;
}

.discovered-skills-title {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin: 0 0 4px 0;
}

.discovered-skills-subtitle {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.discovered-skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.discovered-skill-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  transition: all 0.2s;
}

.discovered-skill-card:hover {
  border-color: #999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.discovered-skill-header {
  margin-bottom: 12px;
}

.discovered-skill-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.discovered-skill-name {
  font-size: 15px;
  font-weight: 600;
  color: #000;
  flex: 1;
}

.discovered-skill-description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.discovered-skill-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 12px;
  color: #999;
}

.meta-item {
  white-space: nowrap;
}

.meta-divider {
  color: #ddd;
}

.discovered-skill-example {
  font-size: 12px;
  color: #666;
  padding: 8px 12px;
  background: #fafafa;
  border-left: 2px solid #e0e0e0;
  margin-bottom: 12px;
  line-height: 1.5;
}

.example-label {
  font-weight: 600;
  color: #000;
}

.btn-primary-sm {
  padding: 6px 16px;
  background: #000;
  color: #fff;
  border: 1px solid #000;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.btn-primary-sm:hover {
  background: #333;
  border-color: #333;
}

.skills-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.skills-filters .search-input {
  flex: 1;
  max-width: 300px;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.skills-filters .search-input:focus {
  border-color: #999;
}

.filter-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  flex-shrink: 0;
}

.filter-select {
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  outline: none;
  white-space: nowrap;
  min-width: 120px;
  flex-shrink: 0;
}

.filter-select:hover {
  border-color: #999;
}

.skills-table-container {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.skills-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.skills-table thead {
  background: #fafafa;
  border-bottom: 1px solid #e0e0e0;
}

.skills-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.skills-table tbody tr {
  border-bottom: 1px solid #e0e0e0;
  transition: background 0.2s;
}

.skills-table tbody tr:last-child {
  border-bottom: none;
}

.skills-table tbody tr:hover {
  background: #fafafa;
}

.skills-table td {
  padding: 16px;
  font-size: 14px;
  color: #000;
  vertical-align: top;
}

.skills-table .skill-name {
  font-weight: 500;
  color: #000;
  margin-bottom: 8px;
}

.skill-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-label {
  display: inline-block;
  padding: 3px 8px;
  font-size: 12px;
  background: #f0f0f0;
  border: 1px solid #e0e0e0;
  border-radius: 3px;
  color: #666;
}

.source-detail {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 3px;
  text-transform: capitalize;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.status-badge.inactive {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #e0e0e0;
}

.status-badge.archived {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffe0b2;
}

/* Agent Studio (Static - from Onboarding) */
.visual-builder-container {
  padding: 0 !important;
  margin: 0 !important;
  height: calc(100vh - 200px);
}

.visual-builder-layout {
  display: grid;
  grid-template-columns: 1fr 450px;
  height: 100%;
  min-height: 600px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

/* Left Panel: Canvas */
.vb-canvas-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  overflow: hidden;
}

.vb-canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.vb-canvas-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.vb-canvas-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vb-control-btn {
  padding: 6px 12px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.vb-control-btn:hover {
  background: #000;
  color: #fff;
  border-color: #000;
}

.vb-zoom-level {
  font-size: 13px;
  color: #666;
  min-width: 50px;
  text-align: center;
}

.vb-canvas-area {
  flex: 1;
  position: relative;
  overflow: auto;
  background: #fafafa;
}

.vb-canvas-empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #999;
}

.vb-canvas-empty-state p {
  margin: 8px 0;
  font-size: 14px;
}

.vb-empty-hint {
  font-size: 13px;
  font-style: italic;
}

/* Right Panel: Builder */
.vb-builder-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
}

.vb-builder-tabs {
  display: flex;
  border-bottom: 1px solid #e0e0e0;
}

.vb-tab-btn {
  flex: 1;
  padding: 14px 8px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.vb-tab-btn.active {
  color: #000;
  border-bottom-color: #000;
}

.vb-tab-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* AI Builder Tab */
.vb-ai-builder-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.vb-ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.vb-ai-message {
  max-width: 85%;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
}

.vb-ai-message.assistant {
  background: #f0f0f0;
  color: #000;
  align-self: flex-start;
}

.vb-message-content {
  white-space: pre-wrap;
}

.vb-ai-input-area {
  flex-shrink: 0;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
  align-items: flex-end;
  background: #fff;
}

.vb-ai-input-area textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  resize: none;
}

.vb-ai-input-area textarea:focus {
  outline: none;
  border-color: #000;
}

.vb-send-btn {
  padding: 10px 20px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.vb-send-btn:hover {
  background: #333;
}

/* TEST Tab Styles */
.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.test-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.test-header-left h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.test-meta {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}

.test-header-right {
  display: flex;
  gap: 12px;
}

/* Free Testing Info Banner */
.test-info-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: #f0f7ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
  margin-bottom: 24px;
}

.test-info-banner .info-icon {
  font-size: 18px;
  line-height: 1;
  flex-shrink: 0;
}

.test-info-banner .info-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.test-info-banner .info-text strong {
  font-weight: 600;
  color: #000;
}

.test-empty-state {
  padding: 60px 40px;
  text-align: center;
  background: #fafafa;
  border: 1px dashed #ddd;
}

.test-empty-state h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.test-empty-state p {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
}

.test-scenarios-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.scenario-card {
  border: 1px solid #ddd;
  padding: 20px;
  background: #fafafa;
  transition: all 0.3s;
}

.scenario-card:hover {
  border-color: #999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.scenario-name {
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.scenario-run-btn {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  background: #fff;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.scenario-run-btn:hover:not(:disabled) {
  border-color: #000;
  background: #f5f5f5;
}

.scenario-run-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.scenario-run-btn.running {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
}

.scenario-run-btn.passed {
  background: #e8f5e9;
  border-color: #4caf50;
  color: #2e7d32;
}

.scenario-run-btn.failed {
  background: #ffebee;
  border-color: #f44336;
  color: #c62828;
}

.loading-dots {
  display: inline-block;
  animation: dots 1.5s steps(4, end) infinite;
}

@keyframes dots {
  0%, 20% { content: '.'; }
  40% { content: '..'; }
  60%, 100% { content: '...'; }
}

.scenario-prompt {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.scenario-prompt strong {
  color: #000;
  font-weight: 600;
}

.scenario-keywords {
  font-size: 14px;
  color: #666;
  margin-bottom: 16px;
}

.scenario-keywords strong {
  color: #000;
  font-weight: 600;
}

.keywords-list {
  display: inline;
  font-style: italic;
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
}

.scenario-results {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.result-response {
  margin-bottom: 16px;
}

.result-response strong {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  display: block;
  margin-bottom: 8px;
}

.result-response p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  padding: 12px;
  background: #fff;
  border: 1px solid #ddd;
}

.result-matched {
  margin-bottom: 12px;
}

.result-matched strong {
  font-size: 13px;
  font-weight: 600;
  color: #2e7d32;
  display: block;
  margin-bottom: 6px;
}

.matched-keywords {
  font-size: 13px;
  color: #2e7d32;
  background: #e8f5e9;
  padding: 6px 10px;
  border-radius: 3px;
  display: inline-block;
}

.result-missing {
  margin-bottom: 12px;
}

.result-missing strong {
  font-size: 13px;
  font-weight: 600;
  color: #c62828;
  display: block;
  margin-bottom: 6px;
}

.missing-keywords {
  font-size: 13px;
  color: #c62828;
  background: #ffebee;
  padding: 6px 10px;
  border-radius: 3px;
  display: inline-block;
}

/* Test Mode Toggle */
.test-mode-toggle {
  display: flex;
  gap: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.test-mode-toggle button {
  padding: 8px 16px;
  background: #fff;
  color: #666;
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-right: 1px solid #ddd;
}

.test-mode-toggle button:last-child {
  border-right: none;
}

.test-mode-toggle button:hover:not(:disabled) {
  background: #f5f5f5;
}

.test-mode-toggle button.active {
  background: #000;
  color: #fff;
}

.test-mode-toggle button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Evaluate Mode Layout */
.evaluate-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 32px;
  width: 100%;
  max-width: 100%;
}

/* Question List Panel */
.question-list-panel {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
  height: 600px;
  max-height: calc(100vh - 350px);
}

.eval-filters {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fafafa;
}

.filter-group {
  display: flex;
  flex-direction: row;
  gap: 6px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  background: #fff;
  color: #333;
  cursor: pointer;
}

.question-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.question-item {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.question-item:hover {
  border-color: #999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.question-item.selected {
  border-color: #000;
  background: #fafafa;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 8px;
}

.question-name {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  flex: 1;
}

.rating-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  flex-shrink: 0;
}

.rating-badge.good {
  background: #e8f5e9;
  color: #2e7d32;
}

.rating-badge.acceptable {
  background: #fff3e0;
  color: #e65100;
}

.rating-badge.poor {
  background: #ffebee;
  color: #c62828;
}

.question-prompt {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.question-status {
  font-size: 12px;
}

.status-answered {
  color: #2e7d32;
  font-weight: 500;
}

.status-unanswered {
  color: #999;
}

.eval-empty {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* Evaluation Panel */
.evaluation-panel {
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  overflow-y: auto;
  padding: 32px;
  height: 600px;
  max-height: calc(100vh - 350px);
}

.eval-content {
  max-width: 700px;
}

.eval-section {
  margin-bottom: 32px;
}

.eval-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.eval-question {
  font-size: 16px;
  color: #333;
  line-height: 1.6;
  margin: 0;
  padding: 16px;
  background: #f5f5f5;
  border-left: 3px solid #000;
}

.eval-answer p {
  font-size: 15px;
  color: #333;
  line-height: 1.7;
  margin: 0;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.eval-no-answer {
  padding: 24px;
  text-align: center;
  background: #fafafa;
  border: 1px dashed #ddd;
  border-radius: 4px;
}

.eval-no-answer p {
  color: #666;
  margin: 0 0 16px 0;
}

.content-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.content-tag {
  font-size: 12px;
  padding: 6px 12px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-weight: 500;
}

/* Rating Buttons */
.rating-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.rating-btn {
  flex: 1;
  padding: 16px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
}

.rating-btn:hover {
  border-color: #999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.rating-btn.selected {
  border-width: 2px;
}

.rating-btn.good.selected {
  border-color: #2e7d32;
  background: #e8f5e9;
}

.rating-btn.acceptable.selected {
  border-color: #e65100;
  background: #fff3e0;
}

.rating-btn.poor.selected {
  border-color: #c62828;
  background: #ffebee;
}

.rating-label {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.rating-key {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 3px;
  color: #666;
}

.rating-hint {
  font-size: 12px;
  color: #999;
  margin: 0;
  text-align: center;
}

/* Evaluation Notes */
.eval-notes {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  transition: border-color 0.2s;
}

.eval-notes:focus {
  outline: none;
  border-color: #000;
}

.eval-no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}

/* Scrollbar styling for question list */
.question-list::-webkit-scrollbar {
  width: 6px;
}

.question-list::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.question-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.question-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* Modal Styles */
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
  z-index: 2000;
}

.modal-dialog {
  background: #fff;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #ddd;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.modal-close {
  background: none;
  border: none;
  font-size: 32px;
  line-height: 1;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #000;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #ddd;
  background: #fafafa;
}

.required {
  color: #f44336;
  font-weight: bold;
}

/* Deploy Overlay Styles */
.deploy-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.deploy-overlay-content {
  width: 95vw;
  height: 95vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.deploy-overlay-header {
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}

.deploy-overlay-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.deploy-checkout-layout {
  display: grid;
  grid-template-columns: 300px 1fr 350px;
  gap: 24px;
  flex: 1;
  overflow: hidden;
  padding: 24px;
}

/* Left Column - Checklist */
.deploy-checkout-left {
  overflow-y: auto;
}

.deploy-checkout-left h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #000;
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
  padding: 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  color: #999;
}

.checklist-item.complete {
  background: #e8f5e9;
  border-color: #4caf50;
  color: #000;
}

.checklist-item .check {
  font-size: 18px;
  color: #ccc;
}

.checklist-item.complete .check {
  color: #4caf50;
}

/* Middle Column - Review */
.deploy-checkout-main {
  overflow-y: auto;
  padding-right: 12px;
}

.review-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 6px;
}

.review-card h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #000;
}

.review-row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-row:last-child {
  border-bottom: none;
}

.review-label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
  width: 180px;
  flex-shrink: 0;
}

.review-value {
  font-size: 14px;
  color: #000;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.color-preview {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: inline-block;
}

.deploy-channel-badge {
  padding: 3px 8px;
  background: #e0e0e0;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 500;
}

.review-instructions {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  padding: 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.review-kb-item,
.review-skill-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  margin-bottom: 8px;
  border-radius: 4px;
}

.kb-icon {
  font-size: 24px;
}

.kb-info {
  flex: 1;
}

.kb-name {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.kb-meta {
  font-size: 12px;
  color: #999;
}

.skill-status-badge {
  padding: 4px 10px;
  background: #f0f0f0;
  color: #999;
  font-size: 11px;
  font-weight: 600;
  border-radius: 3px;
  text-transform: uppercase;
}

.skill-status-badge.enabled {
  background: #e8f5e9;
  color: #2e7d32;
}

/* Right Column - Billing & Deploy */
.deploy-checkout-sidebar {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.deploy-cost-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  padding: 20px;
  border-radius: 6px;
}

.deploy-cost-card h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #000;
}

.deploy-cost-card h5 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.trial-badge {
  display: inline-block;
  padding: 6px 12px;
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.trial-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trial-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #000;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 13px;
  color: #666;
  text-align: center;
}

.trial-divider {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #999;
}

.trial-note {
  font-size: 12px;
  color: #999;
  text-align: center;
  font-style: italic;
}

.credit-amount {
  font-size: 36px;
  font-weight: 700;
  color: #000;
  margin-bottom: 6px;
}

.credit-equiv {
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
}

.pricing-info {
  margin-bottom: 20px;
}

.pricing-info ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
  font-size: 13px;
  color: #666;
  line-height: 1.8;
}

.deploy-warning-box {
  padding: 16px;
  background: #fff3e0;
  border: 1px solid #ffb74d;
  border-radius: 6px;
}

.deploy-warning-box strong {
  display: block;
  color: #e65100;
  margin-bottom: 8px;
  font-size: 14px;
}

.deploy-warning-box p {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.btn-deploy {
  width: 100%;
  padding: 16px 24px;
  background: #000;
  color: #fff;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 6px;
  margin-top: auto;
}

.btn-deploy:hover:not(:disabled) {
  background: #333;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-deploy:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Success Modal */
.success-modal {
  background: #fff;
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  padding: 48px;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow-y: auto;
}

.success-modal h2 {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #000;
  text-align: center;
}

.success-message {
  font-size: 16px;
  color: #666;
  text-align: center;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.success-steps {
  margin-bottom: 32px;
}

.success-steps h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: #000;
}

.success-step {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.success-step:last-child {
  border-bottom: none;
}

.step-number {
  width: 36px;
  height: 36px;
  background: #000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.step-content p {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.step-content ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

.code-snippet {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  padding: 16px;
  font-size: 12px;
  font-family: 'Monaco', 'Courier New', monospace;
  overflow-x: auto;
  border-radius: 4px;
  margin: 12px 0;
  line-height: 1.6;
}

.success-tip {
  padding: 16px;
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  margin-bottom: 24px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.success-tip strong {
  color: #1976d2;
}

.btn-large {
  width: 100%;
  padding: 16px 32px;
  font-size: 16px;
}

/* MONITOR Tab Styles */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.dashboard-header h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.time-filter {
  display: flex;
  gap: 0;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.time-btn {
  padding: 8px 16px;
  background: #fff;
  border: none;
  border-right: 1px solid #e0e0e0;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn:last-child {
  border-right: none;
}

.time-btn:hover {
  background: #f5f5f5;
}

.time-btn.active {
  background: #000;
  color: #fff;
}

.metrics-section {
  margin-bottom: 40px;
}

.section-heading {
  font-size: 14px;
  font-weight: 600;
  text-transform: capitalize;
  margin: 0 0 16px 0;
  color: #000;
}

.metrics-row {
  display: flex;
  gap: 24px;
}

.metrics-row.secondary {
  gap: 24px;
}

.metric-item {
  flex: 1;
}

.metric-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  text-transform: capitalize;
}

.metric-value-large {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
  color: #000;
}

.metric-value-med {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
  color: #000;
}

.metric-change {
  font-size: 14px;
  color: #666;
}

.metric-change.positive {
  color: #2e7d32;
  font-weight: 500;
}

.metric-change.neutral {
  color: #666;
}

.metric-item-small {
  flex: 1;
}

.metric-subtext {
  font-size: 13px;
  color: #999;
}

/* Suggested Skills Section */
.suggested-skills-section {
  margin-bottom: 40px;
}

.section-subtitle-small {
  font-size: 13px;
  color: #666;
  margin: 0 0 16px 0;
}

.suggested-skills-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.suggested-skill-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
  transition: border-color 0.2s;
}

.suggested-skill-card:hover {
  border-color: #999;
}

.skill-card-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.skill-card-left {
  flex: 1;
  min-width: 0;
}

.skill-card-name {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.skill-card-frequency {
  font-size: 13px;
  color: #666;
}

.skill-card-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.confidence-badge {
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.confidence-badge.high {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.confidence-badge.medium {
  background: #fff3e0;
  color: #e65100;
  border: 1px solid #ffe0b2;
}

.confidence-badge.low {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.btn-secondary-sm {
  padding: 6px 12px;
  background: #fff;
  color: #000;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-secondary-sm:hover {
  background: #f5f5f5;
  border-color: #999;
}

.view-all-link {
  display: inline-block;
  font-size: 14px;
  color: #000;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;
}

.view-all-link:hover {
  opacity: 0.7;
}

.notifications-section {
  margin-bottom: 40px;
}

.notification-item {
  padding: 16px;
  background: #fff;
  border: 1px solid #e0e0e0;
  margin-bottom: 12px;
  border-radius: 4px;
}

.notification-item:last-child {
  margin-bottom: 0;
}

.notification-item.alert {
  border-left: 3px solid #ff9800;
  background: #fff8f0;
}

.notification-item.alert.security {
  border-left: 3px solid #d32f2f;
  background: #ffebee;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.notification-meta {
  font-size: 12px;
  color: #999;
}

.notification-text {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.status-banner {
  padding: 16px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-title {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.status-text {
  font-size: 13px;
  color: #666;
}

.active-channels {
  display: flex;
  gap: 8px;
  align-items: center;
}

.channel-label {
  font-size: 13px;
  color: #666;
  margin-right: 8px;
}

.channel-badge {
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #d0d0d0;
  color: #000;
  font-size: 12px;
  font-weight: 500;
  border-radius: 3px;
}

.conversation-history h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #000;
}

.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.conversation-item {
  background: #fff;
  border: 1px solid #e0e0e0;
  padding: 16px;
  border-radius: 6px;
  transition: all 0.2s;
}

.conversation-item:hover {
  border-color: #999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.conv-channel-badge {
  padding: 3px 8px;
  font-size: 10px;
  font-weight: 600;
  border-radius: 3px;
  text-transform: uppercase;
}

.conv-channel-badge.web-chat {
  background: #e3f2fd;
  color: #1976d2;
}

.conv-channel-badge.sms {
  background: #f3e5f5;
  color: #7b1fa2;
}

.conv-channel-badge.voice {
  background: #fff3e0;
  color: #f57c00;
}

.conv-time {
  font-size: 12px;
  color: #999;
}

.conv-user {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin-bottom: 6px;
}

.conv-summary {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.conv-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.conv-duration {
  font-size: 12px;
  color: #999;
}

.conv-status {
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 3px;
  text-transform: uppercase;
}

.conv-status.resolved {
  background: #e8f5e9;
  color: #2e7d32;
}

.conv-status.escalated {
  background: #ffebee;
  color: #c62828;
}

/* Draft Dashboard */
.draft-state-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  padding: 40px;
  text-align: center;
  border-radius: 6px;
  margin-bottom: 24px;
}

.draft-state-card h3 {
  margin-bottom: 12px;
}

.draft-state-card p {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.historical-data h4 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.historical-note {
  font-size: 13px;
  color: #999;
  margin: 0 0 20px 0;
  font-style: italic;
}

/* Unpublish Modal Styles */
.modal-intro {
  font-size: 15px;
  color: #333;
  margin-bottom: 20px;
}

.activity-warning {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  margin-bottom: 20px;
}

.warning-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.warning-content {
  flex: 1;
}

.warning-title {
  font-size: 16px;
  font-weight: 600;
  color: #856404;
  margin-bottom: 12px;
}

.warning-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.activity-item {
  font-size: 14px;
  color: #856404;
}

.activity-count {
  font-weight: 600;
  font-size: 16px;
}

.warning-note {
  font-size: 13px;
  color: #856404;
  margin: 0;
  font-style: italic;
}

.no-activity-info {
  padding: 20px;
  background: #e6f7e6;
  border: 1px solid #4caf50;
  border-radius: 6px;
  margin-bottom: 20px;
}

.no-activity-info p {
  margin: 0;
  font-size: 14px;
  color: #2e7d32;
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

/* Wizard Mode Styles */
.wizard-toggle {
  margin-right: 12px;
  /* Uses btn-secondary styles from global styles */
}

.build-layout.wizard-active {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.wizard-container {
  width: 100%;
  max-width: 1400px;
  padding: 40px 20px;
}

.wizard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

.wizard-progress {
  flex: 1;
}

.wizard-step-indicator {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.wizard-progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.wizard-progress-fill {
  height: 100%;
  background: #000;
  transition: width 0.3s ease;
}

.wizard-skip {
  background: none;
  border: none;
  font-size: 14px;
  color: #000;
  cursor: pointer;
  margin-left: 24px;
  padding: 0;
  text-decoration: underline;
  transition: opacity 0.2s;
}

.wizard-skip:hover {
  opacity: 0.7;
}

.wizard-step-content {
  margin-bottom: 32px;
}

.wizard-step {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wizard-step h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #000;
}

.wizard-step-description {
  font-size: 15px;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.wizard-skip-note {
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
}

.wizard-skip-note p {
  margin: 0;
  font-size: 13px;
  color: #666;
}

.wizard-navigation {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 1px solid #e0e0e0;
  padding-top: 24px;
  margin-top: 48px;
  clear: both;
}

.wizard-complete {
  text-align: center;
}

.wizard-next-steps {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.next-step-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  text-align: left;
}

.step-number {
  width: 32px;
  height: 32px;
  background: #000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #000;
}

.step-content p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

/* Wizard Split-Screen Layout */
.wizard-step-split {
  display: grid;
  grid-template-columns: 45fr 55fr;
  gap: 48px;
  align-items: start;
}

.wizard-left {
  display: flex;
  flex-direction: column;
  padding-bottom: 100px;
}

.wizard-left h2 {
  font-size: 28px;
  margin: 0;
  font-weight: 700;
}

.wizard-step-split .wizard-step-description {
  margin: 8px 0 32px 0;
  font-size: 16px;
}

.wizard-left .form-group {
  margin-bottom: 28px;
}

.wizard-right {
  position: sticky;
  top: 20px;
}

/* Step 1 Embedded Navigation */
.wizard-step-navigation {
  position: sticky;
  bottom: 0;
  margin-top: 40px;
  padding: 24px;
  background: white;
  border-top: 2px solid #e0e0e0;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
  margin-left: -24px;
  margin-right: -24px;
  margin-bottom: -24px;
}

.btn-block {
  width: 100%;
  padding: 14px 24px;
  font-size: 15px;
}

.nav-hint {
  margin-top: 12px;
  text-align: center;
  font-size: 13px;
  color: #856404;
  background: #fff3cd;
  padding: 10px;
  border-radius: 4px;
}

/* Optional Badge */
.optional-badge {
  font-size: 14px;
  font-weight: 400;
  color: #999;
  font-style: italic;
}

/* Collapsible Header */
.collapsible-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 12px 16px;
  user-select: none;
  border-radius: 6px;
  transition: background 0.2s;
}

.collapsible-header:hover {
  background: #f9f9f9;
}

.collapse-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #666;
  font-weight: 300;
  background: #f5f5f5;
  border-radius: 4px;
  transition: all 0.2s;
}

.collapsible-header:hover .collapse-icon {
  color: #000;
  background: #e0e0e0;
}

.collapsible-content {
  animation: slideDown 0.2s ease;
  margin-top: 12px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

/* Test Panel */
.test-panel {
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.test-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.test-panel-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #000;
}

.btn-reset-chat {
  padding: 6px 12px;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.btn-reset-chat:hover {
  border-color: #000;
  color: #000;
}

/* Test Info Notice */
.test-info-notice {
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: #fff8e1;
  border-bottom: 1px solid #ffc107;
  font-size: 12px;
  line-height: 1.5;
}

.notice-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.notice-text {
  color: #333;
  flex: 1;
}

.notice-text strong {
  color: #000;
  font-weight: 600;
}

/* Test Chat Container */
.test-chat-container {
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fafafa;
  height: 300px;
}

.test-welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.test-message {
  display: flex;
  animation: messageSlide 0.3s ease;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.test-message.user {
  justify-content: flex-end;
}

.test-message.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
}

.test-message.user .message-bubble {
  background: #000;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.test-message.assistant .message-bubble {
  background: #fff;
  color: #000;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
}

.message-bubble.thinking {
  display: flex;
  gap: 4px;
  padding: 16px 20px;
}

.typing-dot {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typingBounce 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingBounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* Test Input */
.test-input-container {
  display: flex;
  gap: 12px;
  padding: 14px 20px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}

.test-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.test-input:focus {
  outline: none;
  border-color: #000;
}

.test-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.btn-send {
  padding: 12px 24px;
  background: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-send:hover:not(:disabled) {
  background: #333;
}

.btn-send:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Test Suggestions */
.test-suggestions {
  padding: 14px 20px;
  background: #f9f9f9;
  border-top: 1px solid #e0e0e0;
}

.suggestions-label {
  font-size: 11px;
  font-weight: 600;
  color: #666;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggestion-button {
  display: inline-block;
  margin: 0 8px 8px 0;
  padding: 8px 14px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-button:hover:not(:disabled) {
  border-color: #000;
  background: #fafafa;
  color: #000;
}

.suggestion-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Test Requirement */
.test-requirement {
  padding: 12px 24px;
  background: #fff3cd;
  border-top: 1px solid #ffc107;
  font-size: 13px;
  color: #856404;
  text-align: center;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.skill-card {
  padding: 16px;
  background: #fafafa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.skill-card:hover {
  border-color: #999;
  background: #f5f5f5;
}

.skill-card.selected {
  border-color: #000;
  background: #fff;
}

.skill-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
}

.skill-description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.skill-status {
  margin-top: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #ff8c00;
  text-transform: uppercase;
}

.wizard-config-note {
  margin-top: 20px;
  padding: 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: #333;
}

.wizard-config-note strong {
  font-weight: 600;
  color: #000;
}

.channel-card {
  padding: 16px;
  background: #fafafa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.channel-card.clickable {
  cursor: pointer;
}

.channel-card.clickable:hover {
  border-color: #999;
  background: #f5f5f5;
}

.channel-card.enabled {
  border-color: #2e7d32;
  background: #f1f8f4;
}

.channel-info {
  width: 100%;
}

.channel-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #000;
}

.channel-status {
  font-size: 12px;
  color: #666;
}

.color-input {
  height: 44px;
  width: 120px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
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

/* Modal Sizes */
.modal-sm {
  max-width: 400px;
}

/* Duplicate Modal */
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

/* Publish Success Modal */
.success-modal {
  max-width: 700px;
}

.success-header {
  text-align: center;
  border-bottom: none;
  padding-bottom: 8px;
}

.success-intro {
  text-align: center;
  font-size: 15px;
  color: #333;
  margin-bottom: 32px;
}

.next-steps-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.step-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  margin-bottom: 16px;
  border-radius: 4px;
}

.step-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #000;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.step-content {
  flex: 1;
}

.step-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.step-content p {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.code-snippet {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  margin-top: 8px;
}

.code-snippet pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #333;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.phone-display {
  font-size: 18px;
  font-weight: 600;
  color: #000;
  padding: 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  margin: 12px 0;
  font-family: monospace;
}

.step-note {
  font-size: 13px;
  color: #999;
  font-style: italic;
}

.monitor-list {
  margin: 12px 0 0 20px;
  padding: 0;
}

.monitor-list li {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
  line-height: 1.5;
}

.success-footer-note {
  margin-top: 24px;
  padding: 16px;
  background: #f0f7ff;
  border: 1px solid #b3d9ff;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.full-width {
  width: 100%;
}

/* Warning text for delete modal */
.warning-text {
  color: #d32f2f;
  font-size: 14px;
  margin-top: 8px;
}

.btn-danger {
  background: #d32f2f !important;
  border-color: #d32f2f !important;
}

.btn-danger:hover {
  background: #b71c1c !important;
  border-color: #b71c1c !important;
}

/* Skill Test Modal */
.skill-test-modal .modal-body {
  padding: 24px;
}

.skill-test-input-section {
  margin-bottom: 20px;
}

.skill-test-input-section label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #000;
}

.skill-test-result-section {
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ddd;
}

.result-header span:first-child {
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

.result-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.result-status.success {
  background: #4caf50;
  color: #fff;
}

.result-status.error {
  background: #f44336;
  color: #fff;
}

.result-content {
  font-size: 14px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 16px;
}

.result-logs {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ddd;
}

.logs-header {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #666;
}

.logs-content {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.log-entry {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #666;
  padding: 4px 0;
  border-bottom: 1px solid #f0f0f0;
}

.log-entry:last-child {
  border-bottom: none;
}

/* Skills Section Styles (matching V1) */
.skills-list {
  border: 1px solid #ddd;
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}

.skill-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background: #fff;
  transition: background 0.15s;
}

.skill-item:last-child {
  border-bottom: none;
}

.skill-item:hover {
  background: #fafafa;
}

.skill-info {
  flex: 1;
}

.skill-name {
  font-size: 14px;
  font-weight: 600;
  color: #000;
  margin-bottom: 4px;
}

.skill-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.skill-header-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.config-badge {
  font-size: 11px;
  font-weight: 600;
  color: #ff8c00;
  background: #fff3cd;
  padding: 2px 8px;
  border-radius: 3px;
  text-transform: uppercase;
}

.skill-mcp-info {
  font-size: 12px;
  color: #28a745;
  margin-top: 4px;
  font-weight: 500;
}

.skill-item.needs-config {
  border-left: 3px solid #ff8c00;
}

.skill-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.skills-empty {
  text-align: center;
  padding: 40px 24px;
  color: #666;
}

.skills-empty .empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin-bottom: 8px;
}

.skills-empty .empty-desc {
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  max-width: 500px;
  margin: 0 auto;
}

.btn-add {
  width: 100%;
  padding: 8px;
  background: #fff;
  border: none;
  border-top: 1px solid #e0e0e0;
  font-size: 13px;
  font-weight: 500;
  color: #000;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-add:hover {
  background: #f5f5f5;
}

/* Wizard Mode Prompt in Expert Mode */
/* Unpublished Changes Alert */
.unpublished-changes-alert {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  padding: 8px 12px;
  margin-top: 8px;
  font-size: 13px;
  color: #856404;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
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

.wizard-mode-prompt {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.wizard-mode-prompt span {
  color: #666;
}

.wizard-mode-prompt .btn-link {
  padding: 0;
  font-size: 14px;
  font-weight: 500;
}

/* New Omnichannel Channel Blocks */
.channel-block {
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.channel-block.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.channel-block.disabled:hover {
  border-color: #e0e0e0;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.channel-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #000;
  margin: 0 0 4px 0;
}

.channel-description {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.channel-config {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.wizard-channel-section {
  margin-bottom: 24px;
}

.wizard-channel-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #666;
  margin: 0 0 16px 0;
}

/* Channel Toggle Group */
.channel-toggle-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.channel-toggle-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s;
}

.channel-toggle-item.clickable {
  cursor: pointer;
}

.channel-toggle-item.clickable:hover {
  border-color: #999;
  background: #f5f5f5;
}

.channel-toggle-item.active {
  border-color: #000;
  background: #fff;
}

.channel-toggle-content {
  flex: 1;
}

.channel-toggle-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
  color: #000;
}

.channel-toggle-status {
  font-size: 12px;
  color: #666;
}

/* Position Selector */
.position-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.position-option {
  cursor: pointer;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  transition: all 0.2s;
  text-align: center;
}

.position-option:hover {
  border-color: #999;
  background: #f5f5f5;
}

.position-option.selected {
  border-color: #000;
  background: #fff;
}

.position-preview {
  position: relative;
  width: 100%;
  height: 80px;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 6px;
  margin-bottom: 12px;
}

.preview-widget {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #000;
  border-radius: 50%;
}

.preview-widget.bottom-right {
  bottom: 8px;
  right: 8px;
}

.preview-widget.bottom-left {
  bottom: 8px;
  left: 8px;
}

.position-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

/* Knowledge Textarea */
.knowledge-textarea {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.coming-soon-badge {
  padding: 4px 10px;
  background: #fff3cd;
  color: #856404;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #4caf50;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
}

.toggle-switch input:disabled + .toggle-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Knowledge Tabs */
/* Knowledge Accordion */
/* Sources Main Sections */
.sources-main-section {
  margin-bottom: 32px;
}

.sources-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #000;
  margin: 0 0 16px 0;
}

.connected-sources-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.source-type-label {
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.empty-state-simple {
  padding: 24px;
  background: #f9f9f9;
  border: 1px dashed #ddd;
  border-radius: 6px;
  text-align: center;
}

.empty-state-simple p {
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.knowledge-accordion {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.accordion-item {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.accordion-header:hover {
  background: #f9f9f9;
}

.accordion-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #000;
}

.accordion-count {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.accordion-icon {
  font-size: 20px;
  font-weight: 300;
  color: #666;
  line-height: 1;
}

.accordion-content {
  padding: 0 20px 20px 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

/* Integrations */
.connected-integrations {
  margin-bottom: 32px;
}

.connected-integrations h4,
.knowledge-tab-content h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #000;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.integration-card {
  padding: 20px;
  background: #fff;
  border: 2px solid #ddd;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.integration-card:hover {
  border-color: #000;
  background: #fafafa;
}

.integration-card strong {
  display: block;
  font-size: 14px;
  margin-bottom: 8px;
  color: #000;
}

.integration-status {
  font-size: 12px;
  color: #666;
}

.integration-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 8px;
}

.integration-info strong {
  display: block;
  font-size: 14px;
  color: #000;
  margin-bottom: 4px;
}

.integration-meta {
  font-size: 12px;
  color: #666;
}

/* File Upload Sections */
.file-upload-section,
.add-snippet-section,
.add-website-section {
  margin-bottom: 24px;
}

.uploaded-files-list,
.conversation-files-list,
.snippets-list,
.websites-list {
  margin-top: 16px;
}

.file-item,
.conversation-item,
.snippet-item,
.website-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-info strong,
.conversation-info strong,
.snippet-info strong,
.website-info strong {
  display: block;
  font-size: 14px;
  color: #000;
  margin-bottom: 4px;
}

.file-size,
.conversation-count,
.website-pages {
  font-size: 12px;
  color: #666;
}

.snippet-preview {
  font-size: 12px;
  color: #666;
  margin: 4px 0 0 0;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
  font-size: 14px;
  background: #fafafa;
  border-radius: 6px;
}

/* Upload Area */
.upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  background: #fafafa;
  border: 2px dashed #ddd;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 20px;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-area h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #000;
}

.upload-area p {
  font-size: 14px;
  color: #666;
  margin: 0 0 20px 0;
}

.upload-hint {
  font-size: 12px;
  color: #999;
  margin-top: 12px;
}

.feature-note {
  padding: 16px;
  background: #f0f7ff;
  border: 1px solid #b3d9ff;
  border-radius: 6px;
}

.feature-note p {
  margin: 0;
  font-size: 14px;
  color: #333;
}

/* Added Websites */
.added-websites {
  margin-top: 24px;
}

.added-websites h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #000;
}

.website-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.website-url {
  font-size: 14px;
  color: #0066cc;
  flex: 1;
}

.btn-remove {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 18px;
  line-height: 1;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #ff4444;
  border-color: #ff4444;
  color: #fff;
}

.btn-remove-small {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.btn-remove-small:hover {
  background: #ff4444;
  border-color: #ff4444;
  color: #fff;
}

/* Insights and Security Content */
.insights-content,
.security-content {
  padding: 40px;
}

.insights-content h3,
.security-content h3 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.insights-content .subtitle,
.security-content .subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 32px 0;
}

.security-alerts-section {
  margin-top: 24px;
}
</style>
