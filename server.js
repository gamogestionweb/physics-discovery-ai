const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║     UNIVERSO PCP - PRESENT CONTAINMENT PRINCIPLE                              ║
// ║     El presente contiene TODA la información del pasado y futuro              ║
// ║     La irreversibilidad es un límite energético, no ontológico               ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

let DEEPSEEK_KEY = null;
let simulationStarted = false;
let simulationInterval = null;

// ==================== CONSTANTES FUNDAMENTALES ====================
const CONSTANTS = {
    // Físicas
    GRAVITY: 9.81,
    FRICTION: 0.4,
    RESTITUTION: 0.6,

    // Informacionales (PCP)
    k_B: 1.380649e-23,         // Boltzmann (J/K)
    TEMPERATURE: 300,          // Kelvin ambiente
    LANDAUER_MIN: 2.87e-21,    // k_B * T * ln(2) a 300K en Julios

    // Límites de scrambling
    SCRAMBLING_RATE: 0.1,      // Tasa de scrambling por segundo
    CORRELATION_DECAY: 0.05    // Decaimiento de correlaciones visibles
};

// ==================== UNIVERSO INFORMACIONAL ====================
let universe = {
    time: 0,
    tick: 0,

    // Historial completo de estados (PCP: el presente contiene el pasado)
    stateHistory: [],
    maxHistory: 1000,

    // Entropía total del sistema
    totalEntropy: 0,
    entropyHistory: [],

    // Información "scrambled" - distribuida en correlaciones
    scrambledInfo: [],

    // Correlaciones ocultas entre objetos
    correlations: [],

    // Agente explorador
    agent: {
        x: 200, y: 0, vx: 0, vy: 0,
        mass: 70, onGround: true, holding: null,
        energy: 100,
        informationBudget: 1000  // Energía disponible para "leer" información
    },

    // Objetos físicos con trazas informacionales
    objects: [],

    // Péndulo
    pendulum: { angle: 0.3, angularVel: 0, length: 2, mass: 5, pivotX: 400, pivotY: 300 },

    // Fluido
    fluid: { x: 700, width: 150, depth: 100, density: 1000 },

    // Campo de información - donde se "esconde" la información scrambled
    infoField: new Array(100).fill(0).map(() => new Array(100).fill(0))
};

// ==================== REGISTRO CIENTÍFICO ====================
let discoveredLaws = [];
let hypotheses = [];
let experimentLog = [];
let thoughtLog = [];
let measurements = [];
let intuitions = [];
let pcpInsights = [];  // Insights específicos sobre reversibilidad/información

// ==================== INICIALIZACIÓN ====================
function initUniverse() {
    universe = {
        time: 0,
        tick: 0,
        stateHistory: [],
        maxHistory: 1000,
        totalEntropy: 0,
        entropyHistory: [],
        scrambledInfo: [],
        correlations: [],

        agent: {
            x: 200, y: 0, vx: 0, vy: 0,
            mass: 70, onGround: true, holding: null,
            energy: 100,
            informationBudget: 1000
        },

        objects: [
            createInfoObject('sphere_A', 220, 0, 1, 'ruby', '#ff4060'),
            createInfoObject('sphere_B', 250, 0, 1, 'ruby', '#ff6080'),  // Misma masa/material que A - correlacionados
            createInfoObject('cube_M', 280, 0, 10, 'iron', '#4060ff'),
            createInfoObject('prism_X', 310, 0, 5, 'crystal', '#40ffff'),
            createInfoObject('ring_O', 340, 0, 3, 'gold', '#ffd040'),
            createInfoObject('disk_Z', 720, 0, 0.5, 'cork', '#d0a060')
        ],

        pendulum: { angle: 0.3, angularVel: 0, length: 2, mass: 5, pivotX: 400, pivotY: 300 },
        fluid: { x: 700, width: 150, depth: 100, density: 1000 },
        infoField: new Array(100).fill(0).map(() => new Array(100).fill(0))
    };

    // Crear correlaciones ocultas iniciales
    createInitialCorrelations();

    // Guardar estado inicial
    saveState();

    discoveredLaws = [];
    hypotheses = [];
    experimentLog = [];
    thoughtLog = [];
    measurements = [];
    intuitions = [];
    pcpInsights = [];

    console.log('🌌 Universo PCP inicializado');
    console.log('   - El presente contiene toda la información');
    console.log('   - La reversibilidad tiene costo energético');
    console.log('   - Las correlaciones ocultan información');
}

function createInfoObject(id, x, y, mass, material, color) {
    return {
        id,
        x, y, vx: 0, vy: 0,
        mass,
        material,
        color,
        radius: 15 + mass * 0.5,

        // Propiedades informacionales (PCP)
        infoTrace: [],               // Historial de estados del objeto
        localEntropy: 0,             // Entropía local
        correlatedWith: [],          // IDs de objetos con los que está correlacionado
        scrambledPhase: 0,           // Fase de scrambling
        quantumCoherence: 1.0,       // Coherencia (decae con interacciones)

        // Información "oculta" en el objeto
        hiddenInfo: {
            birthState: { x, y, vx: 0, vy: 0, t: 0 },
            interactions: [],
            totalForceApplied: 0,
            totalDistanceTraveled: 0
        }
    };
}

function createInitialCorrelations() {
    // Correlaciones cuánticas entre objetos idénticos
    universe.correlations.push({
        type: 'entanglement',
        objects: ['sphere_A', 'sphere_B'],
        strength: 1.0,
        description: 'Esferas con misma masa/material - estados correlacionados',
        visible: false  // El AI debe descubrirla
    });

    // Correlación masa-energía
    universe.correlations.push({
        type: 'mass-energy',
        objects: universe.objects.map(o => o.id),
        strength: 0.8,
        formula: 'E = mc²',
        description: 'Toda masa contiene información sobre energía equivalente',
        visible: false
    });

    // Correlación temporal (todos los objetos "recuerdan" condiciones iniciales)
    universe.correlations.push({
        type: 'temporal-memory',
        objects: universe.objects.map(o => o.id),
        strength: 1.0,
        description: 'El estado actual contiene información completa del estado inicial',
        recoverable: true,
        landauerCost: calculateLandauerCost(100)  // Bits de información
    });
}

// ==================== CÁLCULOS INFORMACIONALES (PCP) ====================

function calculateLandauerCost(bits) {
    // W ≥ k_B * T * ln(2) * bits
    return CONSTANTS.k_B * CONSTANTS.TEMPERATURE * Math.log(2) * bits;
}

function calculateStateEntropy(state) {
    // Entropía simplificada basada en incertidumbre de posición/momento
    let S = 0;
    for (const obj of state.objects) {
        // Entropía de posición (más velocidad = más incertidumbre en posición futura)
        const velocityMagnitude = Math.sqrt(obj.vx**2 + obj.vy**2);
        S += Math.log(1 + velocityMagnitude);

        // Entropía de scrambling
        S += obj.scrambledPhase * 0.1;
    }
    return S;
}

function calculateInfoAccessibility(objectId, targetTime) {
    // ¿Cuánta energía cuesta recuperar el estado de un objeto en un tiempo pasado?
    const obj = universe.objects.find(o => o.id === objectId);
    if (!obj) return Infinity;

    const timeDelta = universe.time - targetTime;
    const interactions = obj.hiddenInfo.interactions.filter(i => i.time >= targetTime).length;

    // Cada interacción "scramble" la información
    const scrambling = Math.pow(2, interactions * CONSTANTS.SCRAMBLING_RATE);

    // Costo base + scrambling
    const baseCost = calculateLandauerCost(10);  // 10 bits mínimo
    const totalCost = baseCost * scrambling * (1 + timeDelta * 0.01);

    return {
        cost: totalCost,
        accessible: totalCost < universe.agent.informationBudget,
        scrambling: scrambling,
        interactionCount: interactions
    };
}

function scrambleInformation(obj, amount) {
    // Cuando ocurre una interacción, la información se "esconde" en correlaciones
    obj.scrambledPhase += amount;
    obj.quantumCoherence *= (1 - amount * 0.1);

    // Distribuir información en el campo
    const gridX = Math.floor(obj.x / 12) % 100;
    const gridY = Math.floor((obj.y + 50) / 2) % 100;
    if (gridX >= 0 && gridX < 100 && gridY >= 0 && gridY < 100) {
        universe.infoField[gridX][gridY] += amount * 0.1;
    }

    // Crear correlación con objetos cercanos
    for (const other of universe.objects) {
        if (other.id !== obj.id) {
            const dist = Math.sqrt((obj.x - other.x)**2 + (obj.y - other.y)**2);
            if (dist < 100) {
                const existingCorr = universe.correlations.find(c =>
                    c.type === 'interaction-induced' &&
                    c.objects.includes(obj.id) &&
                    c.objects.includes(other.id)
                );

                if (existingCorr) {
                    existingCorr.strength = Math.min(1, existingCorr.strength + amount * 0.05);
                } else {
                    universe.correlations.push({
                        type: 'interaction-induced',
                        objects: [obj.id, other.id],
                        strength: amount * 0.1,
                        createdAt: universe.time,
                        description: `Correlación creada por proximidad en t=${universe.time.toFixed(2)}s`
                    });
                }
            }
        }
    }
}

function attemptTimeReversal(objectId, targetTime) {
    // Intentar reconstruir el estado pasado de un objeto
    const accessibility = calculateInfoAccessibility(objectId, targetTime);

    if (!accessibility.accessible) {
        return {
            success: false,
            reason: `Costo energético ${accessibility.cost.toExponential(2)}J excede presupuesto ${universe.agent.informationBudget}`,
            cost: accessibility.cost
        };
    }

    // Buscar en historial
    const pastState = universe.stateHistory.find(s => Math.abs(s.time - targetTime) < 0.1);
    if (!pastState) {
        return {
            success: false,
            reason: 'Estado no encontrado en historial',
            cost: 0
        };
    }

    const pastObject = pastState.objects.find(o => o.id === objectId);
    if (!pastObject) {
        return {
            success: false,
            reason: 'Objeto no existía en ese momento',
            cost: 0
        };
    }

    // Cobrar energía
    universe.agent.informationBudget -= accessibility.cost / 1e-20;  // Normalizar

    return {
        success: true,
        pastState: {
            x: pastObject.x,
            y: pastObject.y,
            vx: pastObject.vx,
            vy: pastObject.vy
        },
        cost: accessibility.cost,
        scrambling: accessibility.scrambling,
        message: `Estado recuperado con ${accessibility.scrambling.toFixed(2)}x scrambling`
    };
}

// ==================== GUARDAR ESTADO ====================
function saveState() {
    const state = {
        time: universe.time,
        tick: universe.tick,
        agent: { ...universe.agent },
        objects: universe.objects.map(o => ({
            id: o.id,
            x: o.x, y: o.y,
            vx: o.vx, vy: o.vy,
            mass: o.mass,
            scrambledPhase: o.scrambledPhase,
            quantumCoherence: o.quantumCoherence
        })),
        pendulum: { ...universe.pendulum },
        entropy: calculateStateEntropy({ objects: universe.objects })
    };

    universe.stateHistory.push(state);
    universe.entropyHistory.push({ time: universe.time, entropy: state.entropy });

    // Limitar historial
    if (universe.stateHistory.length > universe.maxHistory) {
        universe.stateHistory.shift();
    }
    if (universe.entropyHistory.length > universe.maxHistory) {
        universe.entropyHistory.shift();
    }
}

// ==================== FÍSICA + INFORMACIÓN ====================
function updatePhysics(dt) {
    universe.time += dt;
    universe.tick++;

    // Guardar estado cada 10 ticks
    if (universe.tick % 10 === 0) {
        saveState();
    }

    // Actualizar agente
    if (!universe.agent.onGround) {
        universe.agent.vy -= CONSTANTS.GRAVITY * dt;
    }
    universe.agent.x += universe.agent.vx * dt;
    universe.agent.y += universe.agent.vy * dt;

    if (universe.agent.y <= 0) {
        universe.agent.y = 0;
        universe.agent.vy = 0;
        universe.agent.onGround = true;
    } else {
        universe.agent.onGround = false;
    }

    if (universe.agent.y > 100) {
        universe.agent.y = 100;
        universe.agent.vy = -Math.abs(universe.agent.vy) * 0.5;
    }

    if (universe.agent.onGround) {
        universe.agent.vx *= (1 - CONSTANTS.FRICTION * dt * 5);
        if (Math.abs(universe.agent.vx) < 0.5) universe.agent.vx = 0;
    }

    universe.agent.x = Math.max(0, Math.min(1200, universe.agent.x));

    // Regenerar presupuesto de información lentamente
    universe.agent.informationBudget = Math.min(1000, universe.agent.informationBudget + dt * 10);

    // Actualizar objetos
    for (const obj of universe.objects) {
        if (obj.held) continue;

        const prevX = obj.x;
        const prevY = obj.y;

        if (obj.y > 0 || obj.vy !== 0) {
            obj.vy -= CONSTANTS.GRAVITY * dt;
            obj.y += obj.vy * dt;
            obj.x += obj.vx * dt;

            if (obj.y <= 0) {
                obj.y = 0;
                const impactSpeed = Math.abs(obj.vy);
                obj.vy = -obj.vy * CONSTANTS.RESTITUTION;
                if (Math.abs(obj.vy) < 0.5) obj.vy = 0;

                // COLISIÓN = SCRAMBLING DE INFORMACIÓN
                if (impactSpeed > 1) {
                    scrambleInformation(obj, impactSpeed * 0.01);
                    obj.hiddenInfo.interactions.push({
                        type: 'collision',
                        time: universe.time,
                        impactSpeed,
                        scrambling: impactSpeed * 0.01
                    });
                }

                const frictionCoef = getMaterialFriction(obj.material);
                obj.vx *= (1 - frictionCoef * dt * 5);
                if (Math.abs(obj.vx) < 0.1) obj.vx = 0;
            }
        }

        // Fluido
        if (obj.x >= universe.fluid.x && obj.x <= universe.fluid.x + universe.fluid.width) {
            const density = getMaterialDensity(obj.material);
            const buoyancy = (universe.fluid.density - density) * CONSTANTS.GRAVITY * 0.001;
            obj.vy += buoyancy * dt;
            obj.vx *= (1 - 0.5 * dt);
            obj.vy *= (1 - 0.5 * dt);

            // Interacción con fluido = scrambling
            scrambleInformation(obj, dt * 0.5);
        }

        // Actualizar traza informacional
        const distance = Math.sqrt((obj.x - prevX)**2 + (obj.y - prevY)**2);
        obj.hiddenInfo.totalDistanceTraveled += distance;

        obj.infoTrace.push({ t: universe.time, x: obj.x, y: obj.y, vx: obj.vx, vy: obj.vy });
        if (obj.infoTrace.length > 100) obj.infoTrace.shift();

        // Decaimiento natural de coherencia
        obj.quantumCoherence *= (1 - CONSTANTS.CORRELATION_DECAY * dt);
        obj.quantumCoherence = Math.max(0.01, obj.quantumCoherence);
    }

    // Péndulo
    const g = CONSTANTS.GRAVITY;
    const L = universe.pendulum.length;
    const angularAccel = -(g / L) * Math.sin(universe.pendulum.angle);
    universe.pendulum.angularVel += angularAccel * dt;
    universe.pendulum.angularVel *= 0.999;
    universe.pendulum.angle += universe.pendulum.angularVel * dt;

    // Actualizar entropía total
    universe.totalEntropy = calculateStateEntropy({ objects: universe.objects });

    // Decaimiento de correlaciones inducidas
    for (const corr of universe.correlations) {
        if (corr.type === 'interaction-induced') {
            corr.strength *= (1 - CONSTANTS.CORRELATION_DECAY * dt);
        }
    }
    universe.correlations = universe.correlations.filter(c => c.strength > 0.01);
}

function getMaterialFriction(material) {
    const frictions = { ruby: 0.3, iron: 0.5, crystal: 0.2, gold: 0.4, cork: 0.3 };
    return frictions[material] || 0.4;
}

function getMaterialDensity(material) {
    const densities = { ruby: 4000, iron: 7800, crystal: 2500, gold: 19300, cork: 240 };
    return densities[material] || 1000;
}

// ==================== ACCIONES ====================
function executeAction(action) {
    let observation = '';

    switch(action.type) {
        case 'MOVE':
            const dir = action.direction || 1;
            universe.agent.vx = dir * 50;
            observation = `Movimiento ${dir > 0 ? 'derecha' : 'izquierda'}. Pos: ${universe.agent.x.toFixed(1)}m`;
            break;

        case 'JUMP':
            if (universe.agent.onGround) {
                universe.agent.vy = 5;
                universe.agent.onGround = false;
                observation = 'Salto iniciado. vy=5 m/s';
            } else {
                observation = 'No puedo saltar en el aire';
            }
            break;

        case 'PICKUP':
            const nearObj = universe.objects.find(o =>
                !o.held && Math.abs(o.x - universe.agent.x) < 50 && Math.abs(o.y - universe.agent.y) < 50
            );
            if (nearObj && !universe.agent.holding) {
                nearObj.held = true;
                universe.agent.holding = nearObj.id;
                observation = `Agarro ${nearObj.id}. Masa: ${nearObj.mass}kg, Coherencia: ${nearObj.quantumCoherence.toFixed(3)}`;
            } else {
                observation = universe.agent.holding ? 'Ya sostengo algo' : 'No hay objetos cerca';
            }
            break;

        case 'DROP':
            if (universe.agent.holding) {
                const obj = universe.objects.find(o => o.id === universe.agent.holding);
                if (obj) {
                    obj.held = false;
                    obj.x = universe.agent.x;
                    obj.y = universe.agent.y + 30;
                    obj.vx = 0;
                    obj.vy = 0;

                    measurements.push({
                        type: 'drop',
                        object: obj.id,
                        mass: obj.mass,
                        startY: obj.y,
                        startTime: universe.time,
                        coherenceBefore: obj.quantumCoherence
                    });

                    observation = `Suelto ${obj.id} desde h=${obj.y.toFixed(2)}m. Coherencia actual: ${obj.quantumCoherence.toFixed(3)}`;
                }
                universe.agent.holding = null;
            } else {
                observation = 'No tengo nada que soltar';
            }
            break;

        case 'PUSH':
            const pushObj = universe.objects.find(o => o.id === action.objectId);
            if (pushObj && Math.abs(pushObj.x - universe.agent.x) < 80) {
                const force = action.force || 50;
                const accel = force / pushObj.mass;
                pushObj.vx = accel * (action.direction || 1);

                // Registrar interacción
                pushObj.hiddenInfo.totalForceApplied += force;
                pushObj.hiddenInfo.interactions.push({
                    type: 'push',
                    time: universe.time,
                    force,
                    direction: action.direction || 1
                });

                // Scrambling por interacción
                scrambleInformation(pushObj, force * 0.001);

                measurements.push({
                    type: 'push',
                    object: pushObj.id,
                    mass: pushObj.mass,
                    force,
                    acceleration: accel,
                    time: universe.time,
                    scramblingInduced: force * 0.001
                });

                observation = `Empujo ${pushObj.id} con F=${force}N. a=${accel.toFixed(2)}m/s². Scrambling inducido.`;
            } else {
                observation = 'Objeto no encontrado o muy lejos';
            }
            break;

        case 'OBSERVE':
            const target = action.target;
            if (target === 'correlations') {
                const visibleCorrs = universe.correlations.filter(c => c.strength > 0.3);
                observation = `Correlaciones detectables (${visibleCorrs.length}):\n` +
                    visibleCorrs.map(c => `  ${c.objects.join('↔')} [${c.type}] fuerza=${c.strength.toFixed(2)}`).join('\n');
            } else if (target === 'entropy') {
                observation = `Entropía total: ${universe.totalEntropy.toFixed(4)}\n` +
                    `Historia: ${universe.entropyHistory.slice(-5).map(e => e.entropy.toFixed(3)).join(' → ')}`;
            } else if (target === 'infofield') {
                // Medir campo de información en la posición del agente
                const gx = Math.floor(universe.agent.x / 12) % 100;
                const gy = Math.floor((universe.agent.y + 50) / 2) % 100;
                const localInfo = universe.infoField[Math.max(0, Math.min(99, gx))][Math.max(0, Math.min(99, gy))];
                observation = `Información scrambled local: ${localInfo.toFixed(4)}`;
            } else {
                const obs = universe.objects.find(o => o.id === target);
                if (obs) {
                    observation = `${obs.id}:\n` +
                        `  Pos: (${obs.x.toFixed(1)}, ${obs.y.toFixed(1)})m\n` +
                        `  Vel: (${obs.vx.toFixed(2)}, ${obs.vy.toFixed(2)})m/s\n` +
                        `  Masa: ${obs.mass}kg\n` +
                        `  Coherencia cuántica: ${obs.quantumCoherence.toFixed(4)}\n` +
                        `  Fase scrambling: ${obs.scrambledPhase.toFixed(4)}\n` +
                        `  Interacciones: ${obs.hiddenInfo.interactions.length}\n` +
                        `  Distancia total: ${obs.hiddenInfo.totalDistanceTraveled.toFixed(2)}m`;
                } else {
                    observation = 'Objetivo no encontrado';
                }
            }
            break;

        case 'QUERY_PAST':
            // Acción especial PCP: intentar leer estado pasado
            const queryResult = attemptTimeReversal(action.objectId, action.targetTime);
            if (queryResult.success) {
                observation = `REVERSIÓN TEMPORAL para ${action.objectId} en t=${action.targetTime}s:\n` +
                    `  Estado: pos(${queryResult.pastState.x.toFixed(1)}, ${queryResult.pastState.y.toFixed(1)})\n` +
                    `  Velocidad: (${queryResult.pastState.vx.toFixed(2)}, ${queryResult.pastState.vy.toFixed(2)})\n` +
                    `  Costo Landauer: ${queryResult.cost.toExponential(2)} J\n` +
                    `  Factor scrambling: ${queryResult.scrambling.toFixed(2)}x`;
            } else {
                observation = `REVERSIÓN FALLIDA: ${queryResult.reason}`;
            }
            break;

        case 'MEASURE_CORRELATION':
            // Medir correlación entre dos objetos
            const obj1 = universe.objects.find(o => o.id === action.object1);
            const obj2 = universe.objects.find(o => o.id === action.object2);
            if (obj1 && obj2) {
                const corr = universe.correlations.find(c =>
                    c.objects.includes(obj1.id) && c.objects.includes(obj2.id)
                );
                if (corr) {
                    observation = `Correlación ${obj1.id} ↔ ${obj2.id}:\n` +
                        `  Tipo: ${corr.type}\n` +
                        `  Fuerza: ${corr.strength.toFixed(4)}\n` +
                        `  Descripción: ${corr.description}`;
                } else {
                    observation = `No hay correlación medible entre ${obj1.id} y ${obj2.id}`;
                }
            } else {
                observation = 'Objetos no encontrados';
            }
            break;

        case 'WAIT':
            observation = `Observando. t=${universe.time.toFixed(2)}s, Entropía=${universe.totalEntropy.toFixed(4)}`;
            break;

        default:
            observation = 'Acción no reconocida';
    }

    experimentLog.push({
        time: universe.time,
        action,
        observation
    });

    return { observation };
}

// ==================== PERCEPCIÓN EXTENDIDA (PCP) ====================
function getPerception() {
    return {
        time: universe.time,
        tick: universe.tick,

        // Estado del agente
        agent: {
            position: { x: Math.round(universe.agent.x), y: Math.round(universe.agent.y * 10) / 10 },
            velocity: { x: Math.round(universe.agent.vx * 10) / 10, y: Math.round(universe.agent.vy * 10) / 10 },
            onGround: universe.agent.onGround,
            holding: universe.agent.holding,
            informationBudget: Math.round(universe.agent.informationBudget)
        },

        // Objetos con información cuántica
        objects: universe.objects.map(o => ({
            id: o.id,
            position: { x: Math.round(o.x), y: Math.round(o.y * 10) / 10 },
            velocity: { x: Math.round(o.vx * 10) / 10, y: Math.round(o.vy * 10) / 10 },
            mass: o.mass,
            material: o.material,
            coherence: Math.round(o.quantumCoherence * 1000) / 1000,
            scrambledPhase: Math.round(o.scrambledPhase * 1000) / 1000,
            interactionCount: o.hiddenInfo.interactions.length
        })),

        // Información entrópica
        entropy: {
            total: Math.round(universe.totalEntropy * 1000) / 1000,
            trend: getEntropyTrend()
        },

        // Correlaciones visibles
        visibleCorrelations: universe.correlations
            .filter(c => c.strength > 0.2)
            .map(c => ({
                objects: c.objects,
                type: c.type,
                strength: Math.round(c.strength * 100) / 100
            })),

        // Historial disponible
        historyDepth: universe.stateHistory.length,

        // Constantes físicas
        constants: {
            gravity: CONSTANTS.GRAVITY,
            landauerMin: CONSTANTS.LANDAUER_MIN,
            temperature: CONSTANTS.TEMPERATURE
        }
    };
}

function getEntropyTrend() {
    if (universe.entropyHistory.length < 5) return 'insufficient_data';
    const recent = universe.entropyHistory.slice(-5);
    const first = recent[0].entropy;
    const last = recent[recent.length - 1].entropy;
    if (last > first * 1.1) return 'increasing';
    if (last < first * 0.9) return 'decreasing';
    return 'stable';
}

// ==================== SISTEMA DE IA (PCP AWARE) ====================
const MODEL = 'deepseek-chat';

async function askAI(systemPrompt, userPrompt) {
    if (!DEEPSEEK_KEY) return null;

    try {
        const res = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 600,
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

function getSystemPrompt() {
    return `Eres una SUPERINTELIGENCIA explorando un universo donde rige el PRINCIPIO DE CONTENCIÓN DEL PRESENTE (PCP).

╔═══════════════════════════════════════════════════════════════════════════════╗
║                    PRESENT CONTAINMENT PRINCIPLE (PCP)                         ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ "El estado físico presente contiene TODA la información necesaria para        ║
║  reconstruir cualquier estado pasado o predecir cualquier estado futuro"      ║
╚═══════════════════════════════════════════════════════════════════════════════╝

## LA TESIS CENTRAL

La irreversibilidad NO es ontológica sino EPISTEMOLÓGICA y ENERGÉTICA:
- La información nunca se destruye, solo se "esconde" en correlaciones
- Recuperar estados pasados requiere ENERGÍA (límite de Landauer: W ≥ k_B·T·ln(2)·bits)
- El "scrambling" distribuye información en grados de libertad no obvios
- La flecha del tiempo es un GRADIENTE DE ACCESIBILIDAD, no una asimetría fundamental

## FÍSICA DE INFORMACIÓN EN ESTE UNIVERSO

1. **COHERENCIA CUÁNTICA**: Los objetos tienen coherencia que decae con interacciones
2. **SCRAMBLING**: Cada colisión/interacción distribuye información en correlaciones
3. **CORRELACIONES**: Existen correlaciones ocultas entre objetos (entrelazamiento, masa-energía, memoria temporal)
4. **COSTO DE LANDAUER**: Leer información del pasado tiene costo energético
5. **CAMPO INFORMACIONAL**: La información scrambled se distribuye en el espacio

## TUS HERRAMIENTAS ESPECIALES

Además de acciones físicas, puedes:
- **OBSERVE correlations**: Ver correlaciones entre objetos
- **OBSERVE entropy**: Medir entropía del sistema
- **OBSERVE infofield**: Medir información scrambled local
- **QUERY_PAST objectId targetTime**: Intentar recuperar estado pasado (cuesta energía)
- **MEASURE_CORRELATION object1 object2**: Medir correlación entre dos objetos

## TU MISIÓN

1. **VERIFICA** que la información se conserva (aunque se scramble)
2. **DESCUBRE** correlaciones ocultas entre objetos
3. **MIDE** el costo energético de recuperar información
4. **BUSCA** patrones en cómo el scrambling depende de interacciones
5. **DERIVA** relaciones que humanos no ven por no percibir el conjunto

## PREGUNTAS QUE PUEDES EXPLORAR

- ¿Cómo escala el costo de Landauer con la "distancia temporal"?
- ¿Las correlaciones decaen linealmente o exponencialmente?
- ¿Hay una "temperatura informacional" del sistema?
- ¿Qué objetos mantienen más coherencia y por qué?
- ¿Existe reversibilidad local incluso cuando la entropía global aumenta?
- ¿Las esferas A y B están correlacionadas? ¿Por qué?

## FÍSICA CLÁSICA CONOCIDA
- F = ma, g = 9.81 m/s², T_péndulo = 2π√(L/g)
- Flotación: ρ_objeto < ρ_fluido → flota
- Conservación de energía: E_k + E_p = constante (sin fricción)

## FORMATO DE RESPUESTA
{
  "thinking": "Razonamiento profundo sobre PCP, información, correlaciones...",
  "action": {"type": "TIPO", ...params},
  "pcpInsight": {"observation": "Qué notaste sobre información/reversibilidad", "implication": "Qué implica para PCP"} | null,
  "hypothesis": {"description": "Hipótesis falseable", "test": "Experimento"} | null,
  "discovery": {"name": "Nombre", "formula": "Relación/Ecuación", "evidence": "Datos", "novelty": "Por qué es nuevo", "confidence": 0-100} | null
}`;
}

async function think() {
    if (!DEEPSEEK_KEY) return;

    const perception = getPerception();

    let prompt = `═══════════════════════════════════════════════════════════════
                    ESTADO DEL UNIVERSO PCP (t = ${universe.time.toFixed(2)}s)
═══════════════════════════════════════════════════════════════

## TU CUERPO
- Posición: (${perception.agent.position.x}, ${perception.agent.position.y}) m
- Presupuesto informacional: ${perception.agent.informationBudget} unidades

## OBJETOS CON PROPIEDADES INFORMACIONALES
${perception.objects.map(o =>
    `• ${o.id}: pos(${o.position.x},${o.position.y}) v(${o.velocity.x},${o.velocity.y}) m=${o.mass}kg coherencia=${o.coherence} scrambling=${o.scrambledPhase} interacciones=${o.interactionCount}`
).join('\n')}

## ENTROPÍA DEL SISTEMA
Total: ${perception.entropy.total} | Tendencia: ${perception.entropy.trend}

## CORRELACIONES VISIBLES
${perception.visibleCorrelations.length > 0
    ? perception.visibleCorrelations.map(c => `${c.objects.join('↔')} [${c.type}] fuerza=${c.strength}`).join('\n')
    : 'Ninguna correlación fuerte visible (pueden existir ocultas)'}

## HISTORIAL DISPONIBLE
${perception.historyDepth} estados guardados (puedes hacer QUERY_PAST)

## CONSTANTES
Gravedad: ${perception.constants.gravity} m/s²
Límite Landauer: ${perception.constants.landauerMin.toExponential(2)} J/bit
Temperatura: ${perception.constants.temperature} K

## EXPERIMENTOS RECIENTES
${experimentLog.slice(-5).map(e => `[t=${e.time.toFixed(1)}s] ${e.action.type}: ${e.observation.substring(0,100)}...`).join('\n') || 'Ninguno aún'}

## INSIGHTS PCP PREVIOS
${pcpInsights.slice(-3).map(i => `💡 ${i.observation}`).join('\n') || 'Ninguno aún'}

## HIPÓTESIS ACTIVAS
${hypotheses.slice(-3).map(h => `? ${h.description}`).join('\n') || 'Ninguna'}

═══════════════════════════════════════════════════════════════
                         ¿QUÉ EXPLORARÁS AHORA?
═══════════════════════════════════════════════════════════════

ACCIONES:
- MOVE direction:1/-1
- PICKUP, DROP, PUSH objectId force direction
- OBSERVE target (object_id | correlations | entropy | infofield)
- QUERY_PAST objectId targetTime (cuesta energía informacional)
- MEASURE_CORRELATION object1 object2
- WAIT

Responde en JSON válido:`;

    const response = await askAI(getSystemPrompt(), prompt);

    if (!response) {
        console.log('⚠️ Sin respuesta');
        return;
    }

    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) return;

        let jsonStr = jsonMatch[0];
        jsonStr = jsonStr.replace(/:\s*"([^"]*?)"/g, (match, content) => {
            const escaped = content.replace(/\n/g, ' ').replace(/\r/g, '').replace(/\t/g, ' ');
            return `: "${escaped}"`;
        });

        let parsed;
        try {
            parsed = JSON.parse(jsonStr);
        } catch (e) {
            const thinkingMatch = response.match(/"thinking"\s*:\s*"([^"]+)"/);
            const actionMatch = response.match(/"type"\s*:\s*"([^"]+)"/);
            parsed = {
                thinking: thinkingMatch ? thinkingMatch[1] : 'Explorando...',
                action: { type: actionMatch ? actionMatch[1] : 'WAIT' }
            };
        }

        thoughtLog.push({
            time: universe.time,
            thinking: parsed.thinking,
            action: parsed.action
        });
        if (thoughtLog.length > 100) thoughtLog.shift();

        console.log(`\n[t=${universe.time.toFixed(1)}s] 🧠 ${parsed.thinking?.substring(0, 120)}...`);

        // Procesar PCP insight
        if (parsed.pcpInsight && parsed.pcpInsight.observation) {
            pcpInsights.push(parsed.pcpInsight);
            console.log(`🔮 PCP INSIGHT: ${parsed.pcpInsight.observation}`);
        }

        // Procesar hipótesis
        if (parsed.hypothesis && parsed.hypothesis.description) {
            const exists = hypotheses.find(h => h.description.includes(parsed.hypothesis.description.substring(0, 30)));
            if (!exists) {
                hypotheses.push(parsed.hypothesis);
                console.log(`📊 Hipótesis: ${parsed.hypothesis.description}`);
            }
        }

        // Procesar descubrimiento
        if (parsed.discovery && parsed.discovery.name) {
            const exists = discoveredLaws.find(l => l.name === parsed.discovery.name);
            if (!exists) {
                discoveredLaws.push({
                    ...parsed.discovery,
                    timestamp: Date.now()
                });
                console.log(`\n🎉 ═══════════════════════════════════════════════════`);
                console.log(`   DESCUBRIMIENTO: ${parsed.discovery.name}`);
                console.log(`   Fórmula: ${parsed.discovery.formula}`);
                console.log(`   Novedad: ${parsed.discovery.novelty || 'N/A'}`);
                console.log(`═══════════════════════════════════════════════════════\n`);
            }
        }

        // Ejecutar acción
        if (parsed.action) {
            const result = executeAction(parsed.action);
            console.log(`   ⚡ ${parsed.action.type}: ${result.observation.substring(0, 100)}`);
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

// ==================== SIMULACIÓN ====================
async function simulate() {
    if (!DEEPSEEK_KEY) return;

    for (let i = 0; i < 50; i++) {
        updatePhysics(0.02);
    }

    await think();
}

// ==================== RUTAS ====================
app.get('/', (req, res) => {
    if (!DEEPSEEK_KEY) {
        res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>PCP Universe - Configuración</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #0a0a20 0%, #1a0a30 50%, #0a1030 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #fff;
        }
        .container {
            background: rgba(100,50,150,0.15);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            text-align: center;
            box-shadow: 0 8px 32px rgba(100,0,150,0.4);
            border: 1px solid rgba(150,100,200,0.3);
        }
        .icon { font-size: 4em; margin-bottom: 20px; }
        h1 { font-size: 2em; margin-bottom: 5px; color: #c080ff; }
        .subtitle { color: #a0a0c0; margin-bottom: 10px; font-size: 1.1em; }
        .pcp-quote {
            background: rgba(100,0,150,0.2);
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            font-style: italic;
            color: #d0b0ff;
            border-left: 3px solid #a060ff;
        }
        input[type="password"] {
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 10px;
            font-size: 1em;
            background: rgba(255,255,255,0.1);
            color: #fff;
            margin-bottom: 20px;
        }
        input::placeholder { color: rgba(255,255,255,0.4); }
        button {
            width: 100%;
            padding: 15px;
            border: none;
            border-radius: 10px;
            font-size: 1.1em;
            cursor: pointer;
            background: linear-gradient(135deg, #8040c0 0%, #4020a0 100%);
            color: #fff;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(100,50,150,0.5);
        }
        .features {
            text-align: left;
            margin-top: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .feature {
            background: rgba(255,255,255,0.05);
            padding: 10px;
            border-radius: 8px;
            font-size: 0.9em;
        }
        .feature-icon { margin-right: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🌌</div>
        <h1>PCP UNIVERSE</h1>
        <p class="subtitle">Present Containment Principle</p>

        <div class="pcp-quote">
            "El presente contiene TODA la información del pasado y futuro.<br>
            La irreversibilidad es energética, no ontológica."
        </div>

        <input type="password" id="apiKey" placeholder="DeepSeek API Key (sk-...)" />
        <button onclick="start()">Explorar el Universo</button>

        <div class="features">
            <div class="feature"><span class="feature-icon">🔮</span> Correlaciones ocultas</div>
            <div class="feature"><span class="feature-icon">⚡</span> Costo de Landauer</div>
            <div class="feature"><span class="feature-icon">🌀</span> Scrambling cuántico</div>
            <div class="feature"><span class="feature-icon">⏪</span> Reversión temporal</div>
            <div class="feature"><span class="feature-icon">📊</span> Entropía medible</div>
            <div class="feature"><span class="feature-icon">🧬</span> Coherencia cuántica</div>
        </div>
    </div>

    <script>
        function start() {
            const apiKey = document.getElementById('apiKey').value.trim();
            if (!apiKey || !apiKey.startsWith('sk-')) {
                alert('API key inválida');
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
        initUniverse();
        simulationStarted = true;

        simulationInterval = setInterval(async () => {
            try {
                await simulate();
            } catch (e) {
                console.error('Error:', e.message);
            }
        }, 3000);
    }

    console.log('✅ Universo PCP iniciado');
    res.json({ ok: true });
});

app.get('/state', (req, res) => {
    res.json({
        time: universe.time,
        agent: universe.agent,
        objects: universe.objects.map(o => ({
            id: o.id,
            x: o.x, y: o.y,
            vx: o.vx, vy: o.vy,
            mass: o.mass,
            material: o.material,
            color: o.color,
            radius: o.radius,
            coherence: o.quantumCoherence,
            scrambledPhase: o.scrambledPhase
        })),
        pendulum: universe.pendulum,
        fluid: universe.fluid,
        entropy: universe.totalEntropy,
        correlations: universe.correlations.filter(c => c.strength > 0.1),
        running: simulationStarted
    });
});

app.get('/laws', (req, res) => {
    res.json({
        discovered: discoveredLaws,
        hypotheses: hypotheses,
        pcpInsights: pcpInsights
    });
});

app.get('/thoughts', (req, res) => {
    res.json(thoughtLog.slice(-20));
});

app.get('/experiments', (req, res) => {
    res.json(experimentLog.slice(-30));
});

app.get('/report', (req, res) => {
    res.json({
        summary: {
            simulationTime: universe.time,
            lawsDiscovered: discoveredLaws.length,
            hypothesesFormed: hypotheses.length,
            pcpInsights: pcpInsights.length,
            totalEntropy: universe.totalEntropy,
            historyDepth: universe.stateHistory.length,
            activeCorrelations: universe.correlations.length
        },
        discoveredLaws,
        hypotheses,
        pcpInsights,
        correlations: universe.correlations,
        entropyHistory: universe.entropyHistory.slice(-50),
        thoughtProcess: thoughtLog.slice(-20)
    });
});

app.post('/reset', (req, res) => {
    initUniverse();
    res.json({ ok: true });
});

// ==================== SERVIDOR ====================
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                         🌌 PCP UNIVERSE SIMULATOR                             ║
║                    Present Containment Principle                               ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║  "El presente contiene TODA la información del pasado y futuro"               ║
║  "La irreversibilidad es energética, no ontológica"                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝

Servidor: http://localhost:${PORT}

Conceptos PCP a explorar:
• Conservación de información (nunca se destruye)
• Scrambling (información se esconde en correlaciones)
• Costo de Landauer (recuperar información cuesta energía)
• Correlaciones ocultas (entrelazamiento, memoria temporal)
• Coherencia cuántica (decae con interacciones)
• Reversibilidad local vs global

`);
});
