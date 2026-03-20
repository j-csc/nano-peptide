import { useCallback } from 'react'
import { SequenceInput } from './components/SequenceInput'
import { MolstarViewer } from './components/MolstarViewer'
import { StructurePanel } from './components/StructurePanel'
import { PropertyPanel } from './components/PropertyPanel'
import { RamachandranPlot } from './components/RamachandranPlot'
import { DockingPanel } from './components/DockingPanel'
import { ViewerControls } from './components/ViewerControls'
import { usePeptideStore } from './store/peptideStore'
import { generatePDB, type SecondaryStructure } from './lib/pdbGenerator'

export default function App() {
  const { sequence, setPdbData, setIsLoading, pdbData } = usePeptideStore()

  const handleGenerate = useCallback((structure: SecondaryStructure) => {
    if (!sequence) return
    setIsLoading(true)
    // Use requestAnimationFrame to not block UI
    requestAnimationFrame(() => {
      const pdb = generatePDB(sequence, structure)
      setPdbData(pdb)
      setIsLoading(false)
    })
  }, [sequence, setPdbData, setIsLoading])

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold tracking-tight" style={{ color: 'var(--accent-green)' }}>
            nano-peptide
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
            v0.1
          </span>
        </div>
        {pdbData && <ViewerControls />}
      </header>

      <div className="flex-1 flex min-h-0">
        {/* Left sidebar */}
        <aside className="w-80 shrink-0 flex flex-col" style={{ borderRight: '1px solid var(--border-color)' }}>
          {/* Sequence input */}
          <div className="p-3 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <SequenceInput onGenerate={handleGenerate} />
          </div>

          {/* Properties */}
          <div className="shrink-0 max-h-[45%] overflow-hidden" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <PropertyPanel />
          </div>

          {/* Target Receptor Docking */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-2 px-3 py-1.5 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-red)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Target Screening</span>
            </div>
            <div className="flex-1 min-h-0">
              <DockingPanel />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* 3D Viewer */}
          <div className="flex-1 min-h-0">
            <MolstarViewer />
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="w-64 shrink-0 flex flex-col" style={{ borderLeft: '1px solid var(--border-color)' }}>
          {/* 2D Structure */}
          <div className="h-64 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 px-3 py-1.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-purple)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>2D Structure</span>
            </div>
            <StructurePanel />
          </div>

          {/* Ramachandran */}
          <div className="flex-1 min-h-0">
            <div className="flex items-center gap-2 px-3 py-1.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-orange)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Ramachandran</span>
            </div>
            <RamachandranPlot />
          </div>
        </aside>
      </div>
    </div>
  )
}
