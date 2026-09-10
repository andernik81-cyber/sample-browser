import { selectBrowserFolder } from '../library/browserFolderPicker.js'

// Thin, synchronous-with-native adapter between the React UI and the JUCE 9.0.2
// WebView2 backend, using JUCE's stock `window.__JUCE__` interop (no external RPC
// framework, no @juce-framework/webview npm dependency).
//
// Inside the JUCE WebView2 the C++ side registers a single native function
// `chooseFolder`. The JS side speaks the same low-level protocol that JUCE's own
// `getNativeFunction()` helper uses:
//   window.__JUCE__.backend.emitEvent('__juce__invoke', { name, params, resultId })
//   window.__JUCE__.backend.addEventListener('__juce__complete', ({ promiseId, result }) => ...)
//
// When running in a plain browser (`npm run dev`, no `window.__JUCE__`), the
// existing `webkitdirectory` fallback is used instead so development keeps working.

let lastNativeListenerWired = false
const pendingResults = new Map()
let nextResultId = 0

export const isNativeBackendAvailable = () =>
  typeof window !== 'undefined' &&
  Boolean(window.__JUCE__) &&
  typeof window.__JUCE__.backend?.emitEvent === 'function' &&
  typeof window.__JUCE__.backend?.addEventListener === 'function'

const wireNativeCompleteListener = () => {
  if (lastNativeListenerWired) return
  lastNativeListenerWired = true
  window.__JUCE__.backend.addEventListener('__juce__complete', (payload) => {
    const { promiseId, result } = payload || {}
    const resolve = pendingResults.get(promiseId)
    if (resolve) {
      pendingResults.delete(promiseId)
      resolve(result)
    }
  })
}

const callNativeFunction = async (name, params = []) => {
  wireNativeCompleteListener()
  const resultId = nextResultId++
  const resultPromise = new Promise((resolve) => { pendingResults.set(resultId, resolve) })
  window.__JUCE__.backend.emitEvent('__juce__invoke', { name, params, resultId })
  return resultPromise
}

// Returns the absolute filesystem path selected by the JUCE native folder picker,
// or null when the user cancelled (or when running a plain browser and no folder
// was picked there). Never returns a complex object.
export const chooseFolder = async () => {
  if (isNativeBackendAvailable())
    return callNativeFunction('chooseFolder', []).then((path) => typeof path === 'string' && path.length > 0 ? path : null)

  const folder = await selectBrowserFolder()
  return folder && typeof folder.path === 'string' && folder.path.length > 0 ? folder.path : null
}