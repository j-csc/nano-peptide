# nano-peptide: AI-Driven Peptide Discovery Engine

## Vision
An autoresearch-inspired platform that combines **autonomous AI-driven peptide discovery** with **high-performance browser-based visualization**. Think: an AI agent that generates, evaluates, and optimizes therapeutic peptide candidates — with a real-time interactive dashboard to explore results.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Frontend)                        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  React UI    │  │  Mol* 3D     │  │  RDKit.js WASM   │  │
│  │  Dashboard   │  │  Renderer    │  │  2D Depiction +   │  │
│  │  + Charts    │  │  (WebGL2)    │  │  Cheminformatics  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘  │
│         │                 │                  │              │
│         └─────────┬───────┴──────────────────┘              │
│                   │                                         │
│         ┌─────────▼─────────┐                               │
│         │  State Manager    │                               │
│         │  (Zustand)        │                               │
│         └─────────┬─────────┘                               │
│                   │                                         │
└───────────────────┼─────────────────────────────────────────┘
                    │  WebSocket + REST
┌───────────────────┼─────────────────────────────────────────┐
│                   │       Backend                           │
│         ┌─────────▼─────────┐                               │
│         │   API Gateway     │                               │
│         │   (FastAPI)       │                               │
│         └─────────┬─────────┘                               │
│                   │                                         │
│    ┌──────────────┼──────────────────┐                      │
│    │              │                  │                      │
│  ┌─▼────────┐ ┌──▼──────────┐ ┌────▼──────────┐           │
│  │ Discovery │ │ Structure   │ │ Properties    │           │
│  │ Engine    │ │ Service     │ │ Service       │           │
│  │ (Agent)   │ │ (ESMFold/   │ │ (RDKit +      │           │
│  │          │ │  AlphaFold)  │ │  Custom WASM) │           │
│  └──────────┘ └─────────────┘ └───────────────┘           │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  C++ Compute Core (compiled to native + WASM)    │      │
│  │  - Conformer generation                          │      │
│  │  - Molecular descriptors                         │      │
│  │  - Force field minimization                      │      │
│  │  - Peptide backbone geometry                     │      │
│  └──────────────────────────────────────────────────┘      │
│                                                             │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Data Layer (SQLite/DuckDB + Vector Store)       │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend (Performance-First)
| Component | Technology | Why |
|-----------|-----------|-----|
| UI Framework | **React 19 + TypeScript** | Ecosystem, tooling |
| Bundler | **Vite** | Fast HMR, WASM support |
| 3D Molecular Viz | **Mol\*** (molstar) | WebGL2, used by PDB/RCSB, handles 100k+ atoms |
| 2D Structure | **RDKit.js** (WASM) | Industry-standard cheminformatics in-browser |
| State | **Zustand** | Lightweight, no boilerplate |
| Charts | **Observable Plot** or **D3** | Flexible scientific viz |
| Styling | **Tailwind CSS** | Rapid prototyping |

### Backend
| Component | Technology | Why |
|-----------|-----------|-----|
| API Server | **FastAPI** (Python) | Async, typed, scientific ecosystem |
| Compute Core | **C++ → WASM** (Emscripten) | Heavy cheminformatics shared between server & browser |
| Structure Prediction | **ESMFold** / **AlphaFold2** | Sequence → 3D structure |
| Docking | **DiffDock** / **AutoDock Vina** | Binding pose prediction |
| ML Models | **ESM-2**, **ProteinMPNN** | Embeddings, inverse folding |
| Properties | **RDKit** (Python) + C++ core | ADMET, descriptors |
| Database | **SQLite** + **DuckDB** | Lightweight, analytical queries |
| Vector Store | **Qdrant** (or ChromaDB) | Similarity search over embeddings |
| Task Queue | **Celery** + **Redis** | Long-running compute jobs |

### C++ Compute Core (Dual-Target)
Compiled **both** as native (server-side) and WASM (browser-side):
- Peptide backbone geometry (phi/psi angles, Ramachandran)
- Conformer generation & minimization
- Molecular descriptor calculation
- Spatial hashing for fast neighbor lookups
- Uses: **Eigen** (linear algebra), **RDKit C++** (cheminformatics)

---

## Project Phases

### Phase 1: Peptide Visualizer (Current Focus)
**Goal**: Interactive web app to visualize peptides in 2D and 3D with real-time property calculation.

```
src/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MolstarViewer.tsx      # 3D peptide rendering
│   │   │   ├── StructurePanel.tsx     # 2D depiction (RDKit.js)
│   │   │   ├── SequenceInput.tsx      # Peptide sequence input
│   │   │   ├── PropertyPanel.tsx      # Computed properties display
│   │   │   └── RamachandranPlot.tsx   # Phi/Psi angle visualization
│   │   ├── wasm/
│   │   │   └── peptide-core.ts        # WASM bindings
│   │   ├── store/
│   │   │   └── peptideStore.ts        # Zustand state
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── core/                              # C++ compute core
│   ├── src/
│   │   ├── peptide.cpp                # Backbone geometry
│   │   ├── descriptors.cpp            # Molecular descriptors
│   │   └── conformer.cpp              # Conformer generation
│   ├── include/
│   │   └── peptide.h
│   ├── bindings/
│   │   └── wasm_bindings.cpp          # Embind/Emscripten bindings
│   └── CMakeLists.txt
└── README.md
```

**Features**:
- Input peptide as sequence (e.g., `ACDEFGHIKLMNPQRSTVWY`) or HELM notation
- Generate 3D structure from sequence (initial: ideal geometry, later: ESMFold)
- Mol* 3D viewer with ribbon, ball-and-stick, surface representations
- RDKit.js 2D depiction with amino acid highlighting
- Real-time property panel: MW, charge, hydrophobicity, pI
- Ramachandran plot from backbone angles
- Export to PDB/SDF/PNG

### Phase 2: Structure Prediction Integration
- ESMFold API integration for fast structure prediction
- AlphaFold2 for higher accuracy (async job queue)
- Confidence visualization (pLDDT coloring in Mol*)
- Structure comparison overlay

### Phase 3: Discovery Engine (Autoresearch Core)
- **Agent Loop**: Define target → Generate candidates → Predict structures → Score → Optimize → Repeat
- Peptide library generation (random, evolutionary, ML-guided)
- Multi-objective optimization (binding affinity, stability, selectivity, ADMET)
- LLM-powered hypothesis generation and experiment planning
- Dashboard with Pareto front visualization

### Phase 4: Advanced Features
- Protein-peptide docking (DiffDock / Vina)
- Molecular dynamics snippets (OpenMM via API)
- Sequence-activity relationship (SAR) analysis
- Collaborative campaigns (multi-user)
- Export to synthesis-ready formats

---

## Performance Strategy

### Why WASM + Mol* (not custom C++ renderer)
Mol* already provides **state-of-the-art WebGL2 molecular rendering** — it handles millions of atoms, has LOD, instanced rendering, and GPU-accelerated isosurfaces. Building a custom C++ renderer would take months for inferior results.

Instead, we use C++ WASM for **computation**:
- Property calculations: 10-100x faster than pure JS
- Conformer generation: compute-bound, perfect for WASM
- Descriptor fingerprints: bit manipulation heavy

### Rendering Pipeline
```
Sequence Input
    │
    ▼
C++ WASM Core ──→ Generate 3D coords (backbone + sidechain)
    │
    ▼
Mol* ──→ WebGL2 rendering (instanced atoms, ribbons, surfaces)
    │
    ▼
RDKit.js ──→ 2D depiction (SVG, synchronized highlighting)
```

### Data Flow
- **Small peptides (<50 aa)**: All computation in browser (WASM)
- **Large peptides/proteins**: Backend compute, stream results via WebSocket
- **Discovery campaigns**: Backend orchestration, frontend dashboard

---

## Key Design Decisions

1. **Mol\* over Three.js/custom**: Mol* is purpose-built for molecular viz, already WebGL2 optimized, and maintained by RCSB PDB team. No point rebuilding.

2. **C++ WASM for compute, not rendering**: Rendering is a solved problem (Mol*). Computation is where we gain real performance.

3. **FastAPI over C++ server**: The backend orchestrates ML models (Python ecosystem). C++ compute runs as a native library called from Python (pybind11) or as WASM in browser.

4. **Dual-target C++ core**: Same C++ code compiles to native (backend, via pybind11) and WASM (frontend, via Emscripten). Write once, run in both environments.

5. **SQLite + DuckDB over Postgres**: Lightweight, zero-config, DuckDB for analytical queries over peptide libraries. Can upgrade later if needed.

---

## Peptide Discovery Pipeline (Phase 3 Detail)

```
┌─────────────────────────────────────────────────┐
│              Discovery Campaign                  │
│                                                  │
│  1. TARGET DEFINITION                            │
│     └─ User specifies target protein + binding   │
│        site + desired properties                 │
│                                                  │
│  2. CANDIDATE GENERATION                         │
│     ├─ Random sampling from sequence space       │
│     ├─ ProteinMPNN inverse folding               │
│     ├─ Evolutionary mutations of leads           │
│     └─ LLM-suggested sequences                   │
│                                                  │
│  3. STRUCTURE PREDICTION                         │
│     ├─ ESMFold (fast, ~1s per sequence)          │
│     └─ AlphaFold2 (accurate, minutes)            │
│                                                  │
│  4. SCORING & FILTERING                          │
│     ├─ Binding affinity (DiffDock / Vina)        │
│     ├─ Stability (ΔΔG prediction)                │
│     ├─ Solubility                                │
│     ├─ Membrane permeability                     │
│     ├─ Protease resistance                       │
│     └─ Aggregation propensity                    │
│                                                  │
│  5. OPTIMIZATION                                 │
│     ├─ Pareto-optimal selection                  │
│     ├─ Bayesian optimization                     │
│     └─ Genetic algorithm crossover               │
│                                                  │
│  6. ANALYSIS & REPORTING                         │
│     ├─ SAR heatmaps                              │
│     ├─ Property distributions                    │
│     └─ LLM-generated insights                    │
│                                                  │
│  Loop: 2 → 3 → 4 → 5 → 2 (until convergence)   │
└─────────────────────────────────────────────────┘
```

---

## Getting Started (Phase 1)

```bash
# Frontend
cd frontend && npm install && npm run dev

# C++ WASM core (requires Emscripten)
cd core && mkdir build && cd build
emcmake cmake .. && make

# Backend (Phase 2+)
cd backend && pip install -e . && uvicorn app:main --reload
```
