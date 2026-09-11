import { useEffect, useRef } from 'react'
import { useLibraryActions } from './useLibraryActions.js'
import './library-settings.css'

const TOGGLES = [
  { key: 'scanSubfolders', id: 'scan-subfolders', label: 'Scan Subfolders', description: 'Scan all subfolders inside each library location.' },
  { key: 'scanOnStartup', id: 'scan-on-startup', label: 'Scan on Startup', description: 'Check library folders when the application starts.' },
]

const LibraryButton = ({ testId, onAction, disabled, autoFocus, children }) => (
  <button
    type="button" className="library-action-button" data-testid={testId} disabled={disabled} autoFocus={autoFocus}
    onMouseDown={(event) => {
      if (event.button === 0) { event.preventDefault(); event.currentTarget.focus(); onAction() }
    }}
    onClick={(event) => { if (event.detail === 0) onAction() }}
  >{children}</button>
)

export const LibrarySettings = ({ library, onChange }) => {
  const actions = useLibraryActions(library, onChange)
  const listRef = useRef(null)
  const locked = actions.busy || Boolean(actions.removalTarget)
  useEffect(() => {
    listRef.current?.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [actions.selectedId])

  return (
    <div className="library-settings" data-testid="library-settings">
      <div className="library-folders-field" data-testid="library-folders-field">
        <div id="library-folders-label" className="library-field-label" data-testid="library-folders-label">Sample Folders</div>
        <div ref={listRef} className="library-folder-list" role="group" aria-labelledby="library-folders-label" data-testid="library-folder-list">
          {library.folders.length === 0 && <p className="library-secondary-text" data-testid="library-folders-empty">No sample folders configured.</p>}
          {library.folders.map((folder) => (
            <button
              key={folder.id} type="button" className="library-folder-row" data-testid={`library-folder-${folder.id}`}
              title={folder.path} aria-pressed={actions.selectedId === folder.id} disabled={locked}
              onMouseDown={(event) => { if (event.button === 0) actions.setSelectedId(folder.id) }}
              onClick={(event) => { if (event.detail === 0) actions.setSelectedId(folder.id) }}
            >
              <span className="library-folder-path" data-testid={`library-path-${folder.id}`}>{folder.path}</span>
              <span className="library-folder-status" data-testid={`library-status-${folder.id}`}>{folder.status === 'offline' ? 'Offline' : 'Online'}</span>
            </button>
          ))}
        </div>
        <div className="library-action-group">
          <LibraryButton testId="library-add-folder" onAction={actions.addFolder} disabled={locked}>Add Folder</LibraryButton>
          <LibraryButton testId="library-remove-folder" onAction={actions.requestRemoval} disabled={locked || !actions.selectedFolder}>Remove Folder</LibraryButton>
        </div>
      </div>

      {actions.removalTarget && (
        <div className="library-removal-confirmation" role="alertdialog" aria-modal="false" aria-labelledby="library-removal-title" aria-describedby="library-removal-description" data-testid="library-removal-confirmation">
          <div id="library-removal-title" className="library-field-label" data-testid="library-removal-title">Remove Folder?</div>
          <p className="library-confirmation-path" data-testid="library-removal-path">{actions.removalTarget.path}</p>
          <p id="library-removal-description" className="library-secondary-text" data-testid="library-removal-description">Only the library configuration entry will be removed. Files and folders on disk will not be deleted.</p>
          <LibraryButton testId="library-cancel-remove" onAction={actions.cancelRemoval} disabled={actions.busy} autoFocus>Cancel</LibraryButton>
          <LibraryButton testId="library-confirm-remove" onAction={actions.confirmRemoval} disabled={actions.busy}>Remove Folder</LibraryButton>
        </div>
      )}

      {TOGGLES.map(({ key, id, label, description }) => (
        <div className="library-toggle-field" key={key} data-testid={`library-${id}-field`}>
          <label className="library-toggle-label" htmlFor={`library-${id}`} data-testid={`library-${id}-label`}>
            <span>{label}</span>
            <input
              id={`library-${id}`} className="library-toggle-input" data-testid={`library-${id}`} type="checkbox" role="switch"
              checked={library[key]} disabled={locked} aria-describedby={`library-${id}-description`}
              onChange={(event) => {
                const checked = event.target.checked
                onChange((current) => ({ ...current, [key]: checked }))
              }}
            />
          </label>
          <p id={`library-${id}-description`} className="library-secondary-text" data-testid={`library-${id}-description`}>{description}</p>
        </div>
      ))}
      <LibraryButton testId="library-rescan" onAction={actions.rescan} disabled={locked}>Rescan Library</LibraryButton>
      {actions.operation.message && (
        <p className="library-operation-message" data-testid="library-operation-status" data-status={actions.operation.status} role={actions.operation.status === 'error' ? 'alert' : 'status'}>{actions.operation.message}</p>
      )}
    </div>
  )
}