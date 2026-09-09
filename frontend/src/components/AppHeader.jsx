export const AppHeader = ({ folderInputRef, onOpenFolder, onFolderPick, folderIcon }) => (
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
  </div>
)