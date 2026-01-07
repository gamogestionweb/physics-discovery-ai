/**
 * PHYSICS DISCOVERY MULTI-AGENT SERVER
 * Main server with WebSocket communication and web interface
 */

const express = require('express');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const { Orchestrator } = require('./orchestrator');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Store API keys and orchestrator
let orchestrator = null;
let clients = new Set();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ═══════════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════════

// Initialize the system with API keys
app.post('/api/initialize', (req, res) => {
  const { deepseekApiKey, claudeApiKey, openaiApiKey } = req.body;

  if (!deepseekApiKey || !claudeApiKey || !openaiApiKey) {
    return res.status(400).json({
      error: 'DeepSeek, Claude, and OpenAI API keys are all required'
    });
  }

  try {
    orchestrator = new Orchestrator(deepseekApiKey, claudeApiKey, openaiApiKey);

    // Set up event forwarding to WebSocket clients
    setupEventForwarding();

    res.json({
      success: true,
      message: 'System initialized with 11 agents',
      agents: Object.keys(orchestrator.agents).map(key => ({
        key: key,
        name: orchestrator.agents[key].personality.name,
        type: orchestrator.agents[key].personality.type,
        personality: orchestrator.agents[key].personality.personality
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start exploration session
app.post('/api/session/start', async (req, res) => {
  if (!orchestrator) {
    return res.status(400).json({ error: 'System not initialized' });
  }

  const { topic, language } = req.body;

  // Set language for agent deliberations
  if (language) {
    orchestrator.setLanguage(language);
  }

  const session = orchestrator.startSession(topic || 'Open Exploration');

  res.json({
    success: true,
    session: {
      id: session.id,
      topic: session.topic
    }
  });
});

// Set language for agent deliberations
app.post('/api/language', (req, res) => {
  if (!orchestrator) {
    return res.status(400).json({ error: 'System not initialized' });
  }

  const { language } = req.body;
  orchestrator.setLanguage(language);

  res.json({
    success: true,
    language: orchestrator.language
  });
});

// Stop exploration session
app.post('/api/session/stop', (req, res) => {
  if (!orchestrator) {
    return res.status(400).json({ error: 'System not initialized' });
  }

  orchestrator.stopSession();
  res.json({ success: true });
});

// Run a single exploration cycle
app.post('/api/cycle', async (req, res) => {
  if (!orchestrator) {
    return res.status(400).json({ error: 'System not initialized' });
  }

  try {
    const cycleData = await orchestrator.runCycle();
    res.json({
      success: true,
      cycle: cycleData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system state
app.get('/api/state', (req, res) => {
  if (!orchestrator) {
    return res.status(400).json({ error: 'System not initialized' });
  }

  res.json(orchestrator.getState());
});

// Get all theories
app.get('/api/theories', (req, res) => {
  if (!orchestrator) {
    return res.status(400).json({ error: 'System not initialized' });
  }

  res.json(orchestrator.getTheories());
});

// Get all discoveries
app.get('/api/discoveries', (req, res) => {
  if (!orchestrator) {
    return res.status(400).json({ error: 'System not initialized' });
  }

  res.json(orchestrator.getDiscoveries());
});

// Get discussions
app.get('/api/discussions', (req, res) => {
  if (!orchestrator) {
    return res.status(400).json({ error: 'System not initialized' });
  }

  res.json(orchestrator.getDiscussions());
});

// Query a specific agent
app.post('/api/agent/:key/query', async (req, res) => {
  if (!orchestrator) {
    return res.status(400).json({ error: 'System not initialized' });
  }

  const { key } = req.params;
  const { question } = req.body;

  try {
    const response = await orchestrator.queryAgent(key, question);
    res.json({
      agent: key,
      response: response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get physics knowledge
app.get('/api/knowledge', (req, res) => {
  const { PHYSICS_KNOWLEDGE, UNEXPLAINED_PHENOMENA } = require('./physics-knowledge-base');
  res.json({
    laws: Object.keys(PHYSICS_KNOWLEDGE),
    unexplained: Object.keys(UNEXPLAINED_PHENOMENA)
  });
});

// Get available experiments
app.get('/api/experiments', (req, res) => {
  if (!orchestrator) {
    return res.status(400).json({ error: 'System not initialized' });
  }

  res.json(orchestrator.world.getAvailableExperiments());
});

// Run experiment directly
app.post('/api/experiment', (req, res) => {
  if (!orchestrator) {
    return res.status(400).json({ error: 'System not initialized' });
  }

  const { experimentId, parameters } = req.body;

  try {
    const result = orchestrator.world.runExperiment(experimentId, parameters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
// WEBSOCKET HANDLING
// ═══════════════════════════════════════════════════════════════════

function setupEventForwarding() {
  if (!orchestrator) return;

  const events = [
    'session_started', 'session_ended',
    'cycle_started', 'cycle_completed', 'cycle_error',
    'agent_thinking', 'agent_thought',
    'theory_proposed', 'theory_challenged',
    'experiment_running', 'experiment_completed', 'experiment_error',
    'discussion', 'discussion_message', 'discussion_completed',
    'agent_response',
    'discovery',
    'tenth_man_analyzing'
  ];

  events.forEach(eventName => {
    orchestrator.on(eventName, (data) => {
      broadcast({
        type: eventName,
        data: data,
        timestamp: Date.now()
      });
    });
  });
}

function broadcast(message) {
  const messageStr = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(messageStr);
    }
  });
}

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected. Total clients:', clients.size);

  // Send initial state if system is initialized
  if (orchestrator) {
    ws.send(JSON.stringify({
      type: 'initial_state',
      data: orchestrator.getState(),
      timestamp: Date.now()
    }));
  }

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'run_cycle':
          if (orchestrator && orchestrator.isRunning) {
            await orchestrator.runCycle();
          }
          break;

        case 'query_agent':
          if (orchestrator && data.agentKey && data.question) {
            const response = await orchestrator.queryAgent(data.agentKey, data.question);
            ws.send(JSON.stringify({
              type: 'agent_response',
              agentKey: data.agentKey,
              response: response,
              timestamp: Date.now()
            }));
          }
          break;

        case 'start_auto':
          startAutoCycles(data.interval || 30000);
          break;

        case 'stop_auto':
          stopAutoCycles();
          break;
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message,
        timestamp: Date.now()
      }));
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total clients:', clients.size);
  });
});

// Auto-cycle functionality
let autoCycleInterval = null;

function startAutoCycles(interval) {
  if (autoCycleInterval) clearInterval(autoCycleInterval);

  autoCycleInterval = setInterval(async () => {
    if (orchestrator && orchestrator.isRunning) {
      try {
        await orchestrator.runCycle();
      } catch (error) {
        console.error('Auto-cycle error:', error);
      }
    }
  }, interval);

  broadcast({
    type: 'auto_cycle_started',
    interval: interval,
    timestamp: Date.now()
  });
}

function stopAutoCycles() {
  if (autoCycleInterval) {
    clearInterval(autoCycleInterval);
    autoCycleInterval = null;
  }

  broadcast({
    type: 'auto_cycle_stopped',
    timestamp: Date.now()
  });
}

// ═══════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║     PHYSICS DISCOVERY MULTI-AGENT SYSTEM                          ║
║     ════════════════════════════════════════                      ║
║                                                                   ║
║     9 DeepSeek + 1 Claude Opus 4.5 + 1 GPT-5.2                   ║
║                                                                   ║
║     Server running at: http://localhost:${PORT}                     ║
║                                                                   ║
║     DeepSeek Agents:                                              ║
║     ├── Euler (Mathematical purist)                               ║
║     ├── Faraday (Empirical pragmatist)                           ║
║     ├── Democritus (Particle reductionist)                       ║
║     ├── Hubble (Cosmic visionary)                                ║
║     ├── Shannon (Information fundamentalist)                     ║
║     ├── Boltzmann (Statistical thinker)                          ║
║     ├── Bohr (Quantum philosopher)                               ║
║     ├── Einstein (Grand unifier)                                 ║
║     └── Anderson (Emergence champion)                            ║
║                                                                   ║
║     Special Agents:                                               ║
║     ├── Advocatus Diaboli [Claude] (THE TENTH MAN)               ║
║     └── Nexus [GPT] (THE SYNTHESIZER)                            ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
  `);
});
