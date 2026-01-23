/**
 * EXPLORATION WORLD
 * A rich sandbox for agents to explore, experiment, and discover
 * Contains real observational data, experimental setups, and simulation capabilities
 */

class ExplorationWorld {
  constructor() {
    this.time = 0;
    this.experiments = new Map();
    this.discoveries = [];
    this.observationalData = this.initializeObservationalData();
    this.simulationEngine = new SimulationEngine();
    this.experimentalSetups = this.initializeExperiments();
  }

  // ═══════════════════════════════════════════════════════════════════
  // OBSERVATIONAL DATA FROM THE REAL UNIVERSE
  // ═══════════════════════════════════════════════════════════════════
  initializeObservationalData() {
    return {

      // Galaxy rotation curves (real data patterns)
      galaxyRotations: {
        description: "Observed rotation velocities don't match visible mass predictions",
        data: this.generateGalaxyRotationData(),
        expectedFromVisibleMass: (r) => Math.sqrt(1/r), // Keplerian falloff
        observed: (r) => r < 5 ? Math.sqrt(r/5) : 1.0,  // Flat rotation curve
        discrepancy: "Factor of 5-10 more mass needed",
        explore: ["What causes flat rotation curves?", "Is there unseen mass?", "Is gravity different at large scales?"]
      },

      // Cosmic Microwave Background
      cmbData: {
        description: "Afterglow of Big Bang, 380,000 years after",
        temperature: 2.725,
        fluctuations: this.generateCMBFluctuations(),
        powerSpectrum: this.generateCMBPowerSpectrum(),
        anomalies: {
          coldSpot: { location: "Southern hemisphere", significance: "3σ", size: "10 degrees" },
          axisOfEvil: { description: "Large-scale alignments with ecliptic", significance: "disputed" },
          hemisphericalAsymmetry: { description: "Power difference between hemispheres", significance: "2-3σ" }
        },
        explore: ["Why these specific fluctuations?", "Are anomalies real or statistical flukes?"]
      },

      // Supernovae Type Ia (cosmic distance measurements)
      supernovaeData: {
        description: "Standard candles showing accelerating expansion",
        data: this.generateSupernovaeData(),
        unexpectedResult: "Universe expansion is ACCELERATING",
        impliedEnergy: "68% of universe is unknown 'dark energy'",
        explore: ["Why is expansion accelerating?", "Is dark energy constant?"]
      },

      // Gravitational waves
      gravitationalWaves: {
        description: "Ripples in spacetime from massive object mergers",
        detections: this.generateGWDetections(),
        information: ["Black hole masses", "Spin", "Distance", "Merger dynamics"],
        unexpected: "Black holes heavier than expected from stellar evolution",
        explore: ["Where do heavy black holes come from?", "Primordial black holes?"]
      },

      // Neutrino observations
      neutrinoData: {
        solarNeutrinos: {
          expected: 8e10, // per cm² per second
          observed: 2.6e10, // electron neutrinos
          resolution: "Neutrino oscillations - they have mass!"
        },
        atmosphericNeutrinos: {
          description: "Muon neutrino deficit from cosmic rays",
          impliedMass: "< 0.1 eV"
        },
        unexplained: ["Why so much lighter than other particles?", "Majorana or Dirac?", "Are there sterile neutrinos?"]
      },

      // Ultra-high energy cosmic rays
      cosmicRays: {
        spectrum: this.generateCosmicRaySpectrum(),
        GZKCutoff: {
          prediction: "Should cut off at 5×10¹⁹ eV due to CMB interaction",
          observation: "Events seen above cutoff!",
          sources: "Should be within 50 Mpc but none identified"
        },
        ankleFeature: "Spectral break at 5×10¹⁸ eV",
        explore: ["What accelerates particles to such energies?", "Why events above GZK?"]
      },

      // Quantum experiments
      quantumExperiments: {
        doubleSlitPatterns: this.generateDoubleSlitData(),
        bellTestResults: {
          localRealismViolation: true,
          CHSHValue: 2.7, // > 2 violates Bell inequality
          loopholesClosed: ["Detection", "Locality", "Freedom of choice"],
          implication: "No local hidden variables"
        },
        delayedChoiceResults: {
          description: "Measurement choice after photon passes slits still affects pattern",
          implication: "Challenges classical notions of causality"
        },
        quantumEraserResults: {
          description: "Erasing which-path info restores interference",
          implication: "Information, not physical interaction, matters"
        }
      },

      // Precision atomic measurements
      atomicMeasurements: {
        hydrogenSpectrum: this.generateHydrogenSpectrum(),
        anomalousElectronMoment: {
          prediction: 1.00115965218091,
          measurement: 1.00115965218073,
          precision: "10⁻¹²"
        },
        muonAnomalousmoment: {
          prediction: 1.00116591810,
          measurement: 1.00116592040,
          discrepancy: "4.2σ - new physics?"
        },
        protonRadius: {
          electronic: 0.877e-15, // meters
          muonic: 0.842e-15,
          discrepancy: "5σ"
        }
      },

      // Gravitational observations
      gravitationalObservations: {
        mercuryPerihelion: {
          observed: 574.10, // arcsec/century
          newtonPrediction: 531.63,
          grCorrection: 42.98,
          total: 574.61,
          agreement: "Excellent"
        },
        lightBending: {
          solar: {
            grPrediction: 1.75, // arcsec
            observed: 1.76,
            agreement: "Within 0.1%"
          }
        },
        shapiroDelay: {
          description: "Light delay passing near massive body",
          verified: true,
          precision: "0.001%"
        },
        frameeDragging: {
          description: "Spacetime dragged by rotating mass",
          gravityProbeB: {
            predicted: 39.2, // milliarcsec/year
            observed: 37.2,
            error: "19%"
          }
        }
      },

      // Strange astrophysical observations
      strangeObservations: {
        fastRadioBursts: {
          description: "Millisecond radio bursts from distant galaxies",
          energy: "10³⁸ ergs in milliseconds",
          repeaters: "Some sources repeat",
          origin: "Unknown"
        },
        tabbyStar: {
          description: "KIC 8462852 - irregular dimming up to 22%",
          theories: ["Comets", "Dust", "Aliens?"],
          status: "Probably dust but weird"
        },
        oumuamua: {
          description: "First interstellar object detected",
          anomaly: "Non-gravitational acceleration",
          shape: "Extremely elongated or flat",
          origin: "Unknown"
        },
        flybyAnomaly: {
          description: "Spacecraft gain unexpected energy during Earth flybys",
          magnitude: "~1 mm/s velocity change",
          explanation: "None satisfactory"
        }
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // EXPERIMENTAL SETUPS AGENTS CAN RUN
  // ═══════════════════════════════════════════════════════════════════
  initializeExperiments() {
    return {

      // Double slit experiment with full quantum control
      doubleSlit: {
        name: "Double Slit Quantum Experiment",
        parameters: {
          particleType: ["photon", "electron", "neutron", "molecule", "buckyball"],
          slitWidth: { min: 1e-9, max: 1e-3, unit: "m" },
          slitSeparation: { min: 1e-9, max: 1e-3, unit: "m" },
          detectorDistance: { min: 0.1, max: 10, unit: "m" },
          whichPathDetector: [true, false],
          delayed_choice: [true, false],
          particleMass: "auto", // set based on particle type
          wavelength: "auto" // de Broglie wavelength
        },
        run: (params) => this.simulationEngine.runDoubleSlit(params)
      },

      // Bell test experiment
      bellTest: {
        name: "Bell Inequality Test",
        parameters: {
          entangledPairs: { min: 100, max: 1e6 },
          measurementAngles: { alice: [0, 360], bob: [0, 360] },
          detectionEfficiency: { min: 0.5, max: 0.99 },
          spacelikeSeparation: [true, false]
        },
        run: (params) => this.simulationEngine.runBellTest(params)
      },

      // Gravitational physics
      orbitalMechanics: {
        name: "Orbital Mechanics Simulation",
        parameters: {
          centralMass: { min: 1e20, max: 1e40, unit: "kg" },
          orbitingMass: { min: 1, max: 1e30, unit: "kg" },
          initialDistance: { min: 1e6, max: 1e15, unit: "m" },
          initialVelocity: { min: 100, max: 3e8, unit: "m/s" },
          includeGR: [true, false],
          includeDarkMatter: [true, false]
        },
        run: (params) => this.simulationEngine.runOrbitalMechanics(params)
      },

      // Thermodynamic system
      thermodynamicBox: {
        name: "Thermodynamic System",
        parameters: {
          particles: { min: 100, max: 1e6 },
          temperature: { min: 0.001, max: 1e9, unit: "K" },
          volume: { min: 1e-27, max: 1, unit: "m³" },
          quantumEffects: [true, false],
          particleType: ["classical", "boson", "fermion"]
        },
        run: (params) => this.simulationEngine.runThermodynamics(params)
      },

      // Electromagnetic wave
      emWave: {
        name: "Electromagnetic Wave Propagation",
        parameters: {
          frequency: { min: 1, max: 1e25, unit: "Hz" },
          medium: ["vacuum", "glass", "plasma", "conductor"],
          polarization: ["linear", "circular", "unpolarized"],
          intensity: { min: 1e-20, max: 1e30, unit: "W/m²" }
        },
        run: (params) => this.simulationEngine.runEMWave(params)
      },

      // Particle collision
      particleCollision: {
        name: "Particle Collision Experiment",
        parameters: {
          particle1: ["electron", "positron", "proton", "antiproton", "photon"],
          particle2: ["electron", "positron", "proton", "antiproton", "photon"],
          centerOfMassEnergy: { min: 1, max: 1e13, unit: "eV" },
          impactParameter: { min: 0, max: 1e-10, unit: "m" }
        },
        run: (params) => this.simulationEngine.runCollision(params)
      },

      // Quantum decoherence
      decoherenceExperiment: {
        name: "Quantum Decoherence Study",
        parameters: {
          systemSize: { min: 1, max: 1000, unit: "qubits" },
          environmentCoupling: { min: 0, max: 1 },
          temperature: { min: 0, max: 300, unit: "K" },
          initialState: ["superposition", "entangled", "mixed"]
        },
        run: (params) => this.simulationEngine.runDecoherence(params)
      },

      // Spacetime geometry
      spacetimeGeometry: {
        name: "Spacetime Geometry Explorer",
        parameters: {
          mass: { min: 0, max: 1e40, unit: "kg" },
          spin: { min: 0, max: 1, unit: "dimensionless" },
          charge: { min: 0, max: 1e20, unit: "C" },
          cosmologicalConstant: { min: -1e-52, max: 1e-52 },
          probeType: ["lightRay", "particle", "clock"]
        },
        run: (params) => this.simulationEngine.runSpacetimeGeometry(params)
      },

      // Dark matter halo
      darkMatterHalo: {
        name: "Dark Matter Distribution Study",
        parameters: {
          haloMass: { min: 1e10, max: 1e15, unit: "solar_masses" },
          profile: ["NFW", "Einasto", "isothermal", "cored"],
          baryonFraction: { min: 0.01, max: 0.2 },
          observationType: ["rotation_curve", "lensing", "velocity_dispersion"]
        },
        run: (params) => this.simulationEngine.runDarkMatterHalo(params)
      },

      // Quantum field vacuum
      quantumVacuum: {
        name: "Quantum Vacuum Properties",
        parameters: {
          fieldType: ["scalar", "spinor", "vector"],
          boundaryConditions: ["open", "periodic", "casimir_plates"],
          plateSeparation: { min: 1e-9, max: 1e-3, unit: "m" },
          temperature: { min: 0, max: 1e6, unit: "K" }
        },
        run: (params) => this.simulationEngine.runQuantumVacuum(params)
      },

      // Information thermodynamics
      informationThermodynamics: {
        name: "Information-Energy Relationship",
        parameters: {
          bits: { min: 1, max: 1e12 },
          temperature: { min: 1e-3, max: 1e6, unit: "K" },
          operation: ["erasure", "measurement", "feedback"],
          reversibility: { min: 0, max: 1 }
        },
        run: (params) => this.simulationEngine.runInfoThermo(params)
      }
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // DATA GENERATORS
  // ═══════════════════════════════════════════════════════════════════

  generateGalaxyRotationData() {
    const data = [];
    for (let r = 0.5; r <= 30; r += 0.5) {
      const expectedVelocity = 220 * Math.sqrt(5/r); // Keplerian
      const observedVelocity = 220 * (r < 5 ? Math.sqrt(r/5) : 1.0); // Flat
      const noise = (Math.random() - 0.5) * 10;
      data.push({
        radius_kpc: r,
        expected_km_s: expectedVelocity,
        observed_km_s: observedVelocity + noise,
        error_km_s: 5 + Math.random() * 5
      });
    }
    return data;
  }

  generateCMBFluctuations() {
    const size = 100;
    const map = [];
    for (let i = 0; i < size; i++) {
      const row = [];
      for (let j = 0; j < size; j++) {
        // Generate correlated Gaussian fluctuations
        let sum = 0;
        for (let l = 1; l <= 50; l++) {
          const amplitude = Math.sqrt(l * (l + 1) * this.getCMBPowerAtL(l));
          sum += amplitude * Math.sin(l * (i/size) * Math.PI) * Math.cos(l * (j/size) * Math.PI) * (Math.random() - 0.5);
        }
        row.push(2.725 + sum * 1e-5); // Temperature in K
      }
      map.push(row);
    }
    return map;
  }

  getCMBPowerAtL(l) {
    // Approximate CMB power spectrum
    const lPeak = 220;
    return Math.exp(-Math.pow(l - lPeak, 2) / (2 * 100 * 100)) +
           0.3 * Math.exp(-Math.pow(l - 550, 2) / (2 * 150 * 150)) +
           0.1 * Math.exp(-Math.pow(l - 800, 2) / (2 * 200 * 200));
  }

  generateCMBPowerSpectrum() {
    const spectrum = [];
    for (let l = 2; l <= 2500; l++) {
      spectrum.push({
        l: l,
        Cl: this.getCMBPowerAtL(l) * (1 + (Math.random() - 0.5) * 0.1),
        error: this.getCMBPowerAtL(l) * 0.05
      });
    }
    return spectrum;
  }

  generateSupernovaeData() {
    const data = [];
    for (let i = 0; i < 200; i++) {
      const z = Math.random() * 1.5; // redshift
      const H0 = 70; // km/s/Mpc
      const OmegaM = 0.3;
      const OmegaL = 0.7;

      // Luminosity distance in accelerating universe
      const dL = this.calculateLuminosityDistance(z, H0, OmegaM, OmegaL);

      const noise = (Math.random() - 0.5) * 0.15;
      const distanceModulus = 5 * Math.log10(dL) + 25 + noise;

      data.push({
        redshift: z,
        distance_modulus: distanceModulus,
        error: 0.15,
        type: "Ia"
      });
    }
    return data.sort((a, b) => a.redshift - b.redshift);
  }

  calculateLuminosityDistance(z, H0, OmegaM, OmegaL) {
    // Numerical integration for flat ΛCDM
    const c = 299792.458; // km/s
    const n = 1000;
    const dz = z / n;
    let integral = 0;

    for (let i = 0; i < n; i++) {
      const zi = i * dz;
      const Ez = Math.sqrt(OmegaM * Math.pow(1 + zi, 3) + OmegaL);
      integral += dz / Ez;
    }

    return (c / H0) * (1 + z) * integral;
  }

  generateGWDetections() {
    const events = [
      { name: "GW150914", m1: 36, m2: 29, distance_Mpc: 410, type: "BBH" },
      { name: "GW151226", m1: 14, m2: 8, distance_Mpc: 440, type: "BBH" },
      { name: "GW170104", m1: 31, m2: 19, distance_Mpc: 880, type: "BBH" },
      { name: "GW170814", m1: 31, m2: 25, distance_Mpc: 540, type: "BBH" },
      { name: "GW170817", m1: 1.46, m2: 1.27, distance_Mpc: 40, type: "BNS" },
      { name: "GW190521", m1: 85, m2: 66, distance_Mpc: 5300, type: "BBH" }
    ];

    return events.map(e => ({
      ...e,
      final_mass: (e.m1 + e.m2) * 0.95, // ~5% radiated as GW
      peak_luminosity: 3.6e56, // Watts, approximate
      strain: 1e-21 * (100 / e.distance_Mpc)
    }));
  }

  generateCosmicRaySpectrum() {
    const spectrum = [];
    for (let logE = 9; logE <= 21; logE += 0.1) {
      const E = Math.pow(10, logE);
      // Power law with features
      let flux = Math.pow(E, -2.7);

      // Knee at 3×10¹⁵ eV
      if (logE > 15.5) {
        flux *= Math.pow(E / 3e15, -0.3);
      }

      // Ankle at 5×10¹⁸ eV
      if (logE > 18.7) {
        flux *= Math.pow(E / 5e18, 0.5);
      }

      // GZK cutoff (suppression) at 5×10¹⁹ eV
      if (logE > 19.7) {
        flux *= Math.exp(-(logE - 19.7) * 2);
      }

      spectrum.push({
        energy_eV: E,
        flux: flux * (1 + (Math.random() - 0.5) * 0.3),
        error: flux * 0.2
      });
    }
    return spectrum;
  }

  generateDoubleSlitData() {
    const patterns = {
      withoutMeasurement: [],
      withMeasurement: []
    };

    // Without which-path measurement - interference
    for (let x = -50; x <= 50; x++) {
      const intensity = Math.pow(Math.cos(x * 0.2), 2) * Math.exp(-x*x/500);
      patterns.withoutMeasurement.push({
        position_mm: x,
        intensity: intensity + (Math.random() - 0.5) * 0.1
      });
    }

    // With which-path measurement - no interference
    for (let x = -50; x <= 50; x++) {
      const intensity = Math.exp(-(x-10)*(x-10)/100) + Math.exp(-(x+10)*(x+10)/100);
      patterns.withMeasurement.push({
        position_mm: x,
        intensity: intensity/2 + (Math.random() - 0.5) * 0.1
      });
    }

    return patterns;
  }

  generateHydrogenSpectrum() {
    const lines = [];
    const R = 1.097e7; // Rydberg constant

    for (let nFinal = 1; nFinal <= 4; nFinal++) {
      for (let nInitial = nFinal + 1; nInitial <= 10; nInitial++) {
        const wavelength = 1 / (R * (1/(nFinal*nFinal) - 1/(nInitial*nInitial)));
        lines.push({
          transition: `${nInitial} → ${nFinal}`,
          wavelength_nm: wavelength * 1e9,
          energy_eV: 13.6 * (1/(nFinal*nFinal) - 1/(nInitial*nInitial)),
          series: nFinal === 1 ? "Lyman" : nFinal === 2 ? "Balmer" : nFinal === 3 ? "Paschen" : "Brackett"
        });
      }
    }

    return lines;
  }

  // ═══════════════════════════════════════════════════════════════════
  // AGENT INTERFACE METHODS
  // ═══════════════════════════════════════════════════════════════════

  getAvailableExperiments() {
    return Object.keys(this.experimentalSetups).map(key => ({
      id: key,
      name: this.experimentalSetups[key].name,
      parameters: this.experimentalSetups[key].parameters
    }));
  }

  getObservationalData(category) {
    if (category) {
      return this.observationalData[category];
    }
    return Object.keys(this.observationalData);
  }

  runExperiment(experimentId, parameters) {
    const experiment = this.experimentalSetups[experimentId];
    if (!experiment) {
      return { error: `Unknown experiment: ${experimentId}` };
    }

    const result = experiment.run(parameters);

    // Record the experiment
    const experimentRecord = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      experimentType: experimentId,
      parameters: parameters,
      result: result,
      timestamp: this.time
    };

    this.experiments.set(experimentRecord.id, experimentRecord);

    return experimentRecord;
  }

  recordDiscovery(agentId, discovery) {
    const record = {
      id: `disc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId: agentId,
      discovery: discovery,
      timestamp: this.time,
      relatedExperiments: [],
      validationStatus: 'proposed'
    };

    this.discoveries.push(record);
    return record;
  }

  getDiscoveries() {
    return this.discoveries;
  }

  advanceTime(delta = 1) {
    this.time += delta;
    return this.time;
  }
}

// ═══════════════════════════════════════════════════════════════════
// SIMULATION ENGINE - Runs experiments with physical accuracy
// ═══════════════════════════════════════════════════════════════════
class SimulationEngine {

  runDoubleSlit(params) {
    const h = 6.626e-34;
    const masses = {
      photon: 0,
      electron: 9.109e-31,
      neutron: 1.675e-27,
      molecule: 1e-25,
      buckyball: 1.2e-24
    };

    const mass = masses[params.particleType];
    const momentum = mass > 0 ? Math.sqrt(2 * mass * 1.6e-19) : h * params.frequency / 299792458;
    const wavelength = h / momentum;

    const pattern = [];
    const interference = !params.whichPathDetector;

    for (let x = -100; x <= 100; x++) {
      let intensity;
      if (interference) {
        const phase = 2 * Math.PI * params.slitSeparation * x * 1e-3 / (wavelength * params.detectorDistance);
        intensity = Math.pow(Math.cos(phase / 2), 2);

        // Envelope from single slit diffraction
        const alpha = Math.PI * params.slitWidth * x * 1e-3 / (wavelength * params.detectorDistance);
        if (Math.abs(alpha) > 0.01) {
          intensity *= Math.pow(Math.sin(alpha) / alpha, 2);
        }
      } else {
        // Two-bump pattern
        const d = params.slitSeparation * 1000 / 2;
        intensity = Math.exp(-Math.pow(x - d, 2) / 50) + Math.exp(-Math.pow(x + d, 2) / 50);
      }

      pattern.push({
        position_mm: x,
        intensity: intensity + (Math.random() - 0.5) * 0.05
      });
    }

    return {
      wavelength_m: wavelength,
      pattern: pattern,
      interferenceObserved: interference,
      quantumBehavior: wavelength > params.slitWidth / 10,
      interpretation: interference ?
        "Wave-like behavior: superposition of paths through both slits" :
        "Particle-like behavior: which-path information destroys interference"
    };
  }

  runBellTest(params) {
    const results = {
      correlations: [],
      CHSH_value: 0
    };

    // Calculate quantum correlations
    const angles = [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5];

    for (const angleA of angles) {
      for (const angleB of angles) {
        const thetaDiff = (angleB - angleA) * Math.PI / 180;
        const quantumCorrelation = -Math.cos(thetaDiff);

        // Add noise based on detection efficiency
        const noise = (1 - params.detectionEfficiency) * (Math.random() - 0.5);

        results.correlations.push({
          aliceAngle: angleA,
          bobAngle: angleB,
          correlation: quantumCorrelation + noise,
          counts: Math.floor(params.entangledPairs * params.detectionEfficiency)
        });
      }
    }

    // Calculate CHSH value
    const E = (a, b) => {
      const theta = (b - a) * Math.PI / 180;
      return -Math.cos(theta);
    };

    results.CHSH_value = Math.abs(E(0, 22.5) - E(0, 67.5) + E(45, 22.5) + E(45, 67.5));

    // Add detection efficiency effects
    results.CHSH_value *= params.detectionEfficiency;

    return {
      ...results,
      bellInequalityViolated: results.CHSH_value > 2,
      localRealismRuledOut: results.CHSH_value > 2 && params.spacelikeSeparation,
      maximumQuantumValue: 2.828,
      interpretation: results.CHSH_value > 2 ?
        "Quantum correlations exceed classical limits - nonlocality confirmed" :
        "Detection efficiency too low to conclusively rule out local realism"
    };
  }

  runOrbitalMechanics(params) {
    const G = 6.674e-11;
    const c = 299792458;

    // Calculate orbital parameters
    const orbitalVelocity = params.initialVelocity;
    const orbitalPeriod = 2 * Math.PI * params.initialDistance / orbitalVelocity;
    const escapeVelocity = Math.sqrt(2 * G * params.centralMass / params.initialDistance);
    const schwarzschildRadius = 2 * G * params.centralMass / (c * c);

    // GR corrections
    let perihelionPrecession = 0;
    if (params.includeGR) {
      const semiMajor = params.initialDistance;
      const eccentricity = 0.2; // assumed
      perihelionPrecession = 6 * Math.PI * G * params.centralMass /
        (c * c * semiMajor * (1 - eccentricity * eccentricity));
    }

    // Dark matter effect on rotation curve
    let darkMatterEffect = 1.0;
    if (params.includeDarkMatter && params.initialDistance > 1e20) {
      darkMatterEffect = Math.sqrt(1 + Math.log(params.initialDistance / 1e20));
    }

    return {
      orbitalPeriod_s: orbitalPeriod,
      orbitalVelocity_m_s: orbitalVelocity,
      escapeVelocity_m_s: escapeVelocity,
      bound: orbitalVelocity < escapeVelocity,
      schwarzschildRadius_m: schwarzschildRadius,
      relativistic: params.initialVelocity > 0.1 * c,
      perihelionPrecession_rad_per_orbit: perihelionPrecession,
      darkMatterVelocityMultiplier: darkMatterEffect,
      interpretation: {
        orbitalType: orbitalVelocity < escapeVelocity ? "Bound elliptical" : "Hyperbolic escape",
        grImportant: params.initialDistance < 100 * schwarzschildRadius,
        darkMatterRelevant: params.initialDistance > 1e20
      }
    };
  }

  runThermodynamics(params) {
    const kB = 1.381e-23;
    const h = 6.626e-34;

    // Thermal wavelength
    const thermalWavelength = h / Math.sqrt(2 * Math.PI * 1.67e-27 * kB * params.temperature);

    // Degeneracy parameter
    const density = params.particles / params.volume;
    const degeneracyParameter = density * Math.pow(thermalWavelength, 3);

    // Calculate thermodynamic quantities
    const classicalEnergy = 1.5 * params.particles * kB * params.temperature;
    const pressure = params.particles * kB * params.temperature / params.volume;
    const entropy = params.particles * kB * (2.5 + Math.log(params.volume / (params.particles * Math.pow(thermalWavelength, 3))));

    // Quantum corrections
    let quantumCorrection = 1.0;
    if (params.quantumEffects && degeneracyParameter > 0.1) {
      if (params.particleType === "boson") {
        quantumCorrection = 1 + degeneracyParameter / Math.pow(2, 2.5); // BEC tendency
      } else if (params.particleType === "fermion") {
        quantumCorrection = 1 + degeneracyParameter / Math.pow(2, 2.5) * 0.7; // Fermi pressure
      }
    }

    return {
      thermalWavelength_m: thermalWavelength,
      degeneracyParameter: degeneracyParameter,
      energy_J: classicalEnergy * quantumCorrection,
      pressure_Pa: pressure * quantumCorrection,
      entropy_J_K: entropy,
      quantumRegime: degeneracyParameter > 1,
      becPossible: params.particleType === "boson" && degeneracyParameter > 2.612,
      fermiDegenerate: params.particleType === "fermion" && degeneracyParameter > 1,
      interpretation: {
        regime: degeneracyParameter < 0.1 ? "Classical" : "Quantum",
        statistics: params.particleType === "boson" ? "Bose-Einstein" :
                   params.particleType === "fermion" ? "Fermi-Dirac" : "Maxwell-Boltzmann"
      }
    };
  }

  runEMWave(params) {
    const c = 299792458;
    const epsilon0 = 8.854e-12;
    const mu0 = 1.257e-6;

    const wavelength = c / params.frequency;
    const photonEnergy = 6.626e-34 * params.frequency;

    // Medium properties
    const media = {
      vacuum: { n: 1.0, absorption: 0 },
      glass: { n: 1.5, absorption: 0.01 },
      plasma: { n: params.frequency > 1e15 ? 0.99 : 0.1, absorption: 0.1 },
      conductor: { n: 0.1, absorption: 0.99 }
    };

    const medium = media[params.medium];
    const speed = c / medium.n;

    return {
      wavelength_m: wavelength,
      photonEnergy_eV: photonEnergy / 1.602e-19,
      phaseVelocity_m_s: speed,
      refractiveIndex: medium.n,
      absorption: medium.absorption,
      spectrumRegion: this.getSpectrumRegion(wavelength),
      polarizationState: params.polarization,
      electricFieldAmplitude: Math.sqrt(2 * params.intensity / (c * epsilon0)),
      magneticFieldAmplitude: Math.sqrt(2 * params.intensity * mu0 / c),
      interpretation: {
        wave: wavelength > 1e-12 ? "Classical wave behavior dominates" : "Quantum/particle behavior important",
        type: this.getSpectrumRegion(wavelength)
      }
    };
  }

  getSpectrumRegion(wavelength) {
    if (wavelength < 1e-12) return "Gamma ray";
    if (wavelength < 1e-8) return "X-ray";
    if (wavelength < 4e-7) return "Ultraviolet";
    if (wavelength < 7e-7) return "Visible";
    if (wavelength < 1e-3) return "Infrared";
    if (wavelength < 1) return "Microwave";
    return "Radio";
  }

  runCollision(params) {
    const masses = {
      electron: 0.511e6,  // eV/c²
      positron: 0.511e6,
      proton: 938.3e6,
      antiproton: 938.3e6,
      photon: 0
    };

    const m1 = masses[params.particle1];
    const m2 = masses[params.particle2];
    const E_cm = params.centerOfMassEnergy;

    // Possible products based on energy
    const products = [];

    if (params.particle1 === "electron" && params.particle2 === "positron") {
      if (E_cm > 1.022e6) products.push("e⁺e⁻ → γγ");
      if (E_cm > 211e6) products.push("e⁺e⁻ → μ⁺μ⁻");
      if (E_cm > 3.5e9) products.push("e⁺e⁻ → τ⁺τ⁻");
      if (E_cm > 91.2e9) products.push("e⁺e⁻ → Z⁰");
      if (E_cm > 160e9) products.push("e⁺e⁻ → W⁺W⁻");
      if (E_cm > 250e9) products.push("e⁺e⁻ → ZH");
    }

    if (params.particle1 === "proton" && params.particle2 === "proton") {
      if (E_cm > 1.88e9) products.push("pp → pp (elastic)");
      if (E_cm > 2e9) products.push("pp → ppπ⁰");
      if (E_cm > 2.2e9) products.push("pp → pnπ⁺");
      if (E_cm > 1e12) products.push("pp → jets");
      if (E_cm > 125e9) products.push("pp → H + X (Higgs)");
    }

    return {
      centerOfMassEnergy_eV: E_cm,
      invariantMass: Math.sqrt(Math.pow(m1 + m2, 2) + 2 * m1 * E_cm),
      possibleProducts: products,
      thresholdEnergies: {
        muonPairProduction: 211e6,
        ZBoson: 91.2e9,
        WPair: 160e9,
        Higgs: 125e9,
        topPair: 350e9
      },
      interpretation: {
        regime: E_cm < 1e9 ? "Low energy - bound states and resonances" :
                E_cm < 1e12 ? "Medium energy - Standard Model processes" :
                "High energy - possible new physics"
      }
    };
  }

  runDecoherence(params) {
    const hbar = 1.055e-34;
    const kB = 1.381e-23;

    // Decoherence time estimate
    const thermalEnergy = kB * params.temperature;
    const coherenceTime = hbar / (thermalEnergy * params.environmentCoupling);

    // Evolution of coherence
    const timePoints = [];
    for (let t = 0; t <= 10 * coherenceTime; t += coherenceTime / 10) {
      const coherence = Math.exp(-t / coherenceTime);
      const entanglement = params.initialState === "entangled" ?
        Math.exp(-2 * t / coherenceTime) : 0;

      timePoints.push({
        time_s: t,
        coherence: coherence,
        entanglement: entanglement,
        effectiveQubits: Math.max(1, params.systemSize * coherence)
      });
    }

    return {
      decoherenceTime_s: coherenceTime,
      environmentalInformation: params.environmentCoupling * params.systemSize,
      timeEvolution: timePoints,
      quantumToClassical: {
        initialCoherence: 1.0,
        finalCoherence: Math.exp(-10),
        transitionTime: 2.3 * coherenceTime
      },
      interpretation: {
        mechanism: "Environmental monitoring destroys superposition",
        preferredBasis: params.environmentCoupling > 0.5 ? "Position basis (environment monitors position)" : "Energy basis",
        measurementConnection: "Decoherence explains apparent collapse without invoking special measurement axiom"
      }
    };
  }

  runSpacetimeGeometry(params) {
    const G = 6.674e-11;
    const c = 299792458;

    const rs = 2 * G * params.mass / (c * c);
    const rQ = G * params.charge * params.charge / (c * c * c * c * 4 * Math.PI * 8.854e-12);
    const a = params.spin * rs / 2;

    // Metric type
    let metricType = "Flat (Minkowski)";
    if (params.mass > 0 && params.spin === 0 && params.charge === 0) {
      metricType = "Schwarzschild";
    } else if (params.mass > 0 && params.spin > 0 && params.charge === 0) {
      metricType = "Kerr";
    } else if (params.mass > 0 && params.charge > 0) {
      metricType = params.spin > 0 ? "Kerr-Newman" : "Reissner-Nordström";
    }

    // Horizons
    const horizons = [];
    if (params.mass > 0) {
      if (params.spin === 0 && params.charge === 0) {
        horizons.push({ type: "Event horizon", radius: rs });
      } else {
        const discriminant = rs * rs - 4 * (a * a + rQ);
        if (discriminant > 0) {
          horizons.push({ type: "Outer horizon", radius: (rs + Math.sqrt(discriminant)) / 2 });
          horizons.push({ type: "Inner horizon", radius: (rs - Math.sqrt(discriminant)) / 2 });
        } else if (discriminant === 0) {
          horizons.push({ type: "Degenerate horizon", radius: rs / 2 });
        }
        // discriminant < 0 means naked singularity
      }
    }

    // Probe behavior
    let probeResult = {};
    if (params.probeType === "lightRay") {
      probeResult = {
        photonSphere: params.mass > 0 ? 1.5 * rs : null,
        bending: params.mass > 0 ? 4 * G * params.mass / (c * c) : 0
      };
    } else if (params.probeType === "clock") {
      probeResult = {
        timeDilationFactor: params.mass > 0 ? Math.sqrt(1 - rs / (10 * rs)) : 1,
        properTimeRatio: "Clock at 10rs runs at 95% speed of distant clock"
      };
    }

    return {
      schwarzschildRadius_m: rs,
      metricType: metricType,
      horizons: horizons,
      ergosphere: a > 0 ? { exists: true, outerRadius: rs } : { exists: false },
      singularity: params.mass > 0 ? (params.spin > 0 ? "Ring singularity" : "Point singularity") : "None",
      nakedSingularity: horizons.length === 0 && params.mass > 0,
      probe: probeResult,
      cosmologicalHorizon: params.cosmologicalConstant > 0 ?
        Math.sqrt(3 / params.cosmologicalConstant) : null,
      interpretation: {
        causalStructure: horizons.length > 0 ? "Black hole - one-way boundary exists" : "No horizons",
        cosmologicalNote: params.cosmologicalConstant !== 0 ?
          "de Sitter (Λ>0) or anti-de Sitter (Λ<0) spacetime" : "Asymptotically flat"
      }
    };
  }

  runDarkMatterHalo(params) {
    // NFW profile: ρ(r) = ρ_s / ((r/r_s)(1 + r/r_s)²)
    // Einasto: ρ(r) = ρ_s exp(-(2/α)((r/r_s)^α - 1))

    const profiles = {
      NFW: (r, rs) => 1 / ((r/rs) * Math.pow(1 + r/rs, 2)),
      Einasto: (r, rs) => Math.exp(-2 * 0.17 * (Math.pow(r/rs, 0.17) - 1)),
      isothermal: (r, rs) => 1 / (1 + Math.pow(r/rs, 2)),
      cored: (r, rs) => 1 / Math.pow(1 + Math.pow(r/rs, 2), 1.5)
    };

    const profile = profiles[params.profile];
    const rs = 20; // scale radius in kpc

    // Generate rotation curve
    const rotationCurve = [];
    for (let r = 1; r <= 100; r += 2) {
      // Enclosed mass (simplified)
      let enclosedMass = 0;
      for (let ri = 0.1; ri <= r; ri += 0.1) {
        enclosedMass += profile(ri, rs) * ri * ri * 0.1;
      }

      // Circular velocity
      const v = Math.sqrt(enclosedMass * params.haloMass * 1e-10 / r) * 200;

      // Add baryonic contribution
      const baryonContribution = params.baryonFraction * Math.sqrt(1e11 / r) * Math.exp(-r/5);

      rotationCurve.push({
        radius_kpc: r,
        velocity_km_s: v + baryonContribution + (Math.random() - 0.5) * 10,
        darkMatterFraction: v / (v + baryonContribution)
      });
    }

    return {
      profile: params.profile,
      scaleRadius_kpc: rs,
      rotationCurve: rotationCurve,
      centralDensity: profile(0.1, rs),
      viralMass: params.haloMass,
      baryonFraction: params.baryonFraction,
      observation: {
        type: params.observationType,
        dataPoints: rotationCurve.length,
        flatteningRadius: 10 // where curve becomes flat
      },
      interpretation: {
        profile: `${params.profile} profile ${params.profile === 'cored' ? 'resolves cusp-core problem' : ''}`,
        missingBaryons: params.baryonFraction < 0.17 ? "Baryons missing compared to cosmic average" : "Normal baryon content",
        consistency: "Requires ~5x more mass than visible to explain rotation curve"
      }
    };
  }

  runQuantumVacuum(params) {
    const hbar = 1.055e-34;
    const c = 299792458;

    let result = {
      fieldType: params.fieldType,
      boundaryConditions: params.boundaryConditions
    };

    if (params.boundaryConditions === "casimir_plates") {
      const d = params.plateSeparation;

      // Casimir force per unit area
      const casimirPressure = -Math.PI * Math.PI * hbar * c / (240 * Math.pow(d, 4));

      // Temperature correction
      const thermalCorrection = params.temperature > 0 ?
        1 + 45 * Math.pow(1.381e-23 * params.temperature * d / (Math.PI * hbar * c), 4) : 1;

      result.casimir = {
        pressure_Pa: casimirPressure * thermalCorrection,
        force_per_m2: casimirPressure * thermalCorrection,
        energyDensity_J_m3: casimirPressure * d / 3,
        attractive: true,
        thermalCorrection: thermalCorrection
      };
    }

    // Vacuum fluctuation spectrum
    const fluctuationSpectrum = [];
    for (let logOmega = 10; logOmega <= 25; logOmega += 0.5) {
      const omega = Math.pow(10, logOmega);
      const energyDensity = hbar * Math.pow(omega, 4) / (2 * Math.PI * Math.PI * Math.pow(c, 3));
      fluctuationSpectrum.push({
        frequency_Hz: omega / (2 * Math.PI),
        energyDensity: energyDensity
      });
    }

    result.fluctuations = {
      spectrum: fluctuationSpectrum,
      totalEnergyDensity: "Divergent - requires cutoff",
      planckCutoff: 1.855e43, // rad/s
      cosmologicalConstantProblem: {
        predicted: 1e113, // J/m³ with Planck cutoff
        observed: 6e-10, // J/m³
        discrepancy: "10¹²⁰ - worst prediction in physics"
      }
    };

    result.interpretation = {
      reality: "Vacuum fluctuations are real - cause Casimir effect, Lamb shift",
      mystery: "Why doesn't vacuum energy gravitate as predicted?",
      possibilities: ["Supersymmetry cancellation", "Anthropic selection", "Unknown physics"]
    };

    return result;
  }

  runInfoThermo(params) {
    const kB = 1.381e-23;

    // Landauer's principle
    const landauerLimit = kB * params.temperature * Math.log(2);
    const minErasureEnergy = params.bits * landauerLimit;

    let result = {
      bits: params.bits,
      temperature_K: params.temperature,
      landauerLimit_J_per_bit: landauerLimit,
      minimumErasureEnergy_J: minErasureEnergy,
      operation: params.operation
    };

    if (params.operation === "erasure") {
      const actualEnergy = minErasureEnergy / params.reversibility;
      const entropyProduction = (actualEnergy - minErasureEnergy) / params.temperature;

      result.erasure = {
        actualEnergy_J: actualEnergy,
        efficiency: params.reversibility,
        entropyProduction_J_K: entropyProduction,
        heatDissipated_J: actualEnergy
      };
    } else if (params.operation === "measurement") {
      result.measurement = {
        informationGain_bits: params.bits,
        minimumFreeEnergyCost: 0, // Measurement can be free!
        postMeasurementCorrelation: "Mutual information between system and memory"
      };
    } else if (params.operation === "feedback") {
      // Szilard engine type
      const extractableWork = params.bits * landauerLimit;

      result.feedback = {
        informationUsed_bits: params.bits,
        workExtracted_J: extractableWork * params.reversibility,
        apparentViolationOfSecondLaw: false,
        explanation: "Information has thermodynamic value - can be converted to work"
      };
    }

    result.interpretation = {
      information_is_physical: true,
      landauer: "Erasure of information has minimum energy cost",
      maxwell_demon: "Resolved - demon must erase memory, paying energy cost",
      thermodynamic_computing: `Minimum energy for computation: ${landauerLimit.toExponential(2)} J/bit at ${params.temperature}K`
    };

    return result;
  }
}

module.exports = { ExplorationWorld, SimulationEngine };
