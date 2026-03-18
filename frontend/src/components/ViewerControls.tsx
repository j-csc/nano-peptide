import { usePeptideStore, type ViewMode, type ColorScheme } from '../store/peptideStore'

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: 'cartoon', label: 'Cartoon' },
  { value: 'ball-and-stick', label: 'Ball & Stick' },
  { value: 'spacefill', label: 'Spacefill' },
  { value: 'surface', label: 'Surface' },
]

const COLOR_SCHEMES: { value: ColorScheme; label: string }[] = [
  { value: 'residue', label: 'Residue' },
  { value: 'hydrophobicity', label: 'Hydrophobic' },
  { value: 'charge', label: 'Charge' },
  { value: 'secondary', label: 'Secondary' },
]

export function ViewerControls() {
  const { viewMode, setViewMode, colorScheme, setColorScheme } = usePeptideStore()

  return (
    <div className="flex gap-4 items-center">
      <div className="flex gap-1">
        <span className="text-xs mr-1" style={{ color: 'var(--text-secondary)' }}>View:</span>
        {VIEW_MODES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setViewMode(value)}
            className="px-2 py-0.5 rounded text-xs transition-all cursor-pointer"
            style={{
              background: viewMode === value ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
              color: viewMode === value ? '#000' : 'var(--text-secondary)',
              border: `1px solid ${viewMode === value ? 'var(--accent-blue)' : 'var(--border-color)'}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-1">
        <span className="text-xs mr-1" style={{ color: 'var(--text-secondary)' }}>Color:</span>
        {COLOR_SCHEMES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setColorScheme(value)}
            className="px-2 py-0.5 rounded text-xs transition-all cursor-pointer"
            style={{
              background: colorScheme === value ? 'var(--accent-purple)' : 'var(--bg-tertiary)',
              color: colorScheme === value ? '#000' : 'var(--text-secondary)',
              border: `1px solid ${colorScheme === value ? 'var(--accent-purple)' : 'var(--border-color)'}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
