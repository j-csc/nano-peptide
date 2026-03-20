import { useState } from 'react'
import { usePeptideStore } from '../store/peptideStore'
import type { DockingResult } from '../lib/receptorDocking'

const CATEGORY_COLORS: Record<string, string> = {
  metabolic: 'var(--accent-green)',
  growth: 'var(--accent-blue)',
  hormonal: 'var(--accent-purple)',
  immune: 'var(--accent-orange)',
  neuro: 'var(--accent-red)',
}

const CONFIDENCE_COLORS = {
  high: 'var(--accent-green)',
  medium: 'var(--accent-orange)',
  low: 'var(--text-secondary)',
}

export function DockingPanel() {
  const { dockingResults, sequence } = usePeptideStore()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  if (!sequence || sequence.length < 3) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Enter a peptide sequence to screen targets
        </p>
      </div>
    )
  }

  const filtered = filter === 'all'
    ? dockingResults
    : dockingResults.filter(r => r.receptor.category === filter)

  const topHit = dockingResults[0]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top hit summary */}
      {topHit && topHit.overallScore > 15 && (
        <div
          className="mx-2 mt-2 p-2 rounded text-xs"
          style={{
            background: `${CONFIDENCE_COLORS[topHit.confidence]}11`,
            border: `1px solid ${CONFIDENCE_COLORS[topHit.confidence]}33`,
          }}
        >
          <div className="font-semibold" style={{ color: CONFIDENCE_COLORS[topHit.confidence] }}>
            Top match: {topHit.receptor.name}
          </div>
          <div style={{ color: 'var(--text-secondary)' }} className="mt-0.5">
            {topHit.receptor.phenotype}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-1 px-2 py-1.5 flex-wrap">
        {['all', 'metabolic', 'growth', 'hormonal', 'neuro'].map(cat => (
          <button
            key={cat}
            className="px-1.5 py-0.5 rounded text-xs cursor-pointer transition-colors"
            style={{
              background: filter === cat ? 'var(--bg-tertiary)' : 'transparent',
              color: cat === 'all' ? 'var(--text-secondary)' : CATEGORY_COLORS[cat] || 'var(--text-secondary)',
              border: `1px solid ${filter === cat ? 'var(--border-color)' : 'transparent'}`,
            }}
            onClick={() => setFilter(cat)}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filtered.map(result => (
          <DockingResultCard
            key={result.receptor.id}
            result={result}
            isExpanded={expanded === result.receptor.id}
            onToggle={() => setExpanded(
              expanded === result.receptor.id ? null : result.receptor.id
            )}
          />
        ))}
      </div>
    </div>
  )
}

function DockingResultCard({
  result,
  isExpanded,
  onToggle,
}: {
  result: DockingResult
  isExpanded: boolean
  onToggle: () => void
}) {
  const { receptor, overallScore, motifScore, propertyScore, similarityScore, confidence } = result
  const catColor = CATEGORY_COLORS[receptor.category] || 'var(--text-secondary)'

  return (
    <div
      className="mb-1.5 rounded overflow-hidden cursor-pointer transition-colors"
      style={{
        background: 'var(--bg-primary)',
        border: `1px solid ${isExpanded ? catColor + '44' : 'var(--border-color)'}`,
      }}
      onClick={onToggle}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 p-2">
        {/* Score bar */}
        <div className="w-8 shrink-0 text-right">
          <span
            className="text-xs font-bold font-mono"
            style={{ color: CONFIDENCE_COLORS[confidence] }}
          >
            {Math.round(overallScore)}
          </span>
        </div>

        {/* Score indicator bar */}
        <div className="w-12 h-1.5 rounded-full shrink-0" style={{ background: 'var(--bg-tertiary)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(overallScore, 100)}%`,
              background: CONFIDENCE_COLORS[confidence],
            }}
          />
        </div>

        {/* Receptor info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {receptor.name}
            </span>
            <span
              className="text-xs px-1 rounded"
              style={{ background: catColor + '22', color: catColor, fontSize: '9px' }}
            >
              {receptor.category}
            </span>
          </div>
        </div>

        {/* Expand indicator */}
        <span className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
          {isExpanded ? '\u25B2' : '\u25BC'}
        </span>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-2 pb-2 pt-0" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            {receptor.fullName}
          </div>

          {/* Phenotype / effect */}
          <div className="mb-2">
            <div className="text-xs font-semibold mb-0.5" style={{ color: catColor }}>
              Body Effect
            </div>
            <div className="text-xs" style={{ color: 'var(--text-primary)' }}>
              {receptor.phenotype}
            </div>
          </div>

          <div className="mb-2">
            <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>
              Mechanism
            </div>
            <div className="text-xs" style={{ color: 'var(--text-primary)' }}>
              {receptor.effect}
            </div>
          </div>

          {/* Score breakdown */}
          <div className="space-y-1">
            <ScoreBar label="Similarity" value={similarityScore} />
            <ScoreBar label="Motif" value={motifScore} />
            <ScoreBar label="Properties" value={propertyScore} />
          </div>

          {/* Explanation */}
          <div className="mt-1.5 text-xs" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            {result.explanation}
          </div>
        </div>
      )}
    </div>
  )
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 60 ? 'var(--accent-green)' : value >= 30 ? 'var(--accent-orange)' : 'var(--text-secondary)'
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-16 shrink-0" style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <div className="flex-1 h-1 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(value, 100)}%`, background: color }}
        />
      </div>
      <span className="text-xs w-6 text-right font-mono" style={{ color }}>{value}</span>
    </div>
  )
}
