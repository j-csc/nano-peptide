import { usePeptideStore } from '../store/peptideStore'
import { AMINO_ACIDS } from '../lib/aminoAcids'

export function PropertyPanel() {
  const { properties, sequence, hoveredResidue, setHoveredResidue } = usePeptideStore()

  if (!properties) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          No sequence loaded
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-3 h-full overflow-y-auto">
      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="MW" value={`${properties.molecularWeight.toFixed(1)} Da`} />
        <MetricCard label="Charge" value={properties.netCharge.toFixed(1)} color={properties.netCharge > 0 ? 'var(--accent-blue)' : properties.netCharge < 0 ? 'var(--accent-red)' : 'var(--text-primary)'} />
        <MetricCard label="pI" value={properties.isoelectricPoint.toFixed(2)} />
        <MetricCard label="GRAVY" value={properties.gravy.toFixed(2)} color={properties.gravy > 0 ? 'var(--accent-orange)' : 'var(--accent-blue)'} />
        <MetricCard label="Length" value={`${properties.length} aa`} />
        <MetricCard
          label="Stability"
          value={properties.isStable ? 'Stable' : 'Unstable'}
          color={properties.isStable ? 'var(--accent-green)' : 'var(--accent-red)'}
        />
      </div>

      {/* Sequence view with colored residues */}
      <div>
        <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Sequence
        </div>
        <div className="flex flex-wrap gap-0.5 font-mono text-xs">
          {sequence.split('').map((aa, i) => {
            const info = AMINO_ACIDS[aa]
            return (
              <span
                key={i}
                className="px-1 py-0.5 rounded cursor-pointer transition-all"
                style={{
                  background: hoveredResidue === i ? 'var(--accent-blue)' : `${info?.color}22`,
                  color: hoveredResidue === i ? '#000' : info?.color || 'var(--text-primary)',
                  border: `1px solid ${hoveredResidue === i ? 'var(--accent-blue)' : 'transparent'}`,
                }}
                onMouseEnter={() => setHoveredResidue(i)}
                onMouseLeave={() => setHoveredResidue(null)}
                title={`${i + 1}: ${info?.name || aa} (${info?.code3 || '???'})`}
              >
                {aa}
              </span>
            )
          })}
        </div>
      </div>

      {/* Composition bar */}
      <div>
        <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Composition
        </div>
        <div className="flex h-4 rounded overflow-hidden">
          {Object.entries(properties.composition)
            .sort((a, b) => b[1] - a[1])
            .map(([aa, count]) => {
              const info = AMINO_ACIDS[aa]
              const pct = (count / properties.length) * 100
              return (
                <div
                  key={aa}
                  className="relative group"
                  style={{
                    width: `${pct}%`,
                    background: info?.color || '#666',
                    minWidth: pct > 0 ? '2px' : '0',
                  }}
                  title={`${aa} (${info?.name}): ${count} (${pct.toFixed(1)}%)`}
                />
              )
            })}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
          {Object.entries(properties.composition)
            .sort((a, b) => b[1] - a[1])
            .map(([aa, count]) => (
              <span key={aa} className="text-xs" style={{ color: AMINO_ACIDS[aa]?.color }}>
                {aa}: {count}
              </span>
            ))}
        </div>
      </div>

      {/* Hydrophobicity profile */}
      <div>
        <div className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Hydrophobicity Profile
        </div>
        <HydrophobicityPlot sequence={sequence} />
      </div>
    </div>
  )
}

function MetricCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="p-2 rounded" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</div>
      <div className="text-sm font-semibold font-mono" style={{ color: color || 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  )
}

function HydrophobicityPlot({ sequence }: { sequence: string }) {
  const residues = sequence.split('')
  const values = residues.map(aa => AMINO_ACIDS[aa]?.hydrophobicity || 0)
  const max = Math.max(...values.map(Math.abs), 4.5)

  const width = 300
  const height = 60
  const barWidth = Math.min(width / values.length, 8)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: '60px' }}>
      {/* Zero line */}
      <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--border-color)" strokeWidth="0.5" />
      {values.map((v, i) => {
        const x = (i / values.length) * width
        const barHeight = (Math.abs(v) / max) * (height / 2 - 2)
        const y = v >= 0 ? height / 2 - barHeight : height / 2
        const color = v >= 0 ? 'var(--accent-orange)' : 'var(--accent-blue)'
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={Math.max(barWidth - 1, 1)}
            height={barHeight}
            fill={color}
            opacity={0.7}
            rx={0.5}
          />
        )
      })}
    </svg>
  )
}
