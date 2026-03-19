import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { usePeptideStore, type ViewMode, type ColorScheme } from '../store/peptideStore'

/** Maps our view modes to Mol* built-in representation types */
const VIEW_MODE_MAP: Record<ViewMode, string> = {
  'cartoon': 'cartoon',
  'ball-and-stick': 'ball-and-stick',
  'spacefill': 'spacefill',
  'surface': 'molecular-surface',
}

/** Maps our color schemes to Mol* built-in color theme names */
const COLOR_SCHEME_MAP: Record<ColorScheme, string> = {
  'residue': 'residue-name',
  'hydrophobicity': 'hydrophobicity',
  'charge': 'residue-charge',
  'secondary': 'secondary-structure',
}

/**
 * 3D molecular viewer using Mol* (molstar).
 * Renders peptide structures from PDB data with multiple representation modes.
 */
export function MolstarViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const pluginRef = useRef<any>(null)
  const trajectoryRef = useRef<any>(null)
  const { pdbData, viewMode, colorScheme } = usePeptideStore()

  // Initialize Mol* plugin
  useEffect(() => {
    if (!containerRef.current) return

    let cancelled = false

    async function init() {
      const { createPluginUI } = await import('molstar/lib/mol-plugin-ui')
      const { DefaultPluginUISpec } = await import('molstar/lib/mol-plugin-ui/spec')

      if (cancelled || !containerRef.current) return

      const plugin = await createPluginUI({
        target: containerRef.current,
        render: (component: any, container: Element) => {
          const root = createRoot(container)
          root.render(component)
          return root
        },
        spec: {
          ...DefaultPluginUISpec(),
          layout: {
            initial: {
              isExpanded: false,
              showControls: false,
              regionState: {
                bottom: 'hidden' as const,
                left: 'hidden' as const,
                right: 'hidden' as const,
                top: 'hidden' as const,
              },
            },
          },
        },
      })

      if (cancelled) {
        plugin.dispose()
        return
      }

      // Set dark background
      const renderer = plugin.canvas3d?.props.renderer
      if (renderer) {
        plugin.canvas3d?.setProps({
          renderer: { ...renderer, backgroundColor: 0x0a0a0f as any },
        })
      }

      pluginRef.current = plugin
    }

    init()

    return () => {
      cancelled = true
      if (pluginRef.current) {
        pluginRef.current.dispose()
        pluginRef.current = null
      }
    }
  }, [])

  // Load PDB data when it changes
  useEffect(() => {
    if (!pluginRef.current || !pdbData) return

    async function loadStructure() {
      const plugin = pluginRef.current
      if (!plugin) return

      try {
        plugin.clear()
        trajectoryRef.current = null

        const data = await plugin.builders.data.rawData({
          data: pdbData,
          label: 'peptide',
        })

        const trajectory = await plugin.builders.structure.parseTrajectory(data, 'pdb')
        trajectoryRef.current = trajectory

        // Build model and structure manually so we can control the representation
        const model = await plugin.builders.structure.createModel(trajectory)
        const structure = await plugin.builders.structure.createStructure(model)

        // Apply the initial representation
        await applyRepresentation(plugin, structure, viewMode, colorScheme)

        plugin.managers.camera.reset()
      } catch (e) {
        console.error('Failed to load structure:', e)
      }
    }

    loadStructure()
  }, [pdbData])

  // Update representation when viewMode or colorScheme changes
  useEffect(() => {
    if (!pluginRef.current || !pdbData) return

    async function updateRepresentation() {
      const plugin = pluginRef.current
      if (!plugin) return

      // Get current structures from the hierarchy
      const structures = plugin.managers.structure.hierarchy.current.structures
      if (!structures || structures.length === 0) return

      try {
        // Clear all existing components/representations
        const structureRef = structures[0]
        await plugin.managers.structure.component.clear([structureRef])

        // Get the structure cell reference
        const structureCell = structureRef.cell
        if (!structureCell?.obj) return

        await applyRepresentation(plugin, structureCell, viewMode, colorScheme)
      } catch (e) {
        console.error('Failed to update representation:', e)
      }
    }

    updateRepresentation()
  }, [viewMode, colorScheme])

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {!pdbData && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-4xl mb-3 opacity-20">&#x1F9EC;</div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Enter a sequence and click Visualize
            </p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}

async function applyRepresentation(plugin: any, structure: any, viewMode: ViewMode, colorScheme: ColorScheme) {
  const { createStructureRepresentationParams } = await import(
    'molstar/lib/mol-plugin-state/helpers/structure-representation-params'
  )

  const reprType = VIEW_MODE_MAP[viewMode] as any
  const colorType = COLOR_SCHEME_MAP[colorScheme] as any

  const params = createStructureRepresentationParams(plugin, undefined, {
    type: reprType,
    color: colorType,
  })

  await plugin.builders.structure.representation.addRepresentation(structure, params)
}
