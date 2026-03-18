import { usePeptideStore } from '../store/peptideStore'
import { EXAMPLE_PEPTIDES } from '../lib/aminoAcids'
import type { SecondaryStructure } from '../lib/pdbGenerator'
import { useState } from 'react'

interface Props {
  onGenerate: (structure: SecondaryStructure) => void
}

export function SequenceInput({ onGenerate }: Props) {
  const { sequence, setSequence, isLoading } = usePeptideStore()
  const [structure, setStructure] = useState<SecondaryStructure>('helix')

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)' }}
        />
        <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-secondary)' }}>
          Peptide Sequence
        </span>
      </div>

      <textarea
        value={sequence}
        onChange={(e) => setSequence(e.target.value)}
        placeholder="Enter amino acid sequence (e.g., ACDEFGHIKLMNPQRSTVWY)..."
        spellCheck={false}
        className="w-full h-20 p-3 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-1"
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
        }}
      />

      <div className="flex gap-2 items-center flex-wrap">
        <select
          value={structure}
          onChange={(e) => setStructure(e.target.value as SecondaryStructure)}
          className="px-3 py-1.5 rounded text-xs cursor-pointer"
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="helix">Alpha Helix</option>
          <option value="sheet">Beta Sheet</option>
          <option value="coil">Random Coil</option>
        </select>

        <button
          onClick={() => onGenerate(structure)}
          disabled={!sequence || isLoading}
          className="px-4 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: sequence ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
            color: sequence ? '#000' : 'var(--text-secondary)',
          }}
        >
          {isLoading ? 'Generating...' : 'Visualize'}
        </button>

        <div className="flex-1" />

        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {sequence.length} residues
        </span>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        <span className="text-xs py-0.5" style={{ color: 'var(--text-secondary)' }}>Examples:</span>
        {Object.entries(EXAMPLE_PEPTIDES).map(([name, seq]) => (
          <button
            key={name}
            onClick={() => { setSequence(seq); onGenerate(structure) }}
            className="px-2 py-0.5 rounded text-xs transition-colors cursor-pointer hover:opacity-80"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--accent-purple)',
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}
