# Physics Discovery AI

An autonomous AI agent that discovers the laws of physics through experimentation in a simulated physical world.

## Concept

What if an AI could discover physics from scratch, without any prior knowledge? This project places a Large Language Model (DeepSeek) inside a simulated physical universe where it must:

1. **Experiment** - Push objects, drop things, swing pendulums
2. **Measure** - Track positions, velocities, accelerations, time
3. **Hypothesize** - Form theories about relationships in the data
4. **Discover** - Identify mathematical laws (F=ma, gravity, pendulum period, etc.)

The AI has no knowledge of physics equations. It must discover them empirically, just like early scientists did.

## Laws to Discover

The simulation includes physics that allows discovery of:

- **Newton's Second Law**: F = ma (force equals mass times acceleration)
- **Gravity**: Constant acceleration ~9.81 m/s² for all falling objects
- **Friction**: Different materials have different friction coefficients
- **Pendulum Period**: T = 2π√(L/g)
- **Archimedes' Principle**: Objects float if density < water density
- **Projectile Motion**: Parabolic trajectories

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    PHYSICAL WORLD                        │
│  ┌─────┐  ┌─────┐  ┌─────┐     ╭───╮      ≋≋≋≋≋        │
│  │ 1kg │  │10kg │  │15kg │     │ ○ │      ≋WATER≋      │
│  └─────┘  └─────┘  └─────┘     ╰─┬─╯      ≋≋≋≋≋        │
│   ball    ball     ball      pendulum    tank          │
│                                                         │
│                    🤖 AI AGENT                          │
│              (can move, push, observe)                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    AI REASONING                          │
│                                                         │
│  "I pushed ball_light (1kg) with F=100N → a=100 m/s²   │
│   I pushed ball_heavy (10kg) with F=100N → a=10 m/s²   │
│   I notice that F/m = a in both cases...               │
│   HYPOTHESIS: Acceleration = Force / Mass              │
│   DISCOVERY: F = m × a (Newton's Second Law)"          │
└─────────────────────────────────────────────────────────┘
```

## Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/physics-discovery-ai.git
cd physics-discovery-ai

# Install dependencies
npm install

# Start the server
node server.js
```

## Usage

1. Open http://localhost:3001 in your browser
2. Enter your DeepSeek API key (get one at https://platform.deepseek.com)
3. Watch the AI explore and discover physics!

### Interface

- **Left panel**: Visual simulation of the physical world
- **Right panel**:
  - **Pensamiento (Thinking)**: See the AI's reasoning in real-time
  - **Leyes (Laws)**: Discovered laws and current hypotheses
  - **Experimentos**: History of actions and observations
  - **Stats**: Simulation statistics

- **INFORME button**: Generate a full report of discoveries

## Project Structure

```
physics-discovery-ai/
├── server.js              # Main server with physics engine + AI logic
├── public/
│   └── simulation.html    # Frontend visualization
├── package.json
└── README.md
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Configuration page / Simulation |
| `POST /set-api-key` | Set DeepSeek API key |
| `GET /state` | Current world state |
| `GET /laws` | Discovered laws and hypotheses |
| `GET /thoughts` | AI reasoning log |
| `GET /experiments` | Experiment history |
| `GET /report` | Full discovery report |
| `POST /reset` | Reset simulation |

## The AI's Actions

The AI can perform these actions in the world:

| Action | Description |
|--------|-------------|
| `MOVE` | Walk left or right |
| `PICKUP` | Grab a nearby object |
| `DROP` | Release held object (to study falling) |
| `THROW` | Launch object with initial velocity |
| `PUSH` | Apply force to an object (key for F=ma) |
| `PUSH_PENDULUM` | Start pendulum oscillation |
| `OBSERVE` | Measure an object's state |
| `WAIT` | Pause and observe |

## Example Discovery Process

```
t=0s:  AI spawns in world, sees objects of different masses
t=3s:  "I'll push ball_light (1kg) with F=100N to measure acceleration"
       → Observes a = 100 m/s²
t=6s:  "Now I'll push ball_heavy (10kg) with same force"
       → Observes a = 10 m/s²
t=9s:  "Interesting! F/m = 100/1 = 100, and F/m = 100/10 = 10"
       → Both equal the measured acceleration!
t=12s: "Testing with ball_steel (15kg)..."
       → Observes a = 6.67 m/s², and 100/15 = 6.67
t=15s: DISCOVERY: "F = m × a" (Newton's Second Law)
       Confidence: 95%
```

## Configuration

The simulation parameters can be adjusted in `server.js`:

```javascript
const GRAVITY = 9.81;      // m/s²
const FRICTION = 0.4;      // coefficient
const RESTITUTION = 0.6;   // bounce factor
```

## Why This Matters

This project explores:

1. **AI Scientific Reasoning**: Can LLMs perform genuine scientific discovery?
2. **Empirical Learning**: Learning from data without pre-programmed knowledge
3. **Emergent Understanding**: Do the discovered "laws" match human physics?
4. **Novel Physics**: Could an AI discover laws humans haven't noticed?

## Requirements

- Node.js 18+
- DeepSeek API key

## License

MIT

---

## Conexiones

<table>
<tr>
<td width="50%">

### El descubrimiento como destino

> *"La curiosidad tiene su propia razón de existir."*

La IA descubre F=ma. Pero esa ley ya existía antes de ser descubierta. ¿Estaba destinada a encontrarla?

**[Are You There Reading?](https://github.com/gamogestionweb/Are-you-there-are-reading)** pregunta si el azar existe o todo está predeterminado. Si las leyes de la física ya están ahí, ¿descubrirlas es elección o inevitabilidad?

</td>
<td width="50%">

### El presente contiene todo

Si el presente contiene toda la información del pasado y futuro, entonces las leyes de la física ya estaban "escritas" en el estado inicial del universo.

**[PCP Universe](https://github.com/gamogestionweb/pcp-universe)** valida esta idea en hardware cuántico real. La IA de Physics Discovery la descubre empíricamente.

</td>
</tr>
<tr>
<td>

### Adam nombró los animales

En **[Genesis Simulation](https://github.com/gamogestionweb/genesis-simulation)**, Adam nombra cada criatura. Aquí, la IA nombra cada ley.

Nombrar es entender. Categorizar es controlar. Ambos proyectos exploran cómo la inteligencia da estructura al caos.

</td>
<td>

### La observación cambia todo

> *"Tú eres el escritor de tu vida, tú eres tus acciones de hoy."*

En **[100 Días de una Vida](https://github.com/gamogestionweb/100-dias-de-una-vida)**, Abel observa su propia vida y la escribe. Aquí, la IA observa la física y la descubre.

La observación consciente transforma la realidad en conocimiento.

</td>
</tr>
</table>

---

## Credits

Built with:
- [DeepSeek](https://deepseek.com) - LLM for reasoning
- [Express.js](https://expressjs.com) - Web server
- HTML5 Canvas - Visualization

---

*"The important thing is not to stop questioning. Curiosity has its own reason for existence."* - Albert Einstein
