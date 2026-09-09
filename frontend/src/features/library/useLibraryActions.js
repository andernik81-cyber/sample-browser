import { useState } from 'react'
import { libraryService } from './libraryService.js'

export const useLibraryActions = (library, onChange) => {
  const [selectedId, setSelectedId] = useState(library.folders[0]?.id || null)
  const [removalTarget, setRemovalTarget] = useState(null)
  const [operation, setOperation] = useState({ status: 'idle', message: '' })
  const selectedFolder = library.folders.find((folder) => folder.id === selectedId)
  const busy = ['selecting', 'removing', 'scanning'].includes(operation.status)
  const fail = (error) => setOperation({ status: 'error', message: `Error: ${error?.message || 'Library operation failed.'}` })

  const addFolder = async () => {
    setOperation({ status: 'selecting', message: 'Choose a folder with the prototype browser picker.' })
    try {
      const folder = await libraryService.selectFolder()
      if (folder) {
        onChange((current) => ({ ...current, folders: [...current.folders, folder] }))
        setSelectedId(folder.id)
      }
      setOperation({ status: 'complete', message: folder ? 'Folder added. No files were scanned.' : 'No folder added. Selection canceled or the folder is empty.' })
    } catch (error) { fail(error) }
  }

  const confirmRemoval = async () => {
    if (!removalTarget) return
    setOperation({ status: 'removing', message: 'Removing library configuration entry.' })
    try {
      const { removedId } = await libraryService.removeFolder(removalTarget.id)
      onChange((current) => ({ ...current, folders: current.folders.filter((folder) => folder.id !== removedId) }))
      setSelectedId(null)
      setRemovalTarget(null)
      setOperation({ status: 'complete', message: 'Folder removed from configuration. Files on disk were not deleted.' })
    } catch (error) { fail(error) }
  }

  const rescan = async () => {
    setOperation({ status: 'scanning', message: 'Mock scanning. No disk access is performed.' })
    try {
      const result = await libraryService.rescanLibrary(library)
      setOperation({ status: result.status, message: result.message })
    } catch (error) { fail(error) }
  }

  return {
    selectedId, setSelectedId, selectedFolder, removalTarget, operation, busy,
    addFolder, confirmRemoval, rescan,
    requestRemoval: () => { if (selectedFolder) setRemovalTarget(selectedFolder) },
    cancelRemoval: () => setRemovalTarget(null),
  }
}