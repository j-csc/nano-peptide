import { useEffect, useRef, useState } from 'react'
import { usePeptideStore } from '../store/peptideStore'
import { AMINO_ACIDS, sequenceToSMILES } from '../lib/aminoAcids'

const MAX_2D_RESIDUES = 15

/**
 * 2D structure depiction using RDKit.js (WASM) for short peptides,
 * with a residue-level sequence diagram fallback for larger ones.
 */
export function StructurePanel() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const rdkitRef = useRef<any>(null)
  const { sequence } = usePeptideStore()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const residues = (sequence ?? '').toUpperCase().split('').filter(c => c in AMINO_ACIDS)
  const tooLarge = residues.length > MAX_2D_RESIDUES

  // Initialize RDKit (only if we might need it)
  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        setLoading(true)
        const mod = await import('@rdkit/rdkit')
        const initRDKit = (mod as any).default ?? (mod as any).initRDKitModule ?? mod
        const rdkit = await (typeof initRDKit === 'function' ? initRDKit() : initRDKit)
        if (!cancelled) {
          rdkitRef.current = rdkit
          setLoading(false)
        }
      } catch (e) {
        console.error('Failed to init RDKit:', e)
        if (!cancelled) {
          setError('Failed to load RDKit WASM')
          setLoading(false)
        }
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  // Render 2D structure when sequence changes (only for short peptides)
  useEffect(() => {
    if (!rdkitRef.current || !sequence || !canvasRef.current || tooLarge) return

    setError(null)

    const smiles = sequenceToSMILES(sequence)
    if (!smiles) {
      setError('Could not generate SMILES')
      return
    }

    try {
      const mol = rdkitRef.current.get_mol(smiles)
      if (!mol || !mol.is_valid()) {
        setError('Invalid molecule')
        mol?.delete()
        return
      }

      const svg = mol.get_svg_with_highlights(JSON.stringify({
        width: 400,
        height: 250,
        bondLineWidth: 1.5,
        addAtomIndices: false,
        explicitMethyl: false,
        backgroundColour: [0.04, 0.04, 0.06, 1],
        highlightColour: [0.29, 0.62, 1, 0.3],
      }))

      canvasRef.current.innerHTML = svg
      setError(null)
      mol.delete()
    } catch (e) {
      console.error('RDKit render error:', e)
      setError('RDKit failed to render this peptide')
    }
  }, [sequence, tooLarge])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xs animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Loading RDKit WASM...
        </div>
      </div>
    )
  }

  if (!sequence) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Enter a sequence to see 2D structure
        </p>
      </div>
    )
  }

  // For large peptides (or RDKit failures), show residue-level diagram
  if (tooLarge || error) {
    return <ResidueSequenceDiagram residues={residues} error={error} />
  }

  return (
    <div className="flex items-center justify-center h-full overflow-hidden">
      <div ref={canvasRef} className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full" />
    </div>
  )
}

/** Hydrophobicity category for coloring */
function hydrophobicityCategory(code: string): 'hydrophobic' | 'polar' | 'positive' | 'negative' | 'special' {
  const aa = AMINO_ACIDS[code]
  if (!aa) return 'special'
  if (aa.charge > 0.5) return 'positive'
  if (aa.charge < -0.5) return 'negative'
  if (aa.hydrophobicity >= 1.8) return 'hydrophobic'
  if (code === 'G' || code === 'P' || code === 'C') return 'special'
  return 'polar'
}

const CATEGORY_COLORS: Record<string, string> = {
  hydrophobic: '#4a9e4a',
  polar: '#00b8b8',
  positive: '#4a7aff',
  negative: '#e05050',
  special: '#b8a042',
}

const CATEGORY_LABELS: Record<string, string> = {
  hydrophobic: 'Hydrophobic',
  polar: 'Polar',
  positive: 'Positive',
  negative: 'Negative',
  special: 'Special',
}

function ResidueSequenceDiagram({ residues, error }: { residues: string[]; error: string | null }) {
  return (
    <div className="flex flex-col h-full p-3 overflow-auto">
      {error && (
        <p className="text-xs mb-2" style={{ color: 'var(--accent-orange)' }}>
          {error} — showing residue diagram
        </p>
      )}
      <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
        {residues.length} residues — colored by property
      </p>

      {/* Residue blocks */}
      <div className="flex flex-wrap gap-px mb-3">
        {residues.map((r, i) => {
          const cat = hydrophobicityCategory(r)
          const color = CATEGORY_COLORS[cat]
          return (
            <div
              key={i}
              title={`${AMINO_ACIDS[r]?.name ?? r} (${AMINO_ACIDS[r]?.code3 ?? '?'})`}
              className="flex items-center justify-center text-xs font-mono font-bold rounded-sm cursor-default"
              style={{
                width: 22,
                height: 22,
                backgroundColor: color + '30',
                color,
                border: `1px solid ${color}60`,
              }}
            >
              {r}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-auto">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1">
            <div
              className="rounded-sm"
              style={{ width: 8, height: 8, backgroundColor: color }}
            />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {CATEGORY_LABELS[cat]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
