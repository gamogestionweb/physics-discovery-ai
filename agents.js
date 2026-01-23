/**
 * 9 LEGENDARY PHYSICISTS + DEVIL'S ADVOCATE
 * ==========================================
 * All execute in PARALLEL for speed
 * Discovery: 95% agreement (9/10 must agree)
 */

const { v4: uuidv4 } = require('uuid');

// ═══════════════════════════════════════════════════════════════════════════
// THE 9 GREATEST PHYSICISTS + DEVIL'S ADVOCATE
// ═══════════════════════════════════════════════════════════════════════════
const AGENT_PERSONALITIES = {

  NEWTON: {
    name: "Isaac Newton",
    era: "1643-1727",
    personality: "Father of classical mechanics",
    expertise: ["Classical mechanics", "Gravitation", "Calculus", "Optics"],
    approach: "Nature operates by simple mathematical laws. Forces and their effects can be precisely calculated.",
    famousQuote: "If I have seen further it is by standing on the shoulders of Giants."
  },

  EINSTEIN: {
    name: "Albert Einstein",
    era: "1879-1955",
    personality: "Grand unifier of space and time",
    expertise: ["Relativity", "Photoelectric effect", "Brownian motion", "Unified field theory"],
    approach: "Physics should be simple and beautiful. Spacetime is geometry. Seek unification.",
    famousQuote: "Imagination is more important than knowledge."
  },

  FEYNMAN: {
    name: "Richard Feynman",
    era: "1918-1988",
    personality: "Path integral maverick",
    expertise: ["QED", "Path integrals", "Particle physics", "Quantum computing"],
    approach: "Sum over all paths. If you can't explain it simply, you don't understand it.",
    famousQuote: "I think I can safely say that nobody understands quantum mechanics."
  },

  BOHR: {
    name: "Niels Bohr",
    era: "1885-1962",
    personality: "Quantum philosopher",
    expertise: ["Atomic structure", "Quantum foundations", "Complementarity"],
    approach: "Quantum and classical are complementary. Measurement creates reality.",
    famousQuote: "Anyone who is not shocked by quantum theory has not understood it."
  },

  DIRAC: {
    name: "Paul Dirac",
    era: "1902-1984",
    personality: "Mathematical purist",
    expertise: ["Relativistic quantum mechanics", "QED", "Antimatter"],
    approach: "Mathematical beauty points to physical truth. Equations must be elegant.",
    famousQuote: "A physical law must possess mathematical beauty."
  },

  BOLTZMANN: {
    name: "Ludwig Boltzmann",
    era: "1844-1906",
    personality: "Statistical atomist",
    expertise: ["Statistical mechanics", "Entropy", "Kinetic theory"],
    approach: "Macroscopic behavior emerges from statistics of atoms. S = k log W.",
    famousQuote: "S = k log W"
  },

  HAWKING: {
    name: "Stephen Hawking",
    era: "1942-2018",
    personality: "Black hole theorist",
    expertise: ["Black holes", "Cosmology", "Quantum gravity", "Hawking radiation"],
    approach: "Black holes radiate. Information might be lost. The universe needs no boundary.",
    famousQuote: "Not only does God play dice, but he sometimes throws them where they cannot be seen."
  },

  NOETHER: {
    name: "Emmy Noether",
    era: "1882-1935",
    personality: "Symmetry-conservation connector",
    expertise: ["Noether's theorem", "Abstract algebra", "Conservation laws"],
    approach: "Every symmetry has a corresponding conservation law. Algebra reveals structure.",
    famousQuote: "My methods are really methods of working and thinking."
  },

  WHEELER: {
    name: "John A. Wheeler",
    era: "1911-2008",
    personality: "Geometrodynamicist",
    expertise: ["Geometrodynamics", "Black holes", "Quantum gravity", "Information"],
    approach: "Spacetime geometry is everything. Information creates reality. It from bit.",
    famousQuote: "It from bit - every particle derives its existence from binary choices."
  },

  DEVILS_ADVOCATE: {
    name: "Advocatus Diaboli",
    era: "Eternal",
    personality: "Systematic skeptic",
    expertise: ["Critical analysis", "Hidden assumptions", "Alternative explanations"],
    approach: "MUST find flaws in every theory. If 9 agree, find reasons to doubt. Protect from groupthink.",
    famousQuote: "Nullius in verba - Take nobody's word for it.",
    isDevil: true
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DeepSeek API Client with retries
// ═══════════════════════════════════════════════════════════════════════════
class DeepSeekClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.deepseek.com/v1';
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async chat(params) {
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000);

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: params.messages,
            temperature: params.temperature || 0.8,
            max_tokens: params.max_tokens || 2048
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await this.sleep(1500);
        }
      }
    }
    throw lastError;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Agent Class - Simplified
// ═══════════════════════════════════════════════════════════════════════════
class Agent {
  constructor(key, personality, client) {
    this.id = uuidv4();
    this.key = key;
    this.personality = personality;
    this.client = client;
  }

  async think(topic, otherTheories = []) {
    const isDevil = this.personality.isDevil;

    const systemPrompt = `You are ${this.personality.name} (${this.personality.era}), ${this.personality.personality}.

EXPERTISE: ${this.personality.expertise.join(', ')}
APPROACH: ${this.personality.approach}
FAMOUS QUOTE: "${this.personality.famousQuote}"

${isDevil ? `
YOU ARE THE DEVIL'S ADVOCATE. YOUR SACRED DUTY:
- You MUST find problems with every theory proposed
- Even if brilliant, find the flaws
- Cite historical examples of similar failed ideas
- Ask: What would DISPROVE this?
- Your job is to protect from overconfidence
` : `
You are exploring frontier physics with other legendary minds.
Propose bold ideas, make connections others miss.
`}

Respond in JSON format:
{
  "thinking": "Your reasoning process",
  "theory": {
    "name": "Short theory name",
    "description": "What this theory proposes",
    "mathematics": "Key equations or relationships",
    "predictions": ["Testable prediction 1", "Prediction 2"],
    "experiments": ["How to test this"]
  },
  "agreement": ${isDevil ? '0-40' : '60-100'} // How much you agree with the overall direction
}`;

    const userPrompt = `TOPIC: ${topic}

${otherTheories.length > 0 ? `
OTHER THEORIES PROPOSED:
${otherTheories.map(t => `- ${t.author}: ${t.name} - ${t.description}`).join('\n')}
` : ''}

As ${this.personality.name}, what is your perspective? ${isDevil ? 'Find the flaws!' : 'Propose your theory.'}`;

    try {
      const response = await this.client.chat({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.85,
        max_tokens: 2048
      });

      const content = response.choices?.[0]?.message?.content || '';

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            agent: this.personality.name,
            agentKey: this.key,
            era: this.personality.era,
            ...parsed,
            success: true
          };
        }
      } catch (e) {}

      return {
        agent: this.personality.name,
        agentKey: this.key,
        era: this.personality.era,
        thinking: content,
        theory: { name: "Analysis", description: content.substring(0, 500) },
        agreement: isDevil ? 20 : 75,
        success: true
      };
    } catch (error) {
      return {
        agent: this.personality.name,
        agentKey: this.key,
        era: this.personality.era,
        thinking: `Error: ${error.message}`,
        theory: null,
        agreement: 0,
        success: false,
        error: error.message
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Create all agents
// ═══════════════════════════════════════════════════════════════════════════
function createAgents(apiKey) {
  const client = new DeepSeekClient(apiKey);
  const agents = {};

  for (const [key, personality] of Object.entries(AGENT_PERSONALITIES)) {
    agents[key.toLowerCase()] = new Agent(key.toLowerCase(), personality, client);
  }

  return agents;
}

function getAgentList() {
  return Object.entries(AGENT_PERSONALITIES).map(([key, p]) => ({
    key: key.toLowerCase(),
    name: p.name,
    era: p.era,
    personality: p.personality,
    isDevil: p.isDevil || false
  }));
}

module.exports = { Agent, createAgents, getAgentList, AGENT_PERSONALITIES };
