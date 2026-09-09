import { useState } from 'react'
import { AudioSettings } from './AudioSettings.jsx'
import './settings.css'

const SECTIONS = ['General', 'Audio', 'Playback', 'MIDI', 'Library', 'Metadata', 'Search', 'Browser']

export const SettingsPanel = ({ isOpen, onClose, settings, onAudioSettingChange }) => {
  const [activeSection, setActiveSection] = useState(SECTIONS[0])

  return (
    <aside
      id="settings-panel"
      className="settings-panel"
      data-testid="settings-panel"
      aria-labelledby="settings-title"
      hidden={!isOpen}
    >
      <div className="settings-panel-header" data-testid="settings-panel-header">
        <h2 id="settings-title" className="settings-title-text" data-testid="settings-panel-title">Settings</h2>
        <button
          type="button"
          className="settings-close-button"
          data-testid="settings-close"
          title="Close Settings"
          aria-label="Close Settings"
          onMouseDown={(event) => {
            if (event.button === 0) {
              event.preventDefault()
              onClose()
            }
          }}
          onClick={(event) => { if (event.detail === 0) onClose() }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
      </div>
      <div className="settings-panel-body" data-testid="settings-panel-body">
        <nav className="settings-panel-nav" aria-label="Settings sections" data-testid="settings-section-navigation">
          {SECTIONS.map((section) => (
            <button
              key={section}
              type="button"
              className={'settings-section-button' + (activeSection === section ? ' is-active' : '')}
              data-testid={`settings-section-${section.toLowerCase()}`}
              aria-current={activeSection === section ? 'true' : undefined}
              aria-controls="settings-section-content"
              onMouseDown={(event) => { if (event.button === 0) setActiveSection(section) }}
              onClick={(event) => { if (event.detail === 0) setActiveSection(section) }}
            >
              {section}
            </button>
          ))}
        </nav>
        <section
          id="settings-section-content"
          className="settings-panel-content"
          data-testid="settings-section-content"
          aria-labelledby="settings-section-title"
          tabIndex={0}
        >
          <h3 id="settings-section-title" className="settings-section-title-text" data-testid="settings-active-section">{activeSection}</h3>
          {activeSection === 'Audio' ? (
            <AudioSettings audio={settings.audio} onChange={onAudioSettingChange} />
          ) : (
            <p className="settings-placeholder-text" data-testid="settings-section-placeholder">Settings for this section will be added in the next step.</p>
          )}
        </section>
      </div>
    </aside>
  )
}