/**
 * CYCLE RUNNER
 * Manages the execution of discovery cycles with parallel agent execution
 */

const config = require('../config.json');
const { AgentPool } = require('../agents/agent-pool');

class CycleRunner {
  constructor(agents, world, eventEmitter) {
    this.agentPool = new AgentPool(agents);
    this.agents = agents;
    this.world = world;
    this.eventEmitter = eventEmitter;
    this.cycleCount = 0;
    this.isRunning = false;
    this.currentLanguage = 'en';
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
  }

  /**
   * Run a complete discovery cycle
   */
  async runCycle(options = {}) {
    if (this.isRunning) {
      throw new Error('Cycle already running');
    }

    this.isRunning = true;
    this.cycleCount++;
    const cycleNumber = this.cycleCount;

    this.emit('cycle_started', { cycleNumber });

    const cycleResults = {
      cycleNumber,
      startTime: Date.now(),
      phases: {},
      errors: [],
      theoriesProposed: [],
      challengesIssued: [],
      experimentsRun: []
    };

    try {
      // Phase 1: All agents think in parallel
      cycleResults.phases.thinking = await this.runThinkingPhase();

      // Phase 2: Process proposed theories
      cycleResults.phases.theories = await this.runTheoryPhase(cycleResults.phases.thinking);

      // Phase 3: Tenth Man challenges (if theories exist)
      if (cycleResults.phases.theories.proposed.length > 0) {
        cycleResults.phases.challenges = await this.runChallengePhase(
          cycleResults.phases.theories.proposed
        );
      }

      // Phase 4: Synthesizer connects ideas
      cycleResults.phases.synthesis = await this.runSynthesisPhase(cycleResults);

      // Aggregate results
      cycleResults.theoriesProposed = cycleResults.phases.theories?.proposed || [];
      cycleResults.challengesIssued = cycleResults.phases.challenges?.challenges || [];

    } catch (error) {
      cycleResults.errors.push({
        phase: 'cycle',
        error: error.message
      });
      this.emit('cycle_error', { cycleNumber, error: error.message });
    } finally {
      this.isRunning = false;
      cycleResults.endTime = Date.now();
      cycleResults.duration = cycleResults.endTime - cycleResults.startTime;

      this.emit('cycle_completed', {
        cycleNumber,
        duration: cycleResults.duration,
        theoriesCount: cycleResults.theoriesProposed.length,
        errorsCount: cycleResults.errors.length
      });
    }

    return cycleResults;
  }

  /**
   * Phase 1: All agents think in parallel
   */
  async runThinkingPhase() {
    const phaseResult = {
      startTime: Date.now(),
      results: [],
      errors: []
    };

    // Get all theory-proposing agents (exclude tenthMan and synthesizer)
    const theoryAgents = Object.keys(this.agents).filter(
      key => key !== 'tenthMan' && key !== 'synthesizer'
    );

    // Emit thinking started for each agent
    theoryAgents.forEach(key => {
      const agent = this.agents[key];
      this.emit('agent_thinking', {
        agentKey: key,
        agentName: agent.personality.name,
        personality: agent.personality.personality
      });
    });

    // Execute all agents in parallel with timeout
    const results = await this.agentPool.executeParallel(
      theoryAgents,
      async (agent, key) => {
        const context = this.buildAgentContext(key);
        const result = await agent.think(context, this.currentLanguage);
        return { agentKey: key, thought: result };
      },
      { timeout: config.agents.timeout }
    );

    // Process results
    for (const result of results) {
      if (result.success) {
        const { agentKey, thought } = result.result;
        const agent = this.agents[agentKey];

        phaseResult.results.push({
          agentKey,
          agentName: agent.personality.name,
          thought
        });

        this.emit('agent_thought', {
          agentKey,
          agentName: agent.personality.name,
          personality: agent.personality.personality,
          expertise: agent.personality.expertise,
          thinking: thought.thinking,
          focus: thought.focus,
          actions: thought.actions,
          message: thought.message_to_others
        });
      } else {
        phaseResult.errors.push({
          agentKey: result.agentKey,
          error: result.error,
          circuitState: result.circuitState
        });

        this.emit('agent_error', {
          agentKey: result.agentKey,
          error: result.error
        });
      }
    }

    phaseResult.endTime = Date.now();
    phaseResult.duration = phaseResult.endTime - phaseResult.startTime;

    return phaseResult;
  }

  /**
   * Phase 2: Process theories from thinking phase
   */
  async runTheoryPhase(thinkingResults) {
    const phaseResult = {
      proposed: [],
      errors: []
    };

    for (const result of thinkingResults.results) {
      const { agentKey, thought } = result;

      if (!thought.actions) continue;

      for (const action of thought.actions) {
        if (action.type === 'PROPOSE_THEORY' && action.params) {
          const theory = {
            id: `theory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: action.params.name || 'Unnamed Theory',
            description: action.params.description,
            mathematics: action.params.mathematics,
            predictions: action.params.predictions || [],
            tests: action.params.tests || [],
            proposedBy: this.agents[agentKey].personality.name,
            proposedByKey: agentKey,
            status: 'proposed',
            timestamp: Date.now(),
            challenges: []
          };

          phaseResult.proposed.push(theory);

          this.emit('theory_proposed', {
            theory,
            agentKey,
            proposedBy: theory.proposedBy
          });
        }
      }
    }

    return phaseResult;
  }

  /**
   * Phase 3: Tenth Man challenges theories
   */
  async runChallengePhase(theories) {
    const phaseResult = {
      challenges: [],
      errors: []
    };

    const tenthMan = this.agents.tenthMan;
    if (!tenthMan) return phaseResult;

    // Challenge theories in parallel (up to max per cycle)
    const theoriesToChallenge = theories.slice(0, config.theories.maxPerCycle);

    const results = await this.agentPool.executeParallel(
      theoriesToChallenge.map((_, i) => `challenge_${i}`),
      async (_, key) => {
        const index = parseInt(key.split('_')[1]);
        const theory = theoriesToChallenge[index];

        this.emit('tenth_man_analyzing', { theory });

        const challenge = await tenthMan.challengeTheory(theory, this.currentLanguage);
        return { theory, challenge };
      },
      { timeout: config.theories.challengeTimeout }
    );

    for (const result of results) {
      if (result.success) {
        const { theory, challenge } = result.result;

        phaseResult.challenges.push({
          theoryId: theory.id,
          theoryName: theory.name,
          challenge
        });

        this.emit('theory_challenged', {
          theory,
          theoryAuthor: theory.proposedBy,
          challenge,
          fullResponse: challenge
        });
      } else {
        phaseResult.errors.push({
          error: result.error
        });
      }
    }

    return phaseResult;
  }

  /**
   * Phase 4: Synthesizer connects ideas
   */
  async runSynthesisPhase(cycleResults) {
    const phaseResult = {
      synthesis: null,
      error: null
    };

    const synthesizer = this.agents.synthesizer;
    if (!synthesizer) return phaseResult;

    try {
      const result = await this.agentPool.executeWithTimeout(
        'synthesizer',
        async () => {
          const context = this.buildSynthesisContext(cycleResults);
          return synthesizer.think(context, this.currentLanguage);
        },
        config.agents.timeout
      );

      if (result.success) {
        phaseResult.synthesis = result.result;

        this.emit('synthesis_completed', {
          agentName: synthesizer.personality.name,
          synthesis: result.result
        });
      } else {
        phaseResult.error = result.error;
      }
    } catch (error) {
      phaseResult.error = error.message;
    }

    return phaseResult;
  }

  /**
   * Build context for an agent's thinking
   */
  buildAgentContext(agentKey) {
    const agent = this.agents[agentKey];
    return {
      worldState: this.world.getState(),
      recentTheories: this.getRecentTheories(5),
      recentDiscoveries: this.getRecentDiscoveries(3),
      agentMemory: agent.getMemory ? agent.getMemory() : {}
    };
  }

  /**
   * Build context for synthesizer
   */
  buildSynthesisContext(cycleResults) {
    return {
      worldState: this.world.getState(),
      cycleTheories: cycleResults.theoriesProposed || [],
      cycleChallenges: cycleResults.challengesIssued || [],
      thinkingResults: cycleResults.phases.thinking?.results || []
    };
  }

  /**
   * Get recent theories (stub - implement with theory manager)
   */
  getRecentTheories(limit) {
    return [];
  }

  /**
   * Get recent discoveries (stub - implement with theory manager)
   */
  getRecentDiscoveries(limit) {
    return [];
  }

  /**
   * Emit event through the event emitter
   */
  emit(event, data) {
    if (this.eventEmitter) {
      this.eventEmitter.emit(event, data);
    }
  }

  /**
   * Get current cycle status
   */
  getStatus() {
    return {
      cycleCount: this.cycleCount,
      isRunning: this.isRunning,
      circuitStatus: this.agentPool.getCircuitStatus(),
      availableAgents: this.agentPool.getAvailableAgents()
    };
  }
}

module.exports = { CycleRunner };
