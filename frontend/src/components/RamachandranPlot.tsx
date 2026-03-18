import { useMemo } from 'react'
import { extractBackboneAngles } from '../lib/pdbGenerator'
import { usePeptideStore } from '../store/peptideStore'
import { AMINO_ACIDS } from '../lib/aminoAcids'

export function RamachandranPlot() {
  const { pdbData, hoveredResidue, setHoveredResidue } = usePeptideStore()

  const angles = useMemo(() => {
    if (!pdbData) return []
    return extractBackboneAngles(pdbData)
  }, [pdbData])

  if (!pdbData || angles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          Generate structure to see Ramachandran plot
        </p>
      </div>
    )
  }

  const size = 200
  const margin = 25
  const plotSize = size - 2 * margin

  const toX = (phi: number) => margin + ((phi + 180) / 360) * plotSize
  const toY = (psi: number) => margin + ((180 - psi) / 360) * plotSize

  return (
    <div className="flex items-center justify-center h-full p-2">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[200px]">
        {/* Background */}
        <rect x={margin} y={margin} width={plotSize} height={plotSize} fill="var(--bg-primary)" stroke="var(--border-color)" strokeWidth="0.5" />

        {/* Favored regions (approximate) */}
        {/* Alpha helix region */}
        <ellipse cx={toX(-63)} cy={toY(-43)} rx={20} ry={15} fill="var(--accent-blue)" opacity={0.08} />
        {/* Beta sheet region */}
        <ellipse cx={toX(-120)} cy={toY(130)} rx={25} ry={20} fill="var(--accent-green)" opacity={0.08} />
        {/* Left-handed helix */}
        <ellipse cx={toX(57)} cy={toY(47)} rx={15} ry={12} fill="var(--accent-purple)" opacity={0.08} />

        {/* Grid lines */}
        <line x1={toX(0)} y1={margin} x2={toX(0)} y2={size - margin} stroke="var(--border-color)" strokeWidth="0.3" strokeDasharray="2,2" />
        <line x1={margin} y1={toY(0)} x2={size - margin} y2={toY(0)} stroke="var(--border-color)" strokeWidth="0.3" strokeDasharray="2,2" />

        {/* Axis labels */}
        <text x={size / 2} y={size - 3} textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace">
          Phi (deg)
        </text>
        <text x={5} y={size / 2} textAnchor="middle" fill="var(--text-secondary)" fontSize="7" fontFamily="monospace" transform={`rotate(-90, 5, ${size / 2})`}>
          Psi (deg)
        </text>

        {/* Tick labels */}
        <text x={toX(-180)} y={size - margin + 10} textAnchor="middle" fill="var(--text-secondary)" fontSize="6">-180</text>
        <text x={toX(0)} y={size - margin + 10} textAnchor="middle" fill="var(--text-secondary)" fontSize="6">0</text>
        <text x={toX(180)} y={size - margin + 10} textAnchor="middle" fill="var(--text-secondary)" fontSize="6">180</text>
        <text x={margin - 3} y={toY(-180) + 2} textAnchor="end" fill="var(--text-secondary)" fontSize="6">-180</text>
        <text x={margin - 3} y={toY(0) + 2} textAnchor="end" fill="var(--text-secondary)" fontSize="6">0</text>
        <text x={margin - 3} y={toY(180) + 2} textAnchor="end" fill="var(--text-secondary)" fontSize="6">180</text>

        {/* Data points */}
        {angles.map((a, i) => {
          if (a.phi === null || a.psi === null) return null
          const isHovered = hoveredResidue === a.resIndex
          const color = AMINO_ACIDS[a.residue]?.color || 'var(--text-primary)'
          return (
            <g key={i}>
              <circle
                cx={toX(a.phi)}
                cy={toY(a.psi)}
                r={isHovered ? 5 : 3}
                fill={color}
                stroke={isHovered ? '#fff' : 'none'}
                strokeWidth={1}
                opacity={isHovered ? 1 : 0.8}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredResidue(a.resIndex)}
                onMouseLeave={() => setHoveredResidue(null)}
              />
              {isHovered && (
                <text
                  x={toX(a.phi) + 7}
                  y={toY(a.psi) - 5}
                  fill="#fff"
                  fontSize="7"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {a.residue}{a.resIndex + 1}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
