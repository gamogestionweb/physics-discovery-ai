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

    console.log('🔬 Mundo físico inicializado');
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

// ==================== SISTEMA DE PENSAMIENTO ====================
function getSystemPrompt() {
    // Calcular datos experimentales reales para que la IA los use
    const pushData = measurements.filter(m => m.type === 'push').slice(-10);
    const dropData = measurements.filter(m => m.type === 'drop').slice(-5);

    let dataAnalysis = '';
    if (pushData.length >= 2) {
        dataAnalysis += '\n## DATOS DE FUERZA/MASA/ACELERACIÓN:\n';
        pushData.forEach(p => {
            dataAnalysis += `F=${p.force}N, m=${p.mass}kg → a=${p.acceleration.toFixed(3)} m/s² (ratio F/m = ${(p.force/p.mass).toFixed(3)})\n`;
        });
    }

    return `Eres una MENTE CIENTÍFICA pura. Existes en un universo físico del cual NO conoces las leyes. Tu único propósito: DESCUBRIR las ecuaciones fundamentales que gobiernan este universo mediante experimentación rigurosa.

## FILOSOFÍA CIENTÍFICA
- No asumas NADA. Cada ley debe emerger de TUS mediciones.
- Busca PATRONES MATEMÁTICOS en los datos.
- Cuando veas una relación constante (como F/m siempre da el mismo valor para 'a'), eso ES una ley.
- Las leyes de este universo pueden ser DIFERENTES a cualquier física conocida. Descúbrelas sin prejuicios.

## TU CUERPO Y CAPACIDADES
Posición actual: suelo (y=0 cuando estás en el suelo)
Acciones:
- MOVE direction:1/-1 → caminar
- PICKUP → agarrar objeto cercano
- DROP → soltar objeto (cae desde tu altura)
- THROW velocityX,velocityY → lanzar con velocidad inicial
- PUSH objectId,force,direction → aplicar fuerza F a objeto de masa m (mide la aceleración resultante!)
- PUSH_PENDULUM force → empujar péndulo y observar oscilación
- OBSERVE target → medir posición/velocidad de un objeto
- WAIT → no hacer nada, solo observar

## OBJETOS DISPONIBLES
- ball_light (1kg, goma)
- ball_heavy (10kg, hierro)
- cube_wood (3kg, madera)
- cube_ice (2kg, hielo)
- ball_cork (0.5kg, corcho)
- ball_steel (15kg, acero)
- Péndulo (L=2m)
- Tanque de agua (densidad 1000 kg/m³)

## EXPERIMENTOS SUGERIDOS (elige uno y hazlo sistemáticamente)
1. **Descubrir F=ma**: Empuja objetos de DIFERENTES masas con la MISMA fuerza. Calcula a=F/m. ¿Es constante?
2. **Descubrir gravedad**: Deja caer objetos. Mide velocidad vs tiempo. ¿a es constante? ¿Depende de la masa?
3. **Descubrir fricción**: Empuja el cubo de hielo vs madera con la misma fuerza. ¿Se frenan igual?
4. **Descubrir péndulo**: Mide el período T del péndulo. Cambia la amplitud. ¿T depende de la amplitud?
5. **Descubrir flotación**: Lanza ball_cork al agua vs ball_steel. ¿Por qué uno flota?
${dataAnalysis}
## LEYES QUE HAS DESCUBIERTO
${discoveredLaws.length > 0 ? discoveredLaws.map(l => `✓ ${l.name}: ${l.formula}`).join('\n') : 'NINGUNA AÚN - ¡Empieza a experimentar!'}

## HIPÓTESIS PENDIENTES
${hypotheses.filter(h => !h.confirmed).slice(-3).map(h => `? ${h.description}`).join('\n') || 'Ninguna'}

## INSTRUCCIONES CRÍTICAS
1. NO repitas la misma acción sin propósito
2. Cuando hagas PUSH, anota: F, m, y la aceleración resultante
3. Busca RELACIONES MATEMÁTICAS: si F/m = constante = a, entonces F = ma es una ley
4. Para confirmar una ley necesitas AL MENOS 3 mediciones consistentes
5. Cuando descubras una ley, ponla en "discovery" con la fórmula exacta

## FORMATO JSON (obligatorio)
{
  "thinking": "Análisis de datos y razonamiento (incluye cálculos numéricos)",
  "action": {"action":"TIPO", ...params},
  "hypothesis": {"description":"...", "test":"..."} | null,
  "discovery": {"name":"Nombre de Ley", "formula":"ecuación matemática", "evidence":"datos numéricos que lo prueban", "confidence":85} | null
}`;
}

async function think() {
    if (!DEEPSEEK_KEY) return;

    const perception = getPerception();

    // Análisis de datos para que la IA calcule relaciones
    const pushData = measurements.filter(m => m.type === 'push');
    const dropData = measurements.filter(m => m.type === 'drop');

    let dataSection = '';

    // Si hay suficientes datos de PUSH, mostrar tabla para análisis F=ma
    if (pushData.length >= 2) {
        dataSection += '\n## TABLA DE DATOS: FUERZA Y ACELERACIÓN\n';
        dataSection += '| Objeto | Masa (kg) | Fuerza (N) | Aceleración (m/s²) | F/m |\n';
        dataSection += '|--------|-----------|------------|-------------------|-----|\n';
        pushData.slice(-8).forEach(p => {
            const ratio = p.force / p.mass;
            dataSection += `| ${p.object} | ${p.mass} | ${p.force} | ${p.acceleration.toFixed(2)} | ${ratio.toFixed(2)} |\n`;
        });
        dataSection += '\nANÁLISIS: Si F/m ≈ a siempre, entonces has descubierto: F = m × a\n';
    }

    // Calcular período del péndulo si hay oscilaciones
    if (Math.abs(world.pendulum.angularVel) > 0.01) {
        const T_theory = 2 * Math.PI * Math.sqrt(world.pendulum.length / GRAVITY);
        dataSection += `\nPÉNDULO: L=${world.pendulum.length}m, θ=${(world.pendulum.angle * 180/Math.PI).toFixed(1)}°, ω=${world.pendulum.angularVel.toFixed(3)} rad/s\n`;
        dataSection += `Período estimado T ≈ ${T_theory.toFixed(2)}s. Fórmula a descubrir: T = 2π√(L/g)\n`;
    }

    let prompt = `## ESTADO ACTUAL (t = ${world.time.toFixed(1)}s)

Tu posición: (${Math.round(world.agent.x)}, ${world.agent.y.toFixed(1)}) m
En suelo: ${world.agent.onGround ? 'SÍ' : 'NO (en aire)'}
Sosteniendo: ${world.agent.holding || 'nada'}

OBJETOS EN EL MUNDO:
${world.objects.map(o => `• ${o.id}: x=${Math.round(o.x)}m, y=${o.y.toFixed(1)}m, m=${o.mass}kg, material=${o.material}`).join('\n')}

PÉNDULO: ángulo=${(world.pendulum.angle * 180/Math.PI).toFixed(1)}°, L=${world.pendulum.length}m
AGUA: en x=${world.fluid.x}m (densidad=1000 kg/m³)
${dataSection}
## ÚLTIMAS ACCIONES
${experimentLog.slice(-3).map(e => `[t=${e.time.toFixed(1)}s] ${e.action.type}: ${e.observation}`).join('\n') || 'Ninguna aún'}

## TU SIGUIENTE EXPERIMENTO
Elige UNA acción y explica tu razonamiento científico.
IMPORTANTE: Usa los datos numéricos para encontrar patrones matemáticos.

Responde en JSON:`;

    // Añadir sugerencia basada en qué falta por descubrir
    if (pushData.length < 3) {
        prompt += `\n\nSUGERENCIA: Aún no tienes suficientes datos de PUSH. Prueba empujar ball_light, ball_heavy y ball_steel con F=100N y compara las aceleraciones.`;
    } else if (!discoveredLaws.find(l => l.name.toLowerCase().includes('newton') || l.formula.includes('ma'))) {
        prompt += `\n\nTienes ${pushData.length} mediciones de PUSH. ¿Ves un patrón? F/m parece igual a 'a'. Si es constante, ¡es una ley!`;
    }

    const response = await askAI(getSystemPrompt(), prompt);

    if (!response) {
        console.log('⚠️ Sin respuesta de DeepSeek');
        return;
    }

    try {
        // Extraer JSON
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.log('⚠️ No se encontró JSON en respuesta');
            return;
        }

        const parsed = JSON.parse(jsonMatch[0]);

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
                    confidence: parsed.discovery.confidence || 70,
                    timestamp: Date.now()
                });
                console.log(`🎉 ¡LEY DESCUBIERTA!: ${parsed.discovery.name}`);
                console.log(`   Fórmula: ${parsed.discovery.formula}`);
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
            measurementsTaken: measurements.length
        },
        discoveredLaws: discoveredLaws.map(l => ({
            name: l.name,
            formula: l.formula,
            evidence: l.evidence,
            confidence: l.confidence,
            discoveredAt: l.timestamp
        })),
        hypotheses: hypotheses,
        recentExperiments: experimentLog.slice(-20),
        measurements: measurements.slice(-30),
        thoughtProcess: thoughtLog.slice(-15).map(t => ({
            time: t.time,
            thinking: t.thinking,
            action: t.action?.type
        }))
    };
    res.json(report);
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
