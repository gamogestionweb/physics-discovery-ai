/**
 * PHYSICS KNOWLEDGE BASE
 * Complete verified physical laws and unexplained phenomena
 * For the Multi-Agent Discovery System
 */

const PHYSICS_KNOWLEDGE = {

  // ═══════════════════════════════════════════════════════════════════
  // FUNDAMENTAL CONSTANTS (Verified to extreme precision)
  // ═══════════════════════════════════════════════════════════════════
  constants: {
    c: { value: 299792458, unit: 'm/s', name: 'Speed of light in vacuum', uncertainty: 0 },
    h: { value: 6.62607015e-34, unit: 'J·s', name: 'Planck constant', uncertainty: 0 },
    hbar: { value: 1.054571817e-34, unit: 'J·s', name: 'Reduced Planck constant', uncertainty: 0 },
    G: { value: 6.67430e-11, unit: 'm³/(kg·s²)', name: 'Gravitational constant', uncertainty: 2.2e-5 },
    e: { value: 1.602176634e-19, unit: 'C', name: 'Elementary charge', uncertainty: 0 },
    k_B: { value: 1.380649e-23, unit: 'J/K', name: 'Boltzmann constant', uncertainty: 0 },
    N_A: { value: 6.02214076e23, unit: 'mol⁻¹', name: 'Avogadro constant', uncertainty: 0 },
    epsilon_0: { value: 8.8541878128e-12, unit: 'F/m', name: 'Vacuum permittivity', uncertainty: 1.5e-10 },
    mu_0: { value: 1.25663706212e-6, unit: 'N/A²', name: 'Vacuum permeability', uncertainty: 1.5e-10 },
    alpha: { value: 7.2973525693e-3, unit: 'dimensionless', name: 'Fine structure constant', uncertainty: 1.5e-10 },
    m_e: { value: 9.1093837015e-31, unit: 'kg', name: 'Electron mass', uncertainty: 3.0e-10 },
    m_p: { value: 1.67262192369e-27, unit: 'kg', name: 'Proton mass', uncertainty: 3.1e-10 },
    m_n: { value: 1.67492749804e-27, unit: 'kg', name: 'Neutron mass', uncertainty: 5.7e-10 },
    l_P: { value: 1.616255e-35, unit: 'm', name: 'Planck length', uncertainty: 1.1e-5 },
    t_P: { value: 5.391247e-44, unit: 's', name: 'Planck time', uncertainty: 1.1e-5 },
    m_P: { value: 2.176434e-8, unit: 'kg', name: 'Planck mass', uncertainty: 1.1e-5 },
    T_P: { value: 1.416784e32, unit: 'K', name: 'Planck temperature', uncertainty: 1.1e-5 },
  },

  // ═══════════════════════════════════════════════════════════════════
  // CLASSICAL MECHANICS (Newton, Lagrange, Hamilton)
  // ═══════════════════════════════════════════════════════════════════
  classicalMechanics: {
    newton: {
      firstLaw: {
        statement: "An object remains at rest or in uniform motion unless acted upon by a net force",
        mathematical: "Σ F = 0 → v = constant",
        domain: "Inertial reference frames, v << c",
        verified: true
      },
      secondLaw: {
        statement: "Force equals mass times acceleration",
        mathematical: "F = ma = dp/dt",
        domain: "v << c, classical regime",
        verified: true
      },
      thirdLaw: {
        statement: "Every action has an equal and opposite reaction",
        mathematical: "F₁₂ = -F₂₁",
        domain: "Contact forces, instantaneous interaction",
        verified: true,
        limitation: "Fails for electromagnetic radiation - momentum carried by fields"
      },
      gravitation: {
        statement: "Every mass attracts every other mass",
        mathematical: "F = G·m₁·m₂/r²",
        domain: "Weak fields, slow motion",
        verified: true,
        supersededBy: "General Relativity"
      }
    },
    lagrangian: {
      principle: "The path taken minimizes the action S = ∫L dt",
      mathematical: "L = T - V, δS = 0",
      eulerLagrange: "d/dt(∂L/∂q̇) - ∂L/∂q = 0",
      verified: true
    },
    hamiltonian: {
      principle: "Phase space formulation of mechanics",
      mathematical: "H = Σpq̇ - L",
      equations: "dq/dt = ∂H/∂p, dp/dt = -∂H/∂q",
      poissonBracket: "{f,g} = Σ(∂f/∂q·∂g/∂p - ∂f/∂p·∂g/∂q)",
      verified: true
    },
    conservation: {
      energy: { condition: "Time translation symmetry", mathematical: "dE/dt = 0 if ∂L/∂t = 0" },
      momentum: { condition: "Space translation symmetry", mathematical: "dp/dt = 0 if ∂L/∂x = 0" },
      angularMomentum: { condition: "Rotational symmetry", mathematical: "dL/dt = 0 if ∂L/∂θ = 0" }
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // ELECTROMAGNETISM (Maxwell)
  // ═══════════════════════════════════════════════════════════════════
  electromagnetism: {
    maxwell: {
      gaussElectric: {
        statement: "Electric charges produce electric fields",
        differential: "∇·E = ρ/ε₀",
        integral: "∮E·dA = Q/ε₀",
        verified: true
      },
      gaussMagnetic: {
        statement: "No magnetic monopoles exist",
        differential: "∇·B = 0",
        integral: "∮B·dA = 0",
        verified: true,
        note: "No monopoles ever found despite extensive searches"
      },
      faraday: {
        statement: "Changing magnetic fields induce electric fields",
        differential: "∇×E = -∂B/∂t",
        integral: "∮E·dl = -dΦ_B/dt",
        verified: true
      },
      ampereMaxwell: {
        statement: "Electric currents and changing electric fields produce magnetic fields",
        differential: "∇×B = μ₀J + μ₀ε₀∂E/∂t",
        integral: "∮B·dl = μ₀I + μ₀ε₀dΦ_E/dt",
        verified: true
      }
    },
    waveEquation: {
      statement: "Light is an electromagnetic wave",
      mathematical: "∇²E = μ₀ε₀∂²E/∂t²",
      speed: "c = 1/√(μ₀ε₀)",
      verified: true
    },
    lorentzForce: {
      statement: "Force on a charge in EM fields",
      mathematical: "F = q(E + v×B)",
      verified: true
    },
    potentials: {
      scalar: "E = -∇φ - ∂A/∂t",
      vector: "B = ∇×A",
      gaugeInvariance: "φ → φ - ∂χ/∂t, A → A + ∇χ leaves E,B unchanged"
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // THERMODYNAMICS AND STATISTICAL MECHANICS
  // ═══════════════════════════════════════════════════════════════════
  thermodynamics: {
    zerothLaw: {
      statement: "Thermal equilibrium is transitive",
      implication: "Temperature is well-defined",
      verified: true
    },
    firstLaw: {
      statement: "Energy is conserved",
      mathematical: "dU = δQ - δW",
      verified: true
    },
    secondLaw: {
      statement: "Entropy of isolated system never decreases",
      clausius: "δQ/T ≤ dS",
      kelvinPlanck: "No perfect heat engine",
      boltzmann: "S = k_B ln(Ω)",
      verified: true,
      arrowOfTime: "Defines thermodynamic arrow of time"
    },
    thirdLaw: {
      statement: "Entropy approaches zero as temperature approaches absolute zero",
      mathematical: "lim(T→0) S = 0",
      nernst: "Cannot reach absolute zero in finite steps",
      verified: true
    },
    statisticalMechanics: {
      boltzmannDistribution: "P(E) ∝ exp(-E/k_B T)",
      partitionFunction: "Z = Σ exp(-E_i/k_B T)",
      freeEnergy: "F = -k_B T ln(Z)",
      entropyGibbs: "S = -k_B Σ p_i ln(p_i)",
      equipartition: "Each quadratic degree of freedom has energy k_B T/2"
    },
    maxwellRelations: {
      from_dU: "(∂T/∂V)_S = -(∂P/∂S)_V",
      from_dH: "(∂T/∂P)_S = (∂V/∂S)_P",
      from_dF: "(∂S/∂V)_T = (∂P/∂T)_V",
      from_dG: "(∂S/∂P)_T = -(∂V/∂T)_P"
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // SPECIAL RELATIVITY (Einstein 1905)
  // ═══════════════════════════════════════════════════════════════════
  specialRelativity: {
    postulates: {
      first: "Laws of physics are same in all inertial frames",
      second: "Speed of light is same in all inertial frames"
    },
    lorentzTransformations: {
      gamma: "γ = 1/√(1 - v²/c²)",
      time: "t' = γ(t - vx/c²)",
      space: "x' = γ(x - vt)",
      timeDilation: "Δt = γΔτ",
      lengthContraction: "L = L₀/γ",
      verified: true,
      precision: "Tested to 10⁻²¹ level"
    },
    energyMomentum: {
      restEnergy: "E₀ = mc²",
      totalEnergy: "E = γmc²",
      momentum: "p = γmv",
      invariant: "E² = (pc)² + (mc²)²",
      masslessParticle: "E = pc for m = 0",
      verified: true
    },
    fourVectors: {
      spacetime: "x^μ = (ct, x, y, z)",
      velocity: "u^μ = γ(c, v)",
      momentum: "p^μ = (E/c, p)",
      metric: "ds² = -c²dt² + dx² + dy² + dz²"
    },
    electromagneticUnification: {
      fieldTensor: "F^μν contains both E and B",
      transformation: "E and B mix under Lorentz transformations",
      statement: "Electric and magnetic fields are aspects of single entity"
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // GENERAL RELATIVITY (Einstein 1915)
  // ═══════════════════════════════════════════════════════════════════
  generalRelativity: {
    principles: {
      equivalence: "Gravity and acceleration are locally indistinguishable",
      general_covariance: "Laws same in all reference frames",
      geometricNature: "Gravity is curvature of spacetime"
    },
    einsteinFieldEquations: {
      mathematical: "G_μν + Λg_μν = (8πG/c⁴)T_μν",
      einsteinTensor: "G_μν = R_μν - (1/2)Rg_μν",
      meaning: "Matter tells spacetime how to curve, spacetime tells matter how to move",
      verified: true
    },
    geodesicEquation: {
      statement: "Free particles follow geodesics",
      mathematical: "d²x^μ/dτ² + Γ^μ_αβ (dx^α/dτ)(dx^β/dτ) = 0"
    },
    schwarzschild: {
      metric: "ds² = -(1-r_s/r)c²dt² + (1-r_s/r)⁻¹dr² + r²dΩ²",
      schwarzschildRadius: "r_s = 2GM/c²",
      describes: "Spacetime outside spherical mass",
      verified: true
    },
    predictions: {
      gravitationalTimeDilation: { verified: true, precision: "10⁻¹⁸" },
      gravitationalRedshift: { verified: true },
      lightBending: { verified: true, precision: "10⁻⁴" },
      perihelionPrecession: { verified: true, precision: "10⁻⁷" },
      gravitationalWaves: { verified: true, date: "2015 LIGO" },
      frameDragging: { verified: true, date: "Gravity Probe B" },
      blackHoles: { verified: true, date: "2019 Event Horizon Telescope" }
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // QUANTUM MECHANICS
  // ═══════════════════════════════════════════════════════════════════
  quantumMechanics: {
    foundations: {
      waveParticleDuality: {
        deBroglie: "λ = h/p",
        meaning: "All matter exhibits wave-like properties",
        verified: true
      },
      uncertaintyPrinciple: {
        positionMomentum: "ΔxΔp ≥ ℏ/2",
        energyTime: "ΔEΔt ≥ ℏ/2",
        general: "ΔAΔB ≥ |⟨[A,B]⟩|/2",
        verified: true,
        interpretation: "Fundamental limit, not measurement limitation"
      },
      superposition: {
        statement: "Systems can exist in multiple states simultaneously",
        mathematical: "|ψ⟩ = Σc_i|φ_i⟩",
        verified: true
      },
      bornRule: {
        statement: "Probability is amplitude squared",
        mathematical: "P = |⟨φ|ψ⟩|²",
        verified: true,
        note: "Origin unexplained - assumed axiom"
      }
    },
    schrodingerEquation: {
      timeDependant: "iℏ∂|ψ⟩/∂t = Ĥ|ψ⟩",
      timeIndependent: "Ĥ|ψ⟩ = E|ψ⟩",
      verified: true
    },
    operators: {
      position: "x̂ψ = xψ",
      momentum: "p̂ = -iℏ∇",
      energy: "Ĥ = p̂²/2m + V",
      angularMomentum: "L̂ = r̂ × p̂",
      commutator: "[x̂,p̂] = iℏ"
    },
    quantumNumbers: {
      principal: "n = 1,2,3,...",
      orbital: "l = 0,1,...,n-1",
      magnetic: "m_l = -l,...,+l",
      spin: "s = ±1/2 for electrons"
    },
    entanglement: {
      statement: "Quantum correlations stronger than classical",
      bellInequality: "S ≤ 2 classically, S ≤ 2√2 quantum",
      verified: true,
      experimentalViolation: "Bell tests rule out local hidden variables",
      nobelPrize: "2022 - Aspect, Clauser, Zeilinger"
    },
    measurementProblem: {
      collapse: "Measurement causes wavefunction collapse",
      status: "UNRESOLVED",
      interpretations: ["Copenhagen", "Many-Worlds", "Pilot Wave", "QBism", "Relational"]
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // QUANTUM FIELD THEORY & STANDARD MODEL
  // ═══════════════════════════════════════════════════════════════════
  quantumFieldTheory: {
    principles: {
      fieldQuantization: "Particles are excitations of fields",
      particleCreation: "Particles can be created/destroyed",
      virtualParticles: "Intermediate states violate energy conservation briefly"
    },
    standardModel: {
      fermions: {
        quarks: {
          up: { mass: "2.2 MeV", charge: "+2/3", spin: "1/2" },
          down: { mass: "4.7 MeV", charge: "-1/3", spin: "1/2" },
          charm: { mass: "1.27 GeV", charge: "+2/3", spin: "1/2" },
          strange: { mass: "95 MeV", charge: "-1/3", spin: "1/2" },
          top: { mass: "173 GeV", charge: "+2/3", spin: "1/2" },
          bottom: { mass: "4.18 GeV", charge: "-1/3", spin: "1/2" }
        },
        leptons: {
          electron: { mass: "0.511 MeV", charge: "-1", spin: "1/2" },
          muon: { mass: "105.7 MeV", charge: "-1", spin: "1/2" },
          tau: { mass: "1777 MeV", charge: "-1", spin: "1/2" },
          electronNeutrino: { mass: "<1 eV", charge: "0", spin: "1/2" },
          muonNeutrino: { mass: "<1 eV", charge: "0", spin: "1/2" },
          tauNeutrino: { mass: "<1 eV", charge: "0", spin: "1/2" }
        }
      },
      bosons: {
        photon: { mass: "0", charge: "0", spin: "1", force: "Electromagnetic" },
        W_plus: { mass: "80.4 GeV", charge: "+1", spin: "1", force: "Weak" },
        W_minus: { mass: "80.4 GeV", charge: "-1", spin: "1", force: "Weak" },
        Z: { mass: "91.2 GeV", charge: "0", spin: "1", force: "Weak" },
        gluon: { mass: "0", charge: "0", spin: "1", force: "Strong", color: "8 types" },
        higgs: { mass: "125.1 GeV", charge: "0", spin: "0", role: "Mass generation" }
      },
      gaugeSymmetries: {
        electromagnetic: "U(1)",
        weak: "SU(2)",
        strong: "SU(3)",
        electroweak: "SU(2)×U(1)"
      },
      verified: true,
      precision: "Tested to 10⁻¹² level in some cases"
    },
    qed: {
      lagrangian: "L = ψ̄(iγ^μD_μ - m)ψ - (1/4)F_μνF^μν",
      anomalousMagneticMoment: {
        prediction: "g-2 = 0.00115965218091",
        measurement: "g-2 = 0.00115965218073",
        agreement: "10 significant figures"
      }
    },
    qcd: {
      asymtoticFreedom: "Coupling weakens at high energy",
      confinement: "Quarks cannot exist free",
      colorCharge: "Red, green, blue",
      verified: true
    },
    renormalization: {
      statement: "Infinities can be systematically removed",
      runningCouplings: "Constants depend on energy scale"
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // COSMOLOGY
  // ═══════════════════════════════════════════════════════════════════
  cosmology: {
    friedmannEquations: {
      first: "(ȧ/a)² = (8πG/3)ρ - k/a² + Λ/3",
      second: "ä/a = -(4πG/3)(ρ + 3p) + Λ/3",
      verified: true
    },
    hubbleLaw: {
      statement: "Galaxies recede proportional to distance",
      mathematical: "v = H₀d",
      hubbleConstant: "H₀ ≈ 70 km/s/Mpc",
      verified: true,
      tension: "Different methods give different H₀ - UNRESOLVED"
    },
    cosmicMicrowaveBackground: {
      temperature: "2.725 K",
      fluctuations: "~10⁻⁵",
      verified: true,
      information: "Snapshot of universe at 380,000 years"
    },
    bigBangNucleosynthesis: {
      prediction: "25% He, 75% H by mass",
      verified: true
    },
    cosmologicalPrinciple: {
      statement: "Universe is homogeneous and isotropic on large scales",
      verified: true,
      scale: "> 100 Mpc"
    },
    inflation: {
      statement: "Exponential expansion in early universe",
      solves: ["Horizon problem", "Flatness problem", "Monopole problem"],
      status: "Strongly supported but mechanism unknown"
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // NUCLEAR PHYSICS
  // ═══════════════════════════════════════════════════════════════════
  nuclearPhysics: {
    bindingEnergy: {
      semiEmpirical: "B = a_V*A - a_S*A^(2/3) - a_C*Z²/A^(1/3) - a_A*(N-Z)²/A + δ",
      massDefect: "Δm = Zm_p + Nm_n - M_nucleus",
      verified: true
    },
    nuclearForce: {
      range: "~1.5 fm",
      properties: ["Short range", "Saturation", "Spin dependent", "Charge independent"],
      mediated_by: "Pion exchange (effective theory)"
    },
    radioactiveDecay: {
      alpha: "A → A-4 + He⁴",
      beta_minus: "n → p + e⁻ + ν̄_e",
      beta_plus: "p → n + e⁺ + ν_e",
      gamma: "Excited → Ground + γ",
      halfLife: "N(t) = N₀e^(-λt)"
    },
    fission: {
      critical_mass: "Minimum mass for chain reaction",
      energy: "~200 MeV per fission",
      verified: true
    },
    fusion: {
      ppChain: "4p → He⁴ + 2e⁺ + 2ν_e + 26.7 MeV",
      CNOcycle: "Carbon-catalyzed hydrogen fusion",
      verified: true,
      stellarPower: "Powers stars"
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // CONDENSED MATTER PHYSICS
  // ═══════════════════════════════════════════════════════════════════
  condensedMatter: {
    bandTheory: {
      statement: "Electron energies form bands in solids",
      conductors: "Partially filled bands",
      insulators: "Full valence band, empty conduction band",
      semiconductors: "Small band gap",
      verified: true
    },
    superconductivity: {
      BCS: {
        mechanism: "Cooper pairs via phonon exchange",
        criticalTemperature: "T_c typically < 30K",
        verified: true
      },
      highTc: {
        materials: "Cuprates, iron-based",
        T_c: "Up to 150K",
        mechanism: "UNKNOWN - major unsolved problem"
      },
      meissnerEffect: "Perfect diamagnetism",
      fluxQuantization: "Φ = nh/2e"
    },
    superfluidity: {
      helium4: "Below 2.17K",
      helium3: "Below 2.5mK",
      properties: ["Zero viscosity", "Quantized vortices"],
      verified: true
    },
    quantumHallEffect: {
      integer: "σ_xy = ne²/h",
      fractional: "σ_xy = (p/q)e²/h",
      topological: "Robust to disorder",
      verified: true
    },
    phasTransitions: {
      orderParameter: "Distinguishes phases",
      universality: "Critical exponents depend only on symmetry",
      renormalizationGroup: "Wilson's approach"
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // QUANTUM INFORMATION
  // ═══════════════════════════════════════════════════════════════════
  quantumInformation: {
    qubit: {
      state: "|ψ⟩ = α|0⟩ + β|1⟩",
      blochSphere: "Geometric representation",
      verified: true
    },
    quantumGates: {
      hadamard: "H|0⟩ = (|0⟩+|1⟩)/√2",
      pauliX: "X|0⟩ = |1⟩",
      CNOT: "Controlled NOT",
      universal: "{H, T, CNOT} is universal"
    },
    noCloning: {
      statement: "Cannot copy unknown quantum state",
      mathematical: "No unitary U: U|ψ⟩|0⟩ = |ψ⟩|ψ⟩ for all |ψ⟩",
      verified: true
    },
    quantumCryptography: {
      BB84: "Secure key distribution",
      security: "Based on laws of physics",
      verified: true
    },
    quantumComputing: {
      advantage: "Exponential speedup for some problems",
      algorithms: ["Shor (factoring)", "Grover (search)", "VQE"],
      decoherence: "Main engineering challenge"
    },
    quantumEntropy: {
      vonNeumann: "S = -Tr(ρ log ρ)",
      mutualInformation: "I(A:B) = S(A) + S(B) - S(AB)"
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// UNEXPLAINED PHENOMENA - Things we observe but don't understand
// ═══════════════════════════════════════════════════════════════════
const UNEXPLAINED_PHENOMENA = {

  darkMatter: {
    evidence: [
      "Galaxy rotation curves are flat (should decrease)",
      "Gravitational lensing stronger than visible matter explains",
      "CMB power spectrum requires non-baryonic matter",
      "Galaxy cluster dynamics",
      "Bullet Cluster - matter and gravity separated"
    ],
    amount: "~27% of universe",
    candidates: ["WIMPs", "Axions", "Primordial black holes", "Modified gravity (MOND)"],
    directDetection: "None confirmed despite decades of searching",
    status: "MAJOR UNSOLVED PROBLEM"
  },

  darkEnergy: {
    evidence: [
      "Accelerating expansion of universe (1998 supernovae)",
      "CMB power spectrum",
      "Baryon acoustic oscillations"
    ],
    amount: "~68% of universe",
    equation_of_state: "w ≈ -1 (cosmological constant?)",
    coincidenceProblem: "Why is it same order as matter density NOW?",
    cosmologicalConstantProblem: {
      description: "QFT predicts Λ 10¹²⁰ times too large",
      status: "WORST PREDICTION IN PHYSICS"
    },
    status: "MAJOR UNSOLVED PROBLEM"
  },

  matterAntimatterAsymmetry: {
    observation: "Universe is mostly matter, not antimatter",
    sakharovConditions: ["Baryon number violation", "C and CP violation", "Out of equilibrium"],
    problem: "Known CP violation too small by 10 orders of magnitude",
    status: "UNSOLVED - why do we exist?"
  },

  quantumGravity: {
    problem: "GR and QM are incompatible",
    regimes: {
      planckScale: "l_P = √(ℏG/c³) ≈ 10⁻³⁵ m",
      singularities: "Black holes, Big Bang"
    },
    approaches: ["String theory", "Loop quantum gravity", "Causal dynamical triangulation"],
    predictions: "None testable with current technology",
    status: "MAJOR UNSOLVED PROBLEM"
  },

  blackHoleInformationParadox: {
    hawkingRadiation: "Black holes evaporate",
    problem: "Information seems destroyed, violating QM unitarity",
    proposals: ["Information in radiation", "Remnants", "Firewalls", "ER=EPR"],
    status: "UNRESOLVED"
  },

  measurementProblem: {
    description: "What causes wavefunction collapse?",
    decoherence: "Explains appearance of collapse, not actual collapse",
    interpretations: {
      copenhagen: "Collapse is real but unexplained",
      manyWorlds: "No collapse, universe branches",
      pilotWave: "Hidden variables guide particles",
      qbism: "Quantum states are subjective"
    },
    status: "FOUNDATIONAL UNSOLVED PROBLEM"
  },

  arrowOfTime: {
    observation: "Time has preferred direction",
    sources: ["Thermodynamic", "Cosmological", "Quantum", "Psychological"],
    problem: "Fundamental laws are time-symmetric",
    pastHypothesis: "Low entropy initial condition needed but unexplained",
    status: "UNSOLVED"
  },

  fineStructureConstant: {
    value: "α ≈ 1/137.036",
    question: "Why this value?",
    anthropic: "Life requires α in narrow range",
    variation: {
      spatial: "Some evidence for variation (disputed)",
      temporal: "Constrained to <10⁻¹⁵ per year"
    },
    status: "NO EXPLANATION"
  },

  neutrinoMasses: {
    oscillations: "Prove neutrinos have mass",
    problem: "Standard Model predicts massless neutrinos",
    masses: "Much smaller than other fermions - why?",
    hierarchy: "Unknown ordering",
    majoranaNature: "Unknown if Majorana or Dirac",
    status: "BEYOND STANDARD MODEL"
  },

  hierarchyProblem: {
    description: "Why is Higgs mass 125 GeV not 10¹⁹ GeV?",
    naturalness: "Requires fine-tuning of 1 in 10³⁴",
    solutions: ["Supersymmetry", "Compositeness", "Extra dimensions"],
    status: "NO CONFIRMED SOLUTION"
  },

  strongCPProblem: {
    description: "QCD should violate CP but doesn't",
    theta_parameter: "θ < 10⁻¹⁰ (why so small?)",
    solution: "Axion (not yet discovered)",
    status: "UNSOLVED"
  },

  quantumVacuum: {
    fluctuations: "Virtual particles constantly appear/disappear",
    casimirEffect: "Attractive force between plates (verified)",
    vacuumEnergy: "Should gravitate but cosmological constant too small",
    status: "CONCEPTUALLY TROUBLED"
  },

  protonRadiusPuzzle: {
    description: "Muonic hydrogen gives different proton radius",
    electronMeasurement: "0.877 fm",
    muonMeasurement: "0.842 fm",
    discrepancy: "5σ significance",
    status: "RECENT PUZZLE (possibly resolved?)"
  },

  muonG2Anomaly: {
    prediction: "g-2 from Standard Model",
    measurement: "Fermilab 2021, 4.2σ deviation",
    implication: "New physics or calculation error?",
    status: "ACTIVE INVESTIGATION"
  },

  hubbleTension: {
    early_universe: "H₀ = 67.4 km/s/Mpc (Planck CMB)",
    late_universe: "H₀ = 73.0 km/s/Mpc (distance ladder)",
    discrepancy: "5σ significance",
    implications: "New physics? Systematic errors?",
    status: "MAJOR CURRENT PUZZLE"
  },

  quantumDecoherence: {
    observation: "Quantum effects disappear at large scales",
    explanation: "Environment-induced decoherence",
    remaining_question: "Is it fundamental or emergent?",
    quantumClassicalBoundary: "Where exactly is it?",
    status: "PARTIALLY UNDERSTOOD"
  },

  emergenceOfClassicality: {
    question: "How does classical world emerge from quantum?",
    decoherence: "Necessary but not sufficient",
    einselection: "Environment selects preferred basis",
    status: "ACTIVE RESEARCH"
  },

  timeInQuantumMechanics: {
    problem: "Time is parameter, not operator in QM",
    noTimeOperator: "No self-adjoint time observable",
    quantumGravity: "Time should be dynamical",
    status: "FOUNDATIONAL ISSUE"
  },

  wavefunctionOntology: {
    question: "Is wavefunction real?",
    psiOntic: "Wavefunction is physical",
    psiEpistemic: "Wavefunction is knowledge",
    PBRTheorem: "Rules out some epistemic interpretations",
    status: "PHILOSOPHICAL BUT PHYSICAL"
  },

  unusualObservations: {
    flybyAnomaly: "Spacecraft gain unexpected energy during flybys",
    pioneerAnomaly: "Resolved as thermal radiation",
    galaxyWithoutDarkMatter: "NGC 1052-DF2 - how?",
    fastRadioBursts: "Extragalactic millisecond bursts",
    ultrahighEnergyCosmicRays: "Beyond GZK cutoff",
    wow_signal: "1977 unexplained signal"
  },

  possibleNewPhysicsHints: {
    B_meson_anomalies: "Lepton universality violation?",
    W_boson_mass: "CDF measurement 7σ from prediction",
    excessGammaRays: "Galactic center excess"
  }
};

// ═══════════════════════════════════════════════════════════════════
// MATHEMATICAL STRUCTURES IN PHYSICS
// ═══════════════════════════════════════════════════════════════════
const MATHEMATICAL_STRUCTURES = {

  symmetries: {
    noetherTheorem: "Every continuous symmetry has conserved quantity",
    discrete: ["P (parity)", "C (charge)", "T (time reversal)", "CPT"],
    continuous: ["Translation", "Rotation", "Lorentz", "Gauge"],
    spontaneousBreaking: "Ground state has less symmetry than laws"
  },

  groupTheory: {
    U1: "Circle rotations - electromagnetism",
    SU2: "2x2 unitary matrices - weak force",
    SU3: "3x3 unitary matrices - strong force",
    lorentzGroup: "Spacetime symmetries",
    poincareGroup: "Lorentz + translations"
  },

  differentialGeometry: {
    manifolds: "Locally Euclidean spaces",
    metric: "Distance measurement",
    connection: "Parallel transport",
    curvature: "Riemann tensor",
    geodesics: "Straightest paths"
  },

  topology: {
    homotopy: "Continuous deformations",
    homology: "Holes in spaces",
    fiberBundles: "Gauge theories",
    characteristicClasses: "Global obstructions"
  },

  functionalAnalysis: {
    hilbertSpace: "Quantum state space",
    operators: "Observables",
    spectra: "Possible measurement outcomes",
    distributions: "Dirac delta"
  },

  informationTheory: {
    entropy: "Information content",
    mutualInformation: "Correlation measure",
    channelCapacity: "Communication limits",
    holographicPrinciple: "Information on boundaries"
  }
};

// ═══════════════════════════════════════════════════════════════════
// DIMENSIONAL ANALYSIS AND SCALING
// ═══════════════════════════════════════════════════════════════════
const DIMENSIONAL_ANALYSIS = {
  baseDimensions: ["Length L", "Mass M", "Time T", "Current I", "Temperature Θ", "Amount N", "Luminosity J"],

  derivedUnits: {
    velocity: "L/T",
    acceleration: "L/T²",
    force: "ML/T²",
    energy: "ML²/T²",
    power: "ML²/T³",
    pressure: "M/(LT²)",
    entropy: "ML²/(T²Θ)"
  },

  planckUnits: {
    philosophy: "Natural units where c = G = ℏ = k_B = 1",
    length: "l_P = √(ℏG/c³) ≈ 1.6×10⁻³⁵ m",
    time: "t_P = √(ℏG/c⁵) ≈ 5.4×10⁻⁴⁴ s",
    mass: "m_P = √(ℏc/G) ≈ 2.2×10⁻⁸ kg",
    temperature: "T_P = √(ℏc⁵/(Gk_B²)) ≈ 1.4×10³² K",
    significance: "Regime where quantum gravity matters"
  },

  scalingLaws: {
    geometric: "Area ~ L², Volume ~ L³",
    galileo: "Strength/weight ~ 1/L",
    metabolic: "Metabolism ~ M^(3/4)",
    turbulence: "Kolmogorov scaling"
  }
};

// ═══════════════════════════════════════════════════════════════════
// CROSS-DOMAIN CONNECTIONS (What agents should explore)
// ═══════════════════════════════════════════════════════════════════
const CROSS_DOMAIN_CONNECTIONS = {

  quantumThermodynamics: {
    description: "Interface of QM and thermodynamics",
    questions: [
      "What is quantum heat?",
      "Can quantum effects improve engines?",
      "Maxwell's demon with quantum systems?"
    ]
  },

  gravitationalQuantum: {
    description: "Gravity meets quantum",
    questions: [
      "Does gravity collapse wavefunctions?",
      "Is spacetime quantum?",
      "Gravitational decoherence?"
    ]
  },

  informationPhysics: {
    description: "Information as fundamental",
    questions: [
      "Is information physical?",
      "Landauer's principle (erasure costs energy)",
      "Holographic principle",
      "It from bit?"
    ]
  },

  emergenceComplexity: {
    description: "How complex behavior emerges",
    questions: [
      "Phase transitions and criticality",
      "Self-organization",
      "Origin of life from physics",
      "Consciousness from matter"
    ]
  },

  unificationAttempts: {
    electroweak: "Unified at ~100 GeV (verified)",
    grandUnified: "Unify strong force at ~10¹⁶ GeV (unverified)",
    TOE: "Include gravity (no consistent theory)"
  }
};

module.exports = {
  PHYSICS_KNOWLEDGE,
  UNEXPLAINED_PHENOMENA,
  MATHEMATICAL_STRUCTURES,
  DIMENSIONAL_ANALYSIS,
  CROSS_DOMAIN_CONNECTIONS
};
