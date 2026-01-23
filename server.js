/**
 * PHYSICS DISCOVERY - SIMPLIFIED PARALLEL EXECUTION
 * 9 Legendary Physicists + Devil's Advocate
 * ALL run in PARALLEL for maximum speed
 */

const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const { createAgents, getAgentList } = require('./agents');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// HARDCODED API KEY
const DEEPSEEK_API_KEY = 'sk-de404a062f674c87bdfd65bf225bfcd4';

// State
let agents = null;
let clients = new Set();
let isRunning = false;
let theories = [];
let discoveries = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Broadcast to all connected clients
function broadcast(message) {
  const messageStr = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(messageStr);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// MAIN EXPLORATION - ALL AGENTS IN PARALLEL
// ═══════════════════════════════════════════════════════════════════
async function runExploration(topic) {
  isRunning = true;
  theories = [];

  broadcast({
    type: 'exploration_started',
    data: { topic, agentCount: 10 },
    timestamp: Date.now()
  });

  console.log(`\n🚀 Starting exploration: ${topic}`);
  console.log('🧠 All 10 agents thinking IN PARALLEL...\n');

  // Get all agent keys
  const agentKeys = Object.keys(agents);

  // PHASE 1: All agents think in PARALLEL
  broadcast({
    type: 'phase',
    data: { phase: 'thinking', message: 'All 10 physicists are thinking simultaneously...' },
    timestamp: Date.now()
  });

  // Notify that each agent is starting to think
  agentKeys.forEach(key => {
    const agent = agents[key];
    broadcast({
      type: 'agent_thinking',
      data: {
        agentKey: key,
        agentName: agent.personality.name,
        personality: agent.personality.personality
      },
      timestamp: Date.now()
    });
    console.log(`[${agent.personality.name}] Starting to think...`);
  });

  // Execute ALL agents in PARALLEL using Promise.all
  const results = await Promise.all(
    agentKeys.map(async (key) => {
      const agent = agents[key];
      try {
        const result = await agent.think(topic);

        // Broadcast result immediately when ready
        broadcast({
          type: 'agent_result',
          data: {
            agentKey: key,
            agentName: agent.personality.name,
            era: agent.personality.era,
            personality: agent.personality.personality,
            isDevil: agent.personality.isDevil || false,
            result: result
          },
          timestamp: Date.now()
        });

        console.log(`[${agent.personality.name}] Finished: ${result.theory?.name || 'Analysis complete'}`);

        return { key, agent: agent.personality.name, result };
      } catch (error) {
        console.error(`[${agent.personality.name}] Error:`, error.message);
        broadcast({
          type: 'agent_error',
          data: { agentKey: key, agentName: agent.personality.name, error: error.message },
          timestamp: Date.now()
        });
        return { key, agent: agent.personality.name, result: null, error: error.message };
      }
    })
  );

  // PHASE 2: Calculate consensus
  broadcast({
    type: 'phase',
    data: { phase: 'consensus', message: 'Calculating consensus...' },
    timestamp: Date.now()
  });

  // Collect all theories and agreements
  const validResults = results.filter(r => r.result && r.result.success);
  const theoryResults = validResults.filter(r => r.result.theory);
  const agreements = validResults.map(r => ({
    agent: r.agent,
    agentKey: r.key,
    agreement: r.result.agreement || 0,
    isDevil: agents[r.key].personality.isDevil || false
  }));

  // Calculate average agreement (excluding Devil's Advocate for discovery threshold)
  const nonDevilAgreements = agreements.filter(a => !a.isDevil);
  const avgAgreement = nonDevilAgreements.length > 0
    ? nonDevilAgreements.reduce((sum, a) => sum + a.agreement, 0) / nonDevilAgreements.length
    : 0;

  // Count how many agree (agreement >= 70)
  const agreeCount = nonDevilAgreements.filter(a => a.agreement >= 70).length;
  const totalNonDevil = nonDevilAgreements.length;
  const consensusPercent = (agreeCount / totalNonDevil) * 100;

  // Store theories
  theories = theoryResults.map(r => ({
    name: r.result.theory.name,
    description: r.result.theory.description,
    mathematics: r.result.theory.mathematics,
    predictions: r.result.theory.predictions,
    experiments: r.result.theory.experiments,
    proposedBy: r.agent,
    agreement: r.result.agreement
  }));

  // Check for DISCOVERY (95% consensus = 9/9 non-devil agents agree)
  const isDiscovery = consensusPercent >= 95;

  if (isDiscovery) {
    // Find the theory with highest agreement
    const bestTheory = theories.reduce((best, t) =>
      (t.agreement > (best?.agreement || 0)) ? t : best, null);

    if (bestTheory) {
      discoveries.push({
        ...bestTheory,
        consensusPercent,
        timestamp: new Date().toISOString()
      });

      broadcast({
        type: 'discovery',
        data: {
          theory: bestTheory,
          consensusPercent,
          agreements
        },
        timestamp: Date.now()
      });

      console.log(`\n🎉 DISCOVERY! ${bestTheory.name} - ${consensusPercent.toFixed(1)}% consensus\n`);
    }
  }

  // Send final summary
  broadcast({
    type: 'exploration_complete',
    data: {
      topic,
      totalAgents: 10,
      successfulResponses: validResults.length,
      theories: theories.length,
      avgAgreement: avgAgreement.toFixed(1),
      consensusPercent: consensusPercent.toFixed(1),
      agreeCount,
      isDiscovery,
      agreements,
      allTheories: theories
    },
    timestamp: Date.now()
  });

  console.log(`\n✅ Exploration complete!`);
  console.log(`   Theories: ${theories.length}`);
  console.log(`   Average Agreement: ${avgAgreement.toFixed(1)}%`);
  console.log(`   Consensus: ${agreeCount}/${totalNonDevil} (${consensusPercent.toFixed(1)}%)`);
  console.log(`   Discovery: ${isDiscovery ? 'YES!' : 'No'}\n`);

  isRunning = false;
  return { theories, discoveries, consensusPercent, isDiscovery };
}

// ═══════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

// Initialize system
app.post('/api/initialize', (req, res) => {
  try {
    agents = createAgents(DEEPSEEK_API_KEY);

    res.json({
      success: true,
      message: 'System initialized with 9 legendary physicists + Devil\'s Advocate',
      agents: getAgentList(),
      discoveryThreshold: '95% consensus (9/9 non-devil agents must agree)'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start exploration (replaces session/start + cycle)
app.post('/api/explore', async (req, res) => {
  if (!agents) {
    return res.status(400).json({ error: 'System not initialized' });
  }

  if (isRunning) {
    return res.status(400).json({ error: 'Exploration already in progress' });
  }

  const { topic } = req.body;
  const explorationTopic = topic || 'Explore the fundamental nature of reality: What connects quantum mechanics, gravity, and information?';

  // Run exploration in background, respond immediately
  runExploration(explorationTopic).catch(err => {
    console.error('Exploration error:', err);
    broadcast({
      type: 'exploration_error',
      data: { error: err.message },
      timestamp: Date.now()
    });
  });

  res.json({
    success: true,
    message: 'Exploration started',
    topic: explorationTopic
  });
});

// Get current state
app.get('/api/state', (req, res) => {
  res.json({
    initialized: !!agents,
    isRunning,
    theoriesCount: theories.length,
    discoveriesCount: discoveries.length
  });
});

// Get all theories
app.get('/api/theories', (req, res) => {
  res.json(theories);
});

// Get all discoveries
app.get('/api/discoveries', (req, res) => {
  res.json(discoveries);
});

// ═══════════════════════════════════════════════════════════════════
// WEBSOCKET
// ═══════════════════════════════════════════════════════════════════

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected. Total:', clients.size);

  // Send current state
  ws.send(JSON.stringify({
    type: 'connected',
    data: {
      initialized: !!agents,
      isRunning,
      theoriesCount: theories.length,
      discoveriesCount: discoveries.length
    },
    timestamp: Date.now()
  }));

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total:', clients.size);
  });
});

// ═══════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║     9 LEGENDARY PHYSICISTS + DEVIL'S ADVOCATE                                 ║
║     ═══════════════════════════════════════════                               ║
║                                                                               ║
║     All agents powered by DeepSeek                                            ║
║     ALL execute in PARALLEL for speed                                         ║
║     Discovery: 95% consensus (9/9 must agree)                                 ║
║                                                                               ║
║     Server: http://localhost:${PORT}                                            ║
║                                                                               ║
║     PHYSICISTS:                                                               ║
║       Newton, Einstein, Feynman, Bohr, Dirac,                                ║
║       Boltzmann, Hawking, Noether, Wheeler                                   ║
║     + Devil's Advocate (the skeptic)                                         ║
║                                                                               ║
║     "If I have seen further it is by standing on the shoulders of Giants"    ║
║                                                        — Isaac Newton         ║
╚═══════════════════════════════════════════════════════════════════════════════╝
  `);
});
