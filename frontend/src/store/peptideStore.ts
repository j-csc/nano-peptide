import { create } from 'zustand'
import { computeProperties, type AminoAcid, AMINO_ACIDS } from '../lib/aminoAcids'
import { screenAgainstTargets, type DockingResult } from '../lib/receptorDocking'

export type ViewMode = 'cartoon' | 'ball-and-stick' | 'surface' | 'spacefill'
export type ColorScheme = 'residue' | 'hydrophobicity' | 'charge' | 'secondary'

export interface PeptideProperties {
  sequence: string
  length: number
  molecularWeight: number
  netCharge: number
  isoelectricPoint: number
  gravy: number
  instabilityIndex: number
  isStable: boolean
  composition: Record<string, number>
}

export interface PeptideState {
  // Input
  sequence: string
  setSequence: (seq: string) => void

  // Computed
  properties: PeptideProperties | null
  residueInfo: AminoAcid[]

  // Docking results
  dockingResults: DockingResult[]

  // Viewer settings
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
  showHydrogen: boolean
  toggleHydrogen: () => void
  showWater: boolean
  toggleWater: () => void

  // Selection
  selectedResidue: number | null
  setSelectedResidue: (idx: number | null) => void
  hoveredResidue: number | null
  setHoveredResidue: (idx: number | null) => void

  // PDB data
  pdbData: string | null
  setPdbData: (pdb: string | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const usePeptideStore = create<PeptideState>((set) => ({
  sequence: '',
  setSequence: (seq: string) => {
    const clean = seq.toUpperCase().replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, '')
    const props = computeProperties(clean)
    const residueInfo = clean.split('').map(c => AMINO_ACIDS[c]).filter(Boolean)
    const dockingResults = clean.length >= 3 ? screenAgainstTargets(clean) : []
    set({ sequence: clean, properties: props, residueInfo, dockingResults })
  },

  properties: null,
  residueInfo: [],
  dockingResults: [],

  viewMode: 'cartoon',
  setViewMode: (mode) => set({ viewMode: mode }),
  colorScheme: 'residue',
  setColorScheme: (scheme) => set({ colorScheme: scheme }),
  showHydrogen: false,
  toggleHydrogen: () => set((s) => ({ showHydrogen: !s.showHydrogen })),
  showWater: false,
  toggleWater: () => set((s) => ({ showWater: !s.showWater })),

  selectedResidue: null,
  setSelectedResidue: (idx) => set({ selectedResidue: idx }),
  hoveredResidue: null,
  setHoveredResidue: (idx) => set({ hoveredResidue: idx }),

  pdbData: null,
  setPdbData: (pdb) => set({ pdbData: pdb }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}))
