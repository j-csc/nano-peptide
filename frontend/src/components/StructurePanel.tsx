import { useEffect, useRef, useState } from 'react'
import { usePeptideStore } from '../store/peptideStore'
import { sequenceToSMILES } from '../lib/aminoAcids'

/**
 * 2D structure depiction using RDKit.js (WASM).
 * Renders the peptide as a 2D chemical structure.
 */
export function StructurePanel() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const rdkitRef = useRef<any>(null)
  const { sequence } = usePeptideStore()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Initialize RDKit
  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        setLoading(true)
        // RDKit.js exports initRDKitModule as default
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

  // Render 2D structure when sequence changes
  useEffect(() => {
    if (!rdkitRef.current || !sequence || !canvasRef.current) return

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
      setError('Render error (peptide may be too large for 2D)')
    }
  }, [sequence])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xs animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Loading RDKit WASM...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--accent-orange)' }}>{error}</p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            2D depiction works best for short peptides (&lt;10 residues)
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full overflow-hidden">
      {!sequence ? (
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Enter a sequence to see 2D structure
        </p>
      ) : (
        <div ref={canvasRef} className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full" />
      )}
    </div>
  )
}
