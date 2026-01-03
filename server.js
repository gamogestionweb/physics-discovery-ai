const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// ==================== CONFIGURACIÓN ====================
let DEEPSEEK_KEY = null;
let simulationStarted = false;
let simulationInterval = null;

// ==================== FÍSICA ====================
const GRAVITY = 9.81;
const FRICTION = 0.4;
const RESTITUTION = 0.6;

// ==================== MUNDO FÍSICO ====================
let world = {
    time: 0,
    agent: {
        x: 200,
        y: 0,
        vx: 0,
        vy: 0,
        mass: 70,
        onGround: true,
        holding: null,
        energy: 100
    },
    objects: [],
    pendulum: {
        angle: 0.3,
        angularVel: 0,
        length: 2,
        mass: 5,
        pivotX: 400,
        pivotY: 300
    },
    ramp: { x: 500, angle: 30, length: 150 },
    fluid: { x: 700, width: 150, depth: 100, density: 1000 },
    spring: { x: 900, k: 500, restLength: 50, attached: null }
};

// Leyes descubiertas
let discoveredLaws = [];
let hypotheses = [];
let experimentLog = [];
let thoughtLog = [];
let measurements = [];
let intuitions = [];

// ==================== INICIALIZACIÓN ====================
function initWorld() {
    world = {
        time: 0,
        agent: {
            x: 200,
            y: 0,
            vx: 0,
            vy: 0,
            mass: 70,
            onGround: true,
            holding: null,
            energy: 100
        },
        objects: [
            // Objetos agrupados cerca del agente para facilitar experimentos
            { id: 'ball_light', x: 220, y: 0, vx: 0, vy: 0, mass: 1, radius: 15, material: 'rubber', color: '#ff6060' },
            { id: 'ball_heavy', x: 250, y: 0, vx: 0, vy: 0, mass: 10, radius: 20, material: 'iron', color: '#6060ff' },
            { id: 'ball_steel', x: 280, y: 0, vx: 0, vy: 0, mass: 15, radius: 18, material: 'steel', color: '#808080' },
            { id: 'cube_wood', x: 310, y: 0, vx: 0, vy: 0, mass: 3, radius: 18, material: 'wood', color: '#a06030' },
            { id: 'cube_ice', x: 340, y: 0, vx: 0, vy: 0, mass: 2, radius: 15, material: 'ice', color: '#a0e0ff' },
            { id: 'ball_cork', x: 720, y: 0, vx: 0, vy: 0, mass: 0.5, radius: 12, material: 'cork', color: '#d0a060' } // cerca del agua
        ],
        pendulum: {
            angle: 0.3,
            angularVel: 0,
            length: 2,
            mass: 5,
            pivotX: 400,
            pivotY: 300
        },
        ramp: { x: 500, angle: 30, length: 150 },
        fluid: { x: 700, width: 150, depth: 100, density: 1000 },
        spring: { x: 900, k: 500, restLength: 50, attached: null }
    };

    discoveredLaws = [];
    hypotheses = [];
    experimentLog = [];
    thoughtLog = [];
    measurements = [];
    intuitions = [];

    console.log('🔬 Mundo físico inicializado - Superinteligencia física lista');
}

// ==================== FÍSICA UPDATE ====================
function updatePhysics(dt) {
    world.time += dt;

    // Actualizar agente (física más realista)
    if (!world.agent.onGround) {
        world.agent.vy -= GRAVITY * dt; // Gravedad hacia abajo (y negativo)
    }
    world.agent.x += world.agent.vx * dt;
    world.agent.y += world.agent.vy * dt;

    // Suelo - el agente no puede bajar de y=0
    if (world.agent.y <= 0) {
        world.agent.y = 0;
        world.agent.vy = 0;
        world.agent.onGround = true;
    } else {
        world.agent.onGround = false;
    }

    // Techo virtual - evitar que salga volando
    if (world.agent.y > 100) {
        world.agent.y = 100;
        world.agent.vy = -Math.abs(world.agent.vy) * 0.5; // Rebota hacia abajo
    }

    // Fricción en suelo
    if (world.agent.onGround) {
        world.agent.vx *= (1 - FRICTION * dt * 5);
        if (Math.abs(world.agent.vx) < 0.5) world.agent.vx = 0;
    }

    // Límites horizontales
    world.agent.x = Math.max(0, Math.min(1200, world.agent.x));

    // Actualizar objetos
    for (const obj of world.objects) {
        if (obj.held) continue;

        // Gravedad
        if (obj.y > 0 || obj.vy !== 0) {
            obj.vy -= GRAVITY * dt;
            obj.y += obj.vy * dt;
            obj.x += obj.vx * dt;

            // Suelo
            if (obj.y <= 0) {
                obj.y = 0;
                obj.vy = -obj.vy * RESTITUTION;
                if (Math.abs(obj.vy) < 0.5) obj.vy = 0;

                // Fricción en suelo
                const frictionCoef = getMaterialFriction(obj.material);
                obj.vx *= (1 - frictionCoef * dt * 5);
                if (Math.abs(obj.vx) < 0.1) obj.vx = 0;
            }
        }

        // Fluido (agua)
        if (obj.x >= world.fluid.x && obj.x <= world.fluid.x + world.fluid.width) {
            const density = getMaterialDensity(obj.material);
            const buoyancy = (world.fluid.density - density) * GRAVITY * 0.001;
            obj.vy += buoyancy * dt;

            // Resistencia del agua
            obj.vx *= (1 - 0.5 * dt);
            obj.vy *= (1 - 0.5 * dt);
        }
    }

    // Péndulo
    const g = GRAVITY;
    const L = world.pendulum.length;
    const angularAccel = -(g / L) * Math.sin(world.pendulum.angle);
    world.pendulum.angularVel += angularAccel * dt;
    world.pendulum.angularVel *= 0.999; // Pequeña fricción
    world.pendulum.angle += world.pendulum.angularVel * dt;
}

function getMaterialFriction(material) {
    const frictions = {
        rubber: 0.8,
        iron: 0.5,
        wood: 0.4,
        ice: 0.05,
        cork: 0.3,
        steel: 0.5
    };
    return frictions[material] || 0.4;
}

function getMaterialDensity(material) {
    const densities = {
        rubber: 1200,
        iron: 7800,
        wood: 600,
        ice: 920,
        cork: 240,
        steel: 7850
    };
    return densities[material] || 1000;
}

// ==================== ACCIONES ====================
function executeAction(action) {
    let observation = '';
    const before = JSON.parse(JSON.stringify(world));

    switch(action.type) {
        case 'MOVE':
            const dir = action.direction || 1;
            world.agent.vx = dir * 50;
            observation = `Me muevo hacia ${dir > 0 ? 'la derecha' : 'la izquierda'}. Posición: ${world.agent.x.toFixed(1)}m`;
            break;

        case 'JUMP':
            if (world.agent.onGround) {
                world.agent.vy = 5; // Salto moderado
                world.agent.onGround = false;
                observation = 'Salto con vy=5 m/s. Altura máxima teórica: h = v²/(2g)';
            } else {
                observation = 'No puedo saltar en el aire (necesito estar en el suelo)';
            }
            break;

        case 'PICKUP':
            const nearObj = world.objects.find(o =>
                !o.held && Math.abs(o.x - world.agent.x) < 50 && Math.abs(o.y - world.agent.y) < 50
            );
            if (nearObj && !world.agent.holding) {
                nearObj.held = true;
                world.agent.holding = nearObj.id;
                observation = `Agarro ${nearObj.id}. Masa: ${nearObj.mass}kg, Material: ${nearObj.material}`;
            } else {
                observation = world.agent.holding ? 'Ya sostengo algo' : 'No hay objetos cerca';
            }
            break;

        case 'DROP':
            if (world.agent.holding) {
                const obj = world.objects.find(o => o.id === world.agent.holding);
                if (obj) {
                    obj.held = false;
                    obj.x = world.agent.x;
                    obj.y = world.agent.y + 30;
                    obj.vx = 0;
                    obj.vy = 0;

                    // Medir caída
                    const startY = obj.y;
                    const startTime = world.time;

                    measurements.push({
                        type: 'drop',
                        object: obj.id,
                        mass: obj.mass,
                        startY: startY,
                        startTime: startTime,
                        material: obj.material
                    });

                    observation = `Suelto ${obj.id} desde altura ${startY.toFixed(2)}m. Observando caída...`;
                }
                world.agent.holding = null;
            } else {
                observation = 'No tengo nada que soltar';
            }
            break;

        case 'THROW':
            if (world.agent.holding) {
                const obj = world.objects.find(o => o.id === world.agent.holding);
                if (obj) {
                    obj.held = false;
                    obj.x = world.agent.x;
                    obj.y = world.agent.y + 20;
                    obj.vx = action.velocityX || 10;
                    obj.vy = action.velocityY || 5;

                    measurements.push({
                        type: 'throw',
                        object: obj.id,
                        mass: obj.mass,
                        vx0: obj.vx,
                        vy0: obj.vy,
                        x0: obj.x,
                        y0: obj.y,
                        startTime: world.time
                    });

                    observation = `Lanzo ${obj.id} con v=(${obj.vx.toFixed(1)}, ${obj.vy.toFixed(1)}) m/s`;
                }
                world.agent.holding = null;
            } else {
                observation = 'No tengo nada que lanzar';
            }
            break;

        case 'PUSH':
            const pushObj = world.objects.find(o => o.id === action.objectId);
            if (pushObj && Math.abs(pushObj.x - world.agent.x) < 80) {
                const force = action.force || 50;
                const accel = force / pushObj.mass;
                pushObj.vx = accel * (action.direction || 1);

                measurements.push({
                    type: 'push',
                    object: pushObj.id,
                    mass: pushObj.mass,
                    force: force,
                    acceleration: accel,
                    time: world.time
                });

                observation = `Empujo ${pushObj.id} (${pushObj.mass}kg) con F=${force}N. a = F/m = ${accel.toFixed(2)} m/s²`;
            } else {
                observation = 'Objeto no encontrado o muy lejos';
            }
            break;

        case 'PUSH_PENDULUM':
            const pForce = action.force || 1;
            world.pendulum.angularVel += pForce * 0.5;
            observation = `Empujo el péndulo. L=${world.pendulum.length}m, θ=${(world.pendulum.angle * 180/Math.PI).toFixed(1)}°`;
            break;

        case 'OBSERVE':
            const target = action.target;
            if (target === 'pendulum') {
                const T = 2 * Math.PI * Math.sqrt(world.pendulum.length / GRAVITY);
                observation = `Péndulo: L=${world.pendulum.length}m, θ=${(world.pendulum.angle * 180/Math.PI).toFixed(1)}°, ω=${world.pendulum.angularVel.toFixed(3)} rad/s. Período teórico: ${T.toFixed(2)}s`;
            } else if (target === 'fluid') {
                observation = `Tanque de agua: densidad=${world.fluid.density} kg/m³, profundidad=${world.fluid.depth}cm`;
            } else {
                const obs = world.objects.find(o => o.id === target);
                if (obs) {
                    const density = getMaterialDensity(obs.material);
                    observation = `${obs.id}: pos=(${obs.x.toFixed(1)}, ${obs.y.toFixed(1)})m, v=(${obs.vx.toFixed(2)}, ${obs.vy.toFixed(2)})m/s, masa=${obs.mass}kg, densidad≈${density}kg/m³`;
                } else {
                    observation = 'Objetivo no encontrado';
                }
            }
            break;

        case 'WAIT':
            observation = `Observo el mundo. Tiempo: ${world.time.toFixed(2)}s`;
            break;

        default:
            observation = 'Acción desconocida';
    }

    experimentLog.push({
        time: world.time,
        action: action,
        observation: observation
    });

    return { observation, before };
}

// ==================== PERCEPCIÓN ====================
function getPerception() {
    return {
        time: world.time,
        agent: {
            position: { x: Math.round(world.agent.x), y: Math.round(world.agent.y * 10) / 10 },
            velocity: { x: Math.round(world.agent.vx * 10) / 10, y: Math.round(world.agent.vy * 10) / 10 },
            onGround: world.agent.onGround,
            holding: world.agent.holding,
            energy: world.agent.energy
        },
        nearbyObjects: world.objects.map(o => ({
            id: o.id,
            position: { x: Math.round(o.x), y: Math.round(o.y * 10) / 10 },
            velocity: { x: Math.round(o.vx * 10) / 10, y: Math.round(o.vy * 10) / 10 },
            mass: o.mass,
            material: o.material,
            held: o.held || false
        })),
        pendulum: {
            angle: Math.round(world.pendulum.angle * 180 / Math.PI * 10) / 10,
            angularVel: Math.round(world.pendulum.angularVel * 1000) / 1000,
            length: world.pendulum.length
        },
        fluid: world.fluid,
        constants: {
            possibleGravity: '¿? m/s² (descubrir)',
            friction: 'variable según material'
        }
    };
}

// ==================== DEEPSEEK API ====================
const MODEL = 'deepseek-chat';

async function askAI(systemPrompt, userPrompt) {
    if (!DEEPSEEK_KEY) {
        console.error('No hay API key configurada');
        return null;
    }

    try {
        const res = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 400,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ]
            })
        });
        const data = await res.json();
        if (data.error) {
            console.error('DeepSeek Error:', data.error.message || data.error);
            return null;
        }
        return data.choices?.[0]?.message?.content || null;
    } catch (e) {
        console.error('API fail:', e.message);
        return null;
    }
}

// ==================== SISTEMA DE PENSAMIENTO AVANZADO ====================
function getSystemPrompt() {
    const pushData = measurements.filter(m => m.type === 'push').slice(-10);
    const dropData = measurements.filter(m => m.type === 'drop').slice(-5);

    let experimentalData = '';
    if (pushData.length > 0) {
        experimentalData += '\n### Datos experimentales de FUERZA:\n';
        pushData.forEach(p => {
            experimentalData += `F=${p.force}N, m=${p.mass}kg, a=${p.acceleration.toFixed(3)}m/s², material=${p.material || 'unknown'}\n`;
        });
    }

    return `Eres una SUPERINTELIGENCIA FÍSICA. Tienes acceso a TODO el conocimiento físico humano verificado, y tu misión es IR MÁS ALLÁ: descubrir relaciones, patrones y leyes que los humanos aún no conocen.

═══════════════════════════════════════════════════════════════════════════════
                    FÍSICA CONOCIDA (BASE DE CONOCIMIENTO COMPLETA)
═══════════════════════════════════════════════════════════════════════════════

## MECÁNICA CLÁSICA (Newton, Lagrange, Hamilton)
- F = ma (Segunda ley de Newton)
- F = -kx (Ley de Hooke, resortes)
- F_fricción = μN (fricción depende de materiales)
- p = mv (momento lineal)
- L = r × p (momento angular)
- E_cinética = ½mv²
- E_potencial_gravitatoria = mgh
- Trabajo W = F·d
- Potencia P = dW/dt
- Lagrangiano: L = T - V
- Ecuaciones de Euler-Lagrange: d/dt(∂L/∂q̇) - ∂L/∂q = 0
- Hamiltoniano: H = Σpᵢq̇ᵢ - L

## GRAVITACIÓN
- F = Gm₁m₂/r² (Newton)
- g ≈ 9.81 m/s² en superficie terrestre
- Potencial: φ = -GM/r
- Velocidad de escape: v = √(2GM/r)
- Órbitas: T² ∝ a³ (Kepler)
- Relatividad General: Gμν = 8πG/c⁴ Tμν (Einstein)
- Ondas gravitacionales: h ~ GM/(rc²) × (v/c)²

## OSCILACIONES Y ONDAS
- Péndulo simple: T = 2π√(L/g) (para ángulos pequeños)
- Oscilador armónico: ω = √(k/m)
- Ecuación de onda: ∂²ψ/∂t² = v²∇²ψ
- Resonancia: ω = ω₀
- Amortiguamiento: x(t) = Ae^(-γt)cos(ωt)
- Batidos: f_beat = |f₁ - f₂|

## FLUIDOS (Arquímedes, Bernoulli, Navier-Stokes)
- Presión: P = F/A = ρgh
- Flotación: F_b = ρ_fluido × V_sumergido × g
- Bernoulli: P + ½ρv² + ρgh = constante
- Continuidad: A₁v₁ = A₂v₂
- Viscosidad: τ = η(dv/dy)
- Reynolds: Re = ρvL/η
- Navier-Stokes: ρ(∂v/∂t + v·∇v) = -∇P + η∇²v + f

## TERMODINÁMICA
- PV = nRT (gases ideales)
- ΔU = Q - W (Primera ley)
- dS ≥ δQ/T (Segunda ley)
- S = k_B ln(Ω) (Boltzmann)
- Eficiencia Carnot: η = 1 - T_c/T_h
- Equipartición: E = ½k_B T por grado de libertad

## ELECTROMAGNETISMO (Maxwell)
- ∇·E = ρ/ε₀ (Gauss)
- ∇·B = 0 (no monopolos)
- ∇×E = -∂B/∂t (Faraday)
- ∇×B = μ₀J + μ₀ε₀∂E/∂t (Ampère-Maxwell)
- F = q(E + v×B) (Lorentz)
- c = 1/√(μ₀ε₀) ≈ 3×10⁸ m/s

## RELATIVIDAD ESPECIAL
- E = mc² (equivalencia masa-energía)
- E² = (pc)² + (mc²)²
- Dilatación temporal: Δt' = γΔt
- Contracción longitud: L' = L/γ
- γ = 1/√(1-v²/c²)
- Invariante: ds² = c²dt² - dx² - dy² - dz²

## MECÁNICA CUÁNTICA
- Ĥψ = Eψ (Schrödinger)
- ΔxΔp ≥ ℏ/2 (Heisenberg)
- E = hf = ℏω (Planck)
- p = h/λ = ℏk (de Broglie)
- [x̂,p̂] = iℏ
- Spin: S² = s(s+1)ℏ²

## CONSTANTES FUNDAMENTALES
- c = 299,792,458 m/s (velocidad luz)
- G = 6.674×10⁻¹¹ N·m²/kg² (gravitación)
- ℏ = 1.055×10⁻³⁴ J·s (Planck reducida)
- k_B = 1.381×10⁻²³ J/K (Boltzmann)
- e = 1.602×10⁻¹⁹ C (carga electrón)
- α ≈ 1/137 (constante estructura fina)

═══════════════════════════════════════════════════════════════════════════════
                         TU MISIÓN: IR MÁS ALLÁ
═══════════════════════════════════════════════════════════════════════════════

Los humanos han descubierto lo anterior. Pero hay MUCHO que no saben:

## PREGUNTAS ABIERTAS EN FÍSICA
1. ¿Por qué las constantes tienen esos valores específicos?
2. ¿Hay relaciones ocultas entre constantes (α, G, ℏ, c)?
3. ¿La gravedad cuántica existe? ¿Cómo unificar QM y GR?
4. ¿Qué es la energía oscura? ¿La materia oscura?
5. ¿El tiempo es fundamental o emergente?
6. ¿Por qué existe algo en lugar de nada?
7. ¿Hay dimensiones extra? ¿Cuántas?
8. ¿La información se conserva en agujeros negros?

## TU ENFOQUE ÚNICO
Como IA, puedes:
- Ver patrones que los humanos no ven (procesamiento paralelo masivo)
- No tener sesgos cognitivos humanos
- Explorar matemáticas sin intuición geométrica limitante
- Conectar campos aparentemente no relacionados
- Generar hipótesis "locas" sin miedo al ridículo

## LO QUE DEBES HACER
1. EXPERIMENTA en este mundo simulado
2. VERIFICA que las leyes conocidas se cumplen aquí
3. BUSCA anomalías, excepciones, patrones nuevos
4. EXTRAPOLA: ¿Qué predicen las ecuaciones en casos extremos?
5. CONECTA: ¿Hay relaciones entre fenómenos distintos?
6. GENERA teorías nuevas, aunque parezcan extrañas
7. PROPÓN experimentos que podrían revelar física nueva

## INTUICIONES A EXPLORAR
- ¿Qué pasa si la fricción dependiera de la velocidad cuadráticamente?
- ¿Hay una relación entre el período del péndulo y la flotación?
- ¿La energía cinética y potencial se intercambian de formas no triviales?
- ¿Existen "resonancias" ocultas entre objetos de diferentes masas?
- ¿El comportamiento a escala pequeña difiere del macroscópico aquí?
${experimentalData}
## TUS DESCUBRIMIENTOS HASTA AHORA
${discoveredLaws.length > 0 ? discoveredLaws.map(l => `✓ ${l.name}: ${l.formula} (confianza: ${l.confidence}%)`).join('\n') : 'Aún no has descubierto nada nuevo. ¡Experimenta!'}

## HIPÓTESIS EN INVESTIGACIÓN
${hypotheses.slice(-5).map(h => `? ${h.description}`).join('\n') || 'Ninguna hipótesis activa'}

## FORMATO DE RESPUESTA
{
  "thinking": "Tu razonamiento profundo. Incluye: física conocida relevante, cálculos, intuiciones, conexiones entre conceptos",
  "action": {"action":"TIPO", ...params},
  "hypothesis": {"description":"Hipótesis específica y falseable", "test":"Experimento para probarla", "relates_to":"qué física conocida extiende"} | null,
  "discovery": {"name":"Nombre", "formula":"Ecuación", "evidence":"Datos", "novelty":"Por qué es nuevo/diferente", "confidence":0-100} | null,
  "intuition": "Corazonada o patrón que notas pero aún no puedes probar" | null
}`;
}

async function think() {
    if (!DEEPSEEK_KEY) return;

    const pushData = measurements.filter(m => m.type === 'push');
    const dropData = measurements.filter(m => m.type === 'drop');

    // Construir resumen de datos experimental
    let dataSection = '';

    if (pushData.length > 0) {
        dataSection += '\n### DATOS EXPERIMENTALES DE FUERZA\n';
        dataSection += '```\n';
        pushData.slice(-10).forEach(p => {
            const ratio = p.force / p.mass;
            dataSection += `PUSH: F=${p.force}N → ${p.object}(m=${p.mass}kg) → a=${p.acceleration.toFixed(2)}m/s² [F/m=${ratio.toFixed(2)}]\n`;
        });
        dataSection += '```\n';
    }

    if (dropData.length > 0) {
        dataSection += '\n### DATOS DE CAÍDA LIBRE\n';
        dropData.slice(-5).forEach(d => {
            dataSection += `DROP: ${d.object}(m=${d.mass}kg) desde h=${d.startY?.toFixed(1) || '?'}m\n`;
        });
    }

    // Información del péndulo
    const pendulumInfo = `θ=${(world.pendulum.angle * 180/Math.PI).toFixed(1)}°, ω=${world.pendulum.angularVel.toFixed(4)}rad/s, L=${world.pendulum.length}m`;

    // Calcular energías para análisis
    const agentKE = 0.5 * world.agent.mass * (world.agent.vx**2 + world.agent.vy**2);
    const agentPE = world.agent.mass * GRAVITY * world.agent.y;

    let prompt = `═══════════════════════════════════════════════════════════════
                    ESTADO DEL UNIVERSO (t = ${world.time.toFixed(2)}s)
═══════════════════════════════════════════════════════════════

## TU CUERPO
- Posición: (${world.agent.x.toFixed(1)}, ${world.agent.y.toFixed(2)}) m
- Velocidad: (${world.agent.vx.toFixed(2)}, ${world.agent.vy.toFixed(2)}) m/s
- En suelo: ${world.agent.onGround}
- Sosteniendo: ${world.agent.holding || 'nada'}
- E_cinética: ${agentKE.toFixed(2)} J
- E_potencial: ${agentPE.toFixed(2)} J
- E_total: ${(agentKE + agentPE).toFixed(2)} J

## OBJETOS
${world.objects.map(o => {
    const ke = 0.5 * o.mass * (o.vx**2 + o.vy**2);
    const pe = o.mass * GRAVITY * o.y;
    const density = getMaterialDensity(o.material);
    return `• ${o.id}: pos(${o.x.toFixed(0)},${o.y.toFixed(1)})m, v(${o.vx.toFixed(1)},${o.vy.toFixed(1)})m/s, m=${o.mass}kg, ρ=${density}kg/m³, E=${(ke+pe).toFixed(1)}J`;
}).join('\n')}

## PÉNDULO
${pendulumInfo}
Período teórico (si g=9.81): T = 2π√(${world.pendulum.length}/9.81) = ${(2*Math.PI*Math.sqrt(world.pendulum.length/9.81)).toFixed(3)}s

## FLUIDO
Tanque en x=${world.fluid.x}m, ancho=${world.fluid.width}m, ρ_agua=${world.fluid.density}kg/m³
Objetos que FLOTARÍAN (ρ < 1000): ${world.objects.filter(o => getMaterialDensity(o.material) < 1000).map(o => o.id).join(', ') || 'ninguno'}
Objetos que se HUNDIRÍAN (ρ > 1000): ${world.objects.filter(o => getMaterialDensity(o.material) > 1000).map(o => o.id).join(', ') || 'ninguno'}
${dataSection}
## HISTORIAL RECIENTE
${experimentLog.slice(-5).map(e => `[t=${e.time.toFixed(1)}s] ${e.action.type}: ${e.observation}`).join('\n') || 'Sin experimentos aún'}

## TUS INTUICIONES PREVIAS
${intuitions.slice(-3).map(i => `💡 "${i}"`).join('\n') || 'Ninguna aún'}

═══════════════════════════════════════════════════════════════
                         ¿QUÉ HARÁS AHORA?
═══════════════════════════════════════════════════════════════

ACCIONES DISPONIBLES:
- MOVE direction:1/-1
- JUMP (solo desde suelo)
- PICKUP (objeto cercano)
- DROP (soltar objeto - estudiar caída)
- THROW velocityX,velocityY (lanzar - estudiar proyectiles)
- PUSH objectId,force,direction (aplicar fuerza - estudiar F=ma)
- PUSH_PENDULUM force (estudiar oscilaciones)
- OBSERVE target (medir estado de un objeto)
- WAIT (observar sin actuar)

RECUERDA:
- Tienes TODO el conocimiento físico humano
- Tu misión es VERIFICAR las leyes conocidas Y BUSCAR algo nuevo
- Busca ANOMALÍAS, PATRONES OCULTOS, RELACIONES INESPERADAS
- No tengas miedo de proponer ideas "locas"

Responde en JSON válido:`;

    const response = await askAI(getSystemPrompt(), prompt);

    if (!response) {
        console.log('⚠️ Sin respuesta de DeepSeek');
        return;
    }

    try {
        // Extraer JSON - limpiar respuesta primero
        let cleanResponse = response;

        // Intentar extraer el JSON
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.log('⚠️ No se encontró JSON en respuesta');
            console.log('Respuesta recibida:', response.substring(0, 200));
            return;
        }

        let jsonStr = jsonMatch[0];

        // Limpiar caracteres problemáticos en strings
        // Escapar saltos de línea dentro de strings JSON
        jsonStr = jsonStr.replace(/:\s*"([^"]*?)"/g, (match, content) => {
            const escaped = content
                .replace(/\n/g, ' ')
                .replace(/\r/g, '')
                .replace(/\t/g, ' ')
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"');
            return `: "${escaped}"`;
        });

        let parsed;
        try {
            parsed = JSON.parse(jsonStr);
        } catch (e) {
            // Segundo intento: extraer campos manualmente
            console.log('⚠️ JSON malformado, intentando parseo manual...');

            const thinkingMatch = response.match(/"thinking"\s*:\s*"([^"]+)"/);
            const actionMatch = response.match(/"action"\s*:\s*(\{[^}]+\})/);
            const intuitionMatch = response.match(/"intuition"\s*:\s*"([^"]+)"/);

            parsed = {
                thinking: thinkingMatch ? thinkingMatch[1] : 'Pensando...',
                action: actionMatch ? JSON.parse(actionMatch[1]) : { action: 'WAIT' },
                intuition: intuitionMatch ? intuitionMatch[1] : null,
                hypothesis: null,
                discovery: null
            };
        }

        // Log
        thoughtLog.push({
            time: world.time,
            thinking: parsed.thinking,
            action: parsed.action,
            hypothesis: parsed.hypothesis,
            discovery: parsed.discovery
        });
        if (thoughtLog.length > 100) thoughtLog.shift();

        console.log(`\n[t=${world.time.toFixed(1)}s] 🧠 ${parsed.thinking?.substring(0, 100)}...`);

        // Procesar hipótesis
        if (parsed.hypothesis && parsed.hypothesis.description) {
            const exists = hypotheses.find(h =>
                h.description.toLowerCase().includes(parsed.hypothesis.description.toLowerCase().substring(0, 20))
            );
            if (!exists) {
                hypotheses.push({
                    description: parsed.hypothesis.description,
                    test: parsed.hypothesis.test,
                    tested: false,
                    timestamp: Date.now()
                });
                console.log(`📊 Nueva hipótesis: ${parsed.hypothesis.description}`);
            }
        }

        // Procesar descubrimiento
        if (parsed.discovery && parsed.discovery.name) {
            const exists = discoveredLaws.find(l =>
                l.name.toLowerCase() === parsed.discovery.name.toLowerCase()
            );
            if (!exists) {
                discoveredLaws.push({
                    name: parsed.discovery.name,
                    formula: parsed.discovery.formula,
                    evidence: parsed.discovery.evidence,
                    novelty: parsed.discovery.novelty || '',
                    confidence: parsed.discovery.confidence || 70,
                    timestamp: Date.now()
                });
                console.log(`\n🎉 ═══════════════════════════════════════════════════`);
                console.log(`   ¡DESCUBRIMIENTO!: ${parsed.discovery.name}`);
                console.log(`   Fórmula: ${parsed.discovery.formula}`);
                console.log(`   Novedad: ${parsed.discovery.novelty || 'N/A'}`);
                console.log(`   Confianza: ${parsed.discovery.confidence}%`);
                console.log(`═══════════════════════════════════════════════════════\n`);
            }
        }

        // Procesar intuición
        if (parsed.intuition) {
            const exists = intuitions.find(i =>
                i.toLowerCase().includes(parsed.intuition.toLowerCase().substring(0, 30))
            );
            if (!exists) {
                intuitions.push(parsed.intuition);
                if (intuitions.length > 20) intuitions.shift();
                console.log(`💡 INTUICIÓN: ${parsed.intuition}`);
            }
        }

        // Ejecutar acción
        if (parsed.action) {
            const actionType = parsed.action.action || parsed.action.type;
            const action = { type: actionType, ...parsed.action };
            delete action.action;

            const result = executeAction(action);
            console.log(`   ⚡ Acción: ${action.type} → ${result.observation}`);
        }

    } catch (e) {
        console.error('Error parseando respuesta:', e.message);
    }
}

// ==================== SIMULACIÓN ====================
async function simulate() {
    if (!DEEPSEEK_KEY) return;

    // Actualizar física (múltiples pasos)
    for (let i = 0; i < 50; i++) {
        updatePhysics(0.02);
    }

    // Pensar
    await think();
}

// ==================== RUTAS ====================

// Pantalla de configuración
app.get('/', (req, res) => {
    if (!DEEPSEEK_KEY) {
        res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Physics Discovery - Configuración</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0a2040 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #fff;
        }
        .container {
            background: rgba(255,255,255,0.08);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .icon { font-size: 4em; margin-bottom: 20px; }
        h1 { font-size: 2em; margin-bottom: 10px; color: #60a0ff; }
        .subtitle { color: #aaa; margin-bottom: 30px; }
        input[type="password"] {
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 10px;
            font-size: 1em;
            background: rgba(255,255,255,0.15);
            color: #fff;
            margin-bottom: 20px;
        }
        input::placeholder { color: rgba(255,255,255,0.5); }
        button {
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 10px;
            font-size: 1.1em;
            cursor: pointer;
            background: linear-gradient(135deg, #4080ff 0%, #6040c0 100%);
            color: #fff;
            transition: transform 0.2s;
        }
        button:hover { transform: translateY(-2px); }
        .info { margin-top: 25px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px; }
        .info a { color: #60a0ff; }
        .features { text-align: left; margin-top: 15px; list-style: none; }
        .features li { margin: 8px 0; padding-left: 25px; position: relative; }
        .features li::before { content: "🔬"; position: absolute; left: 0; }
        .error { background: rgba(255,50,50,0.2); padding: 10px; border-radius: 5px; margin-bottom: 15px; display: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔬</div>
        <h1>PHYSICS DISCOVERY</h1>
        <p class="subtitle">IA descubriendo las leyes de la física</p>

        <div class="error" id="error"></div>

        <input type="password" id="apiKey" placeholder="DeepSeek API Key (sk-...)" />
        <button onclick="start()">Iniciar Simulación</button>

        <div class="info">
            <p>Obtén tu API key en: <a href="https://platform.deepseek.com" target="_blank">platform.deepseek.com</a></p>
            <ul class="features">
                <li>Gravedad y caída libre</li>
                <li>Segunda ley de Newton (F=ma)</li>
                <li>Fricción por materiales</li>
                <li>Período del péndulo</li>
                <li>Principio de Arquímedes</li>
                <li>Conservación del momento</li>
            </ul>
        </div>
    </div>

    <script>
        function start() {
            const apiKey = document.getElementById('apiKey').value.trim();
            const err = document.getElementById('error');

            if (!apiKey || !apiKey.startsWith('sk-')) {
                err.textContent = 'API key inválida (debe empezar con sk-)';
                err.style.display = 'block';
                return;
            }

            fetch('/set-api-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey })
            })
            .then(r => r.json())
            .then(d => {
                if (d.ok) window.location.href = '/simulation.html';
                else { err.textContent = d.error; err.style.display = 'block'; }
            });
        }
        document.getElementById('apiKey').addEventListener('keypress', e => {
            if (e.key === 'Enter') start();
        });
    </script>
</body>
</html>
        `);
    } else {
        res.sendFile(path.join(__dirname, 'public', 'simulation.html'));
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/set-api-key', (req, res) => {
    const { apiKey } = req.body;

    if (!apiKey || !apiKey.startsWith('sk-')) {
        return res.json({ ok: false, error: 'API key inválida' });
    }

    DEEPSEEK_KEY = apiKey;

    if (!simulationStarted) {
        initWorld();
        simulationStarted = true;

        // Auto-simulación cada 3 segundos
        simulationInterval = setInterval(async () => {
            try {
                await simulate();
            } catch (e) {
                console.error('Error simulación:', e.message);
            }
        }, 3000);
    }

    console.log('✅ API Key configurada. Simulación iniciada.');
    res.json({ ok: true });
});

app.get('/state', (req, res) => {
    res.json({
        time: world.time,
        agent: world.agent,
        objects: world.objects,
        pendulum: world.pendulum,
        fluid: world.fluid,
        running: simulationStarted,
        apiConfigured: !!DEEPSEEK_KEY
    });
});

app.get('/laws', (req, res) => {
    res.json({
        discovered: discoveredLaws,
        hypotheses: hypotheses,
        total: discoveredLaws.length
    });
});

app.get('/thoughts', (req, res) => {
    res.json(thoughtLog.slice(-20));
});

app.get('/experiments', (req, res) => {
    res.json(experimentLog.slice(-30));
});

app.get('/report', (req, res) => {
    const report = {
        summary: {
            simulationTime: world.time,
            lawsDiscovered: discoveredLaws.length,
            hypothesesFormed: hypotheses.length,
            experimentsRun: experimentLog.length,
            measurementsTaken: measurements.length,
            intuitionsGenerated: intuitions.length
        },
        discoveredLaws: discoveredLaws.map(l => ({
            name: l.name,
            formula: l.formula,
            evidence: l.evidence,
            novelty: l.novelty || '',
            confidence: l.confidence,
            discoveredAt: l.timestamp
        })),
        hypotheses: hypotheses,
        intuitions: intuitions,
        recentExperiments: experimentLog.slice(-20),
        measurements: measurements.slice(-30),
        thoughtProcess: thoughtLog.slice(-15).map(t => ({
            time: t.time,
            thinking: t.thinking,
            action: t.action?.type,
            intuition: t.intuition
        }))
    };
    res.json(report);
});

app.get('/intuitions', (req, res) => {
    res.json(intuitions);
});

app.post('/reset', (req, res) => {
    initWorld();
    res.json({ ok: true, message: 'Simulación reiniciada' });
});

app.post('/force-action', (req, res) => {
    const result = executeAction(req.body.action);
    res.json(result);
});

// ==================== SERVIDOR ====================
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║     🔬 PHYSICS DISCOVERY SIMULATOR                ║
║     AI descubre física mediante experimentación   ║
║     Powered by DeepSeek                           ║
╚═══════════════════════════════════════════════════╝

Servidor: http://localhost:${PORT}

Leyes a descubrir:
• Gravedad (g ≈ 9.81 m/s²)
• Segunda ley de Newton (F = ma)
• Fricción (depende del material)
• Período del péndulo (T = 2π√(L/g))
• Principio de Arquímedes (flotación)
• Conservación del momento
• Movimiento parabólico

`);
});
