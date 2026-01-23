/**
 * ORCHESTRATOR
 * Manages the multi-agent physics discovery system
 * Coordinates discussions, experiments, and theory validation
 */

const { createAgents, getAgentList } = require('./agents');
const { ExplorationWorld } = require('./exploration-world');
const { PHYSICS_KNOWLEDGE, UNEXPLAINED_PHENOMENA, MATHEMATICAL_STRUCTURES, CROSS_DOMAIN_CONNECTIONS } = require('./physics-knowledge-base');
const { v4: uuidv4 } = require('uuid');

// Discovery threshold: 95% agreement (19/20 physicists)
const DISCOVERY_THRESHOLD = 0.95;
const TOTAL_AGENTS = 20;
const MIN_AGREEMENT_FOR_DISCOVERY = Math.ceil(TOTAL_AGENTS * DISCOVERY_THRESHOLD);

class Orchestrator {
  constructor(deepseekApiKey) {
    // Only DeepSeek API - all 20 agents use it
    this.agents = createAgents(deepseekApiKey);
    this.agentList = getAgentList();
    this.world = new ExplorationWorld();
    this.physicsKnowledge = {
      laws: PHYSICS_KNOWLEDGE,
      unexplained: UNEXPLAINED_PHENOMENA,
      math: MATHEMATICAL_STRUCTURES,
      connections: CROSS_DOMAIN_CONNECTIONS
    };

    this.sessions = [];
    this.currentSession = null;
    this.theories = [];
    this.discussions = [];
    this.discoveries = [];
    this.experimentResults = [];

    this.eventListeners = new Map();
    this.isRunning = false;
    this.cycleCount = 0;
    this.language = 'en'; // Default language for agent deliberations
  }

  // Set the language for agent deliberations
  setLanguage(language) {
    this.language = language === 'es' ? 'es' : 'en';
    console.log(`Language set to: ${this.language}`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // EVENT SYSTEM
  // ═══════════════════════════════════════════════════════════════════
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  // ═══════════════════════════════════════════════════════════════════
  // SESSION MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════
  startSession(topic = 'Open Exploration') {
    this.currentSession = {
      id: uuidv4(),
      topic: topic,
      startTime: Date.now(),
      cycles: [],
      theories: [],
      discoveries: []
    };
    this.sessions.push(this.currentSession);
    this.isRunning = true;

    this.emit('session_started', {
      sessionId: this.currentSession.id,
      topic: topic
    });

    return this.currentSession;
  }

  stopSession() {
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
    }
    this.isRunning = false;

    this.emit('session_ended', {
      session: this.currentSession
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // MAIN EXPLORATION CYCLE
  // ═══════════════════════════════════════════════════════════════════
  async runCycle() {
    if (!this.isRunning) return;

    this.cycleCount++;
    const cycleData = {
      cycleNumber: this.cycleCount,
      timestamp: Date.now(),
      agentActions: [],
      discussions: [],
      theories: [],
      experiments: []
    };

    this.emit('cycle_started', { cycleNumber: this.cycleCount });

    try {
      // Phase 1: Each agent thinks independently
      const thinkingResults = await this.phaseIndependentThinking();
      cycleData.agentActions = thinkingResults;

      // Phase 2: Process any proposed theories
      const newTheories = await this.phaseProcessTheories(thinkingResults);
      cycleData.theories = newTheories;

      // Phase 3: Tenth Man challenges all theories
      if (newTheories.length > 0) {
        const challenges = await this.phaseTenthManChallenges(newTheories);
        cycleData.discussions.push(...challenges);
      }

      // Phase 4: Run any requested experiments
      const experiments = await this.phaseRunExperiments(thinkingResults);
      cycleData.experiments = experiments;

      // Phase 5: Facilitate discussions between agents
      const discussions = await this.phaseAgentDiscussions(thinkingResults);
      cycleData.discussions.push(...discussions);

      // Phase 6: Check for consensus and discoveries
      const discoveries = this.checkForDiscoveries(cycleData);
      cycleData.discoveries = discoveries;

      // Record cycle
      if (this.currentSession) {
        this.currentSession.cycles.push(cycleData);
      }

      this.emit('cycle_completed', cycleData);

      // Advance world time
      this.world.advanceTime();

      return cycleData;

    } catch (error) {
      this.emit('cycle_error', { error: error.message, cycleNumber: this.cycleCount });
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1: Independent Thinking
  // ═══════════════════════════════════════════════════════════════════
  async phaseIndependentThinking() {
    const results = [];

    // Create context for agents
    const context = {
      cycle: this.cycleCount,
      recentTheories: this.theories.slice(-5),
      recentDiscoveries: this.discoveries.slice(-3),
      availableExperiments: this.world.getAvailableExperiments(),
      availableData: this.world.getObservationalData(),
      unexplainedPhenomena: Object.keys(UNEXPLAINED_PHENOMENA)
    };

    // Process agents one at a time so we can see each one's deliberation in real-time
    // Exclude Devil's Advocate from initial thinking - they challenge later
    const agentEntries = Object.entries(this.agents).filter(([key]) => key !== 'devilsAdvocate');

    for (const [key, agent] of agentEntries) {
      try {
        this.emit('agent_thinking', {
          agentName: agent.personality.name,
          agentKey: key,
          personality: agent.personality.personality
        });

        console.log(`[${agent.personality.name}] Starting to think... (language: ${this.language})`);

        const result = await agent.think(context, this.physicsKnowledge, this.world, this.language);

        console.log(`[${agent.personality.name}] Finished thinking:`, result?.thinking?.substring(0, 100));

        // Emit detailed thought with full content
        this.emit('agent_thought', {
          agentName: agent.personality.name,
          agentKey: key,
          personality: agent.personality.personality,
          expertise: agent.personality.expertise,
          thinking: result.thinking || 'No detailed thinking',
          focus: result.focus || 'General exploration',
          actions: result.actions || [],
          message: result.message_to_others,
          fullResponse: result, // Include full raw response
          timestamp: Date.now()
        });

        results.push({
          agentKey: key,
          agentName: agent.personality.name,
          result: result
        });

      } catch (error) {
        console.error(`[${agent.personality.name}] Error:`, error.message);

        this.emit('agent_thought', {
          agentName: agent.personality.name,
          agentKey: key,
          thinking: `Error: ${error.message}`,
          focus: 'Error occurred',
          actions: []
        });

        results.push({
          agentKey: key,
          agentName: agent.personality.name,
          error: error.message
        });
      }
    }

    return results;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2: Process Theories
  // ═══════════════════════════════════════════════════════════════════
  async phaseProcessTheories(thinkingResults) {
    const newTheories = [];

    for (const result of thinkingResults) {
      if (result.error) continue;

      const actions = result.result?.actions || [];
      for (const action of actions) {
        if (action.type === 'PROPOSE_THEORY') {
          const theory = {
            id: uuidv4(),
            ...action.params,
            proposedBy: result.agentName,
            timestamp: Date.now(),
            status: 'proposed',
            challenges: [],
            support: [],
            experiments: []
          };

          this.theories.push(theory);
          newTheories.push(theory);

          this.emit('theory_proposed', {
            theory: theory,
            proposedBy: result.agentName,
            agentKey: result.agentKey,
            fullTheory: theory,
            timestamp: Date.now()
          });
        }
      }
    }

    return newTheories;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 3: Devil's Advocate Challenges
  // ═══════════════════════════════════════════════════════════════════
  async phaseTenthManChallenges(theories) {
    const challenges = [];
    const devilsAdvocate = this.agents.devilsAdvocate;

    for (const theory of theories) {
      try {
        this.emit('tenth_man_analyzing', { theory: theory.name });

        const challengeMessage = `
A new theory has been proposed by ${theory.proposedBy}:

THEORY: ${theory.name}
DESCRIPTION: ${theory.description}
MATHEMATICS: ${theory.mathematics || 'Not specified'}
PREDICTIONS: ${JSON.stringify(theory.predictions || [])}
PROPOSED TESTS: ${JSON.stringify(theory.tests || [])}

As the Tenth Man, you MUST find problems with this theory.
What are the flaws? What assumptions are questionable?
What alternative explanations exist? What would DISPROVE this?
What historical examples suggest caution?`;

        const response = await devilsAdvocate.respond(
          challengeMessage,
          theory.proposedBy,
          this.physicsKnowledge,
          this.world,
          this.language
        );

        const challenge = {
          id: uuidv4(),
          theoryId: theory.id,
          theoryName: theory.name,
          challenger: 'Advocatus Diaboli',
          challenge: response.response,
          reasoning: response.thinking,
          agreementLevel: response.agreement_level,
          actions: response.actions || [],
          timestamp: Date.now()
        };

        theory.challenges.push(challenge);
        challenges.push(challenge);

        this.emit('theory_challenged', {
          theory: theory,
          challenge: challenge,
          fullResponse: response,
          theoryAuthor: theory.proposedBy,
          timestamp: Date.now()
        });

      } catch (error) {
        console.error('Tenth Man challenge error:', error);
      }
    }

    return challenges;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 4: Run Experiments
  // ═══════════════════════════════════════════════════════════════════
  async phaseRunExperiments(thinkingResults) {
    const experimentResults = [];

    for (const result of thinkingResults) {
      if (result.error) continue;

      const actions = result.result?.actions || [];
      for (const action of actions) {
        if (action.type === 'RUN_EXPERIMENT') {
          try {
            this.emit('experiment_running', {
              experiment: action.params.experiment_name,
              agent: result.agentName
            });

            const experimentResult = this.world.runExperiment(
              action.params.experiment_name,
              action.params.parameters
            );

            experimentResult.requestedBy = result.agentName;
            this.experimentResults.push(experimentResult);
            experimentResults.push(experimentResult);

            this.emit('experiment_completed', {
              experiment: experimentResult,
              agent: result.agentName
            });

          } catch (error) {
            this.emit('experiment_error', {
              experiment: action.params.experiment_name,
              error: error.message
            });
          }
        }
      }
    }

    return experimentResults;
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 5: Agent Discussions
  // ═══════════════════════════════════════════════════════════════════
  async phaseAgentDiscussions(thinkingResults) {
    const discussions = [];

    // Check for discussion requests
    for (const result of thinkingResults) {
      if (result.error) continue;

      const actions = result.result?.actions || [];
      for (const action of actions) {
        if (action.type === 'REQUEST_DISCUSSION') {
          const discussion = await this.facilitateDiscussion(
            result.agentKey,
            action.params.topic,
            action.params.question,
            action.params.relevant_agents || []
          );
          discussions.push(discussion);
        }
      }

      // Also broadcast any messages to others
      if (result.result?.message_to_others) {
        const broadcast = {
          id: uuidv4(),
          from: result.agentName,
          message: result.result.message_to_others,
          timestamp: Date.now(),
          responses: []
        };

        // Get responses from a few relevant agents
        const responders = this.selectRelevantAgents(result.result.message_to_others, result.agentKey, 3);

        for (const responderKey of responders) {
          const responder = this.agents[responderKey];
          try {
            const response = await responder.respond(
              result.result.message_to_others,
              result.agentName,
              this.physicsKnowledge,
              this.world,
              this.language
            );

            const responseData = {
              agent: responder.personality.name,
              agentKey: responderKey,
              personality: responder.personality.personality,
              response: response.response,
              thinking: response.thinking,
              agreementLevel: response.agreement_level,
              actions: response.actions || [],
              timestamp: Date.now()
            };

            broadcast.responses.push(responseData);

            // Emit individual response event
            this.emit('agent_response', {
              from: result.agentName,
              to: responder.personality.name,
              originalMessage: result.result.message_to_others,
              response: responseData,
              timestamp: Date.now()
            });
          } catch (error) {
            // Skip failed responses
          }
        }

        discussions.push(broadcast);

        this.emit('discussion', {
          id: broadcast.id,
          initiator: result.agentName,
          initiatorKey: result.agentKey,
          topic: result.result.message_to_others,
          participants: [result.agentName, ...responders.map(k => this.agents[k].personality.name)],
          participantKeys: [result.agentKey, ...responders],
          messageCount: broadcast.responses.length + 1,
          allResponses: broadcast.responses,
          timestamp: Date.now()
        });
      }
    }

    return discussions;
  }

  async facilitateDiscussion(initiatorKey, topic, question, relevantAgentKeys) {
    const discussion = {
      id: uuidv4(),
      topic: topic,
      initiator: this.agents[initiatorKey].personality.name,
      timestamp: Date.now(),
      messages: [{
        agent: this.agents[initiatorKey].personality.name,
        content: question,
        timestamp: Date.now()
      }],
      conclusions: []
    };

    // Select agents to participate
    let participants = relevantAgentKeys.length > 0 ?
      relevantAgentKeys.filter(k => this.agents[k]) :
      this.selectRelevantAgents(topic, initiatorKey, 4);

    // Always include Devil's Advocate in discussions
    if (!participants.includes('devilsAdvocate')) {
      participants.push('devilsAdvocate');
    }

    // Round of responses
    for (const participantKey of participants) {
      const participant = this.agents[participantKey];
      try {
        const response = await participant.respond(
          question,
          this.agents[initiatorKey].personality.name,
          this.physicsKnowledge,
          this.world,
          this.language
        );

        const messageData = {
          agent: participant.personality.name,
          agentKey: participantKey,
          personality: participant.personality.personality,
          content: response.response,
          thinking: response.thinking,
          agreementLevel: response.agreement_level,
          actions: response.actions || [],
          timestamp: Date.now()
        };

        discussion.messages.push(messageData);

        // Emit individual discussion message
        this.emit('discussion_message', {
          discussionId: discussion.id,
          topic: topic,
          from: participant.personality.name,
          fromKey: participantKey,
          inResponseTo: this.agents[initiatorKey].personality.name,
          message: messageData,
          timestamp: Date.now()
        });
      } catch (error) {
        // Skip failed participants
      }
    }

    this.discussions.push(discussion);

    this.emit('discussion_completed', {
      discussionId: discussion.id,
      topic: topic,
      initiator: this.agents[initiatorKey].personality.name,
      participants: participants.map(k => this.agents[k].personality.name),
      participantKeys: participants,
      messageCount: discussion.messages.length,
      allMessages: discussion.messages,
      conclusions: discussion.conclusions,
      timestamp: Date.now()
    });

    return discussion;
  }

  selectRelevantAgents(topic, excludeKey, count) {
    // Simple relevance matching based on expertise keywords
    const topicLower = topic.toLowerCase();
    const agentScores = [];

    for (const [key, agent] of Object.entries(this.agents)) {
      if (key === excludeKey) continue;

      let score = 0;
      const expertise = agent.personality.expertise.join(' ').toLowerCase();

      // Check for keyword matches
      const keywords = topicLower.split(/\s+/);
      for (const keyword of keywords) {
        if (expertise.includes(keyword)) score += 2;
        if (agent.personality.description.toLowerCase().includes(keyword)) score += 1;
      }

      // Add some randomness
      score += Math.random() * 2;

      agentScores.push({ key, score });
    }

    // Sort by score and return top N
    agentScores.sort((a, b) => b.score - a.score);
    return agentScores.slice(0, count).map(a => a.key);
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 6: Check for Discoveries (95% Consensus Rule)
  // ═══════════════════════════════════════════════════════════════════
  checkForDiscoveries(cycleData) {
    const discoveries = [];

    // Check theories that have survived challenges
    for (const theory of this.theories.filter(t => t.status === 'proposed')) {
      // Calculate approval percentage from all agents who have voted
      const supportCount = theory.support?.length || 0;
      const challengeCount = theory.challenges?.length || 0;
      const totalVotes = supportCount + challengeCount;

      // Need at least some votes to evaluate
      if (totalVotes < 5) continue;

      // Calculate approval: need 95% (19/20) agreement for discovery
      // Devil's Advocate's disagreement is expected and doesn't block discovery
      const approvalRate = supportCount / TOTAL_AGENTS;
      const hasExperimentalSupport = theory.experiments?.some(e => e.supports) || false;

      // DISCOVERY THRESHOLD: 95% agreement (even if Devil's Advocate disagrees)
      if (approvalRate >= DISCOVERY_THRESHOLD || supportCount >= MIN_AGREEMENT_FOR_DISCOVERY) {
        theory.status = 'DISCOVERY';
        theory.approvalRate = approvalRate;
        theory.discoveryTimestamp = Date.now();

        const discovery = {
          id: uuidv4(),
          type: 'consensus_discovery',
          theory: theory,
          approvalRate: approvalRate,
          supportCount: supportCount,
          totalAgents: TOTAL_AGENTS,
          threshold: DISCOVERY_THRESHOLD,
          hasExperimentalSupport: hasExperimentalSupport,
          devilsAdvocateObjection: theory.challenges?.find(c => c.challenger === 'Advocatus Diaboli'),
          timestamp: Date.now(),
          supporters: theory.support?.map(s => s.agent) || []
        };

        this.discoveries.push(discovery);
        discoveries.push(discovery);

        this.emit('discovery', {
          type: 'consensus_discovery',
          name: theory.name,
          description: theory.description,
          approvalRate: Math.round(approvalRate * 100),
          supportCount: supportCount,
          totalAgents: TOTAL_AGENTS,
          isHistoric: true
        });

        console.log(`\n${'═'.repeat(60)}`);
        console.log(`🎉 DISCOVERY! ${theory.name}`);
        console.log(`   Approval: ${Math.round(approvalRate * 100)}% (${supportCount}/${TOTAL_AGENTS} physicists)`);
        console.log(`${'═'.repeat(60)}\n`);
      }
    }

    // Check for novel connections identified by agents
    for (const action of cycleData.agentActions) {
      if (action.result?.actions) {
        for (const a of action.result.actions) {
          if (a.type === 'RECORD_DISCOVERY') {
            const discovery = {
              id: uuidv4(),
              type: 'connection',
              ...a.params,
              discoveredBy: action.agentName,
              timestamp: Date.now()
            };

            this.discoveries.push(discovery);
            discoveries.push(discovery);

            this.emit('discovery', {
              type: 'connection',
              discoveredBy: action.agentName,
              description: a.params.discovery
            });
          }
        }
      }
    }

    return discoveries;
  }

  // ═══════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════
  getState() {
    return {
      isRunning: this.isRunning,
      cycleCount: this.cycleCount,
      currentSession: this.currentSession ? {
        id: this.currentSession.id,
        topic: this.currentSession.topic,
        duration: Date.now() - this.currentSession.startTime,
        cycleCount: this.currentSession.cycles.length
      } : null,
      agents: Object.entries(this.agents).map(([key, agent]) => ({
        key: key,
        ...agent.getState()
      })),
      theoriesCount: this.theories.length,
      discoveriesCount: this.discoveries.length,
      discussionsCount: this.discussions.length
    };
  }

  getTheories() {
    return this.theories;
  }

  getDiscoveries() {
    return this.discoveries;
  }

  getDiscussions() {
    return this.discussions;
  }

  getAgent(key) {
    return this.agents[key];
  }

  // Direct query to a specific agent
  async queryAgent(agentKey, question) {
    const agent = this.agents[agentKey];
    if (!agent) {
      throw new Error(`Agent ${agentKey} not found`);
    }

    return await agent.respond(
      question,
      'Human Observer',
      this.physicsKnowledge,
      this.world,
      this.language
    );
  }

  // Start exploration on a specific topic
  async exploreТopic(topic) {
    const context = {
      topic: topic,
      cycle: this.cycleCount,
      directive: `Focus your exploration on: ${topic}`,
      physicsKnowledge: this.physicsKnowledge,
      unexplained: UNEXPLAINED_PHENOMENA
    };

    const results = [];

    for (const [key, agent] of Object.entries(this.agents)) {
      try {
        const result = await agent.think(context, this.physicsKnowledge, this.world, this.language);
        results.push({
          agent: agent.personality.name,
          result: result
        });
      } catch (error) {
        results.push({
          agent: agent.personality.name,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = { Orchestrator };
