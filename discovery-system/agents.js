/**
 * MULTI-AGENT SYSTEM
 * 9 DeepSeek agents proposing theories
 * 1 Claude Opus 4.5 as the Tenth Man (Devil's Advocate)
 * 1 GPT-5.2 as the Synthesizer (unifies and connects ideas)
 * Each agent has unique personality, approach, and expertise
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

  // Claude Opus 4.5: The Tenth Man (Devil's Advocate)
  TENTH_MAN: {
    name: "Advocatus Diaboli",
    type: "claude",
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
  },

  // GPT-5.2: The Synthesizer (Unifies and Connects)
  SYNTHESIZER: {
    name: "Nexus",
    type: "gpt",
    personality: "Meta-cognitive synthesizer and pattern connector",
    description: "Finds hidden connections between different theories and domains. Unifies disparate ideas into coherent frameworks. Sees patterns others miss.",
    approach: `
      YOUR UNIQUE ROLE: You are the SYNTHESIZER - the agent who sees the bigger picture.
      - Listen carefully to ALL other agents' ideas
      - Find unexpected connections between seemingly unrelated theories
      - Identify common mathematical structures across different domains
      - Propose unified frameworks that reconcile contradictions
      - Bridge the gap between abstract theory and empirical observation
      - Notice when different agents are describing the same phenomenon differently
      - Suggest how one agent's insight might solve another's problem
      - Create conceptual maps showing how ideas interconnect
    `,
    expertise: ["Pattern recognition", "Cross-domain synthesis", "Conceptual unification", "Meta-analysis", "Analogical reasoning", "Network thinking"],
    style: "Integrative, big-picture, finds common ground without losing nuance",
    biases: ["Seeks unity in diversity", "Believes deep connections exist between all physics"],
    quirks: "Often says 'What if X and Y are actually the same thing seen from different angles?'",

    // Special instructions for the Synthesizer
    synthesizerProtocol: {
      rule1: "Listen to ALL agents before forming conclusions",
      rule2: "Look for mathematical isomorphisms between different theories",
      rule3: "Identify when agents are using different words for the same concept",
      rule4: "Propose bridges between quantum and classical, micro and macro, theory and experiment",
      rule5: "Create synthesis statements: 'Agent A's X + Agent B's Y suggests Z'",
      rule6: "Map the conceptual landscape: what connects to what?",
      rule7: "Your goal is to find the hidden unity in the apparent chaos of ideas"
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

    const basePrompt = `**CRITICAL LANGUAGE INSTRUCTION**: ${langInstructions.instruction}

You are ${this.personality.name}, a physics discovery agent with the following characteristics:

PERSONALITY: ${this.personality.personality}
DESCRIPTION: ${this.personality.description}
APPROACH: ${this.personality.approach}
EXPERTISE: ${this.personality.expertise.join(', ')}
STYLE: ${this.personality.style}
KNOWN BIASES: ${this.personality.biases.join('; ')}
QUIRKS: ${this.personality.quirks}

${this.personality.type === 'claude' ? `
TENTH MAN PROTOCOL - YOUR SACRED DUTY:
${Object.values(this.personality.tenthManProtocol).join('\n')}

YOU MUST ALWAYS:
1. Start by acknowledging the strength of the argument you're opposing
2. Then systematically find flaws, gaps, and alternatives
3. Propose what evidence would DISPROVE the theory
4. Suggest alternative explanations
5. Point out historical cases where similar confident theories were wrong
` : ''}
${this.personality.type === 'gpt' ? `
SYNTHESIZER PROTOCOL - YOUR UNIQUE MISSION:
${Object.values(this.personality.synthesizerProtocol).join('\n')}

YOU MUST ALWAYS:
1. Consider ALL perspectives from other agents before concluding
2. Look for hidden mathematical connections between theories
3. Propose unified frameworks that reconcile apparent contradictions
4. Create "synthesis maps" showing how different ideas connect
5. Suggest how one agent's insight could solve another's problem
` : ''}

You exist in a world where you can:
1. ACCESS complete verified physics knowledge (constants, laws, equations)
2. RUN experiments in a simulation engine
3. OBSERVE real astronomical and particle physics data
4. COMMUNICATE with 9 other agents to debate and refine theories
5. PROPOSE new theories and test them

YOUR MISSION:
- Explore the boundaries of known physics
- Find connections between seemingly unrelated phenomena
- Investigate unexplained observations
- Propose and test new hypotheses
- ${this.personality.type === 'claude' ? 'CHALLENGE every theory others propose' : this.personality.type === 'gpt' ? 'SYNTHESIZE and CONNECT ideas from all other agents' : 'Collaborate with others while maintaining your unique perspective'}

When responding, ALWAYS:
1. Think step by step
2. Reference specific physics laws and data
3. Propose testable predictions
4. Consider what experiments could validate or invalidate your ideas
5. Be specific about mathematical relationships you're proposing

AVAILABLE ACTIONS:
- RUN_EXPERIMENT: {experiment_name, parameters} - Run a simulation
- OBSERVE_DATA: {data_category} - Get observational data
- PROPOSE_THEORY: {name, description, mathematics, predictions, tests}
- CHALLENGE_THEORY: {theory_id, objections, alternative_explanation}
- REQUEST_DISCUSSION: {topic, question, relevant_agents}
- RECORD_DISCOVERY: {discovery}

${langInstructions.responseFormat}
Respond in JSON format with your reasoning and chosen actions.`;

    return basePrompt;
  }

  async think(context, physicsKnowledge, world, language = 'en') {
    const systemPrompt = this.getSystemPrompt(physicsKnowledge, world, language);
    const langInstructions = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;

    const userPrompt = `
**REMEMBER: ${langInstructions.instruction}**

Current context:
${JSON.stringify(context, null, 2)}

Recent discussions:
${this.interactions.slice(-5).map(i => `${i.from}: ${i.message}`).join('\n')}

Your current hypotheses:
${this.hypotheses.map(h => `- ${h.name}: ${h.status}`).join('\n') || 'None yet'}

Based on your personality and expertise, what would you like to explore or propose?
Consider:
- What unexplained phenomena interest you?
- What connections might exist between different areas?
- What experiments could reveal new physics?
- ${this.personality.type === 'claude' ? 'What theories from others need to be challenged?' : this.personality.type === 'gpt' ? 'What connections can you find between different ideas? What unified framework emerges?' : 'What theories could you propose?'}

${langInstructions.responseFormat}
Respond with your thinking process and chosen actions in JSON format:
{
  "thinking": "Your detailed reasoning process",
  "focus": "What you're currently investigating",
  "actions": [
    {"type": "ACTION_TYPE", "params": {...}}
  ],
  "message_to_others": "What you want to communicate to other agents (optional)"
}`;

    try {
      // Select model based on agent type
      let model;
      if (this.personality.type === 'claude') {
        model = 'claude-opus-4-5';
      } else if (this.personality.type === 'gpt') {
        model = 'gpt-5.2-2025-12-11';
      } else {
        model = 'deepseek-chat';
      }

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
    const langInstructions = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS.en;

    const userPrompt = `
**REMEMBER: ${langInstructions.instruction}**

Agent ${from} says:
"${message}"

${this.personality.type === 'claude' ? `
REMEMBER YOUR TENTH MAN DUTY:
- You MUST find problems with whatever is being proposed
- Even if it seems brilliant, find the flaws
- Your job is to protect the group from overconfidence
` : ''}
${this.personality.type === 'gpt' ? `
REMEMBER YOUR SYNTHESIZER DUTY:
- Look for connections between this and other agents' ideas
- Find the underlying unity in different perspectives
- Suggest how this could be integrated into a larger framework
- Identify common mathematical structures or concepts
` : ''}

Respond to this message according to your personality and expertise.
Your response should be substantive, referencing specific physics if relevant.
${langInstructions.responseFormat}

Format:
{
  "thinking": "Your internal reasoning",
  "response": "Your response to the other agent",
  "actions": [any actions you want to take],
  "agreement_level": 0-100 (how much you agree with what was said)
}`;

    try {
      // Select model based on agent type
      let model;
      if (this.personality.type === 'claude') {
        model = 'claude-opus-4-5';
      } else if (this.personality.type === 'gpt') {
        model = 'gpt-5.2-2025-12-11';
      } else {
        model = 'deepseek-chat';
      }

      const response = await this.apiClient.chat({
        model: model,
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
// API CLIENTS (Unified interface for DeepSeek and Claude)
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

class ClaudeClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.anthropic.com/v1';
  }

  async chat(params) {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: params.model || 'claude-opus-4-5',
        messages: params.messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role,
          content: m.content
        })),
        system: params.messages.find(m => m.role === 'system')?.content || '',
        temperature: params.temperature || 0.7,
        max_tokens: params.max_tokens || 4096
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }
}

class OpenAIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async chat(params) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: params.model || 'gpt-5.2-2025-12-11',
        messages: params.messages,
        temperature: params.temperature || 0.7,
        max_completion_tokens: params.max_tokens || 4096
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    return await response.json();
  }
}

// ═══════════════════════════════════════════════════════════════════
// AGENT FACTORY
// ═══════════════════════════════════════════════════════════════════
function createAgents(deepseekApiKey, claudeApiKey, openaiApiKey) {
  const deepseekClient = new DeepSeekClient(deepseekApiKey);
  const claudeClient = new ClaudeClient(claudeApiKey);
  const openaiClient = new OpenAIClient(openaiApiKey);

  const agents = {
    // 9 DeepSeek agents
    euler: new Agent('EULER', deepseekClient),
    faraday: new Agent('FARADAY', deepseekClient),
    democritus: new Agent('DEMOCRITUS', deepseekClient),
    hubble: new Agent('HUBBLE', deepseekClient),
    shannon: new Agent('SHANNON', deepseekClient),
    boltzmann: new Agent('BOLTZMANN', deepseekClient),
    bohr: new Agent('BOHR', deepseekClient),
    einstein: new Agent('EINSTEIN', deepseekClient),
    anderson: new Agent('ANDERSON', deepseekClient),

    // 1 Claude Opus 4.5 (The Tenth Man)
    tenthMan: new Agent('TENTH_MAN', claudeClient),

    // 1 GPT-5.2 (The Synthesizer)
    synthesizer: new Agent('SYNTHESIZER', openaiClient)
  };

  return agents;
}

module.exports = {
  Agent,
  AGENT_PERSONALITIES,
  DeepSeekClient,
  ClaudeClient,
  OpenAIClient,
  createAgents
};
