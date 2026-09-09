export const AppHeader = ({
  folderInputRef, onOpenFolder, onFolderPick, folderIcon,
  settingsOpen, settingsButtonRef, onToggleSettings,
}) => (
  <div className="app-header" data-testid="app-header">
    <div className="app-logo" data-testid="app-header-logo"><span className="logo-text" data-testid="app-header-logo-text">Ander browser</span></div>
    <button
      className="button-open-folder"
      data-testid="app-header-open-folder"
      title="Open folder"
      onMouseDown={onOpenFolder}
    >
      {folderIcon}
    </button>
    <input
      ref={folderInputRef} type="file" webkitdirectory="" multiple
      data-testid="app-header-directory-input"
      style={{ display: 'none' }} onChange={onFolderPick}
    />
    <button
      ref={settingsButtonRef}
      type="button"
      className="button-settings"
      data-testid="app-header-settings"
      title="Settings"
      aria-label="Settings"
      aria-expanded={settingsOpen}
      aria-controls="settings-panel"
      onMouseDown={onToggleSettings}
      onClick={(event) => { if (event.detail === 0) onToggleSettings(event) }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.7 2h4.6l.6 2.4L17 5.6l2.4-.7 2.3 4-1.8 1.7v2.8l1.8 1.7-2.3 4-2.4-.7-2.1 1.2-.6 2.4H9.7l-.6-2.4L7 18.4l-2.4.7-2.3-4 1.8-1.7v-2.8L2.3 8.9l2.3-4 2.4.7 2.1-1.2Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  </div>
)