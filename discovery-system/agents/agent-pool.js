/**
 * AGENT POOL
 * Manages parallel execution of agents with circuit breaker pattern
 */

const config = require('../config.json');

// Circuit breaker states
const CIRCUIT_STATES = {
  CLOSED: 'closed',     // Normal operation
  OPEN: 'open',         // Blocking calls
  HALF_OPEN: 'half_open' // Testing recovery
};

class CircuitBreaker {
  constructor(agentKey, options = {}) {
    this.agentKey = agentKey;
    this.failureThreshold = options.failureThreshold || config.agents.circuitBreaker.failureThreshold;
    this.resetTimeout = options.resetTimeout || config.agents.circuitBreaker.resetTimeout;

    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  canExecute() {
    if (this.state === CIRCUIT_STATES.CLOSED) {
      return true;
    }

    if (this.state === CIRCUIT_STATES.OPEN) {
      // Check if reset timeout has passed
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = CIRCUIT_STATES.HALF_OPEN;
        return true;
      }
      return false;
    }

    // HALF_OPEN - allow one test request
    return true;
  }

  recordSuccess() {
    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 2) {
        this.reset();
      }
    } else {
      this.failureCount = 0;
    }
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CIRCUIT_STATES.HALF_OPEN) {
      this.state = CIRCUIT_STATES.OPEN;
      this.successCount = 0;
    } else if (this.failureCount >= this.failureThreshold) {
      this.state = CIRCUIT_STATES.OPEN;
    }
  }

  reset() {
    this.state = CIRCUIT_STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }

  getStatus() {
    return {
      agentKey: this.agentKey,
      state: this.state,
      failureCount: this.failureCount,
      canExecute: this.canExecute()
    };
  }
}

class AgentPool {
  constructor(agents) {
    this.agents = agents;
    this.circuitBreakers = {};
    this.timeout = config.agents.timeout;

    // Initialize circuit breakers for each agent
    Object.keys(agents).forEach(key => {
      this.circuitBreakers[key] = new CircuitBreaker(key);
    });
  }

  /**
   * Execute a function on an agent with timeout and circuit breaker
   */
  async executeWithTimeout(agentKey, fn, timeoutMs = this.timeout) {
    const breaker = this.circuitBreakers[agentKey];

    if (!breaker.canExecute()) {
      return {
        success: false,
        agentKey,
        error: `Circuit breaker OPEN for ${agentKey}`,
        circuitState: breaker.state
      };
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
        )
      ]);

      breaker.recordSuccess();
      return {
        success: true,
        agentKey,
        result
      };
    } catch (error) {
      breaker.recordFailure();
      return {
        success: false,
        agentKey,
        error: error.message,
        circuitState: breaker.state
      };
    }
  }

  /**
   * Execute function on multiple agents in parallel
   * Returns results for all agents, including failures
   */
  async executeParallel(agentKeys, fnFactory, options = {}) {
    const timeoutMs = options.timeout || this.timeout;
    const continueOnFailure = options.continueOnFailure !== false;

    const promises = agentKeys.map(key => {
      const agent = this.agents[key];
      if (!agent) {
        return Promise.resolve({
          success: false,
          agentKey: key,
          error: `Agent ${key} not found`
        });
      }

      return this.executeWithTimeout(
        key,
        () => fnFactory(agent, key),
        timeoutMs
      );
    });

    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        success: false,
        agentKey: agentKeys[index],
        error: result.reason?.message || 'Unknown error'
      };
    });
  }

  /**
   * Execute function on all agents in parallel
   */
  async executeAll(fnFactory, options = {}) {
    return this.executeParallel(Object.keys(this.agents), fnFactory, options);
  }

  /**
   * Execute function on agents in batches
   */
  async executeBatched(agentKeys, fnFactory, batchSize = 5, options = {}) {
    const results = [];

    for (let i = 0; i < agentKeys.length; i += batchSize) {
      const batch = agentKeys.slice(i, i + batchSize);
      const batchResults = await this.executeParallel(batch, fnFactory, options);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get status of all circuit breakers
   */
  getCircuitStatus() {
    const status = {};
    Object.keys(this.circuitBreakers).forEach(key => {
      status[key] = this.circuitBreakers[key].getStatus();
    });
    return status;
  }

  /**
   * Reset circuit breaker for specific agent
   */
  resetCircuit(agentKey) {
    if (this.circuitBreakers[agentKey]) {
      this.circuitBreakers[agentKey].reset();
    }
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuits() {
    Object.values(this.circuitBreakers).forEach(breaker => breaker.reset());
  }

  /**
   * Get agents that are available (circuit not open)
   */
  getAvailableAgents() {
    return Object.keys(this.agents).filter(key =>
      this.circuitBreakers[key].canExecute()
    );
  }

  /**
   * Filter results to get only successful ones
   */
  static filterSuccessful(results) {
    return results.filter(r => r.success).map(r => r.result);
  }

  /**
   * Filter results to get failed ones
   */
  static filterFailed(results) {
    return results.filter(r => !r.success);
  }
}

module.exports = {
  AgentPool,
  CircuitBreaker,
  CIRCUIT_STATES
};
