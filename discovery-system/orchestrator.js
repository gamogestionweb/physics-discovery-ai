/**
 * ORCHESTRATOR
 * Manages the multi-agent physics discovery system
 * Coordinates discussions, experiments, and theory validation
 *
 * REFACTORED: Uses modular components for parallel execution
 */

const { createAgents } = require('./agents');
const { ExplorationWorld } = require('./exploration-world');
const { PHYSICS_KNOWLEDGE, UNEXPLAINED_PHENOMENA, MATHEMATICAL_STRUCTURES, CROSS_DOMAIN_CONNECTIONS } = require('./physics-knowledge-base');
const { AgentPool } = require('./agents/agent-pool');
const { TheoryManager } = require('./theories/theory-manager');
const { v4: uuidv4 } = require('uuid');
const config = require('./config.json');

class Orchestrator {
  constructor(deepseekApiKey) {
    this.agents = createAgents(deepseekApiKey);

    // Remove synthesizer - not needed
    delete this.agents.synthesizer;

    this.world = new ExplorationWorld();
    this.physicsKnowledge = {
      laws: PHYSICS_KNOWLEDGE,
      unexplained: UNEXPLAINED_PHENOMENA,
      math: MATHEMATICAL_STRUCTURES,
      connections: CROSS_DOMAIN_CONNECTIONS
    };

    // Initialize modular components
    this.agentPool = new AgentPool(this.agents);
    this.theoryManager = new TheoryManager();

    this.sessions = [];
    this.currentSession = null;
    this.discussions = [];
    this.experimentResults = [];

    this.eventListeners = new Map();
    this.isRunning = false;
    this.cycleCount = 0;
    this.language = 'en';
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
  // MAIN EXPLORATION CYCLE - PARALLELIZED
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
      experiments: [],
      errors: []
    };

    this.emit('cycle_started', { cycleNumber: this.cycleCount });

    try {
      // Phase 1: All agents think IN PARALLEL with timeout
      const thinkingResults = await this.phaseIndependentThinking();
      cycleData.agentActions = thinkingResults.results;
      cycleData.errors.push(...thinkingResults.errors);

      // Phase 2: Process any proposed theories
      const newTheories = await this.phaseProcessTheories(thinkingResults.results);
      cycleData.theories = newTheories;

      // Phase 3: Tenth Man challenges all theories IN PARALLEL
      if (newTheories.length > 0) {
        const challenges = await this.phaseTenthManChallenges(newTheories);
        cycleData.discussions.push(...challenges.results);
        cycleData.errors.push(...challenges.errors);
      }

      // Phase 4: Run any requested experiments IN PARALLEL
      const experiments = await this.phaseRunExperiments(thinkingResults.results);
      cycleData.experiments = experiments;

      // Phase 5: Facilitate discussions between agents
      const discussions = await this.phaseAgentDiscussions(thinkingResults.results);
      cycleData.discussions.push(...discussions);

      // Phase 6: Check for consensus and discoveries
      const discoveries = this.checkForDiscoveries(cycleData);
      cycleData.discoveries = discoveries;

      // Record cycle
      if (this.currentSession) {
        this.currentSession.cycles.push(cycleData);
      }

      this.emit('cycle_completed', {
        cycleNumber: this.cycleCount,
        theoriesCount: newTheories.length,
        errorsCount: cycleData.errors.length,
        duration: Date.now() - cycleData.timestamp
      });

      // Advance world time
      this.world.advanceTime();

      return cycleData;

    } catch (error) {
      this.emit('cycle_error', { error: error.message, cycleNumber: this.cycleCount });
      // Don't throw - allow cycle to continue
      cycleData.errors.push({ phase: 'cycle', error: error.message });
      return cycleData;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1: Independent Thinking - PARALLEL EXECUTION
  // ═══════════════════════════════════════════════════════════════════
  async phaseIndependentThinking() {
    const results = [];
    const errors = [];

    // Create context for agents
    const context = {
      cycle: this.cycleCount,
      recentTheories: this.theoryManager.getRecentTheories(5),
      recentDiscoveries: this.theoryManager.getRecentDiscoveries(3),
      availableExperiments: this.world.getAvailableExperiments(),
      availableData: this.world.getObservationalData(),
      unexplainedPhenomena: Object.keys(UNEXPLAINED_PHENOMENA)
    };

    // Get all theory-proposing agents (exclude tenthMan)
    const theoryAgents = Object.keys(this.agents).filter(key => key !== 'tenthMan');

    // Emit thinking started for all agents
    theoryAgents.forEach(key => {
      const agent = this.agents[key];
      this.emit('agent_thinking', {
        agentName: agent.personality.name,
        agentKey: key,
        personality: agent.personality.personality
      });
    });

    // PARALLEL EXECUTION with timeout and circuit breaker
    const parallelResults = await this.agentPool.executeParallel(
      theoryAgents,
      async (agent, key) => {
        console.log(`[${agent.personality.name}] Starting to think... (language: ${this.language})`);
        const result = await agent.think(context, this.physicsKnowledge, this.world, this.language);
        console.log(`[${agent.personality.name}] Finished thinking`);
        return { agentKey: key, agentName: agent.personality.name, result };
      },
      { timeout: config.agents.timeout }
    );

    // Process results
    for (const parallelResult of parallelResults) {
      if (parallelResult.success) {
        const { agentKey, agentName, result } = parallelResult.result;
        const agent = this.agents[agentKey];

        // Emit detailed thought
        this.emit('agent_thought', {
          agentName: agentName,
          agentKey: agentKey,
          personality: agent.personality.personality,
          expertise: agent.personality.expertise,
          thinking: result.thinking || 'No detailed thinking',
          focus: result.focus || 'General exploration',
          actions: result.actions || [],
          message: result.message_to_others,
          fullResponse: result,
          timestamp: Date.now()
        });

        results.push({
          agentKey,
          agentName,
          result
        });

      } else {
        // Agent failed - log error but continue
        const agentKey = parallelResult.agentKey;
        const agent = this.agents[agentKey];
        const agentName = agent?.personality?.name || agentKey;

        console.error(`[${agentName}] Error:`, parallelResult.error);

        this.emit('agent_thought', {
          agentName: agentName,
          agentKey: agentKey,
          thinking: `Error: ${parallelResult.error}`,
          focus: 'Error occurred',
          actions: [],
          circuitState: parallelResult.circuitState
        });

        errors.push({
          agentKey,
          agentName,
          error: parallelResult.error,
          circuitState: parallelResult.circuitState
        });
      }
    }

    return { results, errors };
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2: Process Theories
  // ═══════════════════════════════════════════════════════════════════
  async phaseProcessTheories(thinkingResults) {
    const newTheories = [];

    for (const result of thinkingResults) {
      if (!result.result) continue;

      const actions = result.result?.actions || [];
      for (const action of actions) {
        if (action.type === 'PROPOSE_THEORY') {
          const theory = this.theoryManager.addTheory({
            ...action.params,
            proposedBy: result.agentName,
            proposedByKey: result.agentKey
          });

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
  // PHASE 3: Tenth Man Challenges - PARALLEL with timeout
  // ═══════════════════════════════════════════════════════════════════
  async phaseTenthManChallenges(theories) {
    const results = [];
    const errors = [];
    const tenthMan = this.agents.tenthMan;

    if (!tenthMan) return { results, errors };

    // Limit theories per cycle
    const theoriesToChallenge = theories.slice(0, config.theories.maxPerCycle);

    // Challenge all theories in PARALLEL
    const challengePromises = theoriesToChallenge.map(async (theory) => {
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

        // Use timeout wrapper
        const response = await Promise.race([
          tenthMan.respond(
            challengeMessage,
            theory.proposedBy,
            this.physicsKnowledge,
            this.world,
            this.language
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Challenge timeout')), config.theories.challengeTimeout)
          )
        ]);

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

        // Add challenge to theory manager
        this.theoryManager.addChallenge(theory.id, challenge);

        this.emit('theory_challenged', {
          theory: theory,
          challenge: challenge,
          fullResponse: response,
          theoryAuthor: theory.proposedBy,
          timestamp: Date.now()
        });

        return { success: true, challenge };

      } catch (error) {
        console.error('Tenth Man challenge error:', error.message);
        return { success: false, error: error.message, theoryId: theory.id };
      }
    });

    // Wait for all challenges with timeout
    const challengeResults = await Promise.allSettled(challengePromises);

    for (const result of challengeResults) {
      if (result.status === 'fulfilled') {
        if (result.value.success) {
          results.push(result.value.challenge);
        } else {
          errors.push(result.value);
        }
      } else {
        errors.push({ error: result.reason?.message || 'Unknown error' });
      }
    }

    return { results, errors };
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 4: Run Experiments - PARALLEL
  // ═══════════════════════════════════════════════════════════════════
  async phaseRunExperiments(thinkingResults) {
    const experimentRequests = [];

    // Collect all experiment requests
    for (const result of thinkingResults) {
      if (!result.result) continue;

      const actions = result.result?.actions || [];
      for (const action of actions) {
        if (action.type === 'RUN_EXPERIMENT') {
          experimentRequests.push({
            agentName: result.agentName,
            experimentName: action.params.experiment_name,
            parameters: action.params.parameters
          });
        }
      }
    }

    // Run all experiments in PARALLEL
    const experimentPromises = experimentRequests.map(async (request) => {
      try {
        this.emit('experiment_running', {
          experiment: request.experimentName,
          agent: request.agentName
        });

        const experimentResult = this.world.runExperiment(
          request.experimentName,
          request.parameters
        );

        experimentResult.requestedBy = request.agentName;
        this.experimentResults.push(experimentResult);

        this.emit('experiment_completed', {
          experiment: experimentResult,
          agent: request.agentName
        });

        return experimentResult;

      } catch (error) {
        this.emit('experiment_error', {
          experiment: request.experimentName,
          error: error.message
        });
        return null;
      }
    });

    const results = await Promise.all(experimentPromises);
    return results.filter(r => r !== null);
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 5: Agent Discussions - PARALLEL responses
  // ═══════════════════════════════════════════════════════════════════
  async phaseAgentDiscussions(thinkingResults) {
    const discussions = [];

    // Check for discussion requests
    for (const result of thinkingResults) {
      if (!result.result) continue;

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
        const broadcast = await this.handleBroadcastMessage(result);
        if (broadcast) discussions.push(broadcast);
      }
    }

    return discussions;
  }

  async handleBroadcastMessage(result) {
    const broadcast = {
      id: uuidv4(),
      from: result.agentName,
      message: result.result.message_to_others,
      timestamp: Date.now(),
      responses: []
    };

    // Get responses from relevant agents IN PARALLEL
    const responders = this.selectRelevantAgents(result.result.message_to_others, result.agentKey, 3);

    const responsePromises = responders.map(async (responderKey) => {
      const responder = this.agents[responderKey];
      try {
        const response = await Promise.race([
          responder.respond(
            result.result.message_to_others,
            result.agentName,
            this.physicsKnowledge,
            this.world,
            this.language
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Response timeout')), config.agents.timeout)
          )
        ]);

        return {
          success: true,
          responderKey,
          response: {
            agent: responder.personality.name,
            agentKey: responderKey,
            personality: responder.personality.personality,
            response: response.response,
            thinking: response.thinking,
            agreementLevel: response.agreement_level,
            actions: response.actions || [],
            timestamp: Date.now()
          }
        };
      } catch (error) {
        return { success: false, responderKey, error: error.message };
      }
    });

    const responseResults = await Promise.all(responsePromises);

    for (const responseResult of responseResults) {
      if (responseResult.success) {
        broadcast.responses.push(responseResult.response);

        this.emit('agent_response', {
          from: result.agentName,
          to: responseResult.response.agent,
          originalMessage: result.result.message_to_others,
          response: responseResult.response,
          timestamp: Date.now()
        });
      }
    }

    this.emit('discussion', {
      id: broadcast.id,
      initiator: result.agentName,
      initiatorKey: result.agentKey,
      topic: result.result.message_to_others,
      participants: [result.agentName, ...broadcast.responses.map(r => r.agent)],
      participantKeys: [result.agentKey, ...broadcast.responses.map(r => r.agentKey)],
      messageCount: broadcast.responses.length + 1,
      allResponses: broadcast.responses,
      timestamp: Date.now()
    });

    return broadcast;
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

    // Always include Tenth Man in discussions
    if (!participants.includes('tenthMan')) {
      participants.push('tenthMan');
    }

    // Get responses IN PARALLEL
    const responsePromises = participants.map(async (participantKey) => {
      const participant = this.agents[participantKey];
      try {
        const response = await Promise.race([
          participant.respond(
            question,
            this.agents[initiatorKey].personality.name,
            this.physicsKnowledge,
            this.world,
            this.language
          ),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Discussion timeout')), config.agents.timeout)
          )
        ]);

        return {
          success: true,
          participantKey,
          messageData: {
            agent: participant.personality.name,
            agentKey: participantKey,
            personality: participant.personality.personality,
            content: response.response,
            thinking: response.thinking,
            agreementLevel: response.agreement_level,
            actions: response.actions || [],
            timestamp: Date.now()
          }
        };
      } catch (error) {
        return { success: false, participantKey, error: error.message };
      }
    });

    const responseResults = await Promise.all(responsePromises);

    for (const responseResult of responseResults) {
      if (responseResult.success) {
        discussion.messages.push(responseResult.messageData);

        this.emit('discussion_message', {
          discussionId: discussion.id,
          topic: topic,
          from: responseResult.messageData.agent,
          fromKey: responseResult.participantKey,
          inResponseTo: this.agents[initiatorKey].personality.name,
          message: responseResult.messageData,
          timestamp: Date.now()
        });
      }
    }

    this.discussions.push(discussion);

    this.emit('discussion_completed', {
      discussionId: discussion.id,
      topic: topic,
      initiator: this.agents[initiatorKey].personality.name,
      participants: discussion.messages.map(m => m.agent),
      participantKeys: discussion.messages.map(m => m.agentKey).filter(Boolean),
      messageCount: discussion.messages.length,
      allMessages: discussion.messages,
      conclusions: discussion.conclusions,
      timestamp: Date.now()
    });

    return discussion;
  }

  selectRelevantAgents(topic, excludeKey, count) {
    const topicLower = topic.toLowerCase();
    const agentScores = [];

    for (const [key, agent] of Object.entries(this.agents)) {
      if (key === excludeKey) continue;

      let score = 0;
      const expertise = agent.personality.expertise.join(' ').toLowerCase();

      const keywords = topicLower.split(/\s+/);
      for (const keyword of keywords) {
        if (expertise.includes(keyword)) score += 2;
        if (agent.personality.description.toLowerCase().includes(keyword)) score += 1;
      }

      score += Math.random() * 2;
      agentScores.push({ key, score });
    }

    agentScores.sort((a, b) => b.score - a.score);
    return agentScores.slice(0, count).map(a => a.key);
  }

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 6: Check for Discoveries
  // 9 de 10 agentes de acuerdo = descubrimiento (el Tenth Man siempre opone)
  // ═══════════════════════════════════════════════════════════════════
  checkForDiscoveries(cycleData) {
    const discoveries = [];
    const theories = this.theoryManager.getAllTheories();

    // Check theories that have enough support
    // Con 9 de 10 agentes (excluyendo al Tenth Man que siempre se opone)
    for (const theory of theories.filter(t => t.status === 'proposed' || t.status === 'challenged')) {
      const supportCount = theory.votes?.support || 0;
      const totalVotes = (theory.votes?.support || 0) + (theory.votes?.oppose || 0);

      // Discovery: 9 de 10 agentes de acuerdo (90%+)
      // El Tenth Man siempre estará en contra, así que 9/10 = 90%
      const approvalThreshold = 85; // 85% para dar margen
      const minVotes = 5; // Al menos 5 votos para considerar

      if (totalVotes >= minVotes && theory.approvalRating >= approvalThreshold) {
        theory.status = 'validated';

        const discovery = this.theoryManager.addDiscovery({
          type: 'validated_theory',
          theory: theory,
          supporters: [],
          approvalRating: theory.approvalRating,
          votes: theory.votes
        });

        discoveries.push(discovery);

        this.emit('discovery', {
          type: 'validated_theory',
          name: theory.name,
          description: theory.description,
          approvalRating: theory.approvalRating
        });
      }
    }

    // Check for novel connections identified by agents
    for (const action of cycleData.agentActions) {
      if (action.result?.actions) {
        for (const a of action.result.actions) {
          if (a.type === 'RECORD_DISCOVERY') {
            const discovery = this.theoryManager.addDiscovery({
              type: 'connection',
              ...a.params,
              discoveredBy: action.agentName
            });

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
      theoriesCount: this.theoryManager.getAllTheories().length,
      discoveriesCount: this.theoryManager.getRecentDiscoveries(1000).length,
      discussionsCount: this.discussions.length,
      circuitStatus: this.agentPool.getCircuitStatus()
    };
  }

  getTheories() {
    return this.theoryManager.getAllTheories();
  }

  getDiscoveries() {
    return this.theoryManager.getRecentDiscoveries(1000);
  }

  getDiscussions() {
    return this.discussions;
  }

  getAgent(key) {
    return this.agents[key];
  }

  // Get circuit breaker status for monitoring
  getCircuitStatus() {
    return this.agentPool.getCircuitStatus();
  }

  // Reset circuit breaker for an agent
  resetAgentCircuit(agentKey) {
    this.agentPool.resetCircuit(agentKey);
  }

  // Direct query to a specific agent
  async queryAgent(agentKey, question) {
    const agent = this.agents[agentKey];
    if (!agent) {
      throw new Error(`Agent ${agentKey} not found`);
    }

    const result = await this.agentPool.executeWithTimeout(
      agentKey,
      () => agent.respond(
        question,
        'Human Observer',
        this.physicsKnowledge,
        this.world,
        this.language
      ),
      config.agents.timeout
    );

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.result;
  }

  // Start exploration on a specific topic
  async exploreTopic(topic) {
    const context = {
      topic: topic,
      cycle: this.cycleCount,
      directive: `Focus your exploration on: ${topic}`,
      physicsKnowledge: this.physicsKnowledge,
      unexplained: UNEXPLAINED_PHENOMENA
    };

    const agentKeys = Object.keys(this.agents);

    const results = await this.agentPool.executeParallel(
      agentKeys,
      async (agent, key) => {
        const result = await agent.think(context, this.physicsKnowledge, this.world, this.language);
        return { agent: agent.personality.name, result };
      },
      { timeout: config.agents.timeout }
    );

    return results.map(r => {
      if (r.success) {
        return r.result;
      }
      return { agent: r.agentKey, error: r.error };
    });
  }
}

module.exports = { Orchestrator };
