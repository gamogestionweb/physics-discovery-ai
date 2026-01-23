# Physics Discovery Multi-Agent System

## Overview

A revolutionary physics discovery system with **11 autonomous AI agents** exploring the fundamental laws of physics, searching for connections, and potentially discovering new relationships in the universe.

```
╔═══════════════════════════════════════════════════════════════════╗
║     PHYSICS DISCOVERY MULTI-AGENT SYSTEM                          ║
║     ════════════════════════════════════════                      ║
║                                                                   ║
║     9 DeepSeek + 1 Claude Opus 4.5 + 1 GPT-5.2                   ║
║                                                                   ║
║     Exploring what we don't know we don't know                   ║
╚═══════════════════════════════════════════════════════════════════╝
```

## The Agents

### 9 DeepSeek Theorists (Proposing Theories)

| Agent | Personality | Approach |
|-------|-------------|----------|
| **Euler** | Mathematical purist | Seeks elegant mathematical structures, symmetries as keys |
| **Faraday** | Empirical pragmatist | Demands experimental verification for everything |
| **Democritus** | Particle reductionist | Everything reduces to fundamental particles |
| **Hubble** | Cosmic visionary | Connects local physics to universal evolution |
| **Shannon** | Information fundamentalist | Physics is information processing |
| **Boltzmann** | Statistical thinker | Probability and statistics explain everything |
| **Bohr** | Quantum philosopher | Obsessed with measurement and interpretation |
| **Einstein** | Grand unifier | Seeks unified theories connecting all domains |
| **Anderson** | Emergence champion | "More is different" - complexity creates new laws |

### 1 Claude Opus 4.5 - The Tenth Man (Advocatus Diaboli)

The **Tenth Man Rule**: If 9 people agree on something, the 10th person MUST disagree and find problems, no matter how convincing the argument seems.

This agent:
- Systematically challenges every theory proposed
- Finds hidden assumptions and overlooked alternatives
- Points out historical cases where "obvious truths" were wrong
- Proposes what evidence would DISPROVE theories
- Protects the group from groupthink and overconfidence

### 1 GPT-5.2 - The Synthesizer (Nexus)

The **Synthesizer Role**: Finds hidden connections between different theories and domains, unifying disparate ideas into coherent frameworks.

This agent:
- Listens to ALL other agents before concluding
- Finds unexpected connections between theories
- Identifies common mathematical structures across domains
- Proposes unified frameworks that reconcile contradictions
- Creates conceptual maps showing how ideas interconnect
- Bridges the gap between abstract theory and empirical observation

## Physics Knowledge Base

The system includes a comprehensive knowledge base with:

### Verified Laws
- Classical Mechanics (Newton, Lagrange, Hamilton)
- Electromagnetism (Maxwell's equations)
- Thermodynamics & Statistical Mechanics
- Special & General Relativity
- Quantum Mechanics
- Quantum Field Theory & Standard Model
- Nuclear Physics
- Condensed Matter Physics
- Cosmology
- Quantum Information

### Unexplained Phenomena (For Exploration)
- Dark Matter & Dark Energy
- Matter-Antimatter Asymmetry
- Quantum Gravity
- Black Hole Information Paradox
- Measurement Problem
- Arrow of Time
- Fine Structure Constant
- Neutrino Masses
- Hierarchy Problem
- Hubble Tension
- And many more...

## The Exploration World

Agents have access to:

### Observational Data
- Galaxy rotation curves
- Cosmic Microwave Background
- Supernovae data (accelerating expansion)
- Gravitational wave detections
- Neutrino observations
- Cosmic ray spectrum
- Quantum experiment results
- Atomic measurements
- Strange astrophysical observations

### Experiments They Can Run
- Double slit quantum experiments
- Bell inequality tests
- Orbital mechanics simulations
- Thermodynamic systems
- Electromagnetic wave propagation
- Particle collisions
- Quantum decoherence studies
- Spacetime geometry exploration
- Dark matter halo modeling
- Quantum vacuum properties
- Information-thermodynamics experiments

## Installation

```bash
cd discovery-system
npm install
```

## Running the System

```bash
npm start
```

Then open http://localhost:3000 in your browser.

## Usage

1. **Enter API Keys**: Provide your DeepSeek, Claude (Anthropic), and OpenAI API keys
2. **Start Session**: Choose an exploration topic or leave blank for open exploration
3. **Run Cycles**: Each cycle:
   - All 9 DeepSeek agents think independently
   - They may propose theories, run experiments, observe data
   - The Tenth Man (Claude) challenges all proposed theories
   - The Synthesizer (GPT-5.2) finds connections between ideas
   - Agents discuss and debate
   - Discoveries are recorded when consensus is reached

4. **Auto Mode**: Let the system run cycles automatically

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATOR                              │
│  Coordinates cycles, manages discussions, tracks discoveries     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   EXPLORATION WORLD                        │   │
│  │  • Observational Data (real physics data)                 │   │
│  │  • Simulation Engine (run experiments)                    │   │
│  │  • Discovery Tracking                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 PHYSICS KNOWLEDGE BASE                     │   │
│  │  • All verified physical laws                             │   │
│  │  • Unexplained phenomena                                  │   │
│  │  • Mathematical structures                                │   │
│  │  • Cross-domain connections                               │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  Euler  │ │ Faraday │ │Democritus│ │ Hubble │ │ Shannon │   │
│  │DeepSeek │ │DeepSeek │ │DeepSeek │ │DeepSeek │ │DeepSeek │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘   │
│       │           │           │           │           │         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │Boltzmann│ │  Bohr   │ │Einstein │ │Anderson │ │10th Man │   │
│  │DeepSeek │ │DeepSeek │ │DeepSeek │ │DeepSeek │ │ Claude  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └────┬────┘   │
│                                                        │         │
│                                    CHALLENGES ALL ─────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/initialize` | POST | Initialize with API keys |
| `/api/session/start` | POST | Start exploration session |
| `/api/session/stop` | POST | Stop session |
| `/api/cycle` | POST | Run one exploration cycle |
| `/api/state` | GET | Get system state |
| `/api/theories` | GET | Get all proposed theories |
| `/api/discoveries` | GET | Get all discoveries |
| `/api/discussions` | GET | Get discussion history |
| `/api/agent/:key/query` | POST | Query specific agent |
| `/api/experiments` | GET | List available experiments |
| `/api/experiment` | POST | Run an experiment |

## WebSocket Events

The system broadcasts real-time events:
- `agent_thinking` - An agent is processing
- `theory_proposed` - New theory submitted
- `theory_challenged` - Tenth Man challenges theory
- `experiment_completed` - Experiment finished
- `discovery` - New discovery made
- `discussion` - Agents discussing a topic

## Example Session

```
Cycle 1:
├── Euler: "I notice the fine structure constant appears in multiple contexts..."
├── Shannon: "What if information is more fundamental than matter?"
├── Hubble: "Galaxy rotation curves suggest missing mass..."
├── TENTH MAN: "Wait - you're assuming Newtonian gravity holds at all scales.
│              What if gravity is modified? MOND has predictions too."
├── [Discussion ensues...]
└── No consensus yet

Cycle 2:
├── Faraday: "We should run experiments on dark matter detection..."
├── Democritus: "Perhaps dark matter is a new particle family..."
├── TENTH MAN: "Every dark matter candidate has failed detection.
│              Perhaps it doesn't exist. What if GR needs modification?"
└── Experiment: Dark matter halo simulation initiated

...and so on
```

## The Philosophy

This system embodies several key principles:

1. **Diverse Perspectives**: Different agents approach problems from fundamentally different viewpoints, mimicking how scientific breakthroughs often come from unexpected angles.

2. **Systematic Skepticism**: The Tenth Man ensures no theory is accepted without rigorous challenge, preventing groupthink that has derailed science throughout history.

3. **Rich Exploration Space**: Agents have access to real observational data and verified physics, but are encouraged to explore the boundaries of what we know.

4. **Autonomous Discovery**: Each agent thinks independently, then collaborates, mimicking the scientific community's interplay of individual insight and collective validation.

## License

MIT

## Contributing

This is an experimental system. Contributions welcome for:
- Additional physical phenomena
- New experiment types
- Improved agent prompting
- Better visualization
- Performance optimization
