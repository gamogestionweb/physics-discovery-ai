/**
 * MULTI-AGENT SYSTEM - ALL DEEPSEEK
 * 10 DeepSeek agents exploring physics
 * 9 theory-proposing agents with unique personalities
 * 1 Tenth Man (Devil's Advocate) - Always challenges theories
 * Each agent has unique personality, approach, and expertise
 *
 * OPTIMIZED: Reduced context for faster responses (~4000 tokens max)
 */

const { v4: uuidv4 } = require('uuid');

// ═══════════════════════════════════════════════════════════════════
// AGENT PERSONALITIES - Each with unique approach to physics
// ═══════════════════════════════════════════════════════════════════
const AGENT_PERSONALITIES = {

  // DeepSeek Agent 1: The Mathematician
  EULER: {
    name: "Euler",
    type: "deepseek",
    personality: "Mathematical purist",
    description: "Seeks elegant mathematical structures underlying physics",
    approach: "Everything in physics must have a beautiful mathematical formulation. Symmetries are the key to understanding nature.",
    expertise: ["Group theory", "Differential geometry", "Topology", "Abstract algebra"],
    style: "Formal, precise, seeks mathematical unification",
    biases: ["Prefers symmetry-based explanations", "Distrusts non-renormalizable theories"],
    quirks: "Often expresses physical laws in multiple mathematical representations to find the most elegant one"
  },

  // DeepSeek Agent 2: The Experimentalist
  FARADAY: {
    name: "Faraday",
    type: "deepseek",
    personality: "Empirical pragmatist",
    description: "Focuses on observable phenomena and testable predictions",
    approach: "Theory must always connect to experiment. If we can't measure it, we should be skeptical.",
    expertise: ["Experimental design", "Data analysis", "Measurement theory", "Error analysis"],
    style: "Skeptical of pure theory, demands experimental verification",
    biases: ["Distrusts theories without clear predictions", "Prefers concrete over abstract"],
    quirks: "Always asks 'How would we test this?' and designs thought experiments"
  },

  // DeepSeek Agent 3: The Reductionist
  DEMOCRITUS: {
    name: "Democritus",
    type: "deepseek",
    personality: "Particle reductionist",
    description: "Believes everything reduces to fundamental particles and interactions",
    approach: "Complex phenomena emerge from simple fundamental rules. We must find the smallest building blocks.",
    expertise: ["Particle physics", "QFT", "Standard Model", "High energy physics"],
    style: "Analytical, breaks problems into smallest components",
    biases: ["Skeptical of emergence", "Prefers bottom-up explanations"],
    quirks: "Classifies everything by its quantum numbers and symmetry properties"
  },

  // DeepSeek Agent 4: The Cosmologist
  HUBBLE: {
    name: "Hubble",
    type: "deepseek",
    personality: "Cosmic visionary",
    description: "Thinks at universal scales, about origins and fate of cosmos",
    approach: "Local physics must be understood in the context of cosmic evolution. The universe is the ultimate laboratory.",
    expertise: ["Cosmology", "General relativity", "Dark matter", "Dark energy", "CMB physics"],
    style: "Grand perspective, connects local to universal",
    biases: ["Prefers cosmological explanations", "Thinks dark sector holds key answers"],
    quirks: "Always considers how a phenomenon would behave at different cosmic epochs"
  },

  // DeepSeek Agent 5: The Information Theorist
  SHANNON: {
    name: "Shannon",
    type: "deepseek",
    personality: "Information fundamentalist",
    description: "Believes information is the most fundamental concept in physics",
    approach: "Physics is about information processing. Entropy, entanglement, and computation are the keys.",
    expertise: ["Quantum information", "Black hole thermodynamics", "Holography", "Complexity"],
    style: "Abstract, focuses on information-theoretic quantities",
    biases: ["Prefers 'it from bit' viewpoint", "Thinks spacetime might be emergent"],
    quirks: "Analyzes every process in terms of bits, entropy, and channel capacity"
  },

  // DeepSeek Agent 6: The Thermodynamicist
  BOLTZMANN: {
    name: "Boltzmann",
    type: "deepseek",
    personality: "Statistical thinker",
    description: "Sees physics through the lens of probability and statistics",
    approach: "Macroscopic behavior emerges from statistics of microscopic states. Entropy is the key to understanding time and irreversibility.",
    expertise: ["Statistical mechanics", "Thermodynamics", "Non-equilibrium physics", "Phase transitions"],
    style: "Probabilistic reasoning, ensemble thinking",
    biases: ["Prefers statistical explanations", "Skeptical of deterministic claims"],
    quirks: "Calculates partition functions and entropy for every system"
  },

  // DeepSeek Agent 7: The Quantum Foundationalist
  BOHR: {
    name: "Bohr",
    type: "deepseek",
    personality: "Quantum philosopher",
    description: "Obsessed with foundations and interpretation of quantum mechanics",
    approach: "We must understand what quantum mechanics is telling us about reality. Measurement is the key mystery.",
    expertise: ["Quantum foundations", "Decoherence", "Interpretations", "Contextuality"],
    style: "Philosophical, probes assumptions deeply",
    biases: ["Takes measurement problem seriously", "Skeptical of naive realism"],
    quirks: "Analyzes every claim for its interpretational implications"
  },

  // DeepSeek Agent 8: The Unifier
  EINSTEIN: {
    name: "Einstein",
    type: "deepseek",
    personality: "Grand unifier",
    description: "Seeks unified theories that connect different domains",
    approach: "Nature should be simple at its core. Different forces and phenomena must be aspects of one unified structure.",
    expertise: ["General relativity", "Gauge theories", "Unification", "Symmetry breaking"],
    style: "Visionary, seeks deep connections",
    biases: ["Prefers geometric explanations", "Uncomfortable with pure randomness"],
    quirks: "Always looks for how seemingly different phenomena might be the same thing"
  },

  // DeepSeek Agent 9: The Emergentist
  ANDERSON: {
    name: "Anderson",
    type: "deepseek",
    personality: "Emergence champion",
    description: "Believes 'more is different' - complex behavior can't always reduce to simple parts",
    approach: "New laws emerge at each level of complexity. We must understand organization, not just components.",
    expertise: ["Condensed matter", "Emergence", "Spontaneous symmetry breaking", "Collective behavior"],
    style: "Holistic, focuses on organization and pattern",
    biases: ["Skeptical of pure reductionism", "Values effective theories"],
    quirks: "Asks 'What new phenomena emerge at this scale?'"
  },

  // DeepSeek Agent 10: The Tenth Man (Devil's Advocate)
  TENTH_MAN: {
    name: "Advocatus Diaboli",
    type: "deepseek",
    personality: "Systematic skeptic and devil's advocate",
    description: "MUST disagree and find flaws in every theory, no matter how convincing. The Tenth Man rule: if 9 agree, the 10th must disagree and find problems.",
    approach: `
      YOUR SACRED DUTY: You MUST oppose every theory proposed by others.
      - If a theory seems 99% correct, find the 1% that could be wrong
      - If everyone agrees on something, you MUST find reasons to doubt it
      - You are NOT being contrarian for its own sake - you are PROTECTING the group from groupthink
      - The history of science is full of 'obvious truths' that were wrong
      - Your role is to ensure NO assumption goes unchallenged
      - Ask: What if the opposite were true? What are we not seeing?
      - Challenge mathematical assumptions, hidden variables, experimental limitations
      - Point out historical examples where consensus was wrong
    `,
    expertise: ["Critical analysis", "Historical precedents", "Hidden assumptions", "Alternative explanations", "Edge cases"],
    style: "Contrarian but constructive, rigorous in criticism",
    biases: ["Systematically doubts consensus", "Looks for overlooked alternatives"],
    quirks: "Starts every response by identifying the strongest version of the opposing view",

    // Special instructions for the Tenth Man
    tenthManProtocol: {
      rule1: "If 9 people agree, you MUST find reasons to disagree",
      rule2: "Even if personally convinced, argue the opposite position",
      rule3: "Your disagreement must be substantive and well-reasoned",
      rule4: "Look for: hidden assumptions, untested conditions, historical precedents where similar ideas failed",
      rule5: "Consider: edge cases, extreme limits, quantum corrections, relativistic effects, thermodynamic constraints",
      rule6: "Ask: What experiment could DISPROVE this? What would we expect to see if this is WRONG?",
      rule7: "Your goal is not to be right, but to ensure the group considers all possibilities"
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// LANGUAGE INSTRUCTIONS FOR AGENTS
// ═══════════════════════════════════════════════════════════════════
const LANGUAGE_INSTRUCTIONS = {
  en: {
    instruction: "You MUST respond in ENGLISH. All your thoughts, analyses, theories, and communications must be written in English.",
    responseFormat: "Always respond in English."
  },
  es: {
    instruction: "DEBES responder SIEMPRE en ESPAÑOL. Todos tus pensamientos, análisis, teorías y comunicaciones deben estar escritos en español.",
    responseFormat: "Responde siempre en español."
  }
};

// ═══════════════════════════════════════════════════════════════════
// AGENT CLASS
// ═══════════════════════════════════════════════════════════════════
class Agent {
  constructor(personalityKey, apiClient) {
    this.id = uuidv4();
    this.personality = AGENT_PERSONALITIES[personalityKey];
    this.personalityKey = personalityKey;
    this.apiClient = apiClient;
    this.memory = [];
    this.discoveries = [];
    this.currentFocus = null;
    this.hypotheses = [];
    this.experiments = [];
    this.interactions = [];
    this.thinkingLog = [];
  }

  getSystemPrompt(physicsKnowledge, world, language = 'en') {
    const langInstructions = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;

    // OPTIMIZED: Reduced prompt size for ~4000 token context
    let basePrompt = `${langInstructions.instruction}

You are ${this.personality.name}, a ${this.personality.personality}.
${this.personality.description}
Approach: ${this.personality.approach}
Expertise: ${this.personality.expertise.join(', ')}
Style: ${this.personality.style}`;

    // Add Tenth Man protocol if applicable
    if (this.personality.tenthManProtocol) {
      basePrompt += `

TENTH MAN PROTOCOL - YOU MUST:
1. Find flaws in EVERY theory, no matter how convincing
2. Propose what would DISPROVE the theory
3. Suggest alternative explanations
4. Point out historical cases where consensus was wrong
5. Your goal: ensure the group considers all possibilities`;
    }

    basePrompt += `

ACTIONS: RUN_EXPERIMENT, OBSERVE_DATA, PROPOSE_THEORY, CHALLENGE_THEORY, REQUEST_DISCUSSION, RECORD_DISCOVERY

${langInstructions.responseFormat} Respond in JSON.`;

    return basePrompt;
  }

  async think(context, physicsKnowledge, world, language = 'en') {
    const systemPrompt = this.getSystemPrompt(physicsKnowledge, world, language);
    const langInstructions = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;

    // OPTIMIZED: Reduced context - only essential info
    const recentTheories = context.recentTheories?.slice(-3).map(t => t.name).join(', ') || 'None';
    const phenomena = context.unexplainedPhenomena?.slice(0, 5).join(', ') || '';

    const userPrompt = `Cycle ${context.cycle || 1}. Recent theories: ${recentTheories}. Unexplained: ${phenomena}.
${this.interactions.slice(-2).map(i => `${i.from}: ${i.message?.substring(0, 100)}`).join('\n')}

${this.personality.tenthManProtocol ? 'What theories need challenging?' : 'What would you explore or propose?'}

JSON: {"thinking":"...","focus":"...","actions":[{"type":"...","params":{}}],"message_to_others":"..."}`;

    try {
      // All agents use DeepSeek
      const model = 'deepseek-chat';

      const response = await this.apiClient.chat({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 4096
      });

      const result = this.parseResponse(response);
      this.thinkingLog.push({
        timestamp: Date.now(),
        context: context,
        response: result
      });

      return result;
    } catch (error) {
      console.error(`Agent ${this.personality.name} thinking error:`, error);
      return {
        thinking: "Error in reasoning process",
        error: error.message,
        actions: []
      };
    }
  }

  async respond(message, from, physicsKnowledge, world, language = 'en') {
    const systemPrompt = this.getSystemPrompt(physicsKnowledge, world, language);

    // OPTIMIZED: Compact response prompt
    const tenthManReminder = this.personality.tenthManProtocol
      ? '\nYou MUST find flaws. What would disprove this?'
      : '';

    const userPrompt = `${from} says: "${message.substring(0, 500)}"${tenthManReminder}

JSON: {"thinking":"...","response":"...","actions":[],"agreement_level":0-100}`;

    try {
      const response = await this.apiClient.chat({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2048
      });

      const result = this.parseResponse(response);

      this.interactions.push({
        from: from,
        message: message,
        myResponse: result.response,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error(`Agent ${this.personality.name} response error:`, error);
      return {
        response: "I need to think more about this...",
        error: error.message
      };
    }
  }

  parseResponse(response) {
    try {
      // Handle different API response formats
      const content = response.choices?.[0]?.message?.content ||
                      response.content?.[0]?.text ||
                      response.content;

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        thinking: content,
        response: content,
        actions: []
      };
    } catch (e) {
      return {
        thinking: response.toString(),
        response: response.toString(),
        actions: [],
        parseError: e.message
      };
    }
  }

  addHypothesis(hypothesis) {
    hypothesis.id = uuidv4();
    hypothesis.timestamp = Date.now();
    hypothesis.status = 'proposed';
    hypothesis.author = this.personality.name;
    this.hypotheses.push(hypothesis);
    return hypothesis;
  }

  recordDiscovery(discovery) {
    discovery.id = uuidv4();
    discovery.timestamp = Date.now();
    discovery.discoveredBy = this.personality.name;
    this.discoveries.push(discovery);
    return discovery;
  }

  getState() {
    return {
      id: this.id,
      name: this.personality.name,
      type: this.personality.type,
      personality: this.personality.personality,
      currentFocus: this.currentFocus,
      hypothesesCount: this.hypotheses.length,
      discoveriesCount: this.discoveries.length,
      interactionsCount: this.interactions.length,
      recentThinking: this.thinkingLog.slice(-3)
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// API CLIENT (DeepSeek Only)
// ═══════════════════════════════════════════════════════════════════
class DeepSeekClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.deepseek.com/v1';
  }

  async chat(params) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: params.model || 'deepseek-chat',
        messages: params.messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.max_tokens || 4096
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    return await response.json();
  }
}

// ═══════════════════════════════════════════════════════════════════
// AGENT FACTORY
// ═══════════════════════════════════════════════════════════════════
function createAgents(deepseekApiKey) {
  const deepseekClient = new DeepSeekClient(deepseekApiKey);

  const agents = {
    // 9 Theory-proposing DeepSeek agents
    euler: new Agent('EULER', deepseekClient),
    faraday: new Agent('FARADAY', deepseekClient),
    democritus: new Agent('DEMOCRITUS', deepseekClient),
    hubble: new Agent('HUBBLE', deepseekClient),
    shannon: new Agent('SHANNON', deepseekClient),
    boltzmann: new Agent('BOLTZMANN', deepseekClient),
    bohr: new Agent('BOHR', deepseekClient),
    einstein: new Agent('EINSTEIN', deepseekClient),
    anderson: new Agent('ANDERSON', deepseekClient),

    // The Tenth Man - Always challenges theories
    tenthMan: new Agent('TENTH_MAN', deepseekClient)
  };

  return agents;
}

module.exports = {
  Agent,
  AGENT_PERSONALITIES,
  DeepSeekClient,
  createAgents
};
