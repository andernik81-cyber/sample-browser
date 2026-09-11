import { chooseFolder, isNativeBackendAvailable, startScan } from '../bridge/juceBridge.js'

/** @typedef {{id: string, path: string, status: 'online'|'offline'}} LibraryFolder */
/** @typedef {{folders: LibraryFolder[], scanSubfolders: boolean, scanOnStartup: boolean}} LibrarySettings */
// Availability (online/offline) is separate from operation states (scanning/error).
// App owns configuration. This adapter has no second store or persistence.
// A future JUCE implementation supplies authoritative IDs/paths using these methods.
const getLibraryFolders = async (folders) => folders.map(({ id, path, status }) => ({ id, path, status }))

// Resolves a serializable independent root (absolute path from the JUCE native
// folder picker, or a browser fallback path), or null on cancellation/empty input.
const selectFolder = async () => {
  const path = await chooseFolder()
  if (!path) return null
  return { id: `library-${crypto.randomUUID()}`, path, status: 'online' }
}

// Stage 12: inside the native app the rescan request starts the real C++
// filesystem scanner. Results arrive later as scan* bridge events and are
// merged into the existing UI model; this call does not block.
const startNativeScan = async (library) => {
  const paths = library.folders.filter((folder) => folder.status !== 'offline').map((folder) => folder.path)
  const started = await startScan(paths, library.scanSubfolders)
  return {
    status: 'complete',
    mock: false,
    started,
    folderIds: library.folders.map((folder) => folder.id),
    message: started
      ? 'Native filesystem scan started. Folders and files will appear as they are found.'
      : 'Native backend did not start the scan.',
  }
}

export const libraryService = {
  selectFolder,
  getLibraryFolders,

  // Acknowledge configuration removal only. NEVER delete or modify disk data.
  removeFolder: async (id) => ({ removedId: id }),

  /** @param {LibrarySettings} library */
  rescanLibrary: async (library) => {
    if (isNativeBackendAvailable())
      return startNativeScan(library)

    const folders = await getLibraryFolders(library.folders)
    const onlineCount = folders.filter((folder) => folder.status === 'online').length
    const offlineCount = folders.filter((folder) => folder.status === 'offline').length
    return {
      status: 'complete',
      mock: true,
      recursive: library.scanSubfolders,
      folderIds: folders.map((folder) => folder.id),
      onlineCount,
      offlineCount,
      message: `Mock rescan complete: ${onlineCount} online, ${offlineCount} offline. ${library.scanSubfolders ? 'All subfolders included.' : 'Top-level folders only.'} No disk scanning performed.`,
    }
  },
}