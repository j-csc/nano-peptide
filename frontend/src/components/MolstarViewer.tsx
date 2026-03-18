import { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { usePeptideStore } from '../store/peptideStore'

/**
 * 3D molecular viewer using Mol* (molstar).
 * Renders peptide structures from PDB data with multiple representation modes.
 */
export function MolstarViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const pluginRef = useRef<any>(null)
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

        const data = await plugin.builders.data.rawData({
          data: pdbData,
          label: 'peptide',
        })

        const trajectory = await plugin.builders.structure.parseTrajectory(data, 'pdb')
        await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default')

        // Reset camera to show full structure
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
    // Mol* representation updates would go here
    // For now, the default representation from the preset is used
  }, [viewMode, colorScheme, pdbData])

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
